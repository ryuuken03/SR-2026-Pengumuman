/* ── FormasiSelector ─────────────────────────────────────────
   Dropdown untuk memilih jabatan dan lokasi formasi dengan tab
   kategori "PPPK Guru" dan "PPPK Teknis".
   ─────────────────────────────────────────────────────────── */
import type { FormasiOptionItem, SearchScope, FormasiTab } from '../../hooks/useSelkomSearch'
import { FORMASI, SEARCH } from '../../constants/strings'

import SearchableSelect from '../ui/SearchableSelect'

interface FormasiSelectorProps {
  requireSelectedFormasi?: boolean
  setRequireSelectedFormasi?: (value: boolean) => void
  setSearchScope?: (scope: SearchScope) => void
  handleClear?: () => void
  onScopeChange?: () => void
  formasiTab: FormasiTab
  setFormasiTab: (tab: FormasiTab) => void
  validJabatan: FormasiOptionItem[]
  validLokasi: FormasiOptionItem[]
  selectedJabatan: string
  setSelectedJabatan: (val: string) => void
  selectedLokasi: string
  setSelectedLokasi: (val: string) => void
  loadingMeta: boolean
  searchScope?: SearchScope
}

export default function FormasiSelector({
  requireSelectedFormasi,
  setRequireSelectedFormasi,
  setSearchScope,
  handleClear,
  onScopeChange,
  formasiTab,
  setFormasiTab,
  validJabatan,
  validLokasi,
  selectedJabatan,
  setSelectedJabatan,
  selectedLokasi,
  setSelectedLokasi,
  loadingMeta,
  searchScope = 'formasi',
}: FormasiSelectorProps) {
  return (
    <div className={`formasi-selector ${searchScope === 'global' ? 'formasi-selector--global-active' : ''}`}>
      <label className="search-checkbox" htmlFor="restrict-formasi-check">
        <input
          id="restrict-formasi-check"
          type="checkbox"
          checked={requireSelectedFormasi}
          onChange={e => {
            const checked = e.target.checked
            setRequireSelectedFormasi?.(checked)
            setSearchScope?.(checked ? 'formasi' : 'global')
            handleClear?.()
            onScopeChange?.()
          }}
        />
        <span>{SEARCH.checkboxLabel}</span>
      </label>
      <div className="formasi-selector__header">
        <span className="formasi-selector__label">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          {FORMASI.sectionLabel}
        </span>

        {/* Tab PPPK Guru & PPPK Teknis */}
        <div className="formasi-tabs" role="tablist" aria-label={FORMASI.kategoriAria}>
          <button
            type="button"
            role="tab"
            aria-selected={formasiTab === 'guru'}
            className={`formasi-tab ${formasiTab === 'guru' ? 'formasi-tab--active' : ''}`}
            onClick={() => setFormasiTab('guru')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="formasi-tab__icon" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>{FORMASI.tabGuru}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={formasiTab === 'teknis'}
            className={`formasi-tab ${formasiTab === 'teknis' ? 'formasi-tab--active' : ''}`}
            onClick={() => setFormasiTab('teknis')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="formasi-tab__icon" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span>{FORMASI.tabTeknis}</span>
          </button>
        </div>
      </div>

      <div className="formasi-selector__row">
        {/* Dropdown 1: Jabatan Formasi */}
        <div className="formasi-selector__field">
          <label htmlFor="select-jabatan">{FORMASI.jabatanLabel}</label>
          <SearchableSelect
            id="select-jabatan"
            options={validJabatan}
            value={selectedJabatan}
            onChange={setSelectedJabatan}
            placeholder={validJabatan.length === 0 ? FORMASI.jabatanEmpty : FORMASI.jabatanPlaceholder}
            searchPlaceholder={FORMASI.searchJabatanPlaceholder}
            emptyMessage={FORMASI.searchEmpty}
            disabled={loadingMeta || validJabatan.length === 0}
            clearable={true}
            ariaLabel={FORMASI.jabatanLabel}
          />
        </div>

        {/* Dropdown 2: Lokasi Formasi */}
        <div className="formasi-selector__field">
          <label htmlFor="select-lokasi">{FORMASI.lokasiLabel}</label>
          <SearchableSelect
            id="select-lokasi"
            options={validLokasi}
            value={selectedLokasi}
            onChange={setSelectedLokasi}
            placeholder={validLokasi.length === 0 ? FORMASI.lokasiEmpty : FORMASI.lokasiPlaceholder}
            searchPlaceholder={FORMASI.searchLokasiPlaceholder}
            emptyMessage={FORMASI.searchEmpty}
            disabled={loadingMeta || validLokasi.length === 0}
            clearable={true}
            ariaLabel={FORMASI.lokasiLabel}
          />
        </div>
      </div>
    </div>
  )
}
