const priceFormatter = new Intl.NumberFormat("fr-SN", {
  style: "currency",
  currency: "XOF",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-SN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-SN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatReference(prefix: string, number: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(number).padStart(4, "0")}`;
}
