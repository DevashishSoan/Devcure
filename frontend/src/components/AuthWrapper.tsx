"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/api";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthWrapper: Initializing...");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthWrapper: Auth State Change:", { event, user: session?.user?.email });
      setLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthWrapper: Initial Session Check:", { user: session?.user?.email });
      setLoading(false);
    }).catch(err => {
      console.error("AuthWrapper: Session check failed:", err);
      setLoading(false);
    });

    return () => {
      console.log("AuthWrapper: Cleaning up...");
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--void)] flex flex-col items-center justify-center gap-4">
        {/* Premium Scanning Loader */}
        <div className="relative">
             <div className="absolute inset-0 bg-[var(--acid)] blur-2xl opacity-10 animate-pulse" />
             <div className="w-12 h-12 border-2 border-[var(--acid)] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[var(--text-muted)] text-[9px] font-mono tracking-[0.4em] uppercase animate-pulse">
          Validating Protocol...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
