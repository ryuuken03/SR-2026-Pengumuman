# AGENTS.md — Sekolah Rakyat 2026 Pengumuman

Panduan ini wajib dibaca dan diikuti oleh semua agent sebelum membuat atau mengubah kode di project ini.
Project ini adalah aplikasi pencarian pengumuman Seleksi Kompetensi Sekolah Rakyat 2026 berbasis **React + TypeScript + Vite**, di-deploy ke **Vercel free tier**.

---

## 1. Optimasi Bandwidth Vercel (Free Tier)

Project ini di-deploy di Vercel **free tier** dengan kuota bandwidth terbatas (100 GB/bulan).
Data utama berupa ratusan file JSON lokal (`src/assets/selkom/`) yang harus diakses seefisien mungkin.

### Aturan Fetch JSON

- **Jangan pernah** fetch semua JSON sekaligus. Fetch hanya file yang dibutuhkan saat itu (on-demand / lazy load).
- Gunakan **URL relatif** `/assets/selkom/<kode>/<file>.json` — jangan hardcode domain.
- Setiap fetch JSON wajib menggunakan header `Cache-Control` yang tepat. File JSON yang tidak berubah (statis per deploy) harus dikonfigurasi di `vercel.json` dengan:

```json
{
  "headers": [
    {
      "source": "/assets/selkom/(.*)\\.json",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/assets/(.*)\\.json",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=3600" }]
    }
  ]
}
```

- Browser akan meng-cache file JSON setelah pertama kali diunduh. Gunakan ini secara konsisten agar **user yang sama tidak re-download data yang sama**.
- Untuk pencarian global (semua formasi), gunakan **search index** yang sudah di-generate (`scripts/generate_search_index.mjs`) — **jangan** iterasi semua JSON satu per satu kecuali benar-benar diperlukan.
- Semua file JSON yang akan diakses dari browser harus berada di `public/assets/` atau di-copy ke `dist/assets/` saat build (lihat plugin `serveSelkomAssets` di `vite.config.ts`).
- **Hindari** fetch yang berulang untuk data yang sama dalam satu sesi. Gunakan in-memory cache (Map/object) di dalam hook atau service.

### Strategi Prioritas Akses Data

1. Cek in-memory cache terlebih dahulu.
2. Jika tidak ada, fetch dari URL lokal (`/assets/selkom/...`).
3. Simpan hasil di in-memory cache dengan key = path URL.
4. Jangan menyimpan ke `localStorage` untuk data besar (>50 KB per formasi) — gunakan hanya untuk preferensi user (tema, formasi terakhir).

---

## 2. Penempatan File JSON

```
src/
└── assets/
    └── selkom/                    <- Sumber asli JSON (source of truth)
        ├── select_formasi.json    <- Daftar semua jabatan
        ├── selector.json          <- Meta selector formasi + lokasi
        └── <kode>/                <- Satu folder per kode formasi (misal: 30140001)
            └── peserta.json       <- Data peserta formasi tersebut

public/
└── assets/
    ├── images/                    <- Gambar statis (logo, ilustrasi)
    │   └── logo-kemensos.png
    └── selkom/                    <- (di-generate saat build oleh vite plugin, jangan edit manual)

public/
└── search-index.json              <- Search index global (di-generate oleh scripts/)
```

### Aturan Penempatan

- **JSON data** (peserta, formasi, selector): selalu letakkan di `src/assets/selkom/` sebagai sumber asli.
  Vite plugin `serveSelkomAssets` akan serve file ini saat dev, dan meng-copy ke `dist/` saat build.
- **Jangan** menaruh file JSON besar langsung di `src/` root atau `components/`.
- **Jangan** import JSON langsung via `import data from './data.json'` jika ukurannya > 20 KB — gunakan `fetch()` agar tidak di-bundle ke JS utama.
- File konfigurasi kecil (< 5 KB) boleh di-import langsung jika memang statis dan tidak berubah per formasi.
- `search-index.json` di-generate oleh script `npm run build:index` dan diletakkan di `public/` — **jangan edit manual**.

---

## 3. UI Design — Desktop & Mobile Friendly

Project ini diakses oleh beragam device, dari HP murah hingga laptop kantor.
Semua tampilan harus berfungsi dengan baik di kedua kondisi.

### Breakpoints Standar

```
Mobile  : max-width: 480px
Tablet  : max-width: 768px
Desktop : min-width: 769px
```

### Aturan Layout

