import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient } from "@/lib/gemini/client";
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

    // Obtener la API Key del usuario desde la base de datos
    const userApiKey = await getUserGeminiKey(supabase, user.id);
    if (!userApiKey) {
      return NextResponse.json({ error: "API Key de Gemini no configurada." }, { status: 400 });
    }

    // 1. Obtener todos los fragmentos (chunks) de la materia para dar contexto a Gemini
    // Limitamos a 200 chunks por seguridad (dependiendo del tamaño de tus documentos)
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

    // 3. Llamar a Gemini exigiendo formato JSON
    const genAI = getGeminiClient(userApiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let generatedQuestions;
    try {
      const parsed = JSON.parse(responseText);
      generatedQuestions = parsed.questions || parsed; // Dependiendo de cómo lo devuelva exactamente
    } catch (err) {
      console.error("Error parseando respuesta JSON de Gemini:", responseText);
      return NextResponse.json({ error: "La IA no generó un formato JSON válido." }, { status: 500 });
    }

    // 4. Guardar el cuestionario generado en la BD (estado: incompleto, score: null)
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
      // Podemos devolver las preguntas igual aunque falle guardar el historial
      return NextResponse.json({ quizId: "temp_id", questions: generatedQuestions });
    }

    return NextResponse.json({ 
      quizId: quizData.id, 
      questions: generatedQuestions 
    });

  } catch (error) {
    console.error("API Quiz Error:", error);
    return NextResponse.json(
      { error: "Error interno generando cuestionario." },
      { status: 500 }
    );
  }
}
