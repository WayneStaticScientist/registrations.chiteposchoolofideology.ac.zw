"use client";

import { Award, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import api from "@/services/api";

type EnrollmentRef = {
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  status?: string;
};

type CertificateRow = {
  _id: string;
  certificateId: string;
  issueDate?: string;
  performanceSummary?: string;
  enrollmentId?: EnrollmentRef | null;
};

export default function CertificationsPage() {
  const [rows, setRows] = useState<CertificateRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<{ data: CertificateRow[]; total: number }>(
          "/users/admin/certificates",
        );
        setRows(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
      } catch {
        setError("Could not load certificates.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Credentials
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-800">
          <Award className="text-primary" size={28} />
          Certifications
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {total} certificate{total === 1 ? "" : "s"} issued. Trends below use issue date.
        </p>
      </div>

      <AdminAnalyticsCharts compact />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Issued certificates</h2>
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="p-6 text-center text-sm text-secondary">{error}</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No certificates issued yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Certificate ID</th>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">National ID</th>
                  <th className="px-6 py-3">Issued</th>
                  <th className="px-6 py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const en = row.enrollmentId;
                  const name =
                    en?.firstName || en?.lastName
                      ? `${en?.firstName ?? ""} ${en?.lastName ?? ""}`.trim()
                      : "—";
                  return (
                    <tr key={row._id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-primary">
                        {row.certificateId}
                      </td>
                      <td className="px-6 py-3 text-slate-800">{name}</td>
                      <td className="px-6 py-3 text-slate-600">{en?.nationalId ?? "—"}</td>
                      <td className="px-6 py-3 text-slate-600">
                        {row.issueDate
                          ? new Date(row.issueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="max-w-xs truncate px-6 py-3 text-slate-500">
                        {row.performanceSummary || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
