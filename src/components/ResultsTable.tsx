import { useState, useEffect, useMemo } from 'react'
import Pagination from './Pagination'
import type { PesertaItem, SortConfig, SortKey, SearchScope } from '../hooks/useSelkomSearch'

interface ColDef {
  key: SortKey
  label: string
  sortable: boolean
}

const FORMATION_COLS: ColDef[] = [
  { key: 'no', label: 'No', sortable: true },
  { key: 'nomor_peserta', label: 'Nomor Peserta', sortable: true },
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'teknis', label: 'Teknis', sortable: true },
  { key: 'manajerial', label: 'Manajerial', sortable: true },
  { key: 'sosial_kultural', label: 'Sos. Kultural', sortable: true },
  { key: 'wawancara', label: 'Wawancara', sortable: true },
  { key: 'total', label: 'Total', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

const GLOBAL_COLS: ColDef[] = [
  { key: 'no', label: 'No', sortable: true },
  { key: 'nomor_peserta', label: 'Nomor Peserta', sortable: true },
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'jabatanNama', label: 'Jabatan Formasi', sortable: true },
  { key: 'lokasiNama', label: 'Lokasi Formasi', sortable: true },
  { key: 'teknis', label: 'Teknis', sortable: true },
  { key: 'manajerial', label: 'Manajerial', sortable: true },
  { key: 'sosial_kultural', label: 'Sos. Kultural', sortable: true },
  { key: 'wawancara', label: 'Wawancara', sortable: true },
  { key: 'total', label: 'Total', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

function Highlight({ text, query }: { text: string | number | undefined; query: string }) {
  if (!query || text === undefined || text === null) return <>{text}</>
  const str = String(text)
  const idx = str.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{str}</>
  return (
    <>
      {str.slice(0, idx)}
      <mark className="highlight">{str.slice(idx, idx + query.length)}</mark>
      {str.slice(idx + query.length)}
    </>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const isLulus = /^p\//i.test(status) || status === 'P/L'
  return (
    <span className={`status-badge ${isLulus ? 'status-badge--lulus' : 'status-badge--tl'}`}>
      {status}
    </span>
  )
}

interface ResultsTableProps {
  displayItems: PesertaItem[]
  loading: boolean
  hasSearched: boolean
  activeQuery: string
  selectedJabatan: string
  selectedLokasi: string
  searchScope: SearchScope
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalItems: number
  totalPages: number
  indexOfFirstItem: number
  indexOfLastItem: number
  ITEMS_PER_PAGE: number
  sortConfig: SortConfig
  requestSort: (key: SortKey) => void
  onSelectFormasi?: (jabatanKode: string, lokasiKode: string) => void
}

export default function ResultsTable({
  displayItems,
  loading,
  hasSearched,
  activeQuery,
  selectedJabatan,
  selectedLokasi,
  searchScope,
  currentPage,
  setCurrentPage,
  totalItems,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  ITEMS_PER_PAGE,
  sortConfig,
  requestSort,
  onSelectFormasi,
}: ResultsTableProps) {
  const [showScrollTop, setScrollTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isGlobal = searchScope === 'global'
  const cols = useMemo(() => (isGlobal ? GLOBAL_COLS : FORMATION_COLS), [isGlobal])

  const renderHeader = (col: ColDef) => {
    const isSorted = sortConfig?.key === col.key
    const dir = sortConfig?.direction

    if (!col.sortable) {
      return <th key={col.key}>{col.label}</th>
    }

    return (
      <th
        key={col.key}
        className={`sortable${isSorted ? ' sorted' : ''}`}
        onClick={() => requestSort(col.key)}
        title={`Urutkan berdasarkan ${col.label}`}
        aria-sort={isSorted ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        {col.label}
        <span className="sort-indicator" aria-hidden="true">
          {isSorted ? (dir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
        </span>
      </th>
    )
  }

  const noFormasiSelected = !isGlobal && (!selectedJabatan || !selectedLokasi)
  const noGlobalQuery = isGlobal && !activeQuery.trim()
  const noData = !loading && !noFormasiSelected && !noGlobalQuery && displayItems.length === 0

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {cols.map(renderHeader)}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr className="empty-row">
              <td colSpan={cols.length}>
                <div className="empty-row-content">
                  <span>Memproses pencarian data…</span>
                </div>
              </td>
            </tr>
          )}

          {!loading && noFormasiSelected && (
            <tr className="empty-row">
              <td colSpan={cols.length}>
                <div className="empty-row-content">
                  <span className="empty-row-icon">📋</span>
                  <span>
                    Pilih <strong>Jabatan Formasi</strong> dan <strong>Lokasi Formasi</strong> di atas, atau centang mode <strong>Semua Formasi (Global)</strong>.
                  </span>
                </div>
              </td>
            </tr>
          )}

          {!loading && noGlobalQuery && (
            <tr className="empty-row">
              <td colSpan={cols.length}>
                <div className="empty-row-content">
                  <span>Cari nama/nomor peserta pada kolom pencarian</span>
                </div>
              </td>
            </tr>
          )}

          {!loading && noData && (
            <tr className="empty-row">
              <td colSpan={cols.length}>
                <div className="empty-row-content">
                  <span className="empty-row-icon">🔎</span>
                  <span>
                    {hasSearched
                      ? `Tidak ditemukan hasil untuk "${activeQuery}".`
                      : 'Tidak ada data.'}
                  </span>
                </div>
              </td>
            </tr>
          )}

          {!loading && !noFormasiSelected && !noGlobalQuery && displayItems.map((row, i) => (
            <tr key={`${row.nomor_peserta || row.no}-${i}`}>
              <td data-label="No" className="cell-no">{row.no}</td>
              <td data-label="Nomor Peserta" className="cell-nomor">
                <Highlight text={row.nomor_peserta} query={activeQuery} />
              </td>
              <td data-label="Nama" className="cell-nama">
                <Highlight text={row.nama} query={activeQuery} />
              </td>

              {isGlobal && (
                <>
                  <td data-label="Jabatan Formasi" className="cell-formasi-info cell-jabatan">
                    {onSelectFormasi && row.jabatanKode && row.lokasiKode ? (
                      <button
                        type="button"
                        className="btn-link-formasi formasi-chip"
                        onClick={() => onSelectFormasi(row.jabatanKode!, row.lokasiKode!)}
                        title="Buka detail formasi ini"
                      >
                        {row.jabatanNama || row.jabatanKode}
                      </button>
                    ) : (
                      <span className="formasi-chip">{row.jabatanNama || row.jabatanKode || '-'}</span>
                    )}
                  </td>
                  <td data-label="Lokasi Formasi" className="cell-formasi-info cell-lokasi">
                    <span className="formasi-chip formasi-chip--lokasi">{row.lokasiNama || row.lokasiKode || '-'}</span>
                  </td>
                </>
              )}

              <td data-label="Teknis" className="cell-score cell-teknis">{row.teknis ?? '-'}</td>
              <td data-label="Manajerial" className="cell-score cell-manajerial">{row.manajerial ?? '-'}</td>
              <td data-label="Sos. Kultural" className="cell-score cell-soskul">{row.sosial_kultural ?? '-'}</td>
              <td data-label="Wawancara" className="cell-score cell-wawancara">{row.wawancara ?? '-'}</td>
              <td data-label="Total" className="cell-total">
                <span className="desktop-total-val">{row.total ?? '-'}</span>
                <span className="mobile-total-box">
                  <span className="total-label-mobile">Total Skor : </span>
                  <span className="total-val-mobile">{row.total ?? '-'}</span>
                  <span className="total-divider-mobile">|</span>
                  <StatusBadge status={row.status} />
                </span>
              </td>
              <td data-label="Status" className="cell-status">
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={totalItems}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        itemsPerPage={ITEMS_PER_PAGE}
        hasSearched={hasSearched}
      />

      <div className="status-legend">
        <div className="status-legend__title">Keterangan Status:</div>
        <div className="status-legend__items">
          <span className="status-legend__item">
            <strong className="legend-badge legend-badge--lulus">P/L</strong> Lulus & berhak ikut SKT
          </span>
          <span className="status-legend__item">
            <strong className="legend-badge legend-badge--tl">TH</strong> Tidak Hadir
          </span>
          <span className="status-legend__item">
            <strong className="legend-badge legend-badge--tl">TMS</strong> Tidak Memenuhi Syarat
          </span>
          <span className="status-legend__item">
            <strong className="legend-badge legend-badge--tl">APS</strong> Mengundurkan Diri
          </span>
        </div>
      </div>

      {showScrollTop && (
        <button
          type="button"
          className="scroll-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
        >
          ↑
        </button>
      )}
    </div>
  )
}
