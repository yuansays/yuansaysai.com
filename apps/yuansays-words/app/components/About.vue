<script setup lang="ts">
const config = useRuntimeConfig()
const revision = /^[a-f0-9]{40}$/.test(String(config.public.sourceCommit)) ? config.public.sourceCommit : 'main'
const sourceUrl = `https://github.com/yuansays/yuansaysai.com/tree/${revision}/apps/yuansays-words`
const licenseUrl = `https://github.com/yuansays/yuansaysai.com/blob/${revision}/apps/yuansays-words/LICENSE`
</script>

<template>
  <div class="max-w-120 w-full space-y-4">
    <h1>yuansays words</h1>
    <p>用键盘练习拼写，通过间隔复习记住单词。选一本词库，从今天的一小组单词开始。</p>
    <p>学习进度保存在当前浏览器中。换设备前，请在设置中导出备份，再到新设备导入。</p>
    <p>156349.xyz 与 yuansaysai.com 的学习记录不会自动同步；如需转移，请使用备份导出和导入。</p>
    <p>基于 <a href="https://github.com/zyronon/TypeWords" target="_blank" rel="noopener noreferrer">TypeWords</a> 修改，感谢原项目作者与贡献者。</p>
    <p>新增 <a href="https://github.com/imjiaoyuan/recite" target="_blank" rel="noopener noreferrer">recite</a> 的九本开放词表，并以 <a href="https://github.com/hawkhai/wordtap.cn" target="_blank" rel="noopener noreferrer">WordTap</a> 使用的 ECDICT 数据提供阅读查词。两者的基础词典同源；教材、试题和录音没有转载。</p>
    <div class="flex flex-wrap gap-4">
      <a :href="sourceUrl" target="_blank" rel="noopener noreferrer">源代码</a>
      <a :href="licenseUrl" target="_blank" rel="noopener noreferrer">GPL-3.0</a>
      <NuxtLink to="/help">使用帮助</NuxtLink>
      <NuxtLink to="/read">阅读采词</NuxtLink>
      <a href="/words/recite-LICENSE" target="_blank" rel="noopener noreferrer">recite MIT</a>
      <a href="/words/wordtap-ecdict-LICENSE" target="_blank" rel="noopener noreferrer">ECDICT MIT</a>
      <a href="/">返回个人主页</a>
    </div>
  </div>
</template>
