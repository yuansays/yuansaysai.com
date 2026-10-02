<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { BasePage } from '@/base'
import ClickableEnglishText from '@/components/word/ClickableEnglishText.vue'
import WordLookupPopover from '@/components/word/WordLookupPopover.vue'
import { splitEnglishText } from '@/core/utils/wordLookup.ts'
import { useBaseStore } from '@/core/stores/base.ts'

const STORAGE_KEY = 'yuansays-words:reading-draft:v1'
const MAX_CHARS = 20000
const sample = `Learning a language is not a race. A short article can become a small adventure when you pause at a new word, listen to its sound, and save it for another day.\n\nRead with curiosity. Every word you collect gives you one more way to describe the world.`

const store = useBaseStore()
const title = ref('')
const articleText = ref('')
const reading = ref(false)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const paragraphs = computed(() => articleText.value.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean))
const wordCount = computed(() => splitEnglishText(articleText.value).filter(token => token.isWord).length)
const collectedCount = computed(() => store.collectWord?.words?.length ?? 0)

useSeoMeta({
  title: '英语阅读采词｜yuansays words',
  description: '粘贴自己的英文文章，点击单词查看释义并收藏到原有生词本。文章只保存在当前浏览器。',
})

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved && typeof saved === 'object') {
      title.value = typeof saved.title === 'string' ? saved.title.slice(0, 80) : ''
      articleText.value = typeof saved.text === 'string' ? saved.text.slice(0, MAX_CHARS) : ''
      reading.value = !!articleText.value
    }
  } catch {
    errorMessage.value = '上次的阅读草稿无法恢复，请重新粘贴文章。'
  }
})

watch([title, articleText], () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: title.value, text: articleText.value }))
    errorMessage.value = ''
  } catch {
    errorMessage.value = '浏览器存储空间不足，这次阅读内容可能无法自动保存。'
  }
})

function startReading() {
  if (!articleText.value.trim()) {
    errorMessage.value = '先粘贴一段英文，或打开试读示例。'
    return
  }
  errorMessage.value = ''
  reading.value = true
}

function useSample() {
  title.value = 'A small adventure'
  articleText.value = sample
  reading.value = true
}

async function importTextFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    if (file.size > 100_000) throw new Error('文件超过 100 KB，请截取一段再导入。')
    const content = await file.text()
    if (content.length > MAX_CHARS) throw new Error(`文章超过 ${MAX_CHARS.toLocaleString()} 字符，请截取一段再导入。`)
    title.value = file.name.replace(/\.txt$/i, '').slice(0, 80)
    articleText.value = content
    reading.value = true
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '文件读取失败。'
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <BasePage>
    <main class="read-page">
      <header class="read-hero">
        <div class="eyebrow">YUANSAYS WORDS · READ & COLLECT</div>
        <h1>读一段，留下几个新词。</h1>
        <p>带来你自己的英文文章。点一下不认识的词，看释义，再收进原来的生词本。</p>
        <div class="read-stats">
          <span>{{ wordCount }} 个词</span>
          <span>{{ collectedCount }} 个已收藏词</span>
          <span>仅保存在此浏览器</span>
        </div>
      </header>

      <section class="read-surface">
        <div class="surface-toolbar">
          <div class="surface-title">{{ reading ? (title || '未命名文章') : '准备文章' }}</div>
          <div class="toolbar-actions">
            <button v-if="reading" type="button" @click="reading = false">编辑文章</button>
            <template v-else>
              <button type="button" @click="useSample">试读示例</button>
              <button type="button" @click="fileInput?.click()">导入 .txt</button>
            </template>
          </div>
        </div>

        <div v-if="!reading" class="editor">
          <label for="reading-title">标题</label>
          <input id="reading-title" v-model="title" type="text" maxlength="80" placeholder="给这篇文章起个名字（可选）" />
          <label for="reading-text">英文内容</label>
          <textarea
            id="reading-text"
            v-model="articleText"
            :maxlength="MAX_CHARS"
            placeholder="在这里粘贴你有权使用的英文文章。我们不会把文章上传到服务器。"
            spellcheck="false"
          />
          <div class="editor-footer">
            <span>{{ articleText.length.toLocaleString() }} / {{ MAX_CHARS.toLocaleString() }} 字符</span>
            <button class="primary-action" type="button" @click="startReading">开始阅读</button>
          </div>
        </div>

        <div v-else class="reader">
          <p class="reader-hint">点击英文单词查看释义，点星标选择生词本。选中的词会进入原有背词流程。</p>
          <div class="reading-paper" lang="en">
            <p v-for="(paragraph, index) in paragraphs" :key="index">
              <ClickableEnglishText :text="paragraph" :dictation="false" :high-light="false" word="" />
            </p>
          </div>
        </div>
        <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
      </section>

      <footer class="read-footer">
        <NuxtLink to="/dict-list">去词书列表 →</NuxtLink>
        <span>词典来源：recite / WordTap 的 ECDICT 数据。教材文章、试题和音频未转载。</span>
      </footer>
      <input ref="fileInput" class="visually-hidden" type="file" accept=".txt,text/plain" @change="importTextFile" />
      <WordLookupPopover />
    </main>
  </BasePage>
