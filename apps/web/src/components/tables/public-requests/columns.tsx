import { Badge } from "@al-infaaq/ui/badge";

export type PublicRequestRow = {
  foundation: { name: string };
  id: string;
  raisedKobo: number;
  status: "ARCHIVED" | "DRAFT" | "FUNDED" | "PUBLISHED";
  story: string;
  targetKobo: number;
  title: string;
};

export const publicRequestColumns = [
  "Request",
  "Foundation",
  "Progress",
  "Status",
] as const;

export function PublicRequestStatusBadge({
  status,
}: {
  status: PublicRequestRow["status"];
}) {
  if (status === "FUNDED") {
    return <Badge className="bg-stone-950 text-white">funded</Badge>;
  }

  if (status === "PUBLISHED") {
    return (
      <Badge className="bg-emerald-100 text-emerald-900">
        approved foundation
      </Badge>
    );
  }

  return (
    <Badge className="bg-stone-100 dark:bg-stone-900 text-stone-900">
      {status.toLowerCase()}
    </Badge>
  );
}
