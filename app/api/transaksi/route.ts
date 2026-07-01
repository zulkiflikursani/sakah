import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// 1. [GET] Endpoint untuk mengambil semua transaksi syariah
export async function GET() {
  try {
    // Mengambil data urut dari yang paling baru
    const { rows } = await sql`
      SELECT * FROM transaksi_syariah ORDER BY date DESC
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

// 2. [POST] Endpoint untuk menyimpan transaksi syariah baru
export async function POST(request: Request) {
  try {
    // Membaca data JSON yang dikirim oleh frontend
    const body = await request.json();
    const { type, amount, category, is_halal } = body;

    // Validasi input finansial dasar
    if (!type || !amount || !category) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // Eksekusi aman terproteksi dari SQL Injection
    const result = await sql`
      INSERT INTO transaksi_syariah (type, amount, category, is_halal)
      VALUES (${type}, ${amount}, ${category}, ${is_halal ?? true})
      RETURNING *;
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
