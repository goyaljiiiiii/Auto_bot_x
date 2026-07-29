"use client";

import React from "react";
import { TelemetryState } from "@/app/types";
import { Shield, Bot, Usb, CheckCircle2, AlertCircle } from "lucide-react";

interface HeaderProps {
  telemetry: TelemetryState;
  activeTab: "overview" | "device" | "contacts" | "history";
  onTabChange: (tab: "overview" | "device" | "contacts" | "history") => void;
  onConnectSerial: () => void;
  onDisconnectSerial: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  activeTab,
  onTabChange,
  onConnectSerial,
  onDisconnectSerial,
}) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#3D2541] flex items-center justify-center text-white shadow-sm">
          <Shield className="w-5 h-5 text-[#FFF0ED]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#2D2B30] tracking-tight">
            AURA SENTINEL
          </h1>
          <p className="text-xs text-[#6B6871] font-medium">
            Hands-Free Safety Companion
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-purple-50/70 p-1 rounded-xl border border-purple-100 text-xs font-semibold text-[#6B6871]">
        <button
          onClick={() => onTabChange("overview")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "overview"
              ? "bg-white text-[#3D2541] shadow-sm"
              : "hover:text-[#3D2541]"
          }`}
        >
          Guardian Dashboard
        </button>
        <button
          onClick={() => onTabChange("device")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "device"
              ? "bg-white text-[#3D2541] shadow-sm"
              : "hover:text-[#3D2541]"
          }`}
        >
          IoT Companion
        </button>
        <button
          onClick={() => onTabChange("contacts")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "contacts"
              ? "bg-white text-[#3D2541] shadow-sm"
              : "hover:text-[#3D2541]"
          }`}
        >
          Trusted Contacts
        </button>
        <button
          onClick={() => onTabChange("history")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "history"
              ? "bg-white text-[#3D2541] shadow-sm"
              : "hover:text-[#3D2541]"
          }`}
        >
          Incident Log
        </button>
      </div>

      {/* Hardware Connection Action */}
      <div className="flex items-center gap-3 text-xs font-medium">
        <button
          onClick={
            telemetry.serialState === "Connected" ? onDisconnectSerial : onConnectSerial
          }
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all ${
            telemetry.serialState === "Connected"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
              : "bg-white border-purple-200 text-[#3D2541] hover:bg-purple-50"
          }`}
        >
          <Usb className="w-3.5 h-3.5" />
          <span>
            {telemetry.serialState === "Connected"
              ? "IoT Companion Connected"
              : telemetry.serialState === "Connecting"
              ? "Connecting..."
              : "Connect IoT Companion"}
          </span>
        </button>
      </div>
    </header>
  );
};
