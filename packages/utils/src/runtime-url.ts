type RuntimeUrlOptions = {
  fallbackOrigin?: string;
};

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}

function resolveVercelOrigin() {
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (!vercelUrl) return undefined;

  return normalizeOrigin(
    vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`,
  );
}

function resolveBrowserOrigin() {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

function firstOrigin(...origins: Array<string | undefined>) {
  const origin = origins.find((value) => value?.trim());
  return origin ? normalizeOrigin(origin) : undefined;
}

export function resolveAppUrl({ fallbackOrigin }: RuntimeUrlOptions = {}) {
  return (
    firstOrigin(
      process.env.NEXT_PUBLIC_APP_URL ??
        process.env.WEB_APP_URL ??
        resolveVercelOrigin() ??
        resolveBrowserOrigin() ??
        fallbackOrigin ??
        "http://localhost:3000",
    ) ?? "http://localhost:3000"
  );
}

export function resolveApiUrl({ fallbackOrigin }: RuntimeUrlOptions = {}) {
  return (
    firstOrigin(
      process.env.NEXT_PUBLIC_API_URL ??
        process.env.API_ORIGIN ??
        process.env.BETTER_AUTH_URL ??
        resolveBrowserOrigin() ??
        resolveVercelOrigin() ??
        fallbackOrigin ??
        "http://localhost:3902",
    ) ?? "http://localhost:3902"
  );
}
