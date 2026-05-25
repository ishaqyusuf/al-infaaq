-- Rename the old religious-title role to the neutral Trustee role.
ALTER TYPE "UserRole" RENAME VALUE 'SHEIKH_VERIFIER' TO 'TRUSTEE';

-- Rename the foundation review domain language without dropping existing rows.
ALTER TABLE "VerificationRequest" RENAME TO "TrusteeReview";
ALTER TABLE "TrusteeReview" RENAME COLUMN "sheikhId" TO "trusteeId";
ALTER TABLE "TrusteeReview" RENAME CONSTRAINT "VerificationRequest_pkey" TO "TrusteeReview_pkey";
ALTER TABLE "TrusteeReview" RENAME CONSTRAINT "VerificationRequest_foundationId_fkey" TO "TrusteeReview_foundationId_fkey";
ALTER TABLE "TrusteeReview" RENAME CONSTRAINT "VerificationRequest_sheikhId_fkey" TO "TrusteeReview_trusteeId_fkey";