</template>

<style scoped lang="scss">
.read-page { padding: 1rem 1rem 3rem; }
.read-hero { padding: 2.3rem 1rem 1.8rem; }
.eyebrow { color: var(--color-select-bg); font-size: .72rem; font-weight: 700; letter-spacing: .18em; }
.read-hero h1 { margin: .55rem 0 .65rem; font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1.2; color: var(--color-main-text); }
.read-hero p { margin: 0; color: var(--color-main-text); opacity: .78; line-height: 1.7; }
.read-stats { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.5rem; }
.read-stats span { padding: .35rem .7rem; border: 1px solid var(--color-line); border-radius: 999px; color: var(--color-main-text); font-size: .8rem; }
.read-surface { overflow: hidden; border: 1px solid var(--color-line); border-radius: 1rem; background: var(--color-second); box-shadow: 0 12px 32px rgb(0 0 0 / 5%); }
.surface-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.3rem; border-bottom: 1px solid var(--color-line); }
.surface-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-main-text); font-weight: 700; }
.toolbar-actions { display: flex; flex-shrink: 0; gap: .4rem; }
button { padding: .55rem .8rem; border: 1px solid var(--color-line); border-radius: .55rem; background: transparent; color: var(--color-main-text); cursor: pointer; }
button:hover { border-color: var(--color-select-bg); color: var(--color-select-bg); }
.editor { display: flex; flex-direction: column; gap: .65rem; padding: 1.3rem; }
.editor label { color: var(--color-main-text); font-size: .82rem; font-weight: 650; }
.editor input, .editor textarea { width: 100%; padding: .85rem 1rem; border: 1px solid var(--color-line); border-radius: .6rem; outline: none; background: var(--color-primary); color: var(--color-main-text); box-sizing: border-box; }
.editor input:focus, .editor textarea:focus { border-color: var(--color-select-bg); }
.editor textarea { min-height: 18rem; resize: vertical; line-height: 1.7; }
.editor-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: var(--color-main-text); font-size: .82rem; }
.primary-action { padding: .7rem 1.2rem; border-color: var(--color-select-bg); background: var(--color-select-bg); color: white; font-weight: 700; }
.primary-action:hover { color: white; filter: brightness(1.08); }
.reader { padding: 1.3rem clamp(1.3rem, 4vw, 3rem) 2.5rem; }
.reader-hint { margin: 0 0 1.8rem; color: var(--color-main-text); opacity: .7; font-size: .85rem; }
.reading-paper { max-width: 70ch; margin: 0 auto; color: var(--color-main-text); font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.15rem, 2vw, 1.4rem); line-height: 2.15; overflow-wrap: anywhere; }
.reading-paper p { margin: 0 0 1.4em; white-space: pre-wrap; }
.error-message { margin: 0; padding: 0 1.3rem 1.2rem; color: #da4b4b; }
.read-footer { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem; color: var(--color-main-text); font-size: .75rem; opacity: .78; }
.read-footer a { color: var(--color-select-bg); white-space: nowrap; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
@media (max-width: 600px) { .read-page { padding: 0 .4rem 2rem; } .read-hero { padding: 1.4rem .5rem; } .read-footer { flex-direction: column; } }
</style>
