import Link from "next/link";
import { BookOpen, Brain, LineChart, FileText, Upload, MessageSquare, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-brand-steel/20 bg-brand-teal text-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-brand-pink" />
            <span className="text-xl font-bold tracking-tight">AcademIA</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium border border-brand-steel px-4 py-2 rounded-md hover:bg-[#0e4f5c] transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-white text-brand-teal px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-brand-blush/30 py-20 md:py-32">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-brand-teal mb-6 max-w-4xl">
              Tu tutor inteligente, <br className="hidden md:block"/> siempre disponible
            </h1>
            <p className="text-lg md:text-xl text-brand-taupe mb-10 max-w-2xl">
              Mejora tus hábitos de estudio con acompañamiento personalizado. AcademIA lee tus documentos universitarios y te ayuda a dominarlos paso a paso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link 
                href="/register" 
                className="bg-brand-teal hover:bg-[#0e4f5c] text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Comenzar gratis <CheckCircle className="h-5 w-5" />
              </Link>
              <Link 
                href="/login" 
                className="bg-brand-pink/20 hover:bg-brand-pink/30 text-brand-taupe px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>

        {/* Dato Estadístico */}
        <section className="py-12 bg-white border-b border-brand-steel/10">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-brand-pink/10 rounded-2xl mb-4">
              <span className="text-4xl font-black text-brand-pink mr-2">80%</span>
            </div>
            <p className="text-lg font-medium text-brand-taupe max-w-3xl mx-auto">
              de los estudiantes universitarios en RD presenta hábitos de estudio que pueden mejorar. 
              AcademIA está aquí para cambiar esa estadística con acompañamiento adaptado a tu contexto.
            </p>
          </div>
        </section>

        {/* Cómo Funciona */}
        <section className="py-20 bg-brand-blush/10">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-brand-teal mb-12">¿Cómo funciona AcademIA?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-brand-steel/20">
                <div className="h-16 w-16 bg-brand-teal/10 rounded-full flex items-center justify-center mb-6 text-brand-teal">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Sube tus materiales</h3>
                <p className="text-brand-taupe">Carga tus PDFs, documentos de Word, presentaciones o imágenes de tus clases.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-brand-steel/20">
                <div className="h-16 w-16 bg-brand-pink/20 rounded-full flex items-center justify-center mb-6 text-brand-pink">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Chatea y aprende</h3>
                <p className="text-brand-taupe">Interactúa con el tutor IA. Sus respuestas se basan estrictamente en tus documentos.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-brand-steel/20">
                <div className="h-16 w-16 bg-brand-steel/20 rounded-full flex items-center justify-center mb-6 text-brand-steel">
                  <LineChart className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Mide tu progreso</h3>
                <p className="text-brand-taupe">Genera cuestionarios automáticos para poner a prueba tus conocimientos y ver métricas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-brand-teal mb-12">Características Principales</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FileText, title: "Contexto Estricto", desc: "Cero alucinaciones. Solo respuestas basadas en tu material." },
                { icon: Brain, title: "Técnicas Activas", desc: "Métodos Socrático y Feynman integrados en el chat." },
                { icon: BookOpen, title: "Cuestionarios", desc: "Evaluaciones adaptativas generadas al instante." },
                { icon: LineChart, title: "Dashboard", desc: "Métricas claras de tu comprensión y tiempo de estudio." }
              ].map((item, idx) => (
                <div key={idx} className="p-6 border border-brand-steel/20 rounded-xl hover:shadow-md transition-shadow">
                  <item.icon className="h-10 w-10 text-brand-teal mb-4" />
                  <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-brand-taupe">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-taupe text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-brand-pink">
            <Brain className="h-6 w-6" />
            <span className="text-xl font-bold">AcademIA</span>
          </div>
          <p className="text-brand-blush mb-2">Desarrollado para estudiantes de la PUCMM, República Dominicana.</p>
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Manuela Londoño y Angely Daritsy Brito. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
