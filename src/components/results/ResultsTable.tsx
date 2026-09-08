/* ── ResultsTable ────────────────────────────────────────────
   Tabel hasil pencarian peserta dengan sorting & mobile card layout.
   ─────────────────────────────────────────────────────────── */
import { useState, useEffect, useMemo } from 'react'
import Pagination from './Pagination'
import EmptyState, { resolveEmptyVariant } from '../ui/EmptyState'
import type { PesertaItem, SortConfig, SortKey, SearchScope, DataSource } from '../../hooks/useSelkomSearch'
import { TABLE_HEADERS, MOBILE, STATUS } from '../../constants/strings'

interface ColDef {
  key: SortKey
  label: string
  sortable: boolean
}

const FORMATION_COLS: ColDef[] = [
  { key: 'no', label: TABLE_HEADERS.no, sortable: true },
  { key: 'nomor_peserta', label: TABLE_HEADERS.nomorPeserta, sortable: true },
  { key: 'nama', label: TABLE_HEADERS.nama, sortable: true },
  { key: 'teknis', label: TABLE_HEADERS.teknis, sortable: true },
  { key: 'manajerial', label: TABLE_HEADERS.manajerial, sortable: true },
  { key: 'sosial_kultural', label: TABLE_HEADERS.sosialKultural, sortable: true },
  { key: 'wawancara', label: TABLE_HEADERS.wawancara, sortable: true },
  { key: 'total', label: TABLE_HEADERS.total, sortable: true },
  { key: 'status', label: TABLE_HEADERS.status, sortable: true },
]

