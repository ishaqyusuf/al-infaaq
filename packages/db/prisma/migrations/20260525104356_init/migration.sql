-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SPENDER', 'FOUNDATION', 'TRUSTEE', 'ADMIN');

-- CreateEnum
CREATE TYPE "FoundationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DonationRequestStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FUNDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK', 'LEMON_SQUEEZY');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpenderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyGoalKobo" INTEGER NOT NULL DEFAULT 0,
    "showSpendingHistory" BOOLEAN NOT NULL DEFAULT false,
    "reminderChannel" "ReminderChannel" NOT NULL DEFAULT 'EMAIL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpenderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foundation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "FoundationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Foundation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrusteeReview" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "trusteeId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "TrusteeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationRequest" (
    "id" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "targetKobo" INTEGER NOT NULL,
    "raisedKobo" INTEGER NOT NULL DEFAULT 0,
    "status" "DonationRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "spenderId" TEXT NOT NULL,
    "foundationId" TEXT NOT NULL,
    "donationRequestId" TEXT,
    "provider" "PaymentProvider" NOT NULL,
    "providerReference" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "anonymousToFoundation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendingGoal" (
    "id" TEXT NOT NULL,
    "spenderProfileId" TEXT NOT NULL,
    "foundationId" TEXT,
    "monthlyAmountKobo" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpendingGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "ReminderChannel" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundraisingBanner" (
    "id" TEXT NOT NULL,
    "donationRequestId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "qrCodeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundraisingBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SpenderProfile_userId_key" ON "SpenderProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Foundation_userId_key" ON "Foundation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Foundation_slug_key" ON "Foundation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_providerReference_key" ON "Donation"("providerReference");

-- AddForeignKey
ALTER TABLE "SpenderProfile" ADD CONSTRAINT "SpenderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foundation" ADD CONSTRAINT "Foundation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrusteeReview" ADD CONSTRAINT "TrusteeReview_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrusteeReview" ADD CONSTRAINT "TrusteeReview_trusteeId_fkey" FOREIGN KEY ("trusteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationRequest" ADD CONSTRAINT "DonationRequest_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_spenderId_fkey" FOREIGN KEY ("spenderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donationRequestId_fkey" FOREIGN KEY ("donationRequestId") REFERENCES "DonationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendingGoal" ADD CONSTRAINT "SpendingGoal_spenderProfileId_fkey" FOREIGN KEY ("spenderProfileId") REFERENCES "SpenderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundraisingBanner" ADD CONSTRAINT "FundraisingBanner_donationRequestId_fkey" FOREIGN KEY ("donationRequestId") REFERENCES "DonationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
