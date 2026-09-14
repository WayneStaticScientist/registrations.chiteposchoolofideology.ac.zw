"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard,
  Briefcase,
  LogOut,
  Settings
} from "lucide-react";
import Image from "next/image";

export const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Enrollments",
      href: "/enrollments",
      icon: Users,
    },
    {
      name: "Staff & Roles",
      href: "/employees",
      icon: Briefcase,
    },
    {
      name: "Fee Structures",
      href: "/fees",
      icon: CreditCard,
    },
  ];

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-300 min-h-screen flex flex-col fixed left-0 top-0 border-r border-zinc-800/50 shadow-2xl z-50">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-900/20">
            <Image
              src={"/apple-touch-icon.png"}
              width={24}
              height={24}
              alt={"logo"}
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase text-white leading-tight">
              Chitepo
            </h1>
            <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase leading-tight">
              Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">Menu</p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 font-medium" 
                  : "hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors duration-300 ${
                  isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
                }`} 
              />
              {link.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-zinc-800/50">
        <button className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-300">
          <Settings size={20} className="text-zinc-500" />
          Settings
        </button>
        <button className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 mt-1">
          <LogOut size={20} className="text-zinc-500 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
