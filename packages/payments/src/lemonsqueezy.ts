type LemonSqueezyCheckoutInput = {
  variantId: string;
  email?: string;
  customPrice?: number;
  donationReference: string;
};

function getLemonSqueezyBaseUrl() {
  return (
    process.env.LEMON_SQUEEZY_BASE_URL ?? "https://api.lemonsqueezy.com/v1"
  );
}

function getLemonSqueezyApiKey() {
  const key = process.env.LEMONSQUEEZY_API_KEY;

  if (!key) {
    throw new Error("LEMONSQUEEZY_API_KEY is not configured.");
  }

  return key;
}

function getLemonSqueezyStoreId() {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not configured.");
  }

  return storeId;
}

export function assertLemonSqueezyConfigured() {
  getLemonSqueezyApiKey();
  getLemonSqueezyStoreId();
}

export async function createLemonSqueezyCheckout(
  input: LemonSqueezyCheckoutInput,
) {
  const response = await fetch(`${getLemonSqueezyBaseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${getLemonSqueezyApiKey()}`,
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          checkout_data: {
            custom: {
              donation_reference: input.donationReference,
            },
            email: input.email,
          },
          custom_price: input.customPrice,
        },
        relationships: {
          store: {
            data: {
              id: getLemonSqueezyStoreId(),
              type: "stores",
            },
          },
          variant: {
            data: {
              id: input.variantId,
              type: "variants",
            },
          },
        },
        type: "checkouts",
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to create Lemon Squeezy checkout.");
  }

  return response.json();
}
