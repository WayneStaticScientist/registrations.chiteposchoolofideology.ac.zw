"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";

import api from "@/services/api";
import {
  downloadFeeAuditEntryPdf,
  downloadFeeAuditReportPdf,
  formatExactDateTimeTable,
  type FeeAuditEntryData,
} from "@/lib/admin-documents";

type AuditEntry = {
  _id: string;
  isBaseline?: boolean;
  action: "created" | "updated";
  effectiveAt: string;
  createdAt: string;
  performedByEmail?: string;
  note?: string;
  mandatoryTotalBefore: number;
  mandatoryTotalAfter: number;
  enrollmentsBillingSynced: number;
  snapshot: {
    name: string;
    amount: number;
    currency: string;
    isMandatory: boolean;
    description?: string;
  };
  previousSnapshot?: {
    name: string;
    amount: number;
    currency: string;
    isMandatory: boolean;
  };
};

function formatMoney(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

function describeChange(entry: AuditEntry): string {
  if (entry.action === "created") {
    return `Added "${entry.snapshot.name}" at ${formatMoney(entry.snapshot.currency, entry.snapshot.amount)} (${entry.snapshot.isMandatory ? "mandatory" : "optional"}).`;
  }
  const prev = entry.previousSnapshot;
  if (!prev) return `Updated "${entry.snapshot.name}".`;
  const parts: string[] = [];
  if (prev.name !== entry.snapshot.name) {
    parts.push(`name "${prev.name}" → "${entry.snapshot.name}"`);
  }
  if (prev.amount !== entry.snapshot.amount) {
    parts.push(
      `amount ${formatMoney(prev.currency, prev.amount)} → ${formatMoney(entry.snapshot.currency, entry.snapshot.amount)}`,
    );
  }
  if (prev.isMandatory !== entry.snapshot.isMandatory) {
    parts.push(
      prev.isMandatory ? "mandatory → optional" : "optional → mandatory",
    );
  }
  return parts.length > 0
    ? `Updated "${entry.snapshot.name}": ${parts.join("; ")}.`
    : `Updated "${entry.snapshot.name}" (metadata/description).`;
}

function toDocEntry(entry: AuditEntry): FeeAuditEntryData {
  return {
    ...entry,
    action: entry.isBaseline ? "baseline" : entry.action,
    detailsText: describeChange(entry),
  };
}

export default function FeeChangelogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [mandatoryTotal, setMandatoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments/fees/changelog", {
        params: {
          from: from || undefined,
          to: to || undefined,
        },
      });
      let rows: AuditEntry[] = res.data.data ?? [];
      const mandatory = res.data.mandatoryTotal ?? 0;

      if (rows.length === 0 && !from && !to) {
        const feesRes = await api.get("/payments/fees");
        const fees: Array<{
          _id: string;
          name: string;
          amount: number;
          currency: string;
          description?: string;
          isMandatory?: boolean;
          createdAt?: string;
        }> = feesRes.data.data ?? feesRes.data ?? [];

        rows = fees.map((fee) => ({
          _id: `baseline-${fee._id}`,
          isBaseline: true,
          action: "created" as const,
          effectiveAt: fee.createdAt ?? new Date().toISOString(),
          createdAt: fee.createdAt ?? new Date().toISOString(),
          mandatoryTotalBefore: 0,
          mandatoryTotalAfter: fee.isMandatory ? fee.amount : 0,
          enrollmentsBillingSynced: 0,
          note: "Existing fee (recorded before audit trail)",
          snapshot: {
            name: fee.name,
            amount: fee.amount,
            currency: fee.currency,
            isMandatory: fee.isMandatory ?? true,
            description: fee.description,
          },
        }));
      }

      setEntries(rows);
      setMandatoryTotal(
        mandatory ||
          rows.reduce(
            (sum, e) => sum + (e.snapshot.isMandatory ? e.snapshot.amount : 0),
            0,
          ),
      );
    } catch (e) {
      console.error(e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    void load();
  };

  const filterNote =
    from || to
      ? `Date filter: ${from || "…"} to ${to || "…"}`
      : undefined;

  const docEntries = entries.map(toDocEntry);

  const handleDownloadReportPdf = async () => {
    setExporting(true);
    try {
      await downloadFeeAuditReportPdf(docEntries, mandatoryTotal, filterNote);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[100rem] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/fees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to fee structures
        </Link>
        <button
          type="button"
          disabled={loading || entries.length === 0 || exporting}
          onClick={() => void handleDownloadReportPdf()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download size={18} />
          )}
          Download PDF
        </button>
      </div>

      <header className="border-b border-zinc-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Audit trail
        </p>
        <h1 className="mt-1 text-3xl font-black text-zinc-900">Fee audit trail</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Recorded additions and updates with exact effective times. Current mandatory
          total: <strong>USD {mandatoryTotal.toFixed(2)}</strong>
        </p>
      </header>

      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
      >
        <div>
          <label className="text-xs font-bold text-zinc-500">From date</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-500">To date</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white"
        >
          Apply filter
        </button>
      </form>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-zinc-500">
          No fee entries match this filter. Add or edit a fee on Fee structures, or
          clear the date filter to see all records.
        </p>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[72rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Effective (exact)</th>
                <th className="px-4 py-3">Action</th>
                <th className="min-w-[12rem] px-4 py-3">Details</th>
                <th className="px-4 py-3 whitespace-nowrap">Mandatory total</th>
                <th className="px-4 py-3">Students synced</th>
                <th className="min-w-[10rem] max-w-[14rem] px-4 py-3">By</th>
                <th className="min-w-[6rem] max-w-[10rem] px-4 py-3">Note</th>
                <th className="sticky right-0 z-10 min-w-[5.5rem] bg-zinc-50 px-4 py-3 pr-5 shadow-[-6px_0_12px_-8px_rgba(0,0,0,0.15)]">
                  PDF
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {entries.map((entry) => {
                const doc = toDocEntry(entry);
                const when = formatExactDateTimeTable(
                  entry.effectiveAt || entry.createdAt,
                );
                return (
                  <tr key={entry._id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-xs leading-snug text-zinc-800">
                      <span className="block font-medium">{when.date}</span>
                      {when.time ? (
                        <span className="block text-zinc-500">{when.time}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                          entry.isBaseline
                            ? "bg-zinc-100 text-zinc-700"
                            : entry.action === "created"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {entry.isBaseline ? "baseline" : entry.action}
                      </span>
                    </td>
                    <td className="max-w-md px-4 py-3 text-zinc-700">
                      {describeChange(entry)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                      USD {entry.mandatoryTotalBefore.toFixed(2)} →{" "}
                      {entry.mandatoryTotalAfter.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {entry.enrollmentsBillingSynced}
                    </td>
                    <td className="break-all px-4 py-3 text-xs text-zinc-600">
                      {entry.performedByEmail || "—"}
                    </td>
                    <td className="break-words px-4 py-3 text-xs text-zinc-500">
                      {entry.note || "—"}
                    </td>
                    <td className="sticky right-0 z-10 bg-white px-4 py-3 pr-5 shadow-[-6px_0_12px_-8px_rgba(0,0,0,0.12)]">
                      <button
                        type="button"
                        onClick={() => void downloadFeeAuditEntryPdf(doc)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-xs font-semibold text-primary hover:bg-primary/5 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        title="Download PDF for this record"
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
    </div>
  );
}
