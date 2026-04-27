import { GoogleGenerativeAI } from "@google/generative-ai";

// Función para inicializar el cliente de Gemini usando la key proveída por el usuario
export const getGeminiClient = (apiKey) => {
  if (!apiKey) {
    throw new Error("Se requiere una API Key de Gemini válida.");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Generar embeddings usando el modelo de embeddings de Gemini
export const generateEmbedding = async (text, apiKey) => {
  const genAI = getGeminiClient(apiKey);
  // gemini-embedding-2 produce 3072 dims por defecto, pero HNSW en pgvector
  // solo soporta hasta 2000. Reducimos a 768 con outputDimensionality.
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  
  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    outputDimensionality: 768,
  });

  const values = result.embedding.values;
  console.log(`[Embedding] Dims: ${values.length}`);
  return values;
};

// Generar respuesta de Chat RAG — retorna el stream iterable
export const generateChatResponse = async (prompt, systemInstruction, apiKey) => {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
  });

  const result = await model.generateContentStream(prompt);
  // result.stream es un AsyncGenerator — lo retornamos directamente para usar for-await-of
  return result.stream;
};
