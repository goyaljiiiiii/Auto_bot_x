"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CameraView } from "@/app/components/CameraView";
import { Navbar } from "@/app/components/Navbar";
import { TelemetryState } from "@/app/types";
import { ArrowLeft, Shield, Eye, Info, Sparkles, Volume2 } from "lucide-react";
import { WebVoiceMode } from "@/app/components/WebVoiceMode";

export default function SoloCameraPage() {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    fps: 0,
    guardianActive: true,
    safetyState: "NORMAL",
    cameraActive: true,
    gestureDetectionActive: true,
    detectedGesture: null,
    voiceMonitoringActive: false,
    serialState: "Disconnected",
    serialPortName: null,
    servoAngle: 90,
    emergencyLightActive: false,
    buzzerActive: false,
    latitude: null,
    longitude: null,
  });

  const [demoModeActive, setDemoModeActive] = useState<boolean>(false);
  const [showVoiceAssist, setShowVoiceAssist] = useState<boolean>(false);

  const handleTriggerSOS = (reason: string) => {
    alert(`🚨 SOS ALERT DETECTED FROM CAMERA: ${reason}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2B30] flex flex-col">
      <Navbar
        demoModeActive={demoModeActive}
        onToggleDemoMode={() => setDemoModeActive((prev) => !prev)}
        isCompanionConnected={false}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col gap-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3D2541] font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </Link>

            <div>
              <h1 className="text-base font-extrabold text-[#2D2B30] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#3D2541]" />
                Solo AI Vision Sentinel
              </h1>
              <p className="text-xs text-[#6B6871]">
                Full viewport camera with MediaPipe Hand Skeleton & Object Detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceAssist((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                showVoiceAssist
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white border-purple-200 text-[#3D2541] hover:bg-purple-50"
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#E07A5F]" />
              <span>{showVoiceAssist ? "Hide Voice Command" : "Web Voice Assist"}</span>
            </button>

            <Link
              href="/info"
              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3D2541] text-xs font-bold flex items-center gap-1.5 border border-purple-200 transition-all"
            >
              <Info className="w-4 h-4" />
              <span>Device Info Page</span>
            </Link>
          </div>
        </div>

        {/* Optional Web Voice Assistant Popup */}
        {showVoiceAssist && (
          <div className="mb-2">
            <WebVoiceMode
              onTriggerSOS={handleTriggerSOS}
              onNavigate={(path) => console.log("Navigate", path)}
            />
          </div>
        )}

        {/* Solo Camera Component */}
        <div className="w-full">
          <CameraView
            telemetry={telemetry}
            onUpdateTelemetry={(updater) => setTelemetry(updater)}
            onTriggerSOS={handleTriggerSOS}
            isSoloPage={true}
          />
        </div>
      </main>
    </div>
  );
}