- Gunakan **CSS Flexbox** atau **CSS Grid** sebagai sistem layout utama. Hindari float.
- Semua layout harus **fluid** (menggunakan `%`, `fr`, `clamp()`, `min()`, `max()`) — hindari nilai px yang tidak responsif untuk lebar container.
- Header harus tetap terbaca di layar 320px (HP lama). Gunakan `flex-wrap: wrap` pada elemen header.
- Tabel data (`ResultsTable`) wajib memiliki `overflow-x: auto` di wrapper-nya agar bisa di-scroll horizontal di mobile.
- Tombol dan elemen interaktif harus memiliki `min-height: 44px` dan `min-width: 44px` (standar tap target mobile).
- Font size minimal **14px** untuk body text. Gunakan `clamp()` untuk judul agar scalable.
- Hindari `position: fixed` yang menghalangi konten di mobile (kecuali untuk header sticky yang sudah teruji).
- Semua form input, select, dan button harus terlihat penuh di layar mobile tanpa horizontal scroll.

### Aturan Visual

- Gunakan CSS custom properties (`--var`) untuk semua warna, spacing, radius, dan shadow — jangan hardcode nilai di tiap komponen.
- Mendukung **dark mode** via `data-theme="dark"` pada `<html>`. Semua token warna harus ada versi light dan dark-nya.
- Animasi/transisi harus menggunakan `prefers-reduced-motion` media query untuk aksesibilitas.
- Kontras warna minimal **4.5:1** antara teks dan background (WCAG AA).

---

## 4. Optimasi Penggunaan Memori Device

Aplikasi ini menangani 118.000+ data peserta. Manajemen memori sangat kritis.

### Aturan Memori

- **Jangan** muat semua data ke memori sekaligus. Gunakan paginasi di sisi client.
- Konstanta `ITEMS_PER_PAGE` harus dipatuhi — jangan render lebih dari jumlah yang ditentukan sekaligus.
- Hasil pencarian yang tidak terpakai harus di-clear saat user berpindah formasi atau melakukan pencarian baru.
- Gunakan **Web Worker** untuk operasi berat (parsing, filtering, searching) agar tidak memblokir main thread. Lihat folder `src/workers/`.
- Jika menggunakan Web Worker, gunakan `Transferable` objects (seperti `ArrayBuffer`) untuk transfer data besar, bukan `postMessage` biasa.
- Hindari membuat closure yang menyimpan referensi ke array data besar di dalam event handler yang tidak di-cleanup.
- React state yang menyimpan data besar (array peserta) harus di-clear dengan `setState([])` saat komponen unmount atau scope berubah.
- Gunakan `useMemo` dan `useCallback` dengan benar — hanya untuk kalkulasi mahal, jangan overuse karena memoization sendiri ada biaya memorinya.
- Hindari `useEffect` dengan dependency array yang tidak lengkap — ini menyebabkan stale closure yang bocorkan memori.

### Aturan Worker

- Semua file worker diletakkan di `src/workers/`.
- Worker hanya boleh diinstansiasi sekali (singleton per scope pencarian).
- Terminate worker dengan `.terminate()` saat komponen yang membutuhkannya unmount.

---

## 5. Reusable Component — Pola & Penempatan

### Struktur Folder Komponen

```
src/
└── components/
    ├── ui/              <- Komponen UI generik & reusable (Button, Badge, Spinner, Modal, dll)
    │   ├── Button.tsx
    │   ├── Badge.tsx
    │   ├── Spinner.tsx
    │   └── ...
    ├── layout/          <- Komponen layout (Header, Footer, Sidebar, PageWrapper)
    │   ├── AppHeader.tsx
    │   └── ...
    ├── search/          <- Komponen khusus fitur pencarian
    │   ├── SearchControls.tsx
    │   ├── FormasiSelector.tsx
    │   └── ...
    ├── results/         <- Komponen tampilan hasil
    │   ├── ResultsTable.tsx
    │   ├── Pagination.tsx
    │   └── SummaryCard.tsx
    └── index.ts         <- Re-export semua komponen (barrel file)
```

> **Catatan transisi**: Komponen yang saat ini ada di `src/components/` (flat) dapat di-refactor
> ke struktur subfolder di atas secara bertahap. Jangan pindahkan semua sekaligus tanpa update import.

### Aturan Reusability

