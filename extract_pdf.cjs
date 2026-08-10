/**
 * Full PDF Extractor - Sekolah Rakyat 2026
 * 
 * FIX v2:
 * - Halaman lanjutan (tanpa header HASIL INTEGRASI) ikut diparse
 * - Pattern data diperbaiki: skor bisa 0, status tambah TH
 * - Akumulasi data antar-halaman dalam satu section tetap benar
 */

const fs   = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// ── CONFIG ────────────────────────────────────────────────────────────────────
const PDF_PATH   = path.resolve('./src/assets/selkom/pengumuman_selkom.pdf');
const BASE_DIR   = path.resolve('./src/assets/selkom');
const SELECTOR   = path.join(BASE_DIR, 'selector.json');
const START_PAGE = 4;
const BATCH_SIZE = 50;

// ── REGEX PATTERNS ────────────────────────────────────────────────────────────
const RE_REKAP = /REKAPITULASI HASIL SELEKSI KOMPETENSI/;
const RE_HASIL = /HASIL INTEGRASI SELEKSI KOMPETENSI/;

// Data row pattern:
// - no: integer
// - nomor_peserta: 17-digit starting with 2
// - nama: anything (non-greedy)
// - teknis/manajerial/sosial/wawancara: 0 or 2-3 digits
// - total: 0 or 3-4 digits
// - status: P/L | P | L | TL | TMS | TH
const RE_DATA = /^(\d+)\s+(2\d{16})\s+(.+?)\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,4})\s+(P\/L|P|L|TL|TMS|TH)$/;

// ── PARSERS ───────────────────────────────────────────────────────────────────

function parseRekapitulasi(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const instansiLine = lines.find(l => /^Instansi\s*:/.test(l)) || '';
  const jabatanLine  = lines.find(l => /^Jabatan Formasi\s*:/.test(l)) || '';
  const lokasiLine   = lines.find(l => /^Lokasi Formasi\s*:/.test(l)) || '';
  const jenisLine    = lines.find(l => /^Jenis Formasi\s*:/.test(l)) || '';

  const instansiMatch = instansiLine.match(/Instansi\s*:\s*(.+?)(?:\s+\d{4,})?$/);
  const jabatanMatch  = jabatanLine.match(/Jabatan Formasi\s*:\s*(.+?)(?:\s+\d+)?$/);
  const lokasiMatch   = lokasiLine.match(/Lokasi Formasi\s*:\s*(.+?)(?:\s+\d+)?$/);
  const jenisMatch    = jenisLine.match(/Jenis Formasi\s*:\s*(.+?)(?:\s+\d+)?$/);

  const jabatanFormasi = jabatanMatch ? jabatanMatch[1].trim() : null;
  const lokasiFormasi  = lokasiMatch  ? lokasiMatch[1].trim()  : null;

  const kodeJabatanMatch = jabatanFormasi && jabatanFormasi.match(/^([A-Z0-9\-]+)\s*-\s*/);
  const kodeJabatan      = kodeJabatanMatch ? kodeJabatanMatch[1] : 'UNKNOWN';

  const kodeLokasiMatch  = lokasiFormasi  && lokasiFormasi.match(/^(\d+)\s*-\s*/);
  const kodeLokasi       = kodeLokasiMatch  ? kodeLokasiMatch[1]  : 'UNKNOWN';

  // Table data row: jumlahFormasi jumlahPeserta hadir tidakHadir kelulusan kelulusan% tertinggi terendah
  const dataRowRe = /^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)%\s+(\d+)\s+(\d+)$/;
  let jumlahFormasi = null, jumlahPeserta = null, kehadiran = null, kelulusan = null;
  let nilaiTertinggi = null, nilaiTerendah = null;
  for (const line of lines) {
    const m = line.match(dataRowRe);
    if (m) {
      jumlahFormasi  = parseInt(m[1]);
      jumlahPeserta  = parseInt(m[2]);
      kehadiran      = `${m[3]} hadir, ${m[4]} tidak hadir`;
      kelulusan      = parseInt(m[5]);
      nilaiTertinggi = parseInt(m[7]);
      nilaiTerendah  = parseInt(m[8]);
      break;
    }
  }

  return {
    kodeJabatan,
    kodeLokasi,
    summary: {
      Instansi          : instansiMatch ? instansiMatch[1].trim() : null,
      'Jabatan Formasi' : jabatanFormasi,
      'Lokasi Formasi'  : lokasiFormasi,
      'Jenis Formasi'   : jenisMatch ? jenisMatch[1].trim() : null,
      'Jumlah Formasi'  : jumlahFormasi,
      'Jumlah Peserta'  : jumlahPeserta,
      Kehadiran         : kehadiran,
      Kelulusan         : kelulusan,
      'Nilai Ujian'     : { tertinggi: nilaiTertinggi, terendah: nilaiTerendah }
    }
  };
}

