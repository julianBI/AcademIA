"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, Target, TrendingUp, Zap, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal mb-4" />
        <p className="text-brand-steel">Cargando métricas...</p>
      </div>
    );
  }

  const stats = [
    { label: "Tiempo de Estudio", value: data?.studyTimeFormatted || "0m", icon: Clock, color: "text-brand-teal", bg: "bg-brand-teal/10" },
    { label: "Preguntas al Tutor", value: data?.questionsCount || 0, icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Promedio Quizzes", value: data?.averageQuizScore ? `${data.averageQuizScore}%` : "N/A", icon: Target, color: "text-green-600", bg: "bg-green-50" },
    { label: "Progreso Semanal", value: data?.weeklyProgress !== undefined ? `${data.weeklyProgress >= 0 ? '+' : ''}${data.weeklyProgress}%` : "0%", icon: TrendingUp, color: "text-brand-pink", bg: "bg-brand-pink/10" },
  ];

  // Normalize weekly activity for chart (max height = 100%)
  const maxActivity = data?.weeklyActivity ? Math.max(...data.weeklyActivity, 1) : 1;
  const weeklyActivityPercentages = data?.weeklyActivity
    ? data.weeklyActivity.map(v => Math.round((v / maxActivity) * 100))
    : [0, 0, 0, 0, 0, 0, 0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-brand-taupe">Métricas de Progreso</h1>
        <p className="text-brand-steel">Analiza tu rendimiento y hábitos de estudio</p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-brand-steel/10 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-brand-steel mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-brand-taupe">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-brand-steel/10 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-brand-taupe flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-teal" /> Actividad Semanal
            </h3>
            <span className="text-sm text-brand-steel">Quizzes completados</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 px-4">
            {weeklyActivityPercentages.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-brand-teal rounded-t-lg transition-all hover:bg-brand-teal/60 min-h-[4px]"
                  style={{ height: `${Math.max(h, 4)}%` }}
                ></div>
                <span className="text-xs font-bold text-brand-steel">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-brand-steel/10 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-brand-blush/20 rounded-full flex items-center justify-center mb-6">
            <Target className="h-10 w-10 text-brand-pink" />
          </div>
          <h3 className="text-xl font-bold text-brand-taupe mb-2">Dominio por Materia</h3>
          <p className="text-brand-steel max-w-xs mb-6">
            Promedio de tus resultados en quizzes por materia
          </p>
          <div className="mt-4 w-full space-y-4">
            {data?.masteryBySubject && data.masteryBySubject.length > 0 ? (
              data.masteryBySubject.map((subject, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{subject.name}</span>
                    <span>{subject.score}%</span>
                  </div>
                  <div className="h-2 bg-brand-steel/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${subject.score}%`,
                        backgroundColor: subject.color || "#16697A"
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-brand-steel/60 text-sm italic">
                Completa quizzes para ver tu dominio por materia
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-brand-steel/10">
          <h4 className="font-bold text-brand-taupe mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-teal" /> Tiempo de Estudio
          </h4>
          <p className="text-sm text-brand-steel">
            Total de minutos registrados en sesiones de estudio. Se registra automáticamente cuando completas quizzes o usas el tutor.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-brand-steel/10">
          <h4 className="font-bold text-brand-taupe mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" /> Promedio Quizzes
          </h4>
          <p className="text-sm text-brand-steel">
            Promedio de tu puntuación en todos los quizzes completados. Se calcula como: <code className="bg-brand-blush/20 px-1 rounded">SUM(scores) / COUNT(quizzes)</code>
          </p>
        </div>
      </div>
    </div>
  );
}
