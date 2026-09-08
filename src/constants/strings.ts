/* ============================================================
   strings.ts — Konstanta Teks UI
   Sekolah Rakyat 2026 Pengumuman

   ATURAN:
   - Semua teks yang tampil ke user HARUS didefinisikan di sini.
   - Jangan hardcode string UI langsung di komponen.
   - Gunakan template function untuk teks dinamis.
   - Kelompokkan berdasarkan fitur/komponen.
   ============================================================ */

/* ── App / Header ─────────────────────────────────────────── */
export const APP = {
  title: 'Pengumuman Seleksi Kompetensi',
  subtitle: 'Sekolah Rakyat 2026',
  disclaimer: 'Bukan website resmi.',
  sourceUrl: 'https://sekolahrakyat.kemensos.go.id/pengumuman',
  sourceButtonText: 'Sumber referensi',
  logoAlt: 'Logo Kementerian Sosial',
  themeLight: 'Mode terang',
  themeDark: 'Mode gelap',
  themeLightTitle: 'Beralih ke mode terang',
  themeDarkTitle: 'Beralih ke mode gelap',
} as const

/* ── Formasi Selector ─────────────────────────────────────── */
export const FORMASI = {
  sectionLabel: 'Filter Formasi',
  kategoriAria: 'Kategori formasi',
  tabGuru: 'PPPK Guru',
  tabTeknis: 'PPPK Teknis',
  jabatanLabel: 'Jabatan',
  lokasiLabel: 'Lokasi',
  jabatanPlaceholder: 'Pilih jabatan...',
  lokasiPlaceholder: 'Pilih lokasi...',
  lokasiWaitJabatan: 'Pilih jabatan terlebih dahulu',
  lokasiEmpty: 'Lokasi tidak tersedia',
  jabatanEmpty: 'Jabatan tidak tersedia',
  searchJabatanPlaceholder: 'Cari jabatan...',
  searchLokasiPlaceholder: 'Cari lokasi...',
  searchEmpty: 'Tidak ada hasil',
  clearSelection: 'Hapus pilihan',
} as const

/* ── Search Controls ──────────────────────────────────────── */
export const SEARCH = {
  checkboxLabel: 'Hanya formasi terpilih',
  inputLabelGlobal: 'Cari Peserta',
  inputLabelFormasi: 'Cari di Formasi Ini',
  placeholderGlobal: 'Nama atau nomor peserta...',
  placeholderFormasi: 'Nama atau no. peserta...',
  btnCari: 'Cari',
  btnClear: 'Reset',
  btnClearAria: 'Hapus kata kunci',
  inputAria: 'Kolom pencarian peserta',
  btnCariDisabledHint: 'Pilih jabatan dan lokasi terlebih dahulu',
  hintGlobal: 'Pencarian di seluruh data peserta.',
  hintFormasiReady: 'Pencarian pada formasi yang dipilih.',
  hintFormasiNotReady: 'Pilih jabatan dan lokasi sebelum mencari.',
} as const

/* ── Meta Info (di bawah search, di atas tabel) ─────────────  */
export const META = {
  loading: (progress?: string) => progress || 'Memuat data...',
  resultGlobal: (total: number, query: string) =>
    `${total.toLocaleString('id-ID')} hasil untuk "${query}"`,
  resultFormasi: (total: number, query: string) =>
    `${total.toLocaleString('id-ID')} hasil untuk "${query}"`,
  globalIdle: 'Ketik nama atau nomor peserta untuk mencari',
  formasiTotal: (total: number) => `Total ${total.toLocaleString('id-ID')} peserta`,
  formasiIdle: 'Pilih jabatan dan lokasi formasi',
  pageInfo: (current: number, total: number) => `Hal. ${current} dari ${total}`,
} as const

/* ── Table Headers ────────────────────────────────────────── */
export const TABLE_HEADERS = {
  no: 'No',
  nomorPeserta: 'No. Peserta',
  nama: 'Nama',
  jabatanLokasi: 'Jabatan & Lokasi',
  teknis: 'Teknis',
  manajerial: 'Manajerial',
  sosialKultural: 'Sos. Kultural',
  wawancara: 'Wawancara',
  total: 'Total',
  status: 'Status',
  sortHint: (col: string) => `Urutkan ${col}`,
} as const

/* ── Table Mobile Labels ──────────────────────────────────── */
export const MOBILE = {
  totalSkorLabel: 'Total Skor',
  rankLabel: (no: number | string) => `#${no}`,
  sortBy: 'Urutkan:',
  sortDefault: 'No / Peringkat',
} as const

