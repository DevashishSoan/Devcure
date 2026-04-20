"use client";

import React, { useEffect, useState } from "react";
import "@/app/landing.css";
import Link from "next/link";
import {
  Shield,
  Zap,
  ArrowRight,
  Terminal,
  Bot,
  GitPullRequest,
  Activity,
  Sparkles,
  Lock,
  BarChart3,
  GitBranch,
  CheckCircle2,
  Eye,
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="landing-root">
      {/* ═══ Ambient Background ═══ */}
      <div className="landing-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="noise-overlay" />
      </div>

      {/* ═══ Navbar ═══ */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 2 L20 6.5 L20 17.5 L12 22 L4 17.5 L4 6.5 Z" stroke="white" strokeWidth="1.5" opacity="0.3"/>
                <path d="M12 4 L18.5 7.5 L18.5 16.5 L12 20 L5.5 16.5 L5.5 7.5 Z" stroke="white" strokeWidth="1.8"/>
                <path d="M8 12 L11 15 L17 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="brand-name">DevCure</span>
          </div>

          <div className="nav-pill">
            <a href="#hero" className="nav-link active">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#metrics" className="nav-link">Metrics</a>
          </div>

          <div className="nav-actions">
            <Link href="/login" className="nav-login">Log In</Link>
            <Link href="/login" className="nav-cta">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Seamless 3D Background — Full Page ═══ */}
      <div className="scene-3d-global">
        {/* Spheres */}
        <div className="float-sphere sphere-lg" />
        <div className="float-sphere sphere-md" />
        <div className="float-sphere sphere-sm" />
        <div className="float-sphere sphere-xs sphere-xs-1" />
        <div className="float-sphere sphere-xs sphere-xs-2" />
        <div className="float-sphere sphere-xs sphere-xs-3" />
        {/* Torus rings */}
        <div className="float-torus torus-1" />
        <div className="float-torus torus-2" />
        <div className="float-torus torus-3" />
        {/* Cubes */}
        <div className="float-cube-wrapper cube-pos-1">
          <div className="float-cube">
            <div className="cube-face cube-front" />
            <div className="cube-face cube-back" />
            <div className="cube-face cube-left" />
            <div className="cube-face cube-right" />
            <div className="cube-face cube-top" />
            <div className="cube-face cube-bottom" />
          </div>
        </div>
        <div className="float-cube-wrapper cube-pos-2">
          <div className="float-cube cube-slow">
            <div className="cube-face cube-front" />
            <div className="cube-face cube-back" />
            <div className="cube-face cube-left" />
            <div className="cube-face cube-right" />
            <div className="cube-face cube-top" />
            <div className="cube-face cube-bottom" />
          </div>
        </div>
        {/* Orbiting particles */}
        <div className="orbit-ring orbit-ring-1">
          <div className="orbit-dot orbit-dot-1" />
          <div className="orbit-dot orbit-dot-2" />
          <div className="orbit-dot orbit-dot-3" />
        </div>
        <div className="orbit-ring orbit-ring-2">
          <div className="orbit-dot orbit-dot-4" />
          <div className="orbit-dot orbit-dot-5" />
        </div>
        {/* Diamonds */}
        <div className="float-diamond diamond-1" />
        <div className="float-diamond diamond-2" />
        <div className="float-diamond diamond-3" />
        {/* Glowing rings */}
        <div className="glow-ring glow-ring-1" />
        <div className="glow-ring glow-ring-2" />
        {/* Flowing ribbons */}
        <div className="flow-ribbon ribbon-1" />
        <div className="flow-ribbon ribbon-2" />
        {/* Grid mesh */}
        <div className="mesh-grid" />
        {/* Tiny particles */}
        <div className="particle p1" />
        <div className="particle p2" />
        <div className="particle p3" />
        <div className="particle p4" />
        <div className="particle p5" />
        <div className="particle p6" />
        <div className="particle p7" />
        <div className="particle p8" />
      </div>

      {/* ═══ Hero ═══ */}
      <section id="hero" className="hero-section">
        <div className="hero-badge animate-float-in" style={{ animationDelay: "0ms" }}>
          <Sparkles size={14} />
          <span>Autonomous QA Platform</span>
        </div>

        <h1 className="hero-title animate-float-in" style={{ animationDelay: "120ms" }}>
          <span className="hero-title-line">Self-Healing Code,</span>
          <span className="hero-title-gradient">Zero Human Effort.</span>
        </h1>

        <p className="hero-sub animate-float-in" style={{ animationDelay: "240ms" }}>
          DevCure detects test failures, diagnoses root causes, and ships the fix —
          <br className="hidden-mobile" />
          all via an autonomous Pull Request. Under 3 minutes.
        </p>

        <div className="hero-buttons animate-float-in" style={{ animationDelay: "360ms" }}>
          <Link href="/login" className="btn-hero-primary">
            Start Fixing — Free
            <ArrowRight size={18} />
          </Link>
          <a href="#how-it-works" className="btn-hero-secondary">
            <Eye size={16} />
            Watch it work
          </a>
        </div>

        {/* Trust logos */}
        <div className="trust-bar animate-float-in" style={{ animationDelay: "500ms" }}>
          <span className="trust-label">Trusted by teams using</span>
          <div className="trust-logos">
            <span className="trust-logo">GitHub</span>
            <span className="trust-dot" />
            <span className="trust-logo">Supabase</span>
            <span className="trust-dot" />
            <span className="trust-logo">LangGraph</span>
            <span className="trust-dot" />
            <span className="trust-logo">Gemini</span>
            <span className="trust-dot" />
            <span className="trust-logo">Docker</span>
          </div>
        </div>
      </section>

      {/* ═══ Floating Product Cards ═══ */}
      <section className="product-showcase">
        <div className="showcase-grid">
          {/* Card 1 — Terminal Demo */}
          <div className="glass-card card-terminal animate-float-in" style={{ animationDelay: "200ms" }}>
            <div className="terminal-chrome">
              <div className="terminal-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="terminal-title">devcure — agent pipeline</span>
            </div>
            <div className="terminal-body">
              <p className="t-muted">$ git push origin main</p>
              <p className="t-accent">⚡ DevCure webhook triggered</p>
              <div className="t-step">
                <span className="t-dim">[1/4]</span> Capturing baseline... <span className="t-ok">✓</span>
              </div>
              <div className="t-step">
                <span className="t-dim">[2/4]</span> Diagnosing root cause... <span className="t-ok">✓</span>
              </div>
              <div className="t-step">
                <span className="t-dim">[3/4]</span> Generating repair patch... <span className="t-ok">✓</span>
              </div>
              <div className="t-step">
                <span className="t-dim">[4/4]</span> Verifying fix... <span className="t-ok">✓</span> <span className="t-safe">0 regressions</span>
              </div>
              <p className="t-success">✅ PR opened → devcure/fix-a1b2c3</p>
              <p className="t-tiny">2m 48s · 1 iteration · pytest</p>
            </div>
          </div>

          {/* Card 2 — Live Run Card */}
          <div className="glass-card card-run animate-float-in" style={{ animationDelay: "350ms" }}>
            <div className="run-header">
              <div className="run-icon-wrap">
                <Activity size={16} className="run-icon" />
              </div>
              <div>
                <p className="run-label">Live Run</p>
                <p className="run-repo">frontend-app / main</p>
              </div>
              <span className="run-badge-live">● Running</span>
            </div>
            <div className="run-stages">
              <RunStage label="Baseline" status="done" />
              <RunStage label="Diagnose" status="done" />
              <RunStage label="Repair" status="active" />
              <RunStage label="Verify" status="pending" />
            </div>
            <div className="run-meta">
              <span>Iteration 2 / 5</span>
              <span>1m 22s</span>
            </div>
          </div>

          {/* Card 3 — PR Card */}
          <div className="glass-card card-pr animate-float-in" style={{ animationDelay: "500ms" }}>
            <div className="pr-header">
              <GitPullRequest size={18} className="pr-icon" />
              <span className="pr-title">🤖 DevCure: Fix TypeError in calculator.py</span>
            </div>
            <div className="pr-diff">
              <div className="diff-line diff-remove">- return a - b  # bug</div>
              <div className="diff-line diff-add">+ return a + b</div>
            </div>
            <div className="pr-footer">
              <span className="pr-checks"><CheckCircle2 size={12} /> All checks passed</span>
              <span className="pr-merge-btn">Merge pull request</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Everything runs on autopilot</h2>
          <p className="section-sub">Push code. DevCure handles detection, diagnosis, repair, and the PR.</p>
        </div>

        <div className="features-grid">
          <FeatureCard icon={Bot} title="AI-Powered Diagnosis" desc="Gemini Flash analyzes stack traces and source context to pinpoint root causes." gradient="purple" />
          <FeatureCard icon={Terminal} title="Sandboxed Execution" desc="Every repair runs in isolation. Your production code is never at risk." gradient="orange" />
          <FeatureCard icon={GitPullRequest} title="Auto PR Creation" desc="Fixes are pushed to a branch with a detailed Pull Request automatically." gradient="blue" />
          <FeatureCard icon={Shield} title="Safety Gate" desc="Patches are validated by strict policy — no dangerous ops, no regressions." gradient="pink" />
          <FeatureCard icon={Activity} title="Real-time Dashboard" desc="Watch runs progress live. Every stage is visible as it happens." gradient="purple" />
          <FeatureCard icon={BarChart3} title="MTTR Analytics" desc="Track Mean Time To Repair, resolution rates, and agent performance." gradient="orange" />
        </div>
      </section>

      {/* ═══ How it works ═══ */}
      <section id="how-it-works" className="steps-section">
        <div className="section-header">
          <h2 className="section-title">Four steps to self-healing</h2>
          <p className="section-sub">From git push to merged PR in under 3 minutes.</p>
        </div>
        <div className="steps-timeline">
          <div className="timeline-line" />
          <StepItem num="01" title="Baseline Capture" desc="Tests run on your unmodified code to identify pre-existing failures." />
          <StepItem num="02" title="Root Cause Diagnosis" desc="AI analyzes failure output, stack traces, and source code." />
          <StepItem num="03" title="Surgical Repair" desc="A minimal, targeted patch is generated and safety-validated." />
          <StepItem num="04" title="Verification & PR" desc="Full test suite runs post-fix. All pass → PR is opened." />
        </div>
      </section>

      {/* ═══ Metrics ═══ */}
      <section id="metrics" className="metrics-section">
        <div className="section-header">
          <h2 className="section-title">Built for speed and safety</h2>
        </div>
        <div className="metrics-grid">
          <MetricGlass value="< 3 min" label="Avg. Time to Repair" icon={Zap} />
          <MetricGlass value="0" label="Regressions Shipped" icon={Shield} />
          <MetricGlass value="100%" label="Sandboxed Execution" icon={Lock} />
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2 className="cta-title">Stop debugging.<br />Start shipping.</h2>
        <p className="cta-sub">Connect your GitHub repo and let DevCure handle the rest.</p>
        <Link href="/login" className="btn-hero-primary cta-btn">
          Get Started — Free
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="footer-icon">
              <path d="M12 4 L18.5 7.5 L18.5 16.5 L12 20 L5.5 16.5 L5.5 7.5 Z" stroke="#c084fc" strokeWidth="1.8"/>
              <path d="M8 12 L11 15 L17 9" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>DevCure</span>
            <span className="footer-divider">·</span>
            <span className="footer-tag">Autonomous QA Platform</span>
          </div>
          <p className="footer-copy">© 2026 DevCure. Built with LangGraph, Gemini & Supabase.</p>
        </div>
      </footer>
    </div>
  );
}

/* ═══ Sub-Components ═══ */

function FeatureCard({ icon: Icon, title, desc, gradient }: { icon: any; title: string; desc: string; gradient: string }) {
  const gradientMap: Record<string, string> = {
    purple: "feature-glow-purple",
    orange: "feature-glow-orange",
    blue:   "feature-glow-blue",
    pink:   "feature-glow-pink",
  };
  return (
    <div className={`feature-card ${gradientMap[gradient] || ""}`}>
      <div className="feature-icon-wrap">
        <Icon size={20} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

function StepItem({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="step-item">
      <div className="step-num">{num}</div>
      <div className="step-content">
        <h3 className="step-title">{title}</h3>
        <p className="step-desc">{desc}</p>
      </div>
    </div>
  );
}

function RunStage({ label, status }: { label: string; status: "done" | "active" | "pending" }) {
  return (
    <div className={`run-stage run-stage-${status}`}>
      <div className={`stage-dot stage-dot-${status}`} />
      <span>{label}</span>
    </div>
  );
}

function MetricGlass({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  return (
    <div className="metric-card">
      <Icon size={22} className="metric-icon" />
      <p className="metric-value">{value}</p>
      <p className="metric-label">{label}</p>
    </div>
  );
}
