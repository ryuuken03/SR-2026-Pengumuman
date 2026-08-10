import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

export interface FormasiOptionItem {
  kode: string
  label: string
}

export interface SelectFormasiData {
  'Jabatan Formasi': FormasiOptionItem[]
  'Lokasi Formasi': FormasiOptionItem[]
}

export type SelectorMap = Record<string, string[]>

async function fetchWithCache<T>(url: string): Promise<T | null> {
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open('selkom-cache-v1')
      const cached = await cache.match(url)
      if (cached && cached.ok) {
        return (await cached.json()) as T
      }
      const res = await fetch(url)
      if (res.ok) {
        cache.put(url, res.clone()).catch(() => {})
        return (await res.json()) as T
      }
    } catch {}
  }
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export interface PesertaItem {
  no: number
  nomor_peserta: string
  nama: string
  teknis?: number
  manajerial?: number
  sosial_kultural?: number
  wawancara?: number
  total?: number
  status?: string
  lokasiKode?: string
  jabatanKode?: string
  lokasiNama?: string
  jabatanNama?: string
}

export interface NilaiUjianSummary {
  tertinggi?: number
  terendah?: number
}

export interface SelkomSummary {
  Instansi?: string
  'Jabatan Formasi'?: string
  'Lokasi Formasi'?: string
  'Jenis Formasi'?: string
  'Jumlah Formasi'?: number
  'Jumlah Peserta'?: number
  Kehadiran?: string
  Kelulusan?: number
  'Nilai Ujian'?: NilaiUjianSummary
}

export type SortKey =
  | 'no'
  | 'nomor_peserta'
  | 'nama'
  | 'teknis'
  | 'manajerial'
  | 'sosial_kultural'
  | 'wawancara'
  | 'total'
  | 'status'
  | 'lokasiNama'
  | 'jabatanNama'

export interface SortConfig {
  key: SortKey | null
  direction: 'asc' | 'desc'
}

export type SearchScope = 'formasi' | 'global'

const ITEMS_PER_PAGE = 10

function normalize(str: string | undefined | null): string {
  return String(str || '').toLowerCase().trim()
}