/* ── Empty States ─────────────────────────────────────────── */
export const EMPTY = {
  /* Saat data sedang diproses */
  loading: {
    title: 'Memuat data',
    desc: 'Mohon tunggu sebentar...',
  },

  /* Mode global: user belum mengetik */
  globalIdle: {
    title: 'Pencarian Peserta',
    desc: 'Ketik nama lengkap atau nomor peserta pada kolom pencarian di atas.',
    hint: 'Bisa menggunakan nama peserta atau minimal 5 digit nomor peserta.',
  },

  /* Mode formasi: jabatan/lokasi belum dipilih */
  formasiIdle: {
    title: 'Pilih Formasi',
    stepsLabel: 'Langkah memilih formasi',
    descSteps: [
      'Pilih kategori (Guru / Teknis)',
      'Pilih Jabatan',
      'Pilih Lokasi',
    ],
    altHint: 'Atau hilangkan centang untuk mencari di semua formasi.',
  },

  /* Pencarian tidak menemukan hasil */
  notFound: (query: string) => ({
    title: 'Tidak Ditemukan',
    desc: `Tidak ada data yang cocok dengan "${query}".`,
    hint: 'Pastikan ejaan nama atau nomor peserta sudah sesuai.',
  }),

  /* Formasi dipilih tapi data kosong */
  noData: {
    title: 'Data Belum Tersedia',
    desc: 'Belum ada data peserta untuk formasi yang dipilih.',
  },
} as const

/* ── Status Badge & Legend ────────────────────────────────── */
export const STATUS = {
  legend: {
    title: 'Keterangan Status:',
    items: [
      { code: 'P/L', desc: 'Lulus & berhak ikut SKT', lulus: true },
      { code: 'P', desc: 'Memenuhi nilai ambang batas', lulus: true },
      { code: 'TH', desc: 'Tidak hadir', lulus: false },
      { code: 'TMS', desc: 'Tidak memenuhi syarat', lulus: false },
      { code: 'APS', desc: 'Mengundurkan diri', lulus: false },
    ],
  },
  scrollTopLabel: 'Ke atas',
} as const

/* ── Pagination ───────────────────────────────────────────── */
export const PAGINATION = {
  navLabel: 'Navigasi halaman',
  showing: (from: number, to: number, total: number, isSearch: boolean) =>
    `Menampilkan ${from}–${to} dari ${total.toLocaleString('id-ID')} ${isSearch ? 'hasil' : 'peserta'}`,
  first: 'Pertama',
  prev: 'Sebelumnya',
  next: 'Berikutnya',
  last: 'Terakhir',
  pageLabel: (n: number) => `Hal. ${n}`,
  itemTypeResult: 'hasil',
  itemTypePeserta: 'peserta',
} as const

/* ── Summary Card ─────────────────────────────────────────── */
export const SUMMARY = {
  title: 'Ringkasan Formasi',
  regionLabel: 'Ringkasan formasi',
  formasi: 'Formasi',
  peserta: 'Peserta',
  kelulusan: 'Lulus',
  kehadiran: 'Kehadiran',
  nilaiTertinggi: 'Nilai Tertinggi',
  nilaiTerendah: 'Nilai Terendah',
} as const

/* ── Searchable Select Dropdown ────────────────────────────── */
export const SELECT = {
  searchPlaceholder: 'Cari opsi...',
  emptyMessage: 'Tidak ada data',
  clearLabel: 'Hapus pilihan',
  searchClearLabel: 'Hapus pencarian',
} as const

/* ── Data Fetch / Progress Status ─────────────────────────── */
export const DATA_PROGRESS = {
  loading: 'Memuat data...',
  loaded: (count: number) => `${count.toLocaleString('id-ID')} peserta dimuat`,
  noData: 'Data tidak tersedia',
  error: 'Gagal memuat data',
} as const

