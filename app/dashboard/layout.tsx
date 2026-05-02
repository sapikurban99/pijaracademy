"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { LogOut, Shield } from "lucide-react";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded, isAdmin, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login");
    }
  }, [user, isLoaded, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050508] select-none">
        <div className="text-gray-400 text-sm font-medium animate-pulse">
          Loading portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[#050508] text-gray-200">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Header Mobile & Extra Desktop actions */}
        <header className="flex items-center justify-between px-6 lg:px-10 py-4 glass-panel border-b border-x-0 border-t-0 border-white/5 select-none shrink-0 bg-black/20">
          <Link href="/dashboard" className="md:hidden">
            <h1 className="text-lg font-extrabold tracking-tight">
              <span className="text-white">Pijar</span>
              <span className="text-purple-400">Academy</span>
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Welcome back,</span>
            <span className="text-xs font-semibold text-white">
              {user.email}
            </span>
            {isAdmin && (
              <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ml-1 tracking-wider uppercase">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs font-semibold bg-orange-500/15 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/25 transition-all select-none hidden md:block"
              >
                + Kelola Kelas
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-gray-400 hover:text-red-400 transition-all select-none flex items-center gap-1.5 bg-white/5 hover:bg-red-400/10 px-3 py-2 rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Scrollable page body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-black/10 select-none">
          {children}
        </div>
      </div>
    </div>
  );
}
