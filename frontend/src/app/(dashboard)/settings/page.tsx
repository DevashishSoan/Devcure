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
  Zap
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
    slack_webhook_url: "",
    notify_on_completed: true,
    notify_on_escalated: true,
    notify_via_email: false,
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
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserSettings(settings);
      toast.success("Settings synchronized successfully");
    } catch (err) {
      toast.error("Failed to update control protocols");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-void">
        <Loader2 className="animate-spin text-acid" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-void custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-4">
            System Control
            <Shield className="text-acid" size={24} />
          </h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-[0.2em]">Neural Network Configuration & Notifications</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Slack Integration */}
          <div className="rounded-2xl border border-white/5 bg-[#080b12]/60 p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-plasma/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-plasma/10 text-plasma border border-plasma/10">
                <SlackIcon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Slack Communication</h3>
                <p className="text-xs text-slate-500">Enable real-time agent reporting to your workspace.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Webhook Endpoint URL</label>
                <input 
                  type="url" 
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.slack_webhook_url || ""}
                  onChange={(e) => setSettings({...settings, slack_webhook_url: e.target.value})}
                  className="w-full bg-void border border-white/5 rounded-xl py-4 px-5 text-sm font-mono text-plasma placeholder:text-slate-800 focus:outline-none focus:border-plasma/30 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-600 flex items-center gap-2">
                <ExternalLink size={10} />
                Generate a webhook in your Slack App Settings to receive autonomous updates.
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-white/5 bg-[#080b12]/60 p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-acid/10 text-acid border border-acid/10">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Alert Logic</h3>
                  <p className="text-xs text-slate-500">Configure notification triggers.</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <ToggleItem 
                  icon={Zap} 
                  label="On Task Completion" 
                  sub="Alert when an autonomous PR is opened."
                  active={settings.notify_on_completed}
                  onChange={(v: boolean) => setSettings({...settings, notify_on_completed: v})}
                  color="text-acid"
                />
                <ToggleItem 
                  icon={Shield} 
                  label="On Escalation" 
                  sub="Alert when the agent requires human oversight."
                  active={settings.notify_on_escalated}
                  onChange={(v: boolean) => setSettings({...settings, notify_on_escalated: v})}
                  color="text-plasma"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#080b12]/60 p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-ice/10 text-ice border border-ice/10">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Interface Channels</h3>
                  <p className="text-xs text-slate-500">Redundant reporting streams.</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <ToggleItem 
                  icon={Mail} 
                  label="Email Transmissions" 
                  sub="Receive daily summary manifests."
                  active={settings.notify_via_email}
                  onChange={(v: boolean) => setSettings({...settings, notify_via_email: v})}
                  color="text-ice"
                />
                <ToggleItem 
                  icon={Smartphone} 
                  label="Push Protocol" 
                  sub="Mobile alerts via browser interface."
                  active={false}
                  disabled={true}
                  onChange={() => {}}
                  color="text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="px-10 py-4 rounded-xl bg-acid text-void font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Update Neural Config
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleItem({ icon: Icon, label, sub, active, onChange, color, disabled }: any) {
  return (
    <div className={`flex items-center justify-between group transition-opacity ${disabled ? 'opacity-30' : 'opacity-100'}`}>
      <div className="flex items-center gap-3">
        <Icon size={16} className={`${active ? color : 'text-slate-700'} transition-colors`} />
        <div>
          <p className="text-[11px] font-bold text-white uppercase tracking-tight">{label}</p>
          <p className="text-[9px] text-slate-600 line-clamp-1">{sub}</p>
        </div>
      </div>
      <button 
        type="button"
        disabled={disabled}
        onClick={() => onChange(!active)}
        className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-acid' : 'bg-slate-800'}`}
      >
        <div className={`w-3 h-3 bg-void rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
