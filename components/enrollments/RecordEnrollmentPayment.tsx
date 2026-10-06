"use client";

import { Loader2, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ADMIN_RECORD_PAYMENT_METHODS,
  type PaymentMethodValue,
} from "@/lib/payment-labels";
import { formatMoney } from "@/lib/format-money";
import api from "@/services/api";

type CurrencyOption = {
  _id: string;
  code: string;
  name: string;
  isBase: boolean;
  rateToBase: number;
  decimals: number;
};

export function RecordEnrollmentPayment({
  enrollmentId,
  amountDue,
  currency = "USD",
  onRecorded,
}: {
  enrollmentId: string;
  amountDue: number;
  currency?: string;
  onRecorded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState(currency);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [baseCode, setBaseCode] = useState(currency);
  const [method, setMethod] = useState<PaymentMethodValue>("cash");
  const [payerPhone, setPayerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCurrencies = useCallback(async () => {
    try {
      const res = await api.get<{ data: CurrencyOption[]; baseCurrencyCode: string }>(
        "/payments/currencies",
        { params: { activeOnly: true } },
      );
      setCurrencies(res.data.data ?? []);
      setBaseCode(res.data.baseCurrencyCode ?? currency);
      setPaymentCurrency((prev) => prev || res.data.baseCurrencyCode || currency);
    } catch {
      /* keep defaults */
    }
  }, [currency]);

  useEffect(() => {
    if (open) void loadCurrencies();
  }, [open, loadCurrencies]);

  useEffect(() => {
    if (open && !amount && amountDue > 0) {
      setAmount(amountDue.toFixed(2));
    }
  }, [open, amountDue, amount]);

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.code === paymentCurrency),
    [currencies, paymentCurrency],
  );

  const previewBase = useMemo(() => {
    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    if (!selectedCurrency) return null;
    if (selectedCurrency.isBase) return parsed;
    return Math.round(parsed * selectedCurrency.rateToBase * 100) / 100;
  }, [amount, selectedCurrency]);

  const reset = () => {
    setAmount("");
    setPaymentCurrency(baseCode);
    setMethod("cash");
    setPayerPhone("");
    setNotes("");
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    setBusy(true);
    try {
      await api.post("/payments/admin/record", {
        enrollmentId,
        amount: parsed,
        currencyCode: paymentCurrency,
        method,
        payerPhone: payerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      reset();
      onRecorded();
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || "Could not record payment.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2.5 text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/10"
      >
        <PlusCircle size={18} />
        Record payment from student
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mb-4 space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-800">Record payment</p>
          <p className="text-xs text-slate-600">
            For cash, bank, or mobile money received outside Paynow.
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          onClick={reset}
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Currency received</span>
          <select
            value={paymentCurrency}
            onChange={(e) => setPaymentCurrency(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            {currencies.length === 0 ? (
              <option value={paymentCurrency}>{paymentCurrency}</option>
            ) : (
              currencies.map((c) => (
                <option key={c._id} value={c.code}>
                  {c.code} — {c.name}
                  {c.isBase ? " (base)" : ""}
                </option>
              ))
            )}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Amount ({paymentCurrency})
          </span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">Method used</span>
          <select
            required
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethodValue)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            {ADMIN_RECORD_PAYMENT_METHODS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {previewBase != null && paymentCurrency !== baseCode && selectedCurrency && (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          Ledger credit:{" "}
          <strong>{formatMoney(baseCode, previewBase)}</strong>
          {" · "}
          rate 1 {paymentCurrency} = {selectedCurrency.rateToBase} {baseCode}
        </p>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Payer phone <span className="font-normal text-slate-500">(optional)</span>
        </span>
        <input
          type="tel"
          value={payerPhone}
          onChange={(e) => setPayerPhone(e.target.value)}
          placeholder="Mobile money or contact number"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Notes <span className="font-normal text-slate-500">(optional)</span>
        </span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Receipt no., bank reference, teller, etc."
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save payment record
      </button>
    </form>
  );
}
