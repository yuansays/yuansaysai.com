import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createEmptyCard, FSRS, Rating, generatorParameters } from 'ts-fsrs'
import { validateBackupEnvelope } from './backup-schema.mjs'
import { isWholePracticeInputCorrect, getWholeInputAfterWrongBackspace } from '../composables/practice-words/visible-word-typing.ts'

const words = JSON.parse(await readFile(new URL('../../../public/dicts/en/word/CET4_T.json', import.meta.url), 'utf8'))

function backup() {
  const card = createEmptyCard(new Date('2026-09-28T09:00:00.000Z'))
  return {
    version: 5,
    val: {
      dict: {
        version: 4,
        val: {
          word: { studyIndex: 0, bookList: [{ name: 'My vocabulary', custom: true, words, statistics: [], perDayStudyNumber: 20 }] },
          article: { studyIndex: -1, bookList: [] },
          fsrsData: { cancel: card },
          noteData: { cancel: 'Remember the double l in cancelled.' },
        },
      },
      setting: { version: 23, val: { soundType: 'uk', shortcutKeyMap: { Next: 'Ctrl+➡' } } },
      PracticeSaveWord: {
        version: 2,
        val: {
          taskWordsStr: { new: ['cancel', 'priority'], review: ['cancel'] },
          practiceData: { index: 1, wordsStr: ['cancel', 'priority'], wrongWordsStr: ['cancel'], allWrongWords: ['cancel'], excludeWords: [] },
          sessionSnapshot: { flowId: 'system', cursor: { nodeIndex: 0, stepIndex: 1, inWrongWordClear: true, loop: null, endActionIndex: 0 } },
        },
      },
      PracticeSaveArticle: { version: 1, val: null },
    },
  }
}

test('all 2607 bundled rich words survive a JSON backup preflight without mutation', () => {
  assert.equal(words.length, 2607)
  const original = JSON.stringify(backup())
  const parsed = JSON.parse(original)
  validateBackupEnvelope(parsed)
  assert.equal(JSON.stringify(parsed), original)
  assert.deepEqual(parsed.val.dict.val.noteData, { cancel: 'Remember the double l in cancelled.' })
  assert.deepEqual(parsed.val.PracticeSaveWord.val.practiceData.wrongWordsStr, ['cancel'])
})

test('upstream v4 backup without optional practice caches is accepted', () => {
  const value = backup()
  value.version = 4
  delete value.val.PracticeSaveWord
  delete value.val.PracticeSaveArticle
  value.val['type-words-app-version'] = 3
  assert.doesNotThrow(() => validateBackupEnvelope(value))
})

test('future versions reject the entire backup and leave the input intact', () => {
  for (const change of [
    value => { value.version = 6 },
    value => { value.val.dict.version = 5 },
    value => { value.val.setting.version = 24 },
    value => { value.val.PracticeSaveWord.version = 3 },
    value => { value.val.PracticeSaveArticle.version = 2 },
  ]) {
    const value = backup()
    change(value)
    const before = JSON.stringify(value)
    assert.throws(() => validateBackupEnvelope(value), /更新版本/)
    assert.equal(JSON.stringify(value), before)
  }
})

test('corrupted dictionary, review dates and progress reject before restore', () => {
  for (const change of [
    value => { value.val.dict = null },
    value => { value.val.dict.val.word.studyIndex = 999 },
    value => { value.val.dict.val.word.bookList[0].words = [{ word: '', trans: [] }] },
    value => { value.val.dict.val.fsrsData.cancel.due = 'not-a-date' },
    value => { value.val.PracticeSaveWord.val.taskWordsStr.new = [null] },
    value => { value.val.PracticeSaveWord.val.practiceData.wrongWordsStr = [42] },
    value => { value.val.PracticeSaveWord.val.sessionSnapshot.cursor.stepIndex = -1 },
  ]) {
    const value = structuredClone(backup())
    change(value)
    assert.throws(() => validateBackupEnvelope(value))
  }
})

