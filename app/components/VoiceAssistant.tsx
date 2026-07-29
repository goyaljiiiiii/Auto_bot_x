"use client";

import React, { useState, useEffect } from "react";
import { TelemetryState, UserProfile } from "@/app/types";
import { Mic, MicOff, Volume2, Sparkles, Bot, CheckCircle2 } from "lucide-react";

interface VoiceAssistantProps {
  telemetry: TelemetryState;
  onUpdateTelemetry: (updater: (prev: TelemetryState) => TelemetryState) => void;
  onSendSerialCommand: (cmd: string) => void;
  onTriggerSOS: (reason: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  telemetry,
  onUpdateTelemetry,
  onSendSerialCommand,
  onTriggerSOS,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [assistantReply, setAssistantReply] = useState<string>(
    "Hello! I am OmniSight AI. Say 'Turn on light 1' or 'Emergency' or type a command."
  );
  const [manualInput, setManualInput] = useState<string>("");

  // Speech Recognition Setup
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    setTranscript(rawText);

    let reply = "";

    if (text.includes("light one") || text.includes("light 1") || text.includes("main light")) {
      const nextState = !telemetry.appliance1;
      onUpdateTelemetry((prev) => ({ ...prev, appliance1: nextState }));
      if (telemetry.serialConnected) onSendSerialCommand(`LED1:${nextState ? 1 : 0}`);
      reply = `Toggled Main Light 1 to ${nextState ? "ON" : "OFF"}.`;
    } else if (text.includes("appliance two") || text.includes("appliance 2") || text.includes("fan")) {
      const nextState = !telemetry.appliance2;
      onUpdateTelemetry((prev) => ({ ...prev, appliance2: nextState }));
      if (telemetry.serialConnected) onSendSerialCommand(`LED2:${nextState ? 1 : 0}`);
      reply = `Toggled Appliance 2 to ${nextState ? "ON" : "OFF"}.`;
    } else if (text.includes("center camera") || text.includes("reset servo")) {
      onUpdateTelemetry((prev) => ({ ...prev, servoAngle: 90 }));
      if (telemetry.serialConnected) onSendSerialCommand("SERVO:90");
      reply = "Pan-tilt camera reset to center position 90 degrees.";
    } else if (text.includes("emergency") || text.includes("help") || text.includes("sos")) {
      onTriggerSOS("Voice Emergency Command Triggered");
      reply = "Emergency distress protocol activated! Notifying contacts.";
    } else if (text.includes("who am i") || text.includes("profile")) {
      reply = `Active medical profile is ${telemetry.activeProfile.name}, condition: ${telemetry.activeProfile.condition}.`;
    } else {
      reply = `Executing command: '${rawText}' for ${telemetry.activeProfile.name}. System ready.`;
    }

    setAssistantReply(reply);
    speakText(reply);
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      onUpdateTelemetry((prev) => ({ ...prev, voiceListening: false }));
    } else {
      setIsListening(true);
      onUpdateTelemetry((prev) => ({ ...prev, voiceListening: true }));

      // Web Speech API
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          processVoiceCommand(text);
          setIsListening(false);
          onUpdateTelemetry((prev) => ({ ...prev, voiceListening: false }));
        };

        recognition.onerror = () => {
          setIsListening(false);
          onUpdateTelemetry((prev) => ({ ...prev, voiceListening: false }));
        };

        recognition.start();
      } else {
        alert("Web Speech API not supported in this browser. You can use manual text input!");
        setIsListening(false);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processVoiceCommand(manualInput);
    setManualInput("");
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-cyber-border flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-sm font-extrabold tracking-wider font-mono text-cyber-cyan">
            AI VOICE ASSISTANT & COMMANDS
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-cyber-cyan">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VOICE HYBRID</span>
        </div>
      </div>

      {/* Assistant Bubble */}
      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-4 h-4" />
        </div>
        <div className="flex flex-col gap-1 text-xs font-mono">
          <span className="text-cyber-dim font-semibold">AI ASSISTANT RESPONSE:</span>
          <p className="text-slate-100 font-medium">{assistantReply}</p>
        </div>
      </div>

      {/* Voice Mic Toggle Button */}
      <div className="flex gap-2">
        <button
          onClick={toggleVoice}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isListening
              ? "bg-cyber-rose/20 border border-cyber-rose/60 text-cyber-rose animate-pulse shadow-glow-rose"
              : "bg-cyber-cyan/20 border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/30 shadow-glow"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListening ? "LISTENING (SPEAK NOW)..." : "START VOICE LISTENER"}</span>
        </button>
      </div>

      {/* Manual Voice Text Prompt */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Or type voice command (e.g. 'Turn on light 1')"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyber-cyan"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 hover:bg-slate-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};