/* ── Rekapitulasi Statistik PPPK Guru & Teknis ────────────── */
export const REKAP = {
  title: 'Rekapitulasi Formasi & Peserta',
  subtitle: 'PPPK Guru & PPPK Teknis 2026',
  toggleAria: 'Buka atau tutup rekapitulasi statistik',
  preview: (peserta: number, jabatan: number) =>
    `${peserta.toLocaleString('id-ID')} Peserta · ${jabatan} Jabatan`,
  badgeCollapse: 'Sembunyikan',
  badgeExpand: 'Lihat Detail',
  colIndikator: 'Indikator / Metrik',
  colGuru: 'PPPK Guru',
  colTeknis: 'PPPK Teknis',
  colTotal: 'Total Keseluruhan',
  mobileColGuru: 'Guru',
  mobileColTeknis: 'Teknis',
  mobileColTotal: 'Total',
  catFormasi: 'Formasi & Penempatan',
  catPeserta: 'Data Peserta & Kelulusan',
  metricJabatan: 'Jumlah Jabatan',
  metricLokasi: 'Jumlah Lokasi',
  metricTerdaftar: 'Jumlah Peserta Terdaftar',
  metricPL: 'Jumlah PPPK P/L',
  metricP: 'Jumlah PPPK P',
  metricTH: 'Jumlah PPPK TH',
  metricTMS: 'Jumlah PPPK TMS',
  metricAPS: 'Jumlah PPPK APS',
  footerNote: '* Data bersumber dari seluruh pengumuman resmi Seleksi Kompetensi Sekolah Rakyat 2026.',
} as const

import { APP_VERSION as CONFIG_APP_VERSION, APP_LAST_UPDATED } from '../config/version'

/* ── App Versioning ───────────────────────────────────────── */
export const APP_VERSION = {
  version: CONFIG_APP_VERSION,
  releaseDate: APP_LAST_UPDATED,
  badge: `${CONFIG_APP_VERSION} · ${APP_LAST_UPDATED}`,
  fullBadge: `Versi ${CONFIG_APP_VERSION} · Rilis ${APP_LAST_UPDATED}`,
} as const

/* ── Header Navigation ────────────────────────────────────── */
export const NAV = {
  searchTab: 'Pencarian',
  searchTabAria: 'Buka halaman pencarian pengumuman peserta',
  aboutTab: 'Tentang Pengembang',
  aboutTabAria: 'Buka halaman tentang profil pengembang',
} as const

/* ── Developer Info & Contacts ────────────────────────────── */
export const DEVELOPER_INFO = {
  NAME: 'Mohammad Toriq',
  ROLE: 'Software Engineer (10 Tahun Pengalaman)',
  BIO: 'Halo rekan-rekan peserta! Saya Mohammad Toriq, software engineer dengan pengalaman lebih dari satu dekade. Inisiatif portal ini saya kembangkan secara mandiri agar seluruh peserta Seleksi Kompetensi Sekolah Rakyat 2026 dapat mengakses dan mencari hasil ujian dengan cepat, akurat, dan hemat kuota data.',
  EMAIL: 'mohammad.toriq03@gmail.com',
  AVATAR_INITIALS: 'MT',
  AVATAR_STATUS_TITLE: 'Aktif Mengembangkan Portal',

  // Portofolio
  PORTFOLIO_URL: 'https://mohammadtoriq.netlify.app/',
  PORTFOLIO_DISPLAY: 'mohammadtoriq.netlify.app',

  // Threads
  THREADS_URL: 'https://www.threads.net/@mohammadtoriq',
  THREADS_DISPLAY: '@mohammadtoriq',

  // GitHub Profile
  GITHUB_URL: 'https://github.com/ryuuken03',
  GITHUB_DISPLAY: 'github.com/ryuuken03',

  // WhatsApp
  WA_PHONE: '6285168626313',
  WA_DISPLAY: '+62 851-6862-6313',
  WA_CHAT_URL: 'https://wa.me/6285168626313?text=Halo%20Mas%20Mohammad%20Toriq%2C%20saya%20ingin%20berdiskusi%20mengenai%20portal%20Sekolah%20Rakyat%202026',
} as const

