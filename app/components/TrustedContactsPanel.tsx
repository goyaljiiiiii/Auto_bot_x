"use client";

import React, { useState } from "react";
import { TrustedContact, ContactPermission } from "@/app/types";
import { Users, UserPlus, Send, Mail, Phone, Edit2, Trash2, MessageSquare, Check, X, ShieldAlert } from "lucide-react";

interface TrustedContactsPanelProps {
  contacts: TrustedContact[];
  onAddContact: (contact: TrustedContact) => void;
  onUpdateContact?: (updated: TrustedContact) => void;
  onDeleteContact?: (id: string) => void;
  onSendDemoAlert: (contact: TrustedContact) => void;
}

export const TrustedContactsPanel: React.FC<TrustedContactsPanelProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onSendDemoAlert,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TrustedContact>>({
    name: "",
    relationship: "Family",
    phone: "",
    email: "",
    contactMethod: "WhatsApp",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    if (editingContactId && onUpdateContact) {
      const existing = contacts.find((c) => c.id === editingContactId);
      if (existing) {
        onUpdateContact({
          ...existing,
          name: formData.name,
          relationship: formData.relationship || "Family",
          phone: formData.phone,
          email: formData.email || "",
          contactMethod: formData.contactMethod || "WhatsApp",
        });
      }
      setEditingContactId(null);
    } else {
      const newContact: TrustedContact = {
        id: `contact-${Date.now()}`,
        name: formData.name,
        relationship: formData.relationship || "Family",
        phone: formData.phone,
        email: formData.email || "",
        contactMethod: formData.contactMethod || "WhatsApp",
        isPrimary: contacts.length === 0,
      };
      onAddContact(newContact);
    }

    setShowAddForm(false);
    setFormData({ name: "", relationship: "Family", phone: "", email: "", contactMethod: "WhatsApp" });
  };

  const startEdit = (c: TrustedContact) => {
    setEditingContactId(c.id);
    setFormData({
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      email: c.email,
      contactMethod: c.contactMethod,
    });
    setShowAddForm(true);
  };

  const formatWhatsAppUrl = (phone: string, name: string) => {
    const cleanNum = phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `🚨 EMERGENCY SOS ALERT from AURA Safety System!\n\nHello ${name}, I am triggering an emergency alert. Please check my live location and contact me immediately.\n\n📍 Location: https://maps.google.com/?q=28.6139,77.2090`
    );
    return `https://wa.me/${cleanNum}?text=${text}`;
  };

  return (
    <div className="aura-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-100/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#3D2541]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#2D2B30]">Trusted Contacts & Direct Dispatch</h3>
            <p className="text-xs text-[#6B6871] font-medium">
              Direct Phone Calling, WhatsApp SOS Alerts & Editable View
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditingContactId(null);
            } else {
              setFormData({ name: "", relationship: "Family", phone: "", email: "", contactMethod: "WhatsApp" });
              setShowAddForm(true);
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3D2541] text-white hover:bg-[#5A3B5F] text-xs font-bold shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "Add New Contact"}</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col gap-3 text-xs font-medium animate-fadeIn">
          <h4 className="font-extrabold text-[#3D2541] text-sm">
            {editingContactId ? "Edit Trusted Contact Details" : "Add New Trusted Contact"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[#6B6871] block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Goyal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>

            <div>
              <label className="text-[#6B6871] block mb-1 font-semibold">Relationship</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              >
                <option value="Parent / Family">Parent / Family</option>
                <option value="Friend / Roommate">Friend / Roommate</option>
                <option value="Partner">Partner</option>
                <option value="Guardian">Guardian</option>
                <option value="Local Emergency">Local Emergency</option>
              </select>
            </div>

            <div>
              <label className="text-[#6B6871] block mb-1 font-semibold">Phone Number (with Country Code)</label>
              <input
                type="tel"
                required
                placeholder="e.g. +919876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>

            <div>
              <label className="text-[#6B6871] block mb-1 font-semibold">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingContactId(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white font-bold shadow-md"
            >
              {editingContactId ? "Save Contact Updates" : "Save New Contact"}
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="flex flex-col gap-3">
        {contacts.map((c) => {
          const waUrl = formatWhatsAppUrl(c.phone, c.name);
          return (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-white border border-purple-100/90 flex flex-wrap items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 text-[#3D2541] flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-[#2D2B30]">{c.name}</h4>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#3D2541] border border-purple-200">
                      {c.relationship}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6871] mt-1 font-medium">
                    <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-purple-600" /> {c.phone}
                    </span>
                    {c.email && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3.5 h-3.5" /> {c.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Direct Call, WhatsApp SOS, Edit, Delete */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Phone Call Link */}
                <a
                  href={`tel:${c.phone}`}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Phone</span>
                </a>

                {/* WhatsApp Link */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp SOS</span>
                </a>

                {/* Edit Button */}
                <button
                  onClick={() => startEdit(c)}
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3D2541] border border-purple-200 transition-all"
                  title="Edit Contact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                {onDeleteContact && (
                  <button
                    onClick={() => onDeleteContact(c.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
