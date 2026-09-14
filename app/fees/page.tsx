"use client";

import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Plus, CreditCard, CheckCircle, Info } from "lucide-react";

interface FeeStructure {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  isMandatory: boolean;
  program?: string;
  intake?: string;
}

export default function FeesPage() {
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "USD",
    description: "",
    isMandatory: true,
  });

  const fetchFees = async () => {
    try {
      const res = await fetch("http://localhost:9991/api/v1/payments/fees");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setFees(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch fees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:9991/api/v1/payments/fees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        await fetchFees();
        setIsModalOpen(false);
        setFormData({
          name: "",
          amount: "",
          currency: "USD",
          description: "",
          isMandatory: true,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">
            Fee Structures
          </h1>
          <p className="text-zinc-500">
            Define and manage the cost structures for students.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all"
        >
          <Plus size={20} /> Add Fee Structure
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fees.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
             <CreditCard className="mx-auto text-zinc-300 mb-4" size={48} />
             <h3 className="text-lg font-bold text-zinc-600 mb-1">No Fee Structures</h3>
             <p className="text-zinc-400">Click the button above to add one.</p>
          </div>
        ) : (
          fees.map((fee) => (
            <div key={fee._id} className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                {fee.isMandatory ? (
                   <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      Mandatory
                   </span>
                ) : (
                   <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      Optional
                   </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-zinc-900 mb-1">{fee.name}</h3>
              <p className="text-sm text-zinc-500 mb-6 min-h-[40px] line-clamp-2">{fee.description}</p>
              
              <div className="pt-6 border-t border-zinc-100 flex items-end justify-between">
                <div className="text-sm text-zinc-400 font-bold uppercase tracking-wider">{fee.currency}</div>
                <div className="text-3xl font-black text-zinc-900 tracking-tight">
                  <span className="text-zinc-400 text-xl font-medium mr-1">$</span>
                  {fee.amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-xl font-bold text-zinc-900">New Fee Structure</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-300 hover:text-zinc-700 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Fee Name</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Base Tuition, Library Fee"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-zinc-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
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
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Explain what this fee covers..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <input
                  type="checkbox"
                  id="isMandatory"
                  name="isMandatory"
                  checked={formData.isMandatory}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isMandatory" className="text-sm font-bold text-zinc-700 flex flex-col cursor-pointer">
                  <span>Mandatory Fee</span>
                  <span className="text-xs font-normal text-zinc-500">Check if this fee applies to all students automatically</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-200"
                >
                  {isSubmitting ? "Creating..." : <><CheckCircle size={20} /> Create Fee</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