- Komponen yang digunakan **lebih dari 1 tempat** HARUS dipindahkan ke `components/ui/` atau subfolder yang sesuai.
- Jangan duplikasi markup atau logic yang sama di dua komponen. Extract ke komponen baru atau hook.
- Komponen UI generik (Button, Badge, Input) harus **tidak bergantung** pada domain bisnis (tidak import hook `useSelkomSearch` dll).
- Komponen domain-spesifik (SearchControls, FormasiSelector, ResultsTable) boleh bergantung pada tipe dan hook domain.
- Setiap komponen harus memiliki **TypeScript interface** untuk props-nya yang didefinisikan di atas fungsi komponen.
- Hindari prop drilling lebih dari 2 level. Gunakan React Context atau lift state jika data perlu dibagikan jauh.
- Nama komponen harus **PascalCase** dan sesuai dengan nama file-nya.

### Konvensi Naming

| Jenis            | Contoh Nama          | Lokasi                        |
|------------------|----------------------|-------------------------------|
| UI Generik       | `Button`, `Badge`    | `components/ui/`              |
| Layout           | `AppHeader`          | `components/layout/`          |
| Fitur Pencarian  | `SearchControls`     | `components/search/`          |
| Fitur Hasil      | `ResultsTable`       | `components/results/`         |
| Hook             | `useSelkomSearch`    | `hooks/`                      |
| Worker           | `searchWorker`       | `workers/`                    |

---

## 6. Organisasi CSS — Pemisahan File

Jika CSS tumbuh besar (saat ini `App.css` sekitar 28 KB), wajib dipisah ke dalam folder `src/styles/`.

### Struktur Folder CSS

```
src/
└── styles/
    ├── base/
    │   ├── reset.css          <- CSS reset / normalize
    │   ├── typography.css     <- Font, ukuran teks, heading
    │   └── variables.css      <- CSS custom properties (--color-*, --spacing-*, dll)
    ├── layout/
    │   ├── app.css            <- Layout utama app (.app, .app-header, dll)
    │   └── grid.css           <- System grid & container
    ├── components/
    │   ├── button.css         <- Style untuk Button component
    │   ├── badge.css          <- Style untuk Badge
    │   ├── table.css          <- Style untuk ResultsTable
    │   ├── pagination.css     <- Style untuk Pagination
    │   ├── search.css         <- Style untuk SearchControls & FormasiSelector
    │   ├── summary-card.css   <- Style untuk SummaryCard
    │   └── theme-switch.css   <- Style untuk ThemeToggle
    ├── themes/
    │   ├── light.css          <- Token warna tema terang
    │   └── dark.css           <- Token warna tema gelap
    └── index.css              <- Entry point — import semua file di atas (urutan penting)
```

### Aturan CSS

- `variables.css` harus jadi file **pertama** yang di-import karena semua file lain bergantung padanya.
- Urutan import di `styles/index.css`: `variables` > `reset` > `typography` > `layout` > `components` > `themes`.
- **Jangan** menaruh style dalam `<style>` tag di dalam komponen React (inline style hanya untuk nilai dinamis yang tidak bisa di-CSS).
- Gunakan **BEM-lite naming**: `.block`, `.block__element`, `.block--modifier`. Contoh: `.search-controls`, `.search-controls__input`, `.search-controls--disabled`.
- Semua nilai warna, spacing, radius, shadow, dan font harus menggunakan **CSS custom properties** dari `variables.css`.
- Media queries responsif diletakkan di **bawah** definisi style default dalam file yang sama (mobile-first: default = mobile, lalu `@media (min-width: 769px)` untuk desktop).
- **Jangan** import file CSS dari dalam folder `styles/components/` secara langsung ke tiap komponen React — semua CSS di-import melalui `styles/index.css`.

---

## 7. Konstanta Teks UI — Pemusatan String

Semua teks yang tampil ke user HARUS didefinisikan di **`src/constants/strings.ts`**.
Tujuannya adalah konsistensi teks di seluruh aplikasi dan kemudahan perubahan wording tanpa harus cari satu per satu di tiap komponen.

### Aturan

- **Jangan** hardcode string UI (label, placeholder, pesan error, keterangan) langsung di komponen.
- Gunakan export konstanta dari `src/constants/strings.ts` — impor hanya grup yang dibutuhkan.
- Untuk teks dinamis (mengandung variabel), gunakan **template function** bukan template literal inline di komponen.
- Nama konstanta menggunakan **SCREAMING_SNAKE_CASE** untuk grup, **camelCase** untuk key di dalamnya.
- Teks untuk komponen yang sama dikelompokkan dalam satu objek konstanta.

```ts
// ✅ Benar — string dari constants
import { SEARCH, META } from '../../constants/strings'
<input placeholder={SEARCH.placeholderGlobal} />

// ❌ Salah — hardcode di komponen
<input placeholder="Cari nama atau nomor peserta di seluruh data Selkom…" />
```