export function useSelkomSearch() {
  const [formasiOptions, setFormasiOptions] = useState<SelectFormasiData | null>(null)
  const [validCombos, setValidCombos] = useState<SelectorMap | null>(null)

  const [selectedJabatan, setSelectedJabatan] = useState<string>('')
  const [selectedLokasi, setSelectedLokasi] = useState<string>('')

  const [data, setData] = useState<PesertaItem[]>([])
  const [summary, setSummary] = useState<SelkomSummary | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingMeta, setLoadingMeta] = useState<boolean>(true)
  const [progress, setProgress] = useState<string>('')

  // Scope & Global Search
  const [searchScope, setSearchScope] = useState<SearchScope>('global')
  const [requireSelectedFormasi, setRequireSelectedFormasi] = useState<boolean>(false)
  const [globalData, setGlobalData] = useState<PesertaItem[]>([])
  const [globalLoading, setGlobalLoading] = useState<boolean>(false)
  const [globalIndexedTotal, setGlobalIndexedTotal] = useState<number>(0)

  const [query, setQuery] = useState<string>('')
  const [activeQuery, setActiveQuery] = useState<string>('')
  const [hasSearched, setHasSearched] = useState<boolean>(false)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })

  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef<number>(0)

  // Initialize Worker
  useEffect(() => {
    try {
      const worker = new Worker(new URL('../workers/searchWorker.ts', import.meta.url), {
        type: 'module',
      })
      workerRef.current = worker

      worker.onmessage = (e: MessageEvent) => {
        const { type, totalItems, results, requestId } = e.data
        if (type === 'INIT_SUCCESS') {
          setGlobalIndexedTotal(totalItems)
        } else if (type === 'SEARCH_RESULT') {
          if (requestId === requestIdRef.current) {
            setGlobalData(results || [])
            setGlobalLoading(false)
          }
        } else if (type === 'INIT_ERROR') {
          console.error('Global search worker error:', e.data.error)
          setGlobalLoading(false)
        }
      }

      worker.postMessage({ action: 'INIT' })
    } catch (err) {
      console.error('Gagal membuat Web Worker pencarian:', err)
    }

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    let mounted = true
    setLoadingMeta(true)

    ;(async () => {
      try {
        const [formasiRes, selectorRes] = await Promise.all([
          fetchWithCache<SelectFormasiData>('/assets/selkom/select_formasi.json'),
          fetchWithCache<SelectorMap>('/assets/selkom/selector.json'),
        ])

        if (!mounted) return

        if (formasiRes) {
          setFormasiOptions(formasiRes)
        }

        if (selectorRes) {
          setValidCombos(selectorRes)
        }
      } catch (e) {
        console.error('Gagal memuat data formasi:', e)
      } finally {
        if (mounted) setLoadingMeta(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const validLokasi = useMemo(() => {
    if (!selectedJabatan || !formasiOptions || !validCombos) return []

    const allowedLokasiSet = new Set(validCombos[selectedJabatan] || [])
    return (formasiOptions['Lokasi Formasi'] || []).filter(l => allowedLokasiSet.has(l.kode))
  }, [selectedJabatan, validCombos, formasiOptions])

  useEffect(() => {
    setSelectedLokasi('')
    setData([])
    setSummary(null)
    setQuery('')
    setActiveQuery('')
    setHasSearched(false)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
  }, [selectedJabatan])

  useEffect(() => {
    setData([])
    setSummary(null)
    setQuery('')
    setActiveQuery('')
    setHasSearched(false)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })

    if (selectedJabatan && selectedLokasi) {
      setSearchScope('formasi')
    }
  }, [selectedLokasi, selectedJabatan])

  useEffect(() => {
    if (!selectedJabatan || !selectedLokasi) return

    let mounted = true
    setLoading(true)
    setProgress('Memuat data...')

    const basePath = `/assets/selkom/${selectedLokasi}/${selectedJabatan}`

    ;(async () => {
      try {
        const [dataJson, summaryJson] = await Promise.all([
          fetchWithCache<{ data: PesertaItem[] }>(`${basePath}/data.json`),
          fetchWithCache<SelkomSummary>(`${basePath}/summary.json`),
        ])

        if (!mounted) return

        if (dataJson) {
          setData(dataJson.data || [])
          setProgress(`${(dataJson.data || []).length} peserta dimuat`)
        } else {
          setData([])
          setProgress('Data tidak tersedia')
        }

        setSummary(summaryJson)
      } catch (e) {
        if (mounted) {
          console.error('Gagal memuat data:', e)
          setProgress('Gagal memuat data')
          setData([])
          setSummary(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [selectedJabatan, selectedLokasi])

  // Sync scope & reset formasi selections when requireSelectedFormasi changes
  useEffect(() => {
    setSearchScope(requireSelectedFormasi ? 'formasi' : 'global')
    if (!requireSelectedFormasi) {
      setSelectedJabatan('')
      setSelectedLokasi('')
    }
  }, [requireSelectedFormasi])

  useEffect(() => {
    if (searchScope === 'global' && activeQuery.trim()) {
      setGlobalLoading(true)
      const reqId = ++requestIdRef.current
      workerRef.current?.postMessage({
        action: 'SEARCH',
        query: activeQuery,
        requestId: reqId,
      })
    } else if (searchScope === 'global' && !activeQuery.trim()) {
      setGlobalData([])
      setGlobalLoading(false)
    }
  }, [searchScope, activeQuery])

  const handleSearch = useCallback(() => {
    const trimmed = query.trim()

    if (requireSelectedFormasi && (!selectedJabatan || !selectedLokasi)) {
      return
    }

    setActiveQuery(trimmed)
    setSearchScope(requireSelectedFormasi ? 'formasi' : 'global')
    setHasSearched(trimmed.length > 0)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
  }, [query, requireSelectedFormasi, selectedJabatan, selectedLokasi])

  const handleClear = useCallback(() => {
    setQuery('')
    setActiveQuery('')
    setHasSearched(false)
    setGlobalData([])
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
  }, [])

  const filteredData = useMemo(() => {
    if (searchScope === 'global') {
      return globalData
    }

    if (!activeQuery) return data

    const q = normalize(activeQuery)
    const isNumeric = /^\d+$/.test(q)
    const looksLikeNomorPeserta = /^\d{5,}/.test(q)

    return data.filter(row => {
      if (isNumeric && !looksLikeNomorPeserta) {
        return String(row.no) === q
      }
      if (looksLikeNomorPeserta) {
        return normalize(row.nomor_peserta).includes(q)
      }
      const words = q.split(/\s+/).filter(Boolean)
      const namaLower = normalize(row.nama)
      return words.every(w => namaLower.includes(w))
    })
  }, [data, globalData, activeQuery, searchScope])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    const key = sortConfig.key

    return [...filteredData].sort((a, b) => {
      let valA = a[key]
      let valB = b[key]

      if (
        key === 'nama' ||
        key === 'status' ||
        key === 'nomor_peserta' ||
        key === 'lokasiNama' ||
        key === 'jabatanNama'
      ) {
        const strA = String(valA || '')
        const strB = String(valB || '')
        const cmp = strA.localeCompare(strB, 'id', { sensitivity: 'base' })
        return sortConfig.direction === 'asc' ? cmp : -cmp
      }

      const numA = Number(valA) || 0
      const numB = Number(valB) || 0
      return sortConfig.direction === 'asc' ? numA - numB : numB - numA
    })
  }, [filteredData, sortConfig])

  const totalItems = sortedData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const displayItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)

  const requestSort = useCallback((key: SortKey) => {
    setSortConfig(prev => {
      if (prev.key === key && prev.direction === 'asc') return { key, direction: 'desc' }
      if (prev.key === key && prev.direction === 'desc') return { key: null, direction: 'asc' }
      return { key, direction: 'asc' }
    })
    setCurrentPage(1)
  }, [])

  const jabatanLabel = useMemo(() => {
    if (!selectedJabatan || !formasiOptions) return ''
    const found = formasiOptions['Jabatan Formasi']?.find(j => j.kode === selectedJabatan)
    return found ? found.label : selectedJabatan
  }, [selectedJabatan, formasiOptions])

  const lokasiLabel = useMemo(() => {
    if (!selectedLokasi || !formasiOptions) return ''
    const found = formasiOptions['Lokasi Formasi']?.find(l => l.kode === selectedLokasi)
    return found ? found.label : selectedLokasi
  }, [selectedLokasi, formasiOptions])

  const selectFormasiEntry = useCallback(
    (jabatanKode: string, lokasiKode: string) => {
      setSelectedJabatan(jabatanKode)
      setSelectedLokasi(lokasiKode)
      setSearchScope('formasi')
    },
    []
  )

  return {
    formasiOptions,
    validLokasi,
    loadingMeta,
    selectedJabatan,
    setSelectedJabatan,
    selectedLokasi,
    setSelectedLokasi,
    jabatanLabel,
    lokasiLabel,
    selectFormasiEntry,
    // Scope
    searchScope,
    setSearchScope,
    requireSelectedFormasi,
    setRequireSelectedFormasi,
    globalLoading,
    globalIndexedTotal,
    // Data
    data,
    summary,
    loading: loading || (searchScope === 'global' && globalLoading),
    progress,
    query,
    setQuery,
    activeQuery,
    hasSearched,
    handleSearch,
    handleClear,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    displayItems,
    ITEMS_PER_PAGE,
    sortConfig,
    requestSort,
  }
}
