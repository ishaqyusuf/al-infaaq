export type AdminAuditLogRow = {
  action: string;
  actor: { email: string | null } | null;
  createdAt: Date;
  id: string;
  target: string;
};

export const adminAuditLogColumns = [
  "Action",
  "Target",
  "Actor",
  "Created",
] as const;
