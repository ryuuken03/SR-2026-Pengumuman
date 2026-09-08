/* ── AboutPage ────────────────────────────────────────────────
   Halaman profil pengembang dengan 10 tahun pengalaman,
   kontak resmi (WA, Portofolio, Threads, GitHub),
   filosofi rekayasa perangkat lunak, disclaimer resmi,
   serta versioning aplikasi.
   ─────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { ABOUT, APP_VERSION, DEVELOPER_INFO } from '../../constants/strings'

interface AboutPageProps {
  onBackToSearch: () => void
  onOpenChangelog: () => void
}

export default function AboutPage({ onBackToSearch, onOpenChangelog }: AboutPageProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string>('')

  const showToast = (msg: string, key: string) => {
    setCopiedKey(key)
    setToastMessage(msg)
    setTimeout(() => {
      setCopiedKey(null)
      setToastMessage('')
    }, 2500)
  }

  const handleCopy = (text: string, label: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast(ABOUT.copySuccess(label), key)
        })
        .catch(() => {
          showToast(ABOUT.copyFailed(label), key)
        })
    }
  }

  return (
    <div className="about-page">
      {/* ── Tombol Navigasi Kembali ─────────────────────── */}
      <div className="about-nav-top">
        <button
          type="button"
          className="about-back-btn"
          onClick={onBackToSearch}
          aria-label={ABOUT.backToSearchAria}
        >
          {ABOUT.backToSearch}
        </button>
      </div>

      {/* ── Disclaimer Resmi ───────────────────────────── */}
      <section className="about-card about-disclaimer-card">
        <div className="about-disclaimer-content">
          <div className="about-disclaimer-text-group">
            <h3 className="about-section-heading">
              {ABOUT.disclaimerTitle}
            </h3>
            <p className="about-paragraph">
              {ABOUT.disclaimerText}
            </p>
          </div>
          <a
            href={ABOUT.disclaimerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-reference-source btn-reference-source--about"
          >
            <span>{ABOUT.sourceButtonText}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
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
      </section>

      {/* ── Profil & Kontak Pengembang ──────────────────── */}
      <section className="about-card developer-profile-card">
        <div className="developer-card-top">
          <div className="developer-avatar-wrapper">
            <img
              src="/profile.png"
              alt={DEVELOPER_INFO.NAME}
              className="developer-avatar"
              width="56"
              height="56"
              loading="lazy"
              decoding="async"
            />
            <span className="developer-status-dot" title={DEVELOPER_INFO.AVATAR_STATUS_TITLE} />
          </div>

          <div className="developer-header-info">
            <h3 className="developer-name">{DEVELOPER_INFO.NAME}</h3>
            <p className="developer-role">{DEVELOPER_INFO.ROLE}</p>
          </div>

          <p className="developer-bio">{DEVELOPER_INFO.BIO}</p>
        </div>

        {/* Action Grid Kontak & Sosial Media Pengembang */}
        <div className="developer-contact-grid">
          {/* Card WhatsApp */}
          <div className="contact-action-card">
            <div className="contact-card-icon-title">
              <div className="contact-icon-box whatsapp">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </div>
              <div className="contact-text-group">
                <span className="contact-label">{ABOUT.labelWhatsApp}</span>
              </div>
            </div>
            <div className="contact-btn-group">
              <a
                href={DEVELOPER_INFO.WA_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contact-action primary-whatsapp"
                title={ABOUT.titleWaChat}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>{ABOUT.btnChatWa}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(DEVELOPER_INFO.WA_PHONE, ABOUT.labelWhatsApp, 'wa')}
                className={`btn-copy-icon ${copiedKey === 'wa' ? 'copied' : ''}`}
                title={ABOUT.copyWaAria}
                aria-label={ABOUT.copyWaAria}
              >
                {copiedKey === 'wa' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Card Threads */}
          <div className="contact-action-card">
            <div className="contact-card-icon-title">
              <div className="contact-icon-box threads">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 340 376"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M267.149,173.742c-.469-54.261-29.885-86.958-79.575-86.958-33.166,0-61.058,15.001-75.708,38.909l32.111,22.384c8.321-13.126,19.806-24.025,40.901-24.025,23.791,0,36.096,13.243,39.612,37.854-11.485-1.758-22.97-2.695-34.807-2.695-64.223,0-94.459,29.064-94.459,67.504,0,39.143,30.236,62.113,74.77,62.113,48.87,0,78.052-32.932,90.005-73.715,12.423,5.625,20.978,18.751,20.978,38.44,0,52.738-60.824,81.45-112.39,81.45-76.059,0-125.75-49.925-125.75-131.141,0-99.498,65.746-163.252,154.111-163.252,59.301,0,88.599,26.017,108.522,60.941l32.815-22.97C316.605,33.342,268.204.997,195.543.997,79.755.997,1,83.15,1,202.337c0,108.991,77.114,172.276,168.995,172.276,75.942,0,152.705-44.3,152.705-120.125,0-39.612-22.736-65.863-55.55-80.747ZM168.588,249.332c-16.759,0-31.525-7.969-31.525-22.619,0-23.087,28.361-30.119,56.136-30.119,10.548,0,20.861.703,30.002,2.696-6.563,30.002-26.017,50.042-54.613,50.042Z" />
                </svg>
              </div>
              <div className="contact-text-group">
                <span className="contact-label">{ABOUT.labelThreads}</span>
              </div>
            </div>
            <div className="contact-btn-group">
              <a
                href={DEVELOPER_INFO.THREADS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contact-action outline"
                title={ABOUT.titleThreads}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>{ABOUT.btnFollow}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(DEVELOPER_INFO.THREADS_URL, ABOUT.labelThreads, 'threads')}
                className={`btn-copy-icon ${copiedKey === 'threads' ? 'copied' : ''}`}
                title={ABOUT.copyThreadsAria}
                aria-label={ABOUT.copyThreadsAria}
              >
                {copiedKey === 'threads' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Card Web Portofolio */}
          <div className="contact-action-card">
            <div className="contact-card-icon-title">
              <div className="contact-icon-box portfolio">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <div className="contact-text-group">
                <span className="contact-label">{ABOUT.labelPortfolio}</span>
              </div>
            </div>
            <div className="contact-btn-group">
              <a
                href={DEVELOPER_INFO.PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contact-action primary-brand"
                title={ABOUT.titlePortfolio}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>{ABOUT.btnVisit}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(DEVELOPER_INFO.PORTFOLIO_URL, ABOUT.labelPortfolio, 'portfolio')}
                className={`btn-copy-icon ${copiedKey === 'portfolio' ? 'copied' : ''}`}
                title={ABOUT.copyPortfolioAria}
                aria-label={ABOUT.copyPortfolioAria}
              >
                {copiedKey === 'portfolio' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Card GitHub Profile */}
          <div className="contact-action-card">
            <div className="contact-card-icon-title">
              <div className="contact-icon-box github">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </div>
              <div className="contact-text-group">
                <span className="contact-label">{ABOUT.labelGithub}</span>
              </div>
            </div>
            <div className="contact-btn-group">
              <a
                href={DEVELOPER_INFO.GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contact-action outline"
                title={ABOUT.titleGithub}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>{ABOUT.btnGithub}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(DEVELOPER_INFO.GITHUB_URL, ABOUT.labelGithub, 'github')}
                className={`btn-copy-icon ${copiedKey === 'github' ? 'copied' : ''}`}
                title={ABOUT.copyGithubAria}
                aria-label={ABOUT.copyGithubAria}
              >
                {copiedKey === 'github' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Grid ─────────────────────────────────── */}
      <section className="about-stats-grid">
        {ABOUT.stats.map((stat, idx) => (
          <div key={idx} className="about-stat-card">
            <span className="about-stat-card__value">{stat.value}</span>
            <span className="about-stat-card__label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* ── Bio & Dedikasi ─────────────────────────────── */}
      <section className="about-card about-bio">
        <h3 className="about-section-heading">
          {ABOUT.bioSectionTitle}
        </h3>
        <p className="about-paragraph">{ABOUT.bioParagraph1}</p>
        <p className="about-paragraph">{ABOUT.bioParagraph2}</p>
      </section>

      {/* ── Pilar Rekayasa ─────────────────────────────── */}
      <section className="about-card about-pillars">
        <h3 className="about-section-heading">
          {ABOUT.pillarsTitle}
        </h3>
        <div className="about-pillars-grid">
          {ABOUT.pillars.map((pillar, idx) => (
            <div key={idx} className="about-pillar-card">
              <div className="about-pillar-card__body">
                <h4 className="about-pillar-card__title">{pillar.title}</h4>
                <p className="about-pillar-card__desc">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Versioning Card ────────────────────────────── */}
      <section className="about-card about-version-card">
        <div className="about-version-card__left">
          <div className="about-version-card__badge-row">
            <h4 className="about-version-card__title">
              {ABOUT.versionCardTitle}
            </h4>
            <span className="about-version-card__badge">
              {APP_VERSION.badge}
            </span>
          </div>
        </div>
        <div className="about-version-card__right">
          <button
            type="button"
            className="about-version-card__btn"
            onClick={onOpenChangelog}
            aria-label={ABOUT.versionBtnAria}
            title={ABOUT.versionBtnText}
          >
            <svg
              className="about-version-card__btn-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="about-version-card__btn-text">{ABOUT.versionBtnText}</span>
          </button>
        </div>
      </section>

      {/* ── Footer Button Kembali ──────────────────────── */}
      <div className="about-bottom-cta">
        <button
          type="button"
          className="about-back-btn about-back-btn--primary"
          onClick={onBackToSearch}
        >
          {ABOUT.backToSearch}
        </button>
      </div>

      {/* ── Toast Notification Floating ────────────────── */}
      {toastMessage && (
        <div className="about-toast" role="status" aria-live="polite">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
