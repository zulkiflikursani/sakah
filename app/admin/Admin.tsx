"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthContext";

type ModulAdmin = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageFolder: string;
  sortOrder: number;
  isActive: boolean;
  jumlahSoal: number;
};

type SoalAdmin = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

type Gambar = { url: string; width: number; height: number };

type Bagian = "modul" | "soal" | "materi";

const BAGIAN: Array<{ id: Bagian; label: string; ikon: typeof Settings }> = [
  { id: "modul", label: "Modul", ikon: Settings },
  { id: "soal", label: "Soal Kuis", ikon: ListChecks },
  { id: "materi", label: "Gambar Materi", ikon: ImageIcon },
];

const KOSONG_SOAL: SoalAdmin = {
  id: "",
  question: "",
  options: ["", "", "", ""],
  answerIndex: 1,
  explanation: "",
};

export function Admin() {
  const { user } = useAuth();
  const [bagian, setBagian] = useState<Bagian>("modul");
  const [moduls, setModuls] = useState<ModulAdmin[]>([]);
  const [gambarPerModul, setGambarPerModul] = useState<Record<string, Gambar[]>>({});
  const [pesan, setPesan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  // Soal
  const [modulSoal, setModulSoal] = useState("");
  const [soals, setSoals] = useState<SoalAdmin[]>([]);
  const [formSoal, setFormSoal] = useState<SoalAdmin>(KOSONG_SOAL);

  // Materi
  const [modulMateri, setModulMateri] = useState("");
  const [filePilihan, setFilePilihan] = useState<File | null>(null);

  // Modul baru
  const [modulBaru, setModulBaru] = useState({ slug: "", title: "", description: "" });
  const [tambahModul, setTambahModul] = useState(false);

  const admin = user?.role === "admin";

  const flash = (msg: string) => {
    setPesan(msg);
    setError(null);
    window.setTimeout(() => setPesan(null), 3500);
  };

  const gagal = (msg: string) => {
    setError(msg);
    setPesan(null);
  };

  const muatModul = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/modul");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setModuls(json.data.modul);
      setModulSoal((prev) => prev || json.data.modul[0]?.slug || "");
      setModulMateri((prev) => prev || json.data.modul[0]?.slug || "");
    } catch (err) {
      gagal(err instanceof Error ? err.message : "Gagal memuat modul");
    }
  }, []);

  const muatGambar = useCallback(async () => {
    try {
      const res = await fetch("/api/quiz");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const map: Record<string, Gambar[]> = {};
      for (const m of json.data.modul) map[m.slug] = m.images;
      setGambarPerModul(map);
    } catch (err) {
      gagal(err instanceof Error ? err.message : "Gagal memuat gambar");
    }
  }, []);

  const muatSoal = useCallback(async (slug: string) => {
    if (!slug) {
      setSoals([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/soal?modul=${encodeURIComponent(slug)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSoals(json.data.soal);
    } catch (err) {
      gagal(err instanceof Error ? err.message : "Gagal memuat soal");
    }
  }, []);

  useEffect(() => {
    if (admin) {
      muatModul();
      muatGambar();
    }
  }, [admin, muatModul, muatGambar]);

  useEffect(() => {
    if (admin && bagian === "soal") muatSoal(modulSoal);
  }, [admin, bagian, modulSoal, muatSoal]);

  const kirim = async (
    url: string,
    method: string,
    body?: BodyInit | null,
    okMsg?: string,
    headers?: HeadersInit,
  ) => {
    setSibuk(true);
    try {
      const res = await fetch(url, { method, body, headers });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      flash(okMsg ?? "Berhasil");
      return true;
    } catch (err) {
      gagal(err instanceof Error ? err.message : "Terjadi kesalahan");
      return false;
    } finally {
      setSibuk(false);
    }
  };

  if (!admin) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
        <Settings size={40} className="mx-auto text-gray-300 mb-3" />
        <h3 className="font-bold text-gray-800">Akses Admin Diperlukan</h3>
        <p className="text-sm text-gray-600 mt-1">
          Halaman manajemen materi & kuis hanya untuk akun admin.
        </p>
      </div>
    );
  }

  const gambarAktif = gambarPerModul[modulMateri] ?? [];

  return (
    <div className="space-y-5 select-none">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Manajemen Konten</h2>
        <p className="text-sm text-gray-600">
          Kelola modul edukasi, bank soal kuis, dan gambar komik materi.
        </p>
      </div>

      {/* Bagian */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {BAGIAN.map((b) => {
          const Ikon = b.ikon;
          return (
            <button
              key={b.id}
              onClick={() => setBagian(b.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                bagian === b.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300"
              }`}
            >
              <Ikon size={15} /> {b.label}
            </button>
          );
        })}
      </div>

      {pesan && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <CheckCircle2 size={16} /> {pesan}
        </p>
      )}
      {error && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* ========== MODUL ========== */}
      {bagian === "modul" && (
        <div className="space-y-4">
          <button
            onClick={() => setTambahModul((v) => !v)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 transition"
          >
            <Plus size={16} /> {tambahModul ? "Tutup Form" : "Tambah Modul"}
          </button>

          {tambahModul && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <input
                value={modulBaru.slug}
                onChange={(e) => setModulBaru({ ...modulBaru, slug: e.target.value })}
                placeholder="slug (huruf kecil, contoh: waqaf)"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
              />
              <input
                value={modulBaru.title}
                onChange={(e) => setModulBaru({ ...modulBaru, title: e.target.value })}
                placeholder="Judul modul"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
              />
              <textarea
                value={modulBaru.description}
                onChange={(e) =>
                  setModulBaru({ ...modulBaru, description: e.target.value })
                }
                placeholder="Deskripsi singkat"
                rows={2}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                disabled={sibuk}
                onClick={async () => {
                  const ok = await kirim(
                    "/api/admin/modul",
                    "POST",
                    JSON.stringify(modulBaru),
                    "Modul dibuat",
                    { "Content-Type": "application/json" },
                  );
                  if (ok) {
                    setModulBaru({ slug: "", title: "", description: "" });
                    setTambahModul(false);
                    muatModul();
                  }
                }}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                Simpan Modul
              </button>
            </div>
          )}

          <div className="space-y-3">
            {moduls.map((m) => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-bold text-gray-800">{m.title}</span>
                  <span className="text-xs text-gray-500">/{m.slug}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      m.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {m.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {m.jumlahSoal} soal • {gambarPerModul[m.slug]?.length ??0} gambar
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    defaultValue={m.title}
                    key={`t-${m.id}-${m.title}`}
                    onBlur={(e) => {
                      if (e.target.value !== m.title) {
                        kirim(
                          "/api/admin/modul",
                          "PATCH",
                          JSON.stringify({ id: m.id, title: e.target.value }),
                          "Judul diperbarui",
                          { "Content-Type": "application/json" },
                        ).then(muatModul);
                      }
                    }}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Judul"
                  />
                  <input
                    defaultValue={m.description ?? ""}
                    key={`d-${m.id}-${m.description ?? ""}`}
                    onBlur={(e) => {
                      if (e.target.value !== (m.description ?? "")) {
                        kirim(
                          "/api/admin/modul",
                          "PATCH",
                          JSON.stringify({ id: m.id, description: e.target.value }),
                          "Deskripsi diperbarui",
                          { "Content-Type": "application/json" },
                        ).then(muatModul);
                      }
                    }}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Deskripsi"
                  />
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={m.isActive}
                      onChange={(e) =>
                        kirim(
                          "/api/admin/modul",
                          "PATCH",
                          JSON.stringify({ id: m.id, isActive: e.target.checked }),
                          e.target.checked ? "Modul diaktifkan" : "Modul dinonaktifkan",
                          { "Content-Type": "application/json" },
                        ).then(muatModul)
                      }
                      className="w-4 h-4 accent-emerald-600"
                    />
                    Tampil di aplikasi
                  </label>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Hapus modul "${m.title}" beserta ${m.jumlahSoal} soalnya?`,
                        )
                      ) {
                        kirim(
                          `/api/admin/modul?id=${m.id}`,
                          "DELETE",
                          undefined,
                          "Modul dihapus",
                        ).then(() => {
                          muatModul();
                          muatGambar();
                        });
                      }
                    }}
                    className="ml-auto text-rose-600 hover:text-rose-700 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 size={15} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== SOAL ========== */}
      {bagian === "soal" && (
        <div className="space-y-4">
          <select
            value={modulSoal}
            onChange={(e) => setModulSoal(e.target.value)}
            className="border border-gray-200 rounded-lg p-3 text-sm bg-white focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
          >
            {moduls.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.title} ({m.jumlahSoal} soal)
              </option>
            ))}
          </select>

          {/* Form soal */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-800 text-sm">
              {formSoal.id ? "Ubah Soal" : "Tambah Soal Baru"}
            </h4>
            <textarea
              value={formSoal.question}
              onChange={(e) => setFormSoal({ ...formSoal, question: e.target.value })}
              placeholder="Pertanyaan"
              rows={2}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
            />
            <div className="space-y-2">
              {formSoal.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <label
                    className="flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title="Tandai sebagai jawaban benar"
                  >
                    <input
                      type="radio"
                      name="kunci"
                      checked={formSoal.answerIndex === i + 1}
                      onChange={() => setFormSoal({ ...formSoal, answerIndex: i + 1 })}
                      className="accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-gray-600">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </label>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...formSoal.options];
                      next[i] = e.target.value;
                      setFormSoal({ ...formSoal, options: next });
                    }}
                    placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                    className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
            <textarea
              value={formSoal.explanation}
              onChange={(e) =>
                setFormSoal({ ...formSoal, explanation: e.target.value })
              }
              placeholder="Penjelasan jawaban (pembahasan)"
              rows={2}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                disabled={sibuk}
                onClick={async () => {
                  const ok = await kirim(
                    "/api/admin/soal",
                    formSoal.id ? "PATCH" : "POST",
                    JSON.stringify({ ...formSoal, modul: modulSoal }),
                    formSoal.id ? "Soal diperbarui" : "Soal ditambahkan",
                    { "Content-Type": "application/json" },
                  );
                  if (ok) {
                    setFormSoal(KOSONG_SOAL);
                    muatSoal(modulSoal);
                    muatModul();
                  }
                }}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {formSoal.id ? "Simpan Perubahan" : "Tambah Soal"}
              </button>
              {formSoal.id && (
                <button
                  onClick={() => setFormSoal(KOSONG_SOAL)}
                  className="bg-white border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* Daftar soal */}
          <div className="space-y-2">
            {soals.length === 0 && (
              <p className="text-sm text-gray-600 bg-white border border-dashed border-gray-200 rounded-xl p-4 text-center">
                Belum ada soal untuk modul ini.
              </p>
            )}
            {soals.map((s, idx) => (
              <div
                key={s.id}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex gap-2 items-start">
                  <span className="text-xs font-bold text-gray-400 mt-0.5">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {s.question}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      Kunci: {String.fromCharCode(64 + s.answerIndex)}.{" "}
                      {s.options[s.answerIndex - 1]}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 italic">
                      {s.explanation}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setFormSoal(s);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-emerald-700 hover:text-emerald-800"
                      title="Ubah soal"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Hapus soal ini?")) {
                          kirim(
                            `/api/admin/soal?id=${s.id}`,
                            "DELETE",
                            undefined,
                            "Soal dihapus",
                          ).then(() => {
                            muatSoal(modulSoal);
                            muatModul();
                          });
                        }
                      }}
                      className="text-rose-600 hover:text-rose-700"
                      title="Hapus soal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== MATERI ========== */}
      {bagian === "materi" && (
        <div className="space-y-4">
          <select
            value={modulMateri}
            onChange={(e) => setModulMateri(e.target.value)}
            className="border border-gray-200 rounded-lg p-3 text-sm bg-white focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
          >
            {moduls.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.title}
              </option>
            ))}
          </select>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Upload size={16} className="text-emerald-600" /> Unggah Gambar Komik
            </h4>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setFilePilihan(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
            />
            <button
              disabled={sibuk || !filePilihan}
              onClick={async () => {
                if (!filePilihan) return;
                const fd = new FormData();
                fd.append("folder", modulMateri);
                fd.append("file", filePilihan);
                const ok = await kirim(
                  "/api/admin/materi",
                  "POST",
                  fd,
                  "Gambar diunggah",
                );
                if (ok) {
                  setFilePilihan(null);
                  muatGambar();
                }
              }}
              className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition inline-flex items-center gap-2"
            >
              {sibuk ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Unggah
            </button>
            <p className="text-xs text-gray-600">
              Format JPG/PNG/WEBP/GIF, maks8 MB. Gambar tersimpan di
              public/edukasi/materi/{modulMateri}/
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gambarAktif.map((g) => (
              <div
                key={g.url}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm relative group"
              >
                <div className="relative w-full h-32 bg-gray-100">
                  <Image
                    src={g.url}
                    alt={g.url}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    const nama = g.url.split("/").pop() ?? "";
                    if (window.confirm(`Hapus gambar ${nama}?`)) {
                      kirim(
                        `/api/admin/materi?folder=${encodeURIComponent(modulMateri)}&file=${encodeURIComponent(nama)}`,
                        "DELETE",
                        undefined,
                        "Gambar dihapus",
                      ).then(muatGambar);
                    }
                  }}
                  className="absolute top-2 right-2 bg-white/90 text-rose-600 p-1.5 rounded-lg shadow hover:bg-white transition"
                  title="Hapus gambar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {gambarAktif.length === 0 && (
              <p className="col-span-full text-sm text-gray-600 bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center">
                Belum ada gambar untuk modul ini.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
