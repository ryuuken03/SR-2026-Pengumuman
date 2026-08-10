import { useState, useEffect } from 'react'
import './App.css'
import { useSelkomSearch } from './hooks/useSelkomSearch'
import FormasiSelector from './components/FormasiSelector'
import SearchControls from './components/SearchControls'
import ResultsTable from './components/ResultsTable'
import SummaryCard from './components/SummaryCard'

/* ── Theme Toggle ─────────────────────────────────────── */
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`theme-switch${isDark ? ' theme-switch--dark' : ''}`}
      onClick={onToggle}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={isDark ? 'Mode terang' : 'Mode gelap'}
    >
      <span className="theme-switch__thumb">
        {isDark ? (
          <svg className="theme-switch__icon" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg className="theme-switch__icon" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        )}
      </span>
    </button>
  )
}

/* ── useTheme ─────────────────────────────────────────── */
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('selkom-theme')
      if (saved) return saved === 'dark'
    } catch {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try { localStorage.setItem('selkom-theme', isDark ? 'dark' : 'light') } catch {}
  }, [isDark])

  return { isDark, toggleTheme: () => setIsDark(v => !v) }
}

/* ── App ──────────────────────────────────────────────── */
export default function App() {
  const { isDark, toggleTheme } = useTheme()

  const {
    // Formasi
    formasiOptions,
    validLokasi,
    loadingMeta,
    selectedJabatan,
    setSelectedJabatan,
    selectedLokasi,
    setSelectedLokasi,
    selectFormasiEntry,
    // Scope
    searchScope,
    setSearchScope,
    requireSelectedFormasi,
    setRequireSelectedFormasi,
    // Data
    summary,
    loading,
    progress,
    // Search
    query,
    setQuery,
    activeQuery,
    hasSearched,
    handleSearch,
    handleClear,
    // Pagination
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    displayItems,
    ITEMS_PER_PAGE,
    // Sort
    sortConfig,
    requestSort,
  } = useSelkomSearch()

  const formasiReady = Boolean(selectedJabatan && selectedLokasi)

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header-brand">
          <img
            src="/assets/images/logo-kemensos.png"
            alt="Logo Kementerian Sosial"
            className="app-logo"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div className="app-header-text">
            <h1>Pengumuman Seleksi Kompetensi</h1>
            <span className="app-header-subtitle">
              Sekolah Rakyat 2026 — Kementerian Sosial RI
            </span>
          </div>
        </div>
        <div className="app-header-actions">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
      </header>

      {/* ── Formasi Selector (hanya tampil jika checkbox dicentang) ──── */}
      {requireSelectedFormasi && (
        <FormasiSelector
          formasiOptions={formasiOptions}
          validLokasi={validLokasi}
          selectedJabatan={selectedJabatan}
          setSelectedJabatan={setSelectedJabatan}
          selectedLokasi={selectedLokasi}
          setSelectedLokasi={setSelectedLokasi}
          loadingMeta={loadingMeta}
          searchScope={searchScope}
        />
      )}

      {/* ── Summary Card (hanya jika formasi aktif terpilih) ──── */}
      {searchScope === 'formasi' && summary && <SummaryCard summary={summary} />}

      {/* ── Search Controls ────────────────────────────── */}
      <SearchControls
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        hasSearched={hasSearched}
        handleClear={handleClear}
        disabled={loading}
        setSearchScope={setSearchScope}
        requireSelectedFormasi={requireSelectedFormasi}
        setRequireSelectedFormasi={setRequireSelectedFormasi}
        formasiReady={formasiReady}
      />

      {/* ── Meta Info ──────────────────────────────────── */}
      <div className="meta">
        <span>
          {loading
            ? '⏳ ' + (progress || 'Memproses...')
            : hasSearched
              ? searchScope === 'global'
                ? `Ditemukan ${totalItems.toLocaleString('id-ID')} hasil di seluruh formasi untuk "${activeQuery}"`
                : `Ditemukan ${totalItems.toLocaleString('id-ID')} hasil untuk "${activeQuery}"`
              : searchScope === 'global'
                ? 'Mode Global Search: Ketik kata kunci untuk mencari di seluruh 118.000+ data peserta'
                : formasiReady
                  ? totalItems > 0
                    ? `Total ${totalItems.toLocaleString('id-ID')} peserta`
                    : progress
                  : 'Pilih formasi atau gunakan Global Search di atas'}
        </span>
        {hasSearched && totalItems > 0 && (
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
        )}
      </div>

      {/* ── Results Table ──────────────────────────────── */}
      <ResultsTable
        displayItems={displayItems}
        loading={loading}
        hasSearched={hasSearched}
        activeQuery={activeQuery}
        selectedJabatan={selectedJabatan}
        selectedLokasi={selectedLokasi}
        searchScope={searchScope}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={totalItems}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        sortConfig={sortConfig}
        requestSort={requestSort}
        onSelectFormasi={selectFormasiEntry}
      />
    </div>
  )
}
