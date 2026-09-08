/* ── FormasiSelector ─────────────────────────────────────────
   Menampilkan dropdown jabatan & lokasi formasi dengan tab kategori
   "PPPK Guru" dan "PPPK Teknis".

   Mode render:
   - Desktop (≥769px): Panel inline selalu tampil di bawah DataSourceSelector.
   - Mobile (<769px): Hanya tombol "Filter", konten tampil dalam modal dialog.
   ─────────────────────────────────────────────────────────── */
import { useEffect, useRef } from 'react'
import type { FormasiOptionItem, FormasiTab } from '../../hooks/useSelkomSearch'
import { FORMASI } from '../../constants/strings'
import SearchableSelect from '../ui/SearchableSelect'

interface FormasiSelectorProps {
  /** Apakah modal filter mobile sedang terbuka */
  isModalOpen: boolean
  onModalClose: () => void
  formasiTab: FormasiTab
  setFormasiTab: (tab: FormasiTab) => void
  validJabatan: FormasiOptionItem[]
  validLokasi: FormasiOptionItem[]
  selectedJabatan: string
  setSelectedJabatan: (val: string) => void
  selectedLokasi: string
  setSelectedLokasi: (val: string) => void
  loadingMeta: boolean
  onResetFormasi: () => void
}

/** Konten internal filter (tab + 2 dropdown) — digunakan di inline & modal */
function FormasiContent({
  formasiTab,
  setFormasiTab,
  validJabatan,
  validLokasi,
  selectedJabatan,
  setSelectedJabatan,
  selectedLokasi,
  setSelectedLokasi,
  loadingMeta,
}: Omit<FormasiSelectorProps, 'isModalOpen' | 'onModalClose' | 'onResetFormasi'>) {
  return (
    <>
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
    </>
  )
}

export default function FormasiSelector(props: FormasiSelectorProps) {
  const {
    isModalOpen,
    onModalClose,
    onResetFormasi,
    selectedJabatan,
    selectedLokasi,
    ...contentProps
  } = props

  const modalRef = useRef<HTMLDivElement>(null)

  // Tutup modal dengan tombol Escape & cegah scroll body
  useEffect(() => {
    if (!isModalOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onModalClose()
    }

    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = original
      window.removeEventListener('keydown', handleKey)
    }
  }, [isModalOpen, onModalClose])

  const bothFilled = selectedJabatan && selectedLokasi
  const isIncomplete = (selectedJabatan && !selectedLokasi) || (!selectedJabatan && selectedLokasi)

  return (
    <>
      {/* ── Desktop: Panel inline selalu tampil ──────────────── */}
      <div className="formasi-selector formasi-selector--desktop">
        <div className="formasi-selector__header">
          <span className="formasi-selector__label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            {FORMASI.sectionLabel}
          </span>
          <span className="formasi-selector__note">{FORMASI.desktopNote}</span>
        </div>

        <FormasiContent
          {...contentProps}
          selectedJabatan={selectedJabatan}
          selectedLokasi={selectedLokasi}
        />

        {/* Petunjuk saat salah satu belum dipilih */}
        {isIncomplete && (
          <p className="formasi-selector__warning" role="alert">
            {FORMASI.incompleteWarning}
          </p>
        )}

        {/* Tombol reset formasi di desktop jika ada yang dipilih */}
        {(selectedJabatan || selectedLokasi) && (
          <div className="formasi-selector__actions">
            <button
              type="button"
              className="formasi-selector__reset-btn"
              onClick={onResetFormasi}
              aria-label={FORMASI.modalReset}
            >
              {FORMASI.modalReset}
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile: Modal dialog ──────────────────────────────── */}
      {isModalOpen && (
        <div
          className="filter-modal-backdrop"
          onClick={onModalClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-modal-title"
        >
          <div
            ref={modalRef}
            className="filter-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="filter-modal-header">
              <div>
                <h3 id="filter-modal-title" className="filter-modal-title">
                  {FORMASI.modalTitle}
                </h3>
                <p className="filter-modal-subtitle">{FORMASI.modalSubtitle}</p>
              </div>
              <button
                type="button"
                className="filter-modal-close"
                onClick={onModalClose}
                aria-label={FORMASI.modalClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  width="18" height="18" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="filter-modal-body">
              <FormasiContent
                {...contentProps}
                selectedJabatan={selectedJabatan}
                selectedLokasi={selectedLokasi}
              />

              {isIncomplete && (
                <p className="formasi-selector__warning" role="alert">
                  {FORMASI.incompleteWarning}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="filter-modal-footer">
              <button
                type="button"
                className="filter-modal-btn filter-modal-btn--reset"
                onClick={() => {
                  onResetFormasi()
                }}
              >
                {FORMASI.modalReset}
              </button>
              <button
                type="button"
                className={`filter-modal-btn filter-modal-btn--apply ${bothFilled ? '' : 'filter-modal-btn--disabled'}`}
                onClick={onModalClose}
                disabled={!bothFilled && !!(selectedJabatan || selectedLokasi)}
                aria-disabled={!bothFilled && !!(selectedJabatan || selectedLokasi)}
              >
                {FORMASI.modalApply}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
