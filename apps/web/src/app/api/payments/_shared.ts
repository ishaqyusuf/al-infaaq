import { prisma } from "@al-infaaq/db";

export async function markDonationSucceeded(providerReference: string) {
  const donation = await prisma.donation.findUnique({
    where: {
      providerReference,
    },
  });

  if (!donation) {
    return null;
  }

  if (donation.status === "SUCCEEDED") {
    return donation;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedDonation = await tx.donation.update({
      data: {
        status: "SUCCEEDED",
      },
      where: {
        id: donation.id,
      },
    });

    if (donation.donationRequestId) {
      await tx.donationRequest.update({
        data: {
          raisedKobo: {
            increment: donation.amountKobo,
          },
        },
        where: {
          id: donation.donationRequestId,
        },
      });
    }

    return updatedDonation;
  });
}

export async function markDonationFailed(providerReference: string) {
  const donation = await prisma.donation.findUnique({
    where: {
      providerReference,
    },
  });

  if (!donation || donation.status === "SUCCEEDED") {
    return donation;
  }

  return await prisma.donation.update({
    data: {
      status: "FAILED",
    },
    where: {
      id: donation.id,
    },
  });
}

export async function markDonationRefunded(providerReference: string) {
  const donation = await prisma.donation.findUnique({
    where: {
      providerReference,
    },
  });

  if (!donation || donation.status === "REFUNDED") {
    return donation;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedDonation = await tx.donation.update({
      data: {
        status: "REFUNDED",
      },
      where: {
        id: donation.id,
      },
    });

    if (donation.status === "SUCCEEDED" && donation.donationRequestId) {
      await tx.donationRequest.update({
        data: {
          raisedKobo: {
            decrement: donation.amountKobo,
          },
        },
        where: {
          id: donation.donationRequestId,
        },
      });
    }

    return updatedDonation;
  });
}
