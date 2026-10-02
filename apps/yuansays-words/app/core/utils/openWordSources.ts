import type { Word } from '../types/types.ts'

export interface EcdictEntry {
  word: string
  phonetic?: string
  pos?: string
  translation?: string
  definition?: string
}

export type WordTapCompactEntry = [phonetic: string, translation: string, definition: string]

function parseTranslations(translation: string, fallbackPos: string) {
  return translation
    .split(/[；;\n]+/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const match = part.match(/^((?:n|v|vi|vt|adj|adv|prep|pron|conj|int|art|aux|num|abbr|a)\.)\s*(.+)$/i)
      return match
        ? { pos: match[1], cn: match[2] }
        : { pos: fallbackPos, cn: part }
    })
}

export function ecdictEntryToWord(entry: EcdictEntry, id?: string): Word {
  const phonetic = entry.phonetic?.trim() ?? ''
  return {
    id,
    word: entry.word.trim(),
    phonetic0: phonetic,
    phonetic1: phonetic,
    trans: parseTranslations(entry.translation ?? '', entry.pos?.trim() ?? ''),
    definition: entry.definition?.trim() ?? '',
    sentences: [],
    phrases: [],
    synos: [],
    relWords: { root: '', rels: [] },
    etymology: [],
  }
}

export function wordTapEntryToWord(word: string, entry: WordTapCompactEntry): Word {
  return ecdictEntryToWord({ word, phonetic: entry[0], translation: entry[1], definition: entry[2] }, `ecdict-${word}`)
}

export function wordTapBucket(word: string): string {
  return word.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2).padEnd(2, '_')
}
