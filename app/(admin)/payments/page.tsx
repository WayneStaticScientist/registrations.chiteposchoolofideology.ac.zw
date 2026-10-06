"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Download, FileText, Loader2, Receipt, Search } from "lucide-react";

import api from "@/services/api";
import { formatPaymentAmountCell } from "@/lib/format-money";
import {
  formatPaymentChannelLabel,
  formatPaymentMethodLabel,
} from "@/lib/payment-labels";
import {
  downloadPaymentHistoryReportPdf,
  downloadPaymentReceiptPdf,
  formatExactDateTimeTable,
  type PaymentReceiptData,
} from "@/lib/admin-documents";

type PaymentRecord = PaymentReceiptData & {
  _id: string;
  method?: string;
  channel?: string;
  baseCurrencyCode?: string;
  originalAmount?: number;
  originalCurrencyCode?: string;
  exchangeRateToBase?: number;
};

type HistoryResponse = {
  data: PaymentRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: { totalRecords: number; totalPaidAmount: number };
};

function statusClass(status: string) {
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-900";
}

function methodLabel(row: PaymentRecord) {
  return row.methodLabel || formatPaymentMethodLabel(row.method);
}

function channelLabel(row: PaymentRecord) {
  return row.channelLabel || formatPaymentChannelLabel(row.channel);
}

function toReceipt(row: PaymentRecord): PaymentReceiptData {
  return {
    reference: row.reference,
    status: row.status,
    amount: row.amount,
    methodLabel: methodLabel(row),
    channelLabel: channelLabel(row),
    notes: row.notes,
    baseCurrencyCode: row.baseCurrencyCode,
    originalAmount: row.originalAmount,
    originalCurrencyCode: row.originalCurrencyCode,
    exchangeRateToBase: row.exchangeRateToBase,
    initiatedAt: row.initiatedAt,
    payedAt: row.payedAt,
    createdAt: row.createdAt,
    payer: row.payer,
  };
}

export default function PaymentHistoryPage() {
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 50,
  });
  const [summary, setSummary] = useState({ totalRecords: 0, totalPaidAmount: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<HistoryResponse>("/payments/admin/history", {
        params: {
          q: search.trim() || undefined,
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          limit: 50,
        },
      });
      setRows(res.data.data ?? []);
      setPagination(res.data.pagination);
      setSummary(res.data.summary);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, from, to, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (page !== 1) setPage(1);
    else void load();
  };

  const filterNote = [
    search.trim() ? `Search: “${search.trim()}”` : null,
    status ? `Status: ${status}` : null,
    from || to ? `Dates: ${from || "…"} – ${to || "…"}` : null,
    `Page ${pagination.page} of ${pagination.totalPages}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const receiptRows = rows.map(toReceipt);

  const handleDownloadReportPdf = async () => {
    setExporting(true);
    try {
      await downloadPaymentHistoryReportPdf(receiptRows, summary, filterNote);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Finance
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-900">
            <Receipt className="text-primary" size={32} />
            Payment history
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            All Paynow transactions with exact timestamps. Download PDF receipts per
            payment or export the current list.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase text-zinc-400">Records</p>
              <p className="text-lg font-bold text-slate-800">{summary.totalRecords}</p>
            </div>
            <div className="border-l border-zinc-200 pl-3">
              <p className="text-xs font-bold uppercase text-zinc-400">Paid (filtered)</p>
              <p className="text-lg font-bold text-emerald-700">
                USD {summary.totalPaidAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading || rows.length === 0 || exporting}
            onClick={() => void handleDownloadReportPdf()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download PDF
          </button>
        </div>
      </header>

      <form
        onSubmit={applyFilters}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            type="search"
            placeholder="Name, ID, email, reference, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-500">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-500">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white"
        >
          Apply
        </button>
      </form>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-zinc-500">
          No payments match your filters.
        </p>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[72rem] text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">When (exact)</th>
                  <th className="px-4 py-3">Payer</th>
                  <th className="px-4 py-3">National ID</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="sticky right-0 z-10 min-w-[5.5rem] bg-zinc-50 px-4 py-3 pr-5 shadow-[-6px_0_12px_-8px_rgba(0,0,0,0.15)]">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((row) => {
                  const receipt = toReceipt(row);
                  const when = formatExactDateTimeTable(
                    row.payedAt || row.initiatedAt || row.createdAt,
                  );
                  return (
                    <tr key={row._id} className="align-top hover:bg-zinc-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-xs leading-snug text-zinc-700">
                        <span className="block font-medium">{when.date}</span>
                        {when.time ? (
                          <span className="block text-zinc-500">{when.time}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{row.payer.name}</p>
                        {(row.payer.email || row.payer.phone) && (
                          <p className="text-xs text-zinc-500">
                            {[row.payer.email, row.payer.phone]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                        {row.payer.nationalId || "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{methodLabel(row)}</td>
                      <td className="px-4 py-3 text-zinc-600">{channelLabel(row)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">
                        {(() => {
                          const cell = formatPaymentAmountCell(row);
                          return (
                            <>
                              <span className="block">{cell.primary}</span>
                              {cell.secondary ? (
                                <span className="mt-0.5 block text-xs font-normal text-slate-500">
                                  {cell.secondary}
                                </span>
                              ) : null}
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusClass(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                        {row.reference}
                      </td>
                      <td className="sticky right-0 z-10 bg-white px-4 py-3 pr-5 shadow-[-6px_0_12px_-8px_rgba(0,0,0,0.12)]">
                        <button
                          type="button"
                          onClick={() => void downloadPaymentReceiptPdf(receipt)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-xs font-semibold text-primary hover:bg-primary/5 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <FileText size={14} className="shrink-0" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-zinc-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            records) — list export includes this page only
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