/**
 * Parse data rows from any page (header or continuation).
 * Returns empty array if no valid data rows found.
 */
function parseHasilRows(text) {
  return text.split('\n').map(l => l.trim()).filter(Boolean).reduce((acc, line) => {
    const m = line.match(RE_DATA);
    if (m) {
      acc.push({
        no             : parseInt(m[1]),
        nomor_peserta  : m[2],
        nama           : m[3].trim(),
        teknis         : parseInt(m[4]),
        manajerial     : parseInt(m[5]),
        sosial_kultural: parseInt(m[6]),
        wawancara      : parseInt(m[7]),
        total          : parseInt(m[8]),
        status         : m[9]
      });
    }
    return acc;
  }, []);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function saveSection(summaryData, dataRows, selectorList) {
  if (!summaryData || !summaryData.kodeJabatan || summaryData.kodeJabatan === 'UNKNOWN') return;
  const { kodeJabatan, kodeLokasi, summary } = summaryData;
  const sectionDir = path.join(BASE_DIR, kodeLokasi, kodeJabatan);

  writeJson(path.join(sectionDir, 'summary.json'), summary);
  writeJson(path.join(sectionDir, 'data.json'),    { data: dataRows });

  selectorList.push({
    'Jabatan Formasi': summary['Jabatan Formasi'],
    'Lokasi Formasi' : summary['Lokasi Formasi']
  });
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  const buffer = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ verbosity: 0, data: buffer });
  const doc    = await parser.load();
  const TOTAL  = doc.numPages;

  console.log(`PDF loaded. Total pages: ${TOTAL}`);
  console.log(`Processing from page ${START_PAGE} to ${TOTAL}...`);

  const selectorList = [];

  let currentSummaryData = null;   // parsed REKAPITULASI result
  let currentDataRows    = [];     // accumulated HASIL INTEGRASI rows
  let inDataSection      = false;  // are we inside a HASIL INTEGRASI section?
  let processedSections  = 0;

  for (let batchStart = START_PAGE; batchStart <= TOTAL; batchStart += BATCH_SIZE) {
    const batchEnd   = Math.min(batchStart + BATCH_SIZE - 1, TOTAL);
    const batchPages = Array.from({ length: batchEnd - batchStart + 1 }, (_, i) => batchStart + i);

    process.stdout.write(`\rProcessing pages ${batchStart}–${batchEnd} of ${TOTAL}...`);

    const result = await parser.getText({ partial: batchPages });

    for (const page of result.pages) {
      const text = page.text;

      if (RE_REKAP.test(text)) {
        // ── Save previous section ──────────────────────────────────────────
        if (currentSummaryData) {
          saveSection(currentSummaryData, currentDataRows, selectorList);
          processedSections++;
          if (processedSections % 100 === 0) {
            console.log(`\n  ✓ Saved ${processedSections} sections so far...`);
          }
        }
        // ── Start new section ──────────────────────────────────────────────
        currentSummaryData = parseRekapitulasi(text);
        currentDataRows    = [];
        inDataSection      = false;

      } else if (RE_HASIL.test(text)) {
        // ── First page of participant data ────────────────────────────────
        inDataSection = true;
        if (currentSummaryData) {
          currentDataRows.push(...parseHasilRows(text));
        }

      } else if (inDataSection && currentSummaryData) {
        // ── Continuation page (no header, just table rows) ────────────────
        const rows = parseHasilRows(text);
        if (rows.length > 0) {
          currentDataRows.push(...rows);
        } else {
          // No data rows found → this page is something else, stop continuation
          inDataSection = false;
        }
      }
    }
  }

  // ── Save last section ──────────────────────────────────────────────────────
  if (currentSummaryData) {
    saveSection(currentSummaryData, currentDataRows, selectorList);
    processedSections++;
  }

  // ── Write global selector.json ─────────────────────────────────────────────
  writeJson(SELECTOR, selectorList);

  console.log(`\n\n✅ Done!`);
  console.log(`   Sections processed : ${processedSections}`);
  console.log(`   selector.json      : ${SELECTOR}`);
  console.log(`   Base directory     : ${BASE_DIR}`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
