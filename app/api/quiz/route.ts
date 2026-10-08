import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import path from "path";
import { getSessionUser } from "../auth/session";

export const dynamic = "force-dynamic";

const KUIS_JUMLAH = 5;
const POIN_PER_BENAR = 10;

// Fallback bila public/ tidak bisa dibaca saat runtime (mis. serverless).
const IMAGE_FALLBACK: Record<string, string[]> = {
  murabahah: ["1.jpg"],
  salam: ["1.jpg"],
  istishna: ["1.jpg"],
  mudharabah: ["1.jpg"],
  musyarakah: ["1.jpg"],
  ijarah: ["1.jpg"],
  "ijarah-muntahiya-bi-al-tamlik": ["1.jpg"],
  wakalah: ["1.jpg", "2.jpg"],
  "qardh-al-hasan": ["1.jpg"],
  wadiah: ["1.jpg"],
  kafalah: ["1.jpg", "2.jpg"],
  rahn: ["1.jpg", "2.jpg"],
};

type GambarMateri = {
  url: string;
  width: number;
  height: number;
};

type ModulRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_folder: string | null;
  sort_order: number;
};

type SoalRow = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer_index: number;
  explanation: string;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Baca dimensi JPEG dari header SOF-nya (tanpa dependensi eksternal). */
function readJpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker >= 0xd0 && marker <= 0xd9) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

async function listImages(folder: string): Promise<GambarMateri[]> {
  const dir = path.join(process.cwd(), "public", "edukasi", "materi", folder);
  try {
    const files = (await readdir(dir))
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .sort();
    if (files.length > 0) {
      return await Promise.all(
        files.map(async (f) => {
          const url = `/edukasi/materi/${folder}/${f}`;
          try {
            const buf = await readFile(path.join(dir, f));
            const size = readJpegSize(buf);
            return { url, width: size?.width ?? 1408, height: size?.height ?? 768 };
          } catch {
            return { url, width: 1408, height: 768 };
          }
        }),
      );
    }
  } catch {
    // jatuh ke fallback di bawah
  }
  return (IMAGE_FALLBACK[folder] ?? []).map((f) => ({
    url: `/edukasi/materi/${folder}/${f}`,
    width: 1408,
    height: 768,
  }));
}

function soalOptions(soal: SoalRow): Array<{ id: number; text: string }> {
  return shuffle([
    { id: 1, text: soal.option_a },
    { id: 2, text: soal.option_b },
    { id: 3, text: soal.option_c },
    { id: 4, text: soal.option_d },
  ]);
}

function errorResponse(error: unknown, message: string, status = 500) {
  console.error(message, error);
  return NextResponse.json({ success: false, error: message }, { status });
}

