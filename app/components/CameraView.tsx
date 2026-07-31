"use client";

import React, { useRef, useEffect, useState } from "react";
import { TelemetryState } from "@/app/types";
import { Camera, Eye, RefreshCw, Hand, Box, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

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
  const [fingerCount, setFingerCount] = useState<number>(0);
  const [gestureText, setGestureText] = useState<string>("Show your hand to camera");

  // Feature Toggles
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showObjectDetector, setShowObjectDetector] = useState<boolean>(true);
  const [isVisionLoading, setIsVisionLoading] = useState<boolean>(true);
  const [detectedObjects, setDetectedObjects] = useState<{ label: string; score: number }[]>([]);

  // Models & Landmark Refs
  const handsModelRef = useRef<any>(null);
  const cocoModelRef = useRef<any>(null);
  const latestHandLandmarksRef = useRef<any[]>([]);
  const sosGestureTimerRef = useRef<any>(null);

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

        // Load MediaPipe Hands for Real Hand Skeleton & Finger Counting
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
        console.warn("MediaPipe / COCO-SSD initialization warning:", err);
        if (isMounted) setIsVisionLoading(false);
      }
    };

    initModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // Process Real Hand Results & Count Extended Fingers
  const processHandResults = (results: any) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      latestHandLandmarksRef.current = results.multiHandLandmarks;
      setHandDetected(true);

      const hand = results.multiHandLandmarks[0];
      if (hand && hand.length >= 21) {
        // Calculate extended fingers
        // Index (8 vs 6), Middle (12 vs 10), Ring (16 vs 14), Pinky (20 vs 18)
        const isIndexUp = hand[8].y < hand[6].y;
        const isMiddleUp = hand[12].y < hand[10].y;
        const isRingUp = hand[16].y < hand[14].y;
        const isPinkyUp = hand[20].y < hand[18].y;

        // Thumb extension check (distance from thumb tip 4 to index mcp 5)
        const thumbDist = Math.hypot(hand[4].x - hand[17].x, hand[4].y - hand[17].y);
        const thumbBaseDist = Math.hypot(hand[2].x - hand[17].x, hand[2].y - hand[17].y);
        const isThumbUp = thumbDist > thumbBaseDist * 1.2;

        let count = 0;
        if (isThumbUp) count++;
        if (isIndexUp) count++;
        if (isMiddleUp) count++;
        if (isRingUp) count++;
        if (isPinkyUp) count++;

        setFingerCount(count);

        let label = "";
        if (count === 0) {
          label = "✊ Fist Gesture Detected";
        } else if (count === 1) {
          label = "☝️ 1 Finger Gesture (Point)";
        } else if (count === 2) {
          label = "✌️ 2 Fingers Gesture (Peace / SOS)";
        } else if (count === 3) {
          label = "🤟 3 Fingers Gesture";
        } else if (count === 4) {
          label = "🖖 4 Fingers Gesture";
        } else {
          label = "🖐️ Open Hand / 5 Fingers";
        }

        setGestureText(label);

        // If 2 Fingers or Palm Fold held in monitoring mode, trigger gesture telemetry & auto SOS
        if (count === 2 || count === 0) {
          onUpdateTelemetry((prev) => ({
            ...prev,
            detectedGesture: label,
            gestureDetectionActive: true,
          }));

          if (telemetry.safetyState !== "SOS_ACTIVATED") {
            if (!sosGestureTimerRef.current) {
              sosGestureTimerRef.current = setTimeout(() => {
                onTriggerSOS(`Camera Gesture Triggered: ${label}`);
                sosGestureTimerRef.current = null;
              }, 1200);
            }
          }
        } else {
          if (sosGestureTimerRef.current) {
            clearTimeout(sosGestureTimerRef.current);
            sosGestureTimerRef.current = null;
          }
          onUpdateTelemetry((prev) => ({
            ...prev,
            detectedGesture: null,
            gestureDetectionActive: true,
          }));
        }
      }
    } else {
      if (sosGestureTimerRef.current) {
        clearTimeout(sosGestureTimerRef.current);
        sosGestureTimerRef.current = null;
      }
      latestHandLandmarksRef.current = [];
      setHandDetected(false);
      setFingerCount(0);
      setGestureText("Show your hand to camera");
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

  // Canvas Rendering Loop
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

          // Mirror video frame for natural user view
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

          // Process MediaPipe Hand Landmarks on video frame
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

          // Draw Object Detection Bounding Boxes
          if (showObjectDetector && cachedObjects.length > 0) {
            cachedObjects.forEach((obj: any) => {
              const [x, y, w, h] = obj.bbox;
              const mirroredX = canvas.width - (x + w);

              ctx.strokeStyle = obj.class === "person" ? "#10B981" : "#F59E0B";
              ctx.lineWidth = 3;
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(mirroredX, y, w, h);
              ctx.setLineDash([]);

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

          // Render REAL MediaPipe Hand Skeleton ONLY when hand is detected on camera
          if (showSkeleton && latestHandLandmarksRef.current.length > 0) {
            latestHandLandmarksRef.current.forEach((handLandmarks: any[]) => {
              // Convert 21 normalized landmarks (0..1) to mirrored canvas pixel coordinates
              const points = handLandmarks.map((lm) => ({
                x: (1 - lm.x) * canvas.width,
                y: lm.y * canvas.height,
              }));

              // Draw Skeleton Bones
              ctx.strokeStyle = "#E07A5F";
              ctx.lineWidth = 4;
              connections.forEach(([i, j]) => {
                if (points[i] && points[j]) {
                  ctx.beginPath();
                  ctx.moveTo(points[i].x, points[i].y);
                  ctx.lineTo(points[j].x, points[j].y);
                  ctx.stroke();
                }
              });

              // Draw 21 Landmark Joint Dots directly on the user's real hand
              points.forEach((pt) => {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = "#3D2541";
                ctx.fill();
                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 2;
                ctx.stroke();
              });
            });
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [telemetry, showSkeleton, showObjectDetector, onUpdateTelemetry]);

  const triggerDemoSOS = () => {
    onUpdateTelemetry((prev) => ({
      ...prev,
      detectedGesture: "2 Fingers SOS Gesture",
      gestureDetectionActive: true,
    }));
    onTriggerSOS("2 Fingers Gesture SOS Signal");
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
              {isSoloPage ? "Solo OpenCV Sentinel & Real Hand Gesture Camera" : "Camera Vision & Gesture Sentinel"}
            </h3>
            <p className="text-xs text-[#6B6871] font-bold text-purple-800">
              {handDetected ? `Status: ${gestureText} (${fingerCount} Fingers)` : "Status: Show hand to camera for skeleton"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVisionLoading && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin text-amber-600" />
              <span>Loading Vision AI...</span>
            </span>
          )}

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              isCameraActive ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCameraActive ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
            <span>{isCameraActive ? "Live Camera Feed" : "Camera Offline"}</span>
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

        {/* Floating Live Gesture Badge on Canvas */}
        {handDetected && (
          <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-purple-300/40 text-white text-xs font-extrabold shadow-xl flex items-center gap-2 z-10">
            <Hand className="w-4 h-4 text-emerald-400" />
            <span>{gestureText}</span>
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
