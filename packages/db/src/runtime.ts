export type DatabaseProvider = "postgres" | "supabase-postgres";
export type DatabaseStatus = "connected" | "unconfigured";

export type DatabaseRuntimeConfig = {
  connectionString: string | null;
  provider: DatabaseProvider;
  status: DatabaseStatus;
};

const defaultDatabaseProvider: DatabaseProvider = "postgres";

export function normalizeDatabaseProvider(
  provider: string | undefined,
): DatabaseProvider {
  if (provider === "supabase-postgres") {
    return provider;
  }

  return defaultDatabaseProvider;
}

export function readDatabaseRuntimeConfig(
  env: Record<string, string | undefined> = process.env,
): DatabaseRuntimeConfig {
  const connectionString = env.DATABASE_URL ?? null;

  return {
    connectionString,
    provider: normalizeDatabaseProvider(env.DATABASE_PROVIDER),
    status: connectionString ? "connected" : "unconfigured",
  };
}
