import { NextResponse } from "next/server";
import { clearSessionCookie, destroySession } from "../session";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await destroySession();
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: "Berhasil keluar" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal keluar" },
      { status: 500 },
    );
  }
}
