"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, ShieldCheck, User as UserIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("hadi@pijar.id");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type: "admin" | "user") => {
    setLoading(true);
    const testEmail = type === "admin" ? "admin@pijar.id" : "hadi@pijar.id";
    try {
      await login(testEmail, type);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#050508] select-none">
      <div className="aurora-1 pointer-events-none"></div>
      <div className="aurora-2 pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden bg-black/40 border border-white/5">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-purple-500"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Pijar <span className="text-gradient">Teknologi</span>
          </h1>
          <p className="text-sm text-gray-400">Academy Learning Portal</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg text-center select-none">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg text-white font-bold text-sm mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Signing in..." : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs font-medium text-center text-gray-500 mb-4 uppercase tracking-wider">
            Quick Sign In
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("user")}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-purple-400" />
              Student Mode
            </button>
            <button
              onClick={() => handleQuickLogin("admin")}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              Admin Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
