import { useState } from "react";
import { ShieldCheck, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { AddTransactionModal } from "./AddTransactionModel";

export function BukuKas() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: "income",
      amount: 1500000,
      category: "Penjualan Produk",
      date: "Hari ini",
      isHalal: true,
    },
    {
      id: 2,
      type: "expense",
      amount: 350000,
      category: "Bahan Baku",
      date: "Kemarin",
      isHalal: true,
    },
    {
      id: 3,
      type: "expense",
      amount: 50000,
      category: "Transportasi",
      date: "Kemarin",
      isHalal: true,
    },
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddTransaction = (
    newTrx: Omit<(typeof transactions)[0], "id">,
  ) => {
    setTransactions([{ id: Date.now(), ...newTrx }, ...transactions]);
    setShowAddForm(false);
  };

  return (
    <div className="p-4 relative min-h-full">
      {/* Saldo Card */}
      <div className="lg:col-span-1 sticky top-0 z-20 pt-4 pb-2 -mt-4 bg-gray-50 lg:bg-transparent lg:p-0 lg:m-0 lg:top-0">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg lg:sticky lg:top-0 select-none touch-manipulation">
          <p className="text-emerald-100 text-sm mb-1 font-medium">
            Total Saldo Bisnis
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Rp {balance.toLocaleString("id-ID")}
          </h2>
          <div className="flex justify-between border-t border-emerald-400/50 pt-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-xs text-emerald-100">Pemasukan</p>
                <p className="font-semibold text-sm">
                  Rp {totalIncome.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <TrendingDown size={16} />
              </div>
              <div>
                <p className="text-xs text-emerald-100">Pengeluaran</p>
                <p className="font-semibold text-sm">
                  Rp {totalExpense.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaksi Terbaru */}
      <div className="mb-4 flex justify-between items-end">
        <h3 className="font-bold text-gray-800 text-lg">Transaksi Terbaru</h3>
        <button className="text-emerald-600 text-sm font-medium">
          Lihat Semua
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((trx) => (
          <div
            key={trx.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${trx.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
              >
                {trx.type === "income" ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{trx.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{trx.date}</span>
                  {trx.isHalal && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                      <ShieldCheck size={10} /> Syariah
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p
              className={`font-bold ${trx.type === "income" ? "text-emerald-600" : "text-gray-800"}`}
            >
              {trx.type === "income" ? "+" : "-"}Rp{trx.amount / 1000}k
            </p>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:bg-emerald-700 transition-colors z-30"
      >
        <Plus size={24} />
      </button>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <AddTransactionModal
          onClose={() => setShowAddForm(false)}
          onSave={handleAddTransaction}
        />
      )}
    </div>
  );
}
