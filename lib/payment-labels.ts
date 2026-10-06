export type PaymentMethodValue =
  | "ecocash"
  | "onemoney"
  | "paynow"
  | "cash"
  | "bank_transfer"
  | "other";

export const ADMIN_RECORD_PAYMENT_METHODS: {
  value: PaymentMethodValue;
  label: string;
}[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "ecocash", label: "EcoCash" },
  { value: "onemoney", label: "OneMoney" },
  { value: "paynow", label: "Paynow" },
  { value: "other", label: "Other" },
];

export function formatPaymentMethodLabel(method?: string) {
  const found = ADMIN_RECORD_PAYMENT_METHODS.find((m) => m.value === method);
  if (found) return found.label;
  if (method === "paynow") return "Paynow (web)";
  return method ? method.replace(/_/g, " ") : "—";
}

export function formatPaymentChannelLabel(channel?: string) {
  if (channel === "student") return "Student portal";
  if (channel === "registration") return "Registration portal";
  if (channel === "admin") return "Registrar (manual)";
  return "—";
}
