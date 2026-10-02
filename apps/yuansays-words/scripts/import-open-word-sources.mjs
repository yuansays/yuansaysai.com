import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Usage: node scripts/import-open-word-sources.mjs <recite checkout> <WordTap checkout>
// Only the ECDICT-derived dictionary is imported from WordTap. Its lessons,
// tests and audio have separate rights and must not be bundled here.
const [reciteRoot, wordtapRoot] = process.argv.slice(2).map(value => path.resolve(value))
if (!reciteRoot || !wordtapRoot || process.argv.length !== 4) {
  throw new Error('Usage: node scripts/import-open-word-sources.mjs <recite checkout> <WordTap checkout>')
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const publicRoot = path.join(appRoot, 'public')
const listPath = path.join(publicRoot, 'list', 'word.json')
const reciteTarget = path.join(publicRoot, 'dicts', 'en', 'word')
const wordtapTarget = path.join(publicRoot, 'dicts', 'en', 'wordtap-ecdict')

const lists = [
  { id: 'zk', name: '中考', category: '中学英语' },
  { id: 'gk', name: '高考', category: '中学英语' },
  { id: 'cet4', name: '四级', category: '中国考试' },
  { id: 'cet6', name: '六级', category: '中国考试' },
  { id: 'ky', name: '考研', category: '中国考试' },
  { id: 'toefl', name: '托福', category: '留学考试' },
  { id: 'ielts', name: '雅思', category: '留学考试' },
  { id: 'gre', name: 'GRE', category: '留学考试' },
  { id: 'awl', name: '学术英语 AWL', category: '学术英语' },
]

await mkdir(reciteTarget, { recursive: true })
await mkdir(wordtapTarget, { recursive: true })

const currentList = JSON.parse(await readFile(listPath, 'utf8'))
const mergedList = currentList.filter(item => !String(item.id).startsWith('recite-'))
for (const list of lists) {
  const source = path.join(reciteRoot, 'public', 'data', `${list.id}.json`)
  const words = JSON.parse(await readFile(source, 'utf8'))
  if (!Array.isArray(words) || !words.every(item => typeof item.word === 'string')) {
    throw new Error(`Invalid recite word list: ${source}`)
  }
  const targetName = `RECITE_${list.id.toUpperCase()}.json`
  await copyFile(source, path.join(reciteTarget, targetName))
  mergedList.push({
    id: `recite-${list.id}`,
    enName: `recite-${list.id}`,
    name: `${list.name} · recite`,
    description: `recite 提供的 ECDICT 高频排序词表（${words.length} 词）`,
    category: list.category,
    tags: ['recite', list.name],
    url: targetName,
    length: words.length,
    language: 'en',
    translateLanguage: 'zh-CN',
    version: 1,
    type: 'word',
  })
}
await writeFile(listPath, JSON.stringify(mergedList, null, 2) + '\n')

const sourceManifestPath = path.join(wordtapRoot, 'public', 'dict', 'manifest.json')
const sourceManifest = JSON.parse(await readFile(sourceManifestPath, 'utf8'))
const buckets = new Map()
let entryCount = 0

function bucketFor(word) {
  return word.replace(/[^a-z]/g, '').slice(0, 2).padEnd(2, '_')
}

for (const filename of Object.values(sourceManifest.shardFiles)) {
  if (path.basename(filename) !== filename || !filename.endsWith('.json')) {
    throw new Error(`Unexpected WordTap shard filename: ${filename}`)
  }
  const source = path.join(wordtapRoot, 'public', 'dict', 'shards', filename)
  const entries = JSON.parse(await readFile(source, 'utf8'))
  for (const [rawKey, entry] of Object.entries(entries)) {
    const key = rawKey.toLowerCase()
    // Reading click-to-collect selects single English words (including contractions
    // and hyphenated words), not phrases, proper names with spaces, or exam text.
    if (!/^[a-z]+(?:['-][a-z]+)*$/.test(key)) continue
    if (!entry.translation && !entry.definition) continue
    const prefix = bucketFor(key)
    if (!buckets.has(prefix)) buckets.set(prefix, Object.create(null))
    buckets.get(prefix)[key] = [entry.phonetic ?? '', entry.translation ?? '', entry.definition ?? '']
    entryCount += 1
  }
}

let largestBucketBytes = 0
for (const [prefix, entries] of buckets) {
  const content = JSON.stringify(entries)
  largestBucketBytes = Math.max(largestBucketBytes, Buffer.byteLength(content))
  await writeFile(path.join(wordtapTarget, `${prefix}.json`), content)
}
await writeFile(path.join(wordtapTarget, 'manifest.json'), JSON.stringify({
  source: 'WordTap ECDICT',
  sourceEntryCount: sourceManifest.entryCount,
  importedSingleWords: entryCount,
  bucketCount: buckets.size,
  format: 'lowercase word -> [phonetic, Chinese translation, English definition]',
}, null, 2) + '\n')
await copyFile(path.join(reciteRoot, 'LICENSE'), path.join(publicRoot, 'recite-LICENSE'))
await copyFile(path.join(wordtapRoot, 'public', 'dict', 'LICENSE'), path.join(publicRoot, 'wordtap-ecdict-LICENSE'))
console.log(`Imported ${lists.length} recite lists and ${entryCount} WordTap ECDICT single words into ${buckets.size} lazy buckets.`)
console.log(`Largest WordTap bucket: ${(largestBucketBytes / 1024 / 1024).toFixed(2)} MiB`)
