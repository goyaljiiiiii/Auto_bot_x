"use client";

import React, { useState } from "react";
import { UserProfile, MedicalCondition } from "@/app/types";
import { UserCheck, Heart, Shield, Plus, Edit2, Check, Sparkles } from "lucide-react";

interface ProfileSelectorProps {
  activeProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  activeProfile,
  profiles,
  onSelectProfile,
  onSaveProfile,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserProfile>(activeProfile);

  const handleSave = () => {
    onSaveProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-cyber-border flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-sm font-extrabold tracking-wider font-mono text-cyber-cyan">
            MEDICAL PROFILE & ASSISTIVE ENGINE
          </h2>
        </div>
        <button
          onClick={() => {
            setFormData(activeProfile);
            setIsEditing(!isEditing);
          }}
          className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
        >
          {isEditing ? <Check className="w-3.5 h-3.5 text-cyber-emerald" /> : <Edit2 className="w-3.5 h-3.5 text-cyber-cyan" />}
          <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      {!isEditing ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{activeProfile.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple">
                  {activeProfile.condition}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
                  Sensitivity: {activeProfile.gestureSensitivity.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan font-mono font-bold">
              {activeProfile.name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Medical Notes */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <p className="text-cyber-dim mb-1 font-semibold">MEDICAL ADAPTATION NOTES:</p>
            <p>{activeProfile.medicalNotes}</p>
          </div>

          {/* Emergency Contact */}
          <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-lg bg-cyber-rose/10 border border-cyber-rose/30 text-cyber-rose">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>EMERGENCY DISPATCH CONTACT:</span>
            </div>
            <span className="font-bold">{activeProfile.emergencyContact}</span>
          </div>

          {/* Gestures List */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-xs font-mono text-cyber-dim">ACTIVE ADAPTIVE CONTROL MAPPINGS:</span>
            {activeProfile.gestures.map((g, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono"
              >
                <span className="text-cyber-cyan font-semibold">{g.gesture}</span>
                <span className="text-slate-300">➔ {g.actionName}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Edit Profile Form */
        <div className="flex flex-col gap-3 text-xs font-mono">
          <div>
            <label className="text-cyber-dim block mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div>
            <label className="text-cyber-dim block mb-1">Medical Condition / Need</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as MedicalCondition })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyber-cyan"
            >
              <option value="Parkinson's / Tremors">Parkinson's / Tremors (Tremor-Smoothing)</option>
              <option value="Mobility Impaired">Mobility Impaired (Auto-Camera Lock)</option>
              <option value="Speech Impaired">Speech Impaired (Sign/Gesture First)</option>
              <option value="Standard / Assistive">Standard / Assistive</option>
            </select>
          </div>

          <div>
            <label className="text-cyber-dim block mb-1">Gesture Sensitivity</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, gestureSensitivity: s })}
                  className={`flex-1 py-1 rounded border capitalize ${
                    formData.gestureSensitivity === s
                      ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-cyber-dim block mb-1">Emergency Contact Number</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div>
            <label className="text-cyber-dim block mb-1">Medical Adaptation Notes</label>
            <textarea
              rows={3}
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-2 py-2 rounded bg-cyber-emerald/20 border border-cyber-emerald/50 text-cyber-emerald font-bold hover:bg-cyber-emerald/30 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Medical Profile
          </button>
        </div>
      )}
    </div>
  );
};
