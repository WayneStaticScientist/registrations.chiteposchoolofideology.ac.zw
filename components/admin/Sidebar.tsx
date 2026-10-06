"use client";

import {
  Award,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import api from "@/services/api";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

function isNavActive(pathname: string | null, href: string) {
  const current = pathname?.toLowerCase() ?? "";
  const target = href.toLowerCase();
  if (target === "/") return current === "/";
  if (target === "/fees") return current === "/fees";
  return current === target || current.startsWith(`${target}/`);
}

function NavButton({
  item,
  active,
  expanded,
  onClick,
  variant = "default",
}: {
  item: { name: string; icon: LucideIcon };
  active: boolean;
  expanded: boolean;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      title={!expanded ? item.name : undefined}
      className={`group relative flex w-full items-center rounded-xl transition-all duration-200 ${
        expanded ? "gap-3 px-3 py-2.5" : "justify-center py-3 lg:px-0"
      } ${
        active
          ? "bg-emerald-800/80 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-600/40"
          : variant === "danger"
            ? "text-emerald-300/90 hover:bg-rose-500/10 hover:text-rose-300"
            : "text-emerald-200/80 hover:bg-emerald-900/60 hover:text-emerald-50"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className={`absolute top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] ${expanded ? "left-0" : "left-1 lg:left-0.5"}`}
        />
      )}
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg transition-colors ${
          expanded ? "h-9 w-9" : "h-10 w-10"
        } ${
          active
            ? "bg-emerald-700/50 text-emerald-100"
            : "bg-emerald-950/40 text-emerald-300 group-hover:bg-emerald-900/50 group-hover:text-emerald-100"
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.25 : 2} />
      </span>
      <span
        className={`truncate text-sm font-medium tracking-wide transition-all duration-300 ${
          expanded ? "opacity-100" : "lg:pointer-events-none lg:w-0 lg:opacity-0"
        }`}
      >
        {item.name}
      </span>
    </button>
  );
}

export function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  isExpanded,
  setIsExpanded,
}: {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const links: NavItem[] = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Enrollments", href: "/enrollments", icon: Users },
    { name: "Certifications", href: "/certifications", icon: Award },
    { name: "Staff & roles", href: "/employees", icon: Briefcase },
    { name: "Fee structures", href: "/fees", icon: CreditCard },
    { name: "Fee audit trail", href: "/fees/changelog", icon: History },
  ];

  const navigate = (href: string) => {
    setIsMobileOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* redirect anyway */
    }
    window.location.href = "/login";
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          role="presentation"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen shrink-0 flex-col overflow-hidden border-r border-emerald-800/40 bg-gradient-to-b from-emerald-950 via-[#022c22] to-emerald-950 text-emerald-50 shadow-2xl shadow-emerald-950/50 transition-[width,transform] duration-300 ease-out lg:relative lg:h-full lg:min-h-0 lg:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isExpanded ? "w-[17.5rem]" : "w-[5.25rem]"}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,138,46,0.18),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-emerald-500/25 to-transparent"
        />

        <div className="relative flex h-[4.75rem] shrink-0 items-center justify-between border-b border-emerald-800/50 px-4">
          <div
            className={`flex min-w-0 items-center overflow-hidden ${isExpanded ? "gap-3" : "w-full justify-center"}`}
          >
            <div className="relative flex shrink-0 rounded-2xl bg-white p-2 shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/30">
              <Image alt="Chitepo logo" height={28} src="/apple-touch-icon.png" width={28} />
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <p className="truncate text-lg font-bold leading-tight tracking-tight">
                  Chitepo
                </p>
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
                  Registrations
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-emerald-300 hover:bg-emerald-900/60 hover:text-white lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="relative shrink-0 px-3 py-5">
          {isExpanded && (
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-500/90">
              Menu
            </p>
          )}
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavButton
                key={link.href}
                active={isNavActive(pathname, link.href)}
                expanded={isExpanded}
                item={link}
                onClick={() => navigate(link.href)}
              />
            ))}
          </div>
        </nav>

        <div aria-hidden className="min-h-0 flex-1" />

        <div className="relative mt-auto shrink-0 space-y-1 border-t border-emerald-800/50 px-3 py-4">
          {isExpanded && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-500/90">
              Account
            </p>
          )}
          <NavButton
            active={false}
            expanded={isExpanded}
            item={{ name: "Sign out", icon: LogOut }}
            variant="danger"
            onClick={handleLogout}
          />
          <button
            type="button"
            className={`mt-3 hidden w-full items-center rounded-xl border border-emerald-800/60 bg-emerald-950/50 text-emerald-300 transition-all hover:border-emerald-700 hover:bg-emerald-900/50 hover:text-white lg:flex ${
              isExpanded
                ? "justify-center gap-2 px-3 py-2.5 text-sm font-medium"
                : "justify-center p-2.5"
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <>
                <ChevronLeft size={18} />
                <span>Collapse</span>
              </>
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
