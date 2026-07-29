"use client";

import React from "react";
import { TelemetryState, GuardianSafetyState } from "@/app/types";
import { Shield, Camera, Hand, Mic, Usb, MapPin, Power, CheckCircle2, AlertTriangle } from "lucide-react";

interface GuardianStatusCardProps {
  telemetry: TelemetryState;
  onToggleGuardianMode: () => void;
  onManualTriggerSOS: () => void;
}

export const GuardianStatusCard: React.FC<GuardianStatusCardProps> = ({
  telemetry,
  onToggleGuardianMode,
  onManualTriggerSOS,
}) => {
  const isSOS = telemetry.safetyState === "SOS_ACTIVATED";
  const isMonitoring = telemetry.guardianActive && telemetry.safetyState === "MONITORING";

  return (
    <div className={`p-6 md:p-8 transition-all ${
      isSOS
        ? "aura-card-sos"
        : isMonitoring
        ? "aura-card-active"
        : "aura-card"
    }`}>
      {/* Top Bar: Guardian Mode Switcher & Mode Label */}
      <div className="flex items-center justify-between border-b border-purple-100/80 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isSOS ? "bg-rose-500 animate-ping" : isMonitoring ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
          }`} />
          <span className="text-xs font-bold text-[#6B6871] uppercase tracking-wider">
            Guardian Mode Session
          </span>
        </div>

        {/* Big Guardian Mode Power Toggle */}
        <button
          onClick={onToggleGuardianMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm ${
            telemetry.guardianActive
              ? "bg-[#3D2541] text-white hover:bg-[#5A3B5F]"
              : "bg-slate-100 text-[#2D2B30] hover:bg-slate-200 border border-slate-200"
          }`}
        >
          <Power className="w-4 h-4" />
          <span>Guardian Mode: {telemetry.guardianActive ? "ACTIVE" : "OFF"}</span>
        </button>
      </div>

      {/* Large Central Status Display */}
      <div className="flex flex-col items-center justify-center text-center py-4 gap-3">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
          isSOS
            ? "bg-rose-100 text-rose-600 border border-rose-200"
            : isMonitoring
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : "bg-slate-100 text-slate-400 border border-slate-200"
        }`}>
          {isSOS ? (
            <AlertTriangle className="w-8 h-8 animate-bounce" />
          ) : isMonitoring ? (
            <Shield className="w-8 h-8 text-emerald-600 animate-pulse" />
          ) : (
            <Shield className="w-8 h-8 text-slate-400" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#2D2B30] tracking-tight">
            {isSOS ? "🔴 SOS ACTIVATED" : isMonitoring ? "🟢 Guardian Active" : "⚪ Guardian Mode Off"}
          </h2>
          <p className="text-xs text-[#6B6871] font-medium mt-1">
            {isSOS
              ? "Emergency safety response triggered. System is gathering incident details."
              : isMonitoring
              ? "Hands-free camera gesture & voice monitoring active in your environment."
              : "Press 'Activate Guardian Mode' to begin your safety monitoring session."}
          </p>
        </div>
      </div>

      {/* Status Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-purple-100/80 text-xs">
        {/* Camera */}
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#FAF7FC] border border-purple-100/70">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-medium">
            <Camera className="w-3.5 h-3.5 text-[#3D2541]" />
            <span>Camera</span>
          </div>
          <span className={`font-semibold ${telemetry.cameraActive ? "text-emerald-700" : "text-slate-400"}`}>
            {telemetry.cameraActive ? "Active" : "Standby"}
          </span>
        </div>

        {/* Gesture Detection */}
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#FAF7FC] border border-purple-100/70">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-medium">
            <Hand className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Gestures</span>
          </div>
          <span className={`font-semibold ${telemetry.gestureDetectionActive ? "text-emerald-700" : "text-slate-400"}`}>
            {telemetry.detectedGesture ? `Detected: ${telemetry.detectedGesture}` : telemetry.gestureDetectionActive ? "Monitoring" : "Off"}
          </span>
        </div>

        {/* Voice Trigger */}
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#FAF7FC] border border-purple-100/70">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-medium">
            <Mic className="w-3.5 h-3.5 text-[#3D2541]" />
            <span>Voice</span>
          </div>
          <span className={`font-semibold ${telemetry.voiceMonitoringActive ? "text-emerald-700" : "text-slate-400"}`}>
            {telemetry.voiceMonitoringActive ? "Listening" : "Off"}
          </span>
        </div>

        {/* IoT Companion */}
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#FAF7FC] border border-purple-100/70">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-medium">
            <Usb className="w-3.5 h-3.5 text-[#3D2541]" />
            <span>IoT Device</span>
          </div>
          <span className={`font-semibold ${
            telemetry.serialState === "Connected"
              ? "text-emerald-700"
              : telemetry.serialState === "Connecting"
              ? "text-amber-600"
              : "text-slate-400"
          }`}>
            {telemetry.serialState}
          </span>
        </div>

        {/* Location Pin */}
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#FAF7FC] border border-purple-100/70">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Location</span>
          </div>
          <span className={`font-semibold ${telemetry.latitude ? "text-emerald-700" : "text-amber-600"}`}>
            {telemetry.latitude ? "Pin Fixed" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
};
