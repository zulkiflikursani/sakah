"use client";

import { useState } from "react";
import { Calculator, HandCoins, Percent } from "lucide-react";

type Tab = "zakat" | "mudharabah" | "murabahah";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "zakat", label: "Zakat Perniagaan" },
  { id: "mudharabah", label: "Bagi Hasil (Mudharabah)" },
  { id: "murabahah", label: "Margin (Murabahah)" },
];

const rupiah = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

/** Input angka rupiah yang aman (mengabaikan negatif & nilai bukan angka). */
function RpInput({
  label,
  value,
  onChange,
  placeholder = "0",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 select-none">
        {label}
      </label>
      <div className="flex items-center mt-1">
        <span className="bg-gray-100 p-3 rounded-l-xl text-gray-600 font-medium border border-r-0 border-gray-200">
          Rp
        </span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 p-3 rounded-r-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition-colors"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export function Kalkulator() {
  const [tab, setTab] = useState<Tab>("zakat");

  // Zakat Perniagaan
  const [aset, setAset] = useState("");
  const [utang, setUtang] = useState("");
  const valAset = Math.max(0, Number(aset) || 0);
  const valUtang = Math.max(0, Number(utang) || 0);
  const hartaBersih = valAset - valUtang;
  const nisab = 85000000;
  const isWajib = hartaBersih >= nisab;
  const zakat = isWajib ? hartaBersih * 0.025 : 0;

  // Mudharabah (bagi hasil)
  const [modal, setModal] = useState("");
  const [untung, setUntung] = useState("");
  const [nisbah, setNisbah] = useState("40");
  const valModal = Math.max(0, Number(modal) || 0);
  const valUntung = Math.max(0, Number(untung) || 0);
  const nisbahPengelola = Math.min(100, Math.max(0, Number(nisbah) || 0));
  const bagiPengelola = (valUntung * nisbahPengelola) / 100;
  const bagiInvestor = valUntung - bagiPengelola;
  const roi = valModal > 0 ? (valUntung / valModal) * 100 : 0;

  // Murabahah (margin + cicilan)
  const [hargaBeli, setHargaBeli] = useState("");
  const [margin, setMargin] = useState("");
  const [uangMuka, setUangMuka] = useState("");
  const [tenor, setTenor] = useState("24");
  const valBeli = Math.max(0, Number(hargaBeli) || 0);
  const valMargin = Math.max(0, Number(margin) || 0);
  const valDp = Math.max(0, Number(uangMuka) || 0);
  const valTenor = Math.max(0, Number(tenor) || 0);
  const hargaJual = valBeli + valMargin;
  const marginPersen = valBeli > 0 ? (valMargin / valBeli) * 100 : 0;
  const sisaTagihan = Math.max(0, hargaJual - valDp);
  const cicilan = valTenor > 0 ? sisaTagihan / valTenor : 0;

  return (
    <div className="p-4 space-y-6 overscroll-contain min-h-full">
      {/* Header Kalkulator */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Kalkulator Syariah</h2>
        <p className="text-sm text-gray-600">
          Hitung kewajiban dan bagi hasil dengan mudah
        </p>
      </div>

      {/* Tabs Sub-Menu */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 select-none touch-manipulation">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Zakat Perniagaan */}
      {tab === "zakat" && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calculator size={18} className="text-emerald-600" /> Zakat Maal /
            Bisnis
          </h3>

          <div className="space-y-4">
            <RpInput label="Total Aset Lancar (Kas, Barang, dll)" value={aset} onChange={setAset} />
            <RpInput label="Utang Jatuh Tempo" value={utang} onChange={setUtang} />
          </div>

          <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-700">Harta Bersih:</span>
              <span className="font-semibold text-gray-900">
                {rupiah(hartaBersih)}
              </span>
            </div>
            <div className="flex justify-between mb-4 pb-4 border-b border-emerald-200/50">
              <span className="text-sm text-gray-700">Status Nisab (85jt):</span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  isWajib
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isWajib ? "Wajib Zakat" : "Belum Wajib"}
              </span>
            </div>

            <div>
              <span className="block text-xs text-emerald-800 font-medium mb-1">
                Zakat yang harus dibayar (2.5%):
              </span>
              <span className="text-3xl font-bold text-emerald-700">
                {rupiah(zakat)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mudharabah */}
      {tab === "mudharabah" && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HandCoins size={18} className="text-emerald-600" /> Bagi Hasil
            Mudharabah
          </h3>

          <div className="space-y-4">
            <RpInput label="Modal Investor (Shahibul Maal)" value={modal} onChange={setModal} />
            <RpInput label="Keuntungan Bersih Usaha" value={untung} onChange={setUntung} />
            <div>
              <label className="text-xs font-semibold text-gray-600 select-none">
                Nisbah Pengelola (%)
              </label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={nisbahPengelola}
                  onChange={(e) => setNisbah(e.target.value)}
                  className="flex-1 accent-emerald-600"
                />
                <span className="w-16 text-right font-bold text-gray-800">
                  {nisbahPengelola}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">
                Bagi Investor ({100 - nisbahPengelola}%):
              </span>
              <span className="font-bold text-gray-900">
                {rupiah(bagiInvestor)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">
                Bagi Pengelola ({nisbahPengelola}%):
              </span>
              <span className="font-bold text-emerald-700">
                {rupiah(bagiPengelola)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-emerald-200/60">
              <span className="text-sm text-gray-700">Imbal Hasil (ROI):</span>
              <span className="font-bold text-gray-900">
                {roi.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Dalam Mudharabah, kerugian bukan karena kelalaian ditanggung oleh
            pemilik modal.
          </p>
        </div>
      )}

      {/* Murabahah */}
      {tab === "murabahah" && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Percent size={18} className="text-emerald-600" /> Margin
            Murabahah
          </h3>

          <div className="space-y-4">
            <RpInput label="Harga Beli (Harga Perolehan)" value={hargaBeli} onChange={setHargaBeli} />
            <RpInput label="Margin Keuntungan" value={margin} onChange={setMargin} />
            <RpInput label="Uang Muka (DP) — boleh 0" value={uangMuka} onChange={setUangMuka} />
            <div>
              <label className="text-xs font-semibold text-gray-600 select-none">
                Tenor Angsuran (bulan)
              </label>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={tenor}
                onChange={(e) => setTenor(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-xl mt-1 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition-colors"
                placeholder="24"
              />
            </div>
          </div>

          <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Harga Jual:</span>
              <span className="font-bold text-gray-900">{rupiah(hargaJual)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Margin:</span>
              <span className="font-bold text-gray-900">
                {rupiah(valMargin)} (
                {marginPersen.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
                %)
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-emerald-200/60">
              <span className="text-sm text-gray-700">Cicilan per Bulan:</span>
              <span className="text-xl font-bold text-emerald-700">
                {rupiah(cicilan)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Harga jual dan margin disepakati di awal akad — bukan bunga yang
            bertambah seiring waktu.
          </p>
        </div>
      )}
    </div>
  );
}
