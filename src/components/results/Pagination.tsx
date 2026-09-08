/* ── Pagination ──────────────────────────────────────────────
   Komponen navigasi halaman (prev/next/nomor halaman).
   ─────────────────────────────────────────────────────────── */
import React from 'react'
import { PAGINATION } from '../../constants/strings'

interface PaginationProps {
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalItems: number
  totalPages: number
  indexOfFirstItem: number
  indexOfLastItem: number
  itemsPerPage: number
  hasSearched: boolean
}

export default function Pagination({
  currentPage,
  setCurrentPage,
  totalItems,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  itemsPerPage,
  hasSearched,
}: PaginationProps) {
  if (totalItems <= itemsPerPage) return null

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const range = 2

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      const start = Math.max(2, currentPage - range)
      const end = Math.min(totalPages - 1, currentPage + range)

      if (start > 2) pages.push('...')
      for (let i = start; i <= end; i++) pages.push(i)
      if (end < totalPages - 1) pages.push('...')

      pages.push(totalPages)
    }
    return pages
  }

  const safeLastItem = Math.min(indexOfLastItem, totalItems)

  return (
    <div className="pagination" role="navigation" aria-label={PAGINATION.navLabel}>
      <div className="pagination__info">
        Menampilkan{' '}
        <strong>{indexOfFirstItem + 1}</strong>–<strong>{safeLastItem}</strong>{' '}
        dari <strong>{totalItems.toLocaleString('id-ID')}</strong>{' '}
        {hasSearched ? PAGINATION.itemTypeResult : PAGINATION.itemTypePeserta}
      </div>

      <div className="pagination__buttons">
        <button
          className="pagination__btn"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          aria-label={PAGINATION.first}
          title={PAGINATION.first}
        >
          &laquo;
        </button>

        <button
          className="pagination__btn"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          aria-label={PAGINATION.prev}
          title={PAGINATION.prev}
        >
          &lsaquo;
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="pagination__ellipsis" aria-hidden="true">
                &hellip;
              </span>
            )
          }
          const pageNum = p as number
          return (
            <button
              key={`page-${p}`}
              className={`pagination__btn${currentPage === pageNum ? ' active' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
              aria-label={PAGINATION.pageLabel(pageNum)}
              aria-current={currentPage === pageNum ? 'page' : undefined}
            >
              {p}
            </button>
          )
        })}

        <button
          className="pagination__btn"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          aria-label={PAGINATION.next}
          title={PAGINATION.next}
        >
          &rsaquo;
        </button>

        <button
          className="pagination__btn"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          aria-label={PAGINATION.last}
          title={PAGINATION.last}
        >
          &raquo;
        </button>
      </div>
    </div>
  )
}
