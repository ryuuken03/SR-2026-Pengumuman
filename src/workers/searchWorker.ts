export type CompactTuple = [
  number, // 0: no
  string, // 1: nomor_peserta
  string, // 2: nama
  number | null, // 3: teknis
  number | null, // 4: manajerial
  number | null, // 5: soskul
  number | null, // 6: wawancara
  number | null, // 7: total
  number, // 8: statusIdx
  number, // 9: lokasiIdx
  number, // 10: jabatanIdx
  (number | null)?, // 11: total_cat
  (number | null)?, // 12: psikotes
  (number | null)?, // 13: inggris
  (number | null)?, // 14: wawancara_skt
  (number | null)? // 15: total_skt
]

export interface CompactIndexData {
  j: [string, string][]
  l: [string, string][]
  s: string[]
  d: CompactTuple[]
}

export interface GlobalPesertaItem {
  no: number
  nomor_peserta: string
  nama: string
  teknis?: number
  manajerial?: number
  sosial_kultural?: number
  wawancara?: number
  total?: number
  status?: string
  lokasiKode: string
  jabatanKode: string
  lokasiNama?: string
  jabatanNama?: string
  total_cat?: number
  psikotes?: number
  inggris?: number
  wawancara_skt?: number
  total_skt?: number
}

export type DataSourceType = 'selkom' | 'skt'

let currentSource: DataSourceType = 'selkom'
let searchIndex: CompactIndexData | null = null
let loadingPromise: Promise<void> | null = null

const CACHE_NAME = 'selkom-cache-v1'

function getIndexUrl(source: DataSourceType): string {
  return `/assets/${source}/global_search_index.json`
}

async function fetchIndexWithCache(source: DataSourceType): Promise<CompactIndexData> {
  const indexUrl = getIndexUrl(source)
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(indexUrl)
      if (cachedResponse && cachedResponse.ok) {
        return await cachedResponse.json()
      }
      const fetchResponse = await fetch(indexUrl)
      if (!fetchResponse.ok) throw new Error(`HTTP ${fetchResponse.status}`)
      cache.put(indexUrl, fetchResponse.clone()).catch(() => {})
      return await fetchResponse.json()
    } catch {
      // Fallback
    }
  }
  const res = await fetch(indexUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

async function loadIndex(source: DataSourceType) {
  if (searchIndex && currentSource === source) return
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    try {
      searchIndex = await fetchIndexWithCache(source)
      currentSource = source
      self.postMessage({
        type: 'INIT_SUCCESS',
        totalItems: searchIndex?.d.length || 0,
        source,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      self.postMessage({
        type: 'INIT_ERROR',
        error: errorMessage || 'Gagal memuat index global search',
        source,
      })
    } finally {
      loadingPromise = null
    }
  })()

  return loadingPromise
}

self.onmessage = async (e: MessageEvent) => {
  const { action, query, requestId, source } = e.data

  if (action === 'INIT') {
    if (source && source !== currentSource) {
      currentSource = source
      searchIndex = null
    }
    self.postMessage({ type: 'READY' })
    return
  }

  if (action === 'SET_SOURCE') {
    const targetSource = (source as DataSourceType) || 'selkom'
    if (targetSource !== currentSource) {
      currentSource = targetSource
      searchIndex = null
      loadingPromise = null
    }
    self.postMessage({ type: 'READY', source: currentSource })
    return
  }

  if (action === 'SEARCH') {
    const targetSource = (source as DataSourceType) || currentSource
    if (!searchIndex || currentSource !== targetSource) {
      await loadIndex(targetSource)
    }

    if (!searchIndex) {
      self.postMessage({ type: 'SEARCH_RESULT', requestId, results: [], totalItems: 0, query })
      return
    }

    const q = (query || '').toLowerCase().trim()
    if (!q) {
      self.postMessage({ type: 'SEARCH_RESULT', requestId, results: [], totalItems: 0, totalMatches: 0, query: '' })
      return
    }

    const isNumeric = /^\d+$/.test(q)
    const looksLikeNomorPeserta = /^\d{5,}/.test(q)

    // Untuk pencarian nama, butuh minimal 2 karakter agar memori device & thread tetap optimal
    if (!isNumeric && q.length < 2) {
      self.postMessage({
        type: 'SEARCH_RESULT',
        requestId,
        results: [],
        totalItems: 0,
        totalMatches: 0,
        query: q,
        tooShort: true,
      })
      return
    }

    const words = q.split(/\s+/).filter(Boolean)

    const rawData = searchIndex.d
    const jMap = searchIndex.j
    const lMap = searchIndex.l
    const sMap = searchIndex.s

    const matched: GlobalPesertaItem[] = []
    let totalMatches = 0
    const MAX_SEARCH_RESULTS = 500

    for (let i = 0; i < rawData.length; i++) {
      const item = rawData[i]
      const no = item[0]
      const nomor_peserta = item[1]
      const nama = item[2]

      let isMatch = false

      if (isNumeric && !looksLikeNomorPeserta) {
        isMatch = String(no) === q || nomor_peserta.includes(q)
      } else if (looksLikeNomorPeserta) {
        isMatch = nomor_peserta.toLowerCase().includes(q)
      } else {
        const namaLower = nama.toLowerCase()
        isMatch = words.every((w: string) => namaLower.includes(w))
      }

      if (isMatch) {
        totalMatches++
        if (matched.length < MAX_SEARCH_RESULTS) {
          const lEntry = lMap[item[9]]
          const jEntry = jMap[item[10]]
          const lokasiKode = lEntry ? lEntry[0] : ''
          const lokasiNama = lEntry ? lEntry[1] : ''
          const jabatanKode = jEntry ? jEntry[0] : ''
          const jabatanNama = jEntry ? jEntry[1] : ''
          const statusStr = sMap[item[8]] ?? ''

          matched.push({
            no,
            nomor_peserta,
            nama,
            teknis: item[3] ?? undefined,
            manajerial: item[4] ?? undefined,
            sosial_kultural: item[5] ?? undefined,
            wawancara: item[6] ?? undefined,
            total: item[7] ?? undefined,
            status: statusStr,
            lokasiKode,
            jabatanKode,
            lokasiNama,
            jabatanNama,
            total_cat: item[11] ?? undefined,
            psikotes: item[12] ?? undefined,
            inggris: item[13] ?? undefined,
            wawancara_skt: item[14] ?? undefined,
            total_skt: item[15] ?? undefined,
          })
        }
      }
    }

    self.postMessage({
      type: 'SEARCH_RESULT',
      requestId,
      query,
      results: matched,
      totalItems: matched.length,
      totalMatches,
      isCapped: totalMatches > MAX_SEARCH_RESULTS,
    })
  }
}
