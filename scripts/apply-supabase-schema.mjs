/**
 * Applies all SQL files in supabase/migrations/
 *
 * Recommended on Windows / IPv4: Session pooler URI (Dashboard → Connect → Session pooler)
 *   SUPABASE_DB_URL=postgresql://postgres.kfqtfbvatlqspmvugpwm:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
 *
 * Direct connection (IPv6 only — often fails on Windows with ENOTFOUND):
 *   SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.kfqtfbvatlqspmvugpwm.supabase.co:5432/postgres
 */
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DASHBOARD_CONNECT =
  "https://supabase.com/dashboard/project/kfqtfbvatlqspmvugpwm?showConnect=true";

function loadEnvFile() {
  try {
    const raw = readFileSync(resolve(__dirname, "../.env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* optional */
  }
}

function projectRefFromSupabaseUrl(base) {
  return new URL(base).hostname.split(".")[0];
}

function isRetryableError(err) {
  const msg = String(err?.message ?? err).toLowerCase();
  return (
    msg.includes("tenant") ||
    msg.includes("user not found") ||
    msg.includes("enotfound") ||
    msg.includes("getaddrinfo")
  );
}

/** Safe to ignore when re-running migrations on an existing database. */
function isBenignMigrationError(err) {
  const msg = String(err?.message ?? err).toLowerCase();
  const code = err?.code;
  return (
    code === "42710" || // duplicate_object
    code === "42P07" || // duplicate_table
    code === "42701" || // duplicate_column
    msg.includes("already member of publication") ||
    msg.includes("already exists")
  );
}

/** Direct host uses user `postgres`; pooler uses `postgres.[project-ref]`. */
function postgresUserForHost(host, ref) {
  if (host.startsWith("db.") && host.includes(".supabase.co")) {
    return "postgres";
  }
  return `postgres.${ref}`;
}

function buildUrl(host, port, ref, password) {
  const user = postgresUserForHost(host, ref);
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
}

function buildConnectionCandidates(ref, password, region, explicitHost, port) {
  const candidates = [];
  const seen = new Set();

  function add(url) {
    if (!seen.has(url)) {
      seen.add(url);
      candidates.push(url);
    }
  }

  if (explicitHost) {
    add(buildUrl(explicitHost, port, ref, password));
  }

  if (region) {
    add(buildUrl(`aws-1-${region}.pooler.supabase.com`, port, ref, password));
    add(buildUrl(`aws-0-${region}.pooler.supabase.com`, port, ref, password));
  }

  add(buildUrl(`db.${ref}.supabase.co`, "5432", ref, password));

  return candidates;
}

function getConnectionCandidates() {
  const explicitUrl =
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (explicitUrl) return [explicitUrl];

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const password =
    process.env.SUPABASE_DB_PASSWORD?.trim() ||
    process.env.POSTGRES_PASSWORD?.trim();

  if (!base || !password) {
    throw new Error(
      [
        "Missing database credentials.",
        "",
        "On IPv4 (most Windows networks), use Session pooler from Dashboard → Connect:",
        "  SUPABASE_DB_URL=postgresql://postgres.kfqtfbvatlqspmvugpwm:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres",
        "",
        "Direct connection (IPv6 only, from Dashboard → Connection string):",
        "  SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.kfqtfbvatlqspmvugpwm.supabase.co:5432/postgres",
        "",
        DASHBOARD_CONNECT,
      ].join("\n"),
    );
  }

  const ref = projectRefFromSupabaseUrl(base);
  const region = process.env.SUPABASE_DB_REGION?.trim();
  const explicitHost = process.env.SUPABASE_DB_HOST?.trim();
  const port = process.env.SUPABASE_DB_PORT?.trim() || "5432";

  const candidates = buildConnectionCandidates(
    ref,
    password,
    region,
    explicitHost,
    port,
  );

  if (process.env.SUPABASE_DB_USE_DIRECT === "true") {
    const direct = buildUrl(`db.${ref}.supabase.co`, "5432", ref, password);
    return [direct, ...candidates.filter((c) => c !== direct)];
  }

  return candidates;
}

async function connectAndMigrate(connectionString) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

function loadMigrationsSql() {
  const dir = resolve(__dirname, "../supabase/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  return files.map((f) => ({
    name: f,
    sql: readFileSync(join(dir, f), "utf8"),
  }));
}

async function main() {
  loadEnvFile();
  const migrations = loadMigrationsSql();
  const candidates = getConnectionCandidates();
  let lastError;

  for (const connectionString of candidates) {
    const host = connectionString.match(/@([^:/]+)/)?.[1] ?? "database";
    try {
      console.log(`Connecting via ${host}...`);
      const client = await connectAndMigrate(connectionString);
      console.log("Connected. Applying migrations...");
      for (const migration of migrations) {
        console.log(`  → ${migration.name}`);
        try {
          await client.query(migration.sql);
        } catch (err) {
          if (isBenignMigrationError(err)) {
            console.warn(`    skipped (already applied): ${err.message}`);
            continue;
          }
          throw err;
        }
      }
      await client.end();
      console.log("Done. All migrations applied.");
      if (candidates.length > 1) {
        const user = connectionString.match(/\/\/([^:]+):/)?.[1] ?? "postgres";
        console.log(
          `\nTip: save working connection in .env:\nSUPABASE_DB_URL=${connectionString.replace(/:[^:@]+@/, ":[YOUR-PASSWORD]@")}`,
        );
        if (host.includes("pooler")) {
          console.log(`# or: SUPABASE_DB_HOST=${host}`);
        }
      }
      return;
    } catch (err) {
      lastError = err;
      const idx = candidates.indexOf(connectionString);
      const hasMore = idx < candidates.length - 1;
      if (hasMore && isRetryableError(err)) {
        console.warn(`  Failed (${err.message}). Trying next host...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

main().catch((err) => {
  console.error(err.message || err);
  console.error(
    [
      "",
      "IPv4 / Windows: use Session pooler (not db.*.supabase.co direct).",
      DASHBOARD_CONNECT,
    ].join("\n"),
  );
  process.exit(1);
});
