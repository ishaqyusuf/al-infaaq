-- Rename foundation review status to match Trustee language.
ALTER TYPE "FoundationStatus" RENAME VALUE 'PENDING_VERIFICATION' TO 'PENDING_REVIEW';

-- Store the minimum profile metadata needed for Trustee review.
ALTER TABLE "Foundation"
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "documentUrl" TEXT,
ADD COLUMN "registrationNumber" TEXT,
ADD COLUMN "websiteUrl" TEXT;

-- A review can enter the queue before a Trustee claims or decides it.
ALTER TABLE "TrusteeReview" ALTER COLUMN "trusteeId" DROP NOT NULL;
