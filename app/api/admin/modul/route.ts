import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getAdminUser } from "../../auth/session";

export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function tolak() {
  return NextResponse.json(
    { success: false, error: "Akses admin diperlukan" },
    { status: 403 },
  );
}

// GET /api/admin/modul -> semua modul (termasuk non-aktif) + jumlah soal
export async function GET() {
  if (!(await getAdminUser())) return tolak();
  try {
    const { rows } = await sql`
      SELECT qm.id, qm.slug, qm.title, qm.description, qm.image_folder,
             qm.sort_order, qm.is_active,
             (SELECT count(*)::int FROM quiz_soal qs WHERE qs.modul_id = qm.id) AS jumlah_soal
      FROM quiz_modul qm
      ORDER BY qm.sort_order
    `;
    return NextResponse.json({
      success: true,
      data: {
        modul: (rows as Array<{
          id: string;
          slug: string;
          title: string;
          description: string | null;
          image_folder: string | null;
          sort_order: number;
          is_active: boolean;
          jumlah_soal: number;
        }>).map((r) => ({
            id: String(r.id),
            slug: r.slug,
            title: r.title,
            description: r.description,
            imageFolder: r.image_folder ?? r.slug,
            sortOrder: Number(r.sort_order),
            isActive: Boolean(r.is_active),
            jumlahSoal: Number(r.jumlah_soal),
          }),
        ),
      },
    });
  } catch (error) {
    console.error("Admin modul GET error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat modul" },
      { status: 500 },
    );
  }
}

// POST /api/admin/modul -> buat modul baru
export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const body = await request.json().catch(() => null);
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : null;

    if (!SLUG_RE.test(slug)) {
      return NextResponse.json(
        { success: false, error: "Slug tidak valid (huruf kecil, angka, tanda -)" },
        { status: 400 },
      );
    }
    if (title.length < 2) {
      return NextResponse.json(
        { success: false, error: "Judul minimal 2 karakter" },
        { status: 400 },
      );
    }

    try {
      const { rows } = await sql`
        INSERT INTO quiz_modul (slug, title, description, image_folder, sort_order)
        VALUES (
          ${slug}, ${title}, ${description}, ${slug},
          (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM quiz_modul)
        )
        RETURNING id
      `;
      return NextResponse.json({
        success: true,
        message: "Modul dibuat",
        data: { id: String(rows[0].id) },
      });
    } catch (err) {
      if ((err as { code?: string })?.code === "23505") {
        return NextResponse.json(
          { success: false, error: "Slug sudah dipakai" },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Admin modul POST error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat modul" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/modul -> ubah modul
export async function PATCH(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const body = await request.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID modul wajib diisi" },
        { status: 400 },
      );
    }

    const { rows } = await sql`
      SELECT id, slug, title, description, sort_order, is_active
      FROM quiz_modul WHERE id = ${id}
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Modul tidak ditemukan" },
        { status: 404 },
      );
    }
    const current = rows[0] as {
      title: string;
      description: string | null;
      sort_order: number;
      is_active: boolean;
    };

    const title =
      typeof body?.title === "string" && body.title.trim().length >= 2
        ? body.title.trim()
        : current.title;
    const description =
      typeof body?.description === "string"
        ? body.description.trim() || null
        : current.description;
    const isActive =
      typeof body?.isActive === "boolean" ? body.isActive : current.is_active;
    const sortOrder =
      typeof body?.sortOrder === "number" && Number.isFinite(body.sortOrder)
        ? Math.max(1, Math.round(body.sortOrder))
        : current.sort_order;

    await sql`
      UPDATE quiz_modul
      SET title = ${title}, description = ${description},
          is_active = ${isActive}, sort_order = ${sortOrder},
          updated_at = NOW()
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true, message: "Modul diperbarui" });
  } catch (error) {
    console.error("Admin modul PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui modul" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/modul?id= -> hapus modul beserta soal (cascade)
export async function DELETE(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID modul wajib diisi" },
        { status: 400 },
      );
    }
    const { rows } = await sql`
      DELETE FROM quiz_modul WHERE id = ${id} RETURNING slug
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Modul tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      message: `Modul ${rows[0].slug} dihapus`,
    });
  } catch (error) {
    console.error("Admin modul DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus modul" },
      { status: 500 },
    );
  }
}
