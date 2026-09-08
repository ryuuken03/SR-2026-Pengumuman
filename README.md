# Sekolah Rakyat 2026 — Pengumuman Seleksi Kompetensi

Portal pencarian mandiri hasil **Seleksi Kompetensi (CAT & SKT) PPPK Guru dan PPPK Teknis Sekolah Rakyat Tahun Anggaran 2026 (Kementerian Sosial RI)** berbasis React, TypeScript, dan Vite.

> **Pernyataan Sumber Data (Disclaimer Resmi):**
> Aplikasi ini **bukan website resmi pemerintah**. Seluruh data pengumuman yang disajikan bersumber dari rilis resmi di tautan publik: [https://bit.ly/hasil-integrasi](https://bit.ly/hasil-integrasi). Aplikasi ini hadir sebagai inisiatif mandiri untuk mempermudah rekan-rekan peserta memeriksa nilai dan status kelulusan secara cepat, akurat, dan hemat kuota data.

---

## Ringkasan Fitur

- **Dukungan Dua Dataset Seleksi (CAT & SKT)**:
  - **Tahap CAT (Selkom)**: Mencakup **118.432** data peserta seleksi kompetensi utama.
  - **Tahap SKT (Seleksi Kompetensi Tambahan)**: Mencakup **13.313** data peserta dengan rincian nilai Psikotes, Bahasa Inggris, Wawancara SKT, Total SKT, Nilai Akhir, serta jadwal pelaksanaan ujian.
- **Pemilih Tahap Seleksi Cepat**: Komponen pemilih tahap (*CAT* vs *SKT*) terintegrasi dengan pemuatan data *on-demand*.
- **Pencarian Instan Latar Belakang (Web Worker)**: Penyaringan nama dan nomor peserta berkecepatan tinggi tanpa mengunci tampilan utama (*non-blocking main thread*).
- **Filter Formasi Bertingkat**: Penyaringan kategori (*PPPK Guru* dan *PPPK Teknis*), jabatan, serta unit penempatan lokasi ujian.
- **Panel Rekapitulasi Statistik Fleksibel**: Ringkasan jumlah peserta, jabatan, unit lokasi, dan status kelulusan yang dapat dibuka atau ditutup (*expand/collapse*).
- **Antarmuka Responsif Desktop & Seluler**:
  - Tabel data dengan gulir horizontal mulus di perangkat layar kecil.
  - Kartu seluler ringkas untuk rincian skor dan jadwal.
  - Tombol catatan pembaruan responsif (ikon *info circle stroke* ringkas di layar seluler).
- **Mode Terang & Gelap Native**: Pengaturan tema kontras tinggi yang nyaman di mata dengan penyimpanan preferensi lokal.
- **Profil Pengembang & Foto Terverifikasi**: Halaman dedikasi pengembang dengan foto profil resmi, struktur tata letak seluler adaptif, dan tautan kontak langsung ke WhatsApp, Portofolio, Threads, serta GitHub.
- **Sistem Catatan Pembaruan Terpusat**: Riwayat rilis modular dengan tag semantik (*Fitur Baru*, *Peningkatan*, *Penyempurnaan*).

---

## Arsitektur & Optimasi Kuota (Vercel Free Tier)

Proyek ini dibangun dengan efisiensi tinggi untuk berjalan optimal pada kuota *free tier* Vercel (100 GB/bulan):

1. **On-Demand Static Sharding**: Data dipecah ke ribuan berkas JSON lokal (`src/assets/selkom/` dan `src/assets/skt/`). Browser hanya mengunduh data formasi yang sedang aktif dipilih.
2. **Aggressive Browser & CDN Caching**: Berkas statis JSON dan gambar dikonfigurasi dengan header `Cache-Control: public, max-age=31536000, immutable` di `vercel.json` agar kunjungan ulang pengunjung tidak menghabiskan kuota bandwidth server.
3. **Pemuatan Aset Asinkron**: Foto profil dan gambar statis menggunakan atribut `loading="lazy"` serta `decoding="async"`.
4. **Sentralisasi String UI & Versi**:
   - Seluruh teks UI terpusat di `src/constants/strings.ts`.
   - Versi aplikasi terpusat di `src/config/version.ts` (*single source of truth*) dan riwayat rilis terkelola di `src/config/changelog.ts`.
5. **Desain Bersih Bebas AI-Slop**: Tampilan profesional tanpa emoji dekoratif berlebih atau kalimat klise generik, menjaga kredibilitas sebagai utilitas publik.

---

## Struktur Direktori

```
Sekolah Rakyat 2026 Pengumuman/
├── public/
│   ├── assets/
│   │   └── images/
│   │       └── profile.png       # Salinan aset gambar profil
│   ├── profile.png               # Foto profil pengembang
│   ├── search-index.json         # Index pencarian global selkom
│   └── search-index-skt.json     # Index pencarian global skt
├── src/
│   ├── assets/
│   │   ├── selkom/               # Sumber data JSON peserta CAT per formasi
│   │   └── skt/                  # Sumber data JSON peserta SKT per formasi
│   ├── components/
│   │   ├── about/                # Halaman profil pengembang & kontak
│   │   │   └── AboutPage.tsx
│   │   ├── layout/               # Header, Footer, ThemeToggle
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppFooter.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── results/              # Tabel hasil & panel statistik
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── GlobalSummary.tsx
│   │   │   └── SummaryCard.tsx
│   │   ├── search/               # Formasi selector & filter tahap
│   │   │   ├── DataSourceSelector.tsx
│   │   │   ├── FormasiSelector.tsx
│   │   │   └── SearchControls.tsx
│   │   └── ui/                   # Komponen UI umum
│   │       ├── ChangelogModal.tsx
│   │       ├── EmptyState.tsx
│   │       └── StatusBadge.tsx
│   ├── config/                   # Pusat Versi & Riwayat Rilis
│   │   ├── version.ts            # Single source of truth versi aktif
│   │   └── changelog.ts          # Konfigurasi catatan rilis publik
│   ├── constants/
│   │   └── strings.ts            # Sentralisasi seluruh teks UI
│   ├── hooks/
│   │   └── useSelkomSearch.ts    # State machine & logika pencarian data
│   ├── styles/                   # Arsitektur CSS Modular
│   │   ├── base/                 # variables, reset, typography
│   │   ├── layout/               # app, grid, footer
│   │   ├── components/           # button, modal, table, search, about, data-source, dll.
│   │   └── index.css             # Entry point CSS
│   └── workers/                  # Web Worker pemrosesan data berat
│       └── searchWorker.ts
├── scripts/                      # Generator indeks pencarian & ekstraksi data
├── AGENTS.md                     # Panduan arsitektur & aturan kontribusi kode
├── vercel.json                   # Konfigurasi header cache CDN Vercel
└── package.json
```

---

## Profil Pengembang & Kanal Kontak

Dikembangkan secara mandiri oleh:

- **Nama**: Mohammad Toriq
- **Peran**: Software Engineer & System Architect (10 Tahun Pengalaman)
- **WhatsApp**: [+62 851-6862-6313](https://wa.me/6285168626313?text=Halo%20Mas%20Mohammad%20Toriq%2C%20saya%20ingin%20berdiskusi%20mengenai%20portal%20Sekolah%20Rakyat%202026)
- **Portofolio**: [mohammadtoriq.netlify.app](https://mohammadtoriq.netlify.app/)
- **Threads**: [@mohammadtoriq](https://www.threads.net/@mohammadtoriq)
- **GitHub**: [github.com/ryuuken03](https://github.com/ryuuken03)

---

## Menjalankan Proyek Secara Lokal

### Prasyarat

- Node.js versi 18 ke atas
- npm atau pnpm

### Langkah Menjalankan

```bash
# 1. Clone repository
git clone https://github.com/ryuuken03/SR-2026-Pengumuman.git
cd "Sekolah Rakyat 2026 Pengumuman"

# 2. Pasang dependensi
npm install

# 3. Jalankan development server
npm run dev

# 4. Validasi TypeScript & Linting
npx tsc --noEmit
npm run lint

# 5. Build produksi (termasuk indeks pencarian otomatis)
npm run build
```

---

## Lisensi & Hak Cipta

Proyek ini dibangun sebagai inisiatif independen nirlaba bagi komunitas peserta seleksi.
Hak cipta data peserta sepenuhnya merupakan milik panitia seleksi resmi Kementerian Sosial Republik Indonesia.
