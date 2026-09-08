import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { DATA_PROGRESS } from '../constants/strings'

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

export type DataSource = 'selkom' | 'skt'

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
  total_cat?: number
  psikotes?: number
  inggris?: number
  wawancara_skt?: number
  total_skt?: number
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
  | 'psikotes'
  | 'inggris'
  | 'wawancara_skt'
  | 'total_skt'
  | 'total_cat'

export interface SortConfig {
  key: SortKey | null
  direction: 'asc' | 'desc'
}

export type FormasiTab = 'guru' | 'teknis'

export function isGuruJabatan(kode: string, label: string = ''): boolean {
  return kode.startsWith('JF') || /guru/i.test(label)
}

export function isPusdikLokasi(label: string = ''): boolean {
  return /pusat pendidikan/i.test(label)
}

export type SearchScope = 'formasi' | 'global'

const ITEMS_PER_PAGE = 10

function normalize(str: string | undefined | null): string {
  return String(str || '').toLowerCase().trim()
}

export function useSelkomSearch() {
  const [dataSource, setDataSource] = useState<DataSource>(() => {
    try {
      const saved = localStorage.getItem('sr-data-source-v2') as DataSource
      if (saved === 'selkom' || saved === 'skt') return saved
    } catch {}
    return 'skt'
  })

  const [formasiTab, setFormasiTab] = useState<FormasiTab>('guru')
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
  const [globalTotalMatches, setGlobalTotalMatches] = useState<number>(0)
  const [isGlobalCapped, setIsGlobalCapped] = useState<boolean>(false)

  const [query, setQuery] = useState<string>('')
  const [activeQuery, setActiveQuery] = useState<string>('')
  const [hasSearched, setHasSearched] = useState<boolean>(false)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })

  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef<number>(0)

  // Save dataSource to localStorage and inform worker
  useEffect(() => {
    try {
      localStorage.setItem('sr-data-source-v2', dataSource)
    } catch {}
    workerRef.current?.postMessage({ action: 'SET_SOURCE', source: dataSource })
  }, [dataSource])

  const initialSourceRef = useRef(dataSource)

  // ── Web Worker pencarian global ─────────────────────────────
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
            setGlobalTotalMatches(e.data.totalMatches ?? (results || []).length)
            setIsGlobalCapped(Boolean(e.data.isCapped))
            setGlobalLoading(false)
          }
        } else if (type === 'INIT_ERROR') {
          console.error('Global search worker error:', e.data.error)
          setGlobalLoading(false)
        }
      }

      worker.postMessage({ action: 'INIT', source: initialSourceRef.current })
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
          fetchWithCache<SelectFormasiData>(`/assets/${dataSource}/select_formasi.json`),
          fetchWithCache<SelectorMap>(`/assets/${dataSource}/selector.json`),
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
  }, [dataSource])

  // Reset saat tab formasi atau sumber data berpindah
  useEffect(() => {
    setSelectedJabatan('')
    setSelectedLokasi('')
    setData([])
    setSummary(null)
    setQuery('')
    setActiveQuery('')
    setHasSearched(false)
    setCurrentPage(1)
    setGlobalData([])
    setGlobalTotalMatches(0)
    setIsGlobalCapped(false)
    setSortConfig({ key: null, direction: 'asc' })
  }, [formasiTab, dataSource])

  // Jabatan Formasi sesuai tab aktif (PPPK Guru vs PPPK Teknis)
  const tabJabatanOptions = useMemo(() => {
    if (!formasiOptions) return []
    const allJabatan = formasiOptions['Jabatan Formasi'] || []
    return allJabatan.filter(j =>
      formasiTab === 'guru' ? isGuruJabatan(j.kode, j.label) : !isGuruJabatan(j.kode, j.label)
    )
  }, [formasiOptions, formasiTab])

  // Lokasi Formasi sesuai tab aktif (Kota/Kab untuk Guru, Pusat Pendidikan untuk Teknis)
  const tabLokasiOptions = useMemo(() => {
    if (!formasiOptions) return []
    const allLokasi = formasiOptions['Lokasi Formasi'] || []
    return allLokasi.filter(l =>
      formasiTab === 'guru' ? !isPusdikLokasi(l.label) : isPusdikLokasi(l.label)
    )
  }, [formasiOptions, formasiTab])

  // Daftar Jabatan yang valid (bila lokasi sudah dipilih, batasi hanya yang tersedia di lokasi tsb)
  const validJabatan = useMemo(() => {
    if (!selectedLokasi || !validCombos) return tabJabatanOptions
    return tabJabatanOptions.filter(j => {
      const allowedLokasi = validCombos[j.kode]
      return allowedLokasi ? allowedLokasi.includes(selectedLokasi) : false
    })
  }, [tabJabatanOptions, selectedLokasi, validCombos])

  // Daftar Lokasi yang valid (bila jabatan sudah dipilih, batasi hanya lokasi jabatan tsb)
  const validLokasi = useMemo(() => {
    if (!formasiOptions) return []
    if (selectedJabatan && validCombos) {
      const allowedLokasiSet = new Set(validCombos[selectedJabatan] || [])
      return tabLokasiOptions.filter(l => allowedLokasiSet.has(l.kode))
    }
    return tabLokasiOptions
  }, [selectedJabatan, validCombos, tabLokasiOptions, formasiOptions])

  // Validasi kecocokan jika salah satu dropdown berubah
  useEffect(() => {
    if (selectedJabatan && selectedLokasi && validCombos) {
      const allowedLokasi = validCombos[selectedJabatan] || []
      if (!allowedLokasi.includes(selectedLokasi)) {
        setSelectedLokasi('')
      }
    }
  }, [selectedJabatan, selectedLokasi, validCombos])

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
    setProgress(DATA_PROGRESS.loading)

    const basePath = `/assets/${dataSource}/${selectedLokasi}/${selectedJabatan}`

    ;(async () => {
      try {
        const [dataJson, summaryJson] = await Promise.all([
          fetchWithCache<{ data: PesertaItem[] }>(`${basePath}/data.json`),
          fetchWithCache<SelkomSummary>(`${basePath}/summary.json`),
        ])

        if (!mounted) return

        if (dataJson) {
          setData(dataJson.data || [])
          setProgress(DATA_PROGRESS.loaded((dataJson.data || []).length))
        } else {
          setData([])
          setProgress(DATA_PROGRESS.noData)
        }

        setSummary(summaryJson)
      } catch (e) {
        if (mounted) {
          console.error('Gagal memuat data:', e)
          setProgress(DATA_PROGRESS.error)
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
  }, [selectedJabatan, selectedLokasi, dataSource])


  // Auto-sync searchScope dari pilihan dropdown:
  // - Keduanya kosong → global
  // - Keduanya terisi → formasi
  // - Salah satu terisi → 'pending' (ditahan, tapi tidak ubah scope agar tidak trigger global search)
  useEffect(() => {
    const bothEmpty = !selectedJabatan && !selectedLokasi
    const bothFilled = selectedJabatan && selectedLokasi

    if (bothEmpty) {
      setSearchScope('global')
      setRequireSelectedFormasi(false)
      setGlobalData([])
      setGlobalTotalMatches(0)
      setIsGlobalCapped(false)
    } else if (bothFilled) {
      setSearchScope('formasi')
      setRequireSelectedFormasi(true)
    }
    // Jika hanya salah satu terisi, tahan scope saat ini (jangan pindah ke global)
  }, [selectedJabatan, selectedLokasi])


  useEffect(() => {
    const trimmed = activeQuery.trim()
    const isNumeric = /^\d+$/.test(trimmed)
    if (searchScope === 'global' && trimmed && (isNumeric || trimmed.length >= 2)) {
      setGlobalLoading(true)
      const reqId = ++requestIdRef.current
      workerRef.current?.postMessage({
        action: 'SEARCH',
        query: trimmed,
        requestId: reqId,
        source: dataSource,
      })
    } else if (searchScope === 'global' && (!trimmed || (!isNumeric && trimmed.length < 2))) {
      setGlobalData([])
      setGlobalTotalMatches(0)
      setIsGlobalCapped(false)
      setGlobalLoading(false)
    }
  }, [searchScope, activeQuery, dataSource])

  const handleSearch = useCallback(() => {
    const trimmed = query.trim()
    const bothFilled = selectedJabatan && selectedLokasi
    const isIncompletePick = (selectedJabatan && !selectedLokasi) || (!selectedJabatan && selectedLokasi)

    // Jika sedang mode formasi tapi belum lengkap kedua dropdown, tahan pencarian
    if (isIncompletePick) return

    const isNumeric = /^\d+$/.test(trimmed)
    // Minimal 2 karakter untuk pencarian nama pada mode global
    if (!bothFilled && trimmed && !isNumeric && trimmed.length < 2) {
      return
    }

    setActiveQuery(trimmed)
    setSearchScope(bothFilled ? 'formasi' : 'global')
    setHasSearched(trimmed.length > 0)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
  }, [query, selectedJabatan, selectedLokasi])

  const handleClear = useCallback(() => {
    setQuery('')
    setActiveQuery('')
    setHasSearched(false)
    setGlobalData([])
    setGlobalTotalMatches(0)
    setIsGlobalCapped(false)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
  }, [])

  const handleResetAll = useCallback(() => {
    setQuery('')
    setActiveQuery('')
    setHasSearched(false)
    setGlobalData([])
    setGlobalTotalMatches(0)
    setIsGlobalCapped(false)
    setCurrentPage(1)
    setSortConfig({ key: null, direction: 'asc' })
    setSelectedJabatan('')
    setSelectedLokasi('')
    setRequireSelectedFormasi(false)
    setSearchScope('global')
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

      if (key === 'total_skt') {
        const numA = Number(a.total_skt ?? a.psikotes ?? 0)
        const numB = Number(b.total_skt ?? b.psikotes ?? 0)
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA
      }

      if (key === 'total_cat') {
        const numA = Number(a.total_cat ?? a.total ?? 0)
        const numB = Number(b.total_cat ?? b.total ?? 0)
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA
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
      if (isGuruJabatan(jabatanKode)) {
        setFormasiTab('guru')
      } else {
        setFormasiTab('teknis')
      }
      setSelectedJabatan(jabatanKode)
      setSelectedLokasi(lokasiKode)
      setSearchScope('formasi')
    },
    []
  )

  return {
    dataSource,
    setDataSource,
    formasiTab,
    setFormasiTab,
    formasiOptions,
    validJabatan,
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
    globalTotalMatches,
    isGlobalCapped,
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
    handleResetAll,
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
