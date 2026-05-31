"use client";

import React, { useEffect, useState } from "react";
import { Course, getCourses } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/layout/CourseCard";
import EnrollModal from "@/components/layout/EnrollModal";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, Layers } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "enrolled">("all");
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`enrolled_${user.uid}`);
      if (stored) {
        try {
          setEnrolledCourseIds(JSON.parse(stored));
        } catch {
          setEnrolledCourseIds([]);
        }
      }
    }
  }, [user]);

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleEnterClick = (courseId: string) => {
    router.push(`/dashboard/courses/${courseId}`);
  };

  const handleEnrollSuccess = (courseId: string) => {
    if (!user) return;
    const nextEnrolled = [...enrolledCourseIds, courseId];
    setEnrolledCourseIds(nextEnrolled);
    localStorage.setItem(`enrolled_${user.uid}`, JSON.stringify(nextEnrolled));
    router.push(`/dashboard/courses/${courseId}`);
  };

  const displayedCourses = courses.filter((c) => {
    if (filter === "enrolled") return enrolledCourseIds.includes(c.id);
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative z-10 pb-16 animate-fade-up">
      {/* Background glow */}
      <div className="fixed -top-52 -left-52 w-[500px] h-[500px] bg-orange-600/8 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-52 -right-52 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-orange-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Explore Courses</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
            Pilih dan ikuti kelas premium di Pijar Akademi dengan memasukkan Enrollment Key.
          </p>
        </div>

        {/* Tab filter */}
        <div className="flex items-center bg-white/4 border border-white/8 p-1 rounded-xl w-fit shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-orange-500 text-black shadow-md shadow-orange-500/25"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Semua
          </button>
          <button
            onClick={() => setFilter("enrolled")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "enrolled"
                ? "bg-orange-500 text-black shadow-md shadow-orange-500/25"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Kelas Saya
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              filter === "enrolled" ? "bg-black/20" : "bg-white/10"
            }`}>
              {enrolledCourseIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Total Kelas", value: courses.length, color: "text-white" },
            { label: "Kelas Diikuti", value: enrolledCourseIds.length, color: "text-orange-400" },
            { label: "Tersedia", value: courses.length - enrolledCourseIds.length, color: "text-purple-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/3 border border-white/6 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div>
                <p className={`text-xl font-extrabold leading-none ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Course grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((v) => (
            <div key={v} className="rounded-2xl overflow-hidden border border-white/6">
              <div className="skeleton h-48 rounded-none" />
              <div className="p-5 space-y-3 bg-white/3">
                <div className="skeleton h-3 w-20 rounded-full" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-2/3" />
                <div className="skeleton h-10 mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              isEnrolled={enrolledCourseIds.includes(c.id)}
              onEnrollClick={handleEnrollClick}
              onEnterClick={handleEnterClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 px-6 text-center border border-dashed border-white/8 rounded-2xl max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
            <GraduationCap className="w-7 h-7 text-gray-600" />
          </div>
          <h3 className="text-white font-bold mb-2">Belum ada kelas tersedia</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {filter === "enrolled"
              ? "Anda belum mendaftar di kelas mana pun."
              : "Belum ada materi atau kelas yang dibuat oleh Admin."}
          </p>
          {filter === "enrolled" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Lihat semua kelas →
            </button>
          )}
        </div>
      )}

      <EnrollModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnrollSuccess={handleEnrollSuccess}
      />
    </div>
  );
}
