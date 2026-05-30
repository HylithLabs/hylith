/** PostgREST / Postgres errors when Supabase env is set but migrations were not applied. */
export function isSupabaseSchemaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "PGRST205" || code === "42P01";
}
