import Link from "next/link";
import { ArrowLeft, MessageSquare, BookOpen, FileText, Trash2, Calendar } from "lucide-react";
import FileUploader from "@/components/documents/FileUploader";

export default async function SubjectPage({ params }) {
  const { id } = await params;

  // Mock data - En el futuro se buscará desde Supabase:
  // const { data: subject } = await supabase.from('subjects').select('*').eq('id', id).single();
  // const { data: documents } = await supabase.from('documents').select('*').eq('subject_id', id);
  const subject = {
    id,
    name: "Estructura de Datos",
    description: "Algoritmos, árboles, grafos y complejidad algorítmica.",
    color: "#DB93B0"
  };

  const documents = [
    { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", name: "Tema_1_Introduccion.pdf", file_type: "pdf", size_bytes: 2500000, created_at: "2026-04-10T10:00:00Z" },
    { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", name: "Apuntes_Clase_Grafos.docx", file_type: "docx", size_bytes: 1200000, created_at: "2026-04-15T14:30:00Z" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header / Nav */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard" 
          className="p-2 bg-white border border-brand-steel/20 rounded-lg text-brand-taupe hover:text-brand-teal transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></div>
            <h1 className="text-3xl font-bold text-brand-taupe">{subject.name}</h1>
          </div>
          <p className="text-brand-steel mt-1">{subject.description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link 
          href={`/subjects/${id}/chat`}
          className="flex items-center justify-between p-6 bg-brand-teal hover:bg-[#0e4f5c] text-white rounded-2xl shadow-sm transition-colors group"
        >
          <div>
            <h3 className="text-xl font-bold mb-1">Tutor IA</h3>
            <p className="text-white/80 text-sm">Chatea con el material de esta materia</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquare className="h-6 w-6" />
          </div>
        </Link>

        <Link 
          href={`/subjects/${id}/quiz`}
          className="flex items-center justify-between p-6 bg-white border-2 border-brand-teal text-brand-taupe hover:bg-brand-teal/5 rounded-2xl shadow-sm transition-colors group"
        >
          <div>
            <h3 className="text-xl font-bold mb-1 text-brand-teal">Cuestionario</h3>
            <p className="text-brand-steel text-sm">Evalúa lo que has aprendido</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-brand-teal/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6 text-brand-teal" />
          </div>
        </Link>
      </div>

      {/* Document Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-brand-taupe border-b border-brand-steel/20 pb-2">
            Material de Estudio
          </h2>
          
          {documents.length > 0 ? (
            <div className="bg-white rounded-2xl border border-brand-steel/20 shadow-sm overflow-hidden">
              <ul className="divide-y divide-brand-steel/10">
                {documents.map((doc) => (
                  <li key={doc.id} className="p-4 hover:bg-brand-blush/5 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-brand-pink/20 text-brand-pink rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-brand-taupe">{doc.name}</p>
                        <div className="flex items-center gap-3 text-xs text-brand-steel mt-1">
                          <span>{(doc.size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-brand-steel hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center p-12 border-2 border-dashed border-brand-steel/30 rounded-2xl">
              <FileText className="h-12 w-12 text-brand-steel mx-auto mb-4 opacity-50" />
              <p className="text-brand-taupe font-medium">Aún no hay documentos</p>
              <p className="text-sm text-brand-steel mt-1">Sube tu primer archivo en el panel derecho.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <FileUploader subjectId={id} />
        </div>
      </div>
    </div>
  );
}
