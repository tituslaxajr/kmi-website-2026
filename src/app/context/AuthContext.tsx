"use client"
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getSupabase, signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut, getSession } from "../lib/api";

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email || "",
          });
          setAccessToken(session.access_token);
        }
      } catch (e) {
        console.log("Session check error:", e);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for auth state changes
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email || "",
        });
        setAccessToken(session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    try {
      const result = await apiSignUp(name, email, password);
      return { success: true };
    } catch (e: any) {
      console.error("Signup error in AuthContext:", e);
      return { success: false, error: e.message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await apiSignIn(email, password);
      return { success: true };
    } catch (e: any) {
      console.error("Login error in AuthContext:", e);
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    try {
      await apiSignOut();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
