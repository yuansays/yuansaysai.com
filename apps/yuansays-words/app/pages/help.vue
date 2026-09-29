<script setup lang="ts">
import { BasePage, Collapse } from '@/base'
import ConflictNoticeText from '@/components/dialog/ConflictNoticeText.vue'
useSeoMeta({ title: '使用帮助 | yuansays words', description: '词库选择、练习、进度保存和备份使用说明。' })
</script>

<template>
  <BasePage>
    <div class="center">
      <div class="card-white qa w-full max-w-200">
        <h1 class="font-bold text-2xl mb-6">使用帮助</h1>
        <Collapse q="如何开始背单词？" a="在学习首页选择词库，选择 CET-4，然后点击开始学习。默认按每日任务学习新词并复习到期单词，也可以使用自由练习或随机测试。" />
        <div class="line"></div>
        <Collapse q="如何导入自己的词库？" a="在词库列表点击添加词库，支持 TXT、JSON、XLSX。导入界面会显示格式说明；单词可以带上中文释义。在线查词暂不可用，请在导入文件中提供释义。" />
        <div class="line"></div>
        <Collapse q="进度保存在哪里？" a="词库、设置和学习进度保存在当前浏览器中。刷新页面可以继续未完成的任务。清理网站数据、使用无痕模式或更换浏览器可能使数据不可用，请定期到设置 → 数据管理导出备份。" />
        <div class="line"></div>
        <Collapse q="如何换设备或恢复备份？" a="在设置 → 数据管理中导出备份文件；在新设备打开同一网址后导入。导入会覆盖当前设备的学习数据，先备份再确认恢复。此版本不提供自动云同步。" />
        <div class="line"></div>
        <Collapse q="没有声音怎么办？" a="先检查设备音量和设置中的发音开关。单词网络发音不可用时会尝试浏览器英语语音；如果设备没有安装英语语音，仍可继续文字练习。" />
        <div class="line"></div>
        <Collapse q="键盘输入没有反应">
          <ConflictNoticeText type="keyboard" />
          <p>手机和平板可浏览词库，完整拼写练习推荐使用实体键盘，并切换到英文输入法。</p>
        </Collapse>
        <div class="line"></div>
        <Collapse q="可以离线学习吗？" a="页面和词库加载完成后，当前练习可以继续进行。网络发音需要联网；离线刷新或首次打开仍需要已缓存资源。建议在有网络时先加载词库并保存备份。" />
        <div class="mt-6 flex gap-4"><NuxtLink to="/">返回学习</NuxtLink><NuxtLink to="/about">关于与源代码</NuxtLink></div>
      </div>
    </div>
  </BasePage>
</template>
