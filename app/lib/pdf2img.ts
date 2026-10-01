import * as pdfjsLib from "pdfjs-dist";

// Point the worker to our public file
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export async function convertPdfToImage(
  file: File
): Promise<{ file: File | null; dataUrl: string | null }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Render the first page
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x for high quality

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return { file: null, dataUrl: null };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/png");

    // Convert data URL to File
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const imageFile = new File(
      [blob],
      file.name.replace(".pdf", ".png"),
      { type: "image/png" }
    );

    return { file: imageFile, dataUrl };
  } catch (error) {
    console.error("PDF to image conversion error:", error);
    return { file: null, dataUrl: null };
  }
}
