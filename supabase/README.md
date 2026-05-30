# Supabase database setup

## Apply schema (preferred: Supabase MCP)

1. Add a [personal access token](https://supabase.com/dashboard/account/tokens) to `.env.local` as `SUPABASE_ACCESS_TOKEN`.
2. Enable the Supabase MCP server in `.cursor/mcp.json` (see `mcp.json.example`).
3. In Cursor, ask the agent to run **apply_migration** with `supabase/migrations/20260530120000_initial_portal_schema.sql`.

## Apply schema (manual)

Run the SQL file in the Supabase Dashboard → SQL Editor.

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=   # Project Settings → API → JWT Secret (for realtime tokens)
```

When Supabase env vars are unset, the app continues to use MongoDB.
