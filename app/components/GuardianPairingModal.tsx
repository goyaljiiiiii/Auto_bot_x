"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, User, Sparkles, Bell } from "lucide-react";
import { PairingRequest } from "@/app/types";

interface GuardianPairingModalProps {
  currentUserId: string;
  onRelationshipAdded?: () => void;
}

export const GuardianPairingModal: React.FC<GuardianPairingModalProps> = ({
  currentUserId,
  onRelationshipAdded,
}) => {
  const [requests, setRequests] = useState<PairingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/pairing?userId=${currentUserId}`);
      const data = await res.json();
      if (data.success && data.requests) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.warn("Could not fetch pairing requests", e);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 6000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  const handleRespond = async (requestId: string, accept: boolean) => {
    setLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESPOND_PAIRING",
          requestId,
          accept,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        if (accept && onRelationshipAdded) {
          onRelationshipAdded();
        }
      }
    } catch (err: any) {
      console.error("Pairing response error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="w-full mb-6 flex flex-col gap-3">
      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {requests.map((req) => (
        <div
          key={req.id}
          className="aura-card p-5 bg-gradient-to-r from-amber-50 via-orange-50/50 to-purple-50 border-2 border-amber-300/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-bounce-short"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wide">
                  New Guardian Request
                </span>
                <span className="text-[10px] text-slate-500">{req.timestamp}</span>
              </div>
              <h4 className="text-sm font-extrabold text-[#2D2B30] mt-1">
                {req.fromUserName} is requesting to be your Guardian
              </h4>
              <p className="text-xs text-[#6B6871] mt-0.5">
                Email: <span className="font-medium text-[#2D2B30]">{req.fromUserEmail}</span> • Requests permission to receive your SOS signals, check-ins, and safety location.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleRespond(req.id, true)}
              disabled={loading}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Guardian</span>
            </button>

            <button
              onClick={() => handleRespond(req.id, false)}
              disabled={loading}
              className="flex-1 md:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              <span>Decline</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
