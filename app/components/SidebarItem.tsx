interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function SidebarItem({
  icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? "bg-emerald-800 text-white font-semibold shadow-inner"
          : "text-emerald-100 hover:bg-emerald-600 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
