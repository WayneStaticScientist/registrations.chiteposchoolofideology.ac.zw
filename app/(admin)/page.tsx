"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { Users, Clock, DollarSign } from "lucide-react";
import { Spinner } from "@heroui/spinner";
import api from "@/services/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalPending: 0,
    totalBillingsCollected: 0,
    totalAmountBilled: 0,
    outstandingBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/users/admin/dashboard/stats");
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-zinc-500">
          Monitor your school's enrollments and financials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered Students"
          value={stats.totalRegistered}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Amount Billed"
          value={`$${stats.totalAmountBilled.toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Collected"
          value={`$${stats.totalBillingsCollected.toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${stats.outstandingBalance.toFixed(2)}`}
          icon={Clock}
          color="amber"
          trend="Needs Follow-up"
          trendUp={false}
        />
      </div>

      <div className="mt-12 bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <p className="text-zinc-500 text-sm mb-6">Access common administrative tasks.</p>
        <div className="flex gap-4">
          <a href="/enrollments" className="px-6 py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors">
            Review Pending Enrollments
          </a>
          <a href="/fees" className="px-6 py-3 bg-zinc-100 text-zinc-900 font-medium rounded-xl hover:bg-zinc-200 transition-colors">
            Manage Fee Structures
          </a>
        </div>
      </div>
    </div>
  );
}
