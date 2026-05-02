"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getUser, saveUser, User } from "@/lib/db";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoaded: boolean;
  login: (email: string, password?: string, role?: "admin" | "user") => Promise<void>;
  logout: () => void;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read from localStorage to persist login state across navigation
    const savedUser = localStorage.getItem("pijar_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoaded(true);
  }, []);

  const login = async (email: string, password?: string, requestedRole?: "admin" | "user") => {
    // Explicitly check for specific Admin Emails
    const ADMIN_EMAILS = ["admin@pijar.id", "ceo@pijar.id", "hadi@pijar.id", "admin@pijarteknologi.id"];
    
    // Simple password check for admin@pijarteknologi.id
    if (email.trim().toLowerCase() === "admin@pijarteknologi.id" && password && password !== "123") {
      throw new Error("Password salah!");
    }

    // Generate a fixed or custom uid based on email
    const uid = `u-${Buffer.from(email).toString("base64").substring(0, 8)}`;
    let role: "admin" | "user" = "user";

    if (ADMIN_EMAILS.includes(email.trim().toLowerCase()) || requestedRole === "admin") {
      role = "admin";
    }

    // Check database if this user is stored
    const existingUser = await getUser(uid);
    if (existingUser) {
      role = existingUser.role;
    } else {
      // First-time user, save to database
      await saveUser({ uid, email, role });
    }

    const newUser: User = { uid, email, role };
    setUser(newUser);
    localStorage.setItem("pijar_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pijar_user");
  };

  const toggleRole = async () => {
    if (!user) return;
    const newRole = user.role === "admin" ? "user" : "admin";
    const updatedUser: User = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem("pijar_user", JSON.stringify(updatedUser));
    await saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isLoaded,
        login,
        logout,
        toggleRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
