"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Eye, EyeOff, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const { roleSlug } = await login(email, password);

      // Redirect based on roleSlug
      if (roleSlug === 'global:admin' || roleSlug === 'global:owner') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#050508] overflow-hidden select-none">
      <div className="aurora-1 pointer-events-none" />
      <div className="aurora-2 pointer-events-none" />

      {/* Subtle center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-purple-600/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        {/* Card */}
        <div className="relative bg-black/50 border border-white/8 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Top accent bar */}
          <div className="h-[2px] w-full bg-gradient-to-r from-orange-400 via-purple-500 to-orange-400" />

          <div className="p-8 pt-7">
            {/* Logo mark */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center shadow-[0_0_24px_rgba(160,32,240,0.45)]">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="text-center mb-7">
              <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
                Pijar <span className="text-gradient">Teknologi</span>
              </h1>
              <p className="text-sm text-gray-500">Academy Learning Portal</p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-500/8 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Signing in..." : "Sign In to Portal"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-gray-600 mt-5">
          © 2025 Pijar Teknologi Academy
        </p>
      </div>
    </div>
  );
}
