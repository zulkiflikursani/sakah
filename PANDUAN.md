# Panduan Penggunaan Aplikasi Sakka

**Sakka** adalah aplikasi keuangan syariah untuk mengelola keuangan pribadi dan bisnis sesuai prinsip syariah — dilengkapi kalkulator syariah, pusat edukasi 12 akad dengan kuis berhadiah poin, dan gamifikasi belajar.

Panduan ini menjelaskan **semua fitur**, mulai dari pendaftaran hingga panel admin.

---

## Daftar Isi

1. [Menjalankan Aplikasi](#1-menjalankan-aplikasi)
2. [Registrasi & Login](#2-registrasi--login)
3. [Navigasi](#3-navigasi)
4. [Buku Kas Halal](#4-buku-kas-halal)
5. [Kalkulator Syariah](#5-kalkulator-syariah)
6. [Pusat Edukasi & Kuis](#6-pusat-edukasi--kuis)
7. [Gamifikasi (Poin & Level)](#7-gamifikasi-poin--level)
8. [Kelola Akun](#8-kelola-akun)
9. [Panel Admin: Manajemen Materi & Kuis](#9-panel-admin-manajemen-materi--kuis)
10. [Struktur Database & File Penting](#10-struktur-database--file-penting)
11. [FAQ & Troubleshooting](#11-faq--troubleshooting)

---

## 1. Menjalankan Aplikasi

### Prasyarat

- Node.js 20+
- Database PostgreSQL (env `DATABASE_URL`, mis. dari Vercel/Neon) — untuk transaksi kas
- Database PostgreSQL terpisah `PGSSLMODE=no-verify` (env `QUIZ_DATABASE_URL`) — untuk modul & bank soal kuis
- `.env.local` berisi kredensial database Anda

### Perintah

```bash
npm install        # sekali saja
npm run dev        # jalankan mode pengembangan → http://localhost:3000
npm run build      # build produksi
npm run lint       # pengecekan kode
```

Buka **http://localhost:3000** di browser.

---

## 2. Registrasi & Login

Semua pengguna wajib mendaftar untuk menyimpan poin dan progres kuis.

### Cara mendaftar

1. Klik tombol **"Masuk akun"** di kanan atas header.
2. Modal terbuka dalam mode **Daftar**. Jika terbuka di mode Masuk, klik tautan **"Daftar di sini"**.
3. Isi:
   - **Nama lengkap** — ditampilkan di profil dan Gamifikasi.
   - **Email** — harus unik, menjadi identitas login.
   - **Kata sandi** — minimal 8 karakter.
4. Klik **Daftar**. Akun langsung dibuat dan Anda otomatis masuk.
5. Tombol akun di header kini menampilkan **inisial nama** Anda.

### Cara masuk (login)

1. Klik **"Masuk akun"** → mode **Masuk**.
2. Masukkan email + kata sandi → klik **Masuk**.

### Keluar (logout)

Klik tombol inisial di header → panel akun → **Keluar**.

> Sesi disimpan lewat cookie `sakah_session` (HTTP-only,30 hari). Anda tetap login meski menutup browser.

---

## 3. Navigasi

### Desktop

- **Sidebar kiri**: Kas · Hitung · Edukasi · Poin (· **Kelola** khusus admin).
- **Header atas**: judul halaman + tombol akun.

### Mobile (layar kecil)

- **Navbar bawah**: Kas · Hitung · Edukasi · Poin (· **Kelola** khusus admin).
- Header atas tetap menampilkan tombol akun.

---

## 4. Buku Kas Halal

Catat pemasukan & pengeluaran dengan kategori yang halal.

1. Buka tab **Kas**.
2. Klik tombol **+** (floatting button) untuk menambah transaksi.
3. Isi form:
   - **Tipe**: Pemasukan / Pengeluaran
   - **Nominal**: masukkan angka rupiah (format otomatis Rp1.000.000)
   - **Kategori**: pilih dari daftar kategori halal
   - **Status halal**: centang jika transaksi bersifat halal
4. Klik **Simpan** — transaksi tersimpan di `transaksi_syariah` dan langsung muncul di daftar.
5. Klik **"Lihat Semua"** untuk melihat seluruh riwayat transaksi.
6. Kartu ringkasan di atas menampilkan total pemasukan, pengeluaran, dan saldo.

---

## 5. Kalkulator Syariah

Tab **Hitung** berisi3 kalkulator:

### a. Zakat

1. Masukkan **total aset** (emas, uang, saham, dagang, dll.).
2. Masukkan **total utang** yang belum dibayar.
3. Aset bersih = aset − utang.
4. Jika aset bersih ≥ **Rp85.000.000** (nisab emas) → status **Wajib**, zakat = **2,5% × aset bersih**.
5. Jika di bawah nisab → status **Belum Wajib**.

> Contoh: aset Rp100.000.000 − utang Rp10.000.000 = Rp90.000.000 → zakat **Rp2.250.000**.

### b. Bagi Hasil Mudharabah

1. Masukkan **modal** investor.
2. Masukkan **laba** usaha periode berjalan.
3. Masukkan **bagi hasil (%)** sesuai perjanjian (mis. 30%).
4. Kalkulator menampilkan **bagi hasil investor**, **bagi hasil pengelola**, dan **laba bersih pengelola**.

### c. Margin Murabahah

1. Masukkan **harga beli** barang.
2. Masukkan **margin (%)** keuntungan yang disepakati.
3. Masukkan **uang muka** pembeli (opsional).
4. Hasil: **harga jual**, **margin rupiah**, dan **sisa cicilan**.

---

## 6. Pusat Edukasi & Kuis

Tab **Edukasi** berisi **12 modul akad**:

Murabahah · Salam · Istishna · Mudharabah · Musyarakah · Ijarah · Ijarah Muntahiya bi al-Tamlik · Wakalah · Qardh al-Hasan · Wadiah · Kafalah · Rahn

### Belajar dengan komik

1. Klik salah satu kartu modul.
2. Halaman materi menampilkan **komik ilustrasi** dari `public/edukasi/materi/` — pelajari definisi, mekanisme, dan contoh akad.

### Mengerjakan kuis

1. Pada halaman materi, klik **"Mulai Kuis"**.
2. **Login diperlukan** — jika belum masuk, banner akan mengarahkan Anda ke tombol "Masuk akun".
3. Server memilih **5 soal acak** dan **mengacak urutan pilihan**.
4. Jawab satu per satu, lalu klik **Kirim**.
5. Setelah selesai, Anda melihat:
   - **Persentase skor** (mis. 60% = 3/5 benar)
   - **Poin bertambah** (skor ≥ 60% → poin: nilai skor, mis. 60 → +60 poin)
   - **Kunci jawaban & penjelasan** untuk setiap soal
6. Poin dan skor terbaik per modul **tersimpan otomatis di server**.

> **Anti-farm**: mengerjakan kuis dengan skor sama atau lebih rendah dari skor terbaik tidak menambah poin. Poin hanya bertambah saat skor terbaik baru tercapai.

### Badge progres

Kartu modul di daftar menampilkan **"Terbaik XX%"** dan bintang untuk modul yang sudah pernah diselesaikan.

---

## 7. Gamifikasi (Poin & Level)

Tab **Poin** menampilkan progres belajar Anda:

- **Nama & email asli** dari akun (bukan data contoh).
- **Jumlah poin** — total akumulasi dari kuis.
- **Level**: Mubtadi (0) → Mutsariq (250) → Muharrik (750) → Mubtadi? (lihat kode: `Level0`) → `Level500` (1.500) → `Level750` (3.000) → `Level1000` (5.000) → Haqq (10.000). *Nama level mengikuti skala di kode — sesuaikan kebutuhan.*
- **Statistik**: modul dikuasai (skor ≥ 60%), modul tersedia, misi berikutnya.
- **Misi Berikutnya**: modul yang belum memiliki progres → klik **Kerjakan** langsung ke kuisnya.
- **Riwayat**: daftar modul beserta skor terbaiknya (urut terbaru).
- **Reset**: tombol **"Reset Progres"** menghapus semua poin & skor (untuk mulai dari awal).

---

## 8. Kelola Akun

1. Klik tombol inisial di header.
2. Panel menampilkan **nama, email, dan peran** (User/Admin).
3. Aksi:
   - **Ganti Nama** — masukkan nama baru → Simpan.
   - **Keluar** — logout dari sesi ini.

---

## 9. Panel Admin: Manajemen Materi & Kuis

### Masuk sebagai admin

Akun admin sudah dibuat:

- **Email**: `admin@sakah.id`
- **Kata sandi**: `Admin12345`

> ⚠️ **Segera ganti kata sandi** setelah pertama login (hapus akun lama lalu daftar ulang dengan email & sandi baru, lalu beri peran `admin` lewat SQL: `UPDATE users SET role='admin' WHERE email='...'`).

Setelah login, menu **"Kelola"** muncul di sidebar (desktop) dan navbar bawah (mobile). Pengguna biasa **tidak melihat** menu ini, dan API-nya menolak dengan `403 Forbidden`.

### a. Manajemen Modul

1. Buka **Kelola** → tab **Modul**.
2. Daftar semua modul tampil (slug, judul, jumlah soal, urutan, status).
3. **Tambah Modul**: klik **+ Tambah Modul** → isi slug, judul, deskripsi, nama folder gambar, urutan, status aktif → **Simpan**.
4. **Ubah**: klik ✎ pada baris → ubah data → **Simpan**.
5. **Nonaktifkan/aktifkan**: klik ✔/✕ pada kolom Status (modul nonaktif tidak tampil di Edukasi).
6. **Hapus**: klik 🗑 (konfirmasi diperlukan) — soal di dalamnya ikut terhapus.

### b. Manajemen Soal (Kuis)

1. Buka tab **Soal** → pilih modul dari dropdown.
2. Daftar soal tampil lengkap dengan A/B/C/D dan kunci jawaban.
3. **Tambah Soal**: klik **+ Tambah Soal** → isi pertanyaan, 4 pilihan, pilih **kunci jawaban** (A–D), dan penjelasan → **Simpan**.
4. **Ubah**: klik ✎ → ubah → **Simpan**.
5. **Hapus**: klik 🗑 (konfirmasi).
6. Kuis selalu memilih **5 soal acak** — makin banyak soal, makin bervariasi kuis.

### c. Manajemen Gambar Materi (Komik)

1. Buka tab **Materi** → pilih modul.
2. **Upload gambar** (jpg/png/webp) → file diunggah ke `public/edukasi/materi/` dan langsung muncul di daftar.
3. **Hapus gambar** dengan ikon 🗑 (file ikut terhapus dari disk).
4. Nama folder mengikuti `image_folder` modul (mis. `murabahah`, `PHOTO-...` untuk gambar satuan).

---

## 10. Struktur Database & File Penting

### Tabel

| Tabel | Fungsi |
|---|---|
| `users` | akun (nama, email, sandi hash, poin, role) |
| `sessions` | sesi login cookie |
| `modul_progres` | skor terbaik + poin kumulatif per modul |
| `transaksi_syariah` | transaksi kas halal |
| `quiz_modul` | daftar modul kuis (12 akad) |
| `quiz_soal` | bank soal (A–D, kunci, penjelasan) |

Skema lengkap: [`database/auth_progres.sql`](database/auth_progres.sql) dan [`database/quiz_edukasi.sql`](database/quiz_edukasi.sql).

### API utama

| Endpoint | Fungsi |
|---|---|
| `POST /api/auth/register` | daftar |
| `POST /api/auth/login` | masuk |
| `POST /api/auth/logout` | keluar |
| `GET /api/auth/me` | status sesi |
| `POST /api/quiz/POST /api/quiz/:slug/ujian` | kuis + penyimpanan poin |
| `GET/POST /api/transaksi` | buku kas |
| `GET /api/edukasi/modul` | daftar modul |
| `GET/POST/PATCH/DELETE /api/admin/modul` | CRUD modul (admin) |
| `GET/POST/PATCH/DELETE /api/admin/soal` | CRUD soal (admin) |
| `GET/POST/DELETE /api/admin/materi` | gambar materi (admin) |

---

## 11. FAQ & Troubleshooting

**Q: Tombol/teks tidak terlihat (warna putih).**
A: Aplikasi selalu memakai tema terang — teks gelap di atas latar putih. Jika dulu teks input hilang, pastikan `app/globals.css` memiliki blok `@media (forced-colors: active), (prefers-color-scheme: dark)` yang memaksa `color: #171717` pada `input/textarea/select`.

**Q: Kuis tidak bisa dimulai.**
A: Kuis butuh login. Klik "Masuk akun" terlebih dahulu.

**Q: Poin tidak bertambah.**
A: Poin hanya bertambah jika **skor terbaik baru** tercapai (anti-farm). Skor sama → +0.

**Q: Menu "Kelola" tidak muncul.**
A: Hanya untuk akun `role = admin`. Login dengan `admin@sakah.id`.

**Q: Upload gambar gagal.**
A: Pastikan ukuran < 10 MB dan format jpg/png/webp. Folder `public/edukasi/materi/` harus dapat ditulis.

**Q: Database error saat simpan.**
A: Cek `.env.local` (`DATABASE_URL`, `QUIZ_DATABASE_URL`) dan jalankan skema SQL di folder `database/`.

**Q: Lupa kata sandi admin.**
A: Reset lewat SQL: `DELETE FROM sessions WHERE user_id=(SELECT id FROM users WHERE email='admin@sakah.id');` lalu update sandi baru dengan hash scrypt yang sama, atau hapus akun & daftar ulang + set `role='admin'`.

---

*Panduan ini disusun untuk aplikasi Sakka — v1.0 (Oktober 2026).*
