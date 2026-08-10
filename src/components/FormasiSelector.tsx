import type { FormasiOptionItem, SelectFormasiData, SearchScope } from '../hooks/useSelkomSearch'

interface FormasiSelectorProps {
  formasiOptions: SelectFormasiData | null
  validLokasi: FormasiOptionItem[]
  selectedJabatan: string
  setSelectedJabatan: (val: string) => void
  selectedLokasi: string
  setSelectedLokasi: (val: string) => void
  loadingMeta: boolean
  searchScope?: SearchScope
}

export default function FormasiSelector({
  formasiOptions,
  validLokasi,
  selectedJabatan,
  setSelectedJabatan,
  selectedLokasi,
  setSelectedLokasi,
  loadingMeta,
  searchScope = 'formasi',
}: FormasiSelectorProps) {
  const jabatanList = formasiOptions?.['Jabatan Formasi'] || []

  return (
    <div className={`formasi-selector ${searchScope === 'global' ? 'formasi-selector--global-active' : ''}`}>
      <span className="formasi-selector__label">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Pilih Formasi (Filter Spesifik)
      </span>

      <div className="formasi-selector__row">
        {/* Dropdown 1: Jabatan Formasi */}
        <div className="formasi-selector__field">
          <label htmlFor="select-jabatan">Jabatan Formasi</label>
          <select
            id="select-jabatan"
            value={selectedJabatan}
            onChange={e => setSelectedJabatan(e.target.value)}
            disabled={loadingMeta || jabatanList.length === 0}
          >
            <option value="">— Pilih Jabatan Formasi —</option>
            {jabatanList.map(item => (
              <option key={item.kode} value={item.kode}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Lokasi Formasi */}
        <div className="formasi-selector__field">
          <label htmlFor="select-lokasi">Lokasi Formasi</label>
          <select
            id="select-lokasi"
            value={selectedLokasi}
            onChange={e => setSelectedLokasi(e.target.value)}
            disabled={!selectedJabatan || validLokasi.length === 0}
          >
            <option value="">
              {!selectedJabatan
                ? '— Pilih Jabatan Formasi terlebih dahulu —'
                : validLokasi.length === 0
                  ? 'Tidak ada lokasi tersedia'
                  : '— Pilih Lokasi Formasi —'}
            </option>
            {validLokasi.map(item => (
              <option key={item.kode} value={item.kode}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
