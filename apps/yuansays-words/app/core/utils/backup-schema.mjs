const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)

function requireObject(value, label) {
  if (!isObject(value)) throw new Error(`${label}格式无效，现有学习数据未更改。`)
  return value
}

function requireVersion(value, maximum, label, minimum = 1) {
  if (!Number.isInteger(value) || value < minimum) throw new Error(`${label}缺少有效版本号。`)
  if (value > maximum) throw new Error(`${label}来自更新版本，请更新网站后再导入；现有学习数据未更改。`)
}

function requireStringRecord(value, label) {
  requireObject(value, label)
  if (Object.values(value).some(item => typeof item !== 'string')) throw new Error(`${label}包含无效内容。`)
}

function validateOptionalNumber(object, key, label, minimum = 0) {
  if (object[key] !== undefined && (!Number.isFinite(object[key]) || object[key] < minimum)) {
    throw new Error(`${label}的 ${key} 必须是有效数值。`)
  }
}

function validDate(value) {
  return (value instanceof Date || typeof value === 'number' || (typeof value === 'string' && value.trim().length > 0)) &&
    Number.isFinite(new Date(value).getTime())
}

function validateFsrsCard(card) {
  requireObject(card, '复习卡片')
  if (!validDate(card.due) || (card.last_review != null && !validDate(card.last_review))) {
    throw new Error('复习卡片到期日期或上次复习日期无效。')
  }
  for (const field of ['stability', 'difficulty', 'elapsed_days', 'scheduled_days', 'learning_steps', 'reps', 'lapses']) {
    validateOptionalNumber(card, field, '复习卡片')
  }
  if (card.difficulty !== undefined && card.difficulty > 10) throw new Error('复习卡片难度超出范围。')
  if (card.state !== undefined && ![0, 1, 2, 3, 'New', 'Learning', 'Review', 'Relearning'].includes(card.state)) {
    throw new Error('复习卡片状态无效。')
  }
}

function validateCriticalSettings(settings) {
  if (settings.fontSize !== undefined) {
    requireObject(settings.fontSize, '字号设置')
    for (const field of ['articleForeignFontSize', 'articleTranslateFontSize', 'wordForeignFontSize', 'wordTranslateFontSize']) {
      validateOptionalNumber(settings.fontSize, field, '字号设置', Number.MIN_VALUE)
    }
  }
  if (settings.shortcutKeyMap !== undefined) requireStringRecord(settings.shortcutKeyMap, '快捷键设置')
  if (settings.ttsVoiceMap !== undefined && (!Array.isArray(settings.ttsVoiceMap) || settings.ttsVoiceMap.some(item =>
    !isObject(item) || typeof item.key !== 'string' || typeof item.voice !== 'string'
  ))) throw new Error('语音声线设置无效。')
  for (const field of ['fsrsEasyLimit', 'fsrsGoodLimit', 'fsrsHardLimit']) validateOptionalNumber(settings, field, '复习评分设置')
  if (settings.fsrsParameters !== undefined) {
    const parameters = requireObject(settings.fsrsParameters, 'FSRS 参数')
    if (parameters.request_retention !== undefined && (!Number.isFinite(parameters.request_retention) || parameters.request_retention <= 0 || parameters.request_retention >= 1)) {
      throw new Error('FSRS 目标记忆率必须介于 0 和 1 之间。')
    }
    validateOptionalNumber(parameters, 'maximum_interval', 'FSRS 参数', Number.MIN_VALUE)
    if (parameters.w !== undefined && (!Array.isArray(parameters.w) || ![17, 19, 21].includes(parameters.w.length) || parameters.w.some(value => !Number.isFinite(value)))) {
      throw new Error('FSRS 权重必须是 17、19 或 21 个有效数值。')
    }
    for (const field of ['enable_fuzz', 'enable_short_term']) {
      if (parameters[field] !== undefined && typeof parameters[field] !== 'boolean') throw new Error('FSRS 开关设置无效。')
    }
    for (const field of ['learning_steps', 'relearning_steps']) {
      if (parameters[field] !== undefined && (!Array.isArray(parameters[field]) || parameters[field].some(step =>
        typeof step !== 'string' || !/^\d+(?:\.\d+)?[mhd]$/.test(step) || parseFloat(step) <= 0
      ))) throw new Error('FSRS 学习间隔格式无效，请使用 1m、10m 或 1d 等格式。')
    }
  }
}

function validateWords(words, label) {
  if (!Array.isArray(words)) throw new Error(`${label}词条列表无效。`)
  for (const word of words) {
    if (!isObject(word) || typeof word.word !== 'string' || !word.word.trim()) {
      throw new Error(`${label}包含无效词条。`)
    }
    if (!Array.isArray(word.trans) || word.trans.some(item => !isObject(item) || typeof item.cn !== 'string')) {
      throw new Error(`${label}包含无效释义。`)
    }
    for (const field of ['sentences', 'phrases', 'synos', 'etymology']) {
      if (word[field] !== undefined && !Array.isArray(word[field])) throw new Error(`${label}词条的 ${field} 格式无效。`)
    }
    if (word.relWords !== undefined && (!isObject(word.relWords) || !Array.isArray(word.relWords.rels))) {
      throw new Error(`${label}词条的关联词格式无效。`)
    }
  }
}

