"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  DollarSign,
  Loader2,
  Receipt,
  Users,
} from "lucide-react";

import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { StatCard } from "@/components/admin/StatCard";
import api from "@/services/api";

interface AdminStats {
  totalRegistered: number;
  totalPending: number;
  totalAmountBilled: number;
  totalPaymentsCollected: number;
  paidTransactionCount: number;
  outstandingBalance: number;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/users/admin/dashboard/stats");
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Could not load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        {error || "Something went wrong."}
      </div>
    );
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-500">{today}</p>
        <p className="mt-1 text-sm text-slate-500">
          Enrollments and payment collections across the school.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Registered students"
          value={stats.totalRegistered}
          icon={Users}
        />
        <StatCard
          title="Pending enrollments"
          value={stats.totalPending}
          icon={Clock}
          hint="Awaiting review or payment"
        />
        <StatCard
          title="Total collected"
          value={formatMoney(stats.totalPaymentsCollected)}
          icon={DollarSign}
          hint={`${stats.paidTransactionCount} paid transaction${stats.paidTransactionCount === 1 ? "" : "s"} (Payment records)`}
        />
        <StatCard
          title="Outstanding balance"
          value={formatMoney(stats.outstandingBalance)}
          icon={Receipt}
          hint={`Billed ${formatMoney(stats.totalAmountBilled)} total`}
        />
      </section>

      <AdminAnalyticsCharts />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-bold text-slate-800">Quick actions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Common registration and finance tasks.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/enrollments"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90"
          >
            Review enrollments
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/fees"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-primary/30 hover:text-primary"
          >
            Manage fee structures
          </Link>
        </div>
      </section>
    </div>
  );
}
