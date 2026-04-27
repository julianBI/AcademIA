"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error("Error al registrarse: " + error.message);
        return;
      }

      toast.success("¡Registro exitoso! Verifica tu correo electrónico o inicia sesión.");
      router.push("/login");
    } catch (err) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-blush/20 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-brand-steel/20 p-8">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Brain className="h-8 w-8 text-brand-teal" />
            <span className="text-2xl font-bold text-brand-teal tracking-tight">AcademIA</span>
          </Link>
          <h2 className="text-2xl font-bold text-brand-taupe text-center">Crear Cuenta</h2>
          <p className="text-brand-steel text-sm text-center mt-2">
            Únete a AcademIA y mejora tus hábitos de estudio
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-taupe mb-1">
              Correo Institucional (PUCMM)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-brand-steel/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
              placeholder="estudiante@pucmm.edu.do"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-taupe mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-brand-steel/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-brand-taupe mb-1">
              Confirmar Contraseña
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full px-4 py-2 border border-brand-steel/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal hover:bg-[#0e4f5c] text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-brand-taupe">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-brand-teal font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
