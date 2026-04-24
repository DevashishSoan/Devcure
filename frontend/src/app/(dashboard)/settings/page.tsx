"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  MessageSquare, 
  Shield, 
  Save, 
  Loader2, 
  ExternalLink,
  Smartphone,
  Mail,
  Zap,
  User,
  Building2,
  Cpu,
  Fingerprint,
  Target,
  Workflow
} from "lucide-react";
import { fetchUserSettings, updateUserSettings } from "@/lib/api";
import { toast } from "@/lib/toast";

const SlackIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.523-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.52 2.522v2.52H8.834zM8.834 6.313a2.527 2.527 0 0 1 2.52 2.521 2.527 2.527 0 0 1-2.52 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.958 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.52 2.521h-2.522v-2.521zM17.687 8.834a2.527 2.527 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.166 18.958a2.528 2.528 0 0 1 2.52-2.522 2.528 2.528 0 0 1 2.522 2.522a2.527 2.527 0 0 1-2.522 2.52h-2.52v-2.52zM15.166 17.687a2.527 2.527 0 0 1-2.52-2.521 2.527 2.527 0 0 1 2.52-2.521h6.313A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/>
  </svg>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    display_name: "",
    organization_name: "",
    slack_webhook_url: "",
    notify_on_completed: true,
    notify_on_escalated: true,
    notify_via_email: false,
    ai_provider: "gemini",
    agent_personality: "Surgical",
    auto_repair_threshold: 0.7,
    max_repair_iterations: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await fetchUserSettings();
      if (data) setSettings(data);
    } catch (err) {
      toast.error("Failed to load neural configuration");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserSettings(settings);
      toast.success("Identity & Protocols synchronized");
    } catch (err) {
      toast.error("Failed to update control protocols");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-void">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border border-acid/20 rounded-full animate-ping" />
          <Loader2 className="animate-spin text-acid" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-void custom-scrollbar relative">
      {/* Neural Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-plasma/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-acid/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
             <Fingerprint className="text-[#0891B2]" size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">System_Control / Settings</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-4">
            Identity & Protocols
            <Shield className="text-[#0891B2]" size={24} />
          </h1>
          <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
            Configure your neural signature, agent personality parameters, and notification hooks for real-time autonomous reporting.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Identity Section */}
          <div className="rounded-[32px] border border-white/5 bg-zinc-950/40 backdrop-blur-2xl p-10 space-y-8 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-2xl bg-[#0891B2]/10 text-[#0891B2] border border-[#0891B2]/10 shadow-[0_0_15px_rgba(8,145,178,0.1)]">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Neural Identity</h3>
                <p className="text-xs text-zinc-500">Your profile signature across the platform.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-2">
                   <Target size={12} /> Display Name
                 </label>
                 <input 
                   type="text" 
                   placeholder="Neural Architect"
                   value={settings.display_name || ""}
                   onChange={(e) => setSettings({...settings, display_name: e.target.value})}
                   className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-[#0891B2]/30 transition-all shadow-inner"
                 />
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-2">
                   <Building2 size={12} /> Organization
                 </label>
                 <input 
                   type="text" 
                   placeholder="DevCure Labs"
                   value={settings.organization_name || ""}
                   onChange={(e) => setSettings({...settings, organization_name: e.target.value})}
                   className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-[#0891B2]/30 transition-all shadow-inner"
                 />
               </div>
            </div>
          </div>

          {/* Integration & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Slack */}
            <div className="rounded-[32px] border border-white/5 bg-zinc-950/40 backdrop-blur-2xl p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-plasma/10 text-plasma border border-plasma/10">
                  <SlackIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Neural Hooks</h3>
                  <p className="text-xs text-zinc-500">Slack workspace integration.</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Webhook URL</label>
                <input 
                  type="url" 
                  placeholder="https://hooks.slack.com/..."
                  value={settings.slack_webhook_url || ""}
                  onChange={(e) => setSettings({...settings, slack_webhook_url: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-mono text-plasma placeholder:text-zinc-900 focus:outline-none focus:border-plasma/30 transition-all"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-[32px] border border-white/5 bg-zinc-950/40 backdrop-blur-2xl p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[#0891B2]/10 text-[#0891B2] border border-[#0891B2]/10">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Alert Logic</h3>
                  <p className="text-xs text-zinc-500">Configure trigger conditions.</p>
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <ToggleItem 
                  icon={Zap} 
                  label="On Task Completion" 
                  sub="Alert when a patch is verified."
                  active={settings.notify_on_completed}
                  onChange={(v: boolean) => setSettings({...settings, notify_on_completed: v})}
                  color="text-[#0891B2]"
                />
                <ToggleItem 
                  icon={Shield} 
                  label="On Escalation" 
                  sub="Alert when human review is needed."
                  active={settings.notify_on_escalated}
                  onChange={(v: boolean) => setSettings({...settings, notify_on_escalated: v})}
                  color="text-plasma"
                />
              </div>
            </div>
          </div>

          {/* Neuro-Config */}
          <div className="rounded-[32px] border border-white/5 bg-zinc-950/40 backdrop-blur-2xl p-10 space-y-10 relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-acid/10 text-acid border border-acid/10">
                <Workflow size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Neuro-Config Protocols</h3>
                <p className="text-xs text-zinc-500">Fine-tune the autonomous repair engine core logic.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Intelligence Brain */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 block">LLM Substrate</label>
                <select 
                  value={settings.ai_provider || "gemini"}
                  onChange={(e) => setSettings({...settings, ai_provider: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-[11px] font-bold text-white focus:outline-none focus:border-[#0891B2]/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="gemini" className="bg-zinc-900 text-white">Gemini 2.0 Flash</option>
                  <option value="gpt4" className="bg-zinc-900 text-white">GPT-4o Precision</option>
                  <option value="claude" className="bg-zinc-900 text-white">Claude 3.5 Sonnet</option>
                </select>
              </div>

              {/* Personality */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 block">Logic Persona</label>
                <select 
                  value={settings.agent_personality || "Surgical"}
                  onChange={(e) => setSettings({...settings, agent_personality: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-[11px] font-bold text-white focus:outline-none focus:border-[#0891B2]/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="Surgical" className="bg-zinc-900 text-white">Surgical (Default)</option>
                  <option value="Bold" className="bg-zinc-900 text-white">Bold (Structural)</option>
                  <option value="Creative" className="bg-zinc-900 text-white">Creative (Agile)</option>
                </select>
              </div>

              {/* Threshold */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Confidence Gate</label>
                  <span className="text-[10px] font-black font-mono text-acid">{(settings.auto_repair_threshold * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1"
                  value={settings.auto_repair_threshold || 0.7}
                  onChange={(e) => setSettings({...settings, auto_repair_threshold: parseFloat(e.target.value)})}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-acid mt-2"
                />
              </div>

              {/* Iterations */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Max Iterations</label>
                  <span className="text-[10px] font-black font-mono text-ice">{settings.max_repair_iterations || 5} CYCLES</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={settings.max_repair_iterations || 5}
                  onChange={(e) => setSettings({...settings, max_repair_iterations: parseInt(e.target.value)})}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-ice mt-2"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="group px-12 py-5 rounded-full bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-[#0891B2] hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] disabled:opacity-50 flex items-center gap-4"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Sync_Protocols
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleItem({ icon: Icon, label, sub, active, onChange, color, disabled }: any) {
  return (
    <div className={`flex items-center justify-between group transition-all ${disabled ? 'opacity-30' : 'opacity-100'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-zinc-900 border border-white/10' : 'bg-transparent border border-white/5'}`}>
          <Icon size={14} className={`${active ? color : 'text-zinc-700'} transition-colors`} />
        </div>
        <div>
          <p className="text-[11px] font-black text-white uppercase tracking-tight">{label}</p>
          <p className="text-[9px] text-zinc-600 line-clamp-1">{sub}</p>
        </div>
      </div>
      <button 
        type="button"
        disabled={disabled}
        onClick={() => onChange(!active)}
        className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-[#0891B2]' : 'bg-zinc-800'}`}
      >
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
