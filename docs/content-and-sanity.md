# Konten dan Sanity

## Studio

Paket `studio/` (workspace pnpm). Jalankan `SANITY_STUDIO_PROJECT_ID=<id> pnpm --filter studio dev` lalu buka `http://localhost:3333`, atau `pnpm --filter studio deploy` ke `*.sanity.studio`. Validasi schema: `pnpm --filter studio validate` (juga di CI).

## Model

Field dua bahasa berbentuk `{ en, id }`; ID kosong → tampil EN.

| Tipe | Field penting |
| --- | --- |
| `siteSettings` (singleton) | `heroLabel`, `heroStatement`, `manifesto`, `facts` (maks. 5), `availability`, `showAvailability`, `email`, `linkedin`, `github`, `repoUrl`, `cv` (PDF ≤ 500 KB) |
| `project` | `title`, `slug`, `featured`, `order`, `summary`, `role`, `year`, `duration`, `team`, `stack`, `glyph`, `cover` (+alt), `galleryTile`, `liveUrl`, `repoUrl`, `problem`, `process`, `decisions[]` (judul, isi, kode), `results`, `gallery[]` |
| `activity` | `title`, `slug`, `org`, `type`, `startDate`, `endDate`, `summary`, `body`, `cover`, `gallery[]`, `url`, `featured`, `order` |
| `skillGroup` | `title`, `items[]`, `order` |

Tulis satu kata dalam `*bintang*` di `heroStatement`/`manifesto` untuk kata aksen bronze italic.

## Menambah proyek

1. Buat dokumen `project`, isi kartu (judul, slug, order, summary, stack, cover ≥ 1440px, glyph).
2. `featured = true` → masuk kartu unggulan dan cover-nya ke zoom gallery (3 cover pertama). Gallery menyesuaikan diri untuk berapa pun jumlah proyek.
3. Halaman `/work/[slug]` muncul otomatis begitu `problem` atau `decisions` terisi; tanpa itu kartu tidak menjadi link.

## Menambah aktivitas

Buat `activity`. Home menampilkan maksimal 6 yang `featured`, urut `order`. Bila punya `body` atau gambar, barisnya menjadi link ke `/activities/[slug]`. Section Experience tersembunyi selama belum ada aktivitas.

## Seed dan fixture

- `lib/content/seed.ts`: dipakai bila Sanity belum dikonfigurasi, gagal diakses, atau koleksi kosong. Hanya fakta dari dokumen (PRD §13, Figma): 5 proyek, 4 kelompok skill, teks hero/manifesto/fakta. Tanpa kanal kontak, tanpa CV, tanpa aktivitas, tanpa isi case study.
- `tests/fixtures/content.ts`: data palsu berlabel "Example", hanya untuk `CONTENT_FIXTURES=1` di development.
- Gambar seed: `pnpm media` membaca `projects/` (tidak ikut git) dan menulis versi grayscale + berwarna 1600px ke `public/projects/<slug>/` beserta `lib/content/media.json`.

## Revalidasi

Webhook Sanity (POST ke `/api/revalidate`, secret = `SANITY_REVALIDATE_SECRET`, projection apa pun) menandai tag `sanity` kedaluwarsa; perubahan tampil di permintaan berikutnya. Tanpa webhook, cache kedaluwarsa sendiri setiap 1 jam.
