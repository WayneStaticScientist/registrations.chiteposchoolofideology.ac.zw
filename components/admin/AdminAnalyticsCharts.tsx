"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  AnalyticsGroupBy,
  AnalyticsPoint,
  defaultRangeForGroupBy,
  fillAnalyticsSeries,
  formatPeriodLabel,
  toDateInputValue,
} from "@/lib/analytics-periods";
import api from "@/services/api";

type AnalyticsResponse = {
  groupBy: AnalyticsGroupBy;
  startDate: string;
  endDate: string;
  payments: AnalyticsPoint[];
  enrollments: AnalyticsPoint[];
  certifications: AnalyticsPoint[];
};

const GROUP_OPTIONS: { value: AnalyticsGroupBy; label: string }[] = [
  { value: "day", label: "Daily" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const PRESETS: { id: string; label: string; groupBy: AnalyticsGroupBy; days?: number; months?: number; years?: number }[] = [
  { id: "7d", label: "Last 7 days", groupBy: "day", days: 6 },
  { id: "30d", label: "Last 30 days", groupBy: "day", days: 29 },
  { id: "12m", label: "Last 12 months", groupBy: "month", months: 11 },
  { id: "5y", label: "Last 5 years", groupBy: "year", years: 4 },
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-4 h-64 w-full min-w-0">{children}</div>
    </div>
  );
}

export function AdminAnalyticsCharts({ compact = false }: { compact?: boolean }) {
  const [groupBy, setGroupBy] = useState<AnalyticsGroupBy>("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activePreset, setActivePreset] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [raw, setRaw] = useState<AnalyticsResponse | null>(null);

  const applyDefaultRange = useCallback((nextGroupBy: AnalyticsGroupBy) => {
    const { start, end } = defaultRangeForGroupBy(nextGroupBy);
    setStartDate(toDateInputValue(start));
    setEndDate(toDateInputValue(end));
  }, []);

  useEffect(() => {
    applyDefaultRange(groupBy);
  }, [applyDefaultRange, groupBy]);

  const fetchAnalytics = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get<{ data: AnalyticsResponse }>(
        "/users/admin/dashboard/analytics",
        {
          params: { groupBy, startDate, endDate },
        },
      );
      setRaw(res.data.data);
    } catch {
      setError("Could not load chart data.");
      setRaw(null);
    } finally {
      setLoading(false);
    }
  }, [groupBy, startDate, endDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAnalytics();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [fetchAnalytics]);

  const chartData = useMemo(() => {
    if (!raw) return [];
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    const payments = fillAnalyticsSeries(raw.payments, start, end, groupBy);
    const enrollments = fillAnalyticsSeries(raw.enrollments, start, end, groupBy);
    const certifications = fillAnalyticsSeries(raw.certifications, start, end, groupBy);

    return payments.map((p, i) => ({
      period: p.period,
      label: formatPeriodLabel(p.period, groupBy),
      payments: p.amount,
      paymentCount: p.count,
      enrollments: enrollments[i]?.count ?? 0,
      certifications: certifications[i]?.count ?? 0,
    }));
  }, [raw, startDate, endDate, groupBy]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, row) => ({
        payments: acc.payments + row.payments,
        enrollments: acc.enrollments + row.enrollments,
        certifications: acc.certifications + row.certifications,
      }),
      { payments: 0, enrollments: 0, certifications: 0 },
    );
  }, [chartData]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id);
    setGroupBy(preset.groupBy);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setHours(0, 0, 0, 0);
    if (preset.days != null) start.setDate(start.getDate() - preset.days);
    if (preset.months != null) start.setMonth(start.getMonth() - preset.months);
    if (preset.years != null) start.setFullYear(start.getFullYear() - preset.years);
    setStartDate(toDateInputValue(start));
    setEndDate(toDateInputValue(end));
  };

  return (
    <section className="space-y-6" id="analytics">
      {!compact && (
        <div className="border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Insights
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-800">Trends & collections</h2>
          <p className="mt-1 text-sm text-slate-500">
            Payments (paid), new enrollments, and certificates issued over time.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activePreset === preset.id
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Group by
            </label>
            <select
              value={groupBy}
              onChange={(e) => {
                setActivePreset("custom");
                setGroupBy(e.target.value as AnalyticsGroupBy);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            >
              {GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setActivePreset("custom");
                setStartDate(e.target.value);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setActivePreset("custom");
                setEndDate(e.target.value);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-primary/15">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Collected</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{formatMoney(totals.payments)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enrollments</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{totals.enrollments}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Certificates</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{totals.certifications}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-6 text-center text-sm text-secondary">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard title="Payments collected" subtitle="Sum of paid Payment records per period">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="payGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#008A2E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#008A2E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={48} />
                <Tooltip
                  formatter={(value) => [
                    formatMoney(typeof value === "number" ? value : Number(value) || 0),
                    "Collected",
                  ]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.period ?? ""}
                />
                <Area
                  type="monotone"
                  dataKey="payments"
                  stroke="#008A2E"
                  strokeWidth={2}
                  fill="url(#payGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="New enrollments" subtitle="Enrollment applications created per period">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip
                  formatter={(value) => [
                    typeof value === "number" ? value : Number(value) || 0,
                    "Enrollments",
                  ]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.period ?? ""}
                />
                <Bar dataKey="enrollments" fill="#008A2E" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Certifications issued"
            subtitle="Certificates issued per period (issue date)"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip
                  formatter={(value) => [
                    typeof value === "number" ? value : Number(value) || 0,
                    "Certificates",
                  ]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.period ?? ""}
                />
                <Legend />
                <Bar dataKey="certifications" name="Issued" fill="#047857" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Combined activity" subtitle="Enrollments vs certificates (counts)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.period ?? ""} />
                <Legend />
                <Bar dataKey="enrollments" name="Enrollments" fill="#008A2E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="certifications" name="Certificates" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </section>
  );
}
