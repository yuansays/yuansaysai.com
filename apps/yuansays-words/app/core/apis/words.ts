import type { Word } from '../types'
import { ENV } from '../config/env'
import type { AxiosResponse } from '../utils/http'
import { wordTapBucket, wordTapEntryToWord, type WordTapCompactEntry } from '../utils/openWordSources.ts'

let bundledWords: Promise<Map<string, Word>> | undefined
const wordTapShards = new Map<string, Promise<Record<string, WordTapCompactEntry>>>()
const MAX_CACHED_SHARDS = 24

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

async function getWordTapWord(query: string): Promise<Word | null> {
  if (!/^[a-z]+(?:['-][a-z]+)*$/.test(query)) return null
  const bucket = wordTapBucket(query)
  let pending = wordTapShards.get(bucket)
  if (!pending) {
    pending = fetch(`${ENV.RESOURCE_URL}/dicts/en/wordtap-ecdict/${bucket}.json`)
      .then(async response => {
        if (response.status === 404) return {}
        if (!response.ok) throw new Error('开源词典加载失败，请联网后重试。')
        return response.json() as Promise<Record<string, WordTapCompactEntry>>
      })
      .catch(error => {
        wordTapShards.delete(bucket)
        throw error
      })
    wordTapShards.set(bucket, pending)
    if (wordTapShards.size > MAX_CACHED_SHARDS) wordTapShards.delete(wordTapShards.keys().next().value!)
  }
  const entry = (await pending)[query]
  return entry ? wordTapEntryToWord(query, entry) : null
}

/** Local dictionaries take precedence; no account, remote API, or localhost server is required. */
export async function queryWord(params?: { word: string }): Promise<AxiosResponse<Word | null>> {
  const query = params?.word?.trim().toLowerCase() ?? ''
  if (!query) return { code: 400, success: false, data: null, msg: '请输入单词。' }
  try {
    const { useBaseStore } = await import('../stores/base')
    const store = useBaseStore()
    let localWord: Word | undefined
    for (const dict of store.word.bookList ?? []) {
      localWord = dict.words?.find(word => word.word.trim().toLowerCase() === query)
      if (localWord) break
    }
    const data = localWord ?? (await getBundledWords()).get(query) ?? (await getWordTapWord(query))
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
