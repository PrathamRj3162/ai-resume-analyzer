import type { PDFDocumentProxy } from "pdfjs-dist";

// Load pdf.js + create the worker ONCE. The old code spawned a new Worker on every call and never killed it.
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      const PdfWorker = (await import("pdfjs-dist/build/pdf.worker.mjs?worker"))
        .default;
      pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();
      return pdfjsLib;
    })();
  }
  return pdfjsPromise;
}

/** Parse the PDF once; reuse the returned doc for text extraction AND image rendering. */
export async function loadPdf(file: File): Promise<PDFDocumentProxy> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Uploaded file is not a PDF");
  }
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data }).promise;
}

/** Text layer of the first `maxPages` pages. This is what an ATS actually reads. */
export async function extractPdfText(
  pdf: PDFDocumentProxy,
  maxPages = 3
): Promise<string> {
  const count = Math.min(pdf.numPages, maxPages);
  const pages = await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      return content.items
        .map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : " ") : ""))
        .join("");
    })
  );
  return pages.join("\n\n").replace(/[ \t]+/g, " ").trim();
}

/** Preview image only (shown on the results page). JPEG @1.5x, not lossless PNG @2x. */
export async function renderFirstPageToImage(
  pdf: PDFDocumentProxy,
  fileName: string
): Promise<File | null> {
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvas, canvasContext: context, viewport }).promise;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.82)
  );
  if (!blob) return null;
  return new File([blob], `${fileName.replace(/\.pdf$/i, "")}.jpg`, {
    type: "image/jpeg",
  });
}
