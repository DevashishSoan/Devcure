"use client";

import React from "react";
import {
  Activity,
  FolderGit2,
  LayoutDashboard,
  Terminal,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ stats }: { stats: any }) {
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { id: "repos", icon: FolderGit2, label: "Repositories", href: "/repos" },
    { id: "runs", icon: Activity, label: "Active Runs", href: "/runs" },
    { id: "sandbox", icon: Terminal, label: "Sandbox Logs", href: "/sandbox" },
    { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-[260px] border-r border-slate-800/60 bg-[#020617]/80 backdrop-blur-2xl p-6 flex flex-col gap-8 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Shield className="text-white" size={22} />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white">DevCure</span>
          <p className="text-[10px] text-slate-500 font-medium -mt-0.5">AUTONOMOUS QA</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/15 shadow-sm shadow-blue-500/5"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
              }`}
            >
              <item.icon
                size={18}
                className={
                  isActive
                    ? "text-blue-400"
                    : "text-slate-600 group-hover:text-blue-400/70 transition-colors"
                }
              />
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-blue-400">PRO PLAN</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {stats?.active_sandboxes || 0}/{stats?.max_sandboxes || 200} sandboxes
          </p>
          <div className="w-full h-1.5 bg-slate-800/60 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
              style={{
                width: `${
                  ((stats?.active_sandboxes || 0) /
                    (stats?.max_sandboxes || 200)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
        </div>

        {/* User Info / Logout */}
        <div className="mt-6 pt-6 border-t border-slate-800/60">
           <button 
             onClick={() => signOut()}
             className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 group"
           >
             <LogOut size={18} className="text-slate-600 group-hover:text-red-400/70" />
             <span className="text-sm font-semibold">Sign Out</span>
           </button>
        </div>
      </div>
    </aside>
  );
}
