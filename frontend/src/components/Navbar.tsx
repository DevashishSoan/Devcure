"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Search, Bell, RefreshCw, Activity } from "lucide-react";
import { supabase } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Don't show header on landing page or auth pages
  const isAuthPage = pathname.startsWith("/auth");
  const isLandingPage = pathname === "/";
  if (isAuthPage || isLandingPage) return null;

  return (
    <header className="h-16 border-b border-border-subtle bg-bg-surface px-8 flex items-center justify-between shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors" size={16} />
          <input
            id="global-search"
            type="text"
            placeholder="Search runs, repos, errors..."
            className="w-full bg-white/[0.03] border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 focus:border-brand-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
        </div>
        
        <button className="relative p-2 text-slate-500 hover:text-white transition-colors" id="notifications-btn">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-primary rounded-full border border-bg-deep" />
        </button>

        <div className="flex items-center gap-3 border-l border-border-subtle pl-5 ml-1 group relative">
          <button className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-200">
                {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Pro account</span>
            </div>
            <div className="w-9 h-9 rounded-full border border-border-bright bg-bg-surface overflow-hidden hover:border-brand-primary/50 transition-colors">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="m-auto text-slate-400" />
              )}
            </div>
          </button>

          <div className="absolute right-0 top-full pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
            <div className="w-48 bg-bg-elevated border border-border-subtle rounded-lg shadow-2xl p-2">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
