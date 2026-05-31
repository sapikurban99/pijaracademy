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
  Layers
} from "lucide-react";

const inputCls =
  "w-full bg-white/4 border border-white/8 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/15 transition-all";

const inputOrangeCls =
  "w-full bg-white/4 border border-white/8 rounded-lg px-4 py-2.5 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 transition-all";

const labelCls = "block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide";

export default function AdminPage() {
  const { user, isAdmin, isLoaded } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseKey, setCourseKey] = useState("");
  const [courseThumb, setCourseThumb] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [modTitle, setModTitle] = useState("");
  const [modContent, setModContent] = useState("");
  const [modMedia, setModMedia] = useState("");
  const [modPdf, setModPdf] = useState("");
  const [modLinks, setModLinks] = useState<{ name: string; url: string }[]>([]);
  const [editingModId, setEditingModId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "course" | "module"; id: string } | null>(null);

  const addLink = () => setModLinks([...modLinks, { name: "", url: "" }]);
  const removeLink = (i: number) => setModLinks(modLinks.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: "name" | "url", val: string) => {
    const next = [...modLinks];
    next[i][field] = val;
    setModLinks(next);
  };

  useEffect(() => {
    if (isLoaded && (!user || !isAdmin)) router.push("/dashboard");
  }, [user, isAdmin, isLoaded, router]);

  const fetchCoursesAndData = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) setSelectedCourseId(data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchCoursesAndData();
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
    if (selectedCourseId) fetchModulesForCourse(selectedCourseId);
  }, [selectedCourseId]);

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc || !courseKey) return;
    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, { title: courseTitle, description: courseDesc, enrollmentKey: courseKey, thumbnailUrl: courseThumb });
      } else {
        await addCourse({ title: courseTitle, description: courseDesc, enrollmentKey: courseKey, thumbnailUrl: courseThumb || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400" });
      }
      setCourseTitle(""); setCourseDesc(""); setCourseKey(""); setCourseThumb(""); setEditingCourseId(null);
      await fetchCoursesAndData();
    } catch (err) { console.error(err); }
  };

  const startEditCourse = (c: Course) => {
    setEditingCourseId(c.id); setCourseTitle(c.title); setCourseDesc(c.description); setCourseKey(c.enrollmentKey); setCourseThumb(c.thumbnailUrl);
  };

  const requestDeleteCourse = (cId: string) => { setDeleteTarget({ type: "course", id: cId }); setDeleteModalOpen(true); };

  const handleModSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !modTitle || !modContent) return;
    try {
      const externalLinkVal = JSON.stringify(modLinks);
      if (editingModId) {
        await updateModule(editingModId, { title: modTitle, content: modContent, mediaUrl: modMedia, pdfUrl: modPdf, externalLink: externalLinkVal });
      } else {
        const nextOrder = modules.length > 0 ? Math.max(...modules.map((m) => m.order)) + 1 : 1;
        await addModule({ courseId: selectedCourseId, title: modTitle, content: modContent, mediaUrl: modMedia, pdfUrl: modPdf, externalLink: externalLinkVal, order: nextOrder });
      }
      setModTitle(""); setModContent(""); setModMedia(""); setModPdf(""); setModLinks([]); setEditingModId(null);
      await fetchModulesForCourse(selectedCourseId);
    } catch (err) { console.error(err); }
  };

  const startEditModule = (m: Module) => {
    setEditingModId(m.id); setModTitle(m.title); setModContent(m.content); setModMedia(m.mediaUrl); setModPdf(m.pdfUrl || "");
    try {
      if (m.externalLink && m.externalLink.startsWith("[")) setModLinks(JSON.parse(m.externalLink));
      else if (m.externalLink) setModLinks([{ name: "Reference Link", url: m.externalLink }]);
      else setModLinks([]);
    } catch { setModLinks(m.externalLink ? [{ name: "Reference Link", url: m.externalLink }] : []); }
  };

  const requestDeleteModule = (mId: string) => { setDeleteTarget({ type: "module", id: mId }); setDeleteModalOpen(true); };

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
        if (nextId) await fetchModulesForCourse(nextId);
      } else {
        await deleteModule(deleteTarget.id);
        if (selectedCourseId) await fetchModulesForCourse(selectedCourseId);
      }
    } catch (err) { console.error(err); }
    finally { setDeleteModalOpen(false); setDeleteTarget(null); }
  };

  if (!isLoaded || !user || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-7 relative animate-fade-up">

      {/* ── Delete confirmation modal ── */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden border border-white/8 bg-black/80 backdrop-blur-xl shadow-2xl">
            <div className="h-[2px] w-full bg-gradient-to-r from-red-500 to-red-400" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
                </div>
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                {deleteTarget.type === "course"
                  ? "Apakah Anda yakin ingin menghapus kelas ini beserta semua materinya? Tindakan ini tidak dapat dibatalkan."
                  : "Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan."}
              </p>
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl text-xs font-medium text-gray-300 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-red-500/20"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex flex-col gap-2 border-b border-white/6 pb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Ke Portal Mahasiswa
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Kelola Kelas</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manajemen kursus, enrollment key, dan materi pembelajaran.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ══ PANEL 1: COURSES ══ */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          {/* Panel header */}
          <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {editingCourseId ? "Edit Kelas" : "Buat Kelas Baru"}
            </h3>
          </div>

          <div className="p-5 space-y-5">
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Judul Kelas</label>
                <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="e.g. Mastering Next.js & Tailwind" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Deskripsi Singkat</label>
                <textarea value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} placeholder="Deskripsi singkat mengenai apa yang dipelajari." className={`${inputCls} h-24 resize-none`} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Enrollment Key</label>
                  <input type="text" value={courseKey} onChange={(e) => setCourseKey(e.target.value)} placeholder="e.g. PIJAR-NEXTJS" className={`${inputCls} font-mono uppercase`} required />
                </div>
                <div>
                  <label className={labelCls}>URL Thumbnail</label>
                  <input type="text" value={courseThumb} onChange={(e) => setCourseThumb(e.target.value)} placeholder="https://images.unsplash.com/..." className={inputCls} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-gradient px-5 py-2.5 rounded-lg text-white font-semibold text-xs flex items-center gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  {editingCourseId ? "Simpan Perubahan" : "Tambahkan Kelas"}
                </button>
                {editingCourseId && (
                  <button type="button" onClick={() => { setEditingCourseId(null); setCourseTitle(""); setCourseDesc(""); setCourseKey(""); setCourseThumb(""); }} className="px-4 py-2 bg-white/5 hover:bg-white/8 border border-white/8 text-gray-400 rounded-lg text-xs font-medium cursor-pointer transition-all">
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* Course list */}
            <div className="border-t border-white/6 pt-5 space-y-2">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Daftar Kelas ({courses.length})</p>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {loading ? (
                  [1, 2, 3].map((v) => <div key={v} className="skeleton h-14 rounded-xl" />)
                ) : courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`group px-3.5 py-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      selectedCourseId === c.id
                        ? "bg-purple-500/8 border-purple-500/30 text-purple-300"
                        : "bg-white/2 border-white/6 hover:bg-white/5 hover:border-white/12 text-white"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-xs font-bold truncate">{c.title}</p>
                      <p className="text-[10px] text-gray-500 font-mono tracking-wider truncate mt-0.5">
                        {c.enrollmentKey}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); startEditCourse(c); }} className="p-1.5 rounded-lg border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); requestDeleteCourse(c.id); }} className="p-1.5 rounded-lg border border-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/12 transition-all cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {!loading && courses.length === 0 && (
                  <div className="text-center py-8 text-gray-600 text-xs">Belum ada kelas</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══ PANEL 2: MODULES ══ */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          {/* Panel header */}
          <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {selectedCourseId
                ? editingModId ? "Edit Materi" : "Tambah Materi"
                : "Materi Pembelajaran"}
            </h3>
          </div>

          {selectedCourseId ? (
            <div className="p-5 space-y-5">
              <form onSubmit={handleModSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Judul Modul</label>
                  <input type="text" value={modTitle} onChange={(e) => setModTitle(e.target.value)} placeholder="e.g. 1. Pengantar Vibe Coding" className={inputOrangeCls} required />
                </div>
                <div>
                  <label className={labelCls}>Konten / Deskripsi</label>
                  <textarea value={modContent} onChange={(e) => setModContent(e.target.value)} placeholder="Masukkan materi atau markdown di sini." className={`${inputOrangeCls} h-28 resize-none`} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>URL Media</label>
                    <input type="text" value={modMedia} onChange={(e) => setModMedia(e.target.value)} placeholder="https://..." className={inputOrangeCls} />
                  </div>
                  <div>
                    <label className={labelCls}>URL PDF (opsional)</label>
                    <input type="text" value={modPdf} onChange={(e) => setModPdf(e.target.value)} placeholder="https://.../file.pdf" className={inputOrangeCls} />
                  </div>
                </div>

                {/* Reference links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelCls + " mb-0"}>Reference Links</label>
                    <button type="button" onClick={addLink} className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
                      <Plus className="w-3 h-3" /> Tambah
                    </button>
                  </div>
                  <div className="space-y-2">
                    {modLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input type="text" value={link.name} onChange={(e) => updateLink(idx, "name", e.target.value)} placeholder="Nama" className="w-1/3 bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all" />
                        <input type="text" value={link.url} onChange={(e) => updateLink(idx, "url", e.target.value)} placeholder="https://..." className="flex-1 bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all" />
                        <button type="button" onClick={() => removeLink(idx)} className="p-2 bg-red-500/8 hover:bg-red-500/15 text-red-400 rounded-lg transition-all cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-gradient px-5 py-2.5 rounded-lg text-white font-semibold text-xs flex items-center gap-2 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    {editingModId ? "Simpan Modul" : "Tambahkan Modul"}
                  </button>
                  {editingModId && (
                    <button type="button" onClick={() => { setEditingModId(null); setModTitle(""); setModContent(""); setModMedia(""); setModPdf(""); setModLinks([]); }} className="px-4 py-2 bg-white/5 hover:bg-white/8 border border-white/8 text-gray-400 rounded-lg text-xs font-medium cursor-pointer transition-all">
                      Batal
                    </button>
                  )}
                </div>
              </form>

              {/* Module list */}
              <div className="border-t border-white/6 pt-5 space-y-2">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
                  Materi Kelas Ini ({modules.length})
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {modules.map((m, idx) => (
                    <div key={m.id} className="px-3.5 py-3 bg-white/2 border border-white/6 rounded-xl flex items-center justify-between hover:bg-white/4 transition-all">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-xs font-bold text-white truncate">{idx + 1}. {m.title}</p>
                        <p className="text-[10px] text-gray-600 truncate max-w-xs mt-0.5">{m.content}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => startEditModule(m)} className="p-1.5 rounded-lg border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => requestDeleteModule(m.id)} className="p-1.5 rounded-lg border border-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/12 transition-all cursor-pointer">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {modules.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-xs">Belum ada materi untuk kelas ini</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Pilih kelas terlebih dahulu</h3>
              <p className="text-xs text-gray-500">
                Klik salah satu kelas di panel kiri untuk mengelola materinya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
