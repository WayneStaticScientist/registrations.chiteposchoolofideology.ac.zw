import { QRCodeCanvas } from 'qrcode.react';

interface CertificateTemplateProps {
  studentName: string;
  issueDate: string;
  certificateId: string;
  performanceSummary: string;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  studentName,
  issueDate,
  certificateId,
  performanceSummary,
}) => {
  const qrData = `Chitepo School of Ideology\nStudent: ${studentName}\nCertificate ID: ${certificateId}\nIssued: ${new Date(issueDate).toLocaleDateString()}`;

  return (
    <div className="fixed top-[200vh] left-[200vw] opacity-0 pointer-events-none">
      <div
        id="certificate-template"
        className="bg-white text-zinc-900 relative"
        style={{ width: '1123px', height: '794px', padding: '40px', boxSizing: 'border-box' }}
      >
        <div className="w-full h-full border-[12px] border-emerald-700 p-2 relative">
          <div className="w-full h-full border-[4px] border-emerald-600/50 flex flex-col items-center justify-center p-12 bg-emerald-50/20 text-center relative overflow-hidden">
          
          {/* Background watermark/accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 w-[600px] h-[600px] rounded-full border-[40px] border-emerald-800" />

          {/* Header */}
          <h1 className="text-5xl font-black text-emerald-900 tracking-wider uppercase mb-2">
            Chitepo School of Ideology
          </h1>
          <div className="w-32 h-1 bg-emerald-600 mb-8" />
          
          <h2 className="text-3xl font-serif italic text-zinc-600 mb-10">
            Certificate of Achievement
          </h2>

          <p className="text-lg text-zinc-500 mb-4 uppercase tracking-widest">
            This is to certify that
          </p>

          <h3 className="text-5xl font-bold text-emerald-800 mb-8 border-b-2 border-emerald-200 pb-2 px-12">
            {studentName}
          </h3>

          <p className="text-xl text-zinc-700 max-w-2xl leading-relaxed mb-10">
            has successfully completed the foundational ideological orientation program, demonstrating commendable dedication to the principles of national development, sovereignty, and servant leadership.
          </p>

          <div className="bg-emerald-100/50 p-6 rounded-lg mb-10 border border-emerald-200">
            <p className="text-lg font-medium text-emerald-900">
              {performanceSummary}
            </p>
          </div>

          <div className="flex justify-between items-end w-full px-20 mt-auto">
            <div className="flex flex-col items-center">
              <div className="w-48 h-px bg-zinc-400 mb-2" />
              <p className="text-sm font-bold text-zinc-800">Date of Issue</p>
              <p className="text-sm text-zinc-600">{new Date(issueDate).toLocaleDateString()}</p>
            </div>

            <div className="flex flex-col items-center">
              <QRCodeCanvas value={qrData} size={100} fgColor="#065f46" />
              <p className="text-xs font-bold text-zinc-600 mt-2">Verify</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-48 h-px bg-zinc-400 mb-2" />
              <p className="text-sm font-bold text-zinc-800">Certificate ID</p>
              <p className="text-sm text-zinc-600">{certificateId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
