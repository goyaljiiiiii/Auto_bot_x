"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/app/components/Navbar";
import { Clock, Shield, CheckCircle2, AlertTriangle, MapPin, Hand, Bot, Users } from "lucide-react";

export default function TimelinePage() {
  const [events, setEvents] = useState<any[]>([]);

  const fetchTimeline = () => {
    fetch("/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.events) {
          setEvents(data.events);
        }
      })
      .catch((e) => console.warn("Timeline fetch offline", e));
  };

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 3000);
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "CHECK_IN":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "SOS_ACTIVATED":
      case "SOS_GESTURE_DETECTED":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "CONTACT_ALERT_ACKNOWLEDGED":
        return <Users className="w-4 h-4 text-purple-600" />;
      case "AURA_COMPANION_CONNECTED":
        return <Bot className="w-4 h-4 text-[#3D2541]" />;
      default:
        return <Shield className="w-4 h-4 text-[#3D2541]" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2B30]">
      <Navbar demoModeActive={false} onToggleDemoMode={() => {}} isCompanionConnected={false} />

      <main className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="aura-card p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-[#3D2541]">
            <Clock className="w-5 h-5 text-[#E07A5F]" />
            <h1 className="text-xl font-extrabold tracking-tight">Unified Safety Timeline</h1>
          </div>
          <p className="text-xs text-[#6B6871] leading-relaxed">
            Central source of truth for all safety events, voluntary check-ins, Guardian sessions, and incident alerts.
          </p>
        </div>

        {/* Timeline Events List */}
        <div className="aura-card p-6 flex flex-col gap-5">
          <h2 className="text-xs font-bold text-[#3D2541] uppercase tracking-wider">
            Chronological Session Timeline
          </h2>

          <div className="flex flex-col gap-4 relative border-l-2 border-purple-100 pl-6 ml-3">
            {events.map((evt) => (
              <div key={evt.id} className="relative flex flex-col gap-1 text-xs">
                {/* Dot Icon */}
                <div className="absolute -left-[33px] top-0.5 w-6 h-6 rounded-full bg-white border border-purple-200 flex items-center justify-center shadow-sm">
                  {getEventIcon(evt.eventType)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#3D2541]">{evt.timestamp}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-[#3D2541]">
                    {evt.eventType}
                  </span>
                  <span className="text-[10px] text-[#6B6871]">Source: {evt.source}</span>
                </div>

                <p className="text-[#2D2B30] font-medium leading-relaxed bg-[#FAF7FC] p-3 rounded-xl border border-purple-100/80 mt-1">
                  {evt.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
