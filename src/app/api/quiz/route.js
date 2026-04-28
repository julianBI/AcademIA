import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient } from "@/lib/gemini/client";
import { QUIZ_GENERATION_PROMPT } from "@/lib/gemini/prompts";
import { getUserGeminiKey } from "@/lib/encryption";

/**
 * Lista modelos disponibles desde la API de Google.
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
 * Obtiene el mejor modelo disponible para quizzes, priorizando Flash.
 */
const getBestQuizModel = async (apiKey) => {
  const models = await fetchAvailableModels(apiKey);

  const chatModels = models.filter(m =>
    m.supportedGenerationMethods?.includes("generateContent") &&
    m.name.includes("gemini")
  );

  // Ordenar por prioridad: Flash primero (tiene mejor free tier)
  const priority = ["flash", "1.5-flash", "2.0-flash", "2.5-flash", "1.5-pro", "2.5-pro"];
  chatModels.sort((a, b) => {
    const aIdx = priority.findIndex(p => a.name.includes(p));
    const bIdx = priority.findIndex(p => b.name.includes(p));
    return aIdx - bIdx;
  });

  const best = chatModels[0];
  if (!best) throw new Error("No hay modelos disponibles");
  return best.name.replace("models/", "");
};

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

    // Obtener la API Key del usuario desde la base de datos
    const userApiKey = await getUserGeminiKey(supabase, user.id);
    if (!userApiKey) {
      return NextResponse.json({ error: "API Key de Gemini no configurada." }, { status: 400 });
    }

    // 1. Obtener todos los fragmentos (chunks) de la materia para dar contexto a Gemini
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('content')
      .eq('subject_id', subjectId);

    if (chunksError) {
      return NextResponse.json({ error: "Error obteniendo documentos para el cuestionario." }, { status: 500 });
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: "No hay documentos cargados en esta materia para generar un cuestionario." }, { status: 400 });
    }

    // Combinar el texto de los chunks para el contexto
    const contextText = chunks.map(c => c.content).join("\n\n---\n\n");

    // 2. Preparar el Prompt
    const prompt = QUIZ_GENERATION_PROMPT
      .replace("{context}", contextText)
      .replace("{count}", questionCount.toString());

    // 3. Obtener el mejor modelo disponible
    const modelName = await getBestQuizModel(userApiKey);
    console.log(`[Quiz] Usando modelo: ${modelName}`);

    // 4. Llamar a Gemini exigiendo formato JSON
    const genAI = getGeminiClient(userApiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let generatedQuestions;
    try {
      const parsed = JSON.parse(responseText);
      generatedQuestions = parsed.questions || parsed;
    } catch (err) {
      console.error("Error parseando respuesta JSON de Gemini:", responseText);
      return NextResponse.json({ error: "La IA no generó un formato JSON válido." }, { status: 500 });
    }

    // 5. Guardar el cuestionario generado en la BD
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
      console.error("Error guardando quiz en BD:", quizError);
      return NextResponse.json({ quizId: "temp_id", questions: generatedQuestions });
    }

    return NextResponse.json({
      quizId: quizData.id,
      questions: generatedQuestions
    });

  } catch (error) {
    console.error("API Quiz Error:", error);
    return NextResponse.json(
      { error: `Error interno generando cuestionario: ${error.message}` },
      { status: 500 }
    );
  }
}
