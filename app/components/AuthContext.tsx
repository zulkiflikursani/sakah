"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthModal, type ModeAuth } from "./AuthModal";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  poin: number;
  role: string;
};

export type ProgresKuis = {
  modulSlug: string;
  attempts: number;
  bestPercentage: number;
  lastPercentage: number;
  updatedAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  progres: ProgresKuis[];
  memuat: boolean;
  modalOpen: boolean;
  modalMode: ModeAuth;
  openAuth: (mode?: ModeAuth) => void;
  closeAuth: () => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [progres, setProgres] = useState<ProgresKuis[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModeAuth>("login");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success) {
        setUser(json.data.user);
        setProgres(json.data.progres ?? []);
      }
    } catch (error) {
      console.error("Gagal memuat sesi:", error);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openAuth = useCallback((mode: ModeAuth = "login") => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const closeAuth = useCallback(() => setModalOpen(false), []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
    setUser(null);
    setProgres([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        progres,
        memuat,
        modalOpen,
        modalMode,
        openAuth,
        closeAuth,
        refresh,
        logout,
      }}
    >
      {children}
      {modalOpen && (
        <AuthModal
          mode={modalMode}
          setMode={setModalMode}
          onClose={closeAuth}
          onSuccess={async () => {
            await refresh();
            setModalOpen(false);
          }}
          user={user}
          onLogout={logout}
        />
      )}
    </AuthContext.Provider>
  );
}
