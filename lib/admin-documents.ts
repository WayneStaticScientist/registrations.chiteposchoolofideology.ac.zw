import type { jsPDF } from "jspdf";

const SCHOOL = "Chitepo School of Ideology";
const REGISTRAR_LINE = "Office of the Registrar — Finance & Records";
const LOGO_PATH = "/apple-touch-icon.png";
const MARGIN = 14;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = 287;
const BRAND_GREEN: [number, number, number] = [0, 138, 46];
const BRAND_DARK: [number, number, number] = [2, 44, 34];
const TEXT_MUTED: [number, number, number] = [113, 113, 122];
const TEXT_BODY: [number, number, number] = [39, 39, 42];
const BORDER: [number, number, number] = [228, 228, 231];
const ROW_ALT: [number, number, number] = [250, 250, 250];

/** Exact timestamp for receipts and audit records (includes seconds + timezone). */
export function formatExactDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

/** Same precision as formatExactDateTime, compact for data tables. */
export function formatExactDateTimeTable(value?: string | Date | null): {
  date: string;
  time: string;
} {
  if (!value) return { date: "—", time: "" };
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
  return {
    date: d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }),
  };
}

/** Two-line date/time for PDF table cells (full precision in receipts). */
function formatPdfTableDateTime(value?: string | Date | null): string {
  const parts = formatExactDateTimeTable(value);
  if (parts.time) return `${parts.date}\n${parts.time}`;
  return parts.date;
}

function sanitizePdfText(text: string): string {
  return (
    text
      .replace(/→/g, " -> ")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[^\S\n]+/g, " ")
      .trim() || "—"
  );
}

/** Word-wrap for PDF (always returns a string array; never iterate a string). */
function pdfWrapLines(
  pdf: jsPDF,
  raw: string,
  maxWidthMm: number,
  fontSize: number,
): string[] {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);
  const clean = sanitizePdfText(raw);
  const parts = clean.split("\n");
  const innerW = Math.max(maxWidthMm, 12);
  const lines = parts.flatMap((part) => {
    const wrapped = pdf.splitTextToSize(part, innerW);
    return Array.isArray(wrapped) ? wrapped : [wrapped];
  });
  return lines.map((line) => String(line));
}

function statusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === "paid") return "Payment confirmed";
  if (s === "pending") return "Awaiting confirmation";
  if (s === "failed") return "Payment unsuccessful";
  return status;
}

function actionLabel(entry: { isBaseline?: boolean; action: string }): string {
  if (entry.isBaseline) return "Baseline record";
  if (entry.action === "created") return "Fee structure created";
  if (entry.action === "updated") return "Fee structure updated";
  return entry.action;
}

type PdfWriter = {
  pdf: jsPDF;
  y: number;
  generatedAt: string;
};

let logoDataUrlCache: string | null | undefined;

async function loadLogoDataUrl(): Promise<string | null> {
  if (logoDataUrlCache !== undefined) return logoDataUrlCache;
  try {
    const res = await fetch(LOGO_PATH);
    if (!res.ok) throw new Error("logo missing");
    const blob = await res.blob();
    logoDataUrlCache = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    logoDataUrlCache = null;
  }
  return logoDataUrlCache;
}

async function newPdfWriter(): Promise<PdfWriter> {
  const { default: JsPDF } = await import("jspdf");
  return {
    pdf: new JsPDF({ unit: "mm", format: "a4" }),
    y: MARGIN,
    generatedAt: formatExactDateTime(new Date()),
  };
}

function ensureSpace(w: PdfWriter, needed: number) {
  if (w.y + needed > FOOTER_Y - 8) {
    w.pdf.addPage();
    w.y = MARGIN + 2;
    w.pdf.setFillColor(...BRAND_GREEN);
    w.pdf.rect(MARGIN, w.y, CONTENT_W, 0.6, "F");
    w.y += 5;
  }
}

