/**
 * Sekolah Rakyat 2026 - Changelog & Release Notes Configuration
 * 
 * Aturan Tampilan:
 * - 'publicNotes': Catatan versi umum yang DITAMPILKAN di antarmuka pengguna (UI Modal & About).
 */

import { APP_VERSION, APP_LAST_UPDATED } from './version'

export interface PublicNote {
  type: 'feat' | 'improve' | 'fix' | 'security'
  label: string
  text: string
}

export interface ChangelogRelease {
  version: string
  date: string
  isLatest: boolean
  badge: string
  summary?: string
  publicNotes: PublicNote[]
}

export const APP_CHANGELOG: ChangelogRelease[] = [
  {
    version: APP_VERSION,
    date: APP_LAST_UPDATED,
    isLatest: true,
    badge: 'Rilis Fitur',
    summary: 'Dukungan penuh data Seleksi Kompetensi Tambahan (SKT) sebanyak 13.313 peserta, pemilih tahap seleksi CAT vs SKT, kolom rincian nilai integrasi, jadwal pelaksanaan, foto profil pengembang, serta optimasi antarmuka seluler.',
    publicNotes: [
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Dukungan dataset Seleksi Kompetensi Tambahan (SKT) mencakup 13.313 peserta berdasarkan pengumuman resmi.',
      },
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Komponen pemilih tahap seleksi (CAT dan SKT) dengan pemuatan data on-demand yang hemat kuota.',
      },
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Tampilan kolom nilai integrasi SKT (Psikotes, Bahasa Inggris, Wawancara SKT, Total SKT, dan Total Akhir).',
      },
      {
        type: 'improve',
        label: 'Peningkatan',
        text: 'Pemrosesan pencarian terintegrasi pada Web Worker untuk penyaringan cepat lintas dataset CAT maupun SKT.',
      },
      {
        type: 'improve',
        label: 'Peningkatan',
        text: 'Penyesuaian tata letak kartu seluler pada tabel hasil pencarian agar informasi jadwal dan nilai SKT mudah dibaca.',
      },
      {
        type: 'improve',
        label: 'Penyempurnaan',
        text: 'Pembaruan tautan referensi resmi pengumuman hasil integrasi seleksi pada header, footer, dan tentang pengembang.',
      },
      {
        type: 'improve',
        label: 'Peningkatan',
        text: 'Tombol catatan pembaruan responsif menjadi tombol ikon ringkas pada layar perangkat seluler.',
      },
      {
        type: 'improve',
        label: 'Penyempurnaan',
        text: 'Integrasi foto profil resmi pengembang dengan tata letak header seluler yang rapi dan proporsional.',
      },
    ],
  },
  {
    version: 'V1.0.1',
    date: '8 September 2026',
    isLatest: false,
    badge: 'Pembaruan Tampilan',
    summary: 'Profil pengembang & kartu kontak terverifikasi (WA, Portofolio, Threads @mohammadtoriq, GitHub), tombol sumber referensi resmi, pembersihan antarmuka dari emoji AI-slop, panel rekapitulasi statistik fleksibel, serta modal catatan pembaruan bertingkat.',
    publicNotes: [
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Halaman profil pengembang dengan dedikasi 10 tahun pengalaman di bidang rekayasa perangkat lunak.',
      },
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Kartu kontak resmi pengembang di halaman Tentang (WhatsApp, Web Portofolio, Threads @mohammadtoriq, dan GitHub) dengan fitur salin cepat.',
      },
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Panel rekapitulasi statistik formasi PPPK Guru & Teknis dengan tombol buka-tutup (expand/collapse).',
      },
      {
        type: 'improve',
        label: 'Penyempurnaan',
        text: 'Tombol tautan referensi resmi pengumuman seleksi Kementerian Sosial RI di header, footer, dan tentang pengembang.',
      },
      {
        type: 'improve',
        label: 'Peningkatan',
        text: 'Format modal Catatan Pembaruan yang diselaraskan dengan standar modular riwayat rilis bertingkat.',
      },
      {
        type: 'improve',
        label: 'Peningkatan',
        text: 'Penyempurnaan tampilan kartu hasil pencarian di layar HP agar ranking dan skor ujian lebih mudah dipindai.',
      },
      {
        type: 'improve',
        label: 'Peningkatan',
        text: 'Pembersihan antarmuka dari ornamen emoji berlebih dan teks klise guna menjaga kredibilitas dan profesionalitas.',
      },
      {
        type: 'improve',
        label: 'Peningkatan',
        text: 'Organisasi stylesheet CSS ke dalam folder terpisah (base, layout, components).',
      },
    ],
  },
  {
    version: 'V1.0.0',
    date: '7 September 2026',
    isLatest: false,
    badge: 'Fondasi Awal',
    summary: 'Peluncuran portal pencarian Seleksi Kompetensi Sekolah Rakyat 2026 dengan 118.000+ data peserta.',
    publicNotes: [
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Pencarian instan nama dan nomor peserta di antara 118.432 data seleksi menggunakan Web Worker.',
      },
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Filter formasi jabatan dan lokasi penempatan dengan pemanggilan data on-demand lokal.',
      },
      {
        type: 'feat',
        label: 'Fitur Baru',
        text: 'Dukungan mode gelap dan terang (Dark & Light Mode native).',
      },
    ],
  },
]

/**
 * Mengambil data pembaruan versi terbaru
 */
export const getLatestChangelog = () => APP_CHANGELOG[0] || null
