const port = Number(process.env.E2E_PAYMENT_PORT ?? "3903");
const webAppUrl = process.env.WEB_APP_URL ?? "http://localhost:3901";

Bun.serve({
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    if (
      request.method === "POST" &&
      url.pathname === "/transaction/initialize"
    ) {
      const body = (await request.json()) as { reference?: unknown };
      const reference =
        typeof body.reference === "string"
          ? body.reference
          : "missing-reference";

      return Response.json({
        data: {
          access_code: "e2e-access-code",
          authorization_url: `${webAppUrl}/donations/complete?reference=${reference}`,
          reference,
        },
        message: "E2E checkout initialized.",
        status: true,
      });
    }

    if (request.method === "POST" && url.pathname === "/checkouts") {
      const body = (await request.json()) as {
        data?: {
          attributes?: {
            checkout_data?: {
              custom?: {
                donation_reference?: unknown;
              };
            };
          };
        };
      };
      const reference =
        typeof body.data?.attributes?.checkout_data?.custom
          ?.donation_reference === "string"
          ? body.data.attributes.checkout_data.custom.donation_reference
          : "missing-reference";

      return Response.json({
        data: {
          attributes: {
            url: `${webAppUrl}/wallet?provider=lemon_squeezy&reference=${reference}`,
          },
          id: `checkout_${reference}`,
          type: "checkouts",
        },
      });
    }

    if (
      request.method === "GET" &&
      url.pathname.startsWith("/transaction/verify/")
    ) {
      const reference = url.pathname.split("/").at(-1) ?? "missing-reference";

      return Response.json({
        data: {
          gateway_response: "Successful",
          reference,
          status: "success",
        },
        message: "E2E checkout verified.",
        status: true,
      });
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
  port,
});

console.log(`E2E payment provider listening on http://localhost:${port}`);
