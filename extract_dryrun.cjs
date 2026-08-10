const fs   = require('fs');
const path = require('path');

const BASE_DIR = path.resolve('./src/assets/selkom');
const selector = require(path.join(BASE_DIR, 'selector.json'));

// Helper: parse "KODE - LABEL" → { kode, label }
function parse(str) {
  if (!str) return { kode: null, label: null };
  const idx = str.indexOf(' - ');
  if (idx === -1) return { kode: str.trim(), label: str.trim() };
  return {
    kode : str.slice(0, idx).trim(),
    label: str.slice(idx + 3).trim()
  };
}

// Collect unique values preserving first-seen order
const jabatanMap  = new Map(); // kode → label
const lokasiMap   = new Map(); // kode → label

for (const entry of selector) {
  const jab  = parse(entry['Jabatan Formasi']);
  const lok  = parse(entry['Lokasi Formasi']);

  if (jab.kode && !jabatanMap.has(jab.kode)) jabatanMap.set(jab.kode, jab.label);
  if (lok.kode && !lokasiMap.has(lok.kode))  lokasiMap.set(lok.kode, lok.label);
}

const result = {
  'Jabatan Formasi': [...jabatanMap.entries()].map(([kode, label]) => ({ kode, label })),
  'Lokasi Formasi' : [...lokasiMap.entries()].map(([kode, label]) => ({ kode, label }))
};

const outPath = path.join(BASE_DIR, 'select_formasi.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ Done!`);
console.log(`   Jabatan Formasi : ${result['Jabatan Formasi'].length} unique entries`);
console.log(`   Lokasi Formasi  : ${result['Lokasi Formasi'].length} unique entries`);
console.log(`   Output          : ${outPath}`);
console.log('\nSample Jabatan:', JSON.stringify(result['Jabatan Formasi'].slice(0, 3), null, 2));
console.log('Sample Lokasi :', JSON.stringify(result['Lokasi Formasi'].slice(0, 3), null, 2));
