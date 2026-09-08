import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PDFParse } from 'pdf-parse'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const pdfPath = path.join(projectRoot, 'src', 'assets', 'skt', 'pengumuman_skt.pdf')
const sktDir = path.join(projectRoot, 'src', 'assets', 'skt')

function parseRekapPage(text) {
  const instansiMatch = text.match(/Instansi\s*:\s*(.*?)(?:\s+\d+)?(?:\r?\n|$)/)
  const jabatanMatch = text.match(/Jabatan Formasi\s*:\s*(.*?)(?:\s+\d+)?(?:\r?\n|$)/)
  const lokasiMatch = text.match(/Lokasi Formasi\s*:\s*(.*?)(?:\s+\d+)?(?:\r?\n|$)/)
  const jenisMatch = text.match(/Jenis Formasi\s*:\s*(.*?)(?:\s+\d+)?(?:\r?\n|$)/)

  const numbersMatch = text.match(/\(1\)\s*\(2\)\s*\(3\)\s*\(4\)\s*\(5\)\s*\(6\)\s*\(7\)\s*\(8\)\s*([\s\S]*?)(?:PANITIA|Halaman|$)/)

  if (!instansiMatch || !jabatanMatch || !lokasiMatch || !jenisMatch || !numbersMatch) {
    throw new Error('Gagal membaca header rekapitulasi: ' + text.slice(0, 300))
  }

  const numTokens = numbersMatch[1].trim().split(/\s+/)
  if (numTokens.length < 8) {
    throw new Error('Jumlah token angka pada rekapitulasi kurang: ' + numbersMatch[1].trim())
  }

  const jmlFormasi = parseInt(numTokens[0], 10)
  const jmlPeserta = parseInt(numTokens[1], 10)
  const hadir = parseInt(numTokens[2], 10)
  const tdkHadir = parseInt(numTokens[3], 10)
  const kelulusan = parseInt(numTokens[4], 10)
  const tertinggi = parseFloat(numTokens[6])
  const terendah = parseFloat(numTokens[7])

  const instansi = instansiMatch[1].replace(/\s+\d+$/, '').trim()
  const jabatanRaw = jabatanMatch[1].replace(/\s+\d+$/, '').trim()
  const lokasiRaw = lokasiMatch[1].replace(/\s+\d+$/, '').trim()
  const jenis = jenisMatch[1].replace(/\s+\d+$/, '').trim()

  const jabKodeMatch = jabatanRaw.match(/^([A-Z0-9]+(?:-[A-Z0-9]+)?)\s*-\s*(.*)$/)
  const lokKodeMatch = lokasiRaw.match(/^(\d{8})\s*-\s*(.*)$/)

  if (!jabKodeMatch) throw new Error('Format kode jabatan tidak dikenali: ' + jabatanRaw)
  if (!lokKodeMatch) throw new Error('Format kode lokasi tidak dikenali: ' + lokasiRaw)

  const kodeJabatan = jabKodeMatch[1]
  const namaJabatan = jabKodeMatch[2]
  const kodeLokasi = lokKodeMatch[1]
  const namaLokasi = lokKodeMatch[2]

  const isTeknis = text.includes('TENAGA TEKNIS') || kodeJabatan.startsWith('JP')

  return {
    instansi,
    jabatanRaw,
    lokasiRaw,
    kodeJabatan,
    namaJabatan,
    kodeLokasi,
    namaLokasi,
    jenis,
    jmlFormasi,
    jmlPeserta,
    kehadiran: `${hadir} hadir, ${tdkHadir} tidak hadir`,
    kelulusan,
    nilaiTertinggi: isNaN(tertinggi) ? 0 : tertinggi,
    nilaiTerendah: isNaN(terendah) ? 0 : terendah,
    isTeknis
  }
}

function isParticipantComplete(tokens, requiredScores) {
  if (tokens.length < requiredScores + 2) return false
  const last = tokens[tokens.length - 1]
  if (!(/[A-Z]/.test(last) && /^[A-Z0-9/-]+$/.test(last))) return false

  const scoreTokens = tokens.slice(tokens.length - 1 - requiredScores, tokens.length - 1)
  for (const s of scoreTokens) {
    if (!/^-?\d+(?:\.\d+)?$/.test(s)) return false
  }
  return true
}

