"use client";

import React from "react";
import { Course } from "@/lib/db";
import { MoveRight, Lock, Unlock, Code, Play, BookOpen, GraduationCap } from "lucide-react";

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
  const title = (course.title || "").toLowerCase();

  let Icon = GraduationCap;
  if (title.includes("vibe") || title.includes("next") || title.includes("code")) Icon = Code;
  else if (title.includes("n8n") || title.includes("automation") || title.includes("workflow")) Icon = Play;
  else if (title.includes("ai") || title.includes("agent")) Icon = BookOpen;

  let levelTag = "Beginner";
  let levelColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (title.includes("n8n") || title.includes("mastering") || title.includes("advanced")) {
    levelTag = "Intermediate";
    levelColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  }
  if (title.includes("cs") || title.includes("agent") || title.includes("expert")) {
    levelTag = "Advanced";
    levelColor = "text-red-400 bg-red-500/10 border-red-500/20";
  }

  return (
    <div className="group relative bg-white/4 border border-white/8 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_8px_40px_rgba(249,115,22,0.12)] hover:-translate-y-0.5">

      {/* Thumbnail */}
      <div
        className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden bg-cover bg-center"
        style={course.thumbnailUrl ? { backgroundImage: `url(${course.thumbnailUrl})` } : {}}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-transparent group-hover:from-orange-500/10 transition-all duration-500" />

        {!course.thumbnailUrl && (
          <Icon className="w-14 h-14 text-white/15 group-hover:text-orange-400/40 transition-all duration-500 group-hover:scale-110 transform" />
        )}

        {/* Enrolled badge */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold border z-10 transition-all duration-300
          ${isEnrolled
            ? 'text-orange-300 border-orange-500/30'
            : 'text-gray-400 border-white/10 group-hover:border-orange-500/20 group-hover:text-orange-300/70'
          }">
          {isEnrolled
            ? <><Unlock className="w-2.5 h-2.5" /> Enrolled</>
            : <><Lock className="w-2.5 h-2.5" /> Premium</>
          }
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col grow">
        {/* Level tag */}
        <span className={`inline-flex w-fit text-[10px] font-bold px-2 py-0.5 rounded-md border mb-3 tracking-wider uppercase ${levelColor}`}>
          {levelTag}
        </span>

        <h3 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-orange-300 transition-colors duration-300 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-xs text-gray-500 mb-5 grow line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {/* CTA */}
        {isEnrolled ? (
          <button
            onClick={() => onEnterClick(course.id)}
            className="w-full py-2.5 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-400 transition-all duration-200 flex items-center justify-center gap-2 text-xs hover:shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer"
          >
            Akses Modul <MoveRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onEnrollClick(course)}
            className="w-full py-2.5 rounded-xl bg-white/6 hover:bg-orange-500 hover:text-black text-gray-300 font-semibold transition-all duration-200 text-xs border border-white/8 hover:border-orange-500 cursor-pointer"
          >
            Lihat Silabus / Enroll
          </button>
        )}
      </div>
    </div>
  );
}
