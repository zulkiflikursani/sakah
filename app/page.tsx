"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BukuKas } from "@/app/components/BukuKas";
import { Kalkulator } from "@/app/components/Kalkulator";
import { Edukasi } from "@/app/components/Edukasi";
import { Gamifikasi } from "@/app/components/Gamifikasi";
import { NavItem } from "@/app/components/NavItem";
import { SidebarItem } from "@/app/components/SidebarItem";

import {
  Home,
  Calculator,
  BookOpen,
  Trophy,
  Wallet,
  ShieldCheck,
} from "lucide-react";
export default function App() {
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
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

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
      <aside className="hidden md:flex flex-col w-64 bg-emerald-700 text-white shadow-xl z-20 shrink-0">
        <div className="p-6 bg-emerald-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck size={28} className="text-emerald-300" />
            SAKAH
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Sahabat Keuangan Halal
          </p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem
            icon={<Home size={20} />}
            label="Buku Kas"
            isActive={activeTab === "kas"}
            onClick={() => setActiveTab("kas")}
          />
          <SidebarItem
            icon={<Calculator size={20} />}
            label="Kalkulator"
            isActive={activeTab === "kalkulator"}
            onClick={() => setActiveTab("kalkulator")}
          />
          <SidebarItem
            icon={<BookOpen size={20} />}
            label="Edukasi"
            isActive={activeTab === "edukasi"}
            onClick={() => setActiveTab("edukasi")}
          />
          <SidebarItem
            icon={<Trophy size={20} />}
            label="Gamifikasi"
            isActive={activeTab === "gamifikasi"}
            onClick={() => setActiveTab("gamifikasi")}
          />
        </nav>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header Aplikasi */}
        <header className="bg-emerald-600 md:bg-white text-white md:text-gray-800 p-4 shadow-md md:shadow-sm md:border-b border-gray-200 z-10 shrink-0">
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
              <h2 className="text-xl font-bold capitalize text-gray-800">
                {activeTab === "kas" ? "Buku Kas Halal" : activeTab}
              </h2>
            </div>

            <div className="bg-emerald-700 md:bg-emerald-50 p-2 rounded-full cursor-pointer hover:bg-emerald-800 md:hover:bg-emerald-100 transition">
              <Wallet
                size={20}
                className="text-emerald-100 md:text-emerald-600"
              />
            </div>
          </div>
        </header>

        {/* Konten Tab yang bisa di-scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === "kas" && <BukuKas />}
            {activeTab === "kalkulator" && <Kalkulator />}
            {activeTab === "edukasi" && <Edukasi />}
            {activeTab === "gamifikasi" && <Gamifikasi />}
          </div>
        </main>

        {/* Navigasi Bawah untuk Mobile (Tersembunyi di Desktop) */}
        <nav className="md:hidden absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-20 pb-safe">
          <NavItem
            icon={<Home size={24} />}
            label="Kas"
            isActive={activeTab === "kas"}
            onClick={() => setActiveTab("kas")}
          />
          <NavItem
            icon={<Calculator size={24} />}
            label="Hitung"
            isActive={activeTab === "kalkulator"}
            onClick={() => setActiveTab("kalkulator")}
          />
          <NavItem
            icon={<BookOpen size={24} />}
            label="Edukasi"
            isActive={activeTab === "edukasi"}
            onClick={() => setActiveTab("edukasi")}
          />
          <NavItem
            icon={<Trophy size={24} />}
            label="Poin"
            isActive={activeTab === "gamifikasi"}
            onClick={() => setActiveTab("gamifikasi")}
          />
        </nav>
      </div>
    </div>
  );
}
