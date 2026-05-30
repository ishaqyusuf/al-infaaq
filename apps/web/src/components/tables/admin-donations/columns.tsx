import { Badge } from "@al-infaaq/ui/badge";

export type AdminDonationRow = {
  amountKobo: number;
  foundation: { name: string };
  id: string;
  provider: "LEMON_SQUEEZY" | "PAYSTACK";
  providerReference: string;
  status: "FAILED" | "PENDING" | "REFUNDED" | "SUCCEEDED";
  updatedAt?: Date;
  donationRequest?: { title: string } | null;
};

const statusClasses = {
  FAILED: "bg-rose-100 text-rose-900",
  PENDING: "bg-amber-100 text-amber-900",
  REFUNDED: "bg-sky-100 text-sky-900",
  SUCCEEDED: "bg-emerald-100 text-emerald-900",
};

export const adminDonationColumns = [
  "Amount",
  "Foundation",
  "Status",
  "Provider",
] as const;

export function AdminDonationStatusBadge({
  status,
}: {
  status: AdminDonationRow["status"];
}) {
  return (
    <Badge className={statusClasses[status]}>{status.toLowerCase()}</Badge>
  );
}
