-- The initial migration now creates PENDING_REVIEW directly.

-- Store the minimum profile metadata needed for Trustee review.
ALTER TABLE "Foundation"
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "documentUrl" TEXT,
ADD COLUMN "registrationNumber" TEXT,
ADD COLUMN "websiteUrl" TEXT;

-- A review can enter the queue before a Trustee claims or decides it.
ALTER TABLE "TrusteeReview" ALTER COLUMN "trusteeId" DROP NOT NULL;
