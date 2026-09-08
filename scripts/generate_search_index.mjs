import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// Hapus file PDF besar saat build di Vercel untuk menjaga efisiensi penyimpanan & bandwidth
if (process.env.VERCEL) {
  console.log('[Vercel Build] Mendeteksi lingkungan Vercel. Memeriksa & membersihkan file PDF pengumuman...')
  const pdfFiles = [
    path.join(projectRoot, 'src', 'assets', 'selkom', 'pengumuman_selkom.pdf'),
    path.join(projectRoot, 'src', 'assets', 'skt', 'pengumuman_skt.pdf')
  ]
  for (const pdfPath of pdfFiles) {
    if (fs.existsSync(pdfPath)) {
      try {
        fs.unlinkSync(pdfPath)
        console.log(`[Vercel Build] Berhasil menghapus: ${path.basename(pdfPath)}`)
      } catch (err) {
        console.warn(`[Vercel Build] Gagal menghapus ${path.basename(pdfPath)}: ${err.message}`)
      }
    }
  }
}

function isGuruJabatan(kode, label = '') {
  return kode.startsWith('JF') || /guru/i.test(label)
}
function isPusdikLokasi(label = '') {
  return /pusat pendidikan/i.test(label)
}

function findDataFiles(dir) {
  let results = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) {
      results = results.concat(findDataFiles(fullPath))
    } else if (file === 'data.json') {
      results.push(fullPath)
    }
  }
  return results
}

