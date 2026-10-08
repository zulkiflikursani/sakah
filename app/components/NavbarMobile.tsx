import { NavItem } from "@/app/components/NavItem";
import { Home, Calculator, BookOpen, Trophy, Settings } from "lucide-react";
import { useAuth } from "./AuthContext";
export default function NavbarMobile({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { user } = useAuth();
  return (
    <nav className="md:hidden absolute bottom-0 w-full pt-safe bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-20 pb-safe">
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
      {user?.role === "admin" && (
        <NavItem
          icon={<Settings size={24} />}
          label="Kelola"
          isActive={activeTab === "admin"}
          onClick={() => setActiveTab("admin")}
        />
      )}
    </nav>
  );
}
