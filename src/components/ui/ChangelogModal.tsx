/* ── ChangelogModal ───────────────────────────────────────────
   Modal Catatan Pembaruan (Changelog Modal)
   Menampilkan riwayat versi dan catatan rilis umum bertingkat,
   diselaraskan dengan standar arsitektur KKMP 2026.
   ─────────────────────────────────────────────────────────── */

import { useEffect } from 'react'
import { APP_CHANGELOG } from '../../config/changelog'

interface ChangelogModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-modal-title"
    >
      <div
        className="changelog-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="changelog-modal-header">
          <div className="changelog-modal-title-row">
            <h3 id="changelog-modal-title" className="changelog-modal-title">
              Catatan Pembaruan
            </h3>
            <span className="changelog-modal-badge">
              {APP_CHANGELOG[0]?.version || 'v1.0.0'}
            </span>
          </div>
          <button
            type="button"
            className="changelog-modal-close-btn"
            onClick={onClose}
            aria-label="Tutup catatan pembaruan"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Daftar Riwayat Versi */}
        <div className="changelog-modal-body">
          {APP_CHANGELOG.map((release) => (
            <div key={release.version} className="changelog-release-block">
              <div className="changelog-release-header">
                <div className="changelog-version-tag-group">
                  <span className="changelog-version-tag">{release.version}</span>
                  <span
                    className={`changelog-status-pill ${
                      release.isLatest ? 'latest' : ''
                    }`}
                  >
                    {release.badge}
                  </span>
                </div>
                <span className="changelog-release-date">{release.date}</span>
              </div>

              {release.summary && (
                <p className="changelog-release-summary">{release.summary}</p>
              )}

              {/* Poin Perubahan Versi Umum */}
              <ul className="changelog-item-list">
                {release.publicNotes.map((note, idx) => (
                  <li key={idx} className="changelog-item">
                    <span className={`changelog-pill-type ${note.type}`}>
                      {note.label}
                    </span>
                    <span className="changelog-item-text">{note.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Modal */}
        <div className="changelog-modal-footer">
          <button
            type="button"
            className="changelog-btn-close"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