async function drawBrandedHeader(
  w: PdfWriter,
  documentTitle: string,
  metaLines: string[] = [],
) {
  const logo = await loadLogoDataUrl();

  w.pdf.setFillColor(...BRAND_DARK);
  w.pdf.rect(0, 0, PAGE_W, 34, "F");

  if (logo) {
    w.pdf.addImage(logo, "PNG", MARGIN, 7, 20, 20);
  }

  w.pdf.setTextColor(255, 255, 255);
  w.pdf.setFont("helvetica", "bold");
  w.pdf.setFontSize(12);
  w.pdf.text(SCHOOL, MARGIN + (logo ? 24 : 0), 13);
  w.pdf.setFont("helvetica", "normal");
  w.pdf.setFontSize(7.5);
  w.pdf.text(REGISTRAR_LINE, MARGIN + (logo ? 24 : 0), 18.5);

  w.pdf.setFont("helvetica", "bold");
  w.pdf.setFontSize(11);
  w.pdf.text(documentTitle, PAGE_W - MARGIN, 13, { align: "right" });
  w.pdf.setFont("helvetica", "normal");
  w.pdf.setFontSize(7.5);
  w.pdf.text("Official document", PAGE_W - MARGIN, 18.5, { align: "right" });

  w.y = 40;
  w.pdf.setTextColor(...TEXT_BODY);

  w.pdf.setFillColor(...BRAND_GREEN);
  w.pdf.rect(MARGIN, w.y, CONTENT_W, 1.4, "F");
  w.y += 7;

  metaLines.forEach((line) => {
    w.pdf.setFontSize(8.5);
    w.pdf.setTextColor(...TEXT_MUTED);
    w.pdf.setFont("helvetica", "normal");
    w.pdf.text(line, MARGIN, w.y);
    w.y += 4.5;
  });
  w.y += 2;
  w.pdf.setTextColor(...TEXT_BODY);
}

function stampFooters(w: PdfWriter) {
  const total = w.pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    w.pdf.setPage(p);
    w.pdf.setDrawColor(...BORDER);
    w.pdf.line(MARGIN, FOOTER_Y - 5, PAGE_W - MARGIN, FOOTER_Y - 5);
    w.pdf.setFontSize(7);
    w.pdf.setTextColor(...TEXT_MUTED);
    w.pdf.setFont("helvetica", "normal");
    w.pdf.text(
      `${SCHOOL} · Confidential — for official use only`,
      PAGE_W / 2,
      FOOTER_Y - 1.5,
      { align: "center" },
    );
    w.pdf.text(
      `Issued ${w.generatedAt} · Page ${p} of ${total}`,
      PAGE_W / 2,
      FOOTER_Y + 2.5,
      { align: "center" },
    );
  }
}

async function savePdf(w: PdfWriter, filename: string) {
  stampFooters(w);
  w.pdf.save(filename);
}

function drawSectionTitle(w: PdfWriter, title: string) {
  ensureSpace(w, 10);
  w.pdf.setFont("helvetica", "bold");
  w.pdf.setFontSize(10);
  w.pdf.setTextColor(...BRAND_DARK);
  w.pdf.text(title.toUpperCase(), MARGIN, w.y);
  w.y += 5;
  w.pdf.setTextColor(...TEXT_BODY);
}

type KvRow =
  | { label: string; value: string; layout?: "row" }
  | { label: string; value: string; layout: "block" };

const KV_FONT_SIZE = 8.5;
const KV_LINE_STEP = 4.6;
const KV_PAD = 4;
const KV_MIN_ROW_H = 10;
const KV_HEADER_H = 8;

function kvContentHeight(lineCount: number): number {
  return Math.max(KV_MIN_ROW_H, KV_PAD + lineCount * KV_LINE_STEP + KV_PAD);
}

function kvTextBaseline(rowTop: number, lineIndex: number): number {
  return rowTop + KV_PAD + 3.2 + lineIndex * KV_LINE_STEP;
}

