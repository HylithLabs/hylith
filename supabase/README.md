# Supabase database setup

Project ref: `kfqtfbvatlqspmvugpwm`

## Connection types (Dashboard → Connect)

| Type | Host | User | IPv4 on Windows |
|------|------|------|-----------------|
| **Session pooler** (use this) | `aws-1-ap-northeast-2.pooler.supabase.com` | `postgres.kfqtfbvatlqspmvugpwm` | Yes |
| Direct | `db.kfqtfbvatlqspmvugpwm.supabase.co` | `postgres` | Often no (`ENOTFOUND`) |

Direct connection string from the dashboard:

```text
postgresql://postgres:[PASSWORD]@db.kfqtfbvatlqspmvugpwm.supabase.co:5432/postgres
```

Session pooler (copy from **Connect → Session pooler**):

```text
postgresql://postgres.kfqtfbvatlqspmvugpwm:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

Put the working URI in `.env` as `SUPABASE_DB_URL=...` then run `npm run db:migrate`.

## Apply schema

### SQL Editor (no CLI)

1. [SQL Editor](https://supabase.com/dashboard/project/kfqtfbvatlqspmvugpwm/sql/new)
2. Run each file in `supabase/migrations/` in order (sorted by filename).

### CLI

```bash
npm run db:migrate
```

## App environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://kfqtfbvatlqspmvugpwm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
```

Supabase is required for data and auth (`clients` table).

## Optional: Agent Skills

```bash
npx skills add supabase/agent-skills
```
