"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Key, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ApiKeyModal from "@/components/chat/ApiKeyModal";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";

export default function QuizPage({ params }) {
  const resolvedParams = use(params);
  const subjectId = resolvedParams.id;
  
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

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

  const generateQuiz = async () => {
    if (!hasApiKey) {
      setIsModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setQuestions([]);
    setQuizFinished(false);
    setCurrentScore(0);
    setAnswersCount(0);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          questionCount: 5
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar el cuestionario");
      }

      setQuestions(data.questions);
      toast.success("¡Cuestionario generado con éxito!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setCurrentScore(prev => prev + 1);
    }
    
    const newAnswersCount = answersCount + 1;
    setAnswersCount(newAnswersCount);

    if (newAnswersCount === questions.length) {
      setTimeout(() => setQuizFinished(true), 1500); // Dar un poco de tiempo para leer la última explicación
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href={`/subjects/${subjectId}`} 
            className="p-2 bg-white border border-brand-steel/20 rounded-lg text-brand-taupe hover:text-brand-teal transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-taupe">Cuestionario</h1>
            <p className="text-sm text-brand-steel hidden sm:block">
              Generado por IA basado en tus documentos
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {questions.length === 0 && !isGenerating && !quizFinished && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-brand-steel/20 rounded-3xl shadow-sm">
            <div className="h-20 w-20 bg-brand-teal/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-brand-teal" />
            </div>
            <h2 className="text-2xl font-bold text-brand-taupe mb-2">Ponte a prueba</h2>
            <p className="text-brand-steel max-w-md mb-8">
              Generaremos un cuestionario de 5 preguntas de opción múltiple usando estrictamente la información de los documentos de esta materia.
            </p>
            <button 
              onClick={generateQuiz}
              className="bg-brand-teal hover:bg-[#0e4f5c] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-sm transition-colors"
            >
              Generar Cuestionario
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="h-12 w-12 text-brand-teal animate-spin mb-6" />
            <h2 className="text-xl font-bold text-brand-taupe mb-2">Analizando documentos...</h2>
            <p className="text-brand-steel animate-pulse">
              Gemini 2.5 Flash está extrayendo los conceptos clave para evaluarte.
            </p>
          </div>
        )}

        {questions.length > 0 && !quizFinished && (
          <div className="space-y-6 pb-12">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-brand-steel/20 shadow-sm sticky top-0 z-10">
              <span className="font-bold text-brand-taupe">
                Progreso: {answersCount} / {questions.length}
              </span>
              <span className="font-bold text-brand-teal">
                Aciertos: {currentScore}
              </span>
            </div>

            {questions.map((q, idx) => (
              <QuizQuestion 
                key={idx} 
                index={idx} 
                data={q} 
                onAnswer={handleAnswer} 
                disabled={quizFinished}
              />
            ))}
          </div>
        )}

        {quizFinished && (
          <div className="flex-1 flex items-center justify-center py-10">
            <QuizResults 
              score={currentScore} 
              total={questions.length} 
              onRetry={generateQuiz}
              subjectId={subjectId}
            />
          </div>
        )}
      </div>

      <ApiKeyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveKey} 
      />
    </div>
  );
}
