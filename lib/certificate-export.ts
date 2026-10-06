export async function downloadCertificatePdf(options: {
  templateId: string;
  fileName: string;
  renderDelayMs?: number;
}): Promise<void> {
  const { templateId, fileName, renderDelayMs = 400 } = options;

  await new Promise((resolve) => setTimeout(resolve, renderDelayMs));

  const element = document.getElementById(templateId);
  if (!element) {
    throw new Error("Could not render certificate.");
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
  pdf.save(fileName);
}
