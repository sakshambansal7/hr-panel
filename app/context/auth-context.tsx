// app/context/auth-context.tsx


"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api, { setAuthToken } from "../lib/api";

// --- NATIVE JWT DECODER ---
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export type Role = "candidate" | "employer" | "admin" | "editor" | "superadmin";

export type User = {
  name: string;
  email: string;
  role: Role;
  lastLoginAt?: string;
};

export type ApiUser = {
  id?: number | string;
  name: string;
  email: string;
  role: string;
};

// Maps the roles the real backend uses onto this app's internal Role type
function mapApiRole(role: string): Role {
  const r = String(role || "").toLowerCase();
  if (r === "recruiter" || r === "employer" || r === "hr") return "employer";
  if (r === "candidate" || r === "seafarer") return "candidate";
  if (r === "super-admin" || r === "superadmin" || r.includes("super")) return "superadmin";
  if (r === "admin") return "admin";
  return "employer"; // Default for HR Panel
}

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  setSessionUser: (apiUser: ApiUser, token?: string) => void;
  logout: () => void;
};

const SESSION_KEY = "mnj_session";
const TOKEN_KEY = "accessToken";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // 🌍 RESTORE SESSION ON LOAD
  useEffect(() => {
    try {
      const token = window.localStorage.getItem(TOKEN_KEY);
      const rawSession = window.localStorage.getItem(SESSION_KEY);

      if (token) {
        setAuthToken(token); // Inject into Axios instantly
        const decoded = decodeJWT(token);
        
        if (rawSession) {
          const parsedUser = JSON.parse(rawSession) as User;
          if (decoded && decoded.role) {
            parsedUser.role = mapApiRole(decoded.role);
          }
          setUser(parsedUser);
        } else if (decoded) {
          // Fallback if session storage was wiped but token still exists
          const recoveredUser: User = {
            name: decoded.name || decoded.email || "Employer",
            email: decoded.email || "",
            role: mapApiRole(decoded.role),
          };
          setUser(recoveredUser);
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(recoveredUser));
        }
      }
    } catch (e) {
      console.error("Failed to restore session from token", e);
    }
    
    setReady(true);
  }, []);

  // 🚀 REAL PRODUCTION SESSION HANDLER
  function setSessionUser(apiUser: ApiUser, token?: string) {
    let finalRole = mapApiRole(apiUser.role || "hr");

    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.role) {
        finalRole = mapApiRole(decoded.role);
      }
    }

    const lastLoginAt = new Date().toISOString();
    
    const session: User = {
      // Fallback to email if name isn't provided by backend yet
      name: apiUser.name || apiUser.email, 
      email: apiUser.email,
      role: finalRole, 
      lastLoginAt,
    };
    
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token); // Inject into Axios for future requests
    }
    
    setUser(session);
  }

  // 🚀 REAL PRODUCTION LOGOUT HANDLER
  async function logout() {
    try {
      await api.post("/auth/logout"); 
    } catch (err) {
      console.error("Backend logout failed", err);
    }

    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    window.location.href = "/login"; // Force redirect to clear memory
  }

  return (
    <AuthContext.Provider value={{ user, ready, setSessionUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}