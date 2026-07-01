import { Award, ShieldCheck, Trophy } from "lucide-react";
export function Gamifikasi() {
  return (
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 select-none touch-manipulation">
      {/* Profile & Points */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
        <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-3 border-4 border-white shadow-lg">
          <Trophy size={40} className="text-emerald-500" />
        </div>
        <h2 className="font-bold text-xl text-gray-800">Ahmad UMKM</h2>
        <p className="text-sm text-gray-500 mb-4">Toko Sembako Berkah</p>

        <div className="bg-emerald-50 rounded-xl p-4 inline-block min-w-[200px] border border-emerald-100">
          <p className="text-xs text-emerald-800 font-semibold mb-1">
            Poin Berkah Anda
          </p>
          <div className="flex justify-center items-center gap-2">
            <Award size={24} className="text-amber-500" />
            <span className="text-3xl font-bold text-emerald-700">1,450</span>
          </div>
        </div>
      </div>

      {/* Badges / Lencana */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Lencana Prestasi</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-gradient-to-b from-white to-amber-50 text-center shadow-sm">
            <ShieldCheck size={32} className="mx-auto text-amber-500 mb-2" />
            <h4 className="font-bold text-sm text-gray-800">Mubtadi</h4>
            <p className="text-[10px] text-gray-500">Mencatat rutin 7 hari</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center opacity-60">
            <Trophy size={32} className="mx-auto text-gray-400 mb-2" />
            <h4 className="font-bold text-sm text-gray-600">Mutawassith</h4>
            <p className="text-[10px] text-gray-500">
              Terkunci (Butuh 2000 poin)
            </p>
          </div>
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Misi Hari Ini</h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-semibold text-sm text-gray-800">
                Ikuti Kuis: Riba Nasi'ah
              </p>
              <p className="text-xs text-amber-600 font-medium">
                +50 Poin Berkah
              </p>
            </div>
            <button className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
              Mulai
            </button>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full w-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
