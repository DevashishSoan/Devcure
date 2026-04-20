"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { toast, Toast as ToastType } from "@/lib/toast";

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
}

function ToastItem({ id, message, type }: ToastType) {
  const styles = {
    success: { bg: "bg-surface-2", border: "border-acid/20", accent: "bg-acid", icon: <CheckCircle2 className="text-acid" size={18} /> },
    error: { bg: "bg-surface-2", border: "border-red-500/20", accent: "bg-red-500", icon: <AlertCircle className="text-red-500" size={18} /> },
    warning: { bg: "bg-surface-2", border: "border-amber-500/20", accent: "bg-amber-500", icon: <AlertTriangle className="text-amber-500" size={18} /> },
    info: { bg: "bg-surface-2", border: "border-ice/20", accent: "bg-ice", icon: <Info className="text-ice" size={18} /> },
  };

  const s = styles[type];

  return (
    <div className={`pointer-events-auto flex items-stretch min-w-[320px] max-w-[420px] rounded-xl border ${s.border} ${s.bg} shadow-2xl overflow-hidden animate-in slide-in-from-right-full duration-300`}>
      <div className={`w-1.5 ${s.accent} shrink-0`} />
      <div className="flex-1 p-4 flex gap-3 items-start">
        <div className="mt-0.5 shrink-0">{s.icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white/90 leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={() => toast.dismiss(id)}
          className="text-text-muted hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
