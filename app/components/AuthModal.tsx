"use client";

import { useState } from "react";
import { Loader2, LogOut, Mail, Lock, User, X, Award } from "lucide-react";
import type { AuthUser } from "./AuthContext";

export type ModeAuth = "login" | "register" | "akun";

export function AuthModal({
  mode,
  setMode,
  onClose,
  onSuccess,
  user,
  onLogout,
}: {
  mode: ModeAuth;
  setMode: (m: ModeAuth) => void;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (isRegister && name.trim().length < 2) {
      setError("Nama minimal 2 karakter");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Format email tidak valid");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? { name: name.trim(), email: email.trim(), password }
            : { email: email.trim(), password },
        ),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Terjadi kesalahan");
        return;
      }
      await onSuccess();
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await onLogout();
    onClose();
  };

  const initials = (user?.name ?? "")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl p-6 md:p-8 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === "login"
              ? "Masuk Akun"
              : mode === "register"
                ? "Daftar Akun"
                : "Akun Saya"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {mode === "akun" && user && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center text-xl font-bold border-4 border-emerald-50">
                {initials || "U"}
              </div>
              <p className="font-bold text-gray-800 mt-3">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
              <span className="text-sm text-emerald-900 font-medium flex items-center gap-2">
                <Award size={16} /> Poin Berkah
              </span>
              <span className="text-2xl font-bold text-emerald-700">
                {user.poin.toLocaleString("id-ID")}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-white border border-rose-200 text-rose-600 font-bold py-3 rounded-xl hover:bg-rose-50 transition flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        )}

        {mode !== "akun" && (
          <>
            <form onSubmit={submit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5 select-none">
                    Nama Lengkap
                  </label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-200 transition-all">
                    <User size={18} className="ml-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent p-3.5 text-base focus:outline-none"
                      placeholder="Contoh: Ahmad Fauzi"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5 select-none">
                  Email
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-200 transition-all">
                  <Mail size={18} className="ml-4 text-gray-500 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent p-3.5 text-base focus:outline-none"
                    placeholder="nama@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5 select-none">
                  Password
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-200 transition-all">
                  <Lock size={18} className="ml-4 text-gray-500 shrink-0" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent p-3.5 text-base focus:outline-none"
                    placeholder="Minimal 6 karakter"
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy && <Loader2 size={18} className="animate-spin" />}
                {isRegister ? "Daftar & Masuk" : "Masuk"}
              </button>
            </form>

            <p className="text-sm text-gray-600 text-center mt-5">
              {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode(isRegister ? "login" : "register");
                }}
                className="text-emerald-700 font-bold hover:underline"
              >
                {isRegister ? "Masuk" : "Daftar"}
              </button>
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Login menyimpan poin dan progres kuis edukasi kamu.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
