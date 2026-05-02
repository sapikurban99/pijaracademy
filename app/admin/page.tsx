"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Course,
  Module,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getModules,
  addModule,
  updateModule,
  deleteModule
} from "@/lib/db";
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ArrowLeft,
  Eye
} from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin, isLoaded } = useAuth();
  const router = useRouter();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Add/Edit Course form state
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseKey, setCourseKey] = useState("");
  const [courseThumb, setCourseThumb] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Add/Edit Module form state
  const [modTitle, setModTitle] = useState("");
  const [modContent, setModContent] = useState("");
  const [modMedia, setModMedia] = useState("");
  const [modPdf, setModPdf] = useState("");
  const [modLinks, setModLinks] = useState<{name: string, url: string}[]>([]);
  const [editingModId, setEditingModId] = useState<string | null>(null);

  // Custom Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: "course" | "module", id: string} | null>(null);

  const addLink = () => setModLinks([...modLinks, { name: "", url: "" }]);
  const removeLink = (index: number) => setModLinks(modLinks.filter((_, i) => i !== index));
  const updateLink = (index: number, field: "name" | "url", val: string) => {
    const newLinks = [...modLinks];
    newLinks[index][field] = val;
    setModLinks(newLinks);
  };

  useEffect(() => {
    if (isLoaded && (!user || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, isLoaded, router]);

  const fetchCoursesAndData = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCoursesAndData();
    }
  }, [isAdmin]);

  const fetchModulesForCourse = async (cId: string) => {
    try {
      const data = await getModules(cId);
      setModules(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchModulesForCourse(selectedCourseId);
    }
  }, [selectedCourseId]);

  // Handle Course Add / Edit
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc || !courseKey) return;

    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, {
          title: courseTitle,
          description: courseDesc,
          enrollmentKey: courseKey,
          thumbnailUrl: courseThumb
        });
      } else {
        await addCourse({
          title: courseTitle,
          description: courseDesc,
          enrollmentKey: courseKey,
          thumbnailUrl: courseThumb || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400"
        });
      }

      setCourseTitle("");
      setCourseDesc("");
      setCourseKey("");
      setCourseThumb("");
      setEditingCourseId(null);
      await fetchCoursesAndData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditCourse = (c: Course) => {
    setEditingCourseId(c.id);
    setCourseTitle(c.title);
    setCourseDesc(c.description);
    setCourseKey(c.enrollmentKey);
    setCourseThumb(c.thumbnailUrl);
  };

  const requestDeleteCourse = (cId: string) => {
    setDeleteTarget({ type: "course", id: cId });
    setDeleteModalOpen(true);
  };

  // Handle Module Add / Edit
  const handleModSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !modTitle || !modContent) return;

    try {
      const externalLinkVal = JSON.stringify(modLinks);
      if (editingModId) {
        await updateModule(editingModId, {
          title: modTitle,
          content: modContent,
          mediaUrl: modMedia,
          pdfUrl: modPdf,
          externalLink: externalLinkVal
        });
      } else {
        const nextOrder =
          modules.length > 0 ? Math.max(...modules.map((m) => m.order)) + 1 : 1;
        await addModule({
          courseId: selectedCourseId,
          title: modTitle,
          content: modContent,
          mediaUrl: modMedia,
          pdfUrl: modPdf,
          externalLink: externalLinkVal,
          order: nextOrder
        });
      }

      setModTitle("");
      setModContent("");
      setModMedia("");
      setModPdf("");
      setModLinks([]);
      setEditingModId(null);
      await fetchModulesForCourse(selectedCourseId);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditModule = (m: Module) => {
    setEditingModId(m.id);
    setModTitle(m.title);
    setModContent(m.content);
    setModMedia(m.mediaUrl);
    setModPdf(m.pdfUrl || "");
    try {
      if (m.externalLink && m.externalLink.startsWith("[")) {
        setModLinks(JSON.parse(m.externalLink));
      } else if (m.externalLink) {
        setModLinks([{ name: "Reference Link", url: m.externalLink }]);
      } else {
        setModLinks([]);
      }
    } catch {
      setModLinks(m.externalLink ? [{ name: "Reference Link", url: m.externalLink }] : []);
    }
  };

  const requestDeleteModule = (mId: string) => {
    setDeleteTarget({ type: "module", id: mId });
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "course") {
        await deleteCourse(deleteTarget.id);
        
        let nextId: string | null = selectedCourseId;
        if (selectedCourseId === deleteTarget.id) {
          const remaining = courses.filter((c) => c.id !== deleteTarget.id);
          nextId = remaining.length > 0 ? remaining[0].id : null;
          setSelectedCourseId(nextId);
          setModules([]);
        }
        
        const data = await getCourses();
        setCourses(data);
        if (nextId) {
          await fetchModulesForCourse(nextId);
        }
      } else {
        await deleteModule(deleteTarget.id);
        if (selectedCourseId) {
          await fetchModulesForCourse(selectedCourseId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  if (!isLoaded || !user || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 space-y-8 select-none relative">
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setDeleteModalOpen(false)}></div>
          <div className="bg-black/90 border border-white/10 w-full max-w-md rounded-2xl p-6 relative z-10 transform transition-all shadow-[0_0_40px_rgba(239,68,68,0.15)] backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Konfirmasi Hapus</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              {deleteTarget.type === "course"
                ? "Apakah Anda yakin ingin menghapus kelas ini beserta semua materinya? Tindakan ini tidak dapat dibatalkan."
                : "Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs transition-all font-medium text-gray-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs transition-all font-bold shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upper Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Ke Portal Mahasiswa
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-orange-400" />
            Kelola Kelas (Admin Area)
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mt-1">
            Manajemen lengkap kursus, enrollment key, dan materi pembelajaran.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===================== PANEL 1: COURSES ===================== */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 bg-black/30 h-fit space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            {editingCourseId ? "Edit Kelas" : "Buat Kelas Baru"}
          </h3>

          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Judul Kelas
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Mastering Next.js & Tailwind"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Deskripsi Singkat
              </label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                placeholder="Deskripsi singkat mengenai apa yang dipelajari."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all h-24 shadow-inner"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Enrollment Key
                </label>
                <input
                  type="text"
                  value={courseKey}
                  onChange={(e) => setCourseKey(e.target.value)}
                  placeholder="e.g. PIJAR-NEXTJS-KEY"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-gray-500 uppercase focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  URL Thumbnail (Direct link)
                </label>
                <input
                  type="text"
                  value={courseThumb}
                  onChange={(e) => setCourseThumb(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="btn-gradient px-5 py-2.5 rounded-lg text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {editingCourseId ? "Simpan Perubahan" : "Tambahkan Kelas"}
              </button>
              {editingCourseId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCourseId(null);
                    setCourseTitle("");
                    setCourseDesc("");
                    setCourseKey("");
                    setCourseThumb("");
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          {/* List of courses */}
          <div className="border-t border-white/5 pt-6 mt-6 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Daftar Kelas Tersedia
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {courses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    selectedCourseId === c.id
                      ? "bg-purple-500/10 border-purple-500/40 text-purple-300 font-semibold"
                      : "bg-white/5 border-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <div className="flex-1 truncate pr-4 select-none">
                    <p className="text-xs font-bold">{c.title}</p>
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider truncate">
                      Key: {c.enrollmentKey}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditCourse(c);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded border border-white/5 text-gray-400 hover:text-white transition-all select-none cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDeleteCourse(c.id);
                      }}
                      className="p-1.5 hover:bg-red-500/20 rounded border border-white/5 text-gray-400 hover:text-red-400 transition-all select-none cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================== PANEL 2: MODULES ===================== */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 bg-black/30 h-fit space-y-6">
          {selectedCourseId ? (
            <>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400" />
                {editingModId ? "Edit Materi" : "Tambah Materi Pembelajaran"}
              </h3>

              <form onSubmit={handleModSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Judul Modul
                  </label>
                  <input
                    type="text"
                    value={modTitle}
                    onChange={(e) => setModTitle(e.target.value)}
                    placeholder="e.g. 1. Pengantar Vibe Coding"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Konten/Deskripsi
                  </label>
                  <textarea
                    value={modContent}
                    onChange={(e) => setModContent(e.target.value)}
                    placeholder="Masukkan materi detail atau kode markdown di sini."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all h-32 shadow-inner"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      URL Media (Direct link)
                    </label>
                    <input
                      type="text"
                      value={modMedia}
                      onChange={(e) => setModMedia(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      URL PDF Attachment (Optional)
                    </label>
                    <input
                      type="text"
                      value={modPdf}
                      onChange={(e) => setModPdf(e.target.value)}
                      placeholder="https://link_to_pdf/file.pdf"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-400">
                      Reference Links (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addLink}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tambah Link
                    </button>
                  </div>
                  {modLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => updateLink(idx, "name", e.target.value)}
                        placeholder="Nama Link (e.g. Google)"
                        className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(idx, "url", e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(idx)}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="btn-gradient px-5 py-2.5 rounded-lg text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {editingModId ? "Simpan Modul" : "Tambahkan Modul"}
                  </button>
                  {editingModId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModId(null);
                        setModTitle("");
                        setModContent("");
                        setModMedia("");
                        setModPdf("");
                        setModLinks([]);
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              {/* List of modules */}
              <div className="border-t border-white/5 pt-6 mt-6 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Materi Terkait Kelas Ini
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {modules.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all"
                    >
                      <div className="flex-1 truncate pr-4">
                        <p className="text-xs font-bold text-white">
                          {idx + 1}. {m.title}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-sm">
                          {m.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditModule(m)}
                          className="p-1.5 hover:bg-white/10 rounded border border-white/5 text-gray-400 hover:text-white transition-all select-none cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => requestDeleteModule(m.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded border border-white/5 text-gray-400 hover:text-red-400 transition-all select-none cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-xl">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">
                Pilih atau buat kelas terlebih dahulu
              </h3>
              <p className="text-xs text-gray-400">
                Pilih salah satu kelas di panel kiri untuk mengelola materi pembelajarannya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
