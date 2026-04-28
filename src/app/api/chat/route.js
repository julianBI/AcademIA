export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding, generateChatResponse } from "@/lib/gemini/client";
import { TUTOR_SYSTEM_PROMPT, STUDY_TECHNIQUES } from "@/lib/gemini/prompts";
import { getUserGeminiKey } from "@/lib/encryption";

export async function POST(req) {
  try {
    const { message, subjectId, studyTechnique = "neutral" } = await req.json();

    if (!message || !subjectId) {
      return NextResponse.json(
        { error: "Faltan parámetros: message y subjectId son requeridos." },
        { status: 400 }
      );
    }

    // 1. Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. API Key del usuario
    const userApiKey = await getUserGeminiKey(supabase, user.id);
    if (!userApiKey) {
      return NextResponse.json(
        { error: "API Key de Gemini no configurada. Configúrala en la sección de chat." },
        { status: 400 }
      );
    }

    // 3. Obtener TODOS los chunks de la materia (Long Context RAG)
    // Gemini 2.5 Flash soporta hasta 1M de tokens, lo que permite enviar todo el material.
    const { data: chunks, error: chunksError } = await supabase
      .from("document_chunks")
      .select("content")
      .eq("subject_id", subjectId);

    if (chunksError) {
      console.error("[Chat] Error obteniendo chunks:", chunksError);
      return NextResponse.json(
        { error: "Error recuperando el material de estudio: " + chunksError.message },
        { status: 500 }
      );
    }

    console.log(`[Chat] Chunks recuperados: ${chunks?.length ?? 0}`);

    // 4. Construir contexto completo
    let contextText =
      chunks && chunks.length > 0
        ? chunks.map((c) => c.content).join("\n\n---\n\n")
        : "No hay documentos cargados en esta materia aún.";

    // 6. System prompt
    const techniqueInstruction =
      STUDY_TECHNIQUES[studyTechnique] || STUDY_TECHNIQUES.neutral;
    const systemInstruction = TUTOR_SYSTEM_PROMPT
      .replace("{context}", contextText)
      .replace("{studyTechnique}", techniqueInstruction);

    // 7. Generar respuesta en streaming con Gemini
    const streamResult = await generateChatResponse(message, systemInstruction, userApiKey);

    // 8. Convertir AsyncGenerator → ReadableStream compatible con Next.js
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("[Chat] Stream error:", err);
          controller.enqueue(encoder.encode(`\n[Error en streaming: ${err.message}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[Chat] Error crítico:", error);
    return NextResponse.json(
      { error: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}
