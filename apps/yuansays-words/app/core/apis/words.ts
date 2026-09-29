import type { Word } from '../types'
import { ENV } from '../config/env'
import type { AxiosResponse } from '../utils/http'

let bundledWords: Promise<Map<string, Word>> | undefined

async function getBundledWords() {
  if (!bundledWords) {
    bundledWords = fetch(`${ENV.RESOURCE_URL}/dicts/en/word/CET4_T.json`)
      .then(async response => {
        if (!response.ok) throw new Error('词库加载失败，请联网后刷新，或导入包含释义的词库。')
        const words: Word[] = await response.json()
        if (!Array.isArray(words)) throw new Error('本地词库格式无效。')
        return new Map(words.map(word => [word.word.trim().toLowerCase(), word]))
      })
      .catch(error => {
        bundledWords = undefined
        throw error
      })
  }
  return bundledWords
}

/** Local dictionaries take precedence; no account, remote API, or localhost server is required. */
export async function queryWord(params?: { word: string }): Promise<AxiosResponse<Word | null>> {
  const query = params?.word?.trim().toLowerCase() ?? ''
  if (!query) return { code: 400, success: false, data: null, msg: '请输入单词。' }
  try {
    const { useBaseStore } = await import('../stores/base')
    const store = useBaseStore()
    const localWord = store.word.bookList
      .flatMap(dict => dict.words)
      .find(word => word.word.trim().toLowerCase() === query)
    const data = localWord ?? (await getBundledWords()).get(query) ?? null
    return {
      code: data ? 200 : 404,
      success: !!data,
      data,
      msg: data ? '' : '当前词库未收录此词，可手动补充释义或导入包含释义的 JSON/XLSX 词库。',
    }
  } catch (error) {
    return { code: 503, success: false, data: null, msg: error instanceof Error ? error.message : '本地词库暂不可用。' }
  }
}
