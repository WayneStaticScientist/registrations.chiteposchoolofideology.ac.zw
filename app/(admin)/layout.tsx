"use client";

import { Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Sidebar } from "@/components/admin/Sidebar";
import api from "@/services/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get("/users/admin/dashboard/stats");
        setCheckingAuth(false);
      } catch {
        router.replace("/login");
      }
    };
    verify();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar
        isExpanded={isExpanded}
        isMobileOpen={isMobileOpen}
        setIsExpanded={setIsExpanded}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Administration
              </p>
              <h2 className="text-lg font-bold text-slate-800 md:text-xl">
                Registrations portal
              </h2>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <User size={20} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
