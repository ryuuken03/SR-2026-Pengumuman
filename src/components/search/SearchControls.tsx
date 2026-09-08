/* ── SearchControls ──────────────────────────────────────────────
   Kontrol pencarian: input teks (debounce otomatis), tombol filter
   mobile, dan tombol reset di bawah bar.

   - Tombol manual "Cari" dihapus; pencarian otomatis via debounce.
   - Tombol "Filter" (mobile) membuka modal FormasiSelector.
   - Tombol reset di bawah search bar (muncul saat ada query/formasi aktif).
   ─────────────────────────────────────────────────────────── */
import React, { useEffect } from 'react'
import { SEARCH, FORMASI } from '../../constants/strings'

interface SearchControlsProps {
  query: string
  setQuery: (val: string) => void
  hasSearched: boolean
  handleClear: () => void
  handleResetAll: () => void
  disabled?: boolean
  searchScope: 'global' | 'formasi'
  /** Apakah kedua dropdown sudah dipilih */
  formasiReady: boolean
  /** Apakah baru salah satu dropdown yang dipilih */
  formasiIncomplete: boolean
  /** Apakah ada formasi (jabatan/lokasi) yang sedang aktif */
  hasActiveFormasi: boolean
  /** Label ringkasan formasi aktif (untuk mobile) */
  activeFormasiLabel?: string
  /** (Mobile) Buka modal filter formasi */
  onOpenFilterModal: () => void
  /** Trigger untuk re-search dari component (selain debounce) */
  handleSearch: () => void
  /** Reset pilihan formasi aktif */
  onResetFormasi?: () => void
  /** Label nama jabatan (opsional) */
  jabatanLabel?: string
  /** Label nama lokasi (opsional) */
  lokasiLabel?: string
}

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)


