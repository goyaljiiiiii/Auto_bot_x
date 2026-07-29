"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TelemetryState, TrustedContact, IncidentEvent } from "@/app/types";
import { LandingHero } from "@/app/components/LandingHero";
import { Header } from "@/app/components/Header";
import { GuardianStatusCard } from "@/app/components/GuardianStatusCard";
import { CameraView } from "@/app/components/CameraView";
import { DeviceControlPanel } from "@/app/components/DeviceControlPanel";
import { TrustedContactsPanel } from "@/app/components/TrustedContactsPanel";
import { IncidentHistoryPanel } from "@/app/components/IncidentHistoryPanel";
import { SOSActivatedModal } from "@/app/components/SOSActivatedModal";

const INITIAL_CONTACTS: TrustedContact[] = [
  {
    id: "contact-1",
    name: "Sarah Vance",
    relationship: "Family / Sister",
    phone: "+1 (555) 019-2834",
    email: "sarah@example.com",
    contactMethod: "Demo Alert",
    isPrimary: true,
  },
  {
    id: "contact-2",
    name: "Elena Rostova",
    relationship: "Friend / Roommate",
    phone: "+1 (555) 948-1120",
    email: "elena@example.com",
    contactMethod: "Demo Alert",
    isPrimary: false,
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "device" | "contacts" | "history">("overview");

  const [telemetry, setTelemetry] = useState<TelemetryState>({
    fps: 0,
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
    latitude: null,
    longitude: null,
  });

  const [contacts, setContacts] = useState<TrustedContact[]>(INITIAL_CONTACTS);
  const [incidents, setIncidents] = useState<IncidentEvent[]>([]);
  const [activeSOSIncident, setActiveSOSIncident] = useState<IncidentEvent | null>(null);

  // WebSerial API Refs
  const portRef = useRef<any>(null);
  const writerRef = useRef<any>(null);

  // Request Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setTelemetry((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        (err) => console.warn("Location permission denied", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // WebSerial Connection Handlers
  const connectSerial = async () => {
    if ("serial" in navigator) {
      try {
        setTelemetry((prev) => ({ ...prev, serialState: "Connecting" }));
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: 115200 });

        const textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(port.writable);
        const writer = textEncoder.writable.getWriter();

        portRef.current = port;
        writerRef.current = writer;

        setTelemetry((prev) => ({
          ...prev,
          serialState: "Connected",
          serialPortName: "Arduino IoT Companion",
        }));

        await writer.write("RGB:0,240,255\n");
      } catch (err: any) {
        console.warn("WebSerial Connection Error:", err);
        setTelemetry((prev) => ({ ...prev, serialState: "Disconnected" }));
        alert("Could not connect to WebSerial USB device: " + err.message);
      }
    } else {
      alert("WebSerial API is supported in Google Chrome or Microsoft Edge.");
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
    setTelemetry((prev) => ({ ...prev, serialState: "Disconnected", serialPortName: null }));
  };

  const sendSerialCommand = useCallback(async (cmd: string) => {
    if (writerRef.current) {
      try {
        await writerRef.current.write(`${cmd}\n`);
      } catch (err) {
        console.error("Failed to write to WebSerial:", err);
      }
    } else {
      console.log(`[IoT Command Standby]: ${cmd}`);
    }
  }, []);

  // Guardian Mode Toggle
  const toggleGuardianMode = () => {
    setTelemetry((prev) => {
      const nextActive = !prev.guardianActive;
      return {
        ...prev,
        guardianActive: nextActive,
        safetyState: nextActive ? "MONITORING" : "NORMAL",
        gestureDetectionActive: nextActive,
        voiceMonitoringActive: nextActive,
      };
    });
  };

  // Trigger Hands-Free SOS Flow
  const triggerSOSFlow = async (triggerType: string = "Hands-Free SOS Gesture") => {
    const timeStr = new Date().toLocaleTimeString();
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const locationUrl = telemetry.latitude && telemetry.longitude
      ? `https://maps.google.com/?q=${telemetry.latitude},${telemetry.longitude}`
      : undefined;

    // Trigger IoT Physical Hardware Response
    setTelemetry((prev) => ({
      ...prev,
      safetyState: "SOS_ACTIVATED",
      emergencyLightActive: true,
      buzzerActive: true,
    }));

    sendSerialCommand("RGB:255,0,0");
    sendSerialCommand("BUZZER:1");
    sendSerialCommand("SERVO:180");

    // Fetch Factual Summary from Gemini API
    let summaryText = `Emergency gesture detected while Guardian Mode was active. System safety response initiated.`;

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType,
          timestamp: timeStr,
          guardianActive: telemetry.guardianActive,
          personDetected: true,
          deviceConnected: telemetry.serialState === "Connected",
          locationUrl,
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        summaryText = data.summary;
      }
    } catch (e) {
      console.warn("Using local summary fallback");
    }

    const newIncident: IncidentEvent = {
      id: `incident-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      triggerType: triggerType as any,
      status: "Demo Dispatch Logged",
      summary: summaryText,
      locationUrl,
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setActiveSOSIncident(newIncident);
  };

  const dismissSOS = () => {
    setActiveSOSIncident(null);
    setTelemetry((prev) => ({
      ...prev,
      safetyState: prev.guardianActive ? "MONITORING" : "NORMAL",
      emergencyLightActive: false,
      buzzerActive: false,
    }));

    sendSerialCommand("RGB:0,240,255");
    sendSerialCommand("BUZZER:0");
    sendSerialCommand("SERVO:90");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2B30]">
      {/* Header */}
      <Header
        telemetry={telemetry}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onConnectSerial={connectSerial}
        onDisconnectSerial={disconnectSerial}
      />

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Landing Hero */}
        <LandingHero
          onEnterGuardianMode={() => {
            if (!telemetry.guardianActive) toggleGuardianMode();
            setActiveTab("overview");
          }}
          onConnectDevice={() => {
            connectSerial();
            setActiveTab("device");
          }}
        />

        {/* Tab Views */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Central Status Card & Camera */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <GuardianStatusCard
                telemetry={telemetry}
                onToggleGuardianMode={toggleGuardianMode}
                onManualTriggerSOS={() => triggerSOSFlow("Manual Alert Button")}
              />
              <CameraView
                telemetry={telemetry}
                onUpdateTelemetry={setTelemetry}
                onTriggerSOS={(reason) => triggerSOSFlow(reason)}
              />
            </div>

            {/* Right 5 Cols: Quick Control & Contacts Preview */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <DeviceControlPanel
                telemetry={telemetry}
                onConnectSerial={connectSerial}
                onDisconnectSerial={disconnectSerial}
                onSendSerialCommand={sendSerialCommand}
                onUpdateTelemetry={setTelemetry}
              />
              <TrustedContactsPanel
                contacts={contacts}
                onAddContact={(c) => setContacts((prev) => [...prev, c])}
                onSendDemoAlert={(c) => triggerSOSFlow(`Demo Alert for ${c.name}`)}
              />
            </div>
          </div>
        )}

        {activeTab === "device" && (
          <DeviceControlPanel
            telemetry={telemetry}
            onConnectSerial={connectSerial}
            onDisconnectSerial={disconnectSerial}
            onSendSerialCommand={sendSerialCommand}
            onUpdateTelemetry={setTelemetry}
          />
        )}

        {activeTab === "contacts" && (
          <TrustedContactsPanel
            contacts={contacts}
            onAddContact={(c) => setContacts((prev) => [...prev, c])}
            onSendDemoAlert={(c) => triggerSOSFlow(`Demo Alert for ${c.name}`)}
          />
        )}

        {activeTab === "history" && (
          <IncidentHistoryPanel incidents={incidents} />
        )}
      </main>

      {/* SOS Activated Modal Overlay */}
      {activeSOSIncident && (
        <SOSActivatedModal
          incident={activeSOSIncident}
          primaryContact={contacts.find((c) => c.isPrimary) || contacts[0]}
          locationUrl={activeSOSIncident.locationUrl}
          onDismiss={dismissSOS}
        />
      )}
    </div>
  );
}
