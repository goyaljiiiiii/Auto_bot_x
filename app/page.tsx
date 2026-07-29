"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TelemetryState, TrustedContact, IncidentEvent, CheckInRecord, TrustedRelationship } from "@/app/types";
import { Navbar } from "@/app/components/Navbar";
import { LandingHero } from "@/app/components/LandingHero";
import { LiveSafetyStatus } from "@/app/components/LiveSafetyStatus";
import { GuardianStatusCard } from "@/app/components/GuardianStatusCard";
import { CheckInWidget } from "@/app/components/CheckInWidget";
import { AuraAIAssistant } from "@/app/components/AuraAIAssistant";
import { CameraView } from "@/app/components/CameraView";
import { DeviceControlPanel } from "@/app/components/DeviceControlPanel";
import { TrustedContactsPanel } from "@/app/components/TrustedContactsPanel";
import { IncidentHistoryPanel } from "@/app/components/IncidentHistoryPanel";
import { SOSActivatedModal } from "@/app/components/SOSActivatedModal";
import { DemoModeToggle } from "@/app/components/DemoModeToggle";
import { GuardianPairingModal } from "@/app/components/GuardianPairingModal";
import { WebVoiceMode } from "@/app/components/WebVoiceMode";
import { KeyRound, Copy, CheckCircle2, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";

const INITIAL_CONTACTS: TrustedContact[] = [
  {
    id: "contact-1",
    name: "Mom (Sarah)",
    relationship: "Parent / Family",
    phone: "+91 98123 45678",
    email: "mom@example.com",
    contactMethod: "WhatsApp",
    isPrimary: true,
  },
  {
    id: "contact-2",
    name: "Elena Rostova",
    relationship: "Friend / Roommate",
    phone: "+91 98765 12345",
    email: "elena@example.com",
    contactMethod: "WhatsApp",
    isPrimary: false,
  },
];

const INITIAL_RELATIONSHIPS: TrustedRelationship[] = [
  {
    id: "rel-1",
    ownerId: "usr-nandini",
    contactId: "usr-mom",
    contactName: "Mom (Sarah)",
    relationship: "Parent",
    contactEmail: "mom@example.com",
    status: "ACTIVE",
    permissions: {
      canSeeSOS: true,
      canSeeCheckIns: true,
      canSeeLocation: true,
      canSeeGuardianSessions: true,
      canSeeIncidents: true,
      canSeeCamera: true,
    },
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "voice" | "device" | "contacts" | "history">("overview");
  const [demoModeActive, setDemoModeActive] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

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
  const [relationships, setRelationships] = useState<TrustedRelationship[]>(INITIAL_RELATIONSHIPS);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentEvent[]>([]);
  const [activeSOSIncident, setActiveSOSIncident] = useState<IncidentEvent | null>(null);

  // WebSerial API Refs
  const portRef = useRef<any>(null);
  const writerRef = useRef<any>(null);

  // Load Current Logged In User
  useEffect(() => {
    const stored = localStorage.getItem("aura_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    } else {
      const defaultUser = {
        id: "usr-nandini",
        name: "Nandini Goyal",
        email: "nandini@example.com",
        role: "ACCOUNT_OWNER",
        safetyCode: "USR-8F92A1",
      };
      setCurrentUser(defaultUser);
      localStorage.setItem("aura_user", JSON.stringify(defaultUser));
    }
  }, []);

  // Fetch Geolocation
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

  // Copy Safety Code Handler
  const copySafetyCode = () => {
    if (currentUser?.safetyCode) {
      navigator.clipboard.writeText(currentUser.safetyCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

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
      console.log(`[IoT Companion Command Standby]: ${cmd}`);
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

  // Add Voluntary Check-In
  const handleAddCheckIn = (type: CheckInRecord["type"], label: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locationUrl = telemetry.latitude && telemetry.longitude
      ? `https://maps.google.com/?q=${telemetry.latitude},${telemetry.longitude}`
      : undefined;

    const newRecord: CheckInRecord = {
      id: `chk-${Date.now()}`,
      userId: currentUser?.id || "usr-nandini",
      userName: currentUser?.name || "Nandini Goyal",
      type,
      label,
      timestamp: timeStr,
      locationUrl,
      isShared: true,
    };

    setCheckIns((prev) => [newRecord, ...prev]);

    fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord),
    }).catch((e) => console.warn("Checkin logged offline"));
  };

  // Trigger Hands-Free SOS Flow
  const triggerSOSFlow = async (triggerType: string = "Hands-Free SOS Gesture") => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const locationUrl = telemetry.latitude && telemetry.longitude
      ? `https://maps.google.com/?q=${telemetry.latitude},${telemetry.longitude}`
      : undefined;

    setTelemetry((prev) => ({
      ...prev,
      safetyState: "SOS_ACTIVATED",
      emergencyLightActive: true,
      buzzerActive: true,
    }));

    sendSerialCommand("RGB:255,0,0");
    sendSerialCommand("BUZZER:1");
    sendSerialCommand("SERVO:180");

    let summaryText = `Emergency signal detected while Guardian Mode was active. System safety response initiated.`;

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
      id: `sos-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      triggerType: triggerType as any,
      status: "Alert Triggered",
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

  const runFullDemoScenario = () => {
    setDemoModeActive(true);
    if (!telemetry.guardianActive) toggleGuardianMode();
    handleAddCheckIn("LEAVING_COLLEGE", "Leaving College Campus");
    setTimeout(() => {
      triggerSOSFlow("Hands-Free SOS Gesture");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2B30]">
      {/* Navbar Header */}
      <Navbar
        demoModeActive={demoModeActive}
        onToggleDemoMode={() => setDemoModeActive(!demoModeActive)}
        isCompanionConnected={telemetry.serialState === "Connected"}
      />

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* User Safety Code Bar & Quick Solo Camera Access Banner */}
        {currentUser && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#3D2541] via-[#4A2E50] to-[#5A3B5F] text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-300/30 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5 text-[#FFF0ED]" />
              </div>
              <div>
                <p className="text-[10px] text-purple-200 uppercase font-bold tracking-wider">
                  Your Unique Safety Code (Share with Guardians)
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold tracking-widest text-[#FFF0ED]">
                    {currentUser.safetyCode || "USR-8F92A1"}
                  </span>
                  <button
                    onClick={copySafetyCode}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
              </div>
            </div>

            <Link
              href="/camera"
              className="px-4 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#D0694E] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Solo Camera View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Real-time Guardian Link Notification Requests */}
        {currentUser && (
          <GuardianPairingModal
            currentUserId={currentUser.id}
            onRelationshipAdded={() => console.log("New relationship added!")}
          />
        )}

        {/* Demo Mode Banner */}
        <DemoModeToggle
          demoModeActive={demoModeActive}
          onToggleDemoMode={() => setDemoModeActive(false)}
          onRunFullDemoScenario={runFullDemoScenario}
        />

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

        {/* Live Safety Status Panel */}
        <LiveSafetyStatus telemetry={telemetry} relationships={relationships} />

        {/* Web-Only Voice Assistant & Routine Manager Section */}
        <WebVoiceMode
          onTriggerSOS={(reason) => triggerSOSFlow(reason)}
          onNavigate={(path) => console.log("Navigate to", path)}
        />

        {/* Tab Views */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <GuardianStatusCard
                telemetry={telemetry}
                onToggleGuardianMode={toggleGuardianMode}
                onManualTriggerSOS={() => triggerSOSFlow("Manual SOS Button")}
              />

              <CameraView
                telemetry={telemetry}
                onUpdateTelemetry={setTelemetry}
                onTriggerSOS={(reason) => triggerSOSFlow(reason)}
              />

              <CheckInWidget
                onAddCheckIn={handleAddCheckIn}
                recentCheckIns={checkIns}
              />
            </div>

            {/* Right 5 Cols */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <AuraAIAssistant
                onStartGuardianMode={() => {
                  if (!telemetry.guardianActive) toggleGuardianMode();
                }}
                onCheckIn={(label) => handleAddCheckIn("CUSTOM", label)}
                onTriggerSOS={(reason) => triggerSOSFlow(reason)}
              />

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
                onUpdateContact={(updated) =>
                  setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                }
                onDeleteContact={(id) => setContacts((prev) => prev.filter((c) => c.id !== id))}
                onSendDemoAlert={(c) => triggerSOSFlow(`Demo Alert for ${c.name}`)}
              />
            </div>
          </div>
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
