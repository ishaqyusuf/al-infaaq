export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export function nairaToKobo(amount: number) {
  return Math.round(amount * 100);
}
