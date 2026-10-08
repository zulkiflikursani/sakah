import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { sql } from "@vercel/postgres";

export const SESSION_COOKIE = "sakah_session";
const SESSION_HARI = 30;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  poin: number;
  role: string;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || hash.length === 0) return false;
  const computed = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_HARI * 24 * 3600 * 1000);
  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expires.toISOString()})
  `;
  // Buang sesi kadaluarsa sekalian
  await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
  return token;
}

export async function setSessionCookie(token: string, secure: boolean) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HARI * 24 * 3600,
    secure,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  }
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Ambil user dari cookie sesi aktif; null bila belum login / sesi kedaluwarsa. */
export async function getSessionUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { rows } = await sql`
    SELECT u.id, u.name, u.email, u.poin, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  if (rows.length === 0) return null;
  const row = rows[0] as {
    id: string;
    name: string;
    email: string;
    poin: number;
    role: string;
  };
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    poin: Number(row.poin),
    role: row.role ?? "user",
  };
}

/** Kembalikan user hanya bila sesi aktif dan rolenya admin. */
export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  return user && user.role === "admin" ? user : null;
}
