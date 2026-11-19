# Deploy dan launch

## Environment (Vercel → Project → Settings → Environment Variables)

| Variabel | Wajib untuk | Catatan |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical, sitemap, OG | default `https://dimasjati.vercel.app` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | konten Sanity | tanpa ini → seed |
| `SANITY_REVALIDATE_SECRET` | webhook | ≥ 16 karakter |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | form kontak | pengirim harus domain terverifikasi di Resend |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | form kontak | widget Turnstile untuk domain produksi |

Form hanya tampil bila kelima kunci form ada. Nilai yang salah format dicatat di log dan diperlakukan sebagai "belum dikonfigurasi".

## Langkah launch (butuh akun pemilik)

1. Buat project Sanity, deploy Studio, isi `siteSettings` (email, LinkedIn, GitHub, `repoUrl`, CV), cek teks hero/manifesto/fakta, tambah aktivitas dan isi case study.
2. Resend: verifikasi domain/pengirim. Turnstile: buat widget untuk `dimasjati.vercel.app`.
3. Vercel: import repo, Node 24, isi env, deploy preview, uji kirim form.
4. Webhook Sanity → `https://dimasjati.vercel.app/api/revalidate` dengan secret; ubah satu teks dan pastikan tampil ≤ 1 menit.
5. Vercel Firewall: rate limit untuk POST ke halaman (Server Action), melengkapi pembatas in-memory.
6. Aktifkan Web Analytics + Speed Insights (komponen hanya dimuat saat berjalan di Vercel). Event kustom (`cv`, `contact_form`, `email`, `linkedin`, `github`) butuh paket Pro; di Hobby panggilan ini aman tanpa efek.

## Status gate (19 Nov 2026)

| Area | Status |
| --- | --- |
| Build, lint, typecheck | Hijau (Node 24) |
| Unit test | 24/24 |
| E2E Playwright (desktop + mobile Chromium) | 16/16, termasuk axe Night/Day tanpa pelanggaran serius |
| Lighthouse (desktop, lokal) | Accessibility 100, Best Practices 100, SEO 92 (canonical menunjuk domain produksi, wajar di localhost) |
| Performance | Lihat `motion.md`; skor Lighthouse Performance belum diukur (CLI tidak diizinkan diunduh di sesi build) |
| JS awal | 235 KB gzip / 204 KB brotli. **Melewati budget 180 KB**: baseline React 19 + Next 16 ≈ 145 KB, GSAP + plugin ≈ 60 KB, Lenis 10 KB, next-intl 12 KB. three.js (243 KB gzip) dimuat lazy setelah load, hanya di `full` |
| Font | Clash Display 29 KB + Geist/Geist Mono/Instrument Serif via `next/font` |
| iOS Safari / Android nyata | Belum; jalankan di preview Vercel |
| Konten | Kanal kontak, CV, aktivitas, isi case study menunggu Sanity |
