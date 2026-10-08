import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import {
  createSession,
  setSessionCookie,
  verifyPassword,
} from "../session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi" },
        { status: 400 },
      );
    }

    const { rows } = await sql`
      SELECT id, name, email, password_hash, poin
      FROM users
      WHERE email = ${email}
    `;
    const user = rows[0] as
      | { id: string; name: string; email: string; password_hash: string; poin: number }
      | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah" },
        { status: 401 },
      );
    }

    const token = await createSession(String(user.id));
    const secure = request.nextUrl.protocol === "https:";
    await setSessionCookie(token, secure);

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          poin: Number(user.poin),
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal masuk, coba lagi" },
      { status: 500 },
    );
  }
}
