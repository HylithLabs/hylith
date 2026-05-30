-- Hylith portal schema (Mongo → Postgres)
-- Apply via Supabase MCP `apply_migration` or Supabase SQL editor.

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- clients (NextAuth user mirror)
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id text primary key,
  email text not null unique,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_email_idx on public.clients (email);

-- ---------------------------------------------------------------------------
-- settings (availability; singleton row id = 'default')
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id text primary key default 'default',
  available_slots jsonb not null default '[]'::jsonb,
  slot_duration_minutes int not null default 30 check (slot_duration_minutes between 15 and 120),
  timezone text not null default 'Asia/Dhaka',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.settings (id)
values ('default')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- assignments (meeting / booking requests)
-- ---------------------------------------------------------------------------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.clients (id) on delete cascade,
  email text not null,
  name text not null,
  start_at timestamptz not null,
  timezone text not null,
  duration_minutes int not null default 30,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'closed')),
  project_summary text not null,
  company text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assignments_client_id_idx on public.assignments (client_id);
create index if not exists assignments_start_at_status_idx on public.assignments (start_at, status);
create index if not exists assignments_status_created_idx on public.assignments (status, created_at desc);

-- ---------------------------------------------------------------------------
-- buses / routes (reserved for future fleet modules; minimal scaffold)
-- ---------------------------------------------------------------------------
create table if not exists public.buses (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  capacity int,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- logs (audit trail)
-- ---------------------------------------------------------------------------
create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text,
  action text not null,
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists logs_entity_idx on public.logs (entity_type, entity_id);
create index if not exists logs_created_at_idx on public.logs (created_at desc);

-- ---------------------------------------------------------------------------
-- notification_recipients + email_logs
-- ---------------------------------------------------------------------------
create table if not exists public.notification_recipients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  subject text not null,
  success boolean not null,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_logs_created_at_idx on public.email_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

drop trigger if exists assignments_updated_at on public.assignments;
create trigger assignments_updated_at
  before update on public.assignments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Realtime publication
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.clients;
alter publication supabase_realtime add table public.settings;
alter publication supabase_realtime add table public.assignments;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- JWT claims: sub (user id), role ('admin' | 'user')
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.settings enable row level security;
alter table public.assignments enable row level security;
alter table public.buses enable row level security;
alter table public.routes enable row level security;
alter table public.logs enable row level security;
alter table public.notification_recipients enable row level security;
alter table public.email_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'role') = 'admin', false);
$$;

create or replace function public.jwt_sub()
returns text
language sql
stable
as $$
  select auth.jwt() ->> 'sub';
$$;

-- clients
create policy "clients_select_own_or_admin"
  on public.clients for select
  using (public.is_admin() or id = public.jwt_sub());

create policy "clients_admin_all"
  on public.clients for all
  using (public.is_admin())
  with check (public.is_admin());

-- settings: readable by authenticated users; writable by admin
create policy "settings_select_authenticated"
  on public.settings for select
  using (public.jwt_sub() is not null);

create policy "settings_admin_write"
  on public.settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- assignments
create policy "assignments_select_own_or_admin"
  on public.assignments for select
  using (public.is_admin() or client_id = public.jwt_sub());

create policy "assignments_insert_own"
  on public.assignments for insert
  with check (client_id = public.jwt_sub());

create policy "assignments_update_own_pending"
  on public.assignments for update
  using (client_id = public.jwt_sub() and status = 'pending')
  with check (client_id = public.jwt_sub());

create policy "assignments_admin_all"
  on public.assignments for all
  using (public.is_admin())
  with check (public.is_admin());

-- buses / routes: admin only
create policy "buses_admin"
  on public.buses for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "routes_admin"
  on public.routes for all
  using (public.is_admin())
  with check (public.is_admin());

-- logs: admin read; service inserts via service role
create policy "logs_admin_select"
  on public.logs for select
  using (public.is_admin());

-- notification_recipients + email_logs: admin only
create policy "notification_recipients_admin"
  on public.notification_recipients for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "email_logs_admin_select"
  on public.email_logs for select
  using (public.is_admin());
