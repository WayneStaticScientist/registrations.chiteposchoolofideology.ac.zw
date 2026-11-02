"use client";

import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export interface CertificateTemplateProps {
  studentName: string;
  issueDate: string;
  certificateId: string;
  performanceSummary?: string;
  courseName?: string;
  certificateType?: string;
  heldAt?: string;
  showQrCode?: boolean;
  templateId?: string;
  variant?: "export" | "preview";
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  studentName,
  issueDate,
  certificateId,
  performanceSummary,
  courseName = "BASIC ORIENTATION COURSE",
  certificateType = "ATTENDANCE",
  heldAt = "Harare Campus",
  showQrCode = false,
  templateId = "certificate-template",
  variant = "export",
}) => {
  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(issueDate);
      if (Number.isNaN(d.getTime())) return issueDate;
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return issueDate;
    }
  }, [issueDate]);

  const qrData = `Chitepo School of Ideology | Certificate of ${certificateType}\nStudent: ${studentName}\nID: ${certificateId}\nIssued: ${formattedDate}`;

  const outerClass =
    variant === "preview"
      ? "relative select-none"
      : "fixed top-[200vh] left-[200vw] opacity-0 pointer-events-none";

  return (
    <div className={outerClass}>
      <div
        id={templateId}
        className="relative overflow-hidden bg-white text-zinc-900"
        style={{
          width: "1123px",
          height: "794px",
          boxSizing: "border-box",
          fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
        }}
      >
        {/* =========================================================================
            LAYER 1: BORDERS & 4-CORNER ZIMBABWE FLAG CHEVRONS (PURE SVG)
        ========================================================================= */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none z-10"
          viewBox="0 0 1123 794"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Zimbabwe Flag 7-stripe corner diagonal cluster: s = x + y */}
            <g id="corner-flag-cluster">
              <polygon points="0,0 38,0 0,38" fill="#01512a" />
              <polygon points="38,0 54,0 0,54 0,38" fill="#f6c90a" />
              <polygon points="54,0 72,0 0,72 0,54" fill="#e3001b" />
              <polygon points="72,0 90,0 0,90 0,72" fill="#000000" />
              <polygon points="90,0 100,0 0,100 0,90" fill="#e3001b" />
              <polygon points="100,0 108,0 0,108 0,100" fill="#f6c90a" />
              <polygon points="108,0 116,0 0,116 0,108" fill="#01512a" />
            </g>

            {/* Detailed 2-tone pointed laurel leaf definition with seamless root joint */}
            <g id="laurel-leaf-pair">
              {/* Root joint that blends with the stem */}
              <circle cx="0" cy="0" r="3.5" fill="#adc4b4" />

              {/* Left Leaf: angled outward-left at -32 deg */}
              <g transform="rotate(-32)">
                <path d="M 0,0 C -12,-20 -24,-48 0,-76 C -5,-52 -4,-25 0,0 Z" fill="#b2c8b6" />
                <path d="M 0,0 C 12,-20 24,-48 0,-76 C 5,-52 4,-25 0,0 Z" fill="#d2e4d8" />
                <line x1="0" y1="0" x2="0" y2="-76" stroke="#9bb4a2" strokeWidth="1.2" />
              </g>

              {/* Right Leaf: angled outward-right at +32 deg */}
              <g transform="rotate(32)">
                <path d="M 0,0 C -12,-20 -24,-48 0,-76 C -5,-52 -4,-25 0,0 Z" fill="#b2c8b6" />
                <path d="M 0,0 C 12,-20 24,-48 0,-76 C 5,-52 4,-25 0,0 Z" fill="#d2e4d8" />
                <line x1="0" y1="0" x2="0" y2="-76" stroke="#9bb4a2" strokeWidth="1.2" />
              </g>

              {/* Center Upward Bud/Leaf */}
              <g transform="scale(0.78) translate(0, -14)">
                <path d="M 0,0 C -9,-16 -18,-38 0,-58 C -4,-39 -3,-19 0,0 Z" fill="#b2c8b6" />
                <path d="M 0,0 C 9,-16 18,-38 0,-58 C 4,-39 3,-19 0,0 Z" fill="#d2e4d8" />
                <line x1="0" y1="0" x2="0" y2="-58" stroke="#9bb4a2" strokeWidth="1" />
              </g>
            </g>

            {/* Complete Left Laurel Branch: 100% Mathematically Rooted to the Bezier Spine */}
            <g id="laurel-left-branch" opacity="0.92">
              {/* Continuous central stem (Exact cubic bezier) */}
              <path
                d="M 495,650 C 330,640 195,490 202,330 C 208,195 285,128 400,108"
                fill="none"
                stroke="#adc4b4"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Nodes mathematically evaluated on the exact same curve and tangent */}
              <g transform="translate(495, 650) rotate(-86.5)"><use href="#laurel-leaf-pair" transform="scale(0.85)" /></g>
              <g transform="translate(408.6, 631.4) rotate(-69.4)"><use href="#laurel-leaf-pair" transform="scale(0.90)" /></g>
              <g transform="translate(332.3, 589.8) rotate(-53.6)"><use href="#laurel-leaf-pair" transform="scale(0.95)" /></g>
              <g transform="translate(270, 529.8) rotate(-38.6)"><use href="#laurel-leaf-pair" transform="scale(1.00)" /></g>
              <g transform="translate(225.7, 456) rotate(-23.2)"><use href="#laurel-leaf-pair" transform="scale(1.04)" /></g>
              <g transform="translate(203.5, 373.3) rotate(-6.5)"><use href="#laurel-leaf-pair" transform="scale(1.06)" /></g>
              <g transform="translate(210.8, 268.1) rotate(14.3)"><use href="#laurel-leaf-pair" transform="scale(1.05)" /></g>
              <g transform="translate(230.4, 216.9) rotate(28.4)"><use href="#laurel-leaf-pair" transform="scale(1.02)" /></g>
              <g transform="translate(260.1, 175.9) rotate(43.6)"><use href="#laurel-leaf-pair" transform="scale(0.98)" /></g>
              <g transform="translate(298.9, 144.4) rotate(58)"><use href="#laurel-leaf-pair" transform="scale(0.92)" /></g>
              <g transform="translate(345.8, 122) rotate(70.3)"><use href="#laurel-leaf-pair" transform="scale(0.86)" /></g>
              <g transform="translate(400, 108) rotate(80.1)"><use href="#laurel-leaf-pair" transform="scale(0.80)" /></g>
            </g>
          </defs>

          {/* 1. Outer Solid Green Band (13px along all edges) */}
          <rect x="0" y="0" width="1123" height="794" fill="none" stroke="#01512a" strokeWidth="26" />

          {/* 2. Four Zimbabwe Flag Corner Chevron Stripes */}
          <use href="#corner-flag-cluster" />
          <use href="#corner-flag-cluster" transform="translate(1123, 0) scale(-1, 1)" />
          <use href="#corner-flag-cluster" transform="translate(0, 794) scale(1, -1)" />
          <use href="#corner-flag-cluster" transform="translate(1123, 794) scale(-1, -1)" />

          {/* 3. Chamfered Gold Border (8-sided polygon with 45 deg corners) */}
          <polygon
            points="102,20 1021,20 1103,102 1103,692 1021,774 102,774 20,692 20,102"
            fill="none"
            stroke="#e5a00d"
            strokeWidth="2.5"
          />

          {/* 4. Laurel Garland (Left and Mirrored Right) */}
          <use href="#laurel-left-branch" />
          <use href="#laurel-left-branch" transform="translate(1123, 0) scale(-1, 1)" />
        </svg>

        {/* =========================================================================
            LAYER 2: CERTIFICATE INNER CONTENT
        ========================================================================= */}
        <div className="relative z-20 flex h-full w-full flex-col justify-between px-[54px] pt-[30px] pb-[22px]">
          {/* TOP HEADER SECTION */}
          <div>
            <div className="flex items-center justify-between px-2">
              {/* Left: ZANU PF Emblem */}
              <div className="flex h-[86px] w-32 items-center justify-center">
                <img
                  src="/zanu_pf_emblem.png"
                  alt="ZANU PF Emblem"
                  className="h-[82px] w-auto object-contain"
                />
              </div>

              {/* Center: Chitepo School Header & Flag Divider with Star */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <h1
                  className="text-[34px] font-black tracking-[0.04em] uppercase text-[#b91c1c] whitespace-nowrap"
                  style={{
                    fontFamily:
                      "'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif",
                  }}
                >
                  Chitepo School of Ideology
                </h1>

                {/* Decorative Flag Stripe Divider with Center Gold Star */}
                <div className="mt-1 flex items-center justify-center gap-2">
                  <div className="h-[3px] w-44 rounded-full bg-gradient-to-r from-[#008738] via-[#FFCE00] via-[#D4121A] to-[#000000]" />
                  <svg
                    className="h-4.5 w-4.5 text-[#f59e0b] drop-shadow-xs"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <div className="h-[3px] w-44 rounded-full bg-gradient-to-r from-[#000000] via-[#D4121A] via-[#FFCE00] to-[#008738]" />
                </div>
              </div>

              {/* Right: Chitepo School Official Emblem */}
              <div className="flex h-[86px] w-32 items-center justify-center">
                <img
                  src="/apple-touch-icon.png"
                  alt="Chitepo School Crest"
                  className="h-[86px] w-auto object-contain"
                />
              </div>
            </div>

            {/* MAIN TITLE STACK: CERTIFICATE OF ATTENDANCE */}
            <div className="mt-1 text-center">
              <h2
                className="text-[52px] font-black tracking-[0.06em] text-[#083a22] uppercase leading-none"
                style={{
                  fontFamily:
                    "'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif",
                }}
              >
                Certificate
              </h2>

              {/* Elegant Cursive "of" with Horizontal Rules */}
              <div className="mx-auto -mt-1 flex w-76 items-center justify-center gap-3">
                <div className="h-[1.5px] flex-1 bg-[#c28b24]" />
                <span
                  className="text-[32px] font-normal italic text-[#b47818] leading-none"
                  style={{
                    fontFamily: "'Alex Brush', 'Brush Script MT', cursive",
                  }}
                >
                  of
                </span>
                <div className="h-[1.5px] flex-1 bg-[#c28b24]" />
              </div>

              <h3
                className="-mt-0.5 text-[27px] font-bold tracking-[0.28em] uppercase text-zinc-900 leading-tight"
                style={{
                  fontFamily:
                    "'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif",
                }}
              >
                {certificateType}
              </h3>
            </div>
          </div>

          {/* BODY: DECLARATION & RECIPIENT */}
          <div className="text-center -mt-1.5">
            <p className="text-[18px] italic text-zinc-800">
              This is to certify that
            </p>

            {/* Recipient Name with Dotted Baseline */}
            <div className="mx-auto mt-1 min-h-[42px] max-w-[580px]">
              <p
                className="text-[30px] font-extrabold uppercase tracking-wide text-zinc-950 leading-tight"
                style={{
                  fontFamily:
                    "'Playfair Display', Georgia, 'Times New Roman', serif",
                }}
              >
                {studentName}
              </p>
              <div className="mx-auto mt-0.5 w-full border-b-[1.5px] border-dotted border-zinc-700" />
            </div>

            <p className="mt-1.5 text-[17px] text-zinc-800">
              has successfully completed the
            </p>

            {/* Course Title */}
            <h4
              className="mt-1 text-[24px] font-black tracking-wider uppercase text-[#991b1b]"
              style={{
                fontFamily:
                  "'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif",
              }}
            >
              {courseName}
            </h4>

            {/* Institution Statement */}
            <p className="mt-1 text-[17px] text-zinc-800">
              at the{" "}
              <span className="font-extrabold text-[#065f46]">
                CHITEPO SCHOOL OF IDEOLOGY
              </span>
            </p>

            {/* DETAILS LEDGER (Certificate No., Held at, Date) */}
            <div className="mx-auto mt-2.5 w-[440px] space-y-0.5 text-left text-[14px]">
              <div className="flex items-baseline">
                <span className="w-32 font-bold text-zinc-900">
                  Certificate No.:
                </span>
                <span className="font-mono text-sm font-semibold tracking-wider text-zinc-900">
                  {certificateId}
                </span>
                <span className="ml-2 flex-1 border-b border-dotted border-zinc-500" />
              </div>
              <div className="flex items-baseline">
                <span className="w-32 font-bold text-zinc-900">Held at:</span>
                <span className="text-sm font-medium text-zinc-800">
                  {heldAt}
                </span>
                <span className="ml-2 flex-1 border-b border-dotted border-zinc-500" />
              </div>
              <div className="flex items-baseline">
                <span className="w-32 font-bold text-zinc-900">Date:</span>
                <span className="text-sm font-medium text-zinc-800">
                  {formattedDate}
                </span>
                <span className="ml-2 flex-1 border-b border-dotted border-zinc-500" />
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: SIGNATURES & OFFICIAL WAX SEAL */}
          <div className="flex items-end justify-between px-6 pb-2.5">
            {/* Left: National Political Commissar */}
            <div className="w-58 text-center">
              <div className="relative flex h-14 w-full items-end justify-center">
                <img
                  src="/sig_commissar.png"
                  alt="Commissar Signature"
                  className="h-14 w-auto object-contain -mb-1"
                />
              </div>
              <div className="h-[1.5px] w-full bg-zinc-900" />
              <p className="mt-1.5 text-[14px] font-bold text-zinc-900">
                National Political Commissar
              </p>
            </div>

            {/* Center: Wax Seal Rosette & Zimbabwe Flag Ribbon */}
            <div className="relative -mb-2 flex flex-col items-center">
              <img
                src="/cert_seal_ribbon.png"
                alt="Official Wax Seal and Ribbon"
                className="h-[118px] w-auto object-contain drop-shadow-sm"
              />
            </div>

            {/* Right: Principal, Chitepo School of Ideology */}
            <div className="w-58 text-center">
              <div className="relative flex h-14 w-full items-end justify-center">
                <img
                  src="/sig_principal.png"
                  alt="Principal Signature"
                  className="h-14 w-auto object-contain -mb-1"
                />
              </div>
              <div className="h-[1.5px] w-full bg-zinc-900" />
              <p className="mt-1.5 text-[14px] font-bold text-zinc-900">
                Principal
              </p>
              <p className="text-[12px] text-zinc-700">
                Chitepo School of Ideology
              </p>
            </div>
          </div>
        </div>

        {/* Optional Discreet Verification QR Code (Security Feature) */}
        {showQrCode && (
          <div className="absolute bottom-5 right-6 z-30 flex flex-col items-center rounded-lg border border-zinc-200 bg-white/95 p-1.5 shadow-sm">
            <QRCodeCanvas value={qrData} size={44} fgColor="#065f46" />
            <span className="mt-0.5 text-[7px] font-mono font-bold tracking-tight text-zinc-600">
              SCAN TO VERIFY
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
