import { Badge } from "@al-infaaq/ui/badge";

export type FoundationRequestRow = {
  id: string;
  raisedKobo: number;
  report: {
    bannerCount: number;
    progressPercent: number;
    remainingKobo: number;
    statusCounts: {
      FAILED: number;
      PENDING: number;
      REFUNDED: number;
      SUCCEEDED: number;
    };
  };
  status: "ARCHIVED" | "DRAFT" | "FUNDED" | "PUBLISHED";
  story: string;
  targetKobo: number;
  title: string;
};

const statusClasses = {
  ARCHIVED: "bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300",
  DRAFT: "bg-amber-100 text-amber-900",
  FUNDED: "bg-emerald-100 text-emerald-900",
  PUBLISHED: "bg-sky-100 text-sky-900",
};

export const foundationRequestColumns = [
  "Request",
  "Status",
  "Progress",
  "Completed gifts",
  "Banners",
  "Actions",
] as const;

export function FoundationRequestStatusBadge({
  status,
}: {
  status: FoundationRequestRow["status"];
}) {
  return (
    <Badge className={statusClasses[status]}>
      {status.toLowerCase().replaceAll("_", " ")}
    </Badge>
  );
}
