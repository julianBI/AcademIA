"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, BookOpen, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import FileUploader from "@/components/documents/FileUploader";
import DeleteConfirmModal from "@/components/documents/DeleteConfirmModal";

export default function SubjectDetailPage({ params }) {
  const resolvedParams = use(params);
  const subjectId = resolvedParams.id;
  
  const [subject, setSubject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Intentar obtener la materia real de la DB si no es una de las mockeadas
      const resSub = await fetch(`/api/subjects`);
      const allSubjects = await resSub.json();
      const currentSub = allSubjects.find(s => s.id === subjectId);
      
      if (currentSub) {
        setSubject(currentSub);
      } else {
        // Fallback para las materias mockeadas iniciales
        setSubject({
          name: "Materia de Estudio",
          description: "Carga tus documentos para empezar a aprender con IA.",
          color: "#16697A"
        });
      }

      // Obtener documentos reales de esta materia
      const resDocs = await fetch(`/api/documents?subjectId=${subjectId}`);
      if (resDocs.ok) {
        const docsData = await resDocs.json();
        setDocuments(docsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const [deletingDocId, setDeletingDocId] = useState(null);
  const [deletingDocName, setDeletingDocName] = useState("");
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

  const handleDeleteDoc = (id, docName) => {
    setDeletingDocId(id);
    setDeletingDocName(docName);
    setIsDeletingDoc(false);
  };

  const confirmDelete = async () => {
    if (!deletingDocId) return;
    setIsDeletingDoc(true);
    try {
      const res = await fetch(`/api/documents?id=${deletingDocId}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al eliminar");
      }
      toast.success("Documento eliminado");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeletingDoc(false);
      setDeletingDocId(null);
      setDeletingDocName("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
        <p className="mt-4 text-brand-steel">Cargando material de estudio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link 
          href="/dashboard" 
          className="p-2 bg-white border border-brand-steel/20 rounded-lg text-brand-taupe hover:text-brand-teal transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: subject?.color || "#16697A" }}
            ></div>
            <h1 className="text-3xl font-black text-brand-taupe">{subject?.name}</h1>
          </div>
          <p className="text-brand-steel">{subject?.description}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href={`/subjects/${subjectId}/chat`}
          className="bg-brand-teal text-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-xl font-bold mb-1">Tutor IA</h3>
            <p className="text-brand-blush/80 text-sm">Chatea con el material de esta materia</p>
          </div>
          <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquare className="h-6 w-6" />
          </div>
        </Link>

        <Link 
          href={`/subjects/${subjectId}/quiz`}
          className="bg-white border border-brand-steel/10 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-xl font-bold text-brand-taupe mb-1">Cuestionario</h3>
            <p className="text-brand-steel text-sm">Evalúa lo que has aprendido</p>
          </div>
          <div className="h-12 w-12 bg-brand-blush/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6 text-brand-taupe" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Document List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-brand-taupe flex items-center gap-2">
            Material de Estudio
          </h2>
          <div className="h-px bg-brand-steel/10 w-full mb-6"></div>
          
          {documents.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-brand-steel/10 rounded-3xl p-12 text-center">
              <div className="h-16 w-16 bg-brand-blush/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-brand-steel" />
              </div>
              <p className="text-brand-steel font-medium">Aún no has subido documentos a esta materia.</p>
              <p className="text-sm text-brand-steel/60">Usa el panel de la derecha para empezar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="bg-white p-4 rounded-2xl border border-brand-steel/10 flex items-center justify-between group hover:border-brand-teal/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-brand-pink/10 text-brand-pink rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-taupe truncate max-w-[200px] sm:max-w-md">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-brand-steel">
                        {(doc.size_bytes / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDoc(doc.id, doc.name)}
                    disabled={deletingDocId === doc.id}
                    className="p-2 text-brand-steel hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingDocId === doc.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-brand-taupe">Añadir Nuevo Material</h2>
          <FileUploader subjectId={subjectId} onUploadSuccess={fetchData} />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deletingDocId !== null}
        documentName={deletingDocName}
        title="¿Borrar documento?"
        message="Esta acción no se puede deshacer."
        confirmText="Borrar"
        isDeleting={isDeletingDoc}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingDocId(null)}
      />
    </div>
  );
}
