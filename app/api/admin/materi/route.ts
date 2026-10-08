import { NextRequest, NextResponse } from "next/server";
import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { getAdminUser } from "../../auth/session";

export const dynamic = "force-dynamic";

const FOLDER_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EXT_OK = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);
const MAKS_BYTES = 8 * 1024 * 1024;

function tolak() {
  return NextResponse.json(
    { success: false, error: "Akses admin diperlukan" },
    { status: 403 },
  );
}

function materiDir(folder: string) {
  return path.join(process.cwd(), "public", "edukasi", "materi", folder);
}

// POST /api/admin/materi (multipart: folder, file) -> unggah gambar materi
export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const form = await request.formData().catch(() => null);
    const folder = typeof form?.get("folder") === "string" ? form.get("folder") : "";
    const file = form?.get("file");

    if (typeof folder !== "string" || !FOLDER_RE.test(folder)) {
      return NextResponse.json(
        { success: false, error: "Folder modul tidak valid" },
        { status: 400 },
      );
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "File gambar wajib diunggah" },
        { status: 400 },
      );
    }
    const ext = EXT_OK.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { success: false, error: "Format harus JPG, PNG, WEBP, atau GIF" },
        { status: 400 },
      );
    }
    if (file.size > MAKS_BYTES) {
      return NextResponse.json(
        { success: false, error: "Ukuran maksimal8 MB" },
        { status: 400 },
      );
    }

    const dir = materiDir(folder);
    await mkdir(dir, { recursive: true });

    // Penamaan berurutan:1.jpg,2.jpg,... (aman dari path traversal)
    const ada = (await readdir(dir).catch(() => [] as string[])).filter((f) =>
      f.endsWith(ext),
    );
    const nomor = ada.length + 1;
    const nama = `${nomor}${ext}`;
    await writeFile(path.join(dir, nama), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      success: true,
      message: "Gambar diunggah",
      data: { url: `/edukasi/materi/${folder}/${nama}` },
    });
  } catch (error) {
    console.error("Admin materi upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Gagal mengunggah gambar (penyimpanan mungkin baca-satu saat di deploy)",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/materi?folder=xxx&file=1.jpg -> hapus gambar materi
export async function DELETE(request: NextRequest) {
  if (!(await getAdminUser())) return tolak();
  try {
    const params = new URL(request.url).searchParams;
    const folder = params.get("folder") ?? "";
    const file = params.get("file") ?? "";

    if (!FOLDER_RE.test(folder) || !/^[\w.-]+$/.test(file)) {
      return NextResponse.json(
        { success: false, error: "Path gambar tidak valid" },
        { status: 400 },
      );
    }

    const target = path.join(materiDir(folder), file);
    // Pastikan target tetap di dalam folder materi
    if (!target.startsWith(path.join(process.cwd(), "public", "edukasi", "materi"))) {
      return NextResponse.json(
        { success: false, error: "Path gambar tidak valid" },
        { status: 400 },
      );
    }

    await unlink(target).catch(() => {
      throw Object.assign(new Error("not found"), { code: "ENOENT" });
    });

    return NextResponse.json({ success: true, message: "Gambar dihapus" });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    console.error("Admin materi delete error:", error);
    return NextResponse.json(
      { success: false, error: code === "ENOENT" ? "File tidak ditemukan" : "Gagal menghapus gambar" },
      { status: code === "ENOENT" ? 404 : 500 },
    );
  }
}
