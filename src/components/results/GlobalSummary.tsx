/* ── GlobalSummary ────────────────────────────────────────────
   Komponen rekapitulasi statistik komparasi PPPK Guru vs Teknis
   bersifat expandable (default: collapsed) dengan tabel responsif & kartu mobile.
   ─────────────────────────────────────────────────────────── */
import { useState } from 'react'
import { REKAP, DATA_SOURCE } from '../../constants/strings'
import selkomStats from '../../assets/selkom/rekap_stats.json'
import sktStats from '../../assets/skt/rekap_stats.json'
import type { DataSource } from '../../hooks/useSelkomSearch'

interface CategoryStats {
  jabatan: number
  lokasi: number
  terdaftar: number
  pl: number
  pl2?: number
  p: number
  th: number
  tms: number
  aps: number
}

interface RekapStatsData {
  generatedAt?: string
  guru: CategoryStats
  teknis: CategoryStats
  total: CategoryStats
}

interface MetricItem {
  key: string
  title: string
  badge?: string
  badgeClass?: string
  guru: number
  teknis: number
  total: number
  highlight?: boolean
  variant?: 'primary' | 'success' | 'muted'
}

interface MetricGroup {
  id: string
  title: string
  icon: React.ReactNode
  items: MetricItem[]
}

const fmt = (num: number): string => num.toLocaleString('id-ID')

interface GlobalSummaryProps {
  dataSource?: DataSource
}

