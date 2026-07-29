"use client";

import React, { useState, useEffect } from "react";
import { EmergencyAlert } from "@/app/types";
import { ShieldAlert, AlertTriangle, PhoneCall, XCircle, CheckCircle2 } from "lucide-react";

interface EmergencyModalProps {
  alertData: EmergencyAlert;
  emergencyContact: string;
  onDismiss: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  alertData,
  emergencyContact,
  onDismiss,
}) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  useEffect(() => {
    // Sound emergency synthesizer alarm using Web Audio API
    let audioCtx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;

    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note Siren
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
    } catch (e) {
      console.warn("Audio alarm blocked by browser autoplay policy");
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsDispatched(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (osc) osc.stop();
      if (audioCtx) audioCtx.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg glass-panel-danger p-6 rounded-2xl border border-cyber-rose shadow-glow-rose flex flex-col items-center gap-4 text-center">
        {/* Animated Emergency Icon */}
        <div className="w-16 h-16 rounded-full bg-cyber-rose/20 border-2 border-cyber-rose flex items-center justify-center text-cyber-rose animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-wider font-mono text-cyber-rose">
            EMERGENCY SOS DISTRESS TRIGGERED!
          </h2>
          <p className="text-xs font-mono text-slate-300 mt-1">
            Reason: <strong className="text-white">{alertData.reason}</strong>
          </p>
        </div>

        {/* Dispatch Box */}
        <div className="w-full p-4 rounded-xl bg-slate-900/90 border border-cyber-rose/40 flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span>PATIENT / USER:</span>
            <strong className="text-cyber-rose">{alertData.user}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>EMERGENCY DISPATCH PHONE:</span>
            <strong className="text-cyber-rose">{emergencyContact}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>TELEGRAM / SMS WEBHOOK:</span>
            <span className="text-cyber-emerald font-bold">
              {isDispatched ? "DISPATCHED LIVE" : `AUTOMATIC IN ${countdown}s`}
            </span>
          </div>
        </div>

        {/* Countdown Ring */}
        {!isDispatched ? (
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-amber">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>If this is a false alarm, click OVERRIDE CANCEL below ({countdown}s)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-emerald">
            <CheckCircle2 className="w-4 h-4" />
            <span>Emergency signal successfully broadcast to medical contacts!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" /> CANCEL / FALSE ALARM
          </button>

          <button
            onClick={() => setIsDispatched(true)}
            className="flex-1 py-3 rounded-xl bg-cyber-rose border border-rose-400 text-white font-mono text-xs font-bold hover:bg-rose-600 flex items-center justify-center gap-2 shadow-glow-rose"
          >
            <PhoneCall className="w-4 h-4" /> DISPATCH NOW
          </button>
        </div>
      </div>
    </div>
  );
};
