"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Plus, Trash2, Clock, MapPin, CheckCircle2, ShieldAlert } from "lucide-react";
import { RoutineItem } from "@/app/types";

interface WebVoiceModeProps {
  onTriggerSOS?: (reason: string) => void;
  onNavigate?: (path: string) => void;
}

export const WebVoiceMode: React.FC<WebVoiceModeProps> = ({ onTriggerSOS, onNavigate }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [assistantResponse, setAssistantResponse] = useState<string>(
    "Hi! I am your AURA Web Voice Assistant. Speak your routine or safety command."
  );

  const [routines, setRoutines] = useState<RoutineItem[]>([
    {
      id: "rt-1",
      userId: "usr-nandini",
      label: "Morning College Commute",
      time: "08:30 AM",
      locationLabel: "Campus Gate 2",
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      isShared: true,
    },
    {
      id: "rt-2",
      userId: "usr-nandini",
      label: "Evening Library Return",
      time: "06:00 PM",
      locationLabel: "Main Library",
      daysOfWeek: ["Mon", "Wed", "Fri"],
      isShared: true,
    },
  ]);

  const [newLabel, setNewLabel] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("09:00 AM");
  const [newLoc, setNewLoc] = useState<string>("College Campus");

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            handleVoiceCommand(text);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [routines]);

  const speak = (text: string) => {
    setAssistantResponse(text);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase();

    // 1. SOS Trigger Command
    if (text.includes("sos") || text.includes("help") || text.includes("emergency")) {
      speak("Emergency signal recognized. Activating high-priority SOS alert now.");
      if (onTriggerSOS) onTriggerSOS("Voice Emergency Command");
      return;
    }

    // 2. Add Routine Command (e.g., "add routine college commute at 9 am")
    if (text.includes("add routine") || text.includes("routine")) {
      const routineName = rawText.replace(/add routine|routine/gi, "").trim() || "Daily Commute";
      const newItem: RoutineItem = {
        id: `rt-${Date.now()}`,
        userId: "usr-nandini",
        label: routineName,
        time: "09:00 AM",
        locationLabel: "Main Campus",
        isShared: true,
      };

      setRoutines((prev) => [newItem, ...prev]);
      speak(`Added new routine: ${routineName} at 9:00 AM.`);
      return;
    }

    // 3. Read Routine Schedule Command
    if (text.includes("schedule") || text.includes("read routine") || text.includes("my routine")) {
      if (routines.length === 0) {
        speak("You currently have no scheduled routines.");
      } else {
        const textSummary = routines.map((r) => `${r.label} at ${r.time}`).join(". ");
        speak(`Your upcoming routines are: ${textSummary}`);
      }
      return;
    }

    // 4. Navigation Command
    if (text.includes("camera")) {
      speak("Opening Solo Camera Page.");
      if (onNavigate) onNavigate("/camera");
      return;
    }

    speak(`I heard: "${rawText}". Command processed for your personal safety assistant.`);
  };

  const handleManualAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel) return;

    const newItem: RoutineItem = {
      id: `rt-${Date.now()}`,
      userId: "usr-nandini",
      label: newLabel,
      time: newTime,
      locationLabel: newLoc,
      isShared: true,
    };

    setRoutines((prev) => [newItem, ...prev]);
    speak(`Added routine ${newLabel} set for ${newTime}.`);
    setNewLabel("");
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    speak("Routine item removed.");
  };

  return (
    <div className="aura-card p-6 flex flex-col gap-5 border-2 border-purple-200/90 shadow-lg bg-gradient-to-br from-white via-purple-50/30 to-amber-50/30">
      {/* Voice Assistant Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3D2541] text-white flex items-center justify-center font-bold shadow-md">
            <Volume2 className="w-5 h-5 text-[#FFF0ED]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#2D2B30] flex items-center gap-2">
              Web-Only Voice Mode & Routine Manager
            </h3>
            <p className="text-xs text-[#6B6871] font-medium">
              Manage safety routines, alarms & emergency calls hands-free without hardware rover
            </p>
          </div>
        </div>

        {/* Big Mic Toggle Button */}
        <button
          onClick={toggleListening}
          className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-md ${
            isListening
              ? "bg-rose-600 text-white animate-pulse"
              : "bg-[#3D2541] hover:bg-[#5A3B5F] text-white"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListening ? "Listening... Speak Now" : "Start Voice Assistant"}</span>
        </button>
      </div>

      {/* Voice Live Feed & Spoken Transcript Banner */}
      <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
          <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
          <span>AURA Voice Response Engine</span>
        </div>
        <p className="text-xs font-semibold text-[#2D2B30] italic bg-purple-50/70 p-3 rounded-xl border border-purple-100">
          "{assistantResponse}"
        </p>

        {transcript && (
          <div className="text-xs font-mono font-bold text-slate-600">
            User Speech: <span className="text-[#3D2541]">"{transcript}"</span>
          </div>
        )}
      </div>

      {/* Routines & Schedule Section */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-extrabold text-[#3D2541] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <span>Your Daily Safety Routines</span>
        </h4>

        {/* Add Routine Form */}
        <form onSubmit={handleManualAddRoutine} className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-medium">
          <input
            type="text"
            required
            placeholder="Routine label e.g. Evening Commute"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none"
          />

          <input
            type="text"
            placeholder="Time e.g. 05:30 PM"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none"
          />

          <input
            type="text"
            placeholder="Location e.g. Campus Gate"
            value={newLoc}
            onChange={(e) => setNewLoc(e.target.value)}
            className="px-3 py-2 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none"
          />

          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Routine</span>
          </button>
        </form>

        {/* Routine Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          {routines.map((rt) => (
            <div
              key={rt.id}
              className="p-3.5 rounded-xl bg-white border border-purple-100/90 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#3D2541] flex items-center justify-center font-bold text-xs shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-[#2D2B30]">{rt.label}</h5>
                  <div className="flex items-center gap-2 text-[11px] text-[#6B6871] font-semibold mt-0.5">
                    <span className="font-mono text-purple-700">{rt.time}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {rt.locationLabel}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteRoutine(rt.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                title="Remove Routine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
