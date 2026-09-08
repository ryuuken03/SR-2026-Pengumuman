/* ── AppFooter ────────────────────────────────────────────────
   Komponen footer aplikasi dengan disclaimer resmi, navigasi,
   dan versioning interaktif.
   ─────────────────────────────────────────────────────────── */

import { FOOTER, APP_VERSION, NAV } from '../../constants/strings'

interface AppFooterProps {
  activeTab: 'search' | 'about'
  onNavigate: (tab: 'search' | 'about') => void
  onOpenChangelog: () => void
}

export default function AppFooter({ activeTab, onNavigate, onOpenChangelog }: AppFooterProps) {
  return (
    <footer className="app-footer">
      <div className="app-footer__main">
        <div className="app-footer__disclaimer-block">
          <div className="app-footer__disclaimer-row">
            <span className="app-footer__disclaimer">{FOOTER.disclaimerText}</span>
            <a
              href={FOOTER.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-reference-source btn-reference-source--footer"
            >
              <span>{FOOTER.sourceButtonText}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
          <p className="app-footer__copy">{FOOTER.copyright}</p>
        </div>

        <nav className="app-footer__nav" aria-label="Navigasi Footer">
          <button
            type="button"
            className={`app-footer__link ${activeTab === 'search' ? 'app-footer__link--active' : ''}`}
            onClick={() => onNavigate('search')}
          >
            {NAV.searchTab}
          </button>
          <span className="app-footer__separator" aria-hidden="true">·</span>
          <button
            type="button"
            className={`app-footer__link ${activeTab === 'about' ? 'app-footer__link--active' : ''}`}
            onClick={() => onNavigate('about')}
          >
            {NAV.aboutTab}
          </button>
        </nav>
      </div>

      <div className="app-footer__meta">
        <button
          type="button"
          className="app-footer__version-btn"
          onClick={onOpenChangelog}
          title={FOOTER.versionTooltip}
          aria-label={`${FOOTER.versionTooltip} (${APP_VERSION.badge})`}
        >
          <span className="app-footer__version-text">{APP_VERSION.badge}</span>
        </button>
      </div>
    </footer>
  )
}
