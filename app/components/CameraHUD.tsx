"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { UserProfile, TelemetryState } from "@/app/types";
import { Camera, Eye, AlertTriangle, ShieldCheck, RefreshCw, Crosshair } from "lucide-react";

interface CameraHUDProps {
  telemetry: TelemetryState;
  onUpdateTelemetry: (updater: (prev: TelemetryState) => TelemetryState) => void;
  onTriggerSOS: (reason: string) => void;
  onSendSerialCommand: (cmd: string) => void;
}

export const CameraHUD: React.FC<CameraHUDProps> = ({
  telemetry,
  onUpdateTelemetry,
  onTriggerSOS,
  onSendSerialCommand,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Auto Servo Tracking throttle state
  const lastServoAngleRef = useRef<number>(90);
  const lastServoSendTimeRef = useRef<number>(0);

  // Initialize Web Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera unavailable.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Main OpenCV / Vision Canvas Overlay Render Loop
  useEffect(() => {
    let animationFrameId: number;
    let frameCount = 0;
    let lastFpsCalc = Date.now();

    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === 4) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          // Draw mirror video frame
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();

          const now = Date.now();
          frameCount++;
          if (now - lastFpsCalc >= 1000) {
            const currentFps = frameCount;
            frameCount = 0;
            lastFpsCalc = now;
            onUpdateTelemetry((prev) => ({ ...prev, fps: currentFps }));
          }

          // Simulated High-Tech Futuristic HUD overlays
          const width = canvas.width;
          const height = canvas.height;

          // 1. Draw Corner HUD Grid Brackets
          ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
          ctx.lineWidth = 2;
          const cornerLen = 25;

          // Top-Left
          ctx.beginPath();
          ctx.moveTo(20, 20 + cornerLen); ctx.lineTo(20, 20); ctx.lineTo(20 + cornerLen, 20);
          ctx.stroke();
          // Top-Right
          ctx.beginPath();
          ctx.moveTo(width - 20 - cornerLen, 20); ctx.lineTo(width - 20, 20); ctx.lineTo(width - 20, 20 + cornerLen);
          ctx.stroke();
          // Bottom-Left
          ctx.beginPath();
          ctx.moveTo(20, height - 20 - cornerLen); ctx.lineTo(20, height - 20); ctx.lineTo(20 + cornerLen, height - 20);
          ctx.stroke();
          // Bottom-Right
          ctx.beginPath();
          ctx.moveTo(width - 20 - cornerLen, height - 20); ctx.lineTo(width - 20, height - 20); ctx.lineTo(width - 20, height - 20 - cornerLen);
          ctx.stroke();

          // 2. Simulated Face ID Bounding Box & Active Servo Target
          // Create subtle motion tracking simulation around frame center
          const time = now / 1000;
          const faceX = width / 2 + Math.sin(time * 0.8) * 60;
          const faceY = height / 2.3 + Math.cos(time * 0.6) * 30;
          const boxSize = 140;

          // Target reticle
          ctx.strokeStyle = telemetry.activeGesture === "ALERT_SOS" ? "rgba(244, 63, 94, 0.9)" : "rgba(0, 240, 255, 0.8)";
          ctx.lineWidth = 2;
          ctx.strokeRect(faceX - boxSize / 2, faceY - boxSize / 2, boxSize, boxSize);

          // Target reticle crosshairs
          ctx.beginPath();
          ctx.arc(faceX, faceY, 8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
          ctx.fill();

          // Text overlay on face box
          ctx.fillStyle = "#00f0ff";
          ctx.font = "12px 'JetBrains Mono', monospace";
          ctx.fillText(`PROFILE: ${telemetry.activeProfile.name.toUpperCase()}`, faceX - boxSize / 2, faceY - boxSize / 2 - 8);
          ctx.fillText(`CONDITION: ${telemetry.activeProfile.condition}`, faceX - boxSize / 2, faceY + boxSize / 2 + 16);

          // 3. Auto Servo Angle Calculation
          if (telemetry.autoTracking) {
            // Calculate pan angle based on face center relative to canvas width
            // center is width / 2 => angle 90
            const normalizedX = faceX / width; // 0.0 to 1.0
            const computedAngle = Math.round(180 - normalizedX * 180);

            if (
              Math.abs(computedAngle - lastServoAngleRef.current) > 3 &&
              now - lastServoSendTimeRef.current > 150
            ) {
              lastServoAngleRef.current = computedAngle;
              lastServoSendTimeRef.current = now;
              onUpdateTelemetry((prev) => ({ ...prev, servoAngle: computedAngle }));
              if (telemetry.serialConnected) {
                onSendSerialCommand(`SERVO:${computedAngle}`);
              }
            }
          }

          // 4. Status Bar at bottom of HUD
          ctx.fillStyle = "rgba(5, 7, 14, 0.65)";
          ctx.fillRect(20, height - 55, width - 40, 35);
          ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
          ctx.strokeRect(20, height - 55, width - 40, 35);

          ctx.fillStyle = "#e2e8f0";
          ctx.font = "11px 'JetBrains Mono', monospace";
          const gestureText = telemetry.activeGesture ? `GESTURE: ${telemetry.activeGesture}` : "GESTURE: READY / SCANNING";
          ctx.fillText(gestureText, 35, height - 32);

          const servoText = `SERVO: ${telemetry.servoAngle}° | SENSITIVITY: ${telemetry.activeProfile.gestureSensitivity.toUpperCase()}`;
          ctx.fillText(servoText, width - 330, height - 32);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [telemetry, onUpdateTelemetry, onSendSerialCommand]);

  // Demo buttons for testing gestures & fall detection directly in UI
  const handleTestGesture = (gestureName: string, command: string) => {
    onUpdateTelemetry((prev) => ({
      ...prev,
      activeGesture: gestureName,
      gestureConfidence: 0.94,
    }));

    if (command === "LED1_TOGGLE") {
      const nextState = !telemetry.appliance1;
      onUpdateTelemetry((prev) => ({ ...prev, appliance1: nextState }));
      if (telemetry.serialConnected) onSendSerialCommand(`LED1:${nextState ? 1 : 0}`);
    } else if (command === "LED2_TOGGLE") {
      const nextState = !telemetry.appliance2;
      onUpdateTelemetry((prev) => ({ ...prev, appliance2: nextState }));
      if (telemetry.serialConnected) onSendSerialCommand(`LED2:${nextState ? 1 : 0}`);
    } else if (command === "ALERT_SOS") {
      onTriggerSOS("Manual SOS Gesture Detected (Crossed Arms)");
    }

    setTimeout(() => {
      onUpdateTelemetry((prev) => ({ ...prev, activeGesture: null }));
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Video Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden glass-panel border border-cyber-border shadow-glow">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full object-cover scanline-bg"
        />

        {/* Camera Off / Error overlay */}
        {!isCameraActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 gap-3 text-center p-4">
            <Camera className="w-12 h-12 text-cyber-cyan animate-pulse" />
            <p className="text-sm font-mono text-slate-300">
              {cameraError || "Initializing Assistive Vision Camera..."}
            </p>
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan/30 text-xs font-mono"
            >
              <RefreshCw className="w-4 h-4" /> Start Camera
            </button>
          </div>
        )}

        {/* Live HUD Badge */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1 rounded-md bg-slate-950/80 border border-cyber-cyan/30 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald animate-ping" />
          <span className="text-xs font-mono font-semibold text-cyber-cyan">
            LIVE AI VISION STREAM
          </span>
        </div>

        {/* Target Tracking Mode Pill */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2 px-3 py-1 rounded-md bg-slate-950/80 border border-cyber-purple/40 backdrop-blur-md">
          <Crosshair className="w-3.5 h-3.5 text-cyber-purple" />
          <span className="text-xs font-mono text-slate-200">
            AUTO PAN: {telemetry.autoTracking ? "ENABLED" : "MANUAL"}
          </span>
        </div>
      </div>

      {/* Quick Action Simulation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2">
        <span className="text-xs font-mono text-cyber-dim">SIMULATED GESTURE TRIGGER:</span>
        <div className="flex flex-wrap gap-2">
          {telemetry.activeProfile.gestures.map((g, idx) => (
            <button
              key={idx}
              onClick={() => handleTestGesture(g.gesture, g.targetCommand)}
              className="px-3 py-1 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 text-xs font-mono transition-all"
            >
              ✋ {g.gesture} ({g.actionName})
            </button>
          ))}
          <button
            onClick={() => onTriggerSOS("Simulated Sudden Fall Posture Detected")}
            className="px-3 py-1 rounded-md bg-cyber-rose/20 border border-cyber-rose/50 text-cyber-rose hover:bg-cyber-rose/30 text-xs font-mono font-semibold flex items-center gap-1 shadow-glow-rose"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> TRIGGER SOS FALL ALERT
          </button>
        </div>
      </div>
    </div>
  );
};
