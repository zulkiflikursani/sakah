import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getSessionUser } from "../session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({
        success: true,
        data: { user: null, progres: [] },
      });
    }

    const { rows } = await sql`
      SELECT modul_slug, attempts, best_percentage, last_percentage, updated_at
      FROM user_progres
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `;

    type ProgresRow = {
      modul_slug: string;
      attempts: number;
      best_percentage: number;
      last_percentage: number;
      updated_at: string;
    };

    return NextResponse.json({
      success: true,
      data: {
        user,
        progres: (rows as ProgresRow[]).map((r) => ({
          modulSlug: r.modul_slug,
          attempts: Number(r.attempts),
          bestPercentage: Number(r.best_percentage),
          lastPercentage: Number(r.last_percentage),
          updatedAt: r.updated_at,
        })),
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data akun" },
      { status: 500 },
    );
  }
}
