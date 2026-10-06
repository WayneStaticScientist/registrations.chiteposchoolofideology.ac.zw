"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Award, Download, Eye, EyeOff, Loader2 } from "lucide-react";

import { CertificateTemplate } from "@/components/CertificateTemplate";
import api from "@/services/api";

type CertRecord = {
  certificateId: string;
  issueDate: string;
  performanceSummary?: string;
};

type Performance = {
  averageScore: string;
  completedQuizzes: number;
  hasStudentAccount?: boolean;
};

export function CertificatePanel({
  enrollmentId,
  studentName,
  initialCertificate,
  initialPerformance,
  onIssued,
}: {
  enrollmentId: string;
  studentName: string;
  initialCertificate?: CertRecord | null;
  initialPerformance?: Performance | null;
  onIssued?: (cert: CertRecord) => void;
}) {
  const [performance, setPerformance] = useState<Performance | null>(
    initialPerformance ?? null,
  );
  const [certificate, setCertificate] = useState<CertRecord | null>(
    initialCertificate ?? null,
  );
  const [loading, setLoading] = useState(!initialPerformance);
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfCert, setPdfCert] = useState<CertRecord | null>(null);

  useEffect(() => {
    if (initialPerformance) return;
    const load = async () => {
      try {
        const perfRes = await api.get(`/certificates/performance/${enrollmentId}`);
        setPerformance(perfRes.data);
      } catch {
        setPerformance(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [enrollmentId, initialPerformance]);

  useEffect(() => {
    if (initialCertificate !== undefined) {
      setCertificate(initialCertificate);
    }
  }, [initialCertificate]);

  const downloadPdf = useCallback(async (cert: CertRecord) => {
    setPdfCert(cert);
    await new Promise((r) => setTimeout(r, 400));
    const element = document.getElementById(`certificate-template-${enrollmentId}`);
    if (!element) {
      alert("Could not render certificate preview.");
      return;
    }
    const { toPng } = await import("html-to-image");
    const jsPDF = (await import("jspdf")).default;
    const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2 });
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1123, 794],
    });
    pdf.addImage(dataUrl, "PNG", 0, 0, 1123, 794);
    pdf.save(`${studentName.replace(/\s+/g, "_")}_Certificate.pdf`);
    setPdfCert(null);
  }, [enrollmentId, studentName]);

  const handleIssueOrView = async () => {
    if (certificate) {
      setShowPreview((v) => !v);
      return;
    }

    setBusy(true);
    try {
      const res = await api.post(`/certificates/offer/${enrollmentId}`);
      const cert: CertRecord = {
        certificateId: res.data.certificateId,
        issueDate: res.data.issueDate ?? new Date().toISOString(),
        performanceSummary: res.data.performanceSummary,
      };
      setCertificate(cert);
      onIssued?.(cert);
      setShowPreview(true);
    } catch {
      alert("Could not issue certificate. Ensure the student has a registered account.");
    } finally {
      setBusy(false);
    }
  };

  const issued = Boolean(certificate);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award size={22} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Certification</h3>
            <p className="text-xs text-slate-500">
              {issued
                ? "Certificate on file for this student."
                : "Issue when the student has completed programme requirements."}
            </p>
          </div>
        </div>
        {issued && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
            Issued
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
        {loading ? (
          <p className="col-span-2 flex items-center gap-2 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading academic summary…
          </p>
        ) : performance ? (
          <>
            <div>
              <p className="text-slate-500">Completed quizzes</p>
              <p className="text-lg font-bold text-slate-800">
                {performance.completedQuizzes}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Average score</p>
              <p className="text-lg font-bold text-primary">{performance.averageScore}%</p>
            </div>
          </>
        ) : (
          <p className="col-span-2 text-slate-500">Academic data unavailable.</p>
        )}
        {issued && certificate && (
          <>
            <div className="sm:col-span-2">
              <p className="text-slate-500">Certificate ID</p>
              <p className="font-mono text-sm font-semibold text-primary">
                {certificate.certificateId}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-slate-500">Issue date</p>
              <p className="font-medium text-slate-800">
                {new Date(certificate.issueDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || loading}
          onClick={() => void handleIssueOrView()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : issued ? (
            showPreview ? <EyeOff size={18} /> : <Eye size={18} />
          ) : (
            <Award size={18} />
          )}
          {issued ? (showPreview ? "Hide certificate" : "View certificate") : "Issue certificate"}
        </button>
        {issued && certificate && (
          <button
            type="button"
            onClick={() => void downloadPdf(certificate)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download size={18} />
            Download PDF
          </button>
        )}
      </div>

      {showPreview && certificate && (
        <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white p-4">
          <div className="mx-auto origin-top scale-[0.45] sm:scale-[0.55]">
            <CertificateTemplate
              variant="preview"
              certificateId={certificate.certificateId}
              issueDate={certificate.issueDate}
              performanceSummary={certificate.performanceSummary ?? ""}
              studentName={studentName}
              templateId={`certificate-preview-${enrollmentId}`}
            />
          </div>
        </div>
      )}

      {pdfCert && (
        <div className="fixed top-[200vh] left-[200vw] opacity-0 pointer-events-none">
          <CertificateTemplate
            certificateId={pdfCert.certificateId}
            issueDate={pdfCert.issueDate}
            performanceSummary={pdfCert.performanceSummary ?? ""}
            studentName={studentName}
            templateId={`certificate-template-${enrollmentId}`}
            variant="export"
          />
        </div>
      )}
    </section>
  );
}
