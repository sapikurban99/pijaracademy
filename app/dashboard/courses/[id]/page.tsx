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
  Lock,
  ArrowLeft,
  Video
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

  // New module state for Admin in-place creation
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const allCourses = await getCourses();
      const match = allCourses.find((c) => c.id === courseId);

      if (!match) {
        router.push("/dashboard");
        return;
      }
      setCourse(match);

      const mods = await getModules(courseId);
      setModules(mods);

      if (mods.length > 0) {
        setActiveModule(mods[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const handleNext = () => {
    if (!activeModule) return;
    const currentIndex = modules.findIndex((m) => m.id === activeModule.id);
    if (currentIndex < modules.length - 1) {
      setActiveModule(modules[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!activeModule) return;
    const currentIndex = modules.findIndex((m) => m.id === activeModule.id);
    if (currentIndex > 0) {
      setActiveModule(modules[currentIndex - 1]);
    }
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
      setActiveModule(created);
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
      <div className="max-w-5xl mx-auto py-12 text-center animate-pulse text-gray-400">
        Loading module materials...
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="max-w-6xl mx-auto select-none space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors select-none mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main module content pane */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-md h-fit">
          {activeModule ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors">
                  {course.title}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                    Modul {activeModule.order}
                  </span>
                  <h3 className="text-base text-gray-300 font-semibold">
                    {activeModule.title}
                  </h3>
                </div>
              </div>

              {/* Module video/image preview or placeholder */}
              {activeModule.mediaUrl ? (
                <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/40 relative aspect-video flex items-center justify-center">
                  {activeModule.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      controls
                      className="w-full h-full object-cover"
                      src={activeModule.mediaUrl}
                    />
                  ) : (
                    <img
                      src={activeModule.mediaUrl}
                      alt={activeModule.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent group-hover:from-orange-500/20 mix-blend-overlay transition-all duration-500"></div>
                  <Play className="w-12 h-12 text-orange-500/50 group-hover:text-orange-400/80 transition-all duration-500 transform group-hover:scale-110" />
                </div>
              )}

              {/* Content body with markdown parser */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/5 space-y-4 select-text">
                <div
                  className="text-base text-gray-300 leading-loose font-normal break-words"
                  dangerouslySetInnerHTML={{
                    __html: (activeModule.content || "")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-orange-400 hover:underline font-bold" target="_blank" rel="noopener noreferrer">$1</a>')
                      .replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-white mt-4 mb-2">$1</h4>')
                      .replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-5 mb-2.5">$1</h3>')
                      .replace(/^# (.*$)/gim, '<h2 class="text-xl font-extrabold text-white mt-6 mb-3">$1</h2>')
                      .replace(/^\s*-\s+(.*$)/gim, '<li class="text-sm text-gray-300 ml-5 list-disc mt-1">$1</li>')
                      .replace(/\n/g, "<br />")
                  }}
                />
              </div>

              {/* Extra files and Reference Attachments */}
              {activeModule.pdfUrl && (
                <div className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-xl flex items-center justify-between mt-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Attached Document / PDF</h4>
                    <p className="text-xs text-gray-400">Download or preview the PDF material</p>
                  </div>
                  <a
                    href={activeModule.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500 text-white hover:text-black border border-orange-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Open PDF
                  </a>
                </div>
              )}

              {(() => {
                if (!activeModule.externalLink) return null;
                let links: {name: string, url: string}[] = [];
                try {
                  if (activeModule.externalLink.startsWith("[")) {
                    links = JSON.parse(activeModule.externalLink);
                  } else {
                    links = [{ name: "Reference Link", url: activeModule.externalLink }];
                  }
                } catch {
                  links = [{ name: "Reference Link", url: activeModule.externalLink }];
                }

                if (links.length === 0) return null;

                return (
                  <div className="space-y-3 mt-4">
                    {links.map((link, idx) => (
                      <div key={idx} className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{link.name || "Reference Link"}</h4>
                          <p className="text-xs text-gray-400">{link.url}</p>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500 text-white hover:text-black border border-orange-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                          Visit Link
                        </a>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Prev / Next navigations */}
              <div className="flex justify-between items-center border-t border-white/10 pt-6 mt-10">
                <button
                  onClick={handlePrev}
                  disabled={modules.findIndex((m) => m.id === activeModule?.id) === 0}
                  className="px-5 py-3 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 select-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    modules.findIndex((m) => m.id === activeModule?.id) ===
                    modules.length - 1
                  }
                  className="px-6 py-3.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-black flex items-center gap-1 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                >
                  Modul Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <h3 className="text-white font-bold mb-1">
                Belum ada materi pembelajaran
              </h3>
              <p className="text-xs text-gray-400">
                Hubungi administrator atau dosen untuk mengisi materi kelas ini.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Outline */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sticky top-6 backdrop-blur-md space-y-4 select-none">
            <h3 className="text-sm font-bold text-white mb-2">Daftar Modul</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {modules.map((m, idx) => {
                const isActive = activeModule?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m)}
                    className={`w-full text-left px-4 py-3.5 border rounded-xl text-xs font-semibold flex justify-between items-center transition-all cursor-pointer select-none ${
                      isActive
                        ? "bg-orange-500/15 border-orange-500/40 text-orange-300 font-bold"
                        : "border-white/5 text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="truncate max-w-[200px]">
                      {idx + 1}. {m.title}
                    </span>
                    {isActive ? (
                      <Play className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-gray-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Admin control inside Outline */}
            {isAdmin && (
              <div className="border-t border-white/10 pt-4 mt-2">
                {!isAdding ? (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 border border-dashed border-orange-500/40 hover:border-orange-500 text-orange-400 rounded-xl text-xs hover:bg-orange-500/10 transition-all font-bold flex items-center justify-center gap-1 cursor-pointer select-none"
                  >
                    <Plus className="w-4 h-4" /> Tambah Materi
                  </button>
                ) : (
                  <form onSubmit={handleAddModule} className="space-y-3">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
                      Modul Baru
                    </p>
                    <div>
                      <input
                        type="text"
                        placeholder="Judul modul"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Konten/Deskripsi modul"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all h-24 shadow-inner"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Direct Link Media/Gambar (Optional)"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-black hover:shadow-[0_0_12px_rgba(249,115,22,0.3)] rounded-xl text-xs transition-all font-bold cursor-pointer select-none"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs transition-all font-medium text-gray-400 cursor-pointer select-none"
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
