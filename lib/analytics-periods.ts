export type AnalyticsGroupBy = "day" | "month" | "year";

export type AnalyticsPoint = {
  period: string;
  count: number;
  amount: number;
};

export function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultRangeForGroupBy(groupBy: AnalyticsGroupBy): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);

  if (groupBy === "day") {
    start.setDate(start.getDate() - 29);
  } else if (groupBy === "month") {
    start.setMonth(start.getMonth() - 11);
  } else {
    start.setFullYear(start.getFullYear() - 4);
  }
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

function addPeriod(date: Date, groupBy: AnalyticsGroupBy) {
  const next = new Date(date);
  if (groupBy === "day") {
    next.setDate(next.getDate() + 1);
  } else if (groupBy === "month") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

function formatPeriod(date: Date, groupBy: AnalyticsGroupBy) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (groupBy === "day") return `${y}-${m}-${d}`;
  if (groupBy === "month") return `${y}-${m}`;
  return String(y);
}

export function fillAnalyticsSeries(
  points: AnalyticsPoint[],
  start: Date,
  end: Date,
  groupBy: AnalyticsGroupBy,
): AnalyticsPoint[] {
  const map = new Map(points.map((p) => [p.period, p]));
  const result: AnalyticsPoint[] = [];
  let cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  const endTime = end.getTime();
  while (cursor.getTime() <= endTime) {
    const period = formatPeriod(cursor, groupBy);
    const hit = map.get(period);
    result.push({
      period,
      count: hit?.count ?? 0,
      amount: hit?.amount ?? 0,
    });
    cursor = addPeriod(cursor, groupBy);
  }

  return result;
}

export function formatPeriodLabel(period: string, groupBy: AnalyticsGroupBy) {
  if (groupBy === "year") return period;
  if (groupBy === "month") {
    const [y, m] = period.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  const date = new Date(`${period}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
