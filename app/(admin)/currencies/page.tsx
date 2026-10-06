"use client";

import { Coins, Loader2, Plus, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import api from "@/services/api";

type CurrencyRow = {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  isActive: boolean;
  decimals: number;
  rateToBase: number;
  rateUpdatedAt?: string;
};

const emptyForm = {
  code: "",
  name: "",
  symbol: "",
  rateToBase: "",
};

export default function CurrenciesPage() {
  const [rows, setRows] = useState<CurrencyRow[]>([]);
  const [baseCode, setBaseCode] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [rateEdits, setRateEdits] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: CurrencyRow[]; baseCurrencyCode: string }>(
        "/payments/currencies",
      );
      setRows(res.data.data ?? []);
      setBaseCode(res.data.baseCurrencyCode ?? "USD");
      const edits: Record<string, string> = {};
      for (const c of res.data.data ?? []) {
        if (!c.isBase) edits[c._id] = String(c.rateToBase);
      }
      setRateEdits(edits);
    } catch {
      alert("Could not load currencies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number.parseFloat(form.rateToBase);
    if (!Number.isFinite(rate) || rate <= 0) {
      alert("Enter a valid exchange rate to base currency.");
      return;
    }
    setCreating(true);
    try {
      await api.post("/payments/currencies", {
        code: form.code.trim(),
        name: form.name.trim(),
        symbol: form.symbol.trim() || form.code.trim(),
        rateToBase: rate,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "SESSION_EXPIRED") return;
      const axiosErr = error as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || "Could not add currency.");
    } finally {
      setCreating(false);
    }
  };

  const saveRate = async (row: CurrencyRow) => {
    const raw = rateEdits[row._id];
    const rate = Number.parseFloat(raw);
    if (!Number.isFinite(rate) || rate <= 0) {
      alert("Invalid rate.");
      return;
    }
    setSavingId(row._id);
    try {
      await api.patch(`/payments/currencies/${row._id}`, { rateToBase: rate });
      await load();
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || "Could not update rate.");
    } finally {
      setSavingId(null);
    }
  };

  const setAsBase = async (row: CurrencyRow) => {
    if (
      !window.confirm(
        `Set ${row.code} as the reporting base currency? Balances stay in amounts already stored; update rates before new foreign payments.`,
      )
    ) {
      return;
    }
    setSavingId(row._id);
    try {
      await api.patch(`/payments/currencies/${row._id}`, { setAsBase: true });
      await load();
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || "Could not change base currency.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Finance
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-800">
          <Coins className="text-primary" size={28} />
          Currencies &amp; rates
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800">Configured currencies</h2>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
          >
            <Plus size={18} />
            Add currency
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={(e) => void handleCreate(e)}
            className="mb-6 grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2"
          >
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Code</span>
              <input
                required
                maxLength={4}
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="ZWG"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 uppercase"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Zimbabwe Gold"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Symbol</span>
              <input
                value={form.symbol}
                onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
                placeholder="ZWG"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                Exchange rate (1 unit of this currency = X {baseCode})
              </span>
              <input
                required
                type="number"
                min="0.000001"
                step="any"
                value={form.rateToBase}
                onChange={(e) => setForm((f) => ({ ...f, rateToBase: e.target.value }))}
                placeholder="e.g. 0.027 if 1 ZWG ≈ 0.027 USD"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {creating ? "Saving…" : "Save currency"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Currency</th>
                  <th className="px-4 py-3">Base</th>
                  <th className="px-4 py-3">Rate → {baseCode}</th>
                  <th className="px-4 py-3">Rate updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">
                        {row.code}{" "}
                        <span className="font-normal text-slate-500">· {row.name}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {row.isBase ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          <Star size={12} /> Base
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={savingId === row._id}
                          onClick={() => void setAsBase(row)}
                          className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-primary hover:underline"
                        >
                          Set as base
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.isBase ? (
                        <span className="text-slate-600">1 (fixed)</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">1 {row.code} =</span>
                          <input
                            type="number"
                            min="0.000001"
                            step="any"
                            value={rateEdits[row._id] ?? ""}
                            onChange={(e) =>
                              setRateEdits((prev) => ({
                                ...prev,
                                [row._id]: e.target.value,
                              }))
                            }
                            className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                          />
                          <span className="text-xs text-slate-500">{baseCode}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {row.rateUpdatedAt
                        ? new Date(row.rateUpdatedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!row.isBase && (
                        <button
                          type="button"
                          disabled={savingId === row._id}
                          onClick={() => void saveRate(row)}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          {savingId === row._id ? "…" : "Update rate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
