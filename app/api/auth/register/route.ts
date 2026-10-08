import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import {
  createSession,
  hashPassword,
  setSessionCookie,
} from "../session";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Nama minimal 2 karakter" },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: "Format email tidak valid" },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    let rows: Array<{ id: string }>;
    try {
      const result = await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES (${name}, ${email}, ${hashPassword(password)})
        RETURNING id
      `;
      rows = result.rows as Array<{ id: string }>;
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "23505") {
        return NextResponse.json(
          { success: false, error: "Email sudah terdaftar" },
          { status: 409 },
        );
      }
      throw err;
    }

    const userId = String(rows[0].id);
    const token = await createSession(userId);
    const secure = request.nextUrl.protocol === "https:";
    await setSessionCookie(token, secure);

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      data: { user: { id: userId, name, email, poin: 0 } },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mendaftar, coba lagi" },
      { status: 500 },
    );
  }
}
