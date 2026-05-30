import { Badge } from "@al-infaaq/ui/badge";

export type AdminRequestRow = {
  foundation: { name: string };
  id: string;
  raisedKobo: number;
  status: "ARCHIVED" | "DRAFT" | "FUNDED" | "PUBLISHED";
  targetKobo: number;
  title: string;
};

const statusClasses = {
  ARCHIVED: "bg-sky-100 text-sky-900",
  DRAFT: "bg-stone-100 dark:bg-stone-900 text-stone-900",
  FUNDED: "bg-emerald-100 text-emerald-900",
  PUBLISHED: "bg-amber-100 text-amber-900",
};

export const adminRequestColumns = [
  "Request",
  "Foundation",
  "Status",
  "Progress",
] as const;

export function AdminRequestStatusBadge({
  status,
}: {
  status: AdminRequestRow["status"];
}) {
  return (
    <Badge className={statusClasses[status]}>{status.toLowerCase()}</Badge>
  );
}
