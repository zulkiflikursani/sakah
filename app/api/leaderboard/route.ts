import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSessionUser } from "../auth/session";

// GET /api/leaderboard -> papan peringkat poin (khusus pengguna login)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Silakan masuk untuk melihat papan peringkat" },
        { status: 401 },
      );
    }

    // 10 besar: poin tertinggi, poin sama → yang daftar lebih dulu di atas
    const { rows } = await sql`
      SELECT name, poin,
             ROW_NUMBER() OVER (ORDER BY poin DESC, created_at ASC) AS rank
      FROM users
      ORDER BY rank
      LIMIT 10
    `;

    // Posisi pengguna saat ini + total pengguna, dengan urutan yang SAMA
    // dengan ranking di atas (poin DESC, created_at ASC) agar konsisten
    const hitung = await sql`
      WITH peringkat AS (
        SELECT id,
               ROW_NUMBER() OVER (ORDER BY poin DESC, created_at ASC) AS rank,
               COUNT(*) OVER () AS total
        FROM users
      )
      SELECT rank, total FROM peringkat WHERE id = ${user.id}
    `;
    if (hitung.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Akun tidak ditemukan" },
        { status: 404 },
      );
    }
    const s = hitung.rows[0] as { rank: number; total: number };

    return NextResponse.json({
      success: true,
      data: {
        top: rows.map((r) => ({
          rank: Number(r.rank),
          name: String(r.name),
          poin: Number(r.poin),
        })),
        saya: {
          rank: Number(s.rank),
          total: Number(s.total),
          name: user.name,
          poin: user.poin,
        },
      },
    });
  } catch (error) {
    console.error("Leaderboard GET error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat papan peringkat" },
      { status: 500 },
    );
  }
}
