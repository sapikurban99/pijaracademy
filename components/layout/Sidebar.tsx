"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutGrid, ShieldAlert, LogOut, X } from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, isAdmin, logout, toggleRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const navContent = (
    <>
      <div className="flex-1 overflow-y-auto">
        {/* Logo row */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <Link href="/dashboard" onClick={onMobileClose}>
            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="text-white">Pijar</span>
              <span className="text-purple-400">Academy</span>
            </h2>
          </Link>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav links */}
        <nav className="px-3 mt-6 space-y-0.5">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 pb-2">
            Menu
          </p>

          <Link
            href="/dashboard"
            onClick={onMobileClose}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/dashboard"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {pathname === "/dashboard" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-400 rounded-r-full" />
            )}
            <LayoutGrid className="w-4 h-4 shrink-0" />
            Semua Kelas
          </Link>

          {isAdmin && (
            <>
              <div className="pt-5 pb-2">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3">
                  Admin
                </p>
              </div>
              <Link
                href="/admin"
                onClick={onMobileClose}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/admin"
                    ? "bg-orange-500/15 text-orange-400"
                    : "text-orange-400/70 hover:bg-orange-500/10 hover:text-orange-400"
                }`}
              >
                {pathname === "/admin" && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-400 rounded-r-full" />
                )}
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Kelola Kelas
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* User / logout section */}
      <div className="p-4 border-t border-white/8 space-y-1.5">
        <button
          onClick={toggleRole}
          title="Click to toggle role for testing"
          className="w-full flex items-center gap-3 p-3 glass-panel rounded-xl hover:border-white/15 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(160,32,240,0.35)] shrink-0">
            {user.email.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate leading-none mb-1">
              {user.email.split("@")[0]}
            </p>
            <p className="text-[10px] font-medium leading-none">
              {isAdmin
                ? <span className="text-orange-400">Admin Mode</span>
                : <span className="text-gray-500">Student Mode</span>
              }
            </p>
          </div>
          <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors font-mono">⇄</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400/80 hover:text-red-400 hover:bg-red-400/8 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 z-20 shrink-0 glass-panel border-y-0 border-l-0 border-r bg-[#09090e]/40">
        {navContent}
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col glass-panel border-y-0 border-l-0 border-r bg-[#09090e]/80 sidebar-mobile-enter">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
