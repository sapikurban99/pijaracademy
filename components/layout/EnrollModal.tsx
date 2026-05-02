"use client";

import React, { useState } from "react";
import { Course } from "@/lib/db";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white/5 border border-white/10 w-full max-w-sm rounded-2xl p-6 relative z-10 transform transition-all shadow-[0_0_40px_rgba(249,115,22,0.15)] backdrop-blur-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Enrollment Key</h3>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          Masukkan kode akses untuk kelas{" "}
          <span className="text-orange-400 font-bold">{course.title}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="e.g. PIJAR-NEXTJS-KEY"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setError("");
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-center tracking-widest uppercase focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-gray-500 shadow-inner transition-all"
              required
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400 mt-2 font-medium text-center">
                {error}
              </p>
            )}
            {/* <div className="mt-3 text-[11px] text-gray-500 text-center select-all bg-white/5 rounded-md py-1.5 border border-white/5">
              Tip: Gunakan <span className="text-gray-300 font-mono font-bold">{course.enrollmentKey}</span> untuk tes.
            </div> */}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-black font-bold text-sm bg-orange-500 hover:bg-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all cursor-pointer"
          >
            Akses Modul
          </button>
        </form>
      </div>
    </div>
  );
}
