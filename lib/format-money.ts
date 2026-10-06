export function formatMoney(currency: string, amount: number, decimals = 2) {
  return `${currency} ${amount.toFixed(decimals)}`;
}

export function formatPaymentAmountCell(payment: {
  amount: number;
  baseCurrencyCode?: string;
  originalAmount?: number;
  originalCurrencyCode?: string;
  exchangeRateToBase?: number;
}) {
  const base = payment.baseCurrencyCode ?? "USD";
  const primary = formatMoney(base, payment.amount);

  if (
    payment.originalCurrencyCode &&
    payment.originalAmount != null &&
    payment.originalCurrencyCode !== base
  ) {
    const rate =
      payment.exchangeRateToBase != null
        ? ` · 1 ${payment.originalCurrencyCode} = ${payment.exchangeRateToBase} ${base}`
        : "";

    return {
      primary,
      secondary: `${formatMoney(payment.originalCurrencyCode, payment.originalAmount)} received${rate}`,
    };
  }

  return { primary, secondary: null as string | null };
}
