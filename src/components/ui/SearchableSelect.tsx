/* ============================================================
   SearchableSelect.tsx — Komponen Dropdown dengan Fitur Search
   Mobile-friendly, accessible, dan mendukung keyboard navigation.
   ============================================================ */

import { useState, useRef, useEffect, useMemo, useId } from 'react'
import { SELECT } from '../../constants/strings'

export interface SearchableSelectOption {
  kode: string
  label: string
}

export interface SearchableSelectProps {
  id?: string
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  clearable?: boolean
  ariaLabel?: string
}

export default function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = SELECT.searchPlaceholder,
  emptyMessage = SELECT.emptyMessage,
  disabled = false,
  clearable = true,
  ariaLabel,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const generatedId = useId()
  const componentId = id || generatedId

  // Label untuk nilai terpilih
  const selectedOption = useMemo(
    () => options.find(opt => opt.kode === value),
    [options, value]
  )

  // Filter opsi berdasarkan pencarian
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase().trim()
    return options.filter(opt => opt.label.toLowerCase().includes(query))
  }, [options, searchQuery])

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen])

  // Reset search query dan fokus input saat dropdown dibuka
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setHighlightedIndex(-1)
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Scroll otomatis ke item yang disorot
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.searchable-select__option')
      const target = items[highlightedIndex] as HTMLElement
      if (target) {
        target.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(prev => !prev)
  }

  const handleSelect = (kode: string) => {
    onChange(kode)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].kode)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  return (
    <div
      ref={containerRef}
      className={`searchable-select ${isOpen ? 'searchable-select--open' : ''} ${
        disabled ? 'searchable-select--disabled' : ''
      }`}
      onKeyDown={handleKeyDown}
    >
      {/* Tombol Utama (Trigger) */}
      <button
        type="button"
        id={componentId}
        className="searchable-select__trigger"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
      >
        <span
          className={`searchable-select__label ${
            !selectedOption ? 'searchable-select__label--placeholder' : ''
          }`}
          title={selectedOption ? selectedOption.label : placeholder}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="searchable-select__actions">
          {/* Tombol Clear */}
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              className="searchable-select__clear"
              onClick={handleClear}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  handleClear(e as unknown as React.MouseEvent)
                }
              }}
              title={SELECT.clearLabel}
              aria-label={SELECT.clearLabel}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          )}

          {/* Icon Chevron */}
          <span className="searchable-select__chevron" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="searchable-select__menu" role="presentation">
          {/* Input Pencarian */}
          <div className="searchable-select__search-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="searchable-select__search-icon"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="searchable-select__search-input"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setHighlightedIndex(0)
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              autoComplete="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                type="button"
                className="searchable-select__search-clear"
                onClick={() => {
                  setSearchQuery('')
                  inputRef.current?.focus()
                }}
                aria-label={SELECT.searchClearLabel}
                title={SELECT.searchClearLabel}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {/* Tombol Tutup Picker (khusus mode overlay pada mobile) */}
            <button
              type="button"
              className="searchable-select__close-btn"
              onClick={() => setIsOpen(false)}
              aria-label={SELECT.closeDropdown}
              title={SELECT.closeDropdown}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Daftar Opsi */}
          <ul
            ref={listRef}
            className="searchable-select__options"
            role="listbox"
            aria-label={placeholder}
          >
            {/* Opsi default untuk reset jika belum memilih atau ingin mereset */}
            {value && !searchQuery && (
              <li
                role="option"
                aria-selected={false}
                className="searchable-select__option searchable-select__option--reset"
                onClick={() => handleSelect('')}
              >
                <span>{placeholder}</span>
              </li>
            )}

            {filteredOptions.length === 0 ? (
              <li className="searchable-select__empty">{emptyMessage}</li>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.kode === value
                const isHighlighted = index === highlightedIndex

                return (
                  <li
                    key={opt.kode}
                    role="option"
                    aria-selected={isSelected}
                    className={`searchable-select__option ${
                      isSelected ? 'searchable-select__option--selected' : ''
                    } ${isHighlighted ? 'searchable-select__option--highlighted' : ''}`}
                    onClick={() => handleSelect(opt.kode)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="searchable-select__option-text">{opt.label}</span>
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="searchable-select__check"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
