"use client";

import React from "react";
import { Course } from "@/lib/db";
import { MoveRight, Lock, Unlock, Code, Play, Users, Zap, BookOpen, GraduationCap } from "lucide-react";

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnrollClick: (course: Course) => void;
  onEnterClick: (courseId: string) => void;
}

export default function CourseCard({
  course,
  isEnrolled,
  onEnrollClick,
  onEnterClick
}: CourseCardProps) {
  // Select icon dynamically based on title or id for enhanced design appeal
  const title = (course.title || "").toLowerCase();
  let Icon = BookOpen;
  if (title.includes("vibe") || title.includes("next") || title.includes("code")) {
    Icon = Code;
  } else if (title.includes("n8n") || title.includes("automation") || title.includes("workflow")) {
    Icon = Play;
  } else if (title.includes("ai") || title.includes("agent") || title.includes("cs")) {
    Icon = Users;
  } else {
    Icon = GraduationCap;
  }

  // Set default level tags matching original design if none provided
  let levelTag = "Beginner Friendly";
  if (title.includes("n8n") || title.includes("mastering") || title.includes("advanced")) {
    levelTag = "Intermediate";
  }
  if (title.includes("cs") || title.includes("agent") || title.includes("expert")) {
    levelTag = "Advanced";
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 flex flex-col group h-full hover:shadow-[0_0_25px_rgba(249,115,22,0.15)] select-none">
      {/* Visual Header / Thumbnail Container */}
      <div
        className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10 relative overflow-hidden bg-cover bg-center"
        style={
          course.thumbnailUrl
            ? { backgroundImage: `url(${course.thumbnailUrl})` }
            : {}
        }
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent group-hover:from-orange-500/20 transition-all duration-500"></div>
        
        {/* Semi-transparent pattern texture for richer visuals */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

        {!course.thumbnailUrl && (
          <Icon className="w-16 h-16 text-orange-500/50 group-hover:text-orange-400/70 transition-all duration-500 transform group-hover:scale-110" />
        )}

        <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-orange-300 border border-orange-500/30 flex items-center gap-1 select-none z-10">
          {isEnrolled ? (
            <>
              <Unlock className="w-3 h-3" /> Enrolled
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" /> Premium
            </>
          )}
        </span>
      </div>

      <div className="p-6 flex flex-col grow">
        <span className="text-[10px] font-bold text-orange-400 mb-2 bg-orange-500/10 w-fit px-2.5 py-1 rounded-md border border-orange-500/20 tracking-wider uppercase">
          {levelTag}
        </span>
        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-orange-400 transition-colors duration-300">
          {course.title}
        </h3>
        <p className="text-xs text-gray-400 mb-6 grow line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {isEnrolled ? (
          <button
            onClick={() => onEnterClick(course.id)}
            className="w-full py-3 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-400 transition-all duration-300 text-center flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] cursor-pointer select-none text-xs"
          >
            Akses Modul <MoveRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onEnrollClick(course)}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-orange-500 hover:text-black text-white font-semibold transition-all duration-300 text-center cursor-pointer select-none text-xs border border-white/5 hover:border-orange-500"
          >
            Lihat Silabus / Enroll
          </button>
        )}
      </div>
    </div>
  );
}

