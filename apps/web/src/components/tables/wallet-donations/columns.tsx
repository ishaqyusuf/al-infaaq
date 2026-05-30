import { Badge } from "@al-infaaq/ui/badge";

export type WalletDonationRow = {
  amountKobo: number;
  donationRequest: { title: string } | null;
  foundation: { name: string };
  id: string;
  status: "FAILED" | "PENDING" | "REFUNDED" | "SUCCEEDED";
};

const statusClasses = {
  FAILED: "bg-rose-100 text-rose-900",
  PENDING: "bg-amber-100 text-amber-900",
  REFUNDED: "bg-sky-100 text-sky-900",
  SUCCEEDED: "bg-emerald-100 text-emerald-900",
};

export const walletDonationColumns = [
  "Request",
  "Foundation",
  "Amount",
  "Status",
] as const;

export function WalletDonationStatusBadge({
  status,
}: {
  status: WalletDonationRow["status"];
}) {
  return (
    <Badge className={statusClasses[status]}>{status.toLowerCase()}</Badge>
  );
}
