const formatters = new Map<string, Intl.NumberFormat>();

/** Formate un montant en centimes : 0 → « 0,00 € ». */
export function formatPrice(cents: number, currency = "EUR"): string {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency });
    formatters.set(currency, formatter);
  }
  return formatter.format(cents / 100);
}
