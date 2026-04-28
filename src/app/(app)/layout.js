import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/auth/LogoutButton";
import { Brain } from "lucide-react";

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brand-blush/10 flex">
      <Sidebar userEmail={user.email} />

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
