const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testRAG() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const apiKey = "PON_TU_API_KEY_AQUI_O_USA_ENV"; // O extraer de la DB
  
  // 1. Simular Embedding de Pregunta
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  
  console.log("Probando generación de embedding...");
  const text = "¿Qué es la Inteligencia Artificial?";
  const result = await model.embedContent(text);
  const embedding = result.embedding.values;
  console.log("Embedding generado (dimensiones):", embedding.length);

  // 2. Simular Búsqueda en DB
  console.log("Buscando en Supabase...");
  // Aquí puedes poner un SubjectID real que tengas en tu DB
  const subjectId = "tu-subject-id"; 
  
  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_threshold: 0.01, // Muy bajo para ver si trae algo
    match_count: 5,
    p_subject_id: subjectId
  });

  if (error) {
    console.error("Error RPC:", error);
  } else {
    console.log("Resultados encontrados:", data.length);
    data.forEach((d, i) => {
      console.log(`[${i}] Similitud: ${d.similarity} | Contenido: ${d.content.substring(0, 50)}...`);
    });
  }
}

// testRAG();
