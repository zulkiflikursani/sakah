"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Loader2,
  LogIn,
  PlayCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthContext";

const progresMapDari = (progres: Array<{ modulSlug: string; bestPercentage: number }>) =>
  new Map(progres.map((p) => [p.modulSlug, p.bestPercentage]));

type Gambar = { url: string; width: number; height: number };

type Modul = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  images: Gambar[];
  jumlahSoal: number;
};

type Pilihan = { id: number; text: string };

type Soal = {
  id: string;
  question: string;
  options: Pilihan[];
};

type DetailJawaban = {
  soalId: string;
  question: string;
  userAnswer: Pilihan | null;
  correctAnswer: Pilihan;
  isCorrect: boolean;
  explanation: string;
};

type HasilKuis = {
  score: number;
  total: number;
  percentage: number;
  poin: number | null;
  poinTotal: number | null;
  progres: {
    attempts: number;
    bestPercentage: number;
    lastPercentage: number;
  } | null;
  details: DetailJawaban[];
};

type Tampilan = "daftar" | "materi" | "kuis" | "hasil";

const warnaModul = [
  "bg-emerald-100 text-emerald-600",
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
  "bg-teal-100 text-teal-600",
];

export function Edukasi() {
  const { user, progres, openAuth, refresh } = useAuth();
  const [tampilan, setTampilan] = useState<Tampilan>("daftar");
  const [moduls, setModuls] = useState<Modul[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modulAktif, setModulAktif] = useState<Modul | null>(null);
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [indeksSoal, setIndeksSoal] = useState(0);
  const [jawaban, setJawaban] = useState<Record<string, number>>({});
  const [menilai, setMenilai] = useState(false);
  const [hasil, setHasil] = useState<HasilKuis | null>(null);

  const muatModul = useCallback(async () => {
    try {
      setMemuat(true);
      setError(null);
      const res = await fetch("/api/quiz");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal memuat modul");
      setModuls(json.data.modul);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat modul edukasi");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatModul();
  }, [muatModul]);

  const bukaMateri = (modul: Modul) => {
    setModulAktif(modul);
    setTampilan("materi");
  };

  const mulaiKuis = useCallback(async (modul: Modul) => {
    if (!user) {
      // Poin & progres hanya tersimpan untuk user login
      openAuth("login");
      return;
    }
    try {
      setMemuat(true);
      setError(null);
      const res = await fetch(`/api/quiz?modul=${encodeURIComponent(modul.slug)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal memuat soal");
      setModulAktif(json.data.modul);
      setSoalList(json.data.soal);
      setJawaban({});
      setIndeksSoal(0);
      setHasil(null);
      setTampilan("kuis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat soal kuis");
    } finally {
      setMemuat(false);
    }
  }, [user, openAuth]);

  const kirimJawaban = useCallback(async () => {
    if (!modulAktif || soalList.length === 0) return;
    try {
      setMenilai(true);
      setError(null);
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modul: modulAktif.slug,
          soalIds: soalList.map((s) => s.id),
          answers: jawaban,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal menilai kuis");
      setHasil(json.data);
      setTampilan("hasil");
      // Sinkronkan poin & progres global (header/Gamifikasi)
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim jawaban");
    } finally {
      setMenilai(false);
    }
  }, [modulAktif, soalList, jawaban, refresh]);

  const kembaliKeDaftar = () => {
    setTampilan("daftar");
    setModulAktif(null);
    setSoalList([]);
    setHasil(null);
    setError(null);
  };

  return (
    <div className="space-y-6 select-none">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={() => {
              setError(null);
              if (tampilan === "daftar") muatModul();
            }}
            className="bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {memuat && (tampilan === "daftar" || moduls.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
          <Loader2 size={36} className="animate-spin" />
          <p className="text-sm">Memuat materi edukasi…</p>
        </div>
      )}

      {!memuat && tampilan === "daftar" && (
        <>
          {/* Hero */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <BookMarked size={80} className="absolute -right-4 -top-4 opacity-20" />
            <h2 className="text-lg font-bold mb-1 relative z-10">
              Pusat Ilmu Syariah
            </h2>
            <p className="text-sm text-emerald-50 mb-4 relative z-10">
              Tingkatkan berkah dengan pemahaman akad.
            </p>
            <button
              onClick={() => moduls[0] && bukaMateri(moduls[0])}
              className="bg-white text-emerald-700 px-4 py-2 rounded-full text-xs font-bold shadow hover:bg-gray-50 transition"
            >
              Mulai Belajar
            </button>
          </div>

          {/* Ajakan login (hanya untuk tamu) */}
          {!user && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-emerald-900">
                Masuk untuk menyimpan poin & progres kuis kamu.
              </p>
              <button
                onClick={() => openAuth("login")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
              >
                <LogIn size={14} /> Masuk
              </button>
            </div>
          )}

          {/* Daftar modul */}
          <div>
            <div className="flex justify-between items-center mb-4 select-none">
              <h3 className="font-bold text-gray-800">12 Modul Akad</h3>
              <span className="text-xs text-gray-500">Komik + Kuis</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {moduls.map((modul, idx) => {
                const terbaik = progresMapDari(progres).get(modul.slug);
                return (
                <button
                  key={modul.slug}
                  onClick={() => bukaMateri(modul)}
                  className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 items-center cursor-pointer hover:shadow-md transition text-left w-full"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    {modul.images[0] ? (
                      <Image
                        src={modul.images[0].url}
                        alt={modul.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center font-bold text-xs ${
                          warnaModul[idx % warnaModul.length]
                        }`}
                      >
                        Akad
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm truncate">
                      {modul.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                      {modul.description}
                    </p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-gray-500 mt-1 items-center">
                      <span>{modul.images.length} gambar</span>
                      <span aria-hidden="true">•</span>
                      <span>{modul.jumlahSoal} soal</span>
                      {terbaik !== undefined && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded ${
                              terbaik >= 60
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            Terbaik {terbaik}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Tampilan materi: galeri komik */}
      {!memuat && tampilan === "materi" && modulAktif && (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={kembaliKeDaftar}
              className="bg-white border border-gray-200 p-2 rounded-full hover:bg-gray-50 transition"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 leading-tight truncate">
                {modulAktif.title}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {modulAktif.description}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {modulAktif.images.map((gambar) => (
              <div
                key={gambar.url}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <Image
                  src={gambar.url}
                  alt={`Materi ${modulAktif.title}`}
                  width={gambar.width}
                  height={gambar.height}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="w-full h-auto"
                  priority
                />
              </div>
            ))}
            {modulAktif.images.length === 0 && (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
                Materi gambar belum tersedia untuk modul ini.
              </div>
            )}
          </div>

          <div className="sticky bottom-24 md:bottom-4 flex justify-center">
            <button
              onClick={() => mulaiKuis(modulAktif)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 transition"
            >
              <PlayCircle size={18} />
              Mulai Kuis ({modulAktif.jumlahSoal} soal)
            </button>
          </div>
        </>
      )}

      {/* Tampilan kuis */}
      {!memuat && tampilan === "kuis" && modulAktif && soalList.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={kembaliKeDaftar}
              className="bg-white border border-gray-200 p-2 rounded-full hover:bg-gray-50 transition"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 truncate">
                Kuis {modulAktif.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  Soal {indeksSoal + 1} / {soalList.length}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${((indeksSoal + 1) / soalList.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {soalList.map((soal, idx) =>
            idx === indeksSoal ? (
              <div key={soal.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                <p className="font-bold text-gray-800">{soal.question}</p>
                <div className="space-y-2">
                  {soal.options.map((opt, optIdx) =>
                    opt.id === jawaban[soal.id] ? (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setJawaban((prev) => ({ ...prev, [soal.id]: opt.id }))
                        }
                        className="w-full text-left bg-emerald-50 border-2 border-emerald-500 text-emerald-900 rounded-xl px-4 py-3 text-sm flex gap-3 items-start transition"
                      >
                        <span className="font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    ) : (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setJawaban((prev) => ({ ...prev, [soal.id]: opt.id }))
                        }
                        className="w-full text-left bg-white border-2 border-gray-200 hover:border-emerald-300 text-gray-700 rounded-xl px-4 py-3 text-sm flex gap-3 items-start transition"
                      >
                        <span className="font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            ) : null,
          )}

          <div className="flex justify-between gap-3">
            <button
              onClick={() => setIndeksSoal((i) => Math.max(0, i - 1))}
              disabled={indeksSoal === 0}
              className="bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-full text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Sebelumnya
            </button>
            {indeksSoal < soalList.length - 1 ? (
              <button
                onClick={() => setIndeksSoal((i) => i + 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition"
              >
                Selanjutnya <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={kirimJawaban}
                disabled={menilai || Object.keys(jawaban).length < soalList.length}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 disabled:opacity-40 transition"
              >
                {menilai ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trophy size={16} />
                )}
                Kirim Jawaban
              </button>
            )}
          </div>
          {indeksSoal === soalList.length - 1 &&
            Object.keys(jawaban).length < soalList.length && (
              <p className="text-center text-xs text-amber-600">
                Jawab semua soal sebelum mengirim.
              </p>
            )}
        </div>
      )}

      {/* Tampilan hasil */}
      {!memuat && tampilan === "hasil" && hasil && modulAktif && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3 border-4 border-white shadow-lg ${
                hasil.percentage >= 60 ? "bg-emerald-100" : "bg-amber-100"
              }`}
            >
              {hasil.percentage >= 60 ? (
                <CheckCircle2 size={40} className="text-emerald-500" />
              ) : (
                <CircleX size={40} className="text-amber-500" />
              )}
            </div>
            <h3 className="font-bold text-xl text-gray-800">
              {hasil.percentage >= 60 ? "MasyaAllah, terus belajar!" : "Terus berlatih!"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Skor kamu {hasil.percentage}% ({hasil.score}/{hasil.total} benar)
            </p>
            <div className="bg-emerald-50 rounded-xl p-3 inline-block mt-4 border border-emerald-100">
              {hasil.poin !== null && hasil.poin > 0 ? (
                <p className="text-xs text-emerald-900 font-semibold">
                  +{hasil.poin} Poin Berkah
                  {hasil.poinTotal !== null &&
                    ` — Total ${hasil.poinTotal.toLocaleString("id-ID")}`}
                </p>
              ) : (
                <p className="text-xs text-amber-700 font-semibold">
                  +0 poin — kalahkan skor terbaikmu untuk mendapat poin!
                </p>
              )}
            </div>
          </div>

          {/* Pembahasan */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-800">Pembahasan</h4>
            {hasil.details.map((d, idx) => (
              <div
                key={d.soalId}
                className={`bg-white rounded-xl p-4 shadow-sm border ${
                  d.isCorrect ? "border-emerald-100" : "border-rose-100"
                }`}
              >
                <div className="flex gap-2 items-start">
                  {d.isCorrect ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <CircleX size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {idx + 1}. {d.question}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        d.isCorrect ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      Jawaban kamu: {d.userAnswer ? d.userAnswer.text : "Tidak dijawab"}
                    </p>
                    {!d.isCorrect && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Kunci: {d.correctAnswer.text}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {d.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => mulaiKuis(modulAktif)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition"
            >
              <RefreshCw size={16} /> Ulangi Kuis
            </button>
            <button
              onClick={kembaliKeDaftar}
              className="flex-1 bg-white border border-gray-200 text-gray-600 px-5 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              <ArrowLeft size={16} /> Kembali ke Daftar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
