import { APP_VERSION, EXPORT_DATA_KEY, SAVE_DICT_KEY, SAVE_SETTING_KEY } from '../config/env'
import type { BackupData } from '../types'
import { getDefaultWord } from '../types'
import { checkAndUpgradeSaveDict, checkAndUpgradeSaveSetting } from './index'
import { checkAndUpgradePracticeWordCache, PRACTICE_ARTICLE_CACHE, PRACTICE_WORD_CACHE } from './cache'
import { validateBackupEnvelope } from './backup-schema.mjs'

/** Validate the complete file before running legacy migrations or persisting any value. */
export async function validateAndUpgradeBackup(input: unknown): Promise<BackupData> {
  validateBackupEnvelope(input, {
    export: EXPORT_DATA_KEY.version,
    dict: SAVE_DICT_KEY.version,
    setting: SAVE_SETTING_KEY.version,
    practiceWord: PRACTICE_WORD_CACHE.version,
    practiceArticle: PRACTICE_ARTICLE_CACHE.version,
  })
  const backup = JSON.parse(JSON.stringify(input)) as BackupData
  const data = backup.val
  data.dict.val = await checkAndUpgradeSaveDict(data.dict)
  // Old backups may omit fields introduced by newer word rendering components.
  data.dict.val.word.bookList.forEach(book => {
    book.words = book.words.map(word => getDefaultWord(word))
  })
  data.setting.val.shortcutKeyMap ??= {}
  data.setting.val = await checkAndUpgradeSaveSetting(data.setting)
  if (backup.version === 4 && Number.isFinite(data[APP_VERSION.key])) {
    data.setting.val.webAppVersion = data[APP_VERSION.key]
  }
  data[PRACTICE_WORD_CACHE.key] = checkAndUpgradePracticeWordCache(data[PRACTICE_WORD_CACHE.key], data.setting.val)
  data[PRACTICE_ARTICLE_CACHE.key] ??= { version: PRACTICE_ARTICLE_CACHE.version, val: null }
  data.dict.version = SAVE_DICT_KEY.version
  data.setting.version = SAVE_SETTING_KEY.version
  backup.version = EXPORT_DATA_KEY.version
  return backup
}
