"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Role = "seeker" | "employer" | "admin" | "superadmin";

export const MOCK_ADMIN_EMAIL = "admin@merchantnavyjobs.example";
export const MOCK_ADMIN_PASSWORD = "admin123";
export const MOCK_SUPERADMIN_EMAIL = "superadmin@merchantnavyjobs.example";
export const MOCK_SUPERADMIN_PASSWORD = "superadmin123";

export type User = {
  name: string;
  email: string;
  role: Role;
};

type StoredAccount = User & { password: string };

type AuthResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string, role: Role) => AuthResult;
  loginStaff: (email: string, password: string) => AuthResult;
  signup: (
    name: string,
    email: string,
    password: string,
    role: Role
  ) => AuthResult;
  logout: () => void;
};

const ACCOUNTS_KEY = "mnj_accounts";
const SESSION_KEY = "mnj_session";

const AuthContext = createContext<AuthContextValue | null>(null);

function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const accounts = readAccounts();
    const seeded: StoredAccount[] = [...accounts];
    if (!seeded.some((a) => a.role === "admin")) {
      seeded.push({
        name: "Site Admin",
        email: MOCK_ADMIN_EMAIL,
        password: MOCK_ADMIN_PASSWORD,
        role: "admin",
      });
    }
    if (!seeded.some((a) => a.role === "superadmin")) {
      seeded.push({
        name: "Super Admin",
        email: MOCK_SUPERADMIN_EMAIL,
        password: MOCK_SUPERADMIN_PASSWORD,
        role: "superadmin",
      });
    }
    if (seeded.length !== accounts.length) {
      writeAccounts(seeded);
    }

    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // ignore corrupt session data
    }
    setReady(true);
  }, []);

  function login(email: string, password: string, role: Role): AuthResult {
    const accounts = readAccounts();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.role === role
    );
    if (!account || account.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session: User = {
      name: account.name,
      email: account.email,
      role: account.role,
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }

  function loginStaff(email: string, password: string): AuthResult {
    const accounts = readAccounts();
    const account = accounts.find(
      (a) =>
        a.email.toLowerCase() === email.toLowerCase() &&
        (a.role === "admin" || a.role === "superadmin")
    );
    if (!account || account.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session: User = {
      name: account.name,
      email: account.email,
      role: account.role,
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }

  function signup(
    name: string,
    email: string,
    password: string,
    role: Role
  ): AuthResult {
    const accounts = readAccounts();
    const exists = accounts.some(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.role === role
    );
    if (exists) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const account: StoredAccount = { name, email, password, role };
    writeAccounts([...accounts, account]);
    const session: User = { name, email, role };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }

  function logout() {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, loginStaff, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
