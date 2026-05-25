import { prisma } from "@al-infaaq/db";

export async function markDonationSucceeded(providerReference: string) {
  return await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
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

    const updatedDonation = await tx.donation.update({
      data: {
        status: "SUCCEEDED",
      },
      where: {
        id: donation.id,
      },
    });

    if (donation.donationRequestId) {
      const request = await tx.donationRequest.update({
        data: {
          raisedKobo: {
            increment: donation.amountKobo,
          },
        },
        where: {
          id: donation.donationRequestId,
        },
      });

      if (
        request.status === "PUBLISHED" &&
        request.raisedKobo >= request.targetKobo
      ) {
        await tx.donationRequest.update({
          data: {
            status: "FUNDED",
          },
          where: {
            id: request.id,
          },
        });
      }
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

  if (!donation || donation.status !== "PENDING") {
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
  return await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: {
        providerReference,
      },
    });

    if (!donation || donation.status === "REFUNDED") {
      return donation;
    }

    const updatedDonation = await tx.donation.update({
      data: {
        status: "REFUNDED",
      },
      where: {
        id: donation.id,
      },
    });

    if (donation.status === "SUCCEEDED" && donation.donationRequestId) {
      const request = await tx.donationRequest.update({
        data: {
          raisedKobo: {
            decrement: donation.amountKobo,
          },
        },
        where: {
          id: donation.donationRequestId,
        },
      });

      if (
        request.status === "FUNDED" &&
        request.raisedKobo < request.targetKobo
      ) {
        await tx.donationRequest.update({
          data: {
            status: "PUBLISHED",
          },
          where: {
            id: request.id,
          },
        });
      }
    }

    return updatedDonation;
  });
}