function finalizePending(pending, participants, requiredScores, isTeknis) {
  const tokens = pending.tokens
  if (!isParticipantComplete(tokens, requiredScores)) {
    throw new Error('Data peserta tidak lengkap atau tidak valid: ' + JSON.stringify(pending))
  }

  const status = tokens[tokens.length - 1]
  const scoreTokens = tokens.slice(tokens.length - 1 - requiredScores, tokens.length - 1)
  const nameTokens = tokens.slice(0, tokens.length - 1 - requiredScores)
  const nama = nameTokens.join(' ')

  const scores = scoreTokens.map(s => parseFloat(s))

  if (isTeknis) {
    participants.push({
      no: pending.no,
      nomor_peserta: pending.nomor_peserta,
      nama,
      teknis: scores[0],
      manajerial: scores[1],
      sosial_kultural: scores[2],
      wawancara: scores[3],
      total_cat: scores[4],
      psikotes: scores[5],
      total: scores[6],
      status
    })
  } else {
    participants.push({
      no: pending.no,
      nomor_peserta: pending.nomor_peserta,
      nama,
      teknis: scores[0],
      manajerial: scores[1],
      sosial_kultural: scores[2],
      wawancara: scores[3],
      total_cat: scores[4],
      psikotes: scores[5],
      inggris: scores[6],
      wawancara_skt: scores[7],
      total_skt: scores[8],
      total: scores[9],
      status
    })
  }
}

function processPageLines(text, isTeknis, pendingState, participants) {
  const requiredScores = isTeknis ? 7 : 10
  const lines = text.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (
      line.startsWith('HASIL INTEGRASI') ||
      line.startsWith('PENGADAAN') ||
      line.startsWith('No ') ||
      line.startsWith('Seleksi') ||
      line.startsWith('Teknis') ||
      line.startsWith('Tambahan') ||
      line.startsWith('Total') ||
      line.startsWith('(1)') ||
      line.startsWith('PANITIA') ||
      line.startsWith('Halaman') ||
      line.startsWith('-- ') ||
      line === 'Tidak ada pendaftar'
    ) {
      continue
    }

    const startMatch = line.match(/^(\d+)\s+(\d{17})(?:\s+(.*))?$/)
    if (startMatch) {
      if (pendingState.current) {
        finalizePending(pendingState.current, participants, requiredScores, isTeknis)
        pendingState.current = null
      }
      pendingState.current = {
        no: parseInt(startMatch[1], 10),
        nomor_peserta: startMatch[2],
        tokens: startMatch[3] ? startMatch[3].trim().split(/\s+/) : []
      }
    } else if (pendingState.current) {
      const newTokens = line.split(/\s+/)
      pendingState.current.tokens.push(...newTokens)
    }

    if (pendingState.current && isParticipantComplete(pendingState.current.tokens, requiredScores)) {
      finalizePending(pendingState.current, participants, requiredScores, isTeknis)
      pendingState.current = null
    }
  }
}

