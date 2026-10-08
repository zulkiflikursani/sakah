import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getAdminUser } from "../../auth/session";

export const dynamic = "force-dynamic";

function tolak() {
  return NextResponse.json(
    { success: false, error: "Akses admin diperlukan" },
    { status: 403 },
  );
}

type SoalInput = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

function bacaInput(body: unknown): SoalInput | { error: string } {
  const b = body as Record<string, unknown> | null;
  const question = typeof b?.question === "string" ? b.question.trim() : "";
  const rawOptions = Array.isArray(b?.options) ? b.options : [];
  const options = rawOptions.map((o) => (typeof o === "string" ? o.trim() : ""));
  const answerIndex =
    typeof b?.answerIndex === "number" ? Math.round(b.answerIndex) : NaN;
  const explanation =
    typeof b?.explanation === "string" ? b.explanation.trim() : "";

  if (question.length < 5) return { error: "Pertanyaan terlalu pendek" };
  if (options.length !== 4 || options.some((o) => o.length === 0)) {
    return { error: "Semua4 opsi wajib diisi" };
  }
  if (!(answerIndex >= 1 && answerIndex <= 4)) {
    return { error: "Kunci jawaban harus1-4" };
  }
  if (!explanation) return { error: "Penjelasan wajib diisi" };
  return { question, options, answerIndex, explanation };
}

/** Sinkronkan tabel pilihan & kunci dengan isi quiz_soal. */
async function sinkronPilihan(
  soalId: string,
  options: string[],
  answerIndex: number,
) {
  await sql`DELETE FROM quiz_pilihan WHERE soal_id = ${soalId}`;
  await sql`DELETE FROM quiz_jawaban_benar WHERE soal_id = ${soalId}`;
  for (let i = 0; i < 4; i++) {
    await sql`
      INSERT INTO quiz_pilihan (soal_id, option_number, option_text, is_correct)
      VALUES (${soalId}, ${i + 1}, ${options[i]}, ${i + 1 === answerIndex})
    `;
  }
  await sql`
    INSERT INTO quiz_jawaban_benar (soal_id, answer_index)
    VALUES (${soalId}, ${answerIndex})
  `;
}

// GET /api/admin/soal?modul=slug -> semua soal modul (termasuk kunci)
export async function GET(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const slug = new URL(request.url).searchParams.get("modul");
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Modul wajib diisi" },
        { status: 400 },
      );
    }
    const { rows } = await sql`
      SELECT qs.id, qs.question, qs.option_a, qs.option_b, qs.option_c,
             qs.option_d, qs.answer_index, qs.explanation
      FROM quiz_soal qs
      JOIN quiz_modul qm ON qm.id = qs.modul_id
      WHERE qm.slug = ${slug}
      ORDER BY qs.id
    `;
    return NextResponse.json({
      success: true,
      data: {
        soal: (rows as Array<{
          id: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          answer_index: number;
          explanation: string;
        }>).map((r) => ({
            id: String(r.id),
            question: r.question,
            options: [r.option_a, r.option_b, r.option_c, r.option_d],
            answerIndex: Number(r.answer_index),
            explanation: r.explanation,
          })),
      },
    });
  } catch (error) {
    console.error("Admin soal GET error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat soal" },
      { status: 500 },
    );
  }
}

// POST /api/admin/soal -> tambah soal { modul: slug, question, options[4], answerIndex, explanation }
export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const body = await request.json().catch(() => null);
    const input = bacaInput(body);
    if ("error" in input) {
      return NextResponse.json({ success: false, error: input.error }, { status: 400 });
    }
    const modulSlug = typeof body?.modul === "string" ? body.modul : "";
    if (!modulSlug) {
      return NextResponse.json(
        { success: false, error: "Modul wajib diisi" },
        { status: 400 },
      );
    }

    const { rows: modulRows } = await sql`
      SELECT id FROM quiz_modul WHERE slug = ${modulSlug}
    `;
    if (modulRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Modul tidak ditemukan" },
        { status: 404 },
      );
    }

    const [a, b, c, d] = input.options;
    const { rows } = await sql`
      INSERT INTO quiz_soal
        (modul_id, question, option_a, option_b, option_c, option_d, answer_index, explanation)
      VALUES (${modulRows[0].id}, ${input.question}, ${a}, ${b}, ${c}, ${d},
              ${input.answerIndex}, ${input.explanation})
      RETURNING id
    `;
    const soalId = String(rows[0].id);
    await sinkronPilihan(soalId, input.options, input.answerIndex);

    return NextResponse.json({
      success: true,
      message: "Soal ditambahkan",
      data: { id: soalId },
    });
  } catch (error) {
    console.error("Admin soal POST error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah soal" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/soal -> ubah soal { id, question, options[4], answerIndex, explanation }
export async function PATCH(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const body = await request.json().catch(() => null);
    const input = bacaInput(body);
    if ("error" in input) {
      return NextResponse.json({ success: false, error: input.error }, { status: 400 });
    }
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID soal wajib diisi" },
        { status: 400 },
      );
    }

    const [a, b, c, d] = input.options;
    const { rows } = await sql`
      UPDATE quiz_soal
      SET question = ${input.question}, option_a = ${a}, option_b = ${b},
          option_c = ${c}, option_d = ${d}, answer_index = ${input.answerIndex},
          explanation = ${input.explanation}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Soal tidak ditemukan" },
        { status: 404 },
      );
    }
    await sinkronPilihan(id, input.options, input.answerIndex);

    return NextResponse.json({ success: true, message: "Soal diperbarui" });
  } catch (error) {
    console.error("Admin soal PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui soal" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/soal?id= -> hapus soal
export async function DELETE(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID soal wajib diisi" },
        { status: 400 },
      );
    }
    const { rows } = await sql`
      DELETE FROM quiz_soal WHERE id = ${id} RETURNING id
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Soal tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, message: "Soal dihapus" });
  } catch (error) {
    console.error("Admin soal DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus soal" },
      { status: 500 },
    );
  }
}
