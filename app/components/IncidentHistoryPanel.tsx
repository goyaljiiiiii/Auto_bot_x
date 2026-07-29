"use client";

import React from "react";
import { IncidentEvent } from "@/app/types";
import { Clock, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

interface IncidentHistoryPanelProps {
  incidents: IncidentEvent[];
}

export const IncidentHistoryPanel: React.FC<IncidentHistoryPanelProps> = ({
  incidents,
}) => {
  return (
    <div className="aura-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-100/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#3D2541]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2B30]">Incident History Log</h3>
            <p className="text-xs text-[#6B6871] font-medium">Session safety events & factual summaries</p>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      {incidents.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#6B6871] font-medium bg-[#FAF7FC] rounded-xl border border-purple-100">
          No safety incidents recorded during this session.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {incidents.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-xl bg-white border border-purple-100/80 flex flex-col gap-2.5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#3D2541]">
                    {event.date} — {event.time}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
                    {event.triggerType}
                  </span>
                </div>

                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {event.status}
                </span>
              </div>

              {/* Factual Gemini Summary */}
              <div className="p-3 rounded-lg bg-[#FAF7FC] border border-purple-100 text-xs font-medium text-[#2D2B30]">
                <p className="text-[#6B6871] text-[10px] font-bold uppercase mb-1">FACTUAL INCIDENT SUMMARY:</p>
                <p>{event.summary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
