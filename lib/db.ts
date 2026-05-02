import { supabase, isSupabaseConfigured } from "./supabase";

export interface User {
  uid: string;
  email: string;
  role: "admin" | "user";
}

export interface Course {
  id: string;
  title: string;
  description: string;
  enrollmentKey: string;
  thumbnailUrl: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  content: string;
  mediaUrl: string;
  pdfUrl?: string;
  externalLink?: string;
  order: number;
}

// Initial Mock Seed Data
const initialCourses: Course[] = [
  {
    id: "course-1",
    title: "Mastering Next.js & Tailwind",
    description: "Pelajari cara membangun UI modern dengan arsitektur yang scalable menggunakan Next.js App Router.",
    enrollmentKey: "PIJAR-NEXTJS-KEY",
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "course-2",
    title: "Workflow Automation with n8n",
    description: "Membangun agen AI dan otomatisasi alur kerja bisnis secara efektif.",
    enrollmentKey: "PIJAR-N8N-KEY",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400"
  }
];

const initialModules: Module[] = [
  {
    id: "mod-1-1",
    courseId: "course-1",
    title: "Pengantar Vibe Coding",
    content: "Vibe coding bukan sekadar tentang menulis kode, tetapi tentang merancang pengalaman visual yang langsung terasa oleh pengguna. Pada modul ini, kita akan fokus menggunakan struktur yang ada.",
    mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400",
    order: 1
  },
  {
    id: "mod-1-2",
    courseId: "course-1",
    title: "Setup Komponen Glassmorphism",
    content: "Di modul ini, Anda akan mempelajari rahasia di balik UI glassmorphism yang mengesankan, termasuk pengaturan blur, border semi-transparan, dan warna latar belakang yang elegan.",
    mediaUrl: "",
    order: 2
  },
  {
    id: "mod-1-3",
    courseId: "course-1",
    title: "Integrasi Supabase",
    content: "Hubungkan aplikasi Anda dengan Supabase PostgreSQL untuk mengelola data secara real-time.",
    mediaUrl: "",
    order: 3
  },
  {
    id: "mod-2-1",
    courseId: "course-2",
    title: "Pengantar n8n & Automations",
    content: "Pelajari bagaimana n8n dapat mengotomatiskan proses manual Anda dalam hitungan menit.",
    mediaUrl: "",
    order: 1
  }
];

// Helper to get/set local fallback data
const getLocalData = (key: string, fallback: any) => {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return fallback;
    }
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
};

const setLocalData = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ==================== DB OPERATIONS ====================

// --- USERS ---
export async function getUser(uid: string): Promise<User | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("PIJAR_users")
        .select("*")
        .eq("uid", uid)
        .single();
      
      if (!error && data) {
        return data as User;
      }
    } catch (e) {
      console.error(e);
    }
  }
  const users = getLocalData("local_users", []);
  return users.find((u: User) => u.uid === uid) || null;
}

export async function saveUser(user: User): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("PIJAR_users")
        .upsert(user, { onConflict: "uid" });
      if (error) throw error;
      return;
    } catch (e) {
      console.error(e);
    }
  }
  const users = getLocalData("local_users", []);
  const idx = users.findIndex((u: User) => u.uid === user.uid);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  setLocalData("local_users", users);
}

// --- COURSES ---
export async function getCourses(): Promise<Course[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("PIJAR_courses")
        .select("*");
      if (!error && data) {
        return data as Course[];
      }
    } catch (e) {
      console.error(e);
    }
  }
  return getLocalData("local_courses", initialCourses);
}

export async function addCourse(course: Omit<Course, "id">): Promise<Course> {
  const id = `course-${Date.now()}`;
  const newCourse = { id, ...course };

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("PIJAR_courses")
        .insert(newCourse);
      if (error) throw error;
      return newCourse;
    } catch (e) {
      console.error(e);
    }
  }
  const courses = getLocalData("local_courses", initialCourses);
  courses.push(newCourse);
  setLocalData("local_courses", courses);
  return newCourse;
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("PIJAR_courses")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Error updating course:", e);
      throw e;
    }
  }
  const courses = getLocalData("local_courses", initialCourses);
  const idx = courses.findIndex((c: Course) => c.id === id);
  if (idx >= 0) {
    courses[idx] = { ...courses[idx], ...updates };
    setLocalData("local_courses", courses);
  }
}

export async function deleteCourse(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      // Manually delete modules first to avoid Foreign Key constraint errors
      // if ON DELETE CASCADE is missing in the database schema
      await supabase.from("PIJAR_modules").delete().eq("courseId", id);

      const { error } = await supabase
        .from("PIJAR_courses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Error deleting course:", e);
      throw e;
    }
  }
  let courses = getLocalData("local_courses", initialCourses);
  courses = courses.filter((c: Course) => c.id !== id);
  setLocalData("local_courses", courses);

  // cascades deletion of modules locally
  let modules = getLocalData("local_modules", initialModules);
  modules = modules.filter((m: Module) => m.courseId !== id);
  setLocalData("local_modules", modules);
}

// --- MODULES ---
export async function getModules(courseId: string): Promise<Module[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("PIJAR_modules")
        .select("*")
        .eq("courseId", courseId)
        .order("order", { ascending: true });
      
      if (!error && data) {
        return data as Module[];
      }
    } catch (e) {
      console.error(e);
    }
  }
  const allModules = getLocalData("local_modules", initialModules);
  return allModules
    .filter((m: Module) => m.courseId === courseId)
    .sort((a: Module, b: Module) => a.order - b.order);
}

export async function addModule(mod: Omit<Module, "id">): Promise<Module> {
  const id = `mod-${Date.now()}`;
  const newMod = { id, ...mod };

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("PIJAR_modules")
        .insert(newMod);
      if (error) throw error;
      return newMod;
    } catch (e) {
      console.error("Error adding module:", e);
      throw e;
    }
  }
  const modules = getLocalData("local_modules", initialModules);
  modules.push(newMod);
  setLocalData("local_modules", modules);
  return newMod;
}

export async function updateModule(id: string, updates: Partial<Module>): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("PIJAR_modules")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Error updating module:", e);
      throw e;
    }
  }
  const modules = getLocalData("local_modules", initialModules);
  const idx = modules.findIndex((m: Module) => m.id === id);
  if (idx >= 0) {
    modules[idx] = { ...modules[idx], ...updates };
    setLocalData("local_modules", modules);
  }
}

export async function deleteModule(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("PIJAR_modules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Error deleting module:", e);
      throw e;
    }
  }
  let modules = getLocalData("local_modules", initialModules);
  modules = modules.filter((m: Module) => m.id !== id);
  setLocalData("local_modules", modules);
}
