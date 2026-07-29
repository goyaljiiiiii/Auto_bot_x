"use client";

import React, { useState } from "react";
import { TrustedContact } from "@/app/types";
import { Users, UserPlus, Send, Eye, ShieldCheck, Mail, Phone, X, Check } from "lucide-react";

interface TrustedContactsPanelProps {
  contacts: TrustedContact[];
  onAddContact: (contact: TrustedContact) => void;
  onSendDemoAlert: (contact: TrustedContact) => void;
}

export const TrustedContactsPanel: React.FC<TrustedContactsPanelProps> = ({
  contacts,
  onAddContact,
  onSendDemoAlert,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<TrustedContact>>({
    name: "",
    relationship: "Family",
    phone: "",
    email: "",
    contactMethod: "Demo Alert",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newContact: TrustedContact = {
      id: `contact-${Date.now()}`,
      name: formData.name,
      relationship: formData.relationship || "Family",
      phone: formData.phone,
      email: formData.email || "",
      contactMethod: "Demo Alert",
      isPrimary: contacts.length === 0,
    };

    onAddContact(newContact);
    setShowAddForm(false);
    setFormData({ name: "", relationship: "Family", phone: "", email: "", contactMethod: "Demo Alert" });
  };

  return (
    <div className="aura-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-100/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#3D2541]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2B30]">Trusted Contacts Network</h3>
            <p className="text-xs text-[#6B6871] font-medium">Configured safety emergency contacts</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3D2541] text-white hover:bg-[#5A3B5F] text-xs font-semibold shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "Add Contact"}</span>
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[#FAF7FC] border border-purple-100 flex flex-col gap-3 text-xs font-medium">
          <h4 className="font-bold text-[#3D2541]">New Trusted Contact</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[#6B6871] block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>

            <div>
              <label className="text-[#6B6871] block mb-1">Relationship</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              >
                <option value="Family">Family / Parent</option>
                <option value="Friend">Friend / Roommate</option>
                <option value="Partner">Partner</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>

            <div>
              <label className="text-[#6B6871] block mb-1">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>

            <div>
              <label className="text-[#6B6871] block mb-1">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#3D2541] text-white font-semibold hover:bg-[#5A3B5F] mt-1 shadow-sm"
          >
            Save Contact
          </button>
        </form>
      )}

      {/* Contacts List */}
      <div className="flex flex-col gap-3">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl bg-white border border-purple-100/80 flex flex-wrap items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-[#3D2541] flex items-center justify-center font-bold text-sm">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#2D2B30]">{c.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-[#3D2541]">
                    {c.relationship}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B6871] mt-0.5 font-medium">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                  {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                </div>
              </div>
            </div>

            {/* Demo Alert Action */}
            <button
              onClick={() => onSendDemoAlert(c)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3D2541] border border-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Test Demo Alert</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
