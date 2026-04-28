"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Search, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CreateSubjectModal from "@/components/subjects/CreateSubjectModal";
import DeleteConfirmModal from "@/components/documents/DeleteConfirmModal";

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteSubject = async (e, id, name) => {
    e.stopPropagation();

    // Verificar si hay documentos asociados a esta materia
    try {
      const res = await fetch(`/api/documents?subjectId=${id}`);
      if (res.ok) {
        const docs = await res.json();
        if (docs.length > 0) {
          toast.error(`No puedes borrar "${name}". Primero borra los ${docs.length} documento(s) asociados.`);
          return;
        }
      }
    } catch (err) {
      console.error("Error checking documents:", err);
    }

    setDeletingId(id);
    setDeletingName(name);
  };

  const confirmDeleteSubject = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/subjects?id=${deletingId}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al eliminar");
      }
      toast.success("Materia eliminada");
      fetchSubjects();
    } catch (err) {
      console.error("Delete subject error:", err);
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
      setDeletingName("");
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-taupe">Mis Materias</h1>
          <p className="text-brand-steel">Gestiona tus áreas de estudio y documentos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0e4f5c] transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" /> Nueva Materia
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-steel" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar materia..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-brand-steel/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-brand-teal mb-4" />
          <p className="text-brand-steel">Cargando materias...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-brand-steel/10 text-center">
          <p className="text-brand-steel">
            {searchTerm ? "No se encontraron materias que coincidan." : "Aún no has creado ninguna materia."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <div 
              key={subject.id} 
              onClick={() => router.push(`/subjects/${subject.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/subjects/${subject.id}`); }}
              className="group relative bg-white p-6 rounded-3xl border border-brand-steel/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
            >
              <button
                type="button"
                onClick={(e) => handleDeleteSubject(e, subject.id, subject.name)}
                disabled={deletingId === subject.id}
                className="absolute top-4 right-4 p-2 text-brand-steel hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10 disabled:opacity-50"
              >
                {deletingId === subject.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>

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
                <span>Materia de estudio</span>
                <span>•</span>
                <span>{new Date(subject.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSubjects}
      />

      <DeleteConfirmModal
        isOpen={deletingId !== null}
        documentName={deletingName}
        title="¿Borrar materia?"
        message="Se borrarán todos los documentos y chats asociados. Esta acción no se puede deshacer."
        confirmText="Borrar"
        isDeleting={isDeleting}
        onConfirm={confirmDeleteSubject}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
