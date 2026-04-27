import { BarChart3, Clock, Target, TrendingUp, Zap } from "lucide-react";

export default function AnalyticsPage() {
  const stats = [
    { label: "Tiempo de Estudio", value: "12h 45m", icon: Clock, color: "text-brand-teal", bg: "bg-brand-teal/10" },
    { label: "Preguntas al Tutor", value: "158", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Promedio Quizzes", value: "88%", icon: Target, color: "text-green-600", bg: "bg-green-50" },
    { label: "Progreso Semanal", value: "+15%", icon: TrendingUp, color: "text-brand-pink", bg: "bg-brand-pink/10" },
  ];

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

      {/* Placeholder para Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-brand-steel/10 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-brand-taupe flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-teal" /> Actividad Semanal
            </h3>
            <span className="text-sm text-brand-steel italic">Próximamente datos reales</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 px-4">
            {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-brand-teal/20 rounded-t-lg transition-all hover:bg-brand-teal/40"
                  style={{ height: `${h}%` }}
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
          <p className="text-brand-steel max-w-xs">
            Estamos procesando tus resultados de quizzes para mostrarte en qué temas eres un experto.
          </p>
          <div className="mt-8 w-full space-y-4">
             <div className="space-y-1">
               <div className="flex justify-between text-sm font-bold">
                 <span>Estructura de Datos</span>
                 <span>92%</span>
               </div>
               <div className="h-2 bg-brand-steel/10 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-teal w-[92%]"></div>
               </div>
             </div>
             <div className="space-y-1">
               <div className="flex justify-between text-sm font-bold">
                 <span>Física Universitaria</span>
                 <span>75%</span>
               </div>
               <div className="h-2 bg-brand-steel/10 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-pink w-[75%]"></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
