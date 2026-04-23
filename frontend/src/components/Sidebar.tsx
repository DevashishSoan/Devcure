"use client";

import React from "react";
import {
  Activity,
  FolderGit2,
  LayoutDashboard,
  Settings,
  Shield,
  LogOut,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import { signOut } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { id: "repos", icon: FolderGit2, label: "Repositories", href: "/repos" },
    { id: "runs", icon: Activity, label: "History", href: "/runs" },
    { id: "settings", icon: Settings, label: "Configuration", href: "/settings" },
  ];

  const isAuthPage = pathname?.startsWith("/auth");
  const isLandingPage = pathname === "/";
  if (isAuthPage || isLandingPage) return null;

  return (
    <aside className="w-64 h-full bg-black border-r border-white/[0.05] flex flex-col z-50">
      {/* Brand Header */}
      <div className="p-7 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg">
            <Shield className="text-black" size={16} strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold tracking-tight text-white">DevCure</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="px-3 mb-4 flex items-center justify-between">
           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Platform</span>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-white/[0.03] text-white border border-white/[0.04]"
                  : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-[var(--acid)]" : "text-zinc-600 group-hover:text-zinc-400"}
                />
                <span className="text-sm font-medium tracking-tight truncate">{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1 h-4 rounded-full bg-[var(--acid)] shadow-[0_0_8px_rgba(63,185,80,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info / User Actions */}
      <div className="p-6 mt-auto border-t border-white/[0.03]">
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.03] mb-4 group hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden relative">
           <div className="absolute top-0 right-0 p-2 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={14} />
           </div>
           <p className="text-[9px] font-bold text-[var(--acid)] uppercase tracking-widest mb-1.5">System Status</p>
           <p className="text-[11px] font-bold text-zinc-300">Protocol 12-Alpha</p>
           <div className="mt-3 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full w-[65%] bg-[var(--acid)] shadow-[0_0_8px_rgba(63,185,80,0.4)]" />
           </div>
        </div>

        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all text-sm font-medium group"
        >
          <LogOut size={16} className="text-zinc-600 group-hover:text-rose-400" />
          <span>Termination</span>
        </button>
      </div>
    </aside>
  );
}