export default function SearchControls({
  query,
  setQuery,
  hasSearched,
  handleClear,
  handleResetAll,
  disabled = false,
  searchScope,
  formasiReady,
  formasiIncomplete,
  hasActiveFormasi,
  activeFormasiLabel,
  onOpenFilterModal,
  handleSearch,
  onResetFormasi,
}: SearchControlsProps) {
  // Debounce auto-search saat user mengetik
  useEffect(() => {
    // Jika formasi incomplete (salah satu dipilih, satunya belum), tahan pencarian
    if (formasiIncomplete) return

    const trimmed = query.trim()
    const isNumeric = /^\d+$/.test(trimmed)

    // Reset langsung jika input dikosongkan
    if (!trimmed) {
      if (hasSearched) handleClear()
      return
    }

    // Mode global: minimal 2 karakter untuk pencarian nama
    if (searchScope === 'global' && !isNumeric && trimmed.length < 2) return

    const timer = setTimeout(() => {
      handleSearch()
    }, 350)

    return () => clearTimeout(timer)
  }, [query, searchScope, formasiReady, formasiIncomplete, hasSearched, handleSearch, handleClear])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const isGlobalMode = searchScope === 'global'
  const trimmedQuery = query.trim()
  const isNumericQuery = /^\d+$/.test(trimmedQuery)
  const isTooShortGlobal = isGlobalMode && !isNumericQuery && trimmedQuery.length > 0 && trimmedQuery.length < 2

  // Apakah tombol reset perlu ditampilkan
  const showResetSearch = hasSearched || trimmedQuery.length > 0
  const showResetFormasi = hasActiveFormasi
  const showResetAll = showResetFormasi && showResetSearch
  const showResetSearchOnly = showResetSearch && !showResetFormasi
  const showResetFormasiOnly = showResetFormasi && !showResetSearch
  const showAnyReset = showResetSearch || showResetFormasi

  return (
    <div className="controls">
      {/* ── Baris search bar + tombol filter mobile ────────── */}
      <div className="controls__row">
        <div className="search-input-field">
          {/* <label htmlFor="search-query" className="search-input-label">
            {isGlobalMode ? SEARCH.inputLabelGlobal : SEARCH.inputLabelFormasi}
          </label> */}
          <div className="search-input-wrap">
            <input
              id="search-query"
              type="text"
              placeholder={
                isGlobalMode
                  ? SEARCH.placeholderGlobalShort
                  : SEARCH.placeholderFormasiShort
              }
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={disabled}
              autoComplete="off"
              aria-label={SEARCH.inputAria}
            />
          </div>
        </div>

        {/* Tombol Filter — hanya tampil di Mobile */}
        <button
          type="button"
          id="btn-filter-mobile"
          className={`filter-btn-mobile ${hasActiveFormasi ? 'filter-btn-mobile--active' : ''}`}
          onClick={onOpenFilterModal}
          aria-label={activeFormasiLabel ? `${FORMASI.btnFilterMobileAria}: ${activeFormasiLabel}` : FORMASI.btnFilterMobileAria}
          title={activeFormasiLabel || FORMASI.btnFilterMobile}
        >
          <FilterIcon />
          {/* Badge indikator filter aktif */}
          {hasActiveFormasi && <span className="filter-btn-mobile__badge" aria-hidden="true" />}
        </button>

        {/* Tombol Reset Desktop — tampil di sebelah kanan input search */}
        {showResetAll && (
          <button
            type="button"
            className="controls__reset-btn controls__reset-btn--desktop"
            onClick={handleResetAll}
          >
            {SEARCH.btnResetAll}
          </button>
        )}
        {showResetSearchOnly && (
          <button
            type="button"
            className="controls__reset-btn controls__reset-btn--desktop"
            onClick={() => { setQuery(''); handleClear() }}
          >
            {SEARCH.btnResetSearch}
          </button>
        )}
        {showResetFormasiOnly && (
          <button
            type="button"
            className="controls__reset-btn controls__reset-btn--desktop"
            onClick={onResetFormasi || handleResetAll}
          >
            {FORMASI.modalReset}
          </button>
        )}
      </div>

      {/* ── Active Filter Chip (Mobile View) ─────────────── */}
      {/* {hasActiveFormasi && (jabatanLabel || lokasiLabel || activeFormasiLabel) && (
        <div className="active-filter-chip">
          <button
            type="button"
            className="active-filter-chip__body"
            onClick={onOpenFilterModal}
            aria-label={activeFormasiLabel ? FORMASI.chipEditAria(activeFormasiLabel) : FORMASI.sectionLabel}
          >
            {jabatanLabel && (
              <span>{jabatanLabel}</span>
            )}
            {lokasiLabel && (
              <span>{lokasiLabel}</span>
            )}
            {!jabatanLabel && !lokasiLabel && activeFormasiLabel && (
              <span className="active-filter-chip__text">{activeFormasiLabel}</span>
            )}
          </button>
          {onResetFormasi && (
            <button
              type="button"
              className="active-filter-chip__remove"
              onClick={onResetFormasi}
              aria-label={FORMASI.clearSelection}
              title={FORMASI.clearSelection}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="12"
                height="12"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      )} */}

      {/* ── Tombol Reset Mobile — tampil di bawah filter chip ── */}
      {showAnyReset && (
        <div className="controls__reset-row controls__reset-row--mobile">
          {showResetAll && (
            <button
              type="button"
              className="controls__reset-btn"
              onClick={handleResetAll}
            >
              {SEARCH.btnResetAll}
            </button>
          )}
          {showResetSearchOnly && (
            <button
              type="button"
              className="controls__reset-btn"
              onClick={() => { setQuery(''); handleClear() }}
            >
              {SEARCH.btnResetSearch}
            </button>
          )}
          {showResetFormasiOnly && (
            <button
              type="button"
              className="controls__reset-btn"
              onClick={onResetFormasi || handleResetAll}
            >
              {FORMASI.modalReset}
            </button>
          )}
        </div>
      )}

      {/* ── Hint minimal karakter (global mode) ────────────── */}
      {isTooShortGlobal && (
        <p className="search-mode-hint" role="status" aria-live="polite">
          {SEARCH.minCharsHint}
        </p>
      )}

      {/* ── Hint formasi incomplete ─────────────────────────── */}
      {formasiIncomplete && (
        <div className="search-mode-hint search-mode-hint--warning" role="alert">
          <span>{SEARCH.hintIncomplete}</span>
          {onResetFormasi && (
            <button
              type="button"
              className="search-mode-hint__action"
              onClick={onResetFormasi}
            >
              {FORMASI.cancelAndSearchGlobal}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
