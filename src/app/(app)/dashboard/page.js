import { createClient } from "@/lib/supabase/server";
import { BookOpen, Clock, Target, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // En el futuro:
  // const { data: subjects } = await supabase.from('subjects').select('*').eq('user_id', user.id);
  // Por ahora usaremos datos de prueba para construir la interfaz.
  const subjects = [
    { id: "11111111-1111-1111-1111-111111111111", name: "Estructura de Datos", color: "#DB93B0", documentCount: 4, studyTime: 120 },
    { id: "22222222-2222-2222-2222-222222222222", name: "Física Universitaria", color: "#77A0A9", documentCount: 2, studyTime: 45 },
    { id: "33333333-3333-3333-3333-333333333333", name: "Cálculo Integral", color: "#16697A", documentCount: 8, studyTime: 210 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-taupe">Hola, Estudiante 👋</h1>
        <p className="text-brand-steel mt-2">Aquí tienes un resumen de tu progreso académico.</p>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-steel/20 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-pink">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-brand-steel font-medium">Materias Activas</p>
            <p className="text-2xl font-bold text-brand-taupe">{subjects.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-steel/20 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-brand-steel font-medium">Tiempo de Estudio</p>
            <p className="text-2xl font-bold text-brand-taupe">6h 15m</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-steel/20 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-steel/20 flex items-center justify-center text-brand-steel">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-brand-steel font-medium">Promedio Cuestionarios</p>
            <p className="text-2xl font-bold text-brand-taupe">85%</p>
          </div>
        </div>
      </div>

      {/* Lista de Materias */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-taupe">Tus Materias</h2>
          <button className="flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-[#0e4f5c] transition-colors text-sm font-medium">
            <Plus className="h-4 w-4" /> Nueva Materia
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link 
              key={subject.id} 
              href={`/subjects/${subject.id}`}
              className="bg-white rounded-2xl border border-brand-steel/20 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div 
                className="h-24 w-full"
                style={{ backgroundColor: subject.color }}
              ></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-taupe mb-1 group-hover:text-brand-teal transition-colors">
                  {subject.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-brand-steel mt-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{subject.documentCount} docs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(subject.studyTime / 60)}h {subject.studyTime % 60}m</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Placeholder para agregar nueva materia */}
          <button className="bg-brand-blush/10 rounded-2xl border-2 border-dashed border-brand-steel/30 flex flex-col items-center justify-center text-brand-steel hover:text-brand-teal hover:border-brand-teal hover:bg-brand-teal/5 transition-all min-h-[200px]">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-medium">Crear nueva materia</span>
          </button>
        </div>
      </div>
    </div>
  );
}
