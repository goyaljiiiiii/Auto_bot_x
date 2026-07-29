"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/app/components/Navbar";
import { Lock, Shield, MapPin, Camera, CheckCircle2, Eye, EyeOff, Trash2, Key } from "lucide-react";

export default function PrivacyPage() {
  const [permissions, setPermissions] = useState({
    canSeeSOS: true,
    canSeeCheckIns: true,
    canSeeLocation: true,
    canSeeGuardianSessions: true,
    canSeeIncidents: true,
    canSeeCamera: false, // Default: private
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2B30]">
      <Navbar demoModeActive={false} onToggleDemoMode={() => {}} isCompanionConnected={false} />

      <main className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="aura-card p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-[#3D2541]">
            <Lock className="w-5 h-5 text-[#E07A5F]" />
            <h1 className="text-xl font-extrabold tracking-tight">Privacy Center & Sharing Controls</h1>
          </div>
          <p className="text-xs text-[#6B6871] leading-relaxed">
            You remain in complete control of your privacy. Configure exactly who in your Trusted Circle can access your location, check-ins, safety sessions, and incident history.
          </p>
        </div>

        {/* Permissions Grid */}
        <div className="aura-card p-6 flex flex-col gap-5">
          <h2 className="text-xs font-bold text-[#3D2541] uppercase tracking-wider">
            Trusted Circle Access Permissions
          </h2>

          <div className="flex flex-col gap-3">
            {/* Location */}
            <div className="p-4 rounded-xl bg-white border border-purple-100/80 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#E07A5F]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2B30]">Live Location Sharing</h3>
                  <p className="text-xs text-[#6B6871]">Allow trusted contacts to view your location pin during active check-ins & SOS.</p>
                </div>
              </div>
              <button
                onClick={() => togglePermission("canSeeLocation")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  permissions.canSeeLocation ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                }`}
              >
                {permissions.canSeeLocation ? "Permission Granted" : "Private"}
              </button>
            </div>

            {/* Check-ins */}
            <div className="p-4 rounded-xl bg-white border border-purple-100/80 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#3D2541]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2B30]">Voluntary Check-ins Visibility</h3>
                  <p className="text-xs text-[#6B6871]">Allow trusted contacts to see when you log check-ins ("Arrived at College").</p>
                </div>
              </div>
              <button
                onClick={() => togglePermission("canSeeCheckIns")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  permissions.canSeeCheckIns ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                }`}
              >
                {permissions.canSeeCheckIns ? "Permission Granted" : "Private"}
              </button>
            </div>

            {/* Camera */}
            <div className="p-4 rounded-xl bg-white border border-purple-100/80 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#3D2541]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2B30]">Camera Feed Access (Private by Default)</h3>
                  <p className="text-xs text-[#6B6871]">Camera processing is strictly in-browser for gesture detection. Never shared unless granted.</p>
                </div>
              </div>
              <button
                onClick={() => togglePermission("canSeeCamera")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  permissions.canSeeCamera ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                }`}
              >
                {permissions.canSeeCamera ? "Permission Granted" : "Strictly Private"}
              </button>
            </div>

            {/* Incident Summaries */}
            <div className="p-4 rounded-xl bg-white border border-purple-100/80 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#3D2541]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2B30]">Incident Summaries Sharing</h3>
                  <p className="text-xs text-[#6B6871]">Allow trusted contacts to read Gemini AI factual incident summaries during an SOS.</p>
                </div>
              </div>
              <button
                onClick={() => togglePermission("canSeeIncidents")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  permissions.canSeeIncidents ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                }`}
              >
                {permissions.canSeeIncidents ? "Permission Granted" : "Private"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
