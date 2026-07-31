"use client";

import React from "react";
import { IncidentEvent, TrustedContact } from "@/app/types";
import { AlertTriangle, CheckCircle2, MapPin, ExternalLink, X, Send } from "lucide-react";

interface SOSActivatedModalProps {
  incident: IncidentEvent;
  primaryContact?: TrustedContact;
  locationUrl?: string;
  onDismiss: () => void;
}

export const SOSActivatedModal: React.FC<SOSActivatedModalProps> = ({
  incident,
  primaryContact,
  locationUrl,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2B30]/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg aura-card-sos p-6 md:p-8 flex flex-col items-center gap-5 text-center shadow-xl">
        {/* Soft Alert Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600">
          <AlertTriangle className="w-7 h-7 animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-rose-600 tracking-tight">
            SOS ACTIVATED
          </h2>
          <p className="text-xs text-[#6B6871] font-medium mt-1">
            Your emergency response has been triggered.
          </p>
        </div>

        {/* Structured Details Box */}
        <div className="w-full p-4 rounded-xl bg-white border border-rose-200 text-xs font-medium text-[#2D2B30] flex flex-col gap-2.5 text-left shadow-sm">
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[#6B6871]">TRIGGER METHOD:</span>
            <strong className="text-[#3D2541]">{incident.triggerType}</strong>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[#6B6871]">TIME:</span>
            <strong className="text-[#3D2541]">{incident.time}</strong>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[#6B6871]">IOT COMPANION RESPONSE:</span>
            <span className="text-rose-600 font-bold">Emergency Light & Siren Active</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[#6B6871]">TRUSTED CONTACT ALERT:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Demo Alert Formatted
            </span>
          </div>

          {locationUrl && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-[#6B6871] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" /> LOCATION PIN:
              </span>
              <a
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#3D2541] underline hover:text-[#5A3B5F] flex items-center gap-1 font-bold"
              >
                Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Gemini Factual Summary Card */}
        <div className="w-full p-4 rounded-xl bg-[#FFF8F6] border border-rose-200 text-left text-xs">
          <p className="text-rose-700 font-bold uppercase text-[10px] mb-1">INCIDENT SUMMARY (GEMINI AI):</p>
          <p className="text-[#2D2B30] font-medium leading-relaxed">{incident.summary}</p>
        </div>

        {/* Demo Alert Card Preview */}
        <div className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] font-mono text-slate-600">
          <p className="text-[#3D2541] font-bold font-sans text-xs mb-1">Demo Trusted Contact Alert Format:</p>
          <p><strong>AURA SENTINEL SAFETY ALERT</strong></p>
          <p>User: Demo User</p>
          <p>Time: {incident.time}</p>
          <p>Trigger: {incident.triggerType}</p>
          <p>Location: {locationUrl || "Available on request"}</p>
          <p>Summary: {incident.summary}</p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-2.5">
          <a
            href={`https://wa.me/${primaryContact?.phone ? primaryContact.phone.replace(/[^0-9]/g, "") : ""}?text=${encodeURIComponent(
              `🚨 AURA SENTINEL SOS EMERGENCY ALERT! 🚨\n\nTrigger: ${incident.triggerType}\nTime: ${incident.time}\nLocation: ${locationUrl || "GPS Locked"}\n\nSummary (Gemini AI):\n${incident.summary}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send WhatsApp SOS Alert
          </a>

          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Reset Safety State
          </button>
        </div>
      </div>
    </div>
  );
};
