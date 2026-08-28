import React, { useEffect } from 'react'
import type { SearchScope } from '../hooks/useSelkomSearch'

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

interface SearchControlsProps {
  query: string
  setQuery: (val: string) => void
  handleSearch: () => void
  hasSearched: boolean
  handleClear: () => void
  disabled?: boolean
  setSearchScope: (scope: SearchScope) => void
  requireSelectedFormasi: boolean
  setRequireSelectedFormasi: (value: boolean) => void
  formasiReady: boolean
  onScopeChange?: () => void
}

export default function SearchControls({
  query,
  setQuery,
  handleSearch,
  hasSearched,
  handleClear,
  disabled = false,
  setSearchScope,
  requireSelectedFormasi,
  setRequireSelectedFormasi,
  formasiReady,
  onScopeChange,
}: SearchControlsProps) {
  // Debounce auto-search saat user mengetik
  useEffect(() => {
    if (requireSelectedFormasi && !formasiReady) return

    const trimmed = query.trim()

    // Jika input dikosongkan dan sebelumnya sedang dalam mode hasil pencarian, reset langsung
    if (!trimmed) {
      if (hasSearched) {
        handleClear()
      }
      return
    }

    const timer = setTimeout(() => {
      handleSearch()
    }, 350)

    return () => clearTimeout(timer)
  }, [query, requireSelectedFormasi, formasiReady, hasSearched, handleSearch, handleClear])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const isGlobalMode = !requireSelectedFormasi

  return (
    <div className="controls">
      <label className="search-checkbox" htmlFor="restrict-formasi-check">
        <input
          id="restrict-formasi-check"
          type="checkbox"
          checked={requireSelectedFormasi}
          onChange={e => {
            const checked = e.target.checked
            setRequireSelectedFormasi(checked)
            setSearchScope(checked ? 'formasi' : 'global')
            handleClear()
            onScopeChange?.()
          }}
        />
        <span>Cari hanya pada formasi yang dipilih</span>
      </label>

      <div className="controls__row">
        <div className="controls__fields">
          <div className="search-input-field">
            <label htmlFor="search-query" className="search-input-label">
              {isGlobalMode ? 'Cari Peserta (Semua Formasi)' : 'Cari Peserta (Formasi Dipilih)'}
            </label>
            <input
              id="search-query"
              type="text"
              placeholder={
                isGlobalMode
                  ? 'Cari nama atau nomor peserta di seluruh data Selkom…'
                  : 'Cari nama, no urut, atau nomor peserta dalam formasi yang dipilih…'
              }
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={disabled}
              autoComplete="off"
              aria-label="Cari peserta"
            />
          </div>
        </div>

        <div className="controls__actions">
          <button
            type="button"
            onClick={handleSearch}
            disabled={disabled || !query.trim() || (requireSelectedFormasi && !formasiReady)}
            aria-label="Cari"
            title={
              requireSelectedFormasi && !formasiReady
                ? 'Pilih Jabatan Formasi dan Lokasi Formasi terlebih dahulu'
                : 'Cari'
            }
          >
            <SearchIcon />
            Cari
          </button>
          {hasSearched && (
            <button
              type="button"
              className="secondary"
              onClick={handleClear}
              aria-label="Hapus pencarian"
            >
              <XIcon />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="search-mode-hint">
        {requireSelectedFormasi
          ? formasiReady
            ? 'Mode aktif: pencarian dibatasi ke Jabatan dan Lokasi yang sudah dipilih.'
            : 'Mode aktif: pilih Jabatan Formasi dan Lokasi Formasi sebelum mencari.'
          : 'Mode aktif: pencarian dilakukan ke seluruh data.'}
      </div>
    </div>
  )
}
