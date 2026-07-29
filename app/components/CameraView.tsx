"use client";

import React, { useRef, useEffect, useState } from "react";
import { TelemetryState } from "@/app/types";
import { Camera, Eye, AlertTriangle, RefreshCw, Hand } from "lucide-react";

interface CameraViewProps {
  telemetry: TelemetryState;
  onUpdateTelemetry: (updater: (prev: TelemetryState) => TelemetryState) => void;
  onTriggerSOS: (reason: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  telemetry,
  onUpdateTelemetry,
  onTriggerSOS,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

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
        onUpdateTelemetry((prev) => ({ ...prev, cameraActive: true }));
      }
    } catch (err: any) {
      console.warn("Camera permission denied or camera unavailable:", err);
      setCameraError("Camera permission denied or device unavailable.");
      setIsCameraActive(false);
      onUpdateTelemetry((prev) => ({ ...prev, cameraActive: false }));
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

  // Frame Render Loop
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

          // Draw mirrored video frame
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

          // Clean, soft visual overlay
          const width = canvas.width;
          const height = canvas.height;

          // Subtle central detection box
          const boxW = 160;
          const boxH = 160;
          const boxX = (width - boxW) / 2;
          const boxY = (height - boxH) / 2 - 20;

          ctx.strokeStyle = telemetry.safetyState === "SOS_ACTIVATED" ? "#E85D75" : "rgba(61, 37, 65, 0.4)";
          ctx.lineWidth = 2;
          ctx.strokeRect(boxX, boxY, boxW, boxH);

          // Gesture Overlay Badge
          if (telemetry.detectedGesture) {
            ctx.fillStyle = "rgba(232, 93, 117, 0.9)";
            ctx.fillRect(boxX, boxY - 30, boxW, 26);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
            ctx.fillText(`GESTURE DETECTED: ${telemetry.detectedGesture}`, boxX + 8, boxY - 12);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [telemetry, onUpdateTelemetry]);

  // Demo gesture trigger
  const triggerDemoGestureSOS = () => {
    onUpdateTelemetry((prev) => ({
      ...prev,
      detectedGesture: "SOS Hand Signal",
      gestureDetectionActive: true,
    }));

    onTriggerSOS("Hands-Free SOS Gesture");

    setTimeout(() => {
      onUpdateTelemetry((prev) => ({ ...prev, detectedGesture: null }));
    }, 4000);
  };

  return (
    <div className="aura-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-purple-100/80 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#3D2541]" />
          <h3 className="text-xs font-bold text-[#3D2541] uppercase tracking-wider">
            Camera Feed & Gesture Sentinel
          </h3>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
          isCameraActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}>
          {isCameraActive ? "Camera Active" : "Camera Offline"}
        </span>
      </div>

      {/* Video Viewport Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-purple-100 flex items-center justify-center">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full object-cover"
        />

        {/* Camera Offline Fallback */}
        {!isCameraActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 gap-3 text-center p-4">
            <Camera className="w-10 h-10 text-purple-300 animate-pulse" />
            <p className="text-xs text-slate-300">
              {cameraError || "Initializing camera feed for gesture monitoring..."}
            </p>
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#3D2541] hover:bg-purple-50 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start Camera
            </button>
          </div>
        )}

        {/* Live Status Overlay */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-purple-100 text-xs font-semibold text-[#3D2541]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Hands-Free Detection: {telemetry.guardianActive ? "ACTIVE" : "STANDBY"}</span>
        </div>
      </div>

      {/* Demo SOS Gesture Trigger Button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-[#6B6871] font-medium">Test Hands-Free SOS Gesture:</span>
        <button
          onClick={triggerDemoGestureSOS}
          className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Hand className="w-4 h-4 text-rose-600" />
          <span>Simulate Hands-Free SOS Gesture</span>
        </button>
      </div>
    </div>
  );
};