function validateBookList(value, label, wordBook) {
  const section = requireObject(value, label)
  if (!Array.isArray(section.bookList) || !Number.isInteger(section.studyIndex)) throw new Error(`${label}列表或学习位置无效。`)
  if (section.studyIndex < -1 || section.studyIndex >= section.bookList.length) throw new Error(`${label}学习位置超出范围。`)
  for (const book of section.bookList) {
    requireObject(book, label)
    if (typeof book.name !== 'string') throw new Error(`${label}名称无效。`)
    if (wordBook) validateWords(book.words, label)
    if (book.articles !== undefined && !Array.isArray(book.articles)) throw new Error(`${label}文章列表无效。`)
    if (book.statistics !== undefined && !Array.isArray(book.statistics)) throw new Error(`${label}统计数据无效。`)
    if (book.perDayStudyNumber !== undefined && (!Number.isInteger(book.perDayStudyNumber) || book.perDayStudyNumber < 0)) {
      throw new Error(`${label}每日学习数量无效。`)
    }
  }
}

/** Pure preflight. Never mutates input, calls migration, or touches browser storage. */
export function validateBackupEnvelope(input, versions = { export: 5, dict: 4, setting: 23, practiceWord: 2, practiceArticle: 1 }) {
  const root = requireObject(input, '备份')
  requireVersion(root.version, versions.export, '备份', 4)
  const data = requireObject(root.val, '备份内容')
  for (const key of ['dict', 'setting']) {
    const envelope = requireObject(data[key], key === 'dict' ? '词典数据' : '设置数据')
    requireVersion(envelope.version, versions[key], key === 'dict' ? '词典数据' : '设置数据')
    requireObject(envelope.val, key === 'dict' ? '词典内容' : '设置内容')
  }
  validateBookList(data.dict.val.word, '单词词库', true)
  if (data.dict.val.article !== undefined) validateBookList(data.dict.val.article, '文章词库', false)
  if (data.dict.val.simpleWords !== undefined && (!Array.isArray(data.dict.val.simpleWords) || data.dict.val.simpleWords.some(word => typeof word !== 'string'))) {
    throw new Error('已忽略单词列表无效。')
  }
  if (data.dict.val.noteData !== undefined) requireStringRecord(data.dict.val.noteData, '单词笔记')
  if (data.dict.val.fsrsData !== undefined) {
    requireObject(data.dict.val.fsrsData, '复习数据')
    Object.values(data.dict.val.fsrsData).forEach(validateFsrsCard)
  }
  validateCriticalSettings(data.setting.val)
  for (const [key, maxVersion] of [['PracticeSaveWord', versions.practiceWord], ['PracticeSaveArticle', versions.practiceArticle]]) {
    const cache = data[key]
    if (cache == null) continue
    requireObject(cache, '练习进度')
    requireVersion(cache.version ?? 1, maxVersion, '练习进度')
    if (cache.val == null) continue
    requireObject(cache.val, '练习进度内容')
    if (key === 'PracticeSaveWord') {
      const task = cache.val.taskWordsStr ?? cache.val.taskWords
      if (task !== undefined && (!isObject(task) || !Array.isArray(task.new) || !Array.isArray(task.review))) {
        throw new Error('练习任务列表无效。')
      }
      if (cache.val.taskWordsStr && [...cache.val.taskWordsStr.new, ...cache.val.taskWordsStr.review].some(word => typeof word !== 'string' || !word)) {
        throw new Error('练习任务包含无效词条。')
      }
      if (cache.val.practiceData !== undefined) {
        const practice = requireObject(cache.val.practiceData, '练习位置')
        if (!Number.isInteger(practice.index) || practice.index < 0) throw new Error('练习位置无效。')
        for (const field of ['wordsStr', 'wrongWordsStr', 'words', 'wrongWords']) {
          if (practice[field] !== undefined && !Array.isArray(practice[field])) throw new Error('练习词条列表无效。')
        }
        for (const field of ['wordsStr', 'wrongWordsStr', 'excludeWords', 'allWrongWords']) {
          if (practice[field] !== undefined && (!Array.isArray(practice[field]) || practice[field].some(word => typeof word !== 'string'))) {
            throw new Error('练习词条列表包含无效数据。')
          }
        }
      }
      if (cache.val.sessionSnapshot !== undefined) {
        const snapshot = requireObject(cache.val.sessionSnapshot, '练习流程')
        const cursor = requireObject(snapshot.cursor, '练习流程位置')
        if (typeof snapshot.flowId !== 'string' || !Number.isInteger(cursor.nodeIndex) || cursor.nodeIndex < 0 || !Number.isInteger(cursor.stepIndex) || cursor.stepIndex < 0) {
          throw new Error('练习流程位置无效。')
        }
      }
    }
  }
  return root
}
