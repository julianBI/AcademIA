"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Key } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import ApiKeyModal from "@/components/chat/ApiKeyModal";

// Client component wrapper for the chat page
export default function ChatPage({ params }) {
  // Desempaquetar los parámetros en React 19 (Next 15)
  const resolvedParams = use(params);
  const subjectId = resolvedParams.id;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoadingKey, setIsLoadingKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const res = await fetch("/api/user/key");
        const data = await res.json();
        if (data.hasKey) {
          setHasApiKey(true);
        } else {
          setIsModalOpen(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSaveKey = async (key) => {
    try {
      const res = await fetch("/api/user/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key })
      });
      if (res.ok) {
        setHasApiKey(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href={`/subjects/${subjectId}`} 
            className="p-2 bg-white border border-brand-steel/20 rounded-lg text-brand-taupe hover:text-brand-teal transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-taupe">Tutor IA</h1>
            <p className="text-sm text-brand-steel hidden sm:block">
              Interactuando con el material de la materia
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            hasApiKey 
              ? "bg-white border-brand-steel/20 text-brand-steel hover:text-brand-teal" 
              : "bg-brand-pink/20 border-brand-pink text-brand-taupe hover:bg-brand-pink/30"
          }`}
        >
          <Key className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isLoadingKey ? "Verificando..." : hasApiKey ? "API Key Configurada" : "Falta API Key"}
          </span>
        </button>
      </div>

      {/* Main Chat Area */}
      <ChatWindow subjectId={subjectId} hasApiKey={hasApiKey} />

      {/* Modal API Key */}
      <ApiKeyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveKey} 
      />
    </div>
  );
}
