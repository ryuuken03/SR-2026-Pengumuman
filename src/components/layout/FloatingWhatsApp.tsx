/* ============================================================
   FloatingWhatsApp.tsx — Floating Action Button (Circle) WA Admin
   Akses langsung ke kanal WhatsApp admin/pengembang
   ============================================================ */

import { FLOATING_WA } from '../../constants/strings'

export interface FloatingWhatsAppProps {
  /** URL obrolan WhatsApp kustom (opsional) */
  chatUrl?: string
}

export default function FloatingWhatsApp({
  chatUrl = FLOATING_WA.chatUrl,
}: FloatingWhatsAppProps) {
  return (
    <aside aria-label={FLOATING_WA.ariaLabel} className="floating-wa-container">
      <a
        href={chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa-btn"
        aria-label={FLOATING_WA.ariaLabel}
        title={FLOATING_WA.tooltip}
      >
        <span className="floating-wa-tooltip" aria-hidden="true">
          {FLOATING_WA.tooltip}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="floating-wa-icon"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.3 19.81 8.1 19.14L7.81 18.97L4.69 19.79L5.52 16.75L5.33 16.45C4.59 15.27 4.2 13.62 4.2 11.91C4.2 7.37 7.9 3.67 12.05 3.67ZM8.83 7.35C8.64 7.35 8.34 7.42 8.08 7.7C7.83 7.98 7.12 8.65 7.12 10.01C7.12 11.37 8.11 12.68 8.25 12.87C8.39 13.06 10.15 15.78 12.87 16.95C15.13 17.92 15.59 17.72 16.08 17.68C16.57 17.63 17.66 17.03 17.89 16.38C18.12 15.73 18.12 15.17 18.05 15.06C17.98 14.95 17.79 14.88 17.51 14.74C17.23 14.6 15.86 13.92 15.61 13.83C15.35 13.74 15.17 13.69 14.98 13.97C14.79 14.25 14.26 14.88 14.1 15.06C13.94 15.25 13.78 15.27 13.5 15.13C13.22 14.99 12.32 14.7 11.26 13.75C10.43 13.01 9.87 12.1 9.73 11.86C9.59 11.62 9.71 11.5 9.85 11.36C9.98 11.23 10.14 11.02 10.28 10.86C10.42 10.7 10.47 10.58 10.56 10.4C10.65 10.21 10.61 10.05 10.54 9.91C10.47 9.77 9.91 8.41 9.68 7.85C9.46 7.31 9.23 7.39 9.06 7.38C8.9 7.37 8.71 7.35 8.83 7.35Z" />
        </svg>
      </a>
    </aside>
  )
}
