"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Clock, FileText, Brain, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import CreateSubjectModal from "@/components/subjects/CreateSubjectModal";

export default function DashboardPage() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubjects(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header / Saludo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-taupe tracking-tight">
            ¡Hola de nuevo! 👋
          </h1>
          <p className="text-lg text-brand-steel mt-2">
            ¿Qué vamos a aprender hoy en AcademIA?
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-teal text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#0e4f5c] transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="h-6 w-6" /> Nueva Materia
        </button>
      </div>

      {/* Grid de Materias */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-brand-taupe">Mis Materias</h2>
          <Link href="/subjects" className="text-brand-teal font-bold hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-brand-steel">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p>Cargando tus materias...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-brand-steel/20 rounded-3xl p-12 text-center">
            <div className="h-16 w-16 bg-brand-blush/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-brand-taupe" />
            </div>
            <h3 className="text-xl font-bold text-brand-taupe mb-2">Aún no tienes materias</h3>
            <p className="text-brand-steel mb-8 max-w-sm mx-auto">
              Crea tu primera materia para empezar a subir documentos y chatear con el Tutor IA.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0e4f5c] transition-colors"
            >
              Comenzar Ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link 
                key={subject.id} 
                href={`/subjects/${subject.id}`}
                className="group bg-white p-6 rounded-3xl border border-brand-steel/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-inner"
                  style={{ backgroundColor: subject.color }}
                >
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-black text-brand-taupe mb-4 group-hover:text-brand-teal transition-colors">
                  {subject.name}
                </h3>
                <div className="flex items-center gap-4 text-sm font-bold text-brand-steel">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> 0 docs
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-pink">
                    <Clock className="h-4 w-4" /> 0 min
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Sugerencias IA */}
      <section className="bg-brand-taupe text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="h-20 w-20 bg-brand-pink rounded-3xl flex items-center justify-center rotate-6 shadow-lg shrink-0">
            <Brain className="h-10 w-10 text-brand-taupe" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-2">Consejo AcademIA</h2>
            <p className="text-brand-blush/80 text-lg leading-relaxed max-w-2xl">
              "Para un mejor aprendizaje, intenta preguntarle al Tutor IA sobre los conceptos que más te cuestan. Usa la técnica **Socrática** para profundizar en los fundamentos."
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
      </section>

      <CreateSubjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSubjects}
      />
    </div>
  );
}
