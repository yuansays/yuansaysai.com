<script setup lang="ts">

withDefaults(
  defineProps<{
    type?: 'all' | 'del' | 'keyboard'
  }>(),
  {
    type: 'all',
  }
)
</script>

<template>
  <div class="text">
    <div class="title" v-if="type === 'all'">{{ $t('conflict_notice_title') }}</div>
    <ul>
      <li v-if="type === 'all' || type === 'keyboard'">
        <div class="title" v-if="type === 'all'">{{ $t('keyboard_no_response') }}</div>
        <div>
          <div class="text">
            {{ $t('check_plugins_installed') }}
            <span class="text-xl font-bold text-red-500">{{ $t('conflict_plugin_names') }}</span>
            {{ $t('plugins_intercept_keyboard') }}<span class="font-bold text-red">{{ $t('cause_no_response') }}</span
            >{{ $t('follow_steps_to_resolve') }}
          </div>
          <ul class="m-0">
            <li>{{ $t('try_incognito_mode') }}</li>
            <li>如果仍无响应，请尝试使用 Chrome 或 Edge，并切换到英文输入法。</li>
            <li>{{ $t('incognito_working') }}</li>
            <li>{{ $t('disable_plugin_or_exclude') }}</li>

          </ul>
        </div>
      </li>
      <li v-if="type === 'all' || type === 'del'">
        <div class="title" v-if="type === 'all'">{{ $t('delete_key_goes_back') }}</div>
        <div>{{ $t('browser_360_shortcut') }}</div>
        <div>{{ $t('change_browser_or_shortcut') }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss"></style>
