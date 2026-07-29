"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { UserProfile, TelemetryState, EmergencyAlert } from "@/app/types";
import { Header } from "@/app/components/Header";
import { CameraHUD } from "@/app/components/CameraHUD";
import { ProfileSelector } from "@/app/components/ProfileSelector";
import { SerialController } from "@/app/components/SerialController";
import { TelemetryPanel } from "@/app/components/TelemetryPanel";
import { VoiceAssistant } from "@/app/components/VoiceAssistant";
import { EmergencyModal } from "@/app/components/EmergencyModal";

const DEFAULT_PROFILE: UserProfile = {
  id: "profile-1",
  name: "Alex Vance",
  condition: "Parkinson's / Tremors",
  gestureSensitivity: "low",
  adaptiveMode: "head_pose",
  emergencyContact: "+1 (555) 019-2834",
  medicalNotes: "User has resting tremors in right hand. Enabled tremor-smoothing & head pose gesture controls.",
  gestures: [
    { gesture: "HEAD_TILT_RIGHT", actionName: "Toggle Main Light", targetCommand: "LED1_TOGGLE" },
    { gesture: "HEAD_NOD", actionName: "Toggle Fan / Appliance 2", targetCommand: "LED2_TOGGLE" },
    { gesture: "OPEN_PALM_HOLD", actionName: "Trigger SOS Emergency", targetCommand: "ALERT_SOS" },
  ],
};

export default function Home() {
  const [profiles, setProfiles] = useState<UserProfile[]>([DEFAULT_PROFILE]);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    fps: 0,
    faceDetected: true,
    faceName: "Alex Vance",
    activeProfile: DEFAULT_PROFILE,
    activeGesture: null,
    gestureConfidence: 0.95,
    servoAngle: 90,
    autoTracking: true,
    ledStatus: { r: 0, g: 240, b: 255 },
    appliance1: false,
    appliance2: false,
    fallDetected: false,
    voiceListening: false,
    serialConnected: false,
    serialPortName: null,
  });

  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(null);

  // WebSerial API Refs
  const portRef = useRef<any>(null);
  const writerRef = useRef<any>(null);

  // Fetch initial profiles from API
  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profiles.length > 0) {
          setProfiles(data.profiles);
          setTelemetry((prev) => ({ ...prev, activeProfile: data.profiles[0] }));
        }
      })
      .catch((err) => console.warn("Using offline default profiles", err));
  }, []);

  // WebSerial Connection Handler
  const connectSerial = async () => {
    if ("serial" in navigator) {
      try {
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: 115200 });

        const textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(port.writable);
        const writer = textEncoder.writable.getWriter();

        portRef.current = port;
        writerRef.current = writer;

        setTelemetry((prev) => ({
          ...prev,
          serialConnected: true,
          serialPortName: "Arduino USB",
        }));

        // Send initial setup RGB command
        await writer.write("RGB:0,240,255\n");
      } catch (err: any) {
        console.error("WebSerial Connection Error:", err);
        alert("Could not connect to USB serial device: " + err.message);
      }
    } else {
      alert("WebSerial API is not supported in this browser. Please use Google Chrome or Microsoft Edge!");
    }
  };

  const disconnectSerial = async () => {
    try {
      if (writerRef.current) {
        await writerRef.current.close();
        writerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (e) {
      console.warn("Serial disconnect error:", e);
    }
    setTelemetry((prev) => ({ ...prev, serialConnected: false, serialPortName: null }));
  };

  const sendSerialCommand = useCallback(async (cmd: string) => {
    if (writerRef.current) {
      try {
        await writerRef.current.write(`${cmd}\n`);
      } catch (err) {
        console.error("Failed to write to WebSerial:", err);
      }
    } else {
      console.log(`[Emulated Hardware Command]: ${cmd}`);
    }
  }, []);

  // Trigger SOS Emergency Alert
  const triggerSOS = (reason: string) => {
    const alertData: EmergencyAlert = {
      active: true,
      timestamp: new Date().toLocaleTimeString(),
      reason,
      user: telemetry.activeProfile.name,
    };
    setEmergencyAlert(alertData);

    // Turn RGB Red Strobe
    setTelemetry((prev) => ({ ...prev, ledStatus: { r: 255, g: 0, b: 0 } }));
    sendSerialCommand("RGB:255,0,0");
    sendSerialCommand("BUZZER:1");

    // Dispatch notification to API
    fetch("/api/alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alertData),
    }).catch((e) => console.warn("Offline alert logged"));
  };

  const dismissSOS = () => {
    setEmergencyAlert(null);
    setTelemetry((prev) => ({ ...prev, ledStatus: { r: 0, g: 240, b: 255 } }));
    sendSerialCommand("RGB:0,240,255");
    sendSerialCommand("BUZZER:0");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070e] text-slate-100">
      {/* Header */}
      <Header
        telemetry={telemetry}
        onConnectSerial={connectSerial}
        onDisconnectSerial={disconnectSerial}
        profiles={profiles}
        onSelectProfile={(p) => setTelemetry((prev) => ({ ...prev, activeProfile: p }))}
      />

      {/* Main Grid Layout */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1700px] w-full mx-auto">
        {/* Left Column: Camera HUD & Voice (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <CameraHUD
            telemetry={telemetry}
            onUpdateTelemetry={setTelemetry}
            onTriggerSOS={triggerSOS}
            onSendSerialCommand={sendSerialCommand}
          />
          <VoiceAssistant
            telemetry={telemetry}
            onUpdateTelemetry={setTelemetry}
            onSendSerialCommand={sendSerialCommand}
            onTriggerSOS={triggerSOS}
          />
        </div>

        {/* Right Column: Medical Profiles, WebSerial Hardware Driver & Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ProfileSelector
            activeProfile={telemetry.activeProfile}
            profiles={profiles}
            onSelectProfile={(p) => setTelemetry((prev) => ({ ...prev, activeProfile: p }))}
            onSaveProfile={(updated) => {
              setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
              setTelemetry((prev) => ({ ...prev, activeProfile: updated }));
            }}
          />

          <SerialController
            telemetry={telemetry}
            onSendSerialCommand={sendSerialCommand}
            onUpdateTelemetry={setTelemetry}
          />

          <TelemetryPanel telemetry={telemetry} />
        </div>
      </main>

      {/* Emergency SOS Modal Overlay */}
      {emergencyAlert && (
        <EmergencyModal
          alertData={emergencyAlert}
          emergencyContact={telemetry.activeProfile.emergencyContact}
          onDismiss={dismissSOS}
        />
      )}
    </div>
  );
}
