import { SidebarItem } from "@/app/components/SidebarItem";
import {
  Home,
  Calculator,
  BookOpen,
  Trophy,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
export default function SideBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-emerald-700 text-white shadow-xl z-20 shrink-0">
      <div className="p-6 bg-emerald-800">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck size={28} className="text-emerald-300" />
          SAKAH
        </h1>
        <p className="text-xs text-emerald-200 mt-1">Sahabat Keuangan Halal</p>
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
  );
}
