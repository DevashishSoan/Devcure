"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Shield, Zap, Loader2, ArrowLeft, Terminal, Cpu } from "lucide-react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { supabase } from "@/lib/api";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const { cardRef, style, onMouseMove, onMouseLeave } = use3DTilt({ max: 5 });

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Auth error:", error);
      setMessage({ type: "error", text: error.message });
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Check your email for the confirmation link!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--void)] flex flex-col md:flex-row relative overflow-hidden font-[var(--font-body)]">
      {/* Background Orbs */}
      <div className="orb-1 opacity-20" />
      <div className="orb-2 opacity-10" />

      {/* ─── Left Side: Premium Intelligence Panel ─── */}
      <div className="hidden md:flex md:w-5/12 p-12 lg:p-20 flex-col justify-between relative overflow-hidden bg-[var(--surface-1)] border-r border-[var(--border)]">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--acid)] to-[var(--plasma)] flex items-center justify-center font-bold text-[var(--void)] text-sm shadow-[0_0_20px_rgba(0,255,136,0.2)]">
              DC
            </div>
            <span className="text-xl font-bold font-[var(--font-display)] text-white tracking-tight">DevCure</span>
          </Link>

          <h2 className="text-4xl lg:text-5xl font-bold font-[var(--font-display)] text-white tracking-tight mb-8 leading-[1.1]">
            Automate the <br /> 
            <span className="text-[var(--acid)]">boring parts.</span>
          </h2>

          <p className="text-[var(--text-secondary)] font-light text-lg mb-12 max-w-sm">
            Join 2,000+ engineers shipping verified patches with Gemini-powered reasoning.
          </p>

          <div className="space-y-8">
            <BenefitItem icon={Zap} title="Instant Diagnosis" desc="Root cause analysis within seconds of test failure." />
            <BenefitItem icon={Shield} title="Safety First" desc="Verified patches that guarantee zero-regression deploys." />
            <BenefitItem icon={Cpu} title="Neural Reasoning" desc="context-aware repairs that match your coding style." />
          </div>
        </div>

        {/* Mini 3D Terminal Preview */}
        <div className="relative z-10 mt-12 transform perspective-800 rotate-X-6">
          <div className="glass-card p-6 bg-black/40 border-white/5 backdrop-blur-md">
            <div className="flex gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <div className="font-mono text-[11px] space-y-1.5 opacity-80">
              <div className="text-[var(--acid)]">➜ Establishing link with infra...</div>
              <div className="text-[var(--text-muted)]">Detected: Next.js + Supabase stack</div>
              <div className="text-white">Analyzing 14 critical test failures...</div>
              <div className="text-[var(--plasma-bright)]">Generated 3 valid patches. Deploying to vVisor.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Side: Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative z-10">
        <Link href="/" className="md:hidden absolute top-8 left-8 flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        
        <div 
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="w-full max-w-[460px] glass-card p-10 md:p-12"
          style={style}
        >
          <div className="mb-10 text-center md:text-left" style={{ transform: "translateZ(30px)" }}>
            <h1 className="text-3xl font-bold font-[var(--font-display)] text-white mb-3">Create Account</h1>
            <p className="text-[var(--text-secondary)] text-sm font-light">Join the future of autonomous engineering.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6" style={{ transform: "translateZ(20px)" }}>
            <button 
              type="button"
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full h-[52px] bg-white text-[var(--void)] rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-slate-100 shadow-xl disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              Initialize with GitHub
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-[9px] font-mono uppercase tracking-[0.4em] text-[var(--text-muted)]">
                <span className="bg-[rgba(13,18,32,0.95)] px-4">OR PROTOCOL_KEY</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" placeholder="Jane" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} required />
                <InputGroup label="Last Name" placeholder="Doe" value={lastName} onChange={(e: any) => setLastName(e.target.value)} required />
              </div>
              <InputGroup label="Corporate Email" placeholder="jane@company.com" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
              <InputGroup label="Secure Password" type="password" placeholder="••••••••" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-[10px] font-mono italic ${message.type === 'error' ? 'bg-red-500/5 border border-red-500/20 text-red-400' : 'bg-green-500/5 border border-green-500/20 text-[var(--acid)]'}`}>
                &gt; {message.type === 'error' ? 'Handshake failed' : 'Signal sent'}: {message.text}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-transparent border border-[var(--acid)] text-[var(--acid)] hover:bg-[var(--acid-dim)] font-bold py-4 rounded-lg transition-all text-xs uppercase tracking-widest mt-2 h-[52px] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Deploy Account"}
            </button>

            <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
              By initializing, you agree to our <Link href="#" className="underline hover:text-white transition-colors">Terms of Autonomy</Link> and <Link href="#" className="underline hover:text-white transition-colors">Privacy Protocols</Link>.
            </p>

            <p className="text-center text-xs text-[var(--text-secondary)] mt-8">
              Protocol authorized previously?{" "}
              <Link href="/login" className="text-[var(--acid)] font-black hover:underline transition-colors uppercase tracking-widest text-[10px]">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex gap-5">
      <div className="mt-1 w-6 h-6 rounded-lg bg-[var(--acid-dim)] flex items-center justify-center shrink-0 border border-[var(--acid)]/10">
        <Icon size={14} className="text-[var(--acid)]" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{title}</h4>
        <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, placeholder, type = "text", value, onChange, required }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white/[0.02] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--acid)]/40 transition-all placeholder:text-[var(--text-dim)] shadow-inner"
      />
    </div>
  );
}
