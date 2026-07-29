"use client";

import React from "react";
import { Sparkles, Play, CheckCircle2, RotateCcw } from "lucide-react";

interface DemoModeToggleProps {
  demoModeActive: boolean;
  onToggleDemoMode: () => void;
  onRunFullDemoScenario: () => void;
}

export const DemoModeToggle: React.FC<DemoModeToggleProps> = ({
  demoModeActive,
  onToggleDemoMode,
  onRunFullDemoScenario,
}) => {
  if (!demoModeActive) return null;

  return (
    <div className="w-full bg-amber-50 border border-amber-300 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-amber-900 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#E07A5F]" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-950">
            DEMO MODE ACTIVE
          </span>
          <p className="text-[11px] text-amber-800 font-medium">
            Simulating complete hackathon scenario (User Auth $\rightarrow$ Check-in $\rightarrow$ Hands-Free SOS $\rightarrow$ Gemini Summary $\rightarrow-[#3D2541] Contact Ack).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRunFullDemoScenario}
          className="px-3.5 py-1.5 rounded-lg bg-[#3D2541] text-white hover:bg-[#5A3B5F] font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 text-[#FFF0ED]" />
          <span>Run 1-Click Demo Scenario</span>
        </button>

        <button
          onClick={onToggleDemoMode}
          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold"
        >
          Exit Demo Mode
        </button>
      </div>
    </div>
  );
};
