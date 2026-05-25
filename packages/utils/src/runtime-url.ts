export function resolveAppUrl({
  fallbackOrigin,
}: {
  fallbackOrigin?: string;
} = {}) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.WEB_APP_URL ??
    fallbackOrigin ??
    "http://localhost:3000"
  );
}
