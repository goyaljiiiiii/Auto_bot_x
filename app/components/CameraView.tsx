"use client";

import React, { useRef, useEffect, useState } from "react";
import { TelemetryState } from "@/app/types";
import { Camera, Eye, RefreshCw, Hand, Box, CheckCircle2, AlertTriangle, Shield, Volume2, Maximize2, Sparkles } from "lucide-react";

interface CameraViewProps {
  telemetry: TelemetryState;
  onUpdateTelemetry: (updater: (prev: TelemetryState) => TelemetryState) => void;
  onTriggerSOS: (reason: string) => void;
  isSoloPage?: boolean;
}

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    cocoSsd: any;
    tf: any;
  }
}

export const CameraView: React.FC<CameraViewProps> = ({
  telemetry,
  onUpdateTelemetry,
  onTriggerSOS,
  isSoloPage = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState<boolean>(false);
  const [landmarksCount, setLandmarksCount] = useState<number>(0);
  const [detectedGestureLabel, setDetectedGestureLabel] = useState<string | null>(null);
  
  // Feature Toggles
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showObjectDetector, setShowObjectDetector] = useState<boolean>(true);
  const [isVisionLoading, setIsVisionLoading] = useState<boolean>(true);
  const [detectedObjects, setDetectedObjects] = useState<{ label: string; score: number }[]>([]);

  // Refs for tracking model states
  const handsModelRef = useRef<any>(null);
  const cocoModelRef = useRef<any>(null);

  // Load Computer Vision Scripts (MediaPipe Hands + COCO-SSD Object Detector)
  useEffect(() => {
    let isMounted = true;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.body.appendChild(script);
      });
    };

    const initModels = async () => {
      try {
        setIsVisionLoading(true);

        // Load TensorFlow.js + COCO-SSD for Object Detection
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js");
        
        if (window.cocoSsd && isMounted) {
          cocoModelRef.current = await window.cocoSsd.load();
        }

        // Load MediaPipe Hands for Hand Skeleton & Gesture Tracking
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");

        if (window.Hands && isMounted) {
          const hands = new window.Hands({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
          });

          hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          hands.onResults((results: any) => {
            if (!isMounted) return;
            processHandResults(results);
          });

          handsModelRef.current = hands;
        }

        if (isMounted) setIsVisionLoading(false);
      } catch (err) {
        console.warn("MediaPipe / COCO-SSD CDN scripts loading fallback:", err);
        if (isMounted) setIsVisionLoading(false);
      }
    };

    initModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // Process MediaPipe Hand Results
  const processHandResults = (results: any) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandDetected(true);
      const totalLandmarks = results.multiHandLandmarks.reduce(
        (acc: number, landmarks: any[]) => acc + landmarks.length,
        0
      );
      setLandmarksCount(totalLandmarks);

      // Simple gesture detection logic (Open Palm vs SOS Fist/Fold)
      const hand = results.multiHandLandmarks[0];
      if (hand && hand.length >= 21) {
        const wrist = hand[0];
        const indexTip = hand[8];
        const middleTip = hand[12];
        const ringTip = hand[16];
        const pinkyTip = hand[20];

        // Calculate average finger distance to wrist
        const avgFingerDist =
          (Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y) +
            Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y) +
            Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y) +
            Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y)) / 4;

        if (avgFingerDist < 0.22) {
          const gesture = "SOS Palm Fold Signal";
          setDetectedGestureLabel(gesture);
          onUpdateTelemetry((prev) => ({
            ...prev,
            detectedGesture: gesture,
            gestureDetectionActive: true,
          }));
        } else {
          setDetectedGestureLabel("Open Palm Active");
          onUpdateTelemetry((prev) => ({
            ...prev,
            detectedGesture: null,
            gestureDetectionActive: true,
          }));
        }
      }
    } else {
      setHandDetected(false);
      setLandmarksCount(0);
      setDetectedGestureLabel(null);
      onUpdateTelemetry((prev) => ({
        ...prev,
        detectedGesture: null,
        gestureDetectionActive: false,
      }));
    }
  };

  // Start WebCam Feed
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
      console.warn("Camera access error:", err);
      setCameraError("Camera permission denied or camera device unavailable.");
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

  // Main Render Canvas Loop (Hand Skeleton + Object Detector Rendering)
  useEffect(() => {
    let animationFrameId: number;
    let frameCount = 0;
    let lastFpsCalc = Date.now();
    let lastObjectDetect = 0;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],     // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20]  // Pinky
    ];

    let cachedObjects: any[] = [];

    const render = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === 4) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          // Mirror video frame for user natural preview
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();

          const now = Date.now();
          frameCount++;
          if (now - lastFpsCalc >= 1000) {
            onUpdateTelemetry((prev) => ({ ...prev, fps: frameCount }));
            frameCount = 0;
            lastFpsCalc = now;
          }

          // Send video frame to MediaPipe Hands if model ready
          if (handsModelRef.current && showSkeleton) {
            try {
              await handsModelRef.current.send({ image: video });
            } catch (e) {}
          }

          // Run Object Detector every 300ms if enabled
          if (cocoModelRef.current && showObjectDetector && now - lastObjectDetect > 300) {
            lastObjectDetect = now;
            try {
              const predictions = await cocoModelRef.current.detect(video);
              cachedObjects = predictions || [];
              setDetectedObjects(
                cachedObjects.map((p: any) => ({
                  label: p.class,
                  score: Math.round(p.score * 100),
                }))
              );
            } catch (e) {}
          }

          // Draw Object Bounding Boxes
          if (showObjectDetector && cachedObjects.length > 0) {
            cachedObjects.forEach((obj: any) => {
              const [x, y, w, h] = obj.bbox;
              // Mirror X coordinate for canvas drawing
              const mirroredX = canvas.width - (x + w);

              ctx.strokeStyle = obj.class === "person" ? "#10B981" : "#F59E0B";
              ctx.lineWidth = 3;
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(mirroredX, y, w, h);
              ctx.setLineDash([]);

              // Box Label Tag
              ctx.fillStyle = obj.class === "person" ? "#10B981" : "#F59E0B";
              ctx.fillRect(mirroredX, Math.max(0, y - 24), Math.min(180, w), 24);

              ctx.fillStyle = "#FFFFFF";
              ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
              ctx.fillText(
                `${obj.class.toUpperCase()} ${Math.round(obj.score * 100)}%`,
                mirroredX + 6,
                Math.max(16, y - 8)
              );
            });
          }

          // Fallback Visual Skeleton overlay if hand detected or preview active
          if (showSkeleton && (handDetected || telemetry.guardianActive)) {
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;

            const joints = [
              { x: centerX, y: centerY + 70 },
              { x: centerX - 25, y: centerY + 40 }, { x: centerX - 45, y: centerY + 20 }, { x: centerX - 60, y: centerY }, { x: centerX - 70, y: centerY - 15 },
              { x: centerX - 25, y: centerY - 10 }, { x: centerX - 30, y: centerY - 50 }, { x: centerX - 32, y: centerY - 80 }, { x: centerX - 34, y: centerY - 100 },
              { x: centerX, y: centerY - 15 }, { x: centerX, y: centerY - 55 }, { x: centerX, y: centerY - 90 }, { x: centerX, y: centerY - 115 },
              { x: centerX + 22, y: centerY - 10 }, { x: centerX + 26, y: centerY - 50 }, { x: centerX + 29, y: centerY - 80 }, { x: centerX + 31, y: centerY - 100 },
              { x: centerX + 45, y: centerY + 10 }, { x: centerX + 52, y: centerY - 20 }, { x: centerX + 56, y: centerY - 45 }, { x: centerX + 60, y: centerY - 65 },
            ];

            // Draw Skeleton Bone Connections
            ctx.strokeStyle = "#E07A5F";
            ctx.lineWidth = 3;
            connections.forEach(([i, j]) => {
              ctx.beginPath();
              ctx.moveTo(joints[i].x, joints[i].y);
              ctx.lineTo(joints[j].x, joints[j].y);
              ctx.stroke();
            });

            // Draw 21 Joint Dots
            joints.forEach((pt) => {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
              ctx.fillStyle = "#3D2541";
              ctx.fill();
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 1.5;
              ctx.stroke();
            });
          }

          // Render Gesture Status Banner Overlay
          if (telemetry.detectedGesture || detectedGestureLabel) {
            const text = telemetry.detectedGesture || detectedGestureLabel;
            ctx.fillStyle = "rgba(224, 122, 95, 0.95)";
            ctx.fillRect(canvas.width / 2 - 130, 16, 260, 36);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
            ctx.fillText(text ? text.toUpperCase() : "GESTURE DETECTED", canvas.width / 2 - 100, 39);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [telemetry, showSkeleton, showObjectDetector, handDetected, onUpdateTelemetry]);

  const triggerDemoSOS = () => {
    onUpdateTelemetry((prev) => ({
      ...prev,
      detectedGesture: "Hands-Free SOS Gesture",
      gestureDetectionActive: true,
    }));
    onTriggerSOS("Hands-Free SOS Gesture Signal");
  };

  return (
    <div className={`aura-card flex flex-col gap-3 ${isSoloPage ? "p-4 md:p-6 max-w-5xl mx-auto border-2 border-purple-200 shadow-2xl" : "p-5"}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3D2541] text-white flex items-center justify-center font-bold shadow-sm">
            <Eye className="w-4 h-4 text-[#FFF0ED]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#3D2541] uppercase tracking-wide">
              {isSoloPage ? "Solo OpenCV Sentinel & AI Vision Camera" : "Camera Vision Sentinel"}
            </h3>
            <p className="text-[10px] text-[#6B6871] font-semibold">
              Real-time MediaPipe Hand Skeleton & Object Detection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVisionLoading && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin text-amber-600" />
              <span>Loading AI Vision...</span>
            </span>
          )}

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              isCameraActive ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCameraActive ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
            <span>{isCameraActive ? "Live Sentinel Active" : "Camera Offline"}</span>
          </span>
        </div>
      </div>

      {/* Main Vision Video Canvas Display */}
      <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-purple-900/30 flex items-center justify-center">
        <video ref={videoRef} playsInline muted className="hidden" />
        <canvas ref={canvasRef} className="w-full h-full object-cover rounded-2xl" />

        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900/90 gap-3">
            <Camera className="w-12 h-12 text-purple-300 animate-pulse" />
            <p className="text-sm font-bold text-slate-200">
              {cameraError || "Camera feed is initializing..."}
            </p>
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restart Camera Feed</span>
            </button>
          </div>
        )}

        {/* Live Detected Objects Floating Badges */}
        {showObjectDetector && detectedObjects.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {detectedObjects.map((obj, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-[11px] font-mono font-bold shadow-md flex items-center gap-1"
              >
                <Box className="w-3 h-3 text-emerald-400" />
                <span>{obj.label}: {obj.score}%</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        <button
          onClick={() => setShowSkeleton((prev) => !prev)}
          className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            showSkeleton
              ? "bg-purple-100 border-purple-300 text-[#3D2541] shadow-sm"
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Hand className="w-4 h-4 text-purple-600" />
          <span>Hand Skeleton: {showSkeleton ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={() => setShowObjectDetector((prev) => !prev)}
          className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            showObjectDetector
              ? "bg-emerald-100 border-emerald-300 text-emerald-900 shadow-sm"
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Box className="w-4 h-4 text-emerald-600" />
          <span>Object Detector: {showObjectDetector ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={triggerDemoSOS}
          className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Test Gesture SOS</span>
        </button>

        <button
          onClick={startCamera}
          className="py-2.5 px-3 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 text-[#3D2541] font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Vision</span>
        </button>
      </div>
    </div>
  );
};
