import { Badge } from "@al-infaaq/ui/badge";

export type AdminFoundationRow = {
  id: string;
  name: string;
  status: "APPROVED" | "DRAFT" | "PENDING_REVIEW" | "REJECTED" | "SUSPENDED";
  user: {
    email: string | null;
  };
};

const statusClasses = {
  APPROVED: "bg-emerald-100 text-emerald-900",
  DRAFT: "bg-stone-100 dark:bg-stone-900 text-stone-900",
  PENDING_REVIEW: "bg-amber-100 text-amber-900",
  REJECTED: "bg-rose-100 text-rose-900",
  SUSPENDED: "bg-rose-100 text-rose-900",
};

export const adminFoundationColumns = [
  "Foundation",
  "Owner",
  "Status",
  "Actions",
] as const;

export function AdminFoundationStatusBadge({
  status,
}: {
  status: AdminFoundationRow["status"];
}) {
  return (
    <Badge className={statusClasses[status]}>
      {status.toLowerCase().replaceAll("_", " ")}
    </Badge>
  );
}
