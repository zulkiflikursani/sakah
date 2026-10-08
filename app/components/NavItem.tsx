interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? "text-emerald-700" : "text-gray-500 hover:text-emerald-600"}`}
    >
      <div
        className={`${isActive ? "bg-emerald-50 p-1.5 rounded-xl" : "p-1.5"}`}
      >
        {icon}
      </div>
      <span
        className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}
      >
        {label}
      </span>
    </button>
  );
}
