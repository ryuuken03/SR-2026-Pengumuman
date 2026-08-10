import type { SelkomSummary } from '../hooks/useSelkomSearch'

interface SummaryCardProps {
  summary: SelkomSummary | null
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary) return null

  const jabatanFull = summary['Jabatan Formasi'] || ''
  const lokasiFull = summary['Lokasi Formasi'] || ''
  const instansi = summary['Instansi'] || ''

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
  const jenisFull = summary['Jenis Formasi'] || ''
  const jenisLabel = jenisFull.includes(' - ') ? jenisFull.split(' - ').slice(1).join(' - ') : jenisFull

  return (
    <div className="summary-card" role="region" aria-label="Ringkasan formasi">
      <p className="summary-card__title">📋 Ringkasan Formasi</p>

      <div className="summary-card__header">
        <p className="summary-card__jabatan">{jabatanLabel || jabatanFull}</p>
        <p className="summary-card__lokasi">
          {lokasiLabel} {jenisLabel ? `· ${jenisLabel}` : ''}
        </p>
        {instansi && (
          <p className="summary-card__lokasi" style={{ marginTop: 2, fontSize: '11px', opacity: 0.7 }}>
            {instansi}
          </p>
        )}
      </div>

      <div className="summary-card__stat">
        <span className="summary-card__stat-label">Formasi</span>
        <span className="summary-card__stat-value summary-card__stat-value--brand">
          {jumlahFormasi?.toLocaleString('id-ID') ?? '-'}
        </span>
      </div>

      <div className="summary-card__stat">
        <span className="summary-card__stat-label">Peserta</span>
        <span className="summary-card__stat-value">
          {jumlahPeserta?.toLocaleString('id-ID') ?? '-'}
        </span>
      </div>

      <div className="summary-card__stat">
        <span className="summary-card__stat-label">Lulus / Diangkat</span>
        <span className="summary-card__stat-value summary-card__stat-value--brand">
          {kelulusan?.toLocaleString('id-ID') ?? '-'}
        </span>
      </div>

      <div className="summary-card__stat">
        <span className="summary-card__stat-label">Kehadiran</span>
        <span className="summary-card__stat-value" style={{ fontSize: '14px' }}>
          {kehadiran || '-'}
        </span>
      </div>

      {nilaiUjian.tertinggi !== undefined && (
        <div className="summary-card__stat">
          <span className="summary-card__stat-label">Nilai Tertinggi</span>
          <span className="summary-card__stat-value">
            {nilaiUjian.tertinggi}
          </span>
        </div>
      )}

      {nilaiUjian.terendah !== undefined && (
        <div className="summary-card__stat">
          <span className="summary-card__stat-label">Nilai Terendah</span>
          <span className="summary-card__stat-value">
            {nilaiUjian.terendah}
          </span>
        </div>
      )}
    </div>
  )
}
