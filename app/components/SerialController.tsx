"use client";

import React, { useState } from "react";
import { TelemetryState } from "@/app/types";
import { Usb, Power, RotateCw, Lightbulb, Bell, Palette, Cpu } from "lucide-react";

interface SerialControllerProps {
  telemetry: TelemetryState;
  onSendSerialCommand: (cmd: string) => void;
  onUpdateTelemetry: (updater: (prev: TelemetryState) => TelemetryState) => void;
}

export const SerialController: React.FC<SerialControllerProps> = ({
  telemetry,
  onSendSerialCommand,
  onUpdateTelemetry,
}) => {
  const [rgbState, setRgbState] = useState<{ r: number; g: number; b: number }>({ r: 0, g: 240, b: 255 });

  const handleServoChange = (angle: number) => {
    onUpdateTelemetry((prev) => ({ ...prev, servoAngle: angle }));
    if (telemetry.serialConnected) {
      onSendSerialCommand(`SERVO:${angle}`);
    }
  };

  const handleToggleLED1 = () => {
    const nextState = !telemetry.appliance1;
    onUpdateTelemetry((prev) => ({ ...prev, appliance1: nextState }));
    if (telemetry.serialConnected) {
      onSendSerialCommand(`LED1:${nextState ? 1 : 0}`);
    }
  };

  const handleToggleLED2 = () => {
    const nextState = !telemetry.appliance2;
    onUpdateTelemetry((prev) => ({ ...prev, appliance2: nextState }));
    if (telemetry.serialConnected) {
      onSendSerialCommand(`LED2:${nextState ? 1 : 0}`);
    }
  };

  const handleSetRGB = (r: number, g: number, b: number) => {
    setRgbState({ r, g, b });
    onUpdateTelemetry((prev) => ({ ...prev, ledStatus: { r, g, b } }));
    if (telemetry.serialConnected) {
      onSendSerialCommand(`RGB:${r},${g},${b}`);
    }
  };

  const handleBuzzerTest = () => {
    if (telemetry.serialConnected) {
      onSendSerialCommand("BUZZER:1");
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-cyber-border flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Usb className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-sm font-extrabold tracking-wider font-mono text-cyber-cyan">
            WEBSERIAL HARDWARE DRIVER (IOT)
          </h2>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            telemetry.serialConnected
              ? "bg-cyber-emerald/10 border-cyber-emerald/40 text-cyber-emerald"
              : "bg-cyber-amber/10 border-cyber-amber/40 text-cyber-amber"
          }`}
        >
          {telemetry.serialConnected ? "PORT OPEN" : "EMULATED HARDWARE"}
        </span>
      </div>

      {/* Servo Pan Controls */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyber-cyan">
            <RotateCw className="w-4 h-4" />
            <span>SERVO CAMERA PAN MOTOR</span>
          </div>
          <span className="font-bold text-cyber-cyan">{telemetry.servoAngle}°</span>
        </div>

        <input
          type="range"
          min="0"
          max="180"
          value={telemetry.servoAngle}
          onChange={(e) => handleServoChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
        />

        <div className="flex justify-between text-[10px] font-mono text-cyber-dim">
          <span>0° (Left)</span>
          <span>90° (Center)</span>
          <span>180° (Right)</span>
        </div>

        {/* Auto Tracking Toggle */}
        <button
          onClick={() => onUpdateTelemetry((prev) => ({ ...prev, autoTracking: !prev.autoTracking }))}
          className={`mt-1 py-1 rounded border text-xs font-mono font-medium transition-all ${
            telemetry.autoTracking
              ? "bg-cyber-purple/20 border-cyber-purple/50 text-cyber-purple"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          {telemetry.autoTracking ? "🤖 AUTO FACE TRACKING: ACTIVE" : "⚙️ AUTO FACE TRACKING: MANUAL"}
        </button>
      </div>

      {/* Appliance LED Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* LED 1 */}
        <button
          onClick={handleToggleLED1}
          className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
            telemetry.appliance1
              ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-glow"
              : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Lightbulb className={`w-5 h-5 ${telemetry.appliance1 ? "animate-pulse" : ""}`} />
          <span className="text-xs font-mono font-semibold">
            LIGHT 1: {telemetry.appliance1 ? "ON" : "OFF"}
          </span>
        </button>

        {/* LED 2 */}
        <button
          onClick={handleToggleLED2}
          className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
            telemetry.appliance2
              ? "bg-cyber-emerald/20 border-cyber-emerald text-cyber-emerald shadow-glow-emerald"
              : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Power className={`w-5 h-5 ${telemetry.appliance2 ? "animate-pulse" : ""}`} />
          <span className="text-xs font-mono font-semibold">
            APPLIANCE 2: {telemetry.appliance2 ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      {/* RGB Status LED Presets */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
          <Palette className="w-4 h-4 text-cyber-cyan" />
          <span>AMBIENT RGB STATUS INDICATOR</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs font-mono mt-1">
          <button
            onClick={() => handleSetRGB(0, 240, 255)}
            className="py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50"
          >
            Cyan (IDLE)
          </button>
          <button
            onClick={() => handleSetRGB(16, 185, 129)}
            className="py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
          >
            Green (OK)
          </button>
          <button
            onClick={() => handleSetRGB(245, 158, 11)}
            className="py-1 rounded bg-amber-950 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50"
          >
            Amber (GSTR)
          </button>
          <button
            onClick={() => handleSetRGB(244, 63, 94)}
            className="py-1 rounded bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-900/50"
          >
            Red (SOS)
          </button>
        </div>
      </div>
    </div>
  );
};
