import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding, generateChatResponse } from "@/lib/gemini/client";
import { TUTOR_SYSTEM_PROMPT, STUDY_TECHNIQUES } from "@/lib/gemini/prompts";
import { getUserGeminiKey } from "@/lib/encryption";

export async function POST(req) {
  try {
    const { message, subjectId, sessionId, studyTechnique = 'neutral' } = await req.json();

    if (!message || !subjectId) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos (message, subjectId)" },
        { status: 400 }
      );
    }

    // 1. Verificar autenticación del usuario
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener la API Key del usuario desde la base de datos
    const userApiKey = await getUserGeminiKey(supabase, user.id);
    if (!userApiKey) {
      return NextResponse.json({ error: "API Key de Gemini no configurada." }, { status: 400 });
    }

    // 2. Generar el embedding de la pregunta del usuario usando Gemini (text-embedding-004)
    let queryEmbedding;
    try {
      queryEmbedding = await generateEmbedding(message, userApiKey);
    } catch (err) {
      return NextResponse.json({ error: "Error generando embedding de Gemini: " + err.message }, { status: 500 });
    }

    // 3. Buscar los chunks más relevantes en Supabase (Similarity Search via pgvector)
    const { data: relevantChunks, error: rpcError } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.1, // Más permisivo para encontrar información
      match_count: 10,      // Top 10 chunks para más contexto
      p_subject_id: subjectId
    });

    console.log(`[RAG Debug] Chunks encontrados: ${relevantChunks?.length || 0}`);
    if (relevantChunks && relevantChunks.length > 0) {
      console.log(`[RAG Debug] Similitud máxima: ${relevantChunks[0].similarity}`);
    }

    if (rpcError) {
      return NextResponse.json({ error: "Error en búsqueda vectorial: " + rpcError.message }, { status: 500 });
    }

    // 4. Preparar el contexto para Gemini Flash
    let contextText = "";
    if (relevantChunks && relevantChunks.length > 0) {
      contextText = relevantChunks.map(chunk => chunk.content).join("\n\n---\n\n");
    } else {
      contextText = "No se encontraron fragmentos relevantes en los documentos de esta materia para la pregunta actual.";
    }

    // 5. Configurar el System Prompt
    const techniqueInstruction = STUDY_TECHNIQUES[studyTechnique] || STUDY_TECHNIQUES.neutral;
    const systemInstruction = TUTOR_SYSTEM_PROMPT
      .replace("{context}", contextText)
      .replace("{studyTechnique}", techniqueInstruction);

    // 6. Generar la respuesta usando Gemini 2.5 Flash en modo stream
    const asyncStream = await generateChatResponse(message, systemInstruction, userApiKey);

    // Convertir AsyncGenerator a ReadableStream para Next.js
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async pull(controller) {
        try {
          const { value, done } = await asyncStream.next();
          if (done) {
            controller.close();
          } else {
            const chunkText = value.text();
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (err) {
          controller.error(err);
        }
      }
    });

    // 7. Retornar el ReadableStream al cliente
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
