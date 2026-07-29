"use client";

import React from "react";
import { TelemetryState, TrustedRelationship } from "@/app/types";
import { Shield, MapPin, Camera, Bot, Users, CheckCircle2, Lock } from "lucide-react";

interface LiveSafetyStatusProps {
  telemetry: TelemetryState;
  relationships: TrustedRelationship[];
}

export const LiveSafetyStatus: React.FC<LiveSafetyStatusProps> = ({
  telemetry,
  relationships,
}) => {
  const activeTrustedContacts = relationships.filter((r) => r.status === "ACTIVE");

  return (
    <div className="aura-card p-6 flex flex-col gap-5">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-purple-100/80 pb-3">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-[#3D2541]" />
          <h2 className="text-sm font-extrabold tracking-wider font-mono text-[#3D2541]">
            LIVE SAFETY STATUS
          </h2>
        </div>
        <span className="text-xs text-[#6B6871] font-medium">Real-time Safety Check</span>
      </div>

      {/* 5 Core Questions Answer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
        {/* Q1: Guardian Session */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#FAF7FC] border border-purple-100">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-semibold">
            <Shield className="w-4 h-4 text-[#3D2541]" />
            <span>Guardian Session</span>
          </div>
          <span className={`text-sm font-bold ${telemetry.guardianActive ? "text-emerald-700" : "text-slate-400"}`}>
            {telemetry.guardianActive ? "🟢 Active" : "⚪ Inactive"}
          </span>
          <span className="text-[10px] text-[#6B6871]">Session monitoring status</span>
        </div>

        {/* Q2: Location Shared */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#FAF7FC] border border-purple-100">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-semibold">
            <MapPin className="w-4 h-4 text-[#E07A5F]" />
            <span>Location Shared</span>
          </div>
          <span className={`text-sm font-bold ${telemetry.latitude ? "text-emerald-700" : "text-amber-600"}`}>
            {telemetry.latitude ? `🟢 Shared (${activeTrustedContacts.length} Contacts)` : "⚪ Off"}
          </span>
          <span className="text-[10px] text-[#6B6871]">Active sharing control</span>
        </div>

        {/* Q3: Camera Active */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#FAF7FC] border border-purple-100">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-semibold">
            <Camera className="w-4 h-4 text-[#3D2541]" />
            <span>Camera Access</span>
          </div>
          <span className={`text-sm font-bold ${telemetry.cameraActive ? "text-emerald-700" : "text-slate-400"}`}>
            {telemetry.cameraActive ? "🟢 Active" : "⚪ Inactive"}
          </span>
          <span className="text-[10px] text-[#6B6871]">Gesture vision sensor</span>
        </div>

        {/* Q4: Aura Companion */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#FAF7FC] border border-purple-100">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-semibold">
            <Bot className="w-4 h-4 text-[#3D2541]" />
            <span>Aura Companion</span>
          </div>
          <span className={`text-sm font-bold ${
            telemetry.serialState === "Connected" ? "text-emerald-700" : "text-slate-400"
          }`}>
            {telemetry.serialState === "Connected" ? "🟢 Connected" : "⚪ Not Connected"}
          </span>
          <span className="text-[10px] text-[#6B6871]">Optional IoT extension</span>
        </div>

        {/* Q5: Trusted Circle Visibility */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#FAF7FC] border border-purple-100">
          <div className="flex items-center gap-1.5 text-[#6B6871] font-semibold">
            <Users className="w-4 h-4 text-[#3D2541]" />
            <span>Trusted Circle</span>
          </div>
          <span className="text-sm font-bold text-[#3D2541]">
            {activeTrustedContacts.length} Members
          </span>
          <span className="text-[10px] text-[#6B6871]">Permission-controlled access</span>
        </div>
      </div>
    </div>
  );
};
