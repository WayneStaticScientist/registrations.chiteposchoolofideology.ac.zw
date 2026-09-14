"use client";

import React, { useState, useEffect } from 'react';
import { CertificateTemplate } from './CertificateTemplate';

interface CertificateOfferModalProps {
  enrollmentId: string;
  studentName: string;
  onClose: () => void;
}

interface PerformanceData {
  averageScore: string;
  completedQuizzes: number;
  totalScore: number;
  totalQuestions: number;
}

export const CertificateOfferModal: React.FC<CertificateOfferModalProps> = ({
  enrollmentId,
  studentName,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [offering, setOffering] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await fetch(`http://localhost:9991/api/v1/certificates/performance/${enrollmentId}`);
        if (res.ok) {
          const data = await res.json();
          setPerformance(data);
        }
      } catch (err) {
        console.error('Failed to fetch performance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [enrollmentId]);

  const handleOfferCertificate = async () => {
    setOffering(true);
    try {
      // 1. Tell backend to create/fetch the Certificate model
      const res = await fetch(`http://localhost:9991/api/v1/certificates/offer/${enrollmentId}`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('Failed to generate certificate on backend');
      
      const cert = await res.json();
      setCertificateData(cert);

      // 2. We use setTimeout to allow React to render the hidden CertificateTemplate with new data
      setTimeout(async () => {
        try {
          const element = document.getElementById('certificate-template');
          if (!element) {
            console.error('Certificate template element not found');
            setOffering(false);
            alert('Failed to find certificate template');
            return;
          }

          // Dynamically import libraries to avoid SSR issues
          const { toPng } = await import('html-to-image');
          const jsPDF = (await import('jspdf')).default;

          // Capture the DOM node as a high-quality PNG
          const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2 });
          
          // Create a PDF and embed the image
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1123, 794]
          });

          pdf.addImage(dataUrl, 'PNG', 0, 0, 1123, 794);
          pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
          
          setOffering(false);
          onClose(); // Auto close after download
        } catch (err) {
          console.error('PDF Generation Error:', err);
          setOffering(false);
          alert('An error occurred while saving the PDF. Please try again.');
        }
      }, 1000); // Wait 1 second to ensure React fully renders the template

    } catch (error) {
      console.error(error);
      alert('Error offering certificate.');
      setOffering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-900">Offer Certificate</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            ✕
          </button>
        </div>

        <div className="p-6">
          <p className="text-zinc-600 mb-4">
            You are about to generate and offer a graduation certificate to <strong className="text-zinc-900">{studentName}</strong>.
          </p>

          <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 mb-6">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Academic Performance</h3>
            {loading ? (
              <p className="text-zinc-500 animate-pulse">Loading grades...</p>
            ) : performance ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Completed Quizzes</span>
                  <span className="font-bold text-emerald-700">{performance.completedQuizzes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Average Score</span>
                  <span className="font-bold text-emerald-700">{performance.averageScore}%</span>
                </div>
              </div>
            ) : (
              <p className="text-red-500">Could not load performance data.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleOfferCertificate}
              disabled={offering || loading || !performance}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
            >
              {offering ? 'Generating PDF...' : 'Offer & Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Certificate Template for PDF generation */}
      {certificateData && (
        <CertificateTemplate 
          studentName={studentName}
          issueDate={certificateData.issueDate}
          certificateId={certificateData.certificateId}
          performanceSummary={certificateData.performanceSummary}
        />
      )}
    </div>
  );
};
