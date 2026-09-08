import { useState, useEffect } from 'react'
import './styles/index.css'
import { useSelkomSearch } from './hooks/useSelkomSearch'
import { APP, META, NAV, FORMASI } from './constants/strings'
import ThemeToggle from './components/layout/ThemeToggle'
import AppFooter from './components/layout/AppFooter'
import AboutPage from './components/about/AboutPage'
import ChangelogModal from './components/ui/ChangelogModal'
import FormasiSelector from './components/search/FormasiSelector'
import SearchControls from './components/search/SearchControls'
import ResultsTable from './components/results/ResultsTable'
import SummaryCard from './components/results/SummaryCard'
import GlobalSummary from './components/results/GlobalSummary'
import DataSourceSelector from './components/search/DataSourceSelector'


/* ── useTheme ─────────────────────────────────────────────── */
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('selkom-theme')
      if (saved) return saved === 'dark'
    } catch { }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try { localStorage.setItem('selkom-theme', isDark ? 'dark' : 'light') } catch { }
  }, [isDark])

  return { isDark, toggleTheme: () => setIsDark(v => !v) }
}

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'search' | 'about'>('search')
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)

  const {
    // Data Source
    dataSource,
    setDataSource,
    // Formasi
    formasiTab,
    setFormasiTab,
    validJabatan,
    validLokasi,
    loadingMeta,
    selectedJabatan,
    setSelectedJabatan,
    selectedLokasi,
    setSelectedLokasi,
    jabatanLabel,
    lokasiLabel,
    // Scope
    searchScope,
    globalTotalMatches,
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
    handleResetAll,
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

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const formasiReady = Boolean(selectedJabatan && selectedLokasi)
  const formasiIncomplete = Boolean((selectedJabatan && !selectedLokasi) || (!selectedJabatan && selectedLokasi))
  const hasActiveFormasi = Boolean(selectedJabatan || selectedLokasi)

  const activeFormasiLabel = (formasiReady && jabatanLabel && lokasiLabel)
    ? FORMASI.activeFilterLabel(jabatanLabel, lokasiLabel)
    : undefined

  const handleResetFormasi = () => {
    setSelectedJabatan('')
    setSelectedLokasi('')
    setIsFilterModalOpen(false)
  }

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header-brand">
          <img
            src="/assets/images/logo-kemensos.png"
            alt={APP.logoAlt}
            className="app-logo"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div className="app-header-text">
            <h1>{APP.title}</h1>
            <div className="app-header-subrow">
              {/* <span className="app-header-subtitle">{APP.subtitle}</span> */}
              <span className="app-header-disclaimer">{APP.disclaimer}</span>
              <a
                href={APP.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-reference-source btn-reference-source--header"
              >
                <span>{APP.sourceButtonText}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="app-header-actions">
          <nav className="app-header-nav" aria-label="Navigasi Halaman Utama">
            <button
              type="button"
              className={`app-header-nav__btn ${activeTab === 'search' ? 'app-header-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('search')}
              aria-label={NAV.searchTabAria}
            >
              <span className="app-header-nav__label">{NAV.searchTab}</span>
            </button>
            <button
              type="button"
              className={`app-header-nav__btn ${activeTab === 'about' ? 'app-header-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('about')}
              aria-label={NAV.aboutTabAria}
            >
              <span className="app-header-nav__label app-header-nav__label--desktop">{NAV.aboutTab}</span>
              <span className="app-header-nav__label app-header-nav__label--mobile">{NAV.aboutTabShort}</span>
            </button>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </nav>
        </div>
      </header>

      {/* ── Dropdown Pilihan Sumber Data ───────────────── */}
      <DataSourceSelector
        dataSource={dataSource}
        onSourceChange={setDataSource}
      />

      {/* ── Main View: Search vs About ──────────────────── */}
      {activeTab === 'about' ? (
        <AboutPage
          onBackToSearch={() => setActiveTab('search')}
          onOpenChangelog={() => setIsChangelogOpen(true)}
        />
      ) : (
        <>
          {/* ── Rekapitulasi Statistik PPPK Guru & Teknis (Expandable) ─── */}
          <GlobalSummary dataSource={dataSource} />

          {/* ── Formasi Selector: inline Desktop + modal Mobile ── */}
          <FormasiSelector
            isModalOpen={isFilterModalOpen}
            onModalClose={() => setIsFilterModalOpen(false)}
            formasiTab={formasiTab}
            setFormasiTab={setFormasiTab}
            validJabatan={validJabatan}
            validLokasi={validLokasi}
            selectedJabatan={selectedJabatan}
            setSelectedJabatan={setSelectedJabatan}
            selectedLokasi={selectedLokasi}
            setSelectedLokasi={setSelectedLokasi}
            loadingMeta={loadingMeta}
            onResetFormasi={handleResetFormasi}
          />

          {/* ── Summary Card (hanya jika formasi aktif terpilih) ──── */}
          {searchScope === 'formasi' && summary && <SummaryCard summary={summary} />}

          {/* ── Search Controls ────────────────────────────── */}
          <SearchControls
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            hasSearched={hasSearched}
            handleClear={handleClear}
            handleResetAll={handleResetAll}
            disabled={loading}
            searchScope={searchScope}
            formasiReady={formasiReady}
            formasiIncomplete={formasiIncomplete}
            hasActiveFormasi={hasActiveFormasi}
            activeFormasiLabel={activeFormasiLabel}
            jabatanLabel={jabatanLabel}
            lokasiLabel={lokasiLabel}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            onResetFormasi={handleResetFormasi}
          />

          {/* ── Meta Info ──────────────────────────────────── */}
          <div className="meta">
            <span>
              {loading
                ? META.loading(progress)
                : hasSearched
                  ? searchScope === 'global'
                    ? META.resultGlobal(totalItems, activeQuery, globalTotalMatches)
                    : META.resultFormasi(totalItems, activeQuery)
                  : searchScope === 'global'
                    ? query.trim().length === 1 && !/^\d+$/.test(query.trim())
                      ? META.minQueryNotice
                      : ''
                    : formasiReady
                      ? totalItems > 0
                        ? META.formasiTotal(totalItems)
                        : progress
                      : META.formasiIdle}
            </span>
            {hasSearched && totalItems > 0 && (
              <span>
                {META.pageInfo(currentPage, totalPages)}
              </span>
            )}
          </div>

          {/* ── Results Table ──────────────────────────────── */}
          <ResultsTable
            dataSource={dataSource}
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
          />
        </>
      )}

      {/* ── App Footer ─────────────────────────────────── */}
      <AppFooter
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onOpenChangelog={() => setIsChangelogOpen(true)}
      />

      {/* ── Changelog / Features Modal ──────────────────── */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </div>
  )
}

