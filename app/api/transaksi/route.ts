import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/api/auth/session";

// 1. [GET] Ambil transaksi milik user yang sedang login
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Silakan login terlebih dahulu" },
      { status: 401 },
    );
  }

  try {
    // Hanya transaksi milik user ini, urut dari yang terbaru
    const { rows } = await sql`
      SELECT id, type, amount, category, date, is_halal
      FROM transaksi_syariah
      WHERE user_id = ${user.id}
      ORDER BY date DESC
    `;

    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error) {
    console.error("Database GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data transaksi" },
      { status: 500 },
    );
  }
}

// 2. [POST] Simpan transaksi baru untuk user yang sedang login
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Silakan login untuk mencatat transaksi" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { type, amount, category, is_halal } = body;

    if (!type || !amount || !category) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // user_id diambil dari sesi — bukan dari klien — agar tidak bisa mengaku pemilik lain
    const result = await sql`
      INSERT INTO transaksi_syariah (type, amount, category, is_halal, user_id)
      VALUES (${type}, ${amount}, ${category}, ${is_halal ?? true}, ${user.id})
      RETURNING id, type, amount, category, date, is_halal;
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi syariah berhasil dicatat",
        data: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Database POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan transaksi" },
      { status: 500 },
    );
  }
}
