"use client";

import React, { useState, useEffect } from "react";
import { CheckInRecord } from "@/app/types";
import { CheckCircle2, Clock, MapPin, Send, AlertCircle, Plus, Sparkles } from "lucide-react";

interface CheckInWidgetProps {
  onAddCheckIn: (type: CheckInRecord["type"], label: string, expectedMins?: number) => void;
  recentCheckIns: CheckInRecord[];
}

export const CheckInWidget: React.FC<CheckInWidgetProps> = ({
  onAddCheckIn,
  recentCheckIns,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>("ARRIVED_COLLEGE");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [expectedMins, setExpectedMins] = useState<number>(0);
  const [activeTimer, setActiveTimer] = useState<{ remainingSecs: number; label: string } | null>(null);
  const [showOverdueAlert, setShowOverdueAlert] = useState<boolean>(false);

  const presets = [
    { type: "LEAVING_HOME", label: "I'm leaving home" },
    { type: "LEAVING_COLLEGE", label: "I'm leaving college" },
    { type: "ON_MY_WAY", label: "I'm on my way" },
    { type: "ARRIVED_COLLEGE", label: "I've arrived" },
    { type: "SAFE_ARRIVAL", label: "I'm safe" },
  ];

  const handleTriggerCheckIn = (type: string, label: string) => {
    onAddCheckIn(type as CheckInRecord["type"], label);

    if (expectedMins > 0) {
      const secs = expectedMins * 60;
      setActiveTimer({ remainingSecs: secs, label });
    }
  };

  // Expected Arrival Timer Loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (activeTimer && activeTimer.remainingSecs > 0) {
      timer = setInterval(() => {
        setActiveTimer((prev) => {
          if (!prev) return null;
          if (prev.remainingSecs <= 1) {
            clearInterval(timer!);
            setShowOverdueAlert(true);
            return null;
          }
          return { ...prev, remainingSecs: prev.remainingSecs - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTimer]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="aura-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-100/80 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#3D2541]">
          <CheckCircle2 className="w-4 h-4 text-[#E07A5F]" />
          <span>VOLUNTARY CHECK-INS & ARRIVAL REMINDERS</span>
        </div>
        <span className="text-xs text-[#6B6871] text-[10px]">Permission-Controlled</span>
      </div>

      {/* Overdue Check-in Reminder Modal/Banner (Non-intrusive) */}
      {showOverdueAlert && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-[#3D2541] font-bold">
            <AlertCircle className="w-4 h-4 text-[#E07A5F]" />
            <span>Your expected check-in time has passed. Are you okay?</span>
          </div>
          <p className="text-[#6B6871]">
            Aura Sentinel does not assume danger. Choose how you would like to respond:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => {
                setShowOverdueAlert(false);
                onAddCheckIn("SAFE_ARRIVAL", "Confirmed Safe");
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#3D2541] text-white font-semibold shadow-sm"
            >
              I'm Safe
            </button>

            <button
              onClick={() => {
                setShowOverdueAlert(false);
                setActiveTimer({ remainingSecs: 15 * 60, label: "Extended Check-in" });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-purple-200 text-[#3D2541] font-semibold"
            >
              Extend 15 Mins
            </button>
          </div>
        </div>
      )}

      {/* Quick Check-In Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.type}
            onClick={() => handleTriggerCheckIn(p.type, p.label)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3D2541] border border-purple-100 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3 h-3 text-[#E07A5F]" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Expected Arrival Reminder Option */}
      <div className="p-3.5 rounded-xl bg-[#FAF7FC] border border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#6B6871] font-medium">
          <Clock className="w-4 h-4 text-[#3D2541]" />
          <span>Expected Arrival Reminder:</span>
        </div>

        <select
          value={expectedMins}
          onChange={(e) => setExpectedMins(Number(e.target.value))}
          className="bg-white border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#3D2541]"
        >
          <option value={0}>No Reminder</option>
          <option value={15}>15 Minutes</option>
          <option value={30}>30 Minutes</option>
          <option value={45}>45 Minutes</option>
          <option value={60}>1 Hour</option>
        </select>
      </div>

      {/* Active Timer Pill */}
      {activeTimer && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>Active Check-in Countdown: {activeTimer.label}</span>
          <span className="font-mono text-sm font-bold">{formatCountdown(activeTimer.remainingSecs)}</span>
        </div>
      )}
    </div>
  );
};
