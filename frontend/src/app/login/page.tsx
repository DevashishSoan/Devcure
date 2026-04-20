"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft, Terminal, Cpu, Network, Wifi } from "lucide-react";
import { use3DTilt } from "@/hooks/use3DTilt";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Show errors from the auth callback
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setMessage(decodeURIComponent(error));
    }
  }, [searchParams]);

  const { cardRef, style, parallaxOffset, onMouseMove, onMouseLeave } = use3DTilt({ max: 8 });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push("/dashboard");
    } catch (error: any) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    try {
      console.log("DC_DIAGNOSTIC: Initiating GitHub SSO...");
      if (!supabase) throw new Error("Supabase client not initialized.");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("DC_DIAGNOSTIC: GitHub SSO Failed:", err);
      alert(`Authentication Error: ${err.message || "Unknown Error"}. Please check the browser console for details.`);
      setMessage(`CRIT_FAILURE: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--text-primary)] flex items-center justify-center p-6 relative overflow-hidden font-[var(--font-body)]">
      {/* ─── Layer 0: Animated HUD Grid ─── */}
      <div 
        className="absolute inset-0 bg-grid opacity-20 pointer-events-none" 
        style={{ 
          transform: `translateX(${parallaxOffset.x * -0.5}px) translateY(${parallaxOffset.y * -0.5}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      />
      
      {/* ─── Layer 1: Background Orbs ─── */}
      <div className="orb-1" />
      <div className="orb-2" />

      {/* ─── Layer 2: Global UI Elements ─── */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors group z-50">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to home
      </Link>

      {/* ─── Main 3D Card ─── */}
      <div 
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="w-full max-w-[460px] glass-card p-10 relative z-10 overflow-hidden"
        style={style}
      >
        {/* Layer 3: Scanning Line HUD */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--acid)] to-transparent opacity-20 animate-[scanline_3s_linear_infinite] pointer-events-none" />
        <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-[var(--text-muted)] animate-[flicker_4s_infinite] pointer-events-none select-none">
          SECURE_SESSION // ESTABLISHED
        </div>

        {/* Layer 4: Telemetry Corners */}
        <div className="absolute top-2 left-2 font-mono text-[7px] text-[var(--text-dim)] uppercase tracking-tighter opacity-40">
          U_BUILD_612
        </div>
        <div className="absolute bottom-2 left-2 font-mono text-[7px] text-[var(--text-dim)] uppercase tracking-tighter opacity-40">
          CACHE_RESOLVED // OK
        </div>
        <div className="absolute bottom-2 right-2 font-mono text-[7px] text-[var(--text-dim)] uppercase tracking-tighter opacity-40">
          SSL_ENCRYPTED // V2
        </div>

        {/* Layer 5: Dynamic Glass Shine */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + parallaxOffset.x}% ${50 + parallaxOffset.y}%, rgba(255,255,255,0.05) 0%, transparent 60%)`
          }}
        />

        {/* Branding Container */}
        <div className="flex flex-col items-center mb-10" style={{ transform: "translateZ(50px)" }}>
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-[var(--acid)] blur-2xl opacity-20 animate-pulse" />
             <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--acid)] to-[var(--plasma)] flex items-center justify-center font-bold text-[var(--void)] text-lg shadow-[0_0_40px_rgba(0,255,136,0.3)]">
                DC
             </div>
          </div>
          <h1 className="text-3xl font-bold font-[var(--font-display)] text-white text-center mb-2 tracking-tight">
            Establish Session
          </h1>
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] uppercase tracking-[0.4em] font-black italic">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--acid)] animate-pulse" />
            PROTOCOL_AUTHORIZED
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleLogin} className="space-y-6" style={{ transform: "translateZ(30px)" }}>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Identifier</label>
              <Network size={10} className="text-[var(--text-dim)]" />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] group-focus-within:text-[var(--acid)] transition-colors" />
              <input
                type="email"
                placeholder="developer@entity.corp"
                className="w-full bg-white/[0.02] border border-[var(--border)] rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[var(--acid)]/40 focus:ring-1 focus:ring-[var(--acid)]/10 transition-all placeholder:text-[var(--text-dim)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Secret Key</label>
              <Wifi size={10} className="text-[var(--text-dim)]" />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] group-focus-within:text-[var(--acid)] transition-colors" />
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-white/[0.02] border border-[var(--border)] rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[var(--acid)]/40 focus:ring-1 focus:ring-[var(--acid)]/10 transition-all placeholder:text-[var(--text-dim)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {message && (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-mono italic animate-[flicker_0.5s_infinite]">
              &gt; Handshake failed: {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group h-[60px] overflow-hidden rounded-xl font-bold font-[var(--font-display)] text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-[0_20px_40px_-15px_rgba(0,255,136,0.4)]"
          >
            <div className="absolute inset-0 bg-[var(--acid)] group-hover:bg-[#12ff95] transition-colors" />
            <div className="relative text-[var(--void)] flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <ShieldCheck size={18} />
                  <span>Authorize Session</span>
                </>
              )}
            </div>
          </button>
        </form>

        <div className="relative my-12" style={{ transform: "translateZ(10px)" }}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-[0.4em] text-[var(--text-muted)]">
            <span className="bg-[#0b0e1a] px-4 font-bold">Secondary Auth Protocol</span>
          </div>
        </div>

        <button
          onClick={loginWithGitHub}
          disabled={loading}
          className="w-full bg-white text-[var(--void)] font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-widest hover:bg-slate-200 group shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
          style={{ transform: "translateZ(40px)" }}
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="font-bold">Initialize GitHub SSO</span>
        </button>

        <p className="mt-10 text-center text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest animate-[flicker_5s_infinite]">
          No session detected?{" "}
          <Link href="/signup" className="text-[var(--acid)] font-black hover:text-[#12ff95] transition-colors border-b border-[var(--acid)]/20">
            Initialize Access
          </Link>
        </p>
      </div>
    </div>
  );
}
