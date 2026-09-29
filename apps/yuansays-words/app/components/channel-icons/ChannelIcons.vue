<script setup lang="ts">
import Github from './Github.vue'
withDefaults(defineProps<{ type?: 'vertical' | 'horizontal'; share?: boolean; wechat?: boolean; github?: boolean }>(), { type: 'vertical', github: true })
</script>

<template>
  <div class="center gap-3" :class="type === 'vertical' && 'flex-col'">
    <Github v-if="github" />
    <NuxtLink to="/about" class="text-sm">关于</NuxtLink>
  </div>
</template>