function generateIndexFor(sourceName) {
  console.log(`\n--- Generating index for: ${sourceName} ---`)
  const srcSourceDir = path.join(projectRoot, 'src', 'assets', sourceName)
  const publicSourceDir = path.join(projectRoot, 'public', 'assets', sourceName)

  if (!fs.existsSync(srcSourceDir)) {
    console.log(`Directory ${srcSourceDir} does not exist, skipping...`)
    return
  }

  // 1. Read select_formasi.json
  const selectFormasiPath = path.join(srcSourceDir, 'select_formasi.json')
  let selectFormasi = { 'Jabatan Formasi': [], 'Lokasi Formasi': [] }
  if (fs.existsSync(selectFormasiPath)) {
    selectFormasi = JSON.parse(fs.readFileSync(selectFormasiPath, 'utf8'))
  }

  const jKeys = (selectFormasi['Jabatan Formasi'] || []).map(item => item.kode)
  const jLabels = (selectFormasi['Jabatan Formasi'] || []).map(item => item.label)
  const jMap = (selectFormasi['Jabatan Formasi'] || []).map(item => [item.kode, item.label])
  const jIndexMap = new Map(jKeys.map((k, i) => [k, i]))

  const lKeys = (selectFormasi['Lokasi Formasi'] || []).map(item => item.kode)
  const lMap = (selectFormasi['Lokasi Formasi'] || []).map(item => [item.kode, item.label])
  const lIndexMap = new Map(lKeys.map((k, i) => [k, i]))

  const dataFiles = findDataFiles(srcSourceDir)
  console.log(`Found ${dataFiles.length} data.json files in ${sourceName}`)

  const allParticipants = []
  const statusSet = new Set()
  const rawRawParticipants = []
  const selectorMap = {}

  for (const filePath of dataFiles) {
    const rel = path.relative(srcSourceDir, filePath)
    const parts = rel.split(path.sep)
    if (parts.length < 3) continue
    const lokasiKode = parts[0]
    const jabatanKode = parts[1]

    if (!selectorMap[jabatanKode]) {
      selectorMap[jabatanKode] = []
    }
    if (!selectorMap[jabatanKode].includes(lokasiKode)) {
      selectorMap[jabatanKode].push(lokasiKode)
    }

    const jIdx = jIndexMap.has(jabatanKode) ? jIndexMap.get(jabatanKode) : -1
    const lIdx = lIndexMap.has(lokasiKode) ? lIndexMap.get(lokasiKode) : -1

    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      const json = JSON.parse(raw)
      const items = json.data || []
      for (const item of items) {
        const st = item.status || ''
        statusSet.add(st)
        rawRawParticipants.push({
          no: item.no ?? 0,
          nomor_peserta: item.nomor_peserta || '',
          nama: item.nama || '',
          teknis: item.teknis ?? null,
          manajerial: item.manajerial ?? null,
          sosial_kultural: item.sosial_kultural ?? null,
          wawancara: item.wawancara ?? null,
          total: item.total ?? null,
          status: st,
          lIdx,
          jIdx,
          // Extra SKT fields if present
          total_cat: item.total_cat ?? null,
          psikotes: item.psikotes ?? null,
          inggris: item.inggris ?? null,
          wawancara_skt: item.wawancara_skt ?? null,
          total_skt: item.total_skt ?? null
        })
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err.message)
    }
  }

  const statusList = Array.from(statusSet)
  const statusIndexMap = new Map(statusList.map((s, i) => [s, i]))

  for (const item of rawRawParticipants) {
    const sIdx = statusIndexMap.get(item.status)
    const tuple = [
      item.no,
      item.nomor_peserta,
      item.nama,
      item.teknis,
      item.manajerial,
      item.sosial_kultural,
      item.wawancara,
      item.total,
      sIdx,
      item.lIdx,
      item.jIdx
    ]

    // Only append extra SKT fields if current source is 'skt'
    if (sourceName === 'skt') {
      tuple.push(
        item.total_cat,
        item.psikotes,
        item.inggris,
        item.wawancara_skt,
        item.total_skt
      )
    }

    allParticipants.push(tuple)
  }

  console.log(`Total participants indexed in ${sourceName}: ${allParticipants.length}`)

  const compactOutputData = {
    j: jMap,
    l: lMap,
    s: statusList,
    d: allParticipants
  }

  if (!fs.existsSync(publicSourceDir)) {
    fs.mkdirSync(publicSourceDir, { recursive: true })
  }

  // Write compact global_search_index.json to public and src
  const publicIndexPath = path.join(publicSourceDir, 'global_search_index.json')
  const srcIndexPath = path.join(srcSourceDir, 'global_search_index.json')
  const indexStr = JSON.stringify(compactOutputData)

  fs.writeFileSync(publicIndexPath, indexStr, 'utf8')
  fs.writeFileSync(srcIndexPath, indexStr, 'utf8')
  console.log(`Successfully generated global_search_index.json in public & src (${(Buffer.byteLength(indexStr) / 1024 / 1024).toFixed(2)} MB)`)

  // Write selector.json
  const selectorStr = JSON.stringify(selectorMap)
  const publicSelectorPath = path.join(publicSourceDir, 'selector.json')
  const srcSelectorPath = path.join(srcSourceDir, 'selector.json')
  fs.writeFileSync(publicSelectorPath, selectorStr, 'utf8')
  fs.writeFileSync(srcSelectorPath, selectorStr, 'utf8')
  console.log(`Successfully synced selector.json in public & src (${(Buffer.byteLength(selectorStr) / 1024).toFixed(2)} KB)`)

  // Write rekap_stats.json
  let guruJabatanCount = 0
  let teknisJabatanCount = 0
  for (const item of (selectFormasi['Jabatan Formasi'] || [])) {
    if (isGuruJabatan(item.kode, item.label)) guruJabatanCount++
    else teknisJabatanCount++
  }

  let guruLokasiCount = 0
  let teknisLokasiCount = 0
  for (const item of (selectFormasi['Lokasi Formasi'] || [])) {
    if (!isPusdikLokasi(item.label)) guruLokasiCount++
    else teknisLokasiCount++
  }

  const rekap = {
    generatedAt: new Date().toISOString().slice(0, 10),
    guru: { jabatan: guruJabatanCount, lokasi: guruLokasiCount, terdaftar: 0, pl: 0, pl2: 0, p: 0, th: 0, tms: 0, aps: 0 },
    teknis: { jabatan: teknisJabatanCount, lokasi: teknisLokasiCount, terdaftar: 0, pl: 0, pl2: 0, p: 0, th: 0, tms: 0, aps: 0 },
    total: { jabatan: guruJabatanCount + teknisJabatanCount, lokasi: guruLokasiCount + teknisLokasiCount, terdaftar: 0, pl: 0, pl2: 0, p: 0, th: 0, tms: 0, aps: 0 }
  }

  for (const item of rawRawParticipants) {
    const jKode = jKeys[item.jIdx] || ''
    const jLabel = jLabels[item.jIdx] || ''
    const isGuru = isGuruJabatan(jKode, jLabel)
    const target = isGuru ? rekap.guru : rekap.teknis

    target.terdaftar++
    rekap.total.terdaftar++

    const st = (item.status || '').toUpperCase().trim()
    if (st === 'P/L') {
      target.pl++
      rekap.total.pl++
    } else if (st === 'P/L-2') {
      target.pl2++
      rekap.total.pl2++
    } else if (st === 'P') {
      target.p++
      rekap.total.p++
    } else if (st === 'TH') {
      target.th++
      rekap.total.th++
    } else if (st === 'TMS') {
      target.tms++
      rekap.total.tms++
    } else if (st === 'APS') {
      target.aps++
      rekap.total.aps++
    } else if (st.startsWith('P/L')) {
      target.pl++
      rekap.total.pl++
    }
  }

  const rekapStr = JSON.stringify(rekap, null, 2)
  const publicRekapPath = path.join(publicSourceDir, 'rekap_stats.json')
  const srcRekapPath = path.join(srcSourceDir, 'rekap_stats.json')

  fs.writeFileSync(publicRekapPath, rekapStr, 'utf8')
  fs.writeFileSync(srcRekapPath, rekapStr, 'utf8')
  console.log(`Successfully generated rekap_stats.json in public & src`)
}

console.log('Generating optimized global search indices and selector maps...')
generateIndexFor('selkom')
generateIndexFor('skt')
console.log('\nAll search indices generated successfully!')
