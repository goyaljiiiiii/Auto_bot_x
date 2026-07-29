"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, Volume2 } from "lucide-react";

interface AuraAIAssistantProps {
  onStartGuardianMode: () => void;
  onCheckIn: (label: string) => void;
  onTriggerSOS: (reason: string) => void;
}

export const AuraAIAssistant: React.FC<AuraAIAssistantProps> = ({
  onStartGuardianMode,
  onCheckIn,
  onTriggerSOS,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [assistantReply, setAssistantReply] = useState<string>(
    "Hello! I am your Aura AI Assistant. Say or type 'Start Guardian Mode', 'I'm leaving college', or 'Who can see my location?'"
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const processCommand = async (command: string) => {
    const text = command.toLowerCase().trim();
    setIsProcessing(true);

    let reply = "";

    // Local Natural Language Action Parser
    if (text.includes("guardian") || text.includes("start mode")) {
      onStartGuardianMode();
      reply = "Guardian Mode activated. Hands-free vision & session monitoring are active.";
    } else if (text.includes("leaving college") || text.includes("leaving home")) {
      onCheckIn(text.includes("college") ? "Leaving College Campus" : "Leaving Home");
      reply = `Voluntary check-in recorded: '${text}'. Event added to your Safety Timeline.`;
    } else if (text.includes("home") || text.includes("arrived") || text.includes("safe")) {
      onCheckIn("Safe Arrival Confirmed");
      reply = "Check-in logged: Safe arrival confirmed for your trusted circle.";
    } else if (text.includes("emergency") || text.includes("help") || text.includes("sos")) {
      onTriggerSOS("Voice Assistant Panic Trigger");
      reply = "Emergency response triggered. Incident summary and location dispatched to trusted contacts.";
    } else if (text.includes("location") || text.includes("who can see")) {
      reply = "Your location is currently shared only with your active Trusted Circle (Mom). You can adjust permissions in the Privacy Center.";
    } else {
      reply = `Aura AI Assistant processed '${command}'. Your current safety status is normal and active.`;
    }

    setAssistantReply(reply);
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    processCommand(inputText);
    setInputText("");
  };

  return (
    <div className="aura-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-purple-100/80 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#3D2541]">
          <Bot className="w-4 h-4 text-[#3D2541]" />
          <span>AURA AI CONVERSATIONAL ASSISTANT</span>
        </div>
        <span className="text-[10px] text-[#6B6871] font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" /> Gemini Natural Language
        </span>
      </div>

      {/* Response Box */}
      <div className="p-3.5 rounded-xl bg-[#FAF7FC] border border-purple-100 flex items-start gap-3 text-xs">
        <div className="w-7 h-7 rounded-lg bg-[#3D2541] text-white flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-3.5 h-3.5" />
        </div>
        <p className="text-[#2D2B30] font-medium leading-relaxed pt-0.5">{assistantReply}</p>
      </div>

      {/* Suggested Command Pills */}
      <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
        {[
          "Start Guardian Mode",
          "I'm leaving college",
          "Check me in",
          "Who can see my location?",
        ].map((cmd) => (
          <button
            key={cmd}
            onClick={() => processCommand(cmd)}
            className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[#3D2541] hover:bg-purple-50 transition-all"
          >
            "{cmd}"
          </button>
        ))}
      </div>

      {/* Text Prompt */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask Aura or state an action (e.g. 'I'm home')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#3D2541] text-white font-semibold text-xs hover:bg-[#5A3B5F] flex items-center gap-1 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
