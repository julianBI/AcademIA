import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromFile(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      return data.text;
    } 
    
    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    
    if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
      return buffer.toString("utf-8");
    }

    // Para imágenes o pptx se requiere una integración adicional (ej. Gemini Vision para imágenes)
    throw new Error(`Tipo de archivo no soportado actualmente para extracción: ${mimeType}`);
  } catch (error) {
    console.error("Error extrayendo texto del archivo:", error);
    throw new Error("No se pudo extraer el texto del archivo.");
  }
}
