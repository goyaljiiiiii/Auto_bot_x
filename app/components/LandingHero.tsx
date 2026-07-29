"use client";

import React from "react";
import { Shield, Sparkles, Hand, Bot, ArrowRight } from "lucide-react";

interface LandingHeroProps {
  onEnterGuardianMode: () => void;
  onConnectDevice: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterGuardianMode,
  onConnectDevice,
}) => {
  return (
    <div className="w-full aura-card p-6 md:p-10 mb-8 border border-purple-100 bg-gradient-to-br from-white via-[#FFF8F6] to-[#F2ECF9] relative overflow-hidden">
      <div className="max-w-3xl flex flex-col gap-5 relative z-10">
        {/* Soft Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200/60 text-[#3D2541] text-xs font-semibold w-fit">
          <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
          <span>Hands-Free AI + IoT Personal Safety Companion</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#2D2B30] tracking-tight leading-tight">
          Your safety shouldn't depend on finding your phone.
        </h1>

        {/* Supporting Text */}
        <p className="text-sm md:text-base text-[#6B6871] leading-relaxed max-w-2xl">
          Aura Sentinel is a hands-free safety layer designed to help women stay connected, aware, and in control when it matters most—combining computer vision, hand gesture recognition, and IoT companion hardware.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <button
            onClick={onEnterGuardianMode}
            className="px-6 py-3 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-[#FFF0ED]" />
            <span>Enter Guardian Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onConnectDevice}
            className="px-6 py-3 rounded-xl bg-white hover:bg-purple-50 text-[#3D2541] border border-purple-200 font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Bot className="w-4 h-4 text-[#E07A5F]" />
            <span>Connect Your Device</span>
          </button>
        </div>
      </div>

      {/* Visual Decorative Accent */}
      <div className="absolute top-1/2 -right-10 -translate-y-1/2 hidden lg:flex items-center justify-center w-80 h-80 rounded-full bg-gradient-to-tr from-purple-200/40 via-rose-200/30 to-purple-300/20 blur-3xl pointer-events-none" />
    </div>
  );
};
