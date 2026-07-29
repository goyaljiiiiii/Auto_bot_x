"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Users, Clock, Lock, Bot, Sparkles, LogOut, User, Camera, Info } from "lucide-react";

interface NavbarProps {
  demoModeActive: boolean;
  onToggleDemoMode: () => void;
  isCompanionConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  demoModeActive,
  onToggleDemoMode,
  isCompanionConnected,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("aura_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    } else {
      setCurrentUser({ name: "Nandini Goyal", role: "ACCOUNT_OWNER" });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("aura_user");
    setCurrentUser(null);
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Shield },
    { href: "/camera", label: "Solo Camera", icon: Camera },
    { href: "/info", label: "Info & Hardware", icon: Info },
    { href: "/timeline", label: "Safety Timeline", icon: Clock },
    { href: "/contact-dashboard", label: "Trusted Contact View", icon: Users },
  ];

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-purple-100 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#3D2541] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-5 h-5 text-[#FFF0ED]" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-[#2D2B30] tracking-tight">AURA</span>
            <p className="text-[10px] text-[#6B6871] font-semibold">Personal Safety Platform</p>
          </div>
        </Link>

        {/* Companion Status Pill */}
        <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          isCompanionConnected
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-slate-50 border-slate-200 text-slate-500"
        }`}>
          <Bot className="w-3.5 h-3.5" />
          <span>{isCompanionConnected ? "Companion Connected" : "Companion Optional"}</span>
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-1 bg-purple-50/70 p-1 rounded-xl border border-purple-100 text-xs font-semibold text-[#6B6871]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                isActive
                  ? "bg-white text-[#3D2541] shadow-sm font-bold"
                  : "hover:text-[#3D2541]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Demo Mode & User Profile Session */}
      <div className="flex items-center gap-3 text-xs font-semibold">
        <button
          onClick={onToggleDemoMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            demoModeActive
              ? "bg-amber-50 border-amber-300 text-amber-800 shadow-sm"
              : "bg-white border-purple-200 text-[#3D2541] hover:bg-purple-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
          <span>{demoModeActive ? "Demo Mode: ACTIVE" : "Enable Demo Mode"}</span>
        </button>

        {currentUser ? (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#3D2541] flex items-center justify-center font-bold text-xs">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#2D2B30]">{currentUser.name}</span>
              <span className="text-[10px] text-[#6B6871]">{currentUser.role === "ACCOUNT_OWNER" ? "Safety User" : "Trusted Contact"}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-xl bg-[#3D2541] text-white hover:bg-[#5A3B5F] text-xs font-semibold"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};
