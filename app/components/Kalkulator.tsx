import { useState } from "react";
import { Calculator } from "lucide-react";
export function Kalkulator() {
  const [aset, setAset] = useState("");
  const [utang, setUtang] = useState("");

  const valAset = Number(aset) || 0;
  const valUtang = Number(utang) || 0;
  const hartaBersih = valAset - valUtang;
  const nisab = 85000000;
  const isWajib = hartaBersih >= nisab;
  const zakat = isWajib ? hartaBersih * 0.025 : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header Kalkulator */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Kalkulator Syariah</h2>
        <p className="text-sm text-gray-500">
          Hitung kewajiban dan bagi hasil dengan mudah
        </p>
      </div>

      {/* Tabs Sub-Menu (Visual only for prototype) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 select-none touch-manipulation">
        <span className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm">
          Zakat Perniagaan
        </span>
        <span className="bg-white text-gray-600 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 whitespace-nowrap">
          Bagi Hasil (Mudharabah)
        </span>
        <span className="bg-white text-gray-600 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 whitespace-nowrap">
          Margin (Murabahah)
        </span>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-emerald-600" /> Zakat Maal /
          Bisnis
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 select-none">
              Total Aset Lancar (Kas, Barang, dll)
            </label>
            <div className="flex items-center mt-1">
              <span className="bg-gray-100 p-3 rounded-l-xl text-gray-500 font-medium border border-r-0 border-gray-200">
                Rp
              </span>
              <input
                type="number"
                value={aset}
                onChange={(e) => setAset(e.target.value)}
                className="flex-1 border border-gray-200 p-3 rounded-r-xl focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 select-none">
              Utang Jatuh Tempo
            </label>
            <div className="flex items-center mt-1">
              <span className="bg-gray-100 p-3 rounded-l-xl text-gray-500 font-medium border border-r-0 border-gray-200">
                Rp
              </span>
              <input
                type="number"
                value={utang}
                onChange={(e) => setUtang(e.target.value)}
                className="flex-1 border border-gray-200 p-3 rounded-r-xl focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Result Area */}
        <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Harta Bersih:</span>
            <span className="font-semibold">
              Rp {hartaBersih.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between mb-4 pb-4 border-b border-emerald-200/50">
            <span className="text-sm text-gray-600">Status Nisab (85jt):</span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${isWajib ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
            >
              {isWajib ? "Wajib Zakat" : "Belum Wajib"}
            </span>
          </div>

          <div>
            <span className="block text-xs text-emerald-800 font-medium mb-1">
              Zakat yang harus dibayar (2.5%):
            </span>
            <span className="text-3xl font-bold text-emerald-600">
              Rp {zakat.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
