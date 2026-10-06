"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { ChevronRight, Search } from "lucide-react";

import { EnrollmentDetailDrawer } from "@/components/enrollments/EnrollmentDetailDrawer";
import api from "@/services/api";

interface Enrollment {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  email?: string;
  status: string;
  createdAt: string;
  financials?: { totalBilled?: number; totalPaid?: number };
}

function amountDue(enrollment: Enrollment): number {
  const billed = enrollment.financials?.totalBilled ?? 0;
  const paid = enrollment.financials?.totalPaid ?? 0;
  return Math.max(0, billed - paid);
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [mandatoryTotal, setMandatoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    try {
      const [enrollRes, feesRes] = await Promise.all([
        api.get("/enrollments"),
        api.get("/payments/fees"),
      ]);
      if (enrollRes.data?.data) {
        setEnrollments(enrollRes.data.data);
      }
      const fees = feesRes.data?.data ?? [];
      const total = fees
        .filter((f: { isMandatory?: boolean }) => f.isMandatory)
        .reduce((sum: number, f: { amount: number }) => sum + (f.amount ?? 0), 0);
      setMandatoryTotal(total);
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEnrollments();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter(
      (e) =>
        `${e.firstName} ${e.lastName} ${e.nationalId} ${e.email ?? ""}`
          .toLowerCase()
          .includes(q),
    );
  }, [enrollments, search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "accepted":
      case "registered":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-zinc-900">
            Enrollments
          </h1>
          <p className="text-zinc-500">
            Review applications, fees, payments, and certifications in one place.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Current mandatory fees
          </p>
          <p className="text-lg font-bold text-slate-800">
            USD {mandatoryTotal.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="search"
          placeholder="Search by name, ID, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Applicant
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  National ID
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Billed / Paid / Due
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Open
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                filtered.map((enrollment) => {
                  const billed = enrollment.financials?.totalBilled ?? 0;
                  const paid = enrollment.financials?.totalPaid ?? 0;
                  const due = amountDue(enrollment);

                  return (
                    <tr
                      key={enrollment._id}
                      className="cursor-pointer transition-colors hover:bg-zinc-50/80"
                      onClick={() => setSelectedId(enrollment._id)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900">
                          {enrollment.firstName} {enrollment.lastName}
                        </div>
                        <div className="text-sm text-zinc-500">{enrollment.phoneNumber}</div>
                        {enrollment.email && (
                          <div className="text-sm text-zinc-500">{enrollment.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-600">
                        {enrollment.nationalId}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-zinc-800">
                          ${billed.toFixed(2)}{" "}
                          <span className="text-zinc-400">/</span> ${paid.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-semibold ${due > 0 ? "text-amber-600" : "text-emerald-600"}`}
                        >
                          {due > 0 ? `Due $${due.toFixed(2)}` : "Settled"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(enrollment.status)}`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-primary">
                        <ChevronRight className="ml-auto" size={20} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && (
        <EnrollmentDetailDrawer
          enrollmentId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusUpdated={() => void fetchEnrollments()}
        />
      )}
    </div>
  );
}
