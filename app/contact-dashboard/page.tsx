"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/app/components/Navbar";
import { CheckCircle2, Shield, MapPin, Clock, AlertTriangle, ExternalLink, Check, Users, Lock } from "lucide-react";

export default function ContactDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [ackState, setAckState] = useState<string | null>(null);

  const fetchContactData = () => {
    fetch("/api/incidents")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((e) => console.warn("Offline contact fetch", e));
  };

  useEffect(() => {
    fetchContactData();
    const interval = setInterval(fetchContactData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (incidentId: string) => {
    try {
      setAckState("Acknowledging...");
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACKNOWLEDGE",
          incidentId,
          ackByName: "Mom (Sarah)",
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setAckState("ACKNOWLEDGED");
        fetchContactData();
      }
    } catch (e) {
      console.warn("Ack error", e);
    }
  };

  const activeSOS = data?.incidents?.find((i: any) => i.status === "ACTIVE" || i.status === "ACKNOWLEDGED");

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2B30]">
      <Navbar demoModeActive={false} onToggleDemoMode={() => {}} isCompanionConnected={false} />

      <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">
        {/* Header Badge */}
        <div className="aura-card p-6 bg-gradient-to-r from-purple-900 to-[#3D2541] text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#FFF0ED]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-200">TRUSTED CIRCLE MEMBER DASHBOARD</span>
              <h1 className="text-xl font-extrabold text-white">Nandini's Safety View</h1>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold">
            Logged in as: Mom (Sarah)
          </div>
        </div>

        {/* SOS Alert Section if Active */}
        {activeSOS ? (
          <div className="aura-card-sos p-6 md:p-8 flex flex-col gap-4 shadow-lg border border-rose-300">
            <div className="flex items-center justify-between border-b border-rose-200 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-extrabold">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
                <h2 className="text-lg">🔴 SOS ALERT ACTIVATED</h2>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                activeSOS.status === "ACKNOWLEDGED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800 animate-pulse"
              }`}>
                Alert Status: {activeSOS.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <span className="text-[#6B6871] block">USER:</span>
                <strong className="text-sm font-bold text-[#3D2541]">{activeSOS.userName}</strong>
              </div>
              <div>
                <span className="text-[#6B6871] block">TRIGGER TIME:</span>
                <strong className="text-sm font-bold text-[#3D2541]">{activeSOS.startTime}</strong>
              </div>
              <div>
                <span className="text-[#6B6871] block">TRIGGER METHOD:</span>
                <strong className="text-sm font-bold text-[#3D2541]">{activeSOS.triggerType}</strong>
              </div>
              <div>
                <span className="text-[#6B6871] block">LOCATION PIN:</span>
                {activeSOS.locationUrl ? (
                  <a href={activeSOS.locationUrl} target="_blank" rel="noreferrer" className="text-[#3D2541] underline font-bold flex items-center gap-1">
                    Google Maps Link <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400">Location not attached</span>
                )}
              </div>
            </div>

            {/* Gemini Factual Summary */}
            <div className="p-4 rounded-xl bg-white border border-rose-200 text-xs">
              <span className="text-rose-700 font-bold uppercase text-[10px] block mb-1">FACTUAL INCIDENT SUMMARY (GEMINI AI):</span>
              <p className="text-[#2D2B30] font-medium leading-relaxed">{activeSOS.geminiSummary}</p>
            </div>

            {/* Acknowledge Action Button */}
            {activeSOS.status === "ACTIVE" ? (
              <button
                onClick={() => handleAcknowledge(activeSOS.id)}
                className="w-full py-3.5 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-400" /> ACKNOWLEDGE ALERT
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Alert Acknowledged by {activeSOS.acknowledgedBy} at {activeSOS.acknowledgedAt}</span>
              </div>
            )}
          </div>
        ) : (
          /* Normal Status Overview */
          <div className="aura-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-[#2D2B30]">🟢 Current Status: Safe</h2>
              </div>
              <span className="text-xs text-[#6B6871]">Updated Just Now</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
              <div className="p-4 rounded-xl bg-[#FAF7FC] border border-purple-100 flex flex-col gap-1">
                <span className="text-[#6B6871]">LAST VOLUNTARY CHECK-IN:</span>
                <strong className="text-sm font-bold text-[#3D2541]">Arrived at College Campus</strong>
                <span className="text-[10px] text-[#6B6871]">Time: 8:15 AM</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7FC] border border-purple-100 flex flex-col gap-1">
                <span className="text-[#6B6871]">GUARDIAN SESSION:</span>
                <strong className="text-sm font-bold text-slate-500">Inactive / Standby</strong>
                <span className="text-[10px] text-[#6B6871]">Session offline</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7FC] border border-purple-100 flex flex-col gap-1">
                <span className="text-[#6B6871]">LOCATION SHARING:</span>
                <strong className="text-sm font-bold text-emerald-700">Active (Shared with Mom)</strong>
                <span className="text-[10px] text-[#6B6871]">Permission Granted</span>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Checklist Card */}
        <div className="aura-card p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[#3D2541] uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#E07A5F]" /> Your Trusted Circle Permissions
          </h3>
          <p className="text-xs text-[#6B6871]">
            Nandini has granted you permission to view the following safety parameters:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-semibold">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Safety SOS Alerts
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Voluntary Check-ins
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live Location Pin
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Incident Summaries
            </div>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" /> Camera Feed (Private)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
