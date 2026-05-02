"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getUser, saveUser, User } from "@/lib/db";

interface AuthUser extends User {
  token?: string;
  roleSlug?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoaded: boolean;
  login: (email: string, password?: string, requestedRole?: "admin" | "user") => Promise<{ roleSlug: string; token: string }>;
  logout: () => void;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
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
    // Call the Pijar Teknologi API
    const response = await fetch('https://pijarteknologi.id/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: password || ''
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Determine local role based on API roleSlug
    let role: "admin" | "user" = "user";
    if (data.roleSlug === 'global:admin' || data.roleSlug === 'global:owner') {
      role = "admin";
    }

    // Generate uid based on email
    const uid = `u-${Buffer.from(email).toString("base64").substring(0, 8)}`;

    // Create user object
    const newUser: AuthUser = {
      uid,
      email,
      role,
      token: data.token,
      roleSlug: data.roleSlug
    };

    setUser(newUser);
    localStorage.setItem("pijar_user", JSON.stringify(newUser));

    // Return roleSlug and token for redirect logic
    return { roleSlug: data.roleSlug, token: data.token };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pijar_user");
  };

  const toggleRole = async () => {
    if (!user) return;
    const newRole = user.role === "admin" ? "user" : "admin";
    const updatedUser: AuthUser = { ...user, role: newRole };
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