### Struktur Grup di `strings.ts`

| Grup | Dipakai oleh |
|---|---|
| `APP` | Header, ThemeToggle |
| `FORMASI` | FormasiSelector |
| `SEARCH` | SearchControls |
| `META` | App.tsx (info di atas tabel) |
| `TABLE_HEADERS` | ResultsTable |
| `MOBILE` | ResultsTable (mobile card) |
| `EMPTY` | EmptyState |
| `STATUS` | StatusBadge, StatusLegend |
| `PAGINATION` | Pagination |
| `SUMMARY` | SummaryCard |

---

## 8. Empty State — Panduan Visual Saat Tabel Kosong

Aplikasi ini **tidak menampilkan data secara otomatis** saat pertama dibuka (demi efisiensi bandwidth).
Karena itu, kondisi kosong harus **menginformasikan** user tentang cara menggunakan aplikasi, bukan hanya tampil putih/kosong.

### Aturan

- Gunakan komponen `EmptyState` (`src/components/ui/EmptyState.tsx`) untuk semua kondisi tabel kosong.
- Pilih `variant` yang sesuai dengan konteks — jangan buat kondisi kosong ad-hoc langsung di komponen tabel.
- Gunakan helper `resolveEmptyVariant()` dari `EmptyState.tsx` untuk menentukan variant yang tepat.
- Teks untuk setiap variant didefinisikan di `src/constants/strings.ts` dalam grup `EMPTY`.
- **Jangan** render `<table>` jika belum ada data — gunakan EmptyState sebagai pengganti tabel.

### Variant yang Tersedia

| Variant | Kondisi | Pesan |
|---|---|---|
| `loading` | Data sedang di-fetch | Indikator loading |
| `global-idle` | Mode global, belum ada query | Panduan ketik nama/nomor |
| `formasi-idle` | Mode formasi, belum pilih jabatan/lokasi | Langkah 1–4 panduan penggunaan |
| `not-found` | Ada query tapi tidak ada hasil | Info tidak ditemukan + tips |
| `no-data` | Formasi dipilih tapi data kosong | Info data tidak tersedia |

## 9. Anti "AI Slop" — Desain Bersih, Bebas Emoji Berlebih & Subtitle Klise

Aplikasi ini adalah utilitas publik untuk pencarian pengumuman. Antarmuka harus tampak profesional, kredibel, rapi, dan bebas dari ornamen generik buatan AI ("AI slop").

### Aturan Visual & Konten

- **Dilarang keras menggunakan emoji berlebih** (seperti 🚀, ⚡, 🔍, 🎯, 📊, 📱, 🌓, ⏳, 👨‍💻, 🏛️, ⚙️, dll.) pada judul, heading, kartu fitur, empty state, badge, atau teks UI. Gunakan tipografi bersih atau ikon SVG fungsional jika memang diperlukan.
- **Hapus subtitle dan tagline klise**: Hindari teks basa-basi khas AI seperti *"Membangun perangkat lunak yang andal dan berdampak bagi masyarakat"*, *"Fitur-fitur utama yang siap membantu pencarian Anda"*, atau *"Rangkuman kemampuan aplikasi dalam bahasa yang mudah dipahami"*. Teks harus padat, lugas, fungsional, dan to the point.
- **Wajib Disclaimer Situs Bukan Resmi**: Karena aplikasi ini menggunakan data seleksi ASN/PPPK Kemensos RI, aplikasi **wajib secara konsisten dan jelas** menampilkan disclaimer bahwa:
  > *"Aplikasi ini bukan website resmi. Seluruh data bersumber dari pengumuman resmi di https://sekolahrakyat.kemensos.go.id/pengumuman"*
  Disclaimer ini harus hadir di Footer dan dapat diakses dengan tautan langsung ke situs resmi tersebut.

---

## 10. Anti-Patterns yang Dilarang

