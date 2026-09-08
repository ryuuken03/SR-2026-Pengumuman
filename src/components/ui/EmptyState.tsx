/* ── EmptyState ──────────────────────────────────────────────
   Komponen informasi ketika tabel kosong.
   Menampilkan panduan penggunaan sesuai konteks (mode global,
   mode formasi, tidak ditemukan, dsb.)
   ─────────────────────────────────────────────────────────── */
import { EMPTY } from '../../constants/strings'
import type { SearchScope } from '../../hooks/useSelkomSearch'

interface EmptyStateProps {
  /** Tipe kondisi empty yang sedang terjadi */
  variant: 'loading' | 'global-idle' | 'formasi-idle' | 'not-found' | 'no-data'
  /** Query yang dicari (digunakan pada variant 'not-found') */
  activeQuery?: string
  /** Scope pencarian aktif */
  searchScope?: SearchScope
}

export default function EmptyState({ variant, activeQuery = '' }: EmptyStateProps) {
  if (variant === 'loading') {
    const { title, desc } = EMPTY.loading
    return (
      <div className="empty-state-wrapper">
        <h2 className="empty-state__title">{title}</h2>
        <p className="empty-state__desc">{desc}</p>
      </div>
    )
  }

  if (variant === 'global-idle') {
    const { title, hint } = EMPTY.globalIdle
    return (
      <div className="empty-state-wrapper">
        <h2 className="empty-state__title">{title}</h2>
        <p className="empty-state__desc">{hint}</p>
        {/* <p className="empty-state__hint">{hint}</p> */}
      </div>
    )
  }

  if (variant === 'formasi-idle') {
    const { title, descSteps, altHint } = EMPTY.formasiIdle
    return (
      <div className="empty-state-wrapper">
        <h2 className="empty-state__title">{title}</h2>
        <ol className="empty-state__steps" aria-label={EMPTY.formasiIdle.stepsLabel}>
          {descSteps.map((step, i) => (
            <li key={i} className="empty-state__step">
              <span className="empty-state__step-num" aria-hidden="true">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="empty-state__alt-hint">{altHint}</p>
      </div>
    )
  }

  if (variant === 'not-found') {
    const { title, desc, hint } = EMPTY.notFound(activeQuery)
    return (
      <div className="empty-state-wrapper">
        <h2 className="empty-state__title">{title}</h2>
        <p className="empty-state__desc">{desc}</p>
        <p className="empty-state__hint">{hint}</p>
      </div>
    )
  }

  // variant === 'no-data'
  const { title, desc } = EMPTY.noData
  return (
    <div className="empty-state-wrapper">
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__desc">{desc}</p>
    </div>
  )
}


/** Pilih variant EmptyState yang sesuai dari konteks tabel */
export function resolveEmptyVariant({
  loading,
  isGlobal,
  activeQuery,
  selectedJabatan,
  selectedLokasi,
  displayItemsLength,
}: {
  loading: boolean
  isGlobal: boolean
  activeQuery: string
  selectedJabatan: string
  selectedLokasi: string
  displayItemsLength: number
}): EmptyStateProps['variant'] | null {
  if (loading) return 'loading'
  if (isGlobal && !activeQuery.trim()) return 'global-idle'
  if (!isGlobal && (!selectedJabatan || !selectedLokasi)) return 'formasi-idle'
  if (displayItemsLength === 0 && activeQuery.trim()) return 'not-found'
  if (displayItemsLength === 0) return 'no-data'
  return null // ada data — jangan render EmptyState
}
