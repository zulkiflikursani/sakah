import { useState } from "react";
import { X } from "lucide-react";
export function AddTransactionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (transaction: any) => void;
}) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [isHalal, setIsHalal] = useState(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amount || !category) return;
    onSave({
      type,
      amount: parseInt(amount),
      category,
      date: "Baru saja",
      isHalal,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-2xl p-6 md:p-8 animate-slide-up shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
            Catat Transaksi Baru
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6 select-none touch-manipulation">
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${type === "income" ? "bg-white shadow-sm text-emerald-600 scale-[1.02]" : "text-gray-500 hover:bg-gray-200/50"}`}
              onClick={() => setType("income")}
            >
              Pemasukan
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${type === "expense" ? "bg-white shadow-sm text-red-600 scale-[1.02]" : "text-gray-500 hover:bg-gray-200/50"}`}
              onClick={() => setType("expense")}
            >
              Pengeluaran
            </button>
          </div>

          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2 select-none">
                Nominal (Rp)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border-b-2 border-gray-200 p-2 text-3xl font-bold focus:outline-none focus:border-emerald-500 transition-colors bg-transparent"
                placeholder="0"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2 select-none">
                Kategori / Keterangan
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Contoh: Hasil Jualan Baju, Gaji Pegawai..."
              />
            </div>

            <div className="flex items-center gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-colors">
              <input
                type="checkbox"
                id="halal"
                checked={isHalal}
                onChange={(e) => setIsHalal(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
              <label
                htmlFor="halal"
                className="text-sm select-none md:text-base font-medium text-emerald-900 cursor-pointer select-none"
              >
                Insya Allah bersumber dari yang Halal & Berkah
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all text-lg shadow-lg shadow-emerald-600/30"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
}
