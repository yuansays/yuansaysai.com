import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { ecdictEntryToWord, wordTapBucket, wordTapEntryToWord } from './openWordSources.ts'

const publicRoot = new URL('../../../public/', import.meta.url)
const readJson = async relative => JSON.parse(await readFile(new URL(relative, publicRoot), 'utf8'))

test('nine recite lists are available without replacing the original CET-4 book', async () => {
  const catalog = await readJson('list/word.json')
  assert.equal(catalog.find(book => book.id === 1).length, 2607)
  const recite = catalog.filter(book => String(book.id).startsWith('recite-'))
  assert.equal(recite.length, 9)
  for (const book of recite) {
    const entries = await readJson(`dicts/en/word/${book.url}`)
    assert.equal(entries.length, book.length)
    assert.ok(entries[0].word)
    const adapted = ecdictEntryToWord(entries[0], `${book.id}-0`)
    assert.equal(adapted.word, entries[0].word)
    assert.ok(adapted.trans.length || adapted.definition)
  }
})

test('WordTap dictionary buckets resolve reading words on demand', async () => {
  const manifest = await readJson('dicts/en/wordtap-ecdict/manifest.json')
  assert.equal(manifest.importedSingleWords, 398979)
  assert.equal(manifest.bucketCount, 700)
  for (const query of ['learning', "can't", 'well-being', 'adventure']) {
    const bucket = wordTapBucket(query)
    const entries = await readJson(`dicts/en/wordtap-ecdict/${bucket}.json`)
    assert.ok(entries[query], `${query} should be present in ${bucket}.json`)
    const adapted = wordTapEntryToWord(query, entries[query])
    assert.equal(adapted.word, query)
    assert.ok(adapted.trans.length || adapted.definition)
  }
})

test('ECDICT translations preserve part of speech without inventing an etymology', () => {
  const word = ecdictEntryToWord({
    word: 'state', phonetic: 'steit', translation: 'n. 州, 状态；vt. 说明', definition: 'a political entity',
  })
  assert.deepEqual(word.trans, [{ pos: 'n.', cn: '州, 状态' }, { pos: 'vt.', cn: '说明' }])
  assert.equal(word.definition, 'a political entity')
  assert.deepEqual(word.etymology, [])
})
