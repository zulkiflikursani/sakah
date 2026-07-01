import { ArrowRight, BookMarked } from "lucide-react";
export function Edukasi() {
  const modules = [
    {
      title: "Mengenal Riba dalam Jual Beli",
      type: "Artikel",
      time: "3 mnt",
      image: "bg-red-100 text-red-600",
    },
    {
      title: "Akad Mudharabah: Bagi Hasil yang Adil",
      type: "Video",
      time: "5 mnt",
      image: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pisahkan Uang Pribadi & Bisnis",
      type: "Panduan",
      time: "2 mnt",
      image: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <BookMarked size={80} className="absolute -right-4 -top-4 opacity-20" />
        <h2 className="text-lg font-bold mb-1 relative z-10">
          Pusat Ilmu Syariah
        </h2>
        <p className="text-sm text-emerald-50 mb-4 relative z-10">
          Tingkatkan berkah dengan pemahaman akad.
        </p>
        <button className="bg-white text-emerald-700 px-4 py-2 rounded-full text-xs font-bold shadow hover:bg-gray-50 transition">
          Mulai Belajar
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 select-none">
          <h3 className="font-bold text-gray-800">Materi Terpopuler</h3>
        </div>
        <div className="space-y-3">
          {modules.map((mod, idx) => (
            <div
              key={idx}
              className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center cursor-pointer hover:shadow-md transition"
            >
              <div
                className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xs ${mod.image}`}
              >
                {mod.type}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">{mod.title}</h4>
                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                  <span>{mod.type}</span> • <span>{mod.time} baca</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
