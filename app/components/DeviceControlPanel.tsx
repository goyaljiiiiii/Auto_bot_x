"use client";

import React, { useState } from "react";
import { TelemetryState } from "@/app/types";
import { Usb, Bot, RotateCw, Lightbulb, Bell, ArrowUp, ArrowLeft, ArrowRight, Square, Eye, AlertCircle } from "lucide-react";

interface DeviceControlPanelProps {
  telemetry: TelemetryState;
  onConnectSerial: () => void;
  onDisconnectSerial: () => void;
  onSendSerialCommand: (cmd: string) => void;
  onUpdateTelemetry: (updater: (prev: TelemetryState) => TelemetryState) => void;
}

export const DeviceControlPanel: React.FC<DeviceControlPanelProps> = ({
  telemetry,
  onConnectSerial,
  onDisconnectSerial,
  onSendSerialCommand,
  onUpdateTelemetry,
}) => {
  const isConnected = telemetry.serialState === "Connected";
  const webSerialSupported = typeof window !== "undefined" && "serial" in navigator;

  // Servo Panning Controls (Look Around)
  const handleSetServo = (angle: number) => {
    onUpdateTelemetry((prev) => ({ ...prev, servoAngle: angle }));
    if (isConnected) {
      onSendSerialCommand(`SERVO:${angle}`);
    }
  };

  // Motor Controls (Remote Area Check)
  const handleMotorCommand = (command: string) => {
    if (isConnected) {
      onSendSerialCommand(`MOTOR:${command}`);
    }
  };

  // Light Controls
  const handleToggleLight = () => {
    const nextState = !telemetry.emergencyLightActive;
    onUpdateTelemetry((prev) => ({ ...prev, emergencyLightActive: nextState }));
    if (isConnected) {
      onSendSerialCommand(`RGB:${nextState ? "255,0,0" : "0,240,255"}`);
    }
  };

  // Buzzer Controls
  const handleToggleBuzzer = () => {
    const nextState = !telemetry.buzzerActive;
    onUpdateTelemetry((prev) => ({ ...prev, buzzerActive: nextState }));
    if (isConnected) {
      onSendSerialCommand(`BUZZER:${nextState ? 1 : 0}`);
    }
  };

  return (
    <div className="aura-card p-6 flex flex-col gap-5">
      {/* Title & Connection Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-purple-100/80 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#3D2541]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2B30]">IoT Device Control Panel</h3>
            <p className="text-xs text-[#6B6871] font-medium">Arduino Serial Link & Hardware Escort</p>
          </div>
        </div>

        {/* Connection Status Badge & Button */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            isConnected
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : telemetry.serialState === "Connecting"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-slate-100 border-slate-200 text-slate-500"
          }`}>
            {telemetry.serialState}
          </span>

          <button
            onClick={isConnected ? onDisconnectSerial : onConnectSerial}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isConnected
                ? "bg-slate-100 border-slate-200 text-[#2D2B30] hover:bg-slate-200"
                : "bg-[#3D2541] border-[#3D2541] text-white hover:bg-[#5A3B5F]"
            }`}
          >
            {isConnected ? "Disconnect Device" : "Connect Device"}
          </button>
        </div>
      </div>

      {/* WebSerial Support Notice */}
      {!webSerialSupported && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            WebSerial API is not supported in this browser. Please use Google Chrome or Microsoft Edge to connect physical USB hardware.
          </span>
        </div>
      )}

      {!isConnected && webSerialSupported && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium text-center">
          Hardware controls are disabled until an IoT companion device is connected.
        </div>
      )}

      {/* Look Around (Servo Direction Controls) */}
      <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
        isConnected ? "bg-white border-purple-100" : "bg-slate-50 border-slate-200 opacity-60 pointer-events-none"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3D2541]">
            <RotateCw className="w-4 h-4 text-[#E07A5F]" />
            <span>LOOK AROUND (Camera Direction)</span>
          </div>
          <span className="text-xs font-semibold text-[#6B6871]">{telemetry.servoAngle}° Angle</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold">
          <button
            onClick={() => handleSetServo(0)}
            disabled={!isConnected}
            className="py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#3D2541] border border-purple-100 transition-all"
          >
            Look Left (0°)
          </button>

          <button
            onClick={() => handleSetServo(90)}
            disabled={!isConnected}
            className="py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#3D2541] border border-purple-100 transition-all"
          >
            Center (90°)
          </button>

          <button
            onClick={() => handleSetServo(180)}
            disabled={!isConnected}
            className="py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#3D2541] border border-purple-100 transition-all"
          >
            Look Right (180°)
          </button>

          <button
            onClick={() => handleSetServo(180)}
            disabled={!isConnected}
            className="py-2 rounded-lg bg-[#3D2541] hover:bg-[#5A3B5F] text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-[#FFF0ED]" /> Look Behind Me
          </button>
        </div>
      </div>

      {/* Remote Area Check (Rover Inspection Controls) */}
      <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
        isConnected ? "bg-white border-purple-100" : "bg-slate-50 border-slate-200 opacity-60 pointer-events-none"
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold text-[#3D2541]">
          <Bot className="w-4 h-4 text-[#3D2541]" />
          <span>REMOTE AREA CHECK (Rover Inspection)</span>
        </div>
        <p className="text-xs text-[#6B6871]">
          Remotely move the rover a short distance to inspect an area.
        </p>

        <div className="flex flex-col items-center gap-2 my-1">
          <button
            onClick={() => handleMotorCommand("FORWARD")}
            disabled={!isConnected}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[#3D2541] hover:bg-slate-200 font-bold"
          >
            <ArrowUp className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => handleMotorCommand("LEFT")}
              disabled={!isConnected}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[#3D2541] hover:bg-slate-200 font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleMotorCommand("STOP")}
              disabled={!isConnected}
              className="p-2.5 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 hover:bg-rose-200 font-bold"
            >
              <Square className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleMotorCommand("RIGHT")}
              disabled={!isConnected}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[#3D2541] hover:bg-slate-200 font-bold"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lighting & Siren Feedback Controls */}
      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
        <button
          onClick={handleToggleLight}
          disabled={!isConnected}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
            telemetry.emergencyLightActive
              ? "bg-rose-100 border-rose-300 text-rose-700"
              : isConnected
              ? "bg-white border-purple-100 text-[#3D2541] hover:bg-purple-50"
              : "bg-slate-50 border-slate-200 text-slate-400 pointer-events-none"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Emergency Light: {telemetry.emergencyLightActive ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={handleToggleBuzzer}
          disabled={!isConnected}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
            telemetry.buzzerActive
              ? "bg-rose-100 border-rose-300 text-rose-700"
              : isConnected
              ? "bg-white border-purple-100 text-[#3D2541] hover:bg-purple-50"
              : "bg-slate-50 border-slate-200 text-slate-400 pointer-events-none"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Buzzer Siren: {telemetry.buzzerActive ? "ON" : "OFF"}</span>
        </button>
      </div>
    </div>
  );
};
