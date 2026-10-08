"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, User } from "lucide-react";
import { BukuKas } from "@/app/bukukas/BukuKas";
import { Kalkulator } from "@/app/kalkulator/Kalkulator";
import { Edukasi } from "@/app/edukasi/Edukasi";
import { Gamifikasi } from "@/app/gamifikasi/Gamifikasi";
import { Admin } from "@/app/admin/Admin";
import SideBar from "./components/SideBar";
import NavbarMobile from "./components/NavbarMobile";
import { AuthProvider, useAuth } from "./components/AuthContext";

const JUDUL_TAB: Record<string, string> = {
  kas: "Buku Kas Halal",
  kalkulator: "Kalkulator Syariah",
  edukasi: "Pusat Edukasi",
  gamifikasi: "Gamifikasi",
  admin: "Manajemen Konten",
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, openAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("kas");
  useEffect(() => {
    // 1. Set Meta Viewport agar user-scalable=no
    let meta: HTMLMetaElement | null = document.querySelector(
      'meta[name="viewport"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";

    // 2. Mencegah pinch-to-zoom (cubit dengan 2 jari)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 3. Mencegah double-tap to zoom (ketuk dua kali cepat)
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Menerapkan event listener
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    // Membersihkan event listener jika komponen di-unmount
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
  return (
    <div className="h-screen bg-gray-50 flex font-sans overflow-hidden">
      {/* Sidebar untuk Desktop / Tablet (Tersembunyi di Mobile) */}
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header Aplikasi */}
        <header className="bg-emerald-600 md:bg-white text-white md:text-gray-800 px-4 pb-4 pt-[calc(env(safe-area-inset-top)_+_1rem)] md:p-4 shadow-md md:shadow-sm md:border-b border-gray-200 z-10 shrink-0">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            {/* Tampilan Header Mobile */}
            <div className="md:hidden">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck size={24} className="text-emerald-200" />
                SAKAH
              </h1>
              <p className="text-xs text-emerald-100">Sahabat Keuangan Halal</p>
            </div>

            {/* Tampilan Header Desktop */}
            <div className="hidden md:block">
              <h2 className="text-xl font-bold text-gray-800">
                {JUDUL_TAB[activeTab] ?? activeTab}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => openAuth(user ? "akun" : "login")}
              aria-label={user ? "Akun saya" : "Masuk akun"}
              className="bg-emerald-700 md:bg-emerald-50 p-2 rounded-full cursor-pointer hover:bg-emerald-800 md:hover:bg-emerald-100 transition flex items-center justify-center min-w-[36px] min-h-[36px]"
            >
              {user ? (
                <span className="text-xs font-bold text-emerald-100 md:text-emerald-700">
                  {user.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
              ) : (
                <User
                  size={20}
                  className="text-emerald-100 md:text-emerald-600"
                />
              )}
            </button>
          </div>
        </header>

        {/* Konten Tab yang bisa di-scroll */}
        <main className="flex-1 overflow-y-auto overscroll-behavior-y-contain p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto pb-24 md:pb-8">
            {activeTab === "kas" && <BukuKas />}
            {activeTab === "kalkulator" && <Kalkulator />}
            {activeTab === "edukasi" && <Edukasi />}
            {activeTab === "gamifikasi" && (
              <Gamifikasi setActiveTab={setActiveTab} />
            )}
            {activeTab === "admin" && <Admin />}
          </div>
        </main>

        {/* Navigasi Bawah untuk Mobile (Tersembunyi di Desktop) */}
        <NavbarMobile activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
