"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/app/components/Navbar";
import { DeviceControlPanel } from "@/app/components/DeviceControlPanel";
import { IncidentHistoryPanel } from "@/app/components/IncidentHistoryPanel";
import { TelemetryState, IncidentEvent } from "@/app/types";
import { ArrowLeft, Info, Bot, ShieldCheck, Cpu, HardDrive, Terminal } from "lucide-react";

export default function InfoPage() {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    fps: 30,
    guardianActive: false,
    safetyState: "NORMAL",
    cameraActive: false,
    gestureDetectionActive: false,
    detectedGesture: null,
    voiceMonitoringActive: false,
    serialState: "Disconnected",
    serialPortName: null,
    servoAngle: 90,
    emergencyLightActive: false,
    buzzerActive: false,
    latitude: 28.6139,
    longitude: 77.2090,
  });

  const [incidents, setIncidents] = useState<IncidentEvent[]>([]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2B30] flex flex-col">
      <Navbar
        demoModeActive={false}
        onToggleDemoMode={() => {}}
        isCompanionConnected={telemetry.serialState === "Connected"}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3D2541] font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <div>
              <h1 className="text-base font-extrabold text-[#2D2B30] flex items-center gap-2">
                <Info className="w-5 h-5 text-[#3D2541]" />
                System Information & Hardware Device Control
              </h1>
              <p className="text-xs text-[#6B6871]">
                Hardware Rover WebSerial interface, telemetry diagnostic logs, and platform specs
              </p>
            </div>
          </div>

          <Link
            href="/camera"
            className="px-4 py-2 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <span>Open Solo Camera</span>
          </Link>
        </div>

        {/* System Specifications Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="aura-card p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#3D2541] uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Computer Vision Engine</span>
            </div>
            <p className="text-xs text-[#6B6871]">
              MediaPipe Hands 21-Joint Pipeline with TensorFlow.js COCO-SSD Object Detector.
            </p>
            <span className="text-[11px] font-mono bg-purple-50 text-purple-800 p-1.5 rounded-lg font-semibold mt-1">
              Active FPS: {telemetry.fps} FPS • Canvas Accelerated
            </span>
          </div>

          <div className="aura-card p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#3D2541] uppercase tracking-wider">
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>IoT Rover Companion</span>
            </div>
            <p className="text-xs text-[#6B6871]">
              Arduino UNO / ESP32 WebSerial dual-way physical emergency light & servo turret control.
            </p>
            <span className="text-[11px] font-mono bg-emerald-50 text-emerald-800 p-1.5 rounded-lg font-semibold mt-1">
              Baud Rate: 115200 • Status: {telemetry.serialState}
            </span>
          </div>

          <div className="aura-card p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#3D2541] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Safety & Protection Status</span>
            </div>
            <p className="text-xs text-[#6B6871]">
              Instant SOS dispatch with automated WhatsApp alerts, direct voice emergency links & guardian pairing.
            </p>
            <span className="text-[11px] font-mono bg-amber-50 text-amber-800 p-1.5 rounded-lg font-semibold mt-1">
              State: {telemetry.safetyState}
            </span>
          </div>
        </div>

        {/* Hardware & Diagnostic Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceControlPanel
            telemetry={telemetry}
            onConnectSerial={() => {}}
            onDisconnectSerial={() => {}}
            onSendSerialCommand={(cmd) => console.log("Serial Command:", cmd)}
            onUpdateTelemetry={(updater) => setTelemetry(updater)}
          />

          <IncidentHistoryPanel
            incidents={incidents}
          />
        </div>
      </main>
    </div>
  );
}
