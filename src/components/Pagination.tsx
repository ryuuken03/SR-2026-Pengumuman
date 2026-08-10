import React from 'react'

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
    <div className="pagination" role="navigation" aria-label="Navigasi halaman">
      <div className="pagination__info">
        Menampilkan{' '}
        <strong>{indexOfFirstItem + 1}</strong>–<strong>{safeLastItem}</strong>{' '}
        dari <strong>{totalItems.toLocaleString('id-ID')}</strong>{' '}
        {hasSearched ? 'hasil' : 'peserta'}
      </div>

      <div className="pagination__buttons">
        <button
          className="pagination__btn"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          aria-label="Halaman pertama"
          title="Halaman pertama"
        >
          &laquo;
        </button>

        <button
          className="pagination__btn"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
          title="Halaman sebelumnya"
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
              aria-label={`Halaman ${p}`}
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
          aria-label="Halaman berikutnya"
          title="Halaman berikutnya"
        >
          &rsaquo;
        </button>

        <button
          className="pagination__btn"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Halaman terakhir"
          title="Halaman terakhir"
        >
          &raquo;
        </button>
      </div>
    </div>
  )
}
