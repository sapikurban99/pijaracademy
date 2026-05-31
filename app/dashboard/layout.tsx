"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { LogOut, Shield, Menu } from "lucide-react";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 animate-pulse shadow-[0_0_20px_rgba(160,32,240,0.4)]" />
          <p className="text-gray-500 text-sm font-medium animate-pulse">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[#050508] text-gray-200">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 min-w-0">
        {/* Top header */}
        <header className="flex items-center justify-between px-5 lg:px-8 py-3.5 glass-panel border-b border-x-0 border-t-0 border-white/5 shrink-0 bg-black/20">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile logo */}
            <Link href="/dashboard" className="md:hidden">
              <span className="text-base font-extrabold tracking-tight">
                <span className="text-white">Pijar</span>
                <span className="text-purple-400">Academy</span>
              </span>
            </Link>

            {/* Desktop welcome */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-gray-500">Welcome back,</span>
              <span className="text-xs font-semibold text-white">{user.email}</span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 tracking-wide">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/20 transition-all"
              >
                + Kelola Kelas
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-400/8 border border-white/5 hover:border-red-400/15 px-3 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8 bg-black/10 select-none">
          {children}
        </div>
      </div>
    </div>
  );
}
