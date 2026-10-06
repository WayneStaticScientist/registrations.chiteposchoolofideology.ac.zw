"use client";

import { Download, Eye, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { CertificateTemplate } from "@/components/CertificateTemplate";
import { downloadCertificatePdf } from "@/lib/certificate-export";

export type IssuedCertificateData = {
  certificateId: string;
  issueDate: string;
  performanceSummary?: string;
};

export function IssuedCertificateActions({
  templateKey,
  studentName,
  certificate,
}: {
  templateKey: string;
  studentName: string;
  certificate: IssuedCertificateData;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [pdfRender, setPdfRender] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const exportTemplateId = `certificate-template-${templateKey}`;
  const previewTemplateId = `certificate-preview-${templateKey}`;
  const safeFileName = `${studentName.replace(/\s+/g, "_") || "Certificate"}_Certificate.pdf`;

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setPdfRender(true);
    try {
      await downloadCertificatePdf({
        templateId: exportTemplateId,
        fileName: safeFileName,
      });
    } catch {
      alert("Could not generate PDF. Please try again.");
    } finally {
      setPdfRender(false);
      setDownloading(false);
    }
  }, [exportTemplateId, safeFileName]);

  const summary = certificate.performanceSummary ?? "";

  useEffect(() => {
    if (!viewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewOpen]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setViewOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <Eye size={14} />
          View
        </button>
        <button
          type="button"
          disabled={downloading}
          onClick={() => void handleDownload()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download size={14} />
          )}
          PDF
        </button>
      </div>

      {viewOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close certificate preview"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setViewOpen(false)}
          />
          <div
            className="relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`cert-view-title-${templateKey}`}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2
                  id={`cert-view-title-${templateKey}`}
                  className="truncate text-lg font-bold text-slate-800"
                >
                  {studentName}
                </h2>
                <p className="truncate font-mono text-xs text-primary">
                  {certificate.certificateId}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => void handleDownload()}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-100/80 p-4">
              <div className="mx-auto w-fit origin-top scale-[0.38] sm:scale-[0.48] md:scale-[0.55]">
                <CertificateTemplate
                  variant="preview"
                  certificateId={certificate.certificateId}
                  issueDate={certificate.issueDate}
                  performanceSummary={summary}
                  studentName={studentName}
                  templateId={previewTemplateId}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {pdfRender && (
        <div className="fixed top-[200vh] left-[200vw] pointer-events-none opacity-0">
          <CertificateTemplate
            variant="export"
            certificateId={certificate.certificateId}
            issueDate={certificate.issueDate}
            performanceSummary={summary}
            studentName={studentName}
            templateId={exportTemplateId}
          />
        </div>
      )}
    </>
  );
}