function drawKvTable(w: PdfWriter, rows: Array<KvRow | [string, string]>) {
  const labelW = 54;
  const pad = 2.5;

  const normalized: KvRow[] = rows.map((row) =>
    Array.isArray(row)
      ? { label: row[0], value: row[1], layout: "row" }
      : row,
  );

  normalized.forEach((row) => {
    if (row.layout === "block") {
      const valueLines = pdfWrapLines(
        w.pdf,
        row.value,
        CONTENT_W - pad * 2,
        KV_FONT_SIZE,
      );
      const bodyH = kvContentHeight(valueLines.length);
      const blockH = KV_HEADER_H + bodyH;
      ensureSpace(w, blockH + 2);

      w.pdf.setFillColor(ROW_ALT[0], ROW_ALT[1], ROW_ALT[2]);
      w.pdf.rect(MARGIN, w.y, CONTENT_W, KV_HEADER_H, "F");
      w.pdf.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
      w.pdf.rect(MARGIN, w.y, CONTENT_W, KV_HEADER_H, "S");
      w.pdf.setFont("helvetica", "bold");
      w.pdf.setFontSize(KV_FONT_SIZE);
      w.pdf.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      w.pdf.text(
        sanitizePdfText(row.label),
        MARGIN + pad,
        kvTextBaseline(w.y, 0),
      );

      const bodyTop = w.y + KV_HEADER_H;
      w.y = bodyTop;
      w.pdf.setFillColor(255, 255, 255);
      w.pdf.rect(MARGIN, w.y, CONTENT_W, bodyH, "F");
      w.pdf.rect(MARGIN, w.y, CONTENT_W, bodyH, "S");
      w.pdf.setFont("helvetica", "normal");
      w.pdf.setFontSize(KV_FONT_SIZE);
      w.pdf.setTextColor(TEXT_BODY[0], TEXT_BODY[1], TEXT_BODY[2]);
      valueLines.forEach((line, li) => {
        w.pdf.text(String(line), MARGIN + pad, kvTextBaseline(w.y, li));
      });
      w.y += bodyH + 3;
      return;
    }

    const valueLines = pdfWrapLines(
      w.pdf,
      row.value,
      CONTENT_W - labelW - pad * 2,
      KV_FONT_SIZE,
    );
    const rowH = kvContentHeight(valueLines.length);
    ensureSpace(w, rowH + 1);

    w.pdf.setFillColor(ROW_ALT[0], ROW_ALT[1], ROW_ALT[2]);
    w.pdf.rect(MARGIN, w.y, labelW, rowH, "F");
    w.pdf.setFillColor(255, 255, 255);
    w.pdf.rect(MARGIN + labelW, w.y, CONTENT_W - labelW, rowH, "F");
    w.pdf.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    w.pdf.setLineWidth(0.12);
    w.pdf.rect(MARGIN, w.y, labelW, rowH, "S");
    w.pdf.rect(MARGIN + labelW, w.y, CONTENT_W - labelW, rowH, "S");

    w.pdf.setFontSize(KV_FONT_SIZE);
    w.pdf.setFont("helvetica", "bold");
    w.pdf.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    w.pdf.text(sanitizePdfText(row.label), MARGIN + pad, kvTextBaseline(w.y, 0));

    w.pdf.setFont("helvetica", "normal");
    w.pdf.setTextColor(TEXT_BODY[0], TEXT_BODY[1], TEXT_BODY[2]);
    valueLines.forEach((line, li) => {
      w.pdf.text(String(line), MARGIN + labelW + pad, kvTextBaseline(w.y, li));
    });

    w.y += rowH;
  });
  w.y += 4;
}

type TableColumn = {
  header: string;
  width: number;
  /** Max wrapped lines in this column (default 2). */
  maxLines?: number;
};

const TABLE_LINE_STEP = 4.2;
const TABLE_CELL_PAD = 2.5;

function wrapCellLines(
  pdf: jsPDF,
  raw: string,
  widthMm: number,
  fontSize: number,
  maxLines: number,
): string[] {
  const innerW = Math.max(widthMm - TABLE_CELL_PAD * 2, 10);
  const lines = pdfWrapLines(pdf, raw, innerW, fontSize);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = last.length > 3 ? `${last.slice(0, last.length - 1)}…` : `${last}…`;
  return kept;
}

function drawCellLines(
  pdf: jsPDF,
  lines: string[],
  x: number,
  y: number,
) {
  lines.forEach((line, idx) => {
    pdf.text(
      String(line),
      x + TABLE_CELL_PAD,
      y + TABLE_CELL_PAD + 3.5 + idx * TABLE_LINE_STEP,
    );
  });
}

