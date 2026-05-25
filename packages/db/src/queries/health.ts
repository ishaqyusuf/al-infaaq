import { readDatabaseRuntimeConfig } from "../runtime";

export function getDatabaseHealth() {
  const config = readDatabaseRuntimeConfig();

  return {
    provider: config.provider,
    status: config.status,
  };
}