- Jangan gunakan emoji dekoratif atau teks basa-basi klise gaya AI ("AI slop") di antarmuka pengguna.
- Jangan menyamarkan aplikasi seolah-olah situs resmi pemerintah tanpa menyertakan disclaimer dan sumber resmi.
- Jangan fetch semua formasi sekaligus saat aplikasi pertama kali load.
- Jangan menaruh logika bisnis (filter, sort, search) langsung di komponen — gunakan hook atau worker.
- Jangan gunakan `any` di TypeScript kecuali benar-benar tidak ada solusi lain — beri komentar penjelasan.
- Jangan hardcode URL produksi atau path absolut di dalam kode. Gunakan path relatif atau env variable.
- Jangan hapus atau ubah file JSON di `src/assets/selkom/` secara manual — data ini di-generate oleh script.
- Jangan commit folder `dist/` ke repository. File ini di-generate oleh Vercel saat deploy.
- Jangan import komponen dari path yang melewati parent folder (`../../`) lebih dari 2 level. Gunakan alias `@/` jika perlu.
- Jangan membuat komponen baru jika sudah ada komponen yang bisa di-reuse dengan props.
- **Jangan** hardcode teks UI di komponen — semua string harus dari `src/constants/strings.ts`.
- **Jangan** tampilkan tabel kosong tanpa komponen `EmptyState` — selalu berikan panduan visual kepada user.

---

## 11. Referensi File Penting

| File / Folder | Peran |
|---|---|
| `vite.config.ts` | Plugin serve JSON lokal, copy ke dist |
| `vercel.json` | Header cache untuk assets di Vercel |
| `src/hooks/useSelkomSearch.ts` | Hook utama pencarian & state management |
| `src/workers/` | Web Worker untuk proses data berat |
| `src/assets/selkom/selector.json` | Meta formasi (jabatan + lokasi) |
| `src/assets/selkom/select_formasi.json` | Daftar semua opsi jabatan |
| `scripts/generate_search_index.mjs` | Generator search index global |
| `src/constants/strings.ts` | **Semua teks UI terpusat** |
| `src/config/version.ts` | **Pusat versi aplikasi tunggal** (`APP_VERSION`, `APP_LAST_UPDATED`) |
| `src/config/changelog.ts` | **Konfigurasi riwayat rilis & catatan pembaruan** |
| `src/components/ui/EmptyState.tsx` | Komponen empty state informatif |
| `src/styles/` | Folder CSS (dipisah per komponen) |
| `src/components/ui/` | Komponen UI generik & reusable |
| `src/components/layout/` | Komponen layout (Header, ThemeToggle) |
| `src/components/search/` | Komponen fitur pencarian |
| `src/components/results/` | Komponen tampilan hasil |

---

## 12. Aturan Penambahan Versi & Catatan Pembaruan (Changelog)

Aplikasi memiliki sistem pencatatan versi terpusat yang tampil di header, footer, modal pembaruan, dan halaman tentang pengembang.

### Lokasi File Terkait

- `src/config/version.ts`: Sumber kebenaran tunggal (*single source of truth*) untuk `APP_VERSION` dan `APP_LAST_UPDATED`.
- `src/config/changelog.ts`: Konfigurasi riwayat rilis dan daftar catatan publik (`publicNotes`) yang tampil di UI modal.

### Aturan Penambahan Versi

1. **Pembaruan di Hari yang Sama**:
   - Jika perubahan atau penambahan fitur dilakukan pada **tanggal/hari yang sama** dengan tanggal versi aktif saat ini (`APP_LAST_UPDATED`), **jangan** menaikkan nomor versi.
   - Tambahkan item pembaruan baru langsung ke dalam array `publicNotes` pada rilis versi teratas di `src/config/changelog.ts`.
   - Perbarui ringkasan `summary` pada rilis aktif tersebut agar mencakup rangkuman pembaruan terkini.

2. **Pembaruan di Hari yang Berbeda**:
   - Jika perubahan dilakukan pada **hari/tanggal baru**:
     1. Naikkan nomor versi (misal: `V1.1.0` -> `V1.1.1` untuk perbaikan/penyempurnaan tampilan, atau `V1.2.0` untuk fitur data baru) dan perbarui tanggal di `src/config/version.ts`.
     2. Buat objek rilis baru di indeks pertama (`[0]`) array `APP_CHANGELOG` di `src/config/changelog.ts`.
     3. Set `isLatest: true` pada rilis baru, dan ubah rilis sebelumnya menjadi `isLatest: false`.

3. **Gaya Penulisan Catatan Publik (`publicNotes`)**:
   - Tulis dalam bahasa Indonesia yang **umum, ringkas, padat, dan jelas** bagi masyarakat pengguna (hindari istilah internal/teknis yang berbelit-belit).
   - Patuhi aturan **Anti "AI Slop"** (Bagian 9): dilarang keras menggunakan emoji dekoratif atau kalimat basa-basi klise.
   - Gunakan tipe yang sesuai: `'feat'` (Fitur Baru), `'improve'` (Peningkatan/Penyempurnaan), `'fix'` (Perbaikan), atau `'security'` (Keamanan).
