"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"ACCOUNT_OWNER" | "TRUSTED_MEMBER">("ACCOUNT_OWNER");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("aura_user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Network error during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF7] text-[#2D2B30]">
      <div className="w-full max-w-md aura-card p-8 flex flex-col gap-6 shadow-xl border border-purple-100">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#3D2541] flex items-center justify-center text-white shadow-md">
            <Shield className="w-6 h-6 text-[#FFF0ED]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#2D2B30] tracking-tight">Create AURA Account</h1>
          <p className="text-xs text-[#6B6871] font-medium">Join the software safety platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4 text-xs font-medium">
          <div>
            <label className="text-[#6B6871] block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Nandini Goyal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#6B6871] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#6B6871] block mb-1">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("ACCOUNT_OWNER")}
                className={`py-2 rounded-xl border text-xs font-semibold ${
                  role === "ACCOUNT_OWNER"
                    ? "bg-[#3D2541] text-white border-[#3D2541]"
                    : "bg-white border-purple-200 text-[#3D2541]"
                }`}
              >
                Safety User
              </button>

              <button
                type="button"
                onClick={() => setRole("TRUSTED_MEMBER")}
                className={`py-2 rounded-xl border text-xs font-semibold ${
                  role === "TRUSTED_MEMBER"
                    ? "bg-[#3D2541] text-white border-[#3D2541]"
                    : "bg-white border-purple-200 text-[#3D2541]"
                }`}
              >
                Trusted Contact
              </button>
            </div>
          </div>

          <div>
            <label className="text-[#6B6871] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 bg-white text-[#2D2B30] focus:outline-none focus:border-[#3D2541]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#3D2541] hover:bg-[#5A3B5F] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#6B6871] border-t border-purple-100 pt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3D2541] font-bold underline hover:text-[#5A3B5F]">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
