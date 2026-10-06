"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import api from "@/services/api";

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

export default function FeeChangelogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [mandatoryTotal, setMandatoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
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
      setMandatoryTotal(mandatory || rows.reduce(
        (sum, e) =>
          sum + (e.snapshot.isMandatory ? e.snapshot.amount : 0),
        0,
      ));
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

  const printedAt = new Date().toLocaleString();

  return (
    <div className="fee-changelog mx-auto max-w-6xl space-y-6 print:max-w-none print:space-y-4">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .fee-changelog {
            padding: 0;
          }
          body {
            background: white;
          }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/fees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to fee structures
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
        >
          <Printer size={18} />
          Print report
        </button>
      </div>

      <header className="border-b border-zinc-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Audit trail
        </p>
        <h1 className="mt-1 text-3xl font-black text-zinc-900">
          Fee audit trail
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Chitepo School of Ideology — recorded additions and updates with effective
          dates. Current mandatory total:{" "}
          <strong>USD {mandatoryTotal.toFixed(2)}</strong>
        </p>
        <p className="mt-1 text-xs text-zinc-400 print:text-zinc-600">
          Report generated: {printedAt}
        </p>
      </header>

      <form
        onSubmit={handleFilter}
        className="no-print flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
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
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm print:shadow-none">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 print:px-2">Effective date</th>
                <th className="px-4 py-3 print:px-2">Action</th>
                <th className="px-4 py-3 print:px-2">Details</th>
                <th className="px-4 py-3 print:px-2">Mandatory total</th>
                <th className="px-4 py-3 print:px-2">Students synced</th>
                <th className="px-4 py-3 print:px-2">By</th>
                <th className="px-4 py-3 print:px-2">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {entries.map((entry) => (
                <tr key={entry._id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-800 print:px-2">
                    {new Date(entry.effectiveAt || entry.createdAt).toLocaleString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </td>
                  <td className="px-4 py-3 print:px-2">
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
                  <td className="max-w-md px-4 py-3 text-zinc-700 print:px-2">
                    {describeChange(entry)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-700 print:px-2">
                    USD {entry.mandatoryTotalBefore.toFixed(2)} →{" "}
                    {entry.mandatoryTotalAfter.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 print:px-2">
                    {entry.enrollmentsBillingSynced}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 print:px-2">
                    {entry.performedByEmail || "—"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-zinc-500 print:px-2">
                    {entry.note || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
