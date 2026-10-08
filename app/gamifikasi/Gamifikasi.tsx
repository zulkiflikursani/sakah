"use client";

import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  LogIn,
  Medal,
  Rocket,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthContext";

type ModulMini = { slug: string; title: string };
type Papan = {
  top: { rank: number; name: string; poin: number }[];
  saya: { rank: number; total: number; name: string; poin: number };
};

const medali = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

const judulSlug = (slug: string, moduls: ModulMini[]) =>
  moduls.find((m) => m.slug === slug)?.title ??
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function Gamifikasi({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) {
  const { user, progres, memuat, openAuth } = useAuth();
  const [moduls, setModuls] = useState<ModulMini[]>([]);
  const [papan, setPapan] = useState<Papan | null>(null);
  const [papanPesan, setPapanPesan] = useState("");

  // Papan peringkat (hanya pengguna login)
  useEffect(() => {
    if (!user) {
      setPapan(null);
      setPapanPesan("");
      return;
    }
    let batal = false;
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((j) => {
        if (batal) return;
        if (j.success) {
          setPapan(j.data as Papan);
          setPapanPesan("");
        } else {
          setPapanPesan(j.error ?? "Gagal memuat");
        }
      })
      .catch(() => {
        if (!batal) setPapanPesan("Gagal memuat papan peringkat");
      });
    return () => {
      batal = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.poin, user?.id]);

  useEffect(() => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setModuls(
            j.data.modul.map((m: { slug: string; title: string }) => ({
              slug: m.slug,
              title: m.title,
            })),
          );
        }
      })
      .catch((err) => console.error("Gagal memuat modul:", err));
  }, []);

  const poin = user?.poin ?? 0;
  const lulus = progres.filter((p) => p.bestPercentage >= 60).length;
  const misi =
    moduls.find((m) => !progres.some((p) => p.modulSlug === m.slug)) ?? null;
  const modulDimuat = moduls.length > 0;

  const lencana = [
    {
      nama: "Mubtadi",
      desc: "Selesaikan 1 kuis",
      ikon: BookOpen,
      unlocked: progres.length >= 1,
    },
    {
      nama: "Mutawassith",
      desc: "Kumpulkan 1000 poin",
      ikon: ShieldCheck,
      unlocked: poin >= 1000,
    },
    {
      nama: "Mujtahid",
      desc: "Lulus 6 modul (≥60%)",
      ikon: Trophy,
      unlocked: lulus >= 6,
    },
    {
      nama: "Mahir",
      desc: "Lulus 12 modul",
      ikon: Award,
      unlocked: lulus >= 12,
    },
  ];

  const inisial = (user?.name ?? "")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (memuat) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="bg-gray-200 rounded-2xl p-6 h-48"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-28"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Profil & Poin */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
        {user ? (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-3 border-4 border-white shadow-lg">
              <span className="text-2xl font-bold text-emerald-700">
                {inisial || "U"}
              </span>
            </div>
            <h2 className="font-bold text-xl text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{user.email}</p>

            <div className="bg-emerald-50 rounded-xl p-4 inline-block min-w-[200px] border border-emerald-100">
              <p className="text-xs text-emerald-900 font-semibold mb-1">
                Poin Berkah Anda
              </p>
              <div className="flex justify-center items-center gap-2">
                <Award size={24} className="text-amber-500" />
                <span className="text-3xl font-bold text-emerald-700">
                  {poin.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              {progres.length} modul dicoba • {lulus} modul lulus (≥60%)
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3 border-4 border-white shadow-lg">
              <Trophy size={36} className="text-gray-400" />
            </div>
            <h2 className="font-bold text-xl text-gray-800">
              Masuk untuk Mulai
            </h2>
            <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto">
              Poin berkah dan progres kuis hanya tersimpan setelah kamu login
              atau daftar.
            </p>
            <button
              onClick={() => openAuth("register")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 transition"
            >
              <LogIn size={16} /> Daftar / Masuk
            </button>
          </>
        )}
      </div>

      {/* Lencana */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Lencana Prestasi</h3>
        <div className="grid grid-cols-2 gap-3">
          {lencana.map((l) => {
            const Ikon = l.ikon;
            return (
              <div
                key={l.nama}
                className={`p-4 rounded-xl border text-center transition ${
                  l.unlocked
                    ? "bg-gradient-to-b from-white to-amber-50 border-amber-200 shadow-sm"
                    : "bg-gray-50 border-gray-200 opacity-70"
                }`}
              >
                <Ikon
                  size={32}
                  className={`mx-auto mb-2 ${l.unlocked ? "text-amber-500" : "text-gray-400"}`}
                />
                <h4
                  className={`font-bold text-sm ${l.unlocked ? "text-gray-800" : "text-gray-600"}`}
                >
                  {l.nama}
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  {l.unlocked ? l.desc : `Terkunci — ${l.desc}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Papan Peringkat */}
      {user && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Medal size={18} className="text-amber-500" /> Papan Peringkat
          </h3>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-1.5">
            {!papan && !papanPesan ? (
              <p className="text-sm text-gray-600 animate-pulse">
                Memuat papan peringkat…
              </p>
            ) : papanPesan ? (
              <p className="text-sm text-rose-600">{papanPesan}</p>
            ) : (
              papan && (
                <>
                  {papan.top.map((t) => {
                    const aku = t.name === user.name;
                    return (
                      <div
                        key={t.rank}
                        className={`flex items-center gap-3 px-2.5 py-2 rounded-lg ${
                          aku
                            ? "bg-emerald-50 border border-emerald-200"
                            : ""
                        }`}
                      >
                        <span
                          className={`w-9 text-center text-sm font-bold shrink-0 ${
                            t.rank <= 3 ? "text-base" : "text-gray-500"
                          }`}
                        >
                          {medali(t.rank)}
                        </span>
                        <span
                          className={`flex-1 text-sm truncate ${
                            aku
                              ? "font-bold text-emerald-800"
                              : "font-semibold text-gray-800"
                          }`}
                        >
                          {t.name}
                          {aku && " (Kamu)"}
                        </span>
                        <span className="text-sm font-bold text-emerald-700 shrink-0">
                          {t.poin.toLocaleString("id-ID")}
                        </span>
                      </div>
                    );
                  })}
                  {papan.saya.rank > papan.top.length && (
                    <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="w-9 text-center text-sm font-bold text-gray-500 shrink-0">
                        #{papan.saya.rank}
                      </span>
                      <span className="flex-1 text-sm font-bold text-emerald-800 truncate">
                        {papan.saya.name} (Kamu)
                      </span>
                      <span className="text-sm font-bold text-emerald-700 shrink-0">
                        {papan.saya.poin.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 text-center pt-2 border-t border-gray-100">
                    Posisi kamu: <b>#{papan.saya.rank}</b> dari {" "}
                    {papan.saya.total} pengguna • perbarui dengan skor terbaik
                    baru
                  </p>
                </>
              )
            )}
          </div>
        </div>
      )}

      {/* Progres per modul */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Progres Edukasi</h3>
        {progres.length === 0 ? (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-600">
            Belum ada kuis yang dicoba. Buka tab <b>Edukasi</b> dan mulai dari
            modul pertama!
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
            {progres.map((p) => (
              <div key={p.modulSlug}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-800 truncate">
                    {judulSlug(p.modulSlug, moduls)}
                  </span>
                  <span className="text-gray-600 shrink-0 ml-2">
                    Terbaik {p.bestPercentage}% • {p.attempts}x
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      p.bestPercentage >= 60 ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                    style={{ width: `${p.bestPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Misi */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Misi Berikutnya</h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          {!modulDimuat ? (
            <p className="text-sm text-gray-600 animate-pulse">Memuat misi…</p>
          ) : misi ? (
            <div className="flex justify-between items-center gap-3">
              <div>
                <p className="font-semibold text-gray-800">
                  Kuis: {judulSlug(misi.slug, moduls)}
                </p>
                <p className="text-xs text-amber-700 font-medium">
                  +50 Poin Berkah untuk skor pertama
                </p>
              </div>
              <button
                onClick={() => setActiveTab("edukasi")}
                className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-200 transition shrink-0"
              >
                Mulai
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-3">
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Rocket size={16} className="text-emerald-600" /> Semua modul
                  sudah dicoba!
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Pertahankan skor terbaikmu di tab Edukasi.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("edukasi")}
                className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-200 transition shrink-0"
              >
                Buka
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
