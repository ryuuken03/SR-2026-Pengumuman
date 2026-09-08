/* ── ThemeToggle ─────────────────────────────────────────────
   Komponen toggle dark/light mode.
   Tidak bergantung pada domain bisnis (UI generik).
   ─────────────────────────────────────────────────────────── */

import { APP } from '../../constants/strings'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className={`theme-switch${isDark ? ' theme-switch--dark' : ''}`}
      onClick={onToggle}
      aria-label={isDark ? APP.themeLight : APP.themeDark}
      title={isDark ? APP.themeLightTitle : APP.themeDarkTitle}
    >
      <span className="theme-switch__thumb">
        {isDark ? (
          <svg className="theme-switch__icon" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg className="theme-switch__icon" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        )}
      </span>
    </button>
  )
}