const GLOBAL_COLS: ColDef[] = [
  { key: 'no', label: TABLE_HEADERS.no, sortable: true },
  { key: 'nomor_peserta', label: TABLE_HEADERS.nomorPeserta, sortable: true },
  { key: 'nama', label: TABLE_HEADERS.nama, sortable: true },
  { key: 'jabatanNama', label: TABLE_HEADERS.jabatanLokasi, sortable: true },
  { key: 'teknis', label: TABLE_HEADERS.teknis, sortable: true },
  { key: 'manajerial', label: TABLE_HEADERS.manajerial, sortable: true },
  { key: 'sosial_kultural', label: TABLE_HEADERS.sosialKultural, sortable: true },
  { key: 'wawancara', label: TABLE_HEADERS.wawancara, sortable: true },
  { key: 'total', label: TABLE_HEADERS.total, sortable: true },
  { key: 'status', label: TABLE_HEADERS.status, sortable: true },
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
  const isLulus = /^p(\/|$)/i.test(status.trim()) || status === 'P/L' || status === 'P'
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
  sortConfig?: SortConfig
  requestSort?: (key: SortKey) => void
  dataSource?: DataSource
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
  sortConfig: _sortConfig,
  requestSort: _requestSort,
  dataSource = 'skt',
}: ResultsTableProps) {
  const [showScrollTop, setScrollTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isGlobal = searchScope === 'global'
  const isSkt = dataSource === 'skt'

  const cols = useMemo<ColDef[]>(() => {
    if (isGlobal) {
      if (isSkt) {
        return [
          { key: 'no', label: TABLE_HEADERS.no, sortable: true },
          { key: 'nama', label: TABLE_HEADERS.nama, sortable: true },
          { key: 'jabatanNama', label: TABLE_HEADERS.jabatanLokasi, sortable: true },
          { key: 'total_cat', label: TABLE_HEADERS.kompetensiCat, sortable: true },
          { key: 'total_skt', label: TABLE_HEADERS.kompetensiTambahan, sortable: true },
          { key: 'total', label: TABLE_HEADERS.totalIntegrasi, sortable: true },
          { key: 'status', label: TABLE_HEADERS.status, sortable: true },
        ]
      }
      return GLOBAL_COLS
    }

    if (isSkt) {
      return [
        { key: 'no', label: TABLE_HEADERS.no, sortable: true },
        { key: 'nama', label: TABLE_HEADERS.nama, sortable: true },
        { key: 'total_cat', label: TABLE_HEADERS.kompetensiCat, sortable: true },
        { key: 'total_skt', label: TABLE_HEADERS.kompetensiTambahan, sortable: true },
        { key: 'total', label: TABLE_HEADERS.totalIntegrasi, sortable: true },
        { key: 'status', label: TABLE_HEADERS.status, sortable: true },
      ]
    }

    return FORMATION_COLS
  }, [isGlobal, isSkt])

  // Tentukan variant EmptyState yang perlu ditampilkan (null = ada data)
  const emptyVariant = resolveEmptyVariant({
    loading,
    isGlobal,
    activeQuery,
    selectedJabatan,
    selectedLokasi,
    displayItemsLength: displayItems.length,
  })

  const renderHeader = (col: ColDef) => {
    return <th key={col.key}>{col.label}</th>
  }

  return (
    <div className="data-table">
      {/* ── Empty State ────────────────────────────────────────── */}
      {emptyVariant && (
        <EmptyState
          variant={emptyVariant}
          activeQuery={activeQuery}
          searchScope={searchScope}
        />
      )}

      {/* ── Hasil Ada: Tampilan Desktop Table & Mobile Cards ──── */}
      {!emptyVariant && (
        <>
          {/* 1. Tampilan Desktop Table (hanya di min-width: 769px) */}
          <div className="results-table__desktop">
            <table>
              <thead>
                <tr>
                  {cols.map(renderHeader)}
                </tr>
              </thead>
              <tbody>
                {displayItems.map((row, i) => (
                  <tr key={`${row.nomor_peserta || row.no}-${i}`}>
                    <td className="cell-no">{indexOfFirstItem + i + 1}</td>

                    {isSkt ? (
                      <td className="cell-nama cell-nama--combined">
                        <div className="cell-nama__wrap">
                          <div className="cell-nama__text">
                            <Highlight text={row.nama} query={activeQuery} />
                          </div>
                          {row.nomor_peserta && (
                            <div className="cell-nama__nomor">
                              <Highlight text={row.nomor_peserta} query={activeQuery} />
                            </div>
                          )}
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="cell-nomor">
                          <Highlight text={row.nomor_peserta} query={activeQuery} />
                        </td>
                        <td className="cell-nama">
                          <Highlight text={row.nama} query={activeQuery} />
                        </td>
                      </>
                    )}

                    {isGlobal && (
                      <td className="cell-formasi-info cell-formasi-combined">
                        <div className="cell-jabatan-text">{row.jabatanNama || row.jabatanKode || '-'}</div>
                        {(row.lokasiNama || row.lokasiKode) && (
                          <span className="formasi-chip formasi-chip--lokasi">
                            {row.lokasiNama || row.lokasiKode}
                          </span>
                        )}
                      </td>
                    )}

                    {isSkt ? (
                      <>
                        {/* Kolom Kompetensi CAT */}
                        <td className="cell-score-group cell-kompetensi-cat">
                          <div className="score-group">
                            <div className="score-group__grid">
                              <div className="score-subitem">
                                <span className="score-subitem__label">{TABLE_HEADERS.teknis}</span>
                                <span className="score-subitem__val">{row.teknis ?? '-'}</span>
                              </div>
                              <div className="score-subitem">
                                <span className="score-subitem__label">{TABLE_HEADERS.manajerial}</span>
                                <span className="score-subitem__val">{row.manajerial ?? '-'}</span>
                              </div>
                              <div className="score-subitem">
                                <span className="score-subitem__label">{TABLE_HEADERS.sosialKultural}</span>
                                <span className="score-subitem__val">{row.sosial_kultural ?? '-'}</span>
                              </div>
                              <div className="score-subitem">
                                <span className="score-subitem__label">{TABLE_HEADERS.wawancara}</span>
                                <span className="score-subitem__val">{row.wawancara ?? '-'}</span>
                              </div>
                            </div>
                            <div className="score-subitem-total">
                              <span className="score-subitem-total__label">{TABLE_HEADERS.totalCat}</span>
                              <span className="score-subitem-total__val">{row.total_cat ?? '-'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Kolom Kompetensi Tambahan */}
                        <td className="cell-score-group cell-kompetensi-tambahan">
                          <div className="score-group">
                            <div className="score-group__grid">
                              <div
                                className={`score-subitem${row.inggris === undefined && row.wawancara_skt === undefined ? ' score-subitem--full' : ''}`}
                              >
                                <span className="score-subitem__label">{TABLE_HEADERS.psikotes}</span>
                                <span className="score-subitem__val">{row.psikotes ?? '-'}</span>
                              </div>
                              {row.inggris !== undefined && (
                                <div className="score-subitem">
                                  <span className="score-subitem__label">{TABLE_HEADERS.inggris}</span>
                                  <span className="score-subitem__val">{row.inggris ?? '-'}</span>
                                </div>
                              )}
                              {row.wawancara_skt !== undefined && (
                                <div className="score-subitem score-subitem--full">
                                  <span className="score-subitem__label">{TABLE_HEADERS.wawancaraSkt}</span>
                                  <span className="score-subitem__val">{row.wawancara_skt ?? '-'}</span>
                                </div>
                              )}
                            </div>
                            <div className="score-subitem-total score-subitem-total--skt">
                              <span className="score-subitem-total__label">{TABLE_HEADERS.totalSkt}</span>
                              <span className="score-subitem-total__val">{row.total_skt ?? row.psikotes ?? '-'}</span>
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="cell-score cell-teknis">{row.teknis ?? '-'}</td>
                        <td className="cell-score cell-manajerial">{row.manajerial ?? '-'}</td>
                        <td className="cell-score cell-soskul">{row.sosial_kultural ?? '-'}</td>
                        <td className="cell-score cell-wawancara">{row.wawancara ?? '-'}</td>
                      </>
                    )}
                    <td className="cell-total">
                      <span className="desktop-total-val">{row.total ?? '-'}</span>
                    </td>
                    <td className="cell-status">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Tampilan Mobile Cards (hanya di max-width: 768px, bebas scroll horizontal) */}
          <div className="results-cards__mobile">
            {/* Daftar Kartu Peserta */}
            <div className="participant-card-list">
              {displayItems.map((row, i) => (
                <article key={`${row.nomor_peserta || row.no}-${i}`} className="participant-card">
                  {/* Header Kartu: Peringkat, Status, & Total Skor */}
                  <div className="participant-card__header">
                    <div className="participant-card__badges">
                      <span className="participant-card__rank">
                        {MOBILE.rankLabel(indexOfFirstItem + i + 1)}
                      </span>
                      <StatusBadge status={row.status} />
                    </div>
                    <div className="participant-card__total">
                      <span className="participant-card__total-label">{isSkt ? TABLE_HEADERS.totalIntegrasi : MOBILE.totalSkorLabel}</span>
                      <span className="participant-card__total-val">{row.total ?? '-'}</span>
                    </div>
                  </div>

                  {/* Identitas: Nama & Nomor Peserta */}
                  <div className="participant-card__identity">
                    <h3 className="participant-card__nama">
                      <Highlight text={row.nama} query={activeQuery} />
                    </h3>
                    <div className="participant-card__nomor">
                      <span className="participant-card__nomor-label">{TABLE_HEADERS.nomorPeserta}:</span>
                      <span className="participant-card__nomor-val">
                        <Highlight text={row.nomor_peserta} query={activeQuery} />
                      </span>
                    </div>
                  </div>

                  {/* Informasi Formasi (Mode Global) */}
                  {isGlobal && (row.jabatanNama || row.jabatanKode || row.lokasiNama || row.lokasiKode) && (
                    <div className="participant-card__formation">
                      <span className="participant-card__jabatan">
                        {row.jabatanNama || row.jabatanKode || '-'}
                      </span>
                      {(row.lokasiNama || row.lokasiKode) && (
                        <span className="formasi-chip formasi-chip--lokasi">
                          {row.lokasiNama || row.lokasiKode}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rincian Nilai / Skor */}
                  {isSkt ? (
                    <div className="participant-card__skt-groups">
                      {/* Kelompok Kompetensi CAT */}
                      <div className="card-score-group">
                        <div className="card-score-group__header">
                          <span className="card-score-group__title">{TABLE_HEADERS.kompetensiCat}</span>
                          <span className="card-score-group__total">
                            {TABLE_HEADERS.totalCat}: <strong>{row.total_cat ?? '-'}</strong>
                          </span>
                        </div>
                        <div className="card-score-group__grid">
                          <div className="participant-card__score-item">
                            <span className="score-label">{TABLE_HEADERS.teknis}</span>
                            <span className="score-value">{row.teknis ?? '-'}</span>
                          </div>
                          <div className="participant-card__score-item">
                            <span className="score-label">{TABLE_HEADERS.manajerial}</span>
                            <span className="score-value">{row.manajerial ?? '-'}</span>
                          </div>
                          <div className="participant-card__score-item">
                            <span className="score-label">{TABLE_HEADERS.sosialKultural}</span>
                            <span className="score-value">{row.sosial_kultural ?? '-'}</span>
                          </div>
                          <div className="participant-card__score-item">
                            <span className="score-label">{TABLE_HEADERS.wawancara}</span>
                            <span className="score-value">{row.wawancara ?? '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Kelompok Kompetensi Tambahan */}
                      <div className="card-score-group card-score-group--skt">
                        <div className="card-score-group__header">
                          <span className="card-score-group__title">{TABLE_HEADERS.kompetensiTambahan}</span>
                          <span className="card-score-group__total">
                            {TABLE_HEADERS.totalSkt}: <strong>{row.total_skt ?? row.psikotes ?? '-'}</strong>
                          </span>
                        </div>
                        <div className="card-score-group__grid">
                          <div
                            className={`participant-card__score-item${row.inggris === undefined && row.wawancara_skt === undefined ? ' participant-card__score-item--full' : ''}`}
                          >
                            <span className="score-label">{TABLE_HEADERS.psikotes}</span>
                            <span className="score-value">{row.psikotes ?? '-'}</span>
                          </div>
                          {row.inggris !== undefined && (
                            <div className="participant-card__score-item">
                              <span className="score-label">{TABLE_HEADERS.inggris}</span>
                              <span className="score-value">{row.inggris ?? '-'}</span>
                            </div>
                          )}
                          {row.wawancara_skt !== undefined && (
                            <div className="participant-card__score-item participant-card__score-item--full">
                              <span className="score-label">{TABLE_HEADERS.wawancaraSkt}</span>
                              <span className="score-value">{row.wawancara_skt ?? '-'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="participant-card__scores">
                      <div className="participant-card__score-item">
                        <span className="score-label">{TABLE_HEADERS.teknis}</span>
                        <span className="score-value">{row.teknis ?? '-'}</span>
                      </div>
                      <div className="participant-card__score-item">
                        <span className="score-label">{TABLE_HEADERS.manajerial}</span>
                        <span className="score-value">{row.manajerial ?? '-'}</span>
                      </div>
                      <div className="participant-card__score-item">
                        <span className="score-label">{TABLE_HEADERS.sosialKultural}</span>
                        <span className="score-value">{row.sosial_kultural ?? '-'}</span>
                      </div>
                      <div className="participant-card__score-item">
                        <span className="score-label">{TABLE_HEADERS.wawancara}</span>
                        <span className="score-value">{row.wawancara ?? '-'}</span>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Pagination & Legend (hanya jika ada data) ─────────── */}
      {!emptyVariant && (
        <>
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
            <div className="status-legend__title">{STATUS.legend.title}</div>
            <div className="status-legend__items">
              {STATUS.legend.items.map(({ code, desc, lulus }) => (
                <span key={code} className="status-legend__item">
                  <strong className={`legend-badge legend-badge--${lulus ? 'lulus' : 'tl'}`}>
                    {code}
                  </strong>
                  {' '}{desc}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {showScrollTop && (
        <button
          type="button"
          className="scroll-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={STATUS.scrollTopLabel}
          title={STATUS.scrollTopLabel}
        >
          ↑
        </button>
      )}
    </div>
  )
}
