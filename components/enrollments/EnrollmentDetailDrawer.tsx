"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { CertificatePanel } from "@/components/enrollments/CertificatePanel";
import api from "@/services/api";

type EnrollmentRow = {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  email?: string;
  countryOfResidence: string;
  city: string;
  birthCity: string;
  status: string;
  createdAt: string;
  financials?: { totalBilled?: number; totalPaid?: number };
};

type FeeLine = {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  description?: string;
  isMandatory?: boolean;
};

type PaymentRow = {
  _id: string;
  amount: number;
  status: string;
  reference: string;
  createdAt?: string;
  payedAt?: string;
};

type DetailPayload = {
  enrollment: EnrollmentRow;
  fees: FeeLine[];
  financials: {
    totalBilled: number;
    totalPaid: number;
    amountDue: number;
    paymentSatisfied: boolean;
  };
  payments: PaymentRow[];
  certificate: {
    certificateId: string;
    issueDate: string;
    performanceSummary?: string;
  } | null;
  performance: {
    averageScore: string;
    completedQuizzes: number;
    hasStudentAccount: boolean;
  };
};

export function EnrollmentDetailDrawer({
  enrollmentId,
  onClose,
  onStatusUpdated,
}: {
  enrollmentId: string;
  onClose: () => void;
  onStatusUpdated: () => void;
}) {
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/enrollments/admin/${enrollmentId}/detail`);
      setDetail(res.data.data);
    } catch (e) {
      console.error(e);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpdateStatus = async (status: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await api.patch(`/enrollments/${enrollmentId}/status`, { status });
      onStatusUpdated();
      await load();
      if (status === "rejected") onClose();
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const studentName = detail
    ? `${detail.enrollment.firstName} ${detail.enrollment.lastName}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Enrollment record
            </p>
            <h2 className="text-xl font-bold text-slate-900">{studentName || "…"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !detail ? (
            <p className="text-center text-slate-500">Could not load enrollment detail.</p>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2">
                <InfoItem icon={User} label="National ID" value={detail.enrollment.nationalId} />
                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={`${detail.enrollment.city}, ${detail.enrollment.countryOfResidence}`}
                />
                <InfoItem icon={Phone} label="Phone" value={detail.enrollment.phoneNumber} />
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={detail.enrollment.email || "—"}
                />
                <div className="sm:col-span-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClass(detail.enrollment.status)}`}
                  >
                    {detail.enrollment.status}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">
                    Applied{" "}
                    {new Date(detail.enrollment.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <CreditCard size={18} className="text-primary" />
                  <h3 className="font-bold text-slate-800">Fees & payments</h3>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-3 bg-white border-b border-slate-100">
                  <Stat label="Total billed" value={detail.financials.totalBilled} />
                  <Stat label="Paid" value={detail.financials.totalPaid} accent />
                  <Stat
                    label="Balance due"
                    value={detail.financials.amountDue}
                    warn={detail.financials.amountDue > 0}
                  />
                </div>
                <div className="p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Mandatory fee structure
                  </p>
                  {detail.fees.length === 0 ? (
                    <p className="text-sm text-slate-500">No mandatory fees configured.</p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.fees.map((fee) => (
                        <li
                          key={fee._id}
                          className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span className="text-slate-700">{fee.name}</span>
                          <span className="font-semibold text-slate-900">
                            {fee.currency} {fee.amount.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="border-t border-slate-100 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Payment history
                  </p>
                  {detail.payments.length === 0 ? (
                    <p className="text-sm text-slate-500">No payments recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase text-slate-500">
                          <tr>
                            <th className="pb-2 pr-4">Reference</th>
                            <th className="pb-2 pr-4">Amount</th>
                            <th className="pb-2 pr-4">Status</th>
                            <th className="pb-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {detail.payments.map((p) => (
                            <tr key={p._id}>
                              <td className="py-2 pr-4 font-mono text-xs">{p.reference}</td>
                              <td className="py-2 pr-4 font-semibold">${p.amount.toFixed(2)}</td>
                              <td className="py-2 pr-4">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${paymentStatusClass(p.status)}`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2 text-slate-600">
                                {(p.payedAt || p.createdAt)
                                  ? new Date(p.payedAt || p.createdAt!).toLocaleString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <h3 className="mb-3 font-bold text-slate-800">Academic summary</h3>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-slate-500">Student account</p>
                    <p className="font-semibold text-slate-800">
                      {detail.performance.hasStudentAccount ? "Registered" : "Not registered"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Average quiz score</p>
                    <p className="font-semibold text-primary">
                      {detail.performance.averageScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Quizzes completed</p>
                    <p className="font-semibold text-slate-800">
                      {detail.performance.completedQuizzes}
                    </p>
                  </div>
                </div>
              </section>

              {(detail.enrollment.status === "accepted" ||
                detail.enrollment.status === "registered") && (
                <CertificatePanel
                  enrollmentId={enrollmentId}
                  initialCertificate={detail.certificate}
                  initialPerformance={detail.performance}
                  studentName={studentName}
                  onIssued={() => void load()}
                />
              )}
            </>
          )}
        </div>

        {detail?.enrollment.status === "pending" && (
          <div className="flex gap-3 border-t border-slate-200 p-4">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => void handleUpdateStatus("rejected")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle size={20} /> Decline
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => void handleUpdateStatus("accepted")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <CheckCircle size={20} /> Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon size={14} /> {label}
      </div>
      <p className="font-semibold text-slate-900 break-all">{value}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`text-xl font-bold ${warn ? "text-amber-600" : accent ? "text-primary" : "text-slate-800"}`}
      >
        ${value.toFixed(2)}
      </p>
    </div>
  );
}

function statusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "accepted":
    case "registered":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function paymentStatusClass(status: string) {
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "pending") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}
