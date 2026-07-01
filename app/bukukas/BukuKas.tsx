"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { AddTransactionModal } from "../components/AddTransactionModel";

export function BukuKas() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fungsi untuk mengambil data dari API Endpoint Vercel Postgres
  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transaksi");
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetch saat komponen pertama kali dimuat
  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. Fungsi untuk menyimpan data baru via POST ke API
  const handleAddTransaction = async (
    newTrx: Omit<(typeof transactions)[0], "id">,
  ) => {
    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: newTrx.type,
          amount: newTrx.amount,
          category: newTrx.category,
          is_halal: newTrx.isHalal ?? true, // Menyesuaikan nama properti database snake_case
        }),
      });

      if (res.ok) {
        // Segarkan data dari database agar sinkron secara real-time
        fetchTransactions();
        setShowAddForm(false);
      } else {
        alert("Gagal menyimpan transaksi ke database.");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan transaksi:", error);
    }
  };

  // Logika kalkulasi keuangan tetap sama (Konversi Number untuk menjaga presisi tipe DECIMAL)
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="p-4 relative min-h-full animate-pulse select-none">
        {/* Skeleton Saldo Card */}
        <div className="sticky top-0 z-20 pt-4 pb-2 -mt-4 bg-gray-50 lg:bg-transparent lg:p-0 lg:m-0 lg:top-0">
          <div className="bg-gray-200 rounded-2xl p-6 shadow-md h-40 flex flex-col justify-between">
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="flex justify-between border-t border-gray-300/50 pt-4">
              <div className="flex items-center gap-2 w-1/3">
                <div className="bg-gray-300 p-4 rounded-full h-8 w-8 shrink-0"></div>
                <div className="w-full space-y-1">
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-1/3">
                <div className="bg-gray-300 p-4 rounded-full h-8 w-8 shrink-0"></div>
                <div className="w-full space-y-1">
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Judul Transaksi Terbaru */}
        <div className="mb-4 mt-6 flex justify-between items-end">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>

        {/* Skeleton List Transaksi (Looping 3 Baris Tiruan) */}
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center"
            >
              <div className="flex items-center gap-3 w-2/3">
                {/* Lingkaran Ikon */}
                <div className="bg-gray-200 rounded-full h-11 w-11 shrink-0"></div>
                {/* Teks Kategori & Tanggal */}
                <div className="w-full space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              </div>
              {/* Nominal Kanan */}
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
                  <span className="text-xs text-gray-500">
                    {/* Mengonversi format timestamp database menjadi string tanggal lokal */}
                    {new Date(trx.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {(trx.is_halal ?? trx.isHalal) && (
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
              {trx.type === "income" ? "+" : "-"}Rp
              {(Number(trx.amount) / 1000).toLocaleString("id-ID")}k
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
