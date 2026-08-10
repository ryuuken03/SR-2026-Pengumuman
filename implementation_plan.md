# Implementation Plan - Optimized Global Search (Cari Semua Data)

Implementasi fitur pencarian global (Global Search) ke seluruh 1.754 file `data.json` (118.432 peserta) di `src/assets/selkom` menggunakan Pre-indexed JSON & Web Worker Async.

## Decided User Requirements (Hasil Review)

1. **Akses Langsung Global Search**: Pengguna dapat langsung mengetik nama atau nomor peserta untuk mencari di *semua formasi* tanpa wajib memilih Jabatan dan Lokasi terlebih dahulu.
2. **Kolom Tambahan di Tabel**: Ketika dalam mode Global Search, tabel hasil pencarian akan menampilkan kolom **Jabatan Formasi** dan **Lokasi Formasi** agar peserta dapat melihat posisi/formasi mereka secara jelas.

---

## Technical Architecture & Proposed Changes

### Build & Index Generator

#### [NEW] [generate_search_index.mjs](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/scripts/generate_search_index.mjs)
- Script Node.js untuk mengekstrak seluruh 118.432 baris dari 1.754 file `data.json`.
- Menghasilkan file JSON terkompresi `public/assets/selkom/global_search_index.json` dengan format array ringkas:
  `[no, nomor_peserta, nama, teknis, manajerial, soskul, wawancara, total, status, lokasi_kode, jabatan_kode]`
- Menyertakan pula mapping label nama Jabatan & Lokasi di header file index agar cepat dirender tanpa query terpisah.

#### [MODIFY] [package.json](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/package.json)
- Menambahkan script `"build:index": "node scripts/generate_search_index.mjs"`.
- Memperbarui script `"dev"` dan `"build"` agar menjalankan `build:index` secara otomatis.

---

### Web Worker & Search Logic

#### [NEW] [searchWorker.ts](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/src/workers/searchWorker.ts)
- Web Worker asynchronous untuk memuat `global_search_index.json` secara background lazy load.
- Melakukan pemfilteran substring / multi-word token matching pada background thread tanpa memblokir UI main thread React.

#### [MODIFY] [useSelkomSearch.ts](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/src/hooks/useSelkomSearch.ts)
- Menambahkan state `searchScope` (`'formasi' | 'global'`). Default secara cerdas: jika belum pilih formasi & pengguna mengetik pencarian, otomatis menggunakan scope `'global'`.
- Mengintegrasikan komputasi Web Worker untuk Global Search.
- Menyediakan handler untuk reset/toggle mode pencarian.

---

### UI Components

#### [MODIFY] [SearchControls.tsx](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/src/components/SearchControls.tsx)
- Menambahkan toggle scope pencarian: **Cari di Formasi Ini** vs **Cari di Semua Formasi (Global)**.
- Kolom input tetap aktif dan dapat digunakan kapan saja tanpa terhalang pilihan formasi.

#### [MODIFY] [FormasiSelector.tsx](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/src/components/FormasiSelector.tsx)
- Menyesuaikan kelas dan indikator saat mode Global Search diaktifkan.

#### [MODIFY] [ResultsTable.tsx](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/src/components/ResultsTable.tsx)
- Menampilkan kolom **Jabatan Formasi** dan **Lokasi Formasi** saat mode pencarian Global aktif.
- Memungkinkan sorting berdasarkan Jabatan dan Lokasi selain kolom bawaan.

---

### App Integration & Styling

#### [MODIFY] [App.tsx](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/src/App.tsx)
- Menghubungkan state `searchScope` dan status meta hasil Global Search.

#### [MODIFY] [App.css](file:///c:/Project/Sekolah%20Rakyat%202026%20Pengumuman/src/App.css)
- Menambahkan styling responsif untuk mode toggle, kolom tabel baru, dan indikator status Global Search.

---

## Verification Plan

### Automated Tests
- Menjalankan `npm run build:index` untuk meyakinkan `public/assets/selkom/global_search_index.json` ter-generate tanpa error dan memuat 118.432 item.
- Menjalankan `npm run build` (tsc & vite build) untuk memastikan tidak ada error TypeScript atau Vite bundle.

### Manual Verification
- Pengujian pencarian nama (misal "PUTRI" atau "AGUS") pada mode Global Search.
- Memastikan paginasi, pengurutan (sorting), dan kelancaran UI berjalan baik.