/* ── About Page ───────────────────────────────────────────── */
export const ABOUT = {
  backToSearch: '← Kembali ke Pencarian',
  backToSearchAria: 'Kembali ke halaman utama pencarian',
  badgeExperience: '10 Tahun Pengalaman',
  title: 'Tentang Pengembang',
  subtitle: 'Pengembang Perangkat Lunak',
  
  bioSectionTitle: 'Latar Belakang & Pengalaman',
  bioParagraph1: 'Sebagai software engineer dengan pengalaman lebih dari 10 tahun, fokus utama saya mencakup arsitektur sistem performa tinggi, efisiensi pemrosesan data bervolume besar, serta antarmuka web modern yang cepat dan aksesibel.',
  bioParagraph2: 'Aplikasi pencarian hasil Seleksi Kompetensi Sekolah Rakyat 2026 ini dikembangkan secara independen untuk mempermudah para peserta memeriksa nilai dan status kelulusan mereka tanpa terkendala beban server serta hemat penggunaan kuota data.',

  contactsTitle: 'Kontak & Tautan Resmi Pengembang',
  contactsSubtitle: 'Terhubung langsung dengan pengembang melalui kanal resmi berikut:',
  btnCopy: 'Salin',
  btnCopied: 'Tersalin',
  labelWhatsApp: 'WhatsApp',
  labelPortfolio: 'Portofolio',
  labelThreads: 'Threads',
  labelGithub: 'GitHub',
  btnChatWa: 'Chat WA',
  btnVisit: 'Kunjungi',
  btnFollow: 'Ikuti',
  btnGithub: 'Kunjungi',
  titleWaChat: 'Kirim Pesan WhatsApp ke Mohammad Toriq',
  titlePortfolio: 'Kunjungi Website Portofolio Mohammad Toriq',
  titleThreads: 'Buka Profil Threads @mohammadtoriq',
  titleGithub: 'Buka Profil GitHub ryuuken03',
  copyWaAria: 'Salin Nomor WhatsApp',
  copyPortfolioAria: 'Salin Tautan Portofolio',
  copyThreadsAria: 'Salin Tautan Threads',
  copyGithubAria: 'Salin Tautan GitHub',
  copySuccess: (label: string) => `${label} berhasil disalin ke clipboard!`,
  copyFailed: (label: string) => `Gagal menyalin ${label}`,

  disclaimerTitle: 'Pernyataan Sumber Data (Disclaimer)',
  disclaimerText: 'Aplikasi ini bukan website resmi pemerintah. Seluruh data pengumuman bersumber dari laman resmi Kementerian Sosial RI.',
  disclaimerUrl: 'https://sekolahrakyat.kemensos.go.id/pengumuman',
  sourceButtonText: 'Sumber referensi',

  stats: [
    { value: '10+', label: 'Tahun Pengalaman' },
    { value: '118K+', label: 'Data Peserta Diolah' },
    { value: '100%', label: 'Inisiatif Independen' },
    { value: '< 1 dtk', label: 'Waktu Temu Balik' },
  ],

  pillarsTitle: 'Prinsip Rekayasa Perangkat Lunak',
  pillars: [
    {
      title: 'Performa & Kecepatan',
      desc: 'Optimasi kompresi data dan Web Worker agar pencarian berlangsung instan tanpa jeda.',
    },
    {
      title: 'Desain Responsif',
      desc: 'Tata letak disesuaikan untuk kenyamanan akses pada perangkat seluler maupun desktop.',
    },
    {
      title: 'Efisiensi Kuota & Caching',
      desc: 'Mekanisme cache lokal agar perangkat tidak mengunduh data yang sama berulang kali.',
    },
    {
      title: 'Akurasi Dokumen Resmi',
      desc: 'Menampilkan data apa adanya sesuai dokumen pengumuman resmi.',
    },
  ],

  techStackTitle: 'Teknologi Aplikasi',
  techItems: [
    { name: 'React 19 & TypeScript', desc: 'Komponen modular dengan validasi tipe data statis' },
    { name: 'Vite & Vanilla CSS Variables', desc: 'Waktu muat cepat dengan tema terang dan gelap native' },
    { name: 'Web Workers API', desc: 'Pemrosesan 118.000+ data di thread latar belakang' },
    { name: 'On-Demand Local Caching', desc: 'Pengambilan data per formasi untuk menghemat bandwidth' },
  ],

  versionCardTitle: 'Status Versi Aplikasi',
  versionLabel: 'Versi Saat Ini:',
  versionBtnText: 'Catatan Pembaruan',
  versionBtnAria: 'Buka jendela informasi fitur dan pembaruan aplikasi',
} as const

/* ── Footer ───────────────────────────────────────────────── */
export const FOOTER = {
  disclaimerText: 'Aplikasi ini bukan website resmi.',
  sourceUrl: 'https://sekolahrakyat.kemensos.go.id/pengumuman',
  sourceButtonText: 'Sumber referensi',
  copyright: '© 2026 Inisiatif Independen Pengumuman Seleksi Kompetensi.',
  navSearch: 'Pencarian Peserta',
  navAbout: 'Tentang Pengembang',
  versionTooltip: 'Catatan pembaruan versi',
} as const




