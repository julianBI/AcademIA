import { GoogleGenerativeAI } from "@google/generative-ai";

// Función para inicializar el cliente de Gemini usando la key proveída por el usuario
export const getGeminiClient = (apiKey) => {
  if (!apiKey) {
    throw new Error("Se requiere una API Key de Gemini válida.");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Modelo de embedding (este sí funciona)
const EMBEDDING_MODEL = "gemini-embedding-2";

/**
 * Lista modelos disponibles directamente desde la API de Google.
 */
const fetchAvailableModels = async (apiKey) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }
  const data = await response.json();
  return data.models || [];
};

/**
 * Obtiene modelos de chat ordenados por prioridad (Flash > Pro).
 * Flash tiene mejor free tier, por eso se prioriza.
 */
export const getChatModelsSorted = async (apiKey) => {
  const models = await fetchAvailableModels(apiKey);

  // Filtrar solo modelos que soportan generateContent
  const chatModels = models.filter(m =>
    m.supportedGenerationMethods?.includes("generateContent") &&
    m.name.includes("gemini")
  );

  // Ordenar por prioridad: Flash primero (tiene mejor free tier)
  const priority = [
    "1.5-flash",
    "2.0-flash",
    "flash",
    "1.5-pro",
    "1.0-pro",
    "pro",
  ];

  chatModels.sort((a, b) => {
    let aIdx = priority.findIndex(p => a.name.includes(p));
    let bIdx = priority.findIndex(p => b.name.includes(p));
    
    // Si no está en la lista de prioridad, poner al final
    if (aIdx === -1) aIdx = priority.length;
    if (bIdx === -1) bIdx = priority.length;
    
    return aIdx - bIdx;
  });

  return chatModels.map(m => m.name.replace("models/", ""));
};

/**
 * Intenta generar contenido con un modelo específico.
 * Retorna el stream si exitoso, o lanza error con código 429 si sin cuota.
 */
const tryGenerateWithModel = async (genAI, modelName, prompt, systemInstruction) => {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const result = await model.generateContentStream(prompt);
  return result.stream;
};

/**
 * Genera respuesta de Chat RAG.
 * Estrategia: obtener lista de modelos, intentar en orden de prioridad (Flash primero),
 * si un modelo retorna 429 (sin cuota), probar el siguiente.
 */
export const generateChatResponse = async (prompt, systemInstruction, apiKey) => {
  const genAI = getGeminiClient(apiKey);

  // Obtener modelos ordenados por prioridad
  const chatModels = await getChatModelsSorted(apiKey);
  console.log(`[generateChatResponse] Modelos disponibles: ${chatModels.join(", ")}`);

  let lastError = null;

  // Intentar cada modelo en orden hasta que uno funcione
  for (const modelName of chatModels) {
    try {
      console.log(`[generateChatResponse] Intentando: ${modelName}`);
      const stream = await tryGenerateWithModel(genAI, modelName, prompt, systemInstruction);
      console.log(`[generateChatResponse] ✓ Exitoso con: ${modelName}`);
      return stream;
    } catch (error) {
      const isQuotaError = error.message?.includes("429") || error.message?.includes("quota");

      if (isQuotaError) {
        console.log(`[generateChatResponse] ✗ ${modelName} sin cuota, probando siguiente...`);
        lastError = error;
        continue; // Intentar siguiente modelo
      }

      // Error diferente a cuota (error real)
      console.error(`[generateChatResponse] ✗ Error con ${modelName}: ${error.message}`);
      throw error;
    }
  }

  // Ningún modelo tiene cuota disponible
  const retryDelay = lastError?.message?.match(/retry in ([\d.]+)s/)?.[1] || "30";
  throw new Error(
    `Todos los modelos sin cuota. Esperar ${retryDelay} segundos. ` +
    `Verificar límites en https://ai.dev/rate-limit`
  );
};

/**
 * Genera contenido (no streaming) con fallback.
 */
export const generateContentWithFallback = async (prompt, options = {}, apiKey) => {
  const genAI = getGeminiClient(apiKey);
  const chatModels = await getChatModelsSorted(apiKey);
  
  let lastError = null;

  for (const modelName of chatModels) {
    try {
      console.log(`[Fallback] Intentando con: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: options.systemInstruction 
      });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: options.generationConfig
      });
      
      return result.response;
    } catch (error) {
      const isQuotaError = error.message?.includes("429") || error.message?.includes("quota");
      if (isQuotaError) {
        console.warn(`[Fallback] ${modelName} sin cuota.`);
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  const retryDelay = lastError?.message?.match(/retry in ([\d.]+)s/)?.[1] || "30";
  throw new Error(`Cuota agotada en todos los modelos. Reintentar en ${retryDelay}s.`);
};

// Generar embeddings usando el modelo de embeddings de Gemini
export const generateEmbedding = async (text, apiKey) => {
  const genAI = getGeminiClient(apiKey);
  // gemini-embedding-2 produce 3072 dims por defecto, pero HNSW en pgvector
  // solo soporta hasta 2000. Reducimos a 768 con outputDimensionality.
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    outputDimensionality: 768,
  });

  const values = result.embedding.values;
  console.log(`[Embedding] Dims: ${values.length}`);
  return values;
};
