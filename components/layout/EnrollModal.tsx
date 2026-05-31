"use client";

import React, { useState } from "react";
import { Course } from "@/lib/db";
import { X, KeyRound } from "lucide-react";

interface EnrollModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrollSuccess: (courseId: string) => void;
}

export default function EnrollModal({
  course,
  isOpen,
  onClose,
  onEnrollSuccess
}: EnrollModalProps) {
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim().toUpperCase() === course.enrollmentKey.toUpperCase()) {
      onEnrollSuccess(course.id);
      setKeyInput("");
      setError("");
      onClose();
    } else {
      setError("Enrollment key tidak valid. Silakan coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/8 bg-black/70 backdrop-blur-xl">
        {/* Accent top line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-orange-400 to-purple-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
                <KeyRound className="w-4.5 h-4.5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none mb-1">Enrollment Key</h3>
                <p className="text-[11px] text-gray-500">
                  <span className="text-orange-400 font-semibold">{course.title}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Masukkan kode akses untuk mengikuti kelas ini.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="PIJAR-XXXX-KEY"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setError("");
                }}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm font-mono text-center tracking-widest uppercase focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 text-white placeholder-gray-600 transition-all"
                required
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-400 mt-2 font-medium text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-black font-bold text-sm bg-orange-500 hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all cursor-pointer"
            >
              Akses Modul
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
