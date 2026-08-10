import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const selkomDir = path.join(projectRoot, 'src', 'assets', 'selkom')
const publicSelkomDir = path.join(projectRoot, 'public', 'assets', 'selkom')

console.log('Generating optimized global search index and selector map...')

// 1. Read select_formasi.json for maps
const selectFormasiPath = path.join(selkomDir, 'select_formasi.json')
let selectFormasi = { 'Jabatan Formasi': [], 'Lokasi Formasi': [] }
if (fs.existsSync(selectFormasiPath)) {
  selectFormasi = JSON.parse(fs.readFileSync(selectFormasiPath, 'utf8'))
}

const jKeys = (selectFormasi['Jabatan Formasi'] || []).map(item => item.kode)
const jLabels = (selectFormasi['Jabatan Formasi'] || []).map(item => item.label)
const jMap = (selectFormasi['Jabatan Formasi'] || []).map(item => [item.kode, item.label])
const jIndexMap = new Map(jKeys.map((k, i) => [k, i]))

const lKeys = (selectFormasi['Lokasi Formasi'] || []).map(item => item.kode)
const lLabels = (selectFormasi['Lokasi Formasi'] || []).map(item => item.label)
const lMap = (selectFormasi['Lokasi Formasi'] || []).map(item => [item.kode, item.label])
const lIndexMap = new Map(lKeys.map((k, i) => [k, i]))

// 2. Traversal function for data.json files
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

const dataFiles = findDataFiles(selkomDir)
console.log(`Found ${dataFiles.length} data.json files`)

const allParticipants = []
const statusSet = new Set()
const rawRawParticipants = []
const selectorMap = {}

for (const filePath of dataFiles) {
  // Extract lokasi_kode and jabatan_kode from path
  // path format: .../selkom/30140001/JF0000418-105/data.json
  const rel = path.relative(selkomDir, filePath)
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
        jIdx
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
  allParticipants.push([
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
  ])
}

console.log(`Total participants indexed: ${allParticipants.length}`)

const compactOutputData = {
  j: jMap,
  l: lMap,
  s: statusList,
  d: allParticipants
}

if (!fs.existsSync(publicSelkomDir)) {
  fs.mkdirSync(publicSelkomDir, { recursive: true })
}

// Write compact global_search_index.json
const indexPath = path.join(publicSelkomDir, 'global_search_index.json')
fs.writeFileSync(indexPath, JSON.stringify(compactOutputData), 'utf8')
const indexStats = fs.statSync(indexPath)
console.log(`Successfully generated global_search_index.json (${(indexStats.size / 1024 / 1024).toFixed(2)} MB)`)

// Write compact selector.json to public and src
const selectorStr = JSON.stringify(selectorMap)
const publicSelectorPath = path.join(publicSelkomDir, 'selector.json')
const srcSelectorPath = path.join(selkomDir, 'selector.json')

fs.writeFileSync(publicSelectorPath, selectorStr, 'utf8')
fs.writeFileSync(srcSelectorPath, selectorStr, 'utf8')

const selectorStats = fs.statSync(publicSelectorPath)
console.log(`Successfully generated selector.json (${(selectorStats.size / 1024).toFixed(2)} KB)`)
