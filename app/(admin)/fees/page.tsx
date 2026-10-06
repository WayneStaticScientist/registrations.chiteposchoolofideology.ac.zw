"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Spinner } from "@heroui/spinner";
import {
  Plus,
  CreditCard,
  CheckCircle,
  Pencil,
  History,
  DollarSign,
} from "lucide-react";
import api from "@/services/api";

interface FeeStructure {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  isMandatory: boolean;
  program?: string;
  intake?: string;
  createdAt?: string;
  updatedAt?: string;
}

const emptyForm = {
  name: "",
  amount: "",
  currency: "USD",
  description: "",
  isMandatory: true,
  note: "",
};

export default function FeesPage() {
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchFees = async () => {
    try {
      const res = await api.get("/payments/fees");
      if (res.data?.data) {
        setFees(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch fees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFees();
  }, []);

  const mandatoryTotal = useMemo(
    () =>
      fees
        .filter((f) => f.isMandatory)
        .reduce((sum, f) => sum + (f.amount ?? 0), 0),
    [fees],
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    const name = target.name;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setModalMode("create");
  };

  const openEdit = (fee: FeeStructure) => {
    setEditingId(fee._id);
    setFormData({
      name: fee.name,
      amount: String(fee.amount),
      currency: fee.currency,
      description: fee.description ?? "",
      isMandatory: fee.isMandatory,
      note: "",
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setModalMode(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        isMandatory: formData.isMandatory,
        note: formData.note.trim() || undefined,
      };

      if (modalMode === "edit" && editingId) {
        await api.patch(`/payments/fees/${editingId}`, payload);
      } else {
        await api.post("/payments/fees", payload);
      }

      await fetchFees();
      closeModal();
      setFormData(emptyForm);
    } catch (error) {
      console.error("Failed to save fee structure", error);
      alert("Could not save fee structure.");
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Finance
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
            Fee structures
          </h1>
          <p className="mt-2 max-w-xl text-zinc-500">
            Define mandatory and optional fees. Changes are logged with dates for audit and
            printing. Accepted and registered students&apos; balances update when mandatory
            fees change.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/fees/changelog"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
          >
            <History size={18} />
            Audit trail
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-primary/90"
          >
            <Plus size={18} />
            Add fee
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-3">
            <DollarSign className="text-primary" size={22} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Mandatory total
              </p>
              <p className="text-2xl font-black text-zinc-900">
                USD {mandatoryTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Active fee lines
          </p>
          <p className="text-2xl font-black text-zinc-900">{fees.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Mandatory lines
          </p>
          <p className="text-2xl font-black text-zinc-900">
            {fees.filter((f) => f.isMandatory).length}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="font-bold text-zinc-900">Current fee schedule</h2>
        </div>
        {fees.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="mx-auto mb-4 text-zinc-300" size={48} />
            <p className="text-zinc-500">No fee structures yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Fee</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Last updated</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-zinc-50/80">
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">{fee.name}</p>
                      <p className="max-w-md text-xs text-zinc-500 line-clamp-2">
                        {fee.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-800">
                      {fee.currency} {fee.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                          fee.isMandatory
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {fee.isMandatory ? "Mandatory" : "Optional"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {fee.updatedAt
                        ? new Date(fee.updatedAt).toLocaleString()
                        : fee.createdAt
                          ? new Date(fee.createdAt).toLocaleString()
                          : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(fee)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-4">
              <h2 className="text-lg font-bold text-zinc-900">
                {modalMode === "edit" ? "Update fee structure" : "New fee structure"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {modalMode === "edit" && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  Updates are recorded in the change log with today&apos;s date. Mandatory
                  changes refresh billed amounts for accepted and registered students.
                </p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Fee name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Amount</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="USD">USD</option>
                    <option value="ZWG">ZWG</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Description</label>
                <textarea
                  required
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">
                  Audit note (optional)
                </label>
                <input
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="e.g. Board approval ref, intake 2026 adjustment"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <input
                  type="checkbox"
                  name="isMandatory"
                  checked={formData.isMandatory}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 rounded accent-primary"
                />
                <span className="text-sm text-zinc-700">
                  <span className="font-bold">Mandatory fee</span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    Included in registration requirements and student balance due.
                  </span>
                </span>
              </label>

              <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {isSubmitting
                    ? "Saving…"
                    : modalMode === "edit"
                      ? "Save & log change"
                      : "Create & log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
