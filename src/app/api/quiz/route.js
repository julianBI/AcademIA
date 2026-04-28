import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContentWithFallback } from "@/lib/gemini/client";
import { QUIZ_GENERATION_PROMPT } from "@/lib/gemini/prompts";
import { getUserGeminiKey } from "@/lib/encryption";

export async function POST(req) {
  try {
    const { subjectId, questionCount = 5 } = await req.json();

    if (!subjectId) {
      return NextResponse.json({ error: "Faltan parámetros requeridos (subjectId)" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener la API Key del usuario
    const userApiKey = await getUserGeminiKey(supabase, user.id);
    if (!userApiKey) {
      return NextResponse.json({ error: "API Key de Gemini no configurada." }, { status: 400 });
    }

    // 1. Obtener contexto
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('content')
      .eq('subject_id', subjectId);

    if (chunksError || !chunks || chunks.length === 0) {
      return NextResponse.json({ error: "No hay documentos cargados en esta materia." }, { status: 400 });
    }

    const contextText = chunks.map(c => c.content).join("\n\n---\n\n");
    const prompt = QUIZ_GENERATION_PROMPT
      .replace("{context}", contextText)
      .replace("{count}", questionCount.toString());

    // 2. Generar con Fallback
    const response = await generateContentWithFallback(
      prompt,
      {
        generationConfig: {
          responseMimeType: "application/json",
        }
      },
      userApiKey
    );

    const responseText = response.text();

    let generatedQuestions;
    try {
      const parsed = JSON.parse(responseText);
      generatedQuestions = parsed.questions || (Array.isArray(parsed) ? parsed : null);
      if (!generatedQuestions) throw new Error("Formato inválido");
    } catch (err) {
      console.error("Error parseando JSON de Gemini:", responseText);
      return NextResponse.json({ error: "La IA no generó un formato JSON válido." }, { status: 500 });
    }

    // 3. Guardar en BD
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        user_id: user.id,
        subject_id: subjectId,
        questions_json: generatedQuestions,
      })
      .select()
      .single();

    if (quizError) {
      console.error("Error guardando quiz:", quizError);
      return NextResponse.json({ quizId: `temp_${Date.now()}`, questions: generatedQuestions });
    }

    return NextResponse.json({
      quizId: quizData.id,
      questions: generatedQuestions
    });

  } catch (error) {
    console.error("API Quiz Error:", error);
    const isQuota = error.message?.includes("Cuota") || error.message?.includes("429");
    
    return NextResponse.json(
      { error: isQuota ? error.message : `Error generando cuestionario: ${error.message}` },
      { status: isQuota ? 429 : 500 }
    );
  }
}