async function runExtraction() {
  console.log('=== MULAI EKSTRAKSI DATA SKT ===')
  const startTime = Date.now()

  if (!fs.existsSync(pdfPath)) {
    console.error('File PDF tidak ditemukan:', pdfPath)
    process.exit(1)
  }

  console.log('Membaca file PDF:', pdfPath)
  const buffer = fs.readFileSync(pdfPath)
  console.log(`Ukuran file: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)

  const parser = new PDFParse({ data: buffer })
  const info = await parser.getInfo()
  const totalPages = info.total
  console.log('Total halaman PDF:', totalPages)

  const formations = []
  let currentFormation = null
  const pendingState = { current: null }

  const batchSize = 250
  for (let start = 4; start <= totalPages; start += batchSize) {
    const end = Math.min(start + batchSize - 1, totalPages)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    const res = await parser.getText({ partial: pages })

    for (const page of res.pages) {
      const text = page.text

      // Signature page check
      if (text.includes('Keterangan :') && text.includes('Kepala Badan Kepegawaian Negara')) {
        if (currentFormation && pendingState.current) {
          finalizePending(pendingState.current, currentFormation.participants, currentFormation.isTeknis ? 7 : 10, currentFormation.isTeknis)
          pendingState.current = null
        }
        continue
      }

      // Check if Rekapitulasi page
      if (text.includes('REKAPITULASI HASIL SELEKSI KOMPETENSI')) {
        // Finalize previous formation's pending participant if any
        if (currentFormation && pendingState.current) {
          finalizePending(pendingState.current, currentFormation.participants, currentFormation.isTeknis ? 7 : 10, currentFormation.isTeknis)
          pendingState.current = null
        }

        const rekap = parseRekapPage(text)
        currentFormation = {
          ...rekap,
          participants: [],
          pages: [page.num]
        }
        formations.push(currentFormation)
      } else if (currentFormation) {
        currentFormation.pages.push(page.num)
        processPageLines(text, currentFormation.isTeknis, pendingState, currentFormation.participants)
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    process.stdout.write(`Diproses s.d. halaman ${end}/${totalPages} (${formations.length} formasi) [${elapsed}s]\r`)
  }

  // Finalize last pending if any
  if (currentFormation && pendingState.current) {
    finalizePending(pendingState.current, currentFormation.participants, currentFormation.isTeknis ? 7 : 10, currentFormation.isTeknis)
    pendingState.current = null
  }

  console.log(`\nSelesai membaca seluruh halaman dalam ${((Date.now() - startTime) / 1000).toFixed(1)}s`)
  await parser.destroy()

  console.log(`\nMemvalidasi ${formations.length} formasi...`)
  let totalGuru = 0
  let totalTeknis = 0
  let totalPesertaAll = 0
  let validationErrors = 0

  for (const f of formations) {
    if (f.isTeknis) {
      totalTeknis += f.participants.length
    } else {
      totalGuru += f.participants.length
    }
    totalPesertaAll += f.participants.length

    if (f.participants.length !== f.jmlPeserta) {
      console.error(`[MISMATCH] Formasi ${f.kodeLokasi}/${f.kodeJabatan}: data peserta ${f.participants.length} != summary ${f.jmlPeserta}`)
      validationErrors++
    }
  }

  console.log(`Total Formasi Ditemukan: ${formations.length}`)
  console.log(`Peserta Guru: ${totalGuru} (Ekspektasi: 4120)`)
  console.log(`Peserta Teknis: ${totalTeknis} (Ekspektasi: 9193)`)
  console.log(`Total Peserta: ${totalPesertaAll} (Ekspektasi: 13313)`)

  if (validationErrors > 0) {
    console.error(`Ditemukan ${validationErrors} ketidaksesuaian jumlah peserta!`)
    process.exit(1)
  }

  console.log('Semua validasi kuantitas peserta 100% COCOK!')

  // Write folders and files
  console.log('\nMenulis file data.json dan summary.json ke disk...')
  const jabMap = new Map()
  const lokMap = new Map()
  const selectorMap = {}

  // Stats accumulators
  const stats = {
    guru: { jabatan: new Set(), lokasi: new Set(), terdaftar: 0, pl: 0, pl2: 0, p: 0, th: 0, tms: 0, aps: 0 },
    teknis: { jabatan: new Set(), lokasi: new Set(), terdaftar: 0, pl: 0, pl2: 0, p: 0, th: 0, tms: 0, aps: 0 },
    total: { jabatan: new Set(), lokasi: new Set(), terdaftar: 0, pl: 0, pl2: 0, p: 0, th: 0, tms: 0, aps: 0 }
  }

  for (const f of formations) {
    const targetDir = path.join(sktDir, f.kodeLokasi, f.kodeJabatan)
    fs.mkdirSync(targetDir, { recursive: true })

    // summary.json
    const summaryData = {
      Instansi: f.instansi,
      'Jabatan Formasi': f.jabatanRaw,
      'Lokasi Formasi': f.lokasiRaw,
      'Jenis Formasi': f.jenis,
      'Jumlah Formasi': f.jmlFormasi,
      'Jumlah Peserta': f.jmlPeserta,
      Kehadiran: f.kehadiran,
      Kelulusan: f.kelulusan,
      'Nilai Ujian': {
        tertinggi: f.nilaiTertinggi,
        terendah: f.nilaiTerendah
      }
    }
    fs.writeFileSync(path.join(targetDir, 'summary.json'), JSON.stringify(summaryData, null, 2), 'utf8')

    // data.json
    const dataJson = { data: f.participants }
    fs.writeFileSync(path.join(targetDir, 'data.json'), JSON.stringify(dataJson, null, 2), 'utf8')

    // Collect selector & select_formasi
    jabMap.set(f.kodeJabatan, f.namaJabatan)
    lokMap.set(f.kodeLokasi, f.namaLokasi)

    if (!selectorMap[f.kodeJabatan]) {
      selectorMap[f.kodeJabatan] = []
    }
    if (!selectorMap[f.kodeJabatan].includes(f.kodeLokasi)) {
      selectorMap[f.kodeJabatan].push(f.kodeLokasi)
    }

    // Collect stats
    const scope = f.isTeknis ? stats.teknis : stats.guru
    scope.jabatan.add(f.kodeJabatan)
    scope.lokasi.add(f.kodeLokasi)
    stats.total.jabatan.add(f.kodeJabatan)
    stats.total.lokasi.add(f.kodeLokasi)

    for (const p of f.participants) {
      scope.terdaftar++
      stats.total.terdaftar++

      const st = (p.status || '').toUpperCase().trim()
      if (st === 'P/L') {
        scope.pl++
        stats.total.pl++
      } else if (st === 'P/L-2') {
        scope.pl2++
        stats.total.pl2++
      } else if (st === 'P') {
        scope.p++
        stats.total.p++
      } else if (st === 'TH') {
        scope.th++
        stats.total.th++
      } else if (st === 'TMS') {
        scope.tms++
        stats.total.tms++
      } else if (st === 'APS') {
        scope.aps++
        stats.total.aps++
      } else if (st.startsWith('P/L')) {
        scope.pl++
        stats.total.pl++
      }
    }
  }

  // Sort selectorMap
  for (const jKode in selectorMap) {
    selectorMap[jKode].sort()
  }

  // select_formasi.json
  const sortedJabatan = Array.from(jabMap.entries())
    .map(([kode, label]) => ({ kode, label }))
    .sort((a, b) => a.kode.localeCompare(b.kode))

  const sortedLokasi = Array.from(lokMap.entries())
    .map(([kode, label]) => ({ kode, label }))
    .sort((a, b) => a.kode.localeCompare(b.kode))

  const selectFormasi = {
    'Jabatan Formasi': sortedJabatan,
    'Lokasi Formasi': sortedLokasi
  }

  fs.writeFileSync(path.join(sktDir, 'select_formasi.json'), JSON.stringify(selectFormasi, null, 2), 'utf8')
  console.log('Tersimpan: select_formasi.json')

  // selector.json
  fs.writeFileSync(path.join(sktDir, 'selector.json'), JSON.stringify(selectorMap), 'utf8')
  console.log('Tersimpan: selector.json')

  // rekap_stats.json
  const today = new Date().toISOString().split('T')[0]
  const rekapStats = {
    generatedAt: today,
    guru: {
      jabatan: stats.guru.jabatan.size,
      lokasi: stats.guru.lokasi.size,
      terdaftar: stats.guru.terdaftar,
      pl: stats.guru.pl,
      pl2: stats.guru.pl2,
      p: stats.guru.p,
      th: stats.guru.th,
      tms: stats.guru.tms,
      aps: stats.guru.aps
    },
    teknis: {
      jabatan: stats.teknis.jabatan.size,
      lokasi: stats.teknis.lokasi.size,
      terdaftar: stats.teknis.terdaftar,
      pl: stats.teknis.pl,
      pl2: stats.teknis.pl2,
      p: stats.teknis.p,
      th: stats.teknis.th,
      tms: stats.teknis.tms,
      aps: stats.teknis.aps
    },
    total: {
      jabatan: stats.total.jabatan.size,
      lokasi: stats.total.lokasi.size,
      terdaftar: stats.total.terdaftar,
      pl: stats.total.pl,
      pl2: stats.total.pl2,
      p: stats.total.p,
      th: stats.total.th,
      tms: stats.total.tms,
      aps: stats.total.aps
    }
  }

  fs.writeFileSync(path.join(sktDir, 'rekap_stats.json'), JSON.stringify(rekapStats, null, 2), 'utf8')
  console.log('Tersimpan: rekap_stats.json')

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n=== EKSTRAKSI SELESAI SUKSES DALAM ${totalTime}s ===`)
}

runExtraction().catch((err) => {
  console.error('\nERROR fatal:', err)
  process.exit(1)
})