function drawTable(w: PdfWriter, columns: TableColumn[], data: string[][]) {
  const fontSize = 7;
  const headerH = 8;

  const drawHeader = () => {
    ensureSpace(w, headerH + 2);
    w.pdf.setFillColor(BRAND_GREEN[0], BRAND_GREEN[1], BRAND_GREEN[2]);
    w.pdf.rect(MARGIN, w.y, CONTENT_W, headerH, "F");

    let x = MARGIN;
    w.pdf.setFont("helvetica", "bold");
    w.pdf.setFontSize(fontSize);
    w.pdf.setTextColor(255, 255, 255);

    columns.forEach((col) => {
      const label = wrapCellLines(w.pdf, col.header, col.width, fontSize, 1)[0] ?? col.header;
      w.pdf.text(String(label), x + TABLE_CELL_PAD, w.y + 5.5);
      x += col.width;
    });

    w.pdf.setDrawColor(255, 255, 255);
    w.pdf.setLineWidth(0.15);
    x = MARGIN;
    columns.forEach((col, index) => {
      if (index > 0) w.pdf.line(x, w.y, x, w.y + headerH);
      x += col.width;
    });

    w.y += headerH;
  };

  drawHeader();

  data.forEach((row, rowIndex) => {
    w.pdf.setFont("helvetica", "normal");
    w.pdf.setFontSize(fontSize);

    const cellLineSets = columns.map((col, ci) =>
      wrapCellLines(
        w.pdf,
        String(row[ci] ?? "—"),
        col.width,
        fontSize,
        col.maxLines ?? 2,
      ),
    );
    const maxLines = Math.max(1, ...cellLineSets.map((lines) => lines.length));
    const rowH = TABLE_CELL_PAD * 2 + maxLines * TABLE_LINE_STEP + 2.5;

    if (w.y + rowH > FOOTER_Y - 8) {
      w.pdf.addPage();
      w.y = MARGIN + 2;
      drawHeader();
    }

    const bg =
      rowIndex % 2 === 0 ? ROW_ALT : ([255, 255, 255] as [number, number, number]);
    w.pdf.setFillColor(bg[0], bg[1], bg[2]);
    w.pdf.rect(MARGIN, w.y, CONTENT_W, rowH, "F");
    w.pdf.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    w.pdf.setLineWidth(0.12);
    w.pdf.rect(MARGIN, w.y, CONTENT_W, rowH, "S");

    let x = MARGIN;
    columns.forEach((col, ci) => {
      if (ci > 0) w.pdf.line(x, w.y, x, w.y + rowH);
      w.pdf.setTextColor(30, 30, 30);
      drawCellLines(w.pdf, cellLineSets[ci], x, w.y);
      x += col.width;
    });

    w.y += rowH;
  });

  w.y += 5;
}

function drawAmountHighlight(w: PdfWriter, label: string, amount: string, statusText: string) {
  ensureSpace(w, 28);
  w.pdf.setDrawColor(...BRAND_GREEN);
  w.pdf.setLineWidth(0.4);
  w.pdf.roundedRect(MARGIN, w.y, CONTENT_W, 24, 2, 2, "D");
  w.pdf.setFont("helvetica", "normal");
  w.pdf.setFontSize(9);
  w.pdf.setTextColor(...TEXT_MUTED);
  w.pdf.text(label, MARGIN + 6, w.y + 8);
  w.pdf.setFont("helvetica", "bold");
  w.pdf.setFontSize(20);
  w.pdf.setTextColor(...BRAND_DARK);
  w.pdf.text(amount, MARGIN + 6, w.y + 17);
  w.pdf.setFont("helvetica", "bold");
  w.pdf.setFontSize(9);
  w.pdf.setTextColor(...BRAND_GREEN);
  w.pdf.text(statusText, PAGE_W - MARGIN - 6, w.y + 17, { align: "right" });
  w.y += 30;
}

function drawDisclaimer(w: PdfWriter, text: string) {
  ensureSpace(w, 14);
  w.pdf.setFillColor(245, 245, 244);
  w.pdf.setDrawColor(...BORDER);
  const lines = w.pdf.splitTextToSize(text, CONTENT_W - 8) as string[];
  const boxH = lines.length * 4 + 8;
  w.pdf.roundedRect(MARGIN, w.y, CONTENT_W, boxH, 1.5, 1.5, "FD");
  w.pdf.setFontSize(7.5);
  w.pdf.setTextColor(...TEXT_MUTED);
  w.pdf.setFont("helvetica", "italic");
  w.pdf.text(lines, MARGIN + 4, w.y + 6);
  w.y += boxH + 4;
  w.pdf.setFont("helvetica", "normal");
}

export type PaymentReceiptData = {
  reference: string;
  status: string;
  amount: number;
  baseCurrencyCode?: string;
  originalAmount?: number;
  originalCurrencyCode?: string;
  exchangeRateToBase?: number;
  methodLabel?: string;
  channelLabel?: string;
  notes?: string;
  initiatedAt?: string;
  payedAt?: string;
  createdAt?: string;
  payer: {
    name: string;
    nationalId?: string;
    email?: string;
    phone?: string;
  };
};

