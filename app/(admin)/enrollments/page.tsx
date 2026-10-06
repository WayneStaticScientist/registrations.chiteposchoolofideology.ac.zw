"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { ChevronRight, Loader2, RefreshCw, Search } from "lucide-react";

import { EnrollmentDetailDrawer } from "@/components/enrollments/EnrollmentDetailDrawer";
import api from "@/services/api";

type EnrollmentStage = "all" | "pending" | "accepted" | "registered" | "certified";

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
  certificateId?: string;
  certificateIssuedAt?: string;
}

type ListResponse = {
  data: Enrollment[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const STAGE_TABS: { id: EnrollmentStage; label: string; description: string }[] = [
  {
    id: "all",
    label: "All",
    description: "Every enrollment",
  },
  {
    id: "pending",
    label: "Pending",
    description: "Applied, awaiting decision",
  },
  {
    id: "accepted",
    label: "Accepted",
    description: "Accepted, not yet registered",
  },
  {
    id: "registered",
    label: "Registered",
    description: "Registered, not yet certified",
  },
  {
    id: "certified",
    label: "Certified",
    description: "Certificate issued",
  },
];

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
  const [searchInput, setSearchInput] = useState("");
  const [stage, setStage] = useState<EnrollmentStage>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [syncingBilling, setSyncingBilling] = useState(false);

  const fetchMandatoryTotal = useCallback(async () => {
    try {
      const feesRes = await api.get("/payments/fees");
      const fees = feesRes.data?.data ?? [];
      const total = fees
        .filter((f: { isMandatory?: boolean }) => f.isMandatory)
        .reduce((sum: number, f: { amount: number }) => sum + (f.amount ?? 0), 0);
      setMandatoryTotal(total);
    } catch (err) {
      console.error("Failed to fetch fees", err);
    }
  }, []);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ListResponse>("/enrollments/admin/list", {
        params: {
          stage,
          q: search.trim() || undefined,
          page,
          limit: 25,
        },
      });
      setEnrollments(res.data?.data ?? []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [stage, search, page]);

  useEffect(() => {
    void fetchMandatoryTotal();
  }, [fetchMandatoryTotal]);

  useEffect(() => {
    void fetchEnrollments();
  }, [fetchEnrollments]);

  const handleValidateBilling = async () => {
    setSyncingBilling(true);
    try {
      const res = await api.post("/enrollments/admin/sync-billing");
      const d = res.data?.data;
      await fetchEnrollments();
      alert(
        `Billing validated.\n\nMandatory total: USD ${(d?.mandatoryTotal ?? 0).toFixed(2)}\nAccepted/registered enrollments: ${d?.enrollmentsEligible ?? 0}\nUpdated: ${d?.enrollmentsUpdated ?? 0}\nAlready correct: ${d?.enrollmentsAlreadyCorrect ?? 0}`,
      );
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || "Failed to validate billing.");
    } finally {
      setSyncingBilling(false);
    }
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const selectStage = (next: EnrollmentStage) => {
    setStage(next);
    setPage(1);
  };

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

  const activeTab = STAGE_TABS.find((t) => t.id === stage);

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Current mandatory fees
            </p>
            <p className="text-lg font-bold text-slate-800">
              USD {mandatoryTotal.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            disabled={syncingBilling}
            onClick={() => void handleValidateBilling()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:opacity-60"
            title="Apply current mandatory fee total to all accepted and registered enrollments"
          >
            {syncingBilling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw size={18} className="text-primary" />
            )}
            Validate billing
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STAGE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectStage(tab.id)}
            className={`rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${
              stage === tab.id
                ? "bg-primary text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <span className="block font-bold">{tab.label}</span>
            <span
              className={`block text-xs ${stage === tab.id ? "text-white/85" : "text-zinc-500"}`}
            >
              {tab.description}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={applySearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="search"
          placeholder="Search by name, ID, or email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white"
        >
          Search
        </button>
      </form>

      {activeTab && (
        <p className="text-sm text-zinc-500">
          Showing <span className="font-semibold text-zinc-700">{activeTab.label}</span>{" "}
          enrollments
          {search.trim() ? ` matching “${search.trim()}”` : ""} — page {pagination.page} of{" "}
          {pagination.totalPages} ({pagination.total} total)
        </p>
      )}

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" color="success" />
          </div>
        ) : (
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
                    {stage === "certified" ? "Certificate" : "Status"}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Open
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No enrollments in this list.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => {
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
                          {stage === "certified" && enrollment.certificateId ? (
                            <div>
                              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-800">
                                Certified
                              </span>
                              <div className="mt-1 font-mono text-xs text-zinc-600">
                                {enrollment.certificateId}
                              </div>
                            </div>
                          ) : (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(enrollment.status)}`}
                            >
                              {enrollment.status}
                            </span>
                          )}
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
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-zinc-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
