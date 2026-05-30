import { Badge } from "@al-infaaq/ui/badge";

export type TrusteeReviewRow = {
  createdAt: Date;
  decidedAt: Date | null;
  foundation: {
    contactEmail: string | null;
    description: string | null;
    documentUrl: string | null;
    name: string;
    registrationNumber: string | null;
    websiteUrl: string | null;
  };
  id: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  trustee: {
    email: string | null;
  } | null;
};

const statusClasses = {
  APPROVED: "bg-emerald-100 text-emerald-900",
  PENDING: "bg-amber-100 text-amber-900",
  REJECTED: "bg-red-100 text-red-900",
};

export const trusteeReviewColumns = [
  "Foundation",
  "Status",
  "Evidence",
  "Decision",
  "Actions",
] as const;

export function TrusteeReviewStatusBadge({
  status,
}: {
  status: TrusteeReviewRow["status"];
}) {
  return (
    <Badge className={statusClasses[status]}>
      {status.toLowerCase().replaceAll("_", " ")}
    </Badge>
  );
}
