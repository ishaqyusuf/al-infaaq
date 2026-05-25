export const DATABASE_SCHEMA_MODULES = [
  "users",
  "spender_profiles",
  "foundations",
  "verification_requests",
  "donation_requests",
  "donations",
  "spending_goals",
  "reminders",
  "fundraising_banners",
  "audit_logs",
] as const;

export type DatabaseSchemaModule = (typeof DATABASE_SCHEMA_MODULES)[number];