export async function downloadPaymentReceiptPdf(row: PaymentReceiptData) {
  const w = await newPdfWriter();
  await drawBrandedHeader(w, "Payment receipt", [
    `Transaction reference: ${row.reference}`,
    `Document issued: ${w.generatedAt}`,
  ]);

  const base = row.baseCurrencyCode ?? "USD";
  drawAmountHighlight(
    w,
    "Amount (base ledger)",
    `${base} ${row.amount.toFixed(2)}`,
    statusLabel(row.status),
  );

  drawSectionTitle(w, "Payer information");
  drawKvTable(w, [
    ["Full name", row.payer.name],
    ["National ID", row.payer.nationalId || "—"],
    ["Email address", row.payer.email || "—"],
    ["Contact number", row.payer.phone || "—"],
  ]);

  drawSectionTitle(w, "Transaction details");
  const fxRows: [string, string][] = [];
  if (
    row.originalCurrencyCode &&
    row.originalAmount != null &&
    row.originalCurrencyCode !== base
  ) {
    fxRows.push([
      "Amount received (original)",
      `${row.originalCurrencyCode} ${row.originalAmount.toFixed(2)}`,
    ]);
    if (row.exchangeRateToBase != null) {
      fxRows.push([
        "Exchange rate (at recording)",
        `1 ${row.originalCurrencyCode} = ${row.exchangeRateToBase} ${base}`,
      ]);
    }
  }
  drawKvTable(w, [
    ...fxRows,
    ["Payment method", row.methodLabel || "Not recorded"],
    ["Payment channel", row.channelLabel || "Not recorded"],
    ["Initiated at", formatExactDateTime(row.initiatedAt || row.createdAt)],
    ["Confirmed paid at", formatExactDateTime(row.payedAt)],
    ["Recorded in system", formatExactDateTime(row.createdAt)],
    ["Processing status", statusLabel(row.status)],
    ...(row.notes ? [["Notes", row.notes] as [string, string]] : []),
  ]);

  drawDisclaimer(
    w,
    "This receipt is generated by the Chitepo School of Ideology registrations system and reflects Paynow payment activity associated with the reference above. It is intended for finance reconciliation and student records. For billing enquiries, contact the Office of the Registrar.",
  );

  await savePdf(w, `Receipt_${row.reference}.pdf`);
}

export type FeeAuditEntryData = {
  _id: string;
  isBaseline?: boolean;
  action: string;
  effectiveAt: string;
  createdAt: string;
  performedByEmail?: string;
  note?: string;
  mandatoryTotalBefore: number;
  mandatoryTotalAfter: number;
  enrollmentsBillingSynced: number;
  detailsText: string;
  snapshot: {
    name: string;
    amount: number;
    currency: string;
    isMandatory: boolean;
    description?: string;
  };
  previousSnapshot?: {
    name: string;
    amount: number;
    currency: string;
    isMandatory: boolean;
  };
};

export async function downloadFeeAuditEntryPdf(entry: FeeAuditEntryData) {
  const w = await newPdfWriter();
  const prev = entry.previousSnapshot;
  const safeName = entry.snapshot.name.replace(/[^\w.-]+/g, "_").slice(0, 40);

  await drawBrandedHeader(w, "Fee audit certificate", [
    `Record reference: ${entry._id}`,
    `Document issued: ${w.generatedAt}`,
  ]);

  drawSectionTitle(w, "Audit summary");
  drawKvTable(w, [
    ["Event type", actionLabel(entry)],
    ["Effective date & time", formatExactDateTime(entry.effectiveAt)],
    ["Logged in system at", formatExactDateTime(entry.createdAt)],
    ["Authorised by", entry.performedByEmail || "System"],
    { label: "Narrative", value: entry.detailsText, layout: "block" },
    { label: "Officer note", value: entry.note || "—", layout: "block" },
  ]);

  drawSectionTitle(w, "Fee structure (current)");
  drawKvTable(w, [
    ["Fee name", entry.snapshot.name],
    [
      "Amount",
      `${entry.snapshot.currency} ${entry.snapshot.amount.toFixed(2)}`,
    ],
    ["Classification", entry.snapshot.isMandatory ? "Mandatory fee" : "Optional fee"],
    {
      label: "Description",
      value: entry.snapshot.description || "—",
      layout: "block",
    },
  ]);

  if (prev) {
    drawSectionTitle(w, "Previous fee structure");
    drawKvTable(w, [
      ["Fee name", prev.name],
      ["Amount", `${prev.currency} ${prev.amount.toFixed(2)}`],
      ["Classification", prev.isMandatory ? "Mandatory fee" : "Optional fee"],
    ]);
  }

  drawSectionTitle(w, "Billing impact");
  drawKvTable(w, [
    [
      "Mandatory fee total (before)",
      `USD ${entry.mandatoryTotalBefore.toFixed(2)}`,
    ],
    [
      "Mandatory fee total (after)",
      `USD ${entry.mandatoryTotalAfter.toFixed(2)}`,
    ],
    [
      "Enrollments billing updated",
      String(entry.enrollmentsBillingSynced),
    ],
  ]);

  drawDisclaimer(
    w,
    "This fee audit certificate documents a change to the official fee schedule maintained by the Office of the Registrar. Mandatory fee totals may trigger automatic updates to accepted and registered student billing records.",
  );

  await savePdf(w, `Fee_audit_${safeName}.pdf`);
}

