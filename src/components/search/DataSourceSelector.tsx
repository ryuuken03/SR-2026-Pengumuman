import type { DataSource } from '../../hooks/useSelkomSearch'
import { DATA_SOURCE } from '../../constants/strings'

interface DataSourceSelectorProps {
  dataSource?: DataSource
  onSourceChange: (source: DataSource) => void
}

export default function DataSourceSelector({ dataSource = 'skt', onSourceChange }: DataSourceSelectorProps) {
  return (
    <section className="data-source-bar" aria-label={DATA_SOURCE.ariaLabel}>
      <div className="data-source-bar__left">
        <div className="data-source-bar__label-wrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="data-source-bar__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          <label htmlFor="data-source-select" className="data-source-bar__label">
            {DATA_SOURCE.label}
          </label>
        </div>

        <div className="data-source-bar__select-wrap">
          <select
            id="data-source-select"
            className="data-source-bar__select"
            value={dataSource}
            onChange={(e) => onSourceChange(e.target.value as DataSource)}
            aria-label={DATA_SOURCE.ariaLabel}
          >
            <option value="selkom">{DATA_SOURCE.catOption}</option>
            <option value="skt">{DATA_SOURCE.sktOption}</option>
          </select>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="data-source-bar__select-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div className="data-source-bar__right">
        <span className="data-source-bar__badge">
          {dataSource === 'selkom' ? DATA_SOURCE.catShort : DATA_SOURCE.sktShort} ·{' '}
          {dataSource === 'selkom' ? DATA_SOURCE.catCount : DATA_SOURCE.sktCount}
        </span>
        {/* <span className="data-source-bar__desc">
          {dataSource === 'selkom' ? DATA_SOURCE.catDescription : DATA_SOURCE.sktDescription}
        </span> */}
      </div>
    </section>
  )
}
