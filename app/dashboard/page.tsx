"use client";

import React, { useEffect, useState } from "react";
import { Course, getCourses } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/layout/CourseCard";
import EnrollModal from "@/components/layout/EnrollModal";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, Layers, Zap } from "lucide-react";

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
    <div className="max-w-6xl mx-auto space-y-12 select-none relative z-10 pb-16">
      {/* BACKGROUND AMBIENCE - Orange Focus */}
      <div className="fixed -top-52 -left-52 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed -bottom-52 -right-52 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Upper Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/10 pb-8 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-orange-400" />
            Explore Courses
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Pilih dan ikuti kelas premium di platform Pijar Akademi dengan memasukkan Enrollment Key.
          </p>
        </div>

        {/* View / Tab filters */}
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl w-fit backdrop-blur-md">
          <button
            onClick={() => setFilter("all")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              filter === "all"
                ? "bg-orange-500 text-black shadow-lg shadow-orange-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4" />
            Semua Kelas
          </button>
          <button
            onClick={() => setFilter("enrolled")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ml-1 select-none ${
              filter === "enrolled"
                ? "bg-orange-500 text-black shadow-lg shadow-orange-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Kelas Saya ({enrolledCourseIds.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((v) => (
            <div
              key={v}
              className="bg-white/5 border border-white/10 h-80 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : displayedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="bg-white/5 p-16 text-center border border-dashed border-white/10 rounded-2xl max-w-md mx-auto">
          <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-1">
            Belum ada kelas tersedia
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {filter === "enrolled"
              ? "Anda belum mendaftar di kelas mana pun."
              : "Belum ada materi atau kelas yang dibuat oleh Admin."}
          </p>
        </div>
      )}

      {/* Enroll Modal */}
      <EnrollModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnrollSuccess={handleEnrollSuccess}
      />
    </div>
  );
}

