"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, UserCheck, ShieldAlert, Sparkles, KeyRound, Copy, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"ACCOUNT_OWNER" | "TRUSTED_MEMBER">("ACCOUNT_OWNER");
  const [email, setEmail] = useState<string>("nandini@example.com");
  const [password, setPassword] = useState<string>("••••••••");
  const [targetSafetyCode, setTargetSafetyCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        const userObj = { ...data.user, role };
        localStorage.setItem("aura_user", JSON.stringify(userObj));

        // If Guardian role entered a target safety code, send pairing request immediately
        if (role === "TRUSTED_MEMBER" && targetSafetyCode.trim()) {
          await fetch("/api/pairing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "REQUEST_PAIRING",
              fromUser: { id: userObj.id, name: userObj.name, email: userObj.email },
              safetyCode: targetSafetyCode.trim(),
            }),
          });
        }

        router.push("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error during login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      // Simulate/Trigger Google Identity OAuth prompt
      const googleUserEmail = role === "ACCOUNT_OWNER" ? "nandini.goyal.google@gmail.com" : "mom.sarah.google@gmail.com";
      const googleUserName = role === "ACCOUNT_OWNER" ? "Nandini Goyal (Google)" : "Mom Sarah (Google Guardian)";

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUserEmail,
          name: googleUserName,
          googleId: "google-oauth-998877",
          role,
          avatarUrl: "https://lh3.googleusercontent.com/a/default-avatar",
        }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("aura_user", JSON.stringify(data.user));

        if (role === "TRUSTED_MEMBER" && targetSafetyCode.trim()) {
          await fetch("/api/pairing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "REQUEST_PAIRING",
              fromUser: { id: data.user.id, name: data.user.name, email: data.user.email },
              safetyCode: targetSafetyCode.trim(),
            }),
          });
        }

        router.push("/");
      } else {
        setError(data.error || "Google login failed");
      }
    } catch (err: any) {
      setError("Google Auth connection error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF7] text-[#2D2B30]">
      <div className="w-full max-w-lg aura-card p-6 md:p-8 flex flex-col gap-6 shadow-xl border border-purple-100">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#3D2541] flex items-center justify-center text-white shadow-md">
            <Shield className="w-6 h-6 text-[#FFF0ED]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#2D2B30] tracking-tight">AURA Safety Gateway</h1>
          <p className="text-xs text-[#6B6871] font-medium">
            Connect protected safety users & guardians seamlessly at scale
          </p>
        </div>

        {/* Role Gateway Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#3D2541] uppercase tracking-wider text-center">
            Choose Your Gateway Role
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-purple-50 rounded-2xl border border-purple-100 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRole("ACCOUNT_OWNER");
                setEmail("nandini@example.com");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all ${
                role === "ACCOUNT_OWNER"
                  ? "bg-white text-[#3D2541] shadow-md border border-purple-200 font-extrabold"
                  : "text-[#6B6871] hover:text-[#3D2541]"
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-600" />
              <div className="text-left">
                <p className="leading-tight">Primary User</p>
                <p className="text-[10px] font-normal text-slate-500">Person being protected</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("TRUSTED_MEMBER");
                setEmail("mom@example.com");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all ${
                role === "TRUSTED_MEMBER"
                  ? "bg-white text-[#3D2541] shadow-md border border-purple-200 font-extrabold"
                  : "text-[#6B6871] hover:text-[#3D2541]"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <p className="leading-tight">Guardian / Contact</p>
                <p className="text-[10px] font-normal text-slate-500">Protector / Monitor</p>
              </div>
            </button>
          </div>
        </div>

        {/* Guardian Code Input for Guardian Role */}
        {role === "TRUSTED_MEMBER" && (
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Connect to Primary User Safety Code</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-snug">
              Enter the unique Safety Code (e.g. <span className="font-mono font-bold">USR-8F92A1</span>) of the person you wish to guard. They will receive a notification to approve your connection.
            </p>
            <input
              type="text"
              placeholder="e.g. USR-8F92A1"
              value={targetSafetyCode}
              onChange={(e) => setTargetSafetyCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white font-mono text-xs text-[#2D2B30] uppercase placeholder:lowercase focus:outline-none"
            />
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#2D2B30] font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? "Connecting to Google Auth..." : `Sign in with Google (${role === "ACCOUNT_OWNER" ? "Safety User" : "Guardian"})`}</span>
        </button>

        <div className="flex items-center my-1">
          <div className="flex-1 border-t border-purple-100"></div>
          <span className="px-3 text-[11px] text-[#6B6871] font-semibold uppercase">Or Login with Password</span>
          <div className="flex-1 border-t border-purple-100"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleStandardLogin} className="flex flex-col gap-4 text-xs font-medium">
          <div>
            <label className="text-[#6B6871] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#6B6871] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-1"
          >
            <span>{loading ? "Authenticating Gateway..." : `Log In as ${role === "ACCOUNT_OWNER" ? "Safety User" : "Guardian"}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#6B6871] border-t border-purple-100 pt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#3D2541] font-bold underline hover:text-[#5A3B5F]">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}
