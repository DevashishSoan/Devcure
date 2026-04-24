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
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
        {/* Neural Fluidity Loader */}
        <div className="relative flex items-center justify-center w-20 h-20">
             <div className="absolute inset-0 bg-[#0891B2]/10 blur-3xl rounded-full animate-pulse" />
             <div className="absolute inset-0 border-t-2 border-r-2 border-[#0891B2] rounded-full animate-spin" />
             <div className="w-8 h-8 bg-[#0891B2]/20 rounded-full blur-xl" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#0891B2] text-[10px] font-black tracking-[0.5em] uppercase animate-pulse font-display">
            VALIDATING_PROTOCOL
          </p>
          <div className="h-0.5 w-32 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#0891B2] w-1/2 animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
