"use client";

import { useState } from "react";
import { Key, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function ApiKeyModal({ isOpen, onClose, onSave }) {
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("Por favor, ingresa una API Key válida.");
      return;
    }
    
    // Aquí idealmente cifraríamos la key antes de mandarla al backend
    // o el backend se encarga de cifrarla.
    onSave(apiKey);
    toast.success("API Key guardada correctamente.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-taupe/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-brand-steel/20 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-brand-blush/20 p-4 border-b border-brand-steel/20 flex justify-between items-center">
          <div className="flex items-center gap-2 text-brand-teal font-bold">
            <Key className="h-5 w-5" />
            <span>Configurar Gemini API</span>
          </div>
          <button 
            onClick={onClose}
            className="text-brand-steel hover:text-brand-taupe transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-brand-taupe text-sm mb-4">
            AcademIA utiliza el modelo <strong>Gemini 2.5 Flash</strong> para funcionar. 
            Como este es un proyecto académico, necesitas proveer tu propia API Key gratuita.
          </p>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-brand-taupe mb-1">
                Google Gemini API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 border border-brand-steel/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
            
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-brand-teal flex items-center gap-1 hover:underline w-max"
            >
              Obtener una API Key gratuita <ExternalLink className="h-3 w-3" />
            </a>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-brand-taupe hover:bg-brand-blush/10 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-brand-teal hover:bg-[#0e4f5c] text-white rounded-lg transition-colors"
              >
                Guardar Key
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
