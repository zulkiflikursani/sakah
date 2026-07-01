import { NavItem } from "@/app/components/NavItem";
import { Home, Calculator, BookOpen, Trophy } from "lucide-react";
export default function NavbarMobile({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
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
  );
}