test('present malformed fields cannot replace valid dictionaries, notes, display or speech settings', () => {
  for (const change of [
    value => { value.val.dict.val.simpleWords = null },
    value => { value.val.dict.val.simpleWords = ['a', 42] },
    value => { value.val.dict.val.noteData = null },
    value => { value.val.dict.val.noteData = { cancel: {} } },
    value => { value.val.setting.val.fontSize = null },
    value => { value.val.setting.val.fontSize = { wordForeignFontSize: 0 } },
    value => { value.val.setting.val.fontSize = { wordTranslateFontSize: '20' } },
    value => { value.val.setting.val.shortcutKeyMap = { Next: null } },
    value => { value.val.setting.val.ttsVoiceMap = {} },
    value => { value.val.setting.val.ttsVoiceMap = [{ key: 'windows+chrome', voice: null }] },
  ]) {
    const value = structuredClone(backup())
    change(value)
    const before = JSON.stringify(value)
    assert.throws(() => validateBackupEnvelope(value))
    assert.equal(JSON.stringify(value), before)
  }
})

test('invalid FSRS numbers, dates and parameter arrays are rejected before persistence', () => {
  for (const change of [
    value => { value.val.dict.val.fsrsData.cancel.due = null },
    value => { value.val.dict.val.fsrsData.cancel.last_review = 'broken' },
    value => { value.val.dict.val.fsrsData.cancel.stability = '4' },
    value => { value.val.dict.val.fsrsData.cancel.difficulty = 11 },
    value => { value.val.dict.val.fsrsData.cancel.reps = -1 },
    value => { value.val.dict.val.fsrsData.cancel.state = 9 },
    value => { value.val.setting.val.fsrsParameters = null },
    value => { value.val.setting.val.fsrsParameters = { w: [1, 2] } },
    value => { value.val.setting.val.fsrsParameters = { w: Array(21).fill(null) } },
    value => { value.val.setting.val.fsrsParameters = { request_retention: 1 } },
    value => { value.val.setting.val.fsrsParameters = { maximum_interval: 0 } },
    value => { value.val.setting.val.fsrsParameters = { learning_steps: ['tomorrow'] } },
    value => { value.val.setting.val.fsrsParameters = { enable_short_term: 'false' } },
  ]) {
    const value = structuredClone(backup())
    change(value)
    assert.throws(() => validateBackupEnvelope(value))
  }
})

test('missing legacy fields remain migratable and valid current settings pass unchanged', () => {
  const legacy = backup()
  legacy.version = 4
  delete legacy.val.dict.val.noteData
  delete legacy.val.dict.val.fsrsData.cancel.learning_steps
  delete legacy.val.setting.val.shortcutKeyMap
  assert.doesNotThrow(() => validateBackupEnvelope(legacy))
  const current = backup()
  current.val.dict.val.simpleWords = ['a', 'the']
  current.val.setting.val.fontSize = { articleForeignFontSize: 48, articleTranslateFontSize: 20, wordForeignFontSize: 48, wordTranslateFontSize: 20 }
  current.val.setting.val.ttsVoiceMap = [{ key: 'windows+chrome', voice: 'English (US)' }]
  current.val.setting.val.fsrsParameters = generatorParameters({ enable_fuzz: false })
  const before = JSON.stringify(current)
  validateBackupEnvelope(current)
  assert.equal(JSON.stringify(current), before)
  for (const length of [17, 19, 21]) {
    current.val.setting.val.fsrsParameters.w = Array(length).fill(1)
    assert.doesNotThrow(() => validateBackupEnvelope(current))
  }
})

test('FSRS Good/Easy reviews move beyond the current day and preserve due dates through JSON', () => {
  const now = new Date('2026-09-28T09:00:00.000Z')
  const engine = new FSRS(generatorParameters({ enable_fuzz: false, enable_short_term: false }))
  for (const grade of [Rating.Good, Rating.Easy]) {
    const result = engine.next(createEmptyCard(now), now, grade).card
    assert.ok(result.due.getTime() >= now.getTime() + 86400000)
    const saved = JSON.parse(JSON.stringify(result))
    assert.equal(new Date(saved.due).getTime(), result.due.getTime())
    const next = engine.next(saved, new Date(saved.due), Rating.Good).card
    assert.ok(next.due.getTime() > new Date(saved.due).getTime())
  }
})

test('typing respects case preference, length, and corrects from the first actual error', () => {
  assert.equal(isWholePracticeInputCorrect('Cancel', 'cancel', true), true)
  assert.equal(isWholePracticeInputCorrect('Cancel', 'cancel', false), false)
  assert.equal(isWholePracticeInputCorrect('cance', 'cancel', true), false)
  assert.equal(getWholeInputAfterWrongBackspace('canxel', 'cancel', true), 'can')
  assert.equal(getWholeInputAfterWrongBackspace('cancel', 'cancel', true), 'cance')
})