export async function downloadFeeAuditReportPdf(
  entries: FeeAuditEntryData[],
  mandatoryTotal: number,
  filterNote?: string,
) {
  const w = await newPdfWriter();
  const meta = [
    filterNote ? `Filter: ${filterNote}` : "Filter: All records",
    `Current mandatory fee total: USD ${mandatoryTotal.toFixed(2)}`,
    `Entries in report: ${entries.length}`,
    `Document issued: ${w.generatedAt}`,
  ];
  await drawBrandedHeader(w, "Fee audit trail register", meta);

  drawTable(
    w,
    [
      { header: "#", width: 7, maxLines: 1 },
      { header: "Effective", width: 28, maxLines: 2 },
      { header: "Event", width: 22, maxLines: 2 },
      { header: "Description", width: 62, maxLines: 5 },
      { header: "Mandatory total", width: 26, maxLines: 2 },
      { header: "Sync", width: 9, maxLines: 1 },
      { header: "Author", width: CONTENT_W - 154, maxLines: 2 },
    ],
    entries.map((entry, i) => [
      String(i + 1),
      formatPdfTableDateTime(entry.effectiveAt || entry.createdAt),
      actionLabel(entry),
      entry.detailsText,
      `USD ${entry.mandatoryTotalBefore.toFixed(2)} -> ${entry.mandatoryTotalAfter.toFixed(2)}`,
      String(entry.enrollmentsBillingSynced),
      entry.performedByEmail || "—",
    ]),
  );

  drawDisclaimer(
    w,
    "Register of fee schedule amendments for Chitepo School of Ideology. Retain for audit, finance review, and regulatory reporting as required by institutional policy.",
  );

  await savePdf(w, `Fee_audit_trail_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function downloadPaymentHistoryReportPdf(
  rows: PaymentReceiptData[],
  summary: { totalRecords: number; totalPaidAmount: number },
  filterNote?: string,
) {
  const w = await newPdfWriter();
  const meta = [
    filterNote ? `Filter: ${filterNote}` : "Filter: Current view",
    `Rows in this document: ${rows.length} · Matching records: ${summary.totalRecords}`,
    `Confirmed paid (filtered): USD ${summary.totalPaidAmount.toFixed(2)}`,
    `Document issued: ${w.generatedAt}`,
  ];
  await drawBrandedHeader(w, "Payment history register", meta);

  drawTable(
    w,
    [
      { header: "Reference", width: 26, maxLines: 2 },
      { header: "Date & time", width: 28, maxLines: 2 },
      { header: "Payer", width: 30, maxLines: 2 },
      { header: "National ID", width: 22, maxLines: 1 },
      { header: "Method", width: 20, maxLines: 2 },
      { header: "Amount", width: 18, maxLines: 1 },
      { header: "Status", width: CONTENT_W - 144, maxLines: 2 },
    ],
    rows.map((row) => [
      row.reference,
      formatPdfTableDateTime(row.payedAt || row.initiatedAt || row.createdAt),
      row.payer.name,
      row.payer.nationalId || "—",
      row.methodLabel || "—",
      row.originalCurrencyCode &&
      row.originalAmount != null &&
      row.originalCurrencyCode !== (row.baseCurrencyCode ?? "USD")
        ? `${row.baseCurrencyCode ?? "USD"} ${row.amount.toFixed(2)} (${row.originalCurrencyCode} ${row.originalAmount.toFixed(2)})`
        : `${row.baseCurrencyCode ?? "USD"} ${row.amount.toFixed(2)}`,
      statusLabel(row.status),
    ]),
  );

  drawDisclaimer(
    w,
    "Payment history register generated from the institutional Paynow integration. Amounts and timestamps reflect system records at the time of export. Use individual payment receipts for payer-specific confirmation.",
  );

  await savePdf(w, `Payment_history_${new Date().toISOString().slice(0, 10)}.pdf`);
}
