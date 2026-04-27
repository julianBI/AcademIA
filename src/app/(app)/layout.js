import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, LayoutDashboard, Settings, Brain } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brand-blush/10 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-teal text-white flex flex-col hidden md:flex fixed h-full">
        <div className="h-16 flex items-center px-6 border-b border-brand-steel/30">
          <Brain className="h-6 w-6 text-brand-pink mr-2" />
          <span className="text-xl font-bold tracking-tight">AcademIA</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white font-medium transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link 
            href="/subjects" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-brand-blush transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            Mis Materias
          </Link>
          <Link 
            href="/analytics" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-brand-blush transition-colors"
          >
            <Settings className="h-5 w-5" />
            Métricas
          </Link>
        </nav>

        <div className="p-4 border-t border-brand-steel/30">
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <div className="h-8 w-8 rounded-full bg-brand-pink flex items-center justify-center font-bold text-brand-taupe shrink-0">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <span className="block truncate">{user.email}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-brand-teal text-white flex items-center justify-between px-4 border-b border-brand-steel/30">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-brand-pink" />
            <span className="text-xl font-bold">AcademIA</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-pink flex items-center justify-center font-bold text-brand-taupe">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
