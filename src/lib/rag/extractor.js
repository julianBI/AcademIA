// Force Node.js runtime — needed for pdf-parse and mammoth (CJS modules)
export const runtime = "nodejs";

export async function extractTextFromFile(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "";
  const fileName = file.name?.toLowerCase() || "";

  // --- TXT ---
  if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
    const text = buffer.toString("utf-8");
    console.log(`[Extractor] TXT extracted: ${text.length} chars`);
    return text;
  }

  // --- DOCX ---
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    // mammoth is CJS, use require via createRequire
    const { createRequire } = await import("module");
    const req = createRequire(import.meta.url);
    const mammoth = req("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    console.log(`[Extractor] DOCX extracted: ${result.value.length} chars`);
    return result.value;
  }

  // --- PDF ---
  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    // pdf-parse is CJS. We bypass its test-file loading issue by calling the 
    // internal parsing function directly instead of the package entry point.
    try {
      const { createRequire } = await import("module");
      const req = createRequire(import.meta.url);
      // Direct internal call avoids the test/debug file read that breaks in Next.js
      const PDFParser = req("pdf-parse/lib/pdf-parse.js");
      const data = await PDFParser(buffer);
      console.log(`[Extractor] PDF extracted: ${data.text.length} chars`);
      return data.text;
    } catch (e) {
      console.error("[Extractor] pdf-parse error:", e.message);
      // Fallback: Return an error that bubbles up clearly
      throw new Error(`No se pudo leer el PDF: ${e.message}. Intenta subir el archivo como .txt o .docx.`);
    }
  }

  throw new Error(
    `Tipo de archivo no soportado: ${mimeType || fileName}. Soporta PDF, DOCX y TXT.`
  );
}
