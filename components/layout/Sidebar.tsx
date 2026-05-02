"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutGrid, ShieldAlert, LogOut } from "lucide-react";

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <aside className="w-64 glass-panel border-y-0 border-l-0 border-r flex flex-col justify-between hidden md:flex h-screen sticky top-0 z-20">
      <div className="flex-1">
        <div className="p-6 pb-2">
          <Link href="/dashboard">
            <h2 className="text-xl font-extrabold tracking-tight cursor-pointer flex items-center gap-2">
              <span className="text-white">Pijar</span>
              <span className="text-purple-400">Academy</span>
            </h2>
          </Link>
        </div>
        <nav className="px-4 space-y-1 mt-6">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/dashboard"
                ? "bg-white/10 text-white shadow-sm"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Semua Kelas
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all mt-6 ${
                pathname === "/admin"
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-orange-400/80 hover:bg-orange-500/10 hover:text-orange-400"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Kelola Kelas (Admin)
            </Link>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between p-3 glass-panel rounded-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(160,32,240,0.5)] select-none">
              {user.email.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-white max-w-30 truncate">
                {user.email.split("@")[0]}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold">
                {isAdmin ? "Admin Mode" : "Student Mode"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-2 px-3 py-2 mt-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
