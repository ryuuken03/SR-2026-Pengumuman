# Sekolah Rakyat 2026 — Pengumuman Seleksi Kompetensi

Portal pencarian mandiri hasil **Seleksi Kompetensi PPPK Guru dan PPPK Teknis Sekolah Rakyat Tahun Anggaran 2026 (Kementerian Sosial RI)** berbasis React, TypeScript, dan Vite.

> **Pernyataan Sumber Data (Disclaimer Resmi):**
> Aplikasi ini **bukan website resmi pemerintah**. Seluruh data pengumuman yang disajikan bersumber dari pengumuman resmi di [https://sekolahrakyat.kemensos.go.id/pengumuman](https://sekolahrakyat.kemensos.go.id/pengumuman). Aplikasi ini hadir sebagai inisiatif sukarela untuk mempermudah rekan-rekan peserta memeriksa nilai dan status kelulusan secara cepat, akurat, dan hemat kuota data.

---

## Ringkasan Fitur

- **Pencarian Instan (Web Worker)**: Pencarian nama atau nomor peserta di antara **118.432 data seleksi** berjalan mulus tanpa mengunci antarmuka (*non-blocking main thread*).
- **Filter Formasi Bertingkat**: Pemilihan kategori formasi (*PPPK Guru* dan *PPPK Teknis*), jabatan, serta lokasi penempatan dengan pemuatan data *on-demand*.
- **Panel Rekapitulasi Statistik**: Ringkasan data peserta, jumlah jabatan, lokasi, dan status kelulusan yang dapat dibuka atau disembunyikan (*expand/collapse*).
- **Tabel Responsif & Tampilan Mobile**: Tata letak otomatis menyesuaikan ukuran layar ponsel pintar dengan kartu ringkas peringkat skor.
- **Mode Terang & Gelap Native**: Pengaturan tema kontras tinggi yang nyaman di mata dengan penyimpanan preferensi lokal.
- **Catatan Pembaruan Terstruktur (Changelog)**: Modal riwayat rilis dengan tag semantik (*Fitur Baru*, *Peningkatan*, *Perbaikan*).
- **Profil Pengembang & Kontak Resmi**: Halaman informasi pengembang dengan tombol kontak langsung ke WhatsApp, Portofolio, Threads, dan Repositori GitHub.

---

## Arsitektur & Optimasi

Proyek ini dirancang mengikuti pedoman rekayasa performa tinggi dan efisiensi bandwidth (Vercel Free Tier):

1. **On-Demand Static Sharding**: Data formasi dipecah ke ratusan berkas JSON di `src/assets/selkom/<kode>/peserta.json`. Browser hanya mengunduh formasi yang sedang dibuka.
2. **Aggressive Browser Caching**: Berkas statis dikonfigurasi dengan header `Cache-Control: public, max-age=31536000, immutable` di `vercel.json` agar perangkat pengguna tidak mengunduh data yang sama berulang kali.
3. **Sentralisasi Teks UI**: Seluruh teks antarmuka dikelola di `src/constants/strings.ts` untuk memastikan konsistensi dan kemudahan lokalisasi.
4. **Desain Bersih Bebas AI-Slop**: Menghindari ornamen dekoratif generik, emoji berlebih, atau teks klise agar antarmuka tetap profesional dan kredibel.

---

## Struktur Direktori

```
Sekolah Rakyat 2026 Pengumuman/
├── public/
│   ├── assets/images/logo-kemensos.png
│   └── search-index.json         # Index pencarian global
├── src/
│   ├── assets/selkom/            # Sumber data JSON peserta per formasi
│   ├── components/
│   │   ├── about/                # Halaman profil pengembang & kontak
│   │   │   └── AboutPage.tsx
│   │   ├── layout/               # Header, Footer, ThemeToggle
│   │   │   ├── AppFooter.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── results/              # Tabel hasil & panel rekapitulasi
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── GlobalSummary.tsx
│   │   │   └── SummaryCard.tsx
│   │   ├── search/               # Formasi selector & kolom cari
│   │   │   ├── FormasiSelector.tsx
│   │   │   └── SearchControls.tsx
│   │   └── ui/                   # Komponen UI umum
│   │       ├── ChangelogModal.tsx
│   │       ├── EmptyState.tsx
│   │       └── StatusBadge.tsx
│   ├── config/                   # Single Source of Truth Versi & Changelog
│   │   ├── version.ts
│   │   └── changelog.ts
│   ├── constants/
│   │   └── strings.ts            # Sentralisasi seluruh string UI
│   ├── hooks/
│   │   └── useSelkomSearch.ts    # State machine & logika pencarian
│   ├── styles/                   # Arsitektur CSS Modular
│   │   ├── base/                 # variables, reset, typography
│   │   ├── layout/               # app, grid, footer
│   │   ├── components/           # button, modal, table, search, about, dll.
│   │   └── index.css             # Entry point CSS
│   └── workers/                  # Web Worker pencarian instan
│       └── searchWorker.ts
├── AGENTS.md                     # Panduan arsitektur & aturan pengembangan
└── package.json
```

---

## Profil Pengembang & Kanal Kontak

Dikembangkan secara mandiri oleh:

- **Nama**: Mohammad Toriq
- **Peran**: Software Engineer (10 Tahun Pengalaman)
- **WhatsApp**: [+62 851-6862-6313](https://wa.me/6285168626313?text=Halo%20Mas%20Mohammad%20Toriq%2C%20saya%20ingin%20berdiskusi%20mengenai%20portal%20Sekolah%20Rakyat%202026)
- **Portofolio**: [mohammadtoriq.netlify.app](https://mohammadtoriq.netlify.app/)
- **Threads**: [@mohammadtoriq](https://www.threads.net/@mohammadtoriq)
- **GitHub**: [github.com/ryuuken03](https://github.com/ryuuken03)

---

## Menjalankan Proyek Secara Lokal

### Prasyarat

- Node.js versi 18 ke atas
- npm atau pnpm

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/ryuuken03/SR-2026-Pengumuman.git
cd "Sekolah Rakyat 2026 Pengumuman"

# 2. Pasang dependensi
npm install

# 3. Jalankan development server
npm run dev

# 4. Validasi TypeScript & Linting
npx tsc -b
npm run lint

# 5. Build produksi
npm run build
```

---

## Lisensi & Hak Cipta

Proyek ini dibangun sebagai inisiatif independen nirlaba bagi komunitas peserta seleksi.
Hak cipta data peserta sepenuhnya merupakan milik panitia seleksi resmi Kementerian Sosial Republik Indonesia.
