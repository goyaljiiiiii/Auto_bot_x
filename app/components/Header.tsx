"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, TelemetryState } from "@/app/types";
import { Activity, ShieldAlert, Cpu, Usb, HeartPulse, User } from "lucide-react";

interface HeaderProps {
  telemetry: TelemetryState;
  onConnectSerial: () => void;
  onDisconnectSerial: () => void;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  onConnectSerial,
  onDisconnectSerial,
  profiles,
  onSelectProfile,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full glass-panel border-b border-cyber-border px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan shadow-glow">
          <Activity className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyber-emerald rounded-full animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyber-cyan via-blue-400 to-cyber-purple bg-clip-text text-transparent">
              OMNISIGHT CARE
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              v2.5 AI
            </span>
          </div>
          <p className="text-xs text-cyber-dim font-mono">
            Assistive IoT & Vision Guard • Hackathon Edition
          </p>
        </div>
      </div>

      {/* Profile Badge & Switcher */}
      <div className="flex items-center gap-2 bg-cyber-card border border-cyber-border px-3 py-1.5 rounded-lg">
        <HeartPulse className="w-4 h-4 text-cyber-rose animate-pulse" />
        <div className="flex flex-col">
          <span className="text-[10px] text-cyber-dim font-mono">ACTIVE MEDICAL PROFILE</span>
          <select
            value={telemetry.activeProfile.id}
            onChange={(e) => {
              const selected = profiles.find((p) => p.id === e.target.value);
              if (selected) onSelectProfile(selected);
            }}
            className="bg-transparent text-sm font-semibold text-cyber-cyan focus:outline-none cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.name} ({p.condition})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live System Indicators */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800">
          <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>FPS: <strong className="text-cyber-cyan">{telemetry.fps}</strong></span>
        </div>

        {/* WebSerial USB Connection Button */}
        <button
          onClick={telemetry.serialConnected ? onDisconnectSerial : onConnectSerial}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-all ${
            telemetry.serialConnected
              ? "bg-cyber-emerald/10 border border-cyber-emerald/40 text-cyber-emerald hover:bg-cyber-emerald/20 shadow-glow-emerald"
              : "bg-cyber-amber/10 border border-cyber-amber/40 text-cyber-amber hover:bg-cyber-amber/20"
          }`}
        >
          <Usb className="w-4 h-4" />
          <span>{telemetry.serialConnected ? "Arduino Connected" : "Connect Arduino (USB)"}</span>
        </button>

        {/* Live Clock */}
        <div className="hidden md:block text-slate-400 font-mono text-xs border-l border-slate-800 pl-4">
          {currentTime}
        </div>
      </div>
    </header>
  );
};
