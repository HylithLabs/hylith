-- Auth fields on clients (replaces MongoDB users collection)
alter table public.clients
  add column if not exists password_hash text,
  add column if not exists google_id text unique;

create index if not exists clients_google_id_idx on public.clients (google_id)
  where google_id is not null;
