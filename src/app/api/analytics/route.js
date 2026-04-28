import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setSeconds(endOfLastWeek.getSeconds() - 1);

    // 1. Preguntas al Tutor (count of user messages)
    const { count: questionsCount } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact" })
      .eq("role", "user");

    // 2. Promedio Quizzes (average score of completed quizzes)
    const { data: quizzesData } = await supabase
      .from("quizzes")
      .select("score")
      .eq("user_id", user.id)
      .not("score", "is", null);

    const averageQuizScore = quizzesData && quizzesData.length > 0
      ? Math.round(quizzesData.reduce((acc, q) => acc + (parseFloat(q.score) || 0), 0) / quizzesData.length)
      : 0;

    // 3. Progreso Semanal (% de quizzes completados esta semana vs semana pasada)
    const { count: quizzesThisWeek } = await supabase
      .from("quizzes")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .not("score", "is", null)
      .gte("completed_at", startOfWeek.toISOString());

    const { count: quizzesLastWeek } = await supabase
      .from("quizzes")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .not("score", "is", null)
      .gte("completed_at", startOfLastWeek.toISOString())
      .lt("completed_at", startOfWeek.toISOString());

    let weeklyProgress = 0;
    if (quizzesLastWeek > 0) {
      weeklyProgress = Math.round(((quizzesThisWeek - quizzesLastWeek) / quizzesLastWeek) * 100);
    } else if (quizzesThisWeek > 0) {
      weeklyProgress = 100; // Primera semana con quizzes
    }

    // 4. Tiempo de Estudio (suma de study_time_minutes en study_metrics)
    const { data: studyMetricsData } = await supabase
      .from("study_metrics")
      .select("study_time_minutes")
      .eq("user_id", user.id);

    const totalStudyMinutes = studyMetricsData && studyMetricsData.length > 0
      ? studyMetricsData.reduce((acc, m) => acc + (m.study_time_minutes || 0), 0)
      : 0;

    // 5. Actividad Semanal (quizzes completados por día de la semana)
    const startOfWeekDay = new Date(now);
    startOfWeekDay.setDate(now.getDate() - now.getDay() + 1);
    startOfWeekDay.setHours(0, 0, 0, 0);

    const { data: weeklyActivityData } = await supabase
      .from("quizzes")
      .select("completed_at")
      .eq("user_id", user.id)
      .not("score", "is", null)
      .gte("completed_at", startOfWeekDay.toISOString());

    const weeklyActivity = [0, 0, 0, 0, 0, 0, 0]; // L M M J V S D
    if (weeklyActivityData) {
      weeklyActivityData.forEach(quiz => {
        if (quiz.completed_at) {
          const day = new Date(quiz.completed_at).getDay();
          const index = day === 0 ? 6 : day - 1; // Convert Sunday=0 to index 6
          weeklyActivity[index]++;
        }
      });
    }

    // 6. Dominio por Materia (promedio de quizzes por subject)
    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("id, name, color")
      .eq("user_id", user.id);

    const masteryBySubject = [];
    if (subjectsData) {
      for (const subject of subjectsData) {
        const { data: subjectQuizzes } = await supabase
          .from("quizzes")
          .select("score")
          .eq("user_id", user.id)
          .eq("subject_id", subject.id)
          .not("score", "is", null);

        const avgScore = subjectQuizzes && subjectQuizzes.length > 0
          ? Math.round(subjectQuizzes.reduce((acc, q) => acc + (parseFloat(q.score) || 0), 0) / subjectQuizzes.length)
          : null;

        if (avgScore !== null) {
          masteryBySubject.push({
            name: subject.name,
            color: subject.color,
            score: avgScore
          });
        }
      }
    }

    // Formatear tiempo de estudio
    const hours = Math.floor(totalStudyMinutes / 60);
    const minutes = totalStudyMinutes % 60;
    const studyTimeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return NextResponse.json({
      questionsCount: questionsCount || 0,
      averageQuizScore,
      weeklyProgress,
      studyTimeFormatted,
      weeklyActivity,
      masteryBySubject
    });

  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
