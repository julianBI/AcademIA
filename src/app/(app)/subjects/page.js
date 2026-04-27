import { BookOpen, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function SubjectsPage() {
  // Mock data (similar to dashboard)
  const subjects = [
    { id: "11111111-1111-1111-1111-111111111111", name: "Estructura de Datos", color: "#DB93B0", documentCount: 4, lastStudy: "Hoy" },
    { id: "22222222-2222-2222-2222-222222222222", name: "Física Universitaria", color: "#77A0A9", documentCount: 2, lastStudy: "Ayer" },
    { id: "33333333-3333-3333-3333-333333333333", name: "Cálculo Integral", color: "#16697A", documentCount: 8, lastStudy: "Hace 3 días" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-taupe">Mis Materias</h1>
          <p className="text-brand-steel">Gestiona tus áreas de estudio y documentos</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0e4f5c] transition-colors shadow-sm">
          <Plus className="h-5 w-5" /> Nueva Materia
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-steel" />
        <input 
          type="text" 
          placeholder="Buscar materia..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-brand-steel/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link 
            key={subject.id} 
            href={`/subjects/${subject.id}`}
            className="group bg-white p-6 rounded-3xl border border-brand-steel/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white"
              style={{ backgroundColor: subject.color }}
            >
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-brand-taupe mb-2 group-hover:text-brand-teal transition-colors">
              {subject.name}
            </h3>
            <div className="flex items-center justify-between text-sm text-brand-steel">
              <span>{subject.documentCount} Documentos</span>
              <span>•</span>
              <span>{subject.lastStudy}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
