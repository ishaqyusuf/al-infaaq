import { TableGrid, TableShell } from "../core/table-shell";
import { TrusteeReviewActionMenu } from "./action-menu";
import {
  type TrusteeReviewRow,
  TrusteeReviewStatusBadge,
  trusteeReviewColumns,
} from "./columns";
import { TrusteeReviewsEmptyState } from "./empty-states";
import { TrusteeReviewsTableHeader } from "./table-header";

export function TrusteeReviewsDataTable({
  reviews,
}: {
  reviews: TrusteeReviewRow[];
}) {
  return (
    <TableShell>
      <TrusteeReviewsTableHeader reviews={reviews} />
      {reviews.length === 0 ? (
        <TrusteeReviewsEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <TableGrid className="grid-cols-[minmax(240px,1.2fr)_120px_minmax(260px,1.4fr)_180px_260px]">
            {trusteeReviewColumns.map((column) => (
              <div
                className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
                key={column}
              >
                {column}
              </div>
            ))}
            {reviews.map((review) => (
              <TrusteeReviewTableRow key={review.id} review={review} />
            ))}
          </TableGrid>
        </div>
      )}
    </TableShell>
  );
}

function TrusteeReviewTableRow({ review }: { review: TrusteeReviewRow }) {
  return (
    <>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <p className="font-medium text-stone-950 dark:text-stone-50">
          {review.foundation.name}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
          {review.foundation.description ?? "No description provided."}
        </p>
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <TrusteeReviewStatusBadge status={review.status} />
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-700 dark:text-stone-300">
        <dl className="grid gap-2">
          <EvidenceItem
            label="Contact"
            value={review.foundation.contactEmail}
          />
          <EvidenceItem
            label="Registration"
            value={review.foundation.registrationNumber}
          />
          <EvidenceItem label="Website" value={review.foundation.websiteUrl} />
          <EvidenceItem
            label="Document"
            value={review.foundation.documentUrl}
          />
        </dl>
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
        {review.decidedAt ? review.decidedAt.toLocaleDateString() : "Pending"}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <TrusteeReviewActionMenu review={review} />
      </div>
    </>
  );
}

function EvidenceItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-stone-500 dark:text-stone-500">
        {label}
      </dt>
      <dd className="break-words">{value ?? "Not provided"}</dd>
    </div>
  );
}
