"use client";

import React, { useState, useEffect } from "react";
import { TelemetryState } from "@/app/types";
import { Activity, ShieldCheck, Cpu, Terminal, Radio } from "lucide-react";

interface TelemetryPanelProps {
  telemetry: TelemetryState;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "gesture" | "alert" | "hardware";
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry }) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), message: "OmniSight Vision AI Engine Initialized", type: "info" },
    { timestamp: new Date().toLocaleTimeString(), message: `Loaded Profile: ${telemetry.activeProfile.name}`, type: "info" },
  ]);

  useEffect(() => {
    if (telemetry.activeGesture) {
      const entry: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        message: `Gesture Recognized: ${telemetry.activeGesture} (Conf: ${(telemetry.gestureConfidence * 100).toFixed(0)}%)`,
        type: "gesture",
      };
      setLogs((prev) => [entry, ...prev.slice(0, 19)]);
    }
  }, [telemetry.activeGesture, telemetry.gestureConfidence]);

  return (
    <div className="glass-panel p-4 rounded-xl border border-cyber-border flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-sm font-extrabold tracking-wider font-mono text-cyber-cyan">
            TELEMETRY & GESTURE LOGS
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyber-emerald">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>LIVE STREAM</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-cyber-dim block mb-1">FPS PERFORMANCE</span>
          <span className="text-lg font-bold text-cyber-cyan">{telemetry.fps} FPS</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-cyber-dim block mb-1">HARDWARE LINK</span>
          <span className={`text-lg font-bold ${telemetry.serialConnected ? "text-cyber-emerald" : "text-cyber-amber"}`}>
            {telemetry.serialConnected ? "USB ONLINE" : "EMULATED"}
          </span>
        </div>
      </div>

      {/* Live Log Terminal */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-cyber-dim">SYSTEM EVENT RECOGNITION CONSOLE:</span>
        <div className="h-40 overflow-y-auto bg-slate-950/90 border border-slate-800 rounded-lg p-3 font-mono text-[11px] flex flex-col gap-1.5">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-slate-500 font-semibold">{log.timestamp}</span>
              <span
                className={
                  log.type === "gesture"
                    ? "text-cyber-cyan font-semibold"
                    : log.type === "alert"
                    ? "text-cyber-rose font-bold"
                    : "text-slate-300"
                }
              >
                [{log.type.toUpperCase()}] {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
