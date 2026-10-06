import { QRCodeCanvas } from "qrcode.react";

interface CertificateTemplateProps {
  studentName: string;
  issueDate: string;
  certificateId: string;
  performanceSummary: string;
  templateId?: string;
  variant?: "export" | "preview";
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  studentName,
  issueDate,
  certificateId,
  performanceSummary,
  templateId = "certificate-template",
  variant = "export",
}) => {
  const qrData = `Chitepo School of Ideology\nStudent: ${studentName}\nCertificate ID: ${certificateId}\nIssued: ${new Date(issueDate).toLocaleDateString()}`;

  const outerClass =
    variant === "preview"
      ? "relative"
      : "fixed top-[200vh] left-[200vw] opacity-0 pointer-events-none";

  return (
    <div className={outerClass}>
      <div
        id={templateId}
        className="relative bg-white text-zinc-900"
        style={{ width: "1123px", height: "794px", padding: "40px", boxSizing: "border-box" }}
      >
        <div className="relative h-full w-full border-[12px] border-emerald-700 p-2">
          <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border-[4px] border-emerald-600/50 bg-emerald-50/20 p-12 text-center">
            <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[40px] border-emerald-800 opacity-5" />

            <h1 className="mb-2 text-5xl font-black tracking-wider text-emerald-900 uppercase">
              Chitepo School of Ideology
            </h1>
            <div className="mb-8 h-1 w-32 bg-emerald-600" />

            <h2 className="mb-10 font-serif text-3xl text-zinc-600 italic">
              Certificate of Achievement
            </h2>

            <p className="mb-4 text-lg tracking-widest text-zinc-500 uppercase">
              This is to certify that
            </p>

            <h3 className="mb-8 border-b-2 border-emerald-200 px-12 pb-2 text-5xl font-bold text-emerald-800">
              {studentName}
            </h3>

            <p className="mb-10 max-w-2xl text-xl leading-relaxed text-zinc-700">
              has successfully completed the foundational ideological orientation
              programme, demonstrating commendable dedication to the principles of
              national development, sovereignty, and servant leadership.
            </p>

            <div className="mb-10 rounded-lg border border-emerald-200 bg-emerald-100/50 p-6">
              <p className="text-lg font-medium text-emerald-900">{performanceSummary}</p>
            </div>

            <div className="mt-auto flex w-full items-end justify-between px-20">
              <div className="flex flex-col items-center">
                <div className="mb-2 h-px w-48 bg-zinc-400" />
                <p className="text-sm font-bold text-zinc-800">Date of Issue</p>
                <p className="text-sm text-zinc-600">
                  {new Date(issueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <QRCodeCanvas value={qrData} size={100} fgColor="#065f46" />
                <p className="mt-2 text-xs font-bold text-zinc-600">Verify</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-2 h-px w-48 bg-zinc-400" />
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
