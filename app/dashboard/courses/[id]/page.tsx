"use client";

import React, { useEffect, useState, use } from "react";
import { Course, Module, getCourses, getModules, addModule } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  FileText,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

export default function CourseModulesPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { id: courseId } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const allCourses = await getCourses();
      const match = allCourses.find((c) => c.id === courseId);
      if (!match) { router.push("/dashboard"); return; }
      setCourse(match);

      const mods = await getModules(courseId);
      setModules(mods);
      if (mods.length > 0) {
        setActiveModule(mods[0]);
        setVisitedIds(new Set([mods[0].id]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId]);

  const switchModule = (m: Module) => {
    setActiveModule(m);
    setVisitedIds((prev) => new Set([...prev, m.id]));
  };

  const handleNext = () => {
    if (!activeModule) return;
    const idx = modules.findIndex((m) => m.id === activeModule.id);
    if (idx < modules.length - 1) switchModule(modules[idx + 1]);
  };

  const handlePrev = () => {
    if (!activeModule) return;
    const idx = modules.findIndex((m) => m.id === activeModule.id);
    if (idx > 0) switchModule(modules[idx - 1]);
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    try {
      const nextOrder = modules.length > 0 ? Math.max(...modules.map((m) => m.order)) + 1 : 1;
      const created = await addModule({
        courseId,
        title: newTitle,
        content: newContent,
        mediaUrl: newMediaUrl,
        order: nextOrder
      });
      const updated = [...modules, created].sort((a, b) => a.order - b.order);
      setModules(updated);
      switchModule(created);
      setNewTitle("");
      setNewContent("");
      setNewMediaUrl("");
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="skeleton h-5 w-36 rounded-full" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="skeleton flex-1 h-[520px]" />
          <div className="skeleton w-full lg:w-72 h-80" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  const activeIdx = modules.findIndex((m) => m.id === activeModule?.id);
  const progressPct = modules.length > 0 ? Math.round((visitedIds.size / modules.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <span>/</span>
        <span className="text-gray-400 truncate max-w-xs">{course.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Main content pane ── */}
        <div className="flex-1 min-w-0 bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          {activeModule ? (
            <div>
              {/* Module header */}
              <div className="px-6 pt-6 pb-5 border-b border-white/6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                    Modul {activeModule.order}
                  </span>
                  <span className="text-[10px] text-gray-600">dari {modules.length}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-tight">{activeModule.title}</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">{course.title}</p>
              </div>

              <div className="p-6 lg:p-8 space-y-6">
                {/* Media */}
                {activeModule.mediaUrl ? (
                  <div className="w-full rounded-xl overflow-hidden border border-white/8 bg-black/40 aspect-video">
                    {activeModule.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video controls className="w-full h-full object-cover" src={activeModule.mediaUrl} />
                    ) : (
                      <img src={activeModule.mediaUrl} alt={activeModule.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-white/6 rounded-xl flex items-center justify-center group">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                      <Play className="w-6 h-6 text-orange-400/60 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="bg-white/3 border border-white/5 rounded-xl p-5 select-text">
                  <div
                    className="text-sm text-gray-300 leading-loose break-words"
                    dangerouslySetInnerHTML={{
                      __html: (activeModule.content || "")
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-orange-400 hover:underline font-semibold" target="_blank" rel="noopener noreferrer">$1</a>')
                        .replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-white mt-4 mb-1.5">$1</h4>')
                        .replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-white mt-5 mb-2">$1</h3>')
                        .replace(/^# (.*$)/gim, '<h2 class="text-lg font-extrabold text-white mt-6 mb-2.5">$1</h2>')
                        .replace(/^\s*-\s+(.*$)/gim, '<li class="text-sm text-gray-300 ml-5 list-disc mt-1">$1</li>')
                        .replace(/\n/g, "<br />")
                    }}
                  />
                </div>

                {/* PDF attachment */}
                {activeModule.pdfUrl && (
                  <div className="flex items-center justify-between gap-4 bg-orange-500/5 border border-orange-500/15 p-4 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-white">Attached Document</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">PDF material tersedia</p>
                    </div>
                    <a
                      href={activeModule.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-4 py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-black border border-orange-500/25 rounded-lg text-xs font-bold transition-all"
                    >
                      Open PDF
                    </a>
                  </div>
                )}

                {/* External links */}
                {(() => {
                  if (!activeModule.externalLink) return null;
                  let links: { name: string; url: string }[] = [];
                  try {
                    links = activeModule.externalLink.startsWith("[")
                      ? JSON.parse(activeModule.externalLink)
                      : [{ name: "Reference Link", url: activeModule.externalLink }];
                  } catch {
                    links = [{ name: "Reference Link", url: activeModule.externalLink }];
                  }
                  if (!links.length) return null;
                  return (
                    <div className="space-y-2.5">
                      {links.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 bg-orange-500/5 border border-orange-500/15 p-4 rounded-xl">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white">{link.name || "Reference Link"}</p>
                            <p className="text-[11px] text-gray-500 truncate">{link.url}</p>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-4 py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-black border border-orange-500/25 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                          >
                            Visit Link
                          </a>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Prev / Next */}
              <div className="flex justify-between items-center border-t border-white/6 px-6 py-4">
                <button
                  onClick={handlePrev}
                  disabled={activeIdx === 0}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <span className="text-[11px] text-gray-600 font-medium">
                  {activeIdx + 1} / {modules.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={activeIdx === modules.length - 1}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-black transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_16px_rgba(249,115,22,0.35)]"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="text-white font-bold mb-2">Belum ada materi</h3>
              <p className="text-xs text-gray-500">
                Hubungi administrator untuk mengisi materi kelas ini.
              </p>
            </div>
          )}
        </div>

        {/* ── Module outline sidebar ── */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 sticky top-5 space-y-3">
            {/* Outline header + progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white">Daftar Modul</h3>
                <span className="text-[10px] font-bold text-orange-400">{progressPct}%</span>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Module list */}
            <div className="space-y-1 max-h-[360px] overflow-y-auto -mx-1 px-1">
              {modules.map((m, idx) => {
                const isActive = activeModule?.id === m.id;
                const isVisited = visitedIds.has(m.id) && !isActive;
                return (
                  <button
                    key={m.id}
                    onClick={() => switchModule(m)}
                    className={`w-full text-left px-3 py-3 border rounded-xl text-xs font-medium flex items-center gap-3 transition-all cursor-pointer ${
                      isActive
                        ? "bg-orange-500/12 border-orange-500/35 text-orange-300"
                        : isVisited
                        ? "border-white/5 text-gray-400 hover:bg-white/5 hover:text-white bg-white/2"
                        : "border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300"
                    }`}
                  >
                    {/* State icon */}
                    <span className="shrink-0">
                      {isActive ? (
                        <Play className="w-3 h-3 text-orange-400 fill-orange-400" />
                      ) : isVisited ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <span className="w-3 h-3 inline-flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {idx + 1}
                        </span>
                      )}
                    </span>
                    <span className="truncate flex-1">{m.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin: add module */}
            {isAdmin && (
              <div className="border-t border-white/6 pt-3">
                {!isAdding ? (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2.5 border border-dashed border-orange-500/30 hover:border-orange-500/60 text-orange-400/70 hover:text-orange-400 rounded-xl text-xs font-semibold hover:bg-orange-500/8 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Materi
                  </button>
                ) : (
                  <form onSubmit={handleAddModule} className="space-y-2.5">
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Modul Baru</p>
                    <input
                      type="text"
                      placeholder="Judul modul"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                      required
                    />
                    <textarea
                      placeholder="Konten/Deskripsi modul"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all h-20 resize-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="URL Media (opsional)"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-black rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg text-xs text-gray-400 font-medium cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