export default function GlobalSummary({ dataSource = 'selkom' }: GlobalSummaryProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const stats: RekapStatsData = dataSource === 'skt' ? sktStats : selkomStats

  const toggleOpen = () => {
    setIsOpen(prev => !prev)
  }

  const metricGroups: MetricGroup[] = [
    {
      id: 'formasi',
      title: REKAP.catFormasi,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      ),
      items: [
        {
          key: 'jabatan',
          title: REKAP.metricJabatan,
          guru: stats.guru.jabatan,
          teknis: stats.teknis.jabatan,
          total: stats.total.jabatan,
        },
        {
          key: 'lokasi',
          title: REKAP.metricLokasi,
          guru: stats.guru.lokasi,
          teknis: stats.teknis.lokasi,
          total: stats.total.lokasi,
        },
      ],
    },
    {
      id: 'peserta',
      title: REKAP.catPeserta,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      items: [
        {
          key: 'terdaftar',
          title: REKAP.metricTerdaftar,
          guru: stats.guru.terdaftar,
          teknis: stats.teknis.terdaftar,
          total: stats.total.terdaftar,
          highlight: true,
          variant: 'primary',
        },
        {
          key: 'pl',
          title: REKAP.metricPL,
          badge: 'P/L',
          badgeClass: 'status-badge--pl',
          guru: stats.guru.pl,
          teknis: stats.teknis.pl,
          total: stats.total.pl,
          variant: 'success',
        },
        ...((stats.guru.pl2 ?? 0) > 0 || (stats.teknis.pl2 ?? 0) > 0 || (stats.total.pl2 ?? 0) > 0
          ? [
            {
              key: 'pl2',
              title: REKAP.metricPL2,
              badge: 'P/L-2',
              badgeClass: 'status-badge--pl2',
              guru: stats.guru.pl2 ?? 0,
              teknis: stats.teknis.pl2 ?? 0,
              total: stats.total.pl2 ?? 0,
              variant: 'success' as const,
            },
          ]
          : []),
        {
          key: 'p',
          title: REKAP.metricP,
          badge: 'P',
          badgeClass: 'status-badge--p',
          guru: stats.guru.p,
          teknis: stats.teknis.p,
          total: stats.total.p,
        },
        {
          key: 'th',
          title: REKAP.metricTH,
          badge: 'TH',
          badgeClass: 'status-badge--th',
          guru: stats.guru.th,
          teknis: stats.teknis.th,
          total: stats.total.th,
          variant: 'muted',
        },
        ...(stats.guru.tms > 0 || stats.teknis.tms > 0
          ? [
            {
              key: 'tms',
              title: REKAP.metricTMS,
              badge: 'TMS',
              badgeClass: 'status-badge--tms',
              guru: stats.guru.tms,
              teknis: stats.teknis.tms,
              total: stats.total.tms,
              variant: 'muted' as const,
            },
          ]
          : []),
        ...(stats.guru.aps > 0 || stats.teknis.aps > 0
          ? [
            {
              key: 'aps',
              title: REKAP.metricAPS,
              badge: 'APS',
              badgeClass: 'status-badge--aps',
              guru: stats.guru.aps,
              teknis: stats.teknis.aps,
              total: stats.total.aps,
              variant: 'muted' as const,
            },
          ]
          : []),
      ],
    },
  ]

  return (
    <section className="global-summary" aria-label={REKAP.title}>
      {/* ── Toggle Header Button ─────────────────────────────── */}
      <button
        type="button"
        className={`global-summary__trigger ${isOpen ? 'global-summary__trigger--open' : ''}`}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls="global-summary-body"
        aria-label={REKAP.toggleAria}
      >
        <div className="global-summary__trigger-main">
          <div className="global-summary__icon-badge" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>

          <div className="global-summary__trigger-text">
            <span className="global-summary__title">{REKAP.title}</span>
            <span className="global-summary__subtitle">
              {dataSource === 'skt' ? DATA_SOURCE.sktOption : DATA_SOURCE.catOption}
            </span>
          </div>
        </div>

        <div className="global-summary__trigger-side">
          <span className="global-summary__preview-pill">
            {REKAP.preview(stats.total.terdaftar, stats.total.jabatan)}
          </span>

          <div
            className={`global-summary__chevron ${isOpen ? 'global-summary__chevron--open' : ''}`}
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </button>

      {/* ── Expandable Body Content ──────────────────────────── */}
      {isOpen && (
        <div id="global-summary-body" className="global-summary__body" role="region">
          {/* 1. Tampilan Desktop Table (> 768px) */}
          <div className="global-summary__desktop-table global-summary__table-wrapper">
            <table className="global-summary__table">
              <thead>
                <tr>
                  <th scope="col" className="global-summary__th-indikator">
                    {REKAP.colIndikator}
                  </th>
                  <th scope="col" className="global-summary__th-col global-summary__th-col--guru">
                    <span className="global-summary__th-badge global-summary__th-badge--guru">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                      {REKAP.colGuru}
                    </span>
                  </th>
                  <th scope="col" className="global-summary__th-col global-summary__th-col--teknis">
                    <span className="global-summary__th-badge global-summary__th-badge--teknis">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      {REKAP.colTeknis}
                    </span>
                  </th>
                  <th scope="col" className="global-summary__th-col global-summary__th-col--total">
                    <span className="global-summary__th-badge global-summary__th-badge--total">
                      {REKAP.colTotal}
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {metricGroups.map(group => (
                  <tr key={group.id} className="global-summary__group-fragment">
                    <td colSpan={4} className="global-summary__group-td">
                      <div className="global-summary__group-row-inner">
                        <span className="global-summary__group-label">
                          {group.icon}
                          {group.title}
                        </span>
                      </div>
                    </td>
                  </tr>
                )).reduce<React.ReactNode[]>((acc, _, idx) => {
                  const group = metricGroups[idx]
                  acc.push(
                    <tr key={`group-${group.id}`} className="global-summary__group-row">
                      <td colSpan={4}>
                        <span className="global-summary__group-label">
                          {group.icon}
                          {group.title}
                        </span>
                      </td>
                    </tr>
                  )
                  group.items.forEach(item => {
                    acc.push(
                      <tr key={item.key} className={item.highlight ? 'global-summary__row--highlight' : ''}>
                        <td className="global-summary__td-metric">
                          {item.badge ? (
                            <div className="global-summary__metric-with-badge">
                              <span className={`status-badge ${item.badgeClass || ''}`}>{item.badge}</span>
                              <span className="global-summary__metric-title">{item.title}</span>
                            </div>
                          ) : (
                            <span className="global-summary__metric-title">{item.title}</span>
                          )}
                        </td>
                        <td className={`global-summary__td-val ${item.variant ? `global-summary__td-val--${item.variant}` : ''}`}>
                          {fmt(item.guru)}
                        </td>
                        <td className={`global-summary__td-val ${item.variant ? `global-summary__td-val--${item.variant}` : ''}`}>
                          {fmt(item.teknis)}
                        </td>
                        <td className={`global-summary__td-val global-summary__td-val--total ${item.variant ? `global-summary__td-val--${item.variant}` : ''}`}>
                          {fmt(item.total)}
                        </td>
                      </tr>
                    )
                  })
                  return acc
                }, [])}
              </tbody>
            </table>
          </div>

          {/* 2. Tampilan Mobile Cards (≤ 768px, bebas scroll horizontal) */}
          <div className="global-summary__mobile-cards">
            {metricGroups.map(group => (
              <div key={group.id} className="global-summary__mobile-group">
                <div className="global-summary__mobile-group-header">
                  <span className="global-summary__group-label">
                    {group.icon}
                    {group.title}
                  </span>
                </div>

                <div className="global-summary__mobile-items">
                  {group.items.map(item => (
                    <div
                      key={item.key}
                      className={`global-summary__card ${item.highlight ? 'global-summary__card--highlight' : ''}`}
                    >
                      <div className="global-summary__card-header">
                        {item.badge && (
                          <span className={`status-badge ${item.badgeClass || ''}`}>
                            {item.badge}
                          </span>
                        )}
                        <span className="global-summary__card-title">{item.title}</span>
                      </div>

                      <div className="global-summary__card-grid">
                        <div className="global-summary__card-col global-summary__card-col--guru">
                          <span className="global-summary__col-label">{REKAP.mobileColGuru}</span>
                          <span className={`global-summary__col-val ${item.variant ? `global-summary__col-val--${item.variant}` : ''}`}>
                            {fmt(item.guru)}
                          </span>
                        </div>

                        <div className="global-summary__card-col global-summary__card-col--teknis">
                          <span className="global-summary__col-label">{REKAP.mobileColTeknis}</span>
                          <span className={`global-summary__col-val ${item.variant ? `global-summary__col-val--${item.variant}` : ''}`}>
                            {fmt(item.teknis)}
                          </span>
                        </div>

                        <div className="global-summary__card-col global-summary__card-col--total">
                          <span className="global-summary__col-label">{REKAP.mobileColTotal}</span>
                          <span className={`global-summary__col-val global-summary__col-val--total-highlight ${item.variant ? `global-summary__col-val--${item.variant}` : ''}`}>
                            {fmt(item.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* <div className="global-summary__footer">
            <p>{REKAP.footerNote}</p>
          </div> */}
        </div>
      )}
    </section>
  )
}
