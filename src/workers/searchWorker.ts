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
  number // 10: jabatanIdx
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
}

let searchIndex: CompactIndexData | null = null
let loadingPromise: Promise<void> | null = null

const INDEX_URL = '/assets/selkom/global_search_index.json'
const CACHE_NAME = 'selkom-cache-v1'

async function fetchIndexWithCache(): Promise<CompactIndexData> {
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(INDEX_URL)
      if (cachedResponse && cachedResponse.ok) {
        return await cachedResponse.json()
      }
      const fetchResponse = await fetch(INDEX_URL)
      if (!fetchResponse.ok) throw new Error(`HTTP ${fetchResponse.status}`)
      // Store clone in CacheStorage
      cache.put(INDEX_URL, fetchResponse.clone()).catch(() => {})
      return await fetchResponse.json()
    } catch {
      // Fallback to plain fetch if CacheStorage fails
    }
  }
  const res = await fetch(INDEX_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

async function loadIndex() {
  if (searchIndex) return
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    try {
      searchIndex = await fetchIndexWithCache()
      self.postMessage({
        type: 'INIT_SUCCESS',
        totalItems: searchIndex?.d.length || 0,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      self.postMessage({
        type: 'INIT_ERROR',
        error: errorMessage || 'Gagal memuat index global search',
      })
    } finally {
      loadingPromise = null
    }
  })()

  return loadingPromise
}

self.onmessage = async (e: MessageEvent) => {
  const { action, query, requestId } = e.data

  if (action === 'INIT') {
    // Lazy mode: Do NOT download index immediately on init.
    // Index will be fetched on demand when SEARCH action is issued.
    self.postMessage({ type: 'READY' })
    return
  }

  if (action === 'SEARCH') {
    if (!searchIndex) {
      await loadIndex()
    }

    if (!searchIndex) {
      self.postMessage({ type: 'SEARCH_RESULT', requestId, results: [], totalItems: 0, query })
      return
    }

    const q = (query || '').toLowerCase().trim()
    if (!q) {
      self.postMessage({ type: 'SEARCH_RESULT', requestId, results: [], totalItems: 0, query: '' })
      return
    }

    const isNumeric = /^\d+$/.test(q)
    const looksLikeNomorPeserta = /^\d{5,}/.test(q)
    const words = q.split(/\s+/).filter(Boolean)

    const rawData = searchIndex.d
    const jMap = searchIndex.j
    const lMap = searchIndex.l
    const sMap = searchIndex.s

    const matched: GlobalPesertaItem[] = []

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
        })
      }
    }

    self.postMessage({
      type: 'SEARCH_RESULT',
      requestId,
      query,
      results: matched,
      totalItems: matched.length,
    })
  }
}
