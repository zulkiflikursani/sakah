# Fitur: Edukasi + Gambar Komik + Kuis Teracak

## Ringkasan

Fitur ini menyempurnakan halaman **Edukasi** (`app/edukasi/Edukasi.tsx`) menjadi materi interaktif.

Dua tambahan utama:
1. Konten edukasi berbasis komik untuk 12 akad.
2. Kuis pemahaman dengan soal yang dipilih dan diacak dari database.

Database kuis menggunakan **PostgreSQL** dan **@vercel/postgres**.

---

## Daftar modul edukasi

Konten edukasi terdiri dari 12 akad:

1. Murabahah
2. Salam
3. Istishna
4. Mudharabah
5. Musyarakah
6. Ijarah
7. Ijarah Muntahiya Bi al Tamlik
8. Wakalah
9. Qardh al Hasan
10. Wadiah
11. Kafalah
12. Rahn

Setiap modul mempunyai komik pada:

```text
public/edukasi/materi/<slug>/
```

Contoh:

```text
public/edukasi/materi/murabahah/
```

---

## Aturan kuis

Tiap kuis:
- Memilih beberapa soal dari bank soal.
- Menampilkan soal dalam acak.
- Menampilkan 4 opsi dalam acak.
- Menerima jawaban benar.
- Menghitung skor.

Contoh aturan:
- 5 soal per kuis.
- Total skor = jumlah jawaban benar.
- 100% = 5/5.
- 80% = 4/5.

---

## Struktur bank soal

Database menggunakan 4 tabel:

1. `quiz_modul`
2. `quiz_soal`
3. `quiz_pilihan`
4. `quiz_jawaban_benar`

### `quiz_modul`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigserial | Primary key |
| slug | text | Unique id modul |
| title | text | Judul modul |
| description | text | Deskripsi singkat |
| image_folder | text | Folder komik di `public/edukasi/materi` |
| sort_order | integer | Urutan tampilan |
| is_active | boolean | Aktif tidak |

### `quiz_soal`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigserial | Primary key |
| modul_id | bigint | Foreign key ke quiz_modul |
| question | text | Soal |
| option_a | text | Pilihan A |
| option_b | text | Pilihan B |
| option_c | text | Pilihan C |
| option_d | text | Pilihan D |
| answer_index | smallint | 1=A, 2=B, 3=C, 4=D |
| explanation | text | Penjelasan jawaban |

### `quiz_pilihan`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigserial | Primary key |
| soal_id | bigint | Foreign key ke quiz_soal |
| option_number | smallint | 1-4 |
| option_text | text | Isi opsi |
| is_correct | boolean | Benar/Salah |

### `quiz_jawaban_benar`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigserial | Primary key |
| soal_id | bigint | Foreign key ke quiz_soal |
| answer_index | smallint | Jawaban benar 1-4 |

---

## Query database

### Ambil daftar modul

```sql
SELECT id, slug, title, description, image_folder, sort_order, is_active
FROM quiz_modul
WHERE is_active = TRUE
ORDER BY sort_order;
```

### Ambil soal per modul

```sql
SELECT
  qs.id,
  qs.question,
  qs.option_a,
  qs.option_b,
  qs.option_c,
  qs.option_d,
  qs.answer_index,
  qs.explanation
FROM quiz_soal qs
JOIN quiz_modul qm ON qm.id = qs.modul_id
WHERE qm.slug = $1
ORDER BY qs.id;
```

### Ambil pilihan per soal

```sql
SELECT
  qp.id,
  qp.option_number,
  qp.option_text,
  qp.is_correct
FROM quiz_pilihan qp
WHERE qp.soal_id = $1
ORDER BY qp.option_number;
```

### Ambil kunci jawaban

```sql
SELECT answer_index
FROM quiz_jawaban_benar
WHERE soal_id = $1;
```

---

## Kuis di aplikasi

Layanan kuis:

```ts
GET /api/quiz/:slug/soal
GET /api/quiz/:slug/pilihan/:soalId
POST /api/quiz/:slug/ujian
```

### Alur UI

1. User buka modul Edukasi.
2. Pilih modul.
3. Klik `Mulai Kuis`.
4. Server ambil 5 soal acak.
5. Server acak pilihan.
6. UI tampil soal.
7. User pilih jawaban.
8. User klik `Kirim`.
9. Server cek jawaban.
10. Server kirim skor.

---

## Integrasi dengan Gamifikasi

Setelah kuis selesai:
- Hitung skor benar.
- Beri poin berkah.
- Simpan progress kuis kalau perlu.
- Bisa aktifkan lencana/misi.

---

## Checklis

- [x] 12 modul akad
- [x] Firebase undefined
- [x] 60 soal
- [x] 240 pilihan
- [x] 60 kunci jawaban
- [x] Kuis teracak
- [x] PostgreSQL + @vercel/postgres
- [x] API CRUD sederhana
- [x] Build berhasil

---

## Penyesuaian kode

Kode yang dibutuhkan:

```ts
import { Pool } from "pg";
import { PoolClient } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

Contoh pengecekan:

```ts
const client = await pool.connect();
try {
  const res = await client.query(...);
} finally {
  await client.release();
}
```

---

## Penutup

Fitur ini siap digunakan untuk halaman Edukasi, Gallery, Kuis, dan gamifikasi. Seluruh data salinan tersimpan di file berikut:

```text
features/edukasi-dengan-gambar-dan-kuis.md
database/quiz_edukasi.sql
app/api/quiz/route.ts
```

---
