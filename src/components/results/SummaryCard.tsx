/* ── SummaryCard ─────────────────────────────────────────────
   Menampilkan ringkasan statistik formasi yang dipilih.
   ─────────────────────────────────────────────────────────── */
import { useState } from 'react'
import type { SelkomSummary } from '../../hooks/useSelkomSearch'
import { SUMMARY } from '../../constants/strings'

interface SummaryCardProps {
  summary: SelkomSummary | null
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  if (!summary) return null

  const jabatanFull = summary['Jabatan Formasi'] || ''
  const lokasiFull = summary['Lokasi Formasi'] || ''
  const jabatanLabel = jabatanFull.includes(' - ')
    ? jabatanFull.split(' - ').slice(1).join(' - ')
    : jabatanFull
  const lokasiLabel = lokasiFull.includes(' - ')
    ? lokasiFull.split(' - ').slice(1).join(' - ')
    : lokasiFull

  const nilaiUjian = summary['Nilai Ujian'] || {}
  const kelulusan = summary['Kelulusan']
  const jumlahFormasi = summary['Jumlah Formasi']
  const jumlahPeserta = summary['Jumlah Peserta']
  const kehadiran = summary['Kehadiran'] || ''

  const formasiFormatted = jumlahFormasi?.toLocaleString('id-ID') ?? '-'
  const pesertaFormatted = jumlahPeserta?.toLocaleString('id-ID') ?? '-'
  const kelulusanFormatted = kelulusan?.toLocaleString('id-ID') ?? '-'

  return (
    <div
      className={`summary-card ${isCollapsed ? 'summary-card--collapsed' : ''}`}
      role="region"
      aria-label={SUMMARY.regionLabel}
    >
      <div className="summary-card__header">
        <div className="summary-card__header-top">
          <p className="summary-card__title">{SUMMARY.title}</p>
          <button
            type="button"
            className="summary-card__toggle-btn"
            onClick={() => setIsCollapsed(prev => !prev)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? SUMMARY.expand : SUMMARY.collapse}
            title={isCollapsed ? SUMMARY.expand : SUMMARY.collapse}
          >
            <span className="summary-card__toggle-text">
              {isCollapsed ? SUMMARY.expand : SUMMARY.collapse}
            </span>
            <svg
              className={`summary-card__toggle-icon ${isCollapsed ? 'summary-card__toggle-icon--collapsed' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <p className="summary-card__jabatan">{jabatanLabel || jabatanFull}</p>
        <p className="summary-card__lokasi">
          {lokasiLabel}
          {/* {jenisLabel ? `· ${jenisLabel}` : ''} */}
        </p>
        {/* {instansi && (
          <p className="summary-card__instansi">
            {instansi}
          </p>
        )} */}

        {isCollapsed && (
          <div className="summary-card__collapsed-stats">
            <span className="summary-card__collapsed-pill">
              <strong>{SUMMARY.formasi}:</strong> {formasiFormatted}
            </span>
            <span className="summary-card__collapsed-pill">
              <strong>{SUMMARY.peserta}:</strong> {pesertaFormatted}
            </span>
            <span className="summary-card__collapsed-pill">
              <strong>{SUMMARY.kelulusan}:</strong> {kelulusanFormatted}
            </span>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="summary-card__stats">
          <div className="summary-card__stat summary-card__stat--formasi">
            <span className="summary-card__stat-label">{SUMMARY.formasi}</span>
            <span className="summary-card__stat-value summary-card__stat-value--brand">
              {formasiFormatted}
            </span>
          </div>

          <div className="summary-card__stat summary-card__stat--peserta">
            <span className="summary-card__stat-label">{SUMMARY.peserta}</span>
            <span className="summary-card__stat-value">
              {pesertaFormatted}
            </span>
          </div>

          <div className="summary-card__stat summary-card__stat--kelulusan">
            <span className="summary-card__stat-label">{SUMMARY.kelulusan}</span>
            <span className="summary-card__stat-value summary-card__stat-value--brand">
              {kelulusanFormatted}
            </span>
          </div>

          {nilaiUjian.tertinggi !== undefined && (
            <div className="summary-card__stat summary-card__stat--score">
              <span className="summary-card__stat-label">{SUMMARY.nilaiTertinggi}</span>
              <span className="summary-card__stat-value summary-card__stat-value--score">
                {nilaiUjian.tertinggi}
              </span>
            </div>
          )}

          {nilaiUjian.terendah !== undefined && (
            <div className="summary-card__stat summary-card__stat--score">
              <span className="summary-card__stat-label">{SUMMARY.nilaiTerendah}</span>
              <span className="summary-card__stat-value summary-card__stat-value--score">
                {nilaiUjian.terendah}
              </span>
            </div>
          )}

          <div className="summary-card__stat summary-card__stat--kehadiran">
            <span className="summary-card__stat-label">{SUMMARY.kehadiran}</span>
            <span className="summary-card__stat-value summary-card__stat-value--kehadiran">
              {kehadiran || '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
