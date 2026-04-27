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
  // Usamos gemini-embedding-2 (Gemini Embedding 2)
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  
  try {
    const result = await model.embedContent(text);
    return result.embedding.values; 
  } catch (error) {
    console.error("Error with gemini-embedding-2, falling back to 001:", error.message);
    // Si falla, intentamos con gemini-embedding-001
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const fallbackResult = await fallbackModel.embedContent(text);
    return fallbackResult.embedding.values;
  }
};

// Generar respuesta de Chat RAG
export const generateChatResponse = async (prompt, systemInstruction, apiKey) => {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction
  });

  // Usamos sendMessageStream para la respuesta progresiva
  const result = await model.generateContentStream(prompt);
  return result.stream;
};