// GET /api/quiz               -> daftar 12 modul + gambar komik
// GET /api/quiz?modul=slug    -> 5 soal acak (kunci jawaban tidak dikirim)
export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("modul");

  try {
    if (!slug) {
      const { rows } = await sql`
        SELECT id, slug, title, description, image_folder, sort_order
        FROM quiz_modul
        WHERE is_active = TRUE
        ORDER BY sort_order
      `;
      const modul = await Promise.all(
        rows.map(async (row) => {
          const r = row as ModulRow;
          const folder = r.image_folder ?? r.slug;
          const { rows: countRows } = await sql`
            SELECT count(*)::int AS jumlah FROM quiz_soal WHERE modul_id = ${r.id}
          `;
          return {
            id: r.id,
            slug: r.slug,
            title: r.title,
            description: r.description,
            sortOrder: r.sort_order,
            images: await listImages(folder),
            jumlahSoal: countRows[0]?.jumlah ?? 0,
          };
        }),
      );
      return NextResponse.json({
        success: true,
        message: "Berhasil mendapatkan daftar modul",
        data: { modul },
      });
    }

    const { rows: modulRows } = await sql`
      SELECT id, slug, title, description, image_folder, sort_order
      FROM quiz_modul
      WHERE slug = ${slug} AND is_active = TRUE
    `;
    if (modulRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Modul tidak ditemukan" },
        { status: 404 },
      );
    }
    const modul = modulRows[0] as ModulRow;
    const folder = modul.image_folder ?? modul.slug;

    const { rows } = await sql`
      SELECT id, question, option_a, option_b, option_c, option_d, answer_index, explanation
      FROM quiz_soal
      WHERE modul_id = ${modul.id}
      ORDER BY random()
      LIMIT ${KUIS_JUMLAH}
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Belum ada soal untuk modul ini" },
        { status: 404 },
      );
    }

    // Kunci jawaban & penjelasan sengaja tidak dikirim — dinilai via POST.
    const soal = (rows as SoalRow[]).map((s) => ({
      id: s.id,
      question: s.question,
      options: soalOptions(s),
    }));

    return NextResponse.json({
      success: true,
      message: "Berhasil mendapatkan soal",
      data: {
        modul: {
          id: modul.id,
          slug: modul.slug,
          title: modul.title,
          description: modul.description,
          images: await listImages(folder),
        },
        soal,
      },
    });
  } catch (error) {
    return errorResponse(error, "Gagal mengambil data kuis");
  }
}

// POST /api/quiz
// body: { modul: slug, soalIds: string[], answers: { [soalId]: 1..4 } }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const modulSlug = typeof body?.modul === "string" ? body.modul : "";
    const soalIds: string[] = Array.isArray(body?.soalIds)
      ? body.soalIds.map((id: unknown) => String(id))
      : [];
    const answers: Record<string, number> =
      body?.answers && typeof body.answers === "object" ? body.answers : {};

    if (!modulSlug) {
      return NextResponse.json(
        { success: false, error: "Modul wajib diisi" },
        { status: 400 },
      );
    }
    if (soalIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Soal wajib diisi" },
        { status: 400 },
      );
    }

    const { rows: modulRows } = await sql`
      SELECT id, slug, title FROM quiz_modul
      WHERE slug = ${modulSlug} AND is_active = TRUE
    `;
    if (modulRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Modul tidak ditemukan" },
        { status: 404 },
      );
    }
    const modul = modulRows[0] as { id: string; slug: string; title: string };

    const { rows } = await sql`
      SELECT id, question, option_a, option_b, option_c, option_d, answer_index, explanation
      FROM quiz_soal
      WHERE modul_id = ${modul.id}
    `;
    const soalById = new Map((rows as SoalRow[]).map((s) => [String(s.id), s]));

    const details: Array<{
      soalId: string;
      question: string;
      userAnswer: { id: number; text: string } | null;
      correctAnswer: { id: number; text: string };
      isCorrect: boolean;
      explanation: string;
    }> = [];

    let correct = 0;
    for (const soalId of soalIds) {
      const s = soalById.get(soalId);
      if (!s) continue;
      const options = [
        { id: 1, text: s.option_a },
        { id: 2, text: s.option_b },
        { id: 3, text: s.option_c },
        { id: 4, text: s.option_d },
      ];
      const chosen = Number(answers[soalId]);
      const userAnswer = options.find((o) => o.id === chosen) ?? null;
      const correctAnswer = options[s.answer_index - 1];
      const isCorrect = userAnswer !== null && chosen === s.answer_index;
      if (isCorrect) correct += 1;
      details.push({
        soalId: s.id,
        question: s.question,
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: s.explanation,
      });
    }

    const total = details.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Catat poin & progres per modul bila user sedang login.
    // Poin hanya diberikan untuk peningkatan skor terbaik (anti-farm).
    const user = await getSessionUser();
    let poin: number | null = null;
    let poinTotal: number | null = null;
    let progres: {
      attempts: number;
      bestPercentage: number;
      lastPercentage: number;
    } | null = null;

    if (user) {
      const { rows: progresRows } = await sql`
        SELECT attempts, best_percentage
        FROM user_progres
        WHERE user_id = ${user.id} AND modul_slug = ${modul.slug}
      `;
      const lama = progresRows[0] as
        | { attempts: number; best_percentage: number }
        | undefined;
      const bestLama = Number(lama?.best_percentage ?? 0);
      const skorLama = Math.round((bestLama * total) / 100);
      const skorBaru = Math.max(skorLama, correct);
      poin = (skorBaru - skorLama) * POIN_PER_BENAR;

      const { rows: upsertRows } = await sql`
        INSERT INTO user_progres (user_id, modul_slug, attempts, best_percentage, last_percentage, updated_at)
        VALUES (${user.id}, ${modul.slug}, 1, ${percentage}, ${percentage}, NOW())
        ON CONFLICT (user_id, modul_slug) DO UPDATE SET
          attempts = user_progres.attempts + 1,
          best_percentage = GREATEST(user_progres.best_percentage, EXCLUDED.best_percentage),
          last_percentage = EXCLUDED.last_percentage,
          updated_at = NOW()
        RETURNING attempts, best_percentage, last_percentage
      `;
      const p = upsertRows[0] as {
        attempts: number;
        best_percentage: number;
        last_percentage: number;
      };
      progres = {
        attempts: Number(p.attempts),
        bestPercentage: Number(p.best_percentage),
        lastPercentage: Number(p.last_percentage),
      };

      if (poin > 0) {
        const { rows: userRows } = await sql`
          UPDATE users SET poin = poin + ${poin}
          WHERE id = ${user.id}
          RETURNING poin
        `;
        poinTotal = Number(userRows[0].poin);
      } else {
        poin = 0;
        poinTotal = user.poin;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil menilai kuis",
      data: {
        modul,
        score: correct,
        correct,
        total,
        percentage,
        poin,
        poinTotal,
        progres,
        details,
      },
    });
  } catch (error) {
    return errorResponse(error, "Gagal menilai kuis");
  }
}
