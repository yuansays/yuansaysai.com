import { APP_VERSION } from '../config/env'
import { debounce } from '../utils'
import type { BaseState, SettingState } from '../stores'
import { useBaseStore, useRuntimeStore, useSettingStore } from '../stores'
import { ensureHashGuardBeforeInit, useDataSyncPersistence } from './useDataSyncPersistence'
import { SyncDataType } from '../types'
import { onUnmounted } from 'vue'
import { Toast } from '@/base'

let unsub = null
let unsub2 = null

export function useInit() {
  const store = useBaseStore()
  const settingStore = useSettingStore()
  const runtimeStore = useRuntimeStore()
  const dataSync = useDataSyncPersistence()
  let initializing = false // 标记是否正在初始化
  let fetching = false
  let fetching2 = false
  let ready = false
  let lastSaveErrorAt = 0

  function reportSaveError(error: unknown) {
    console.error('Local learning data could not be saved', error)
    if (Date.now() - lastSaveErrorAt > 5000) {
      lastSaveErrorAt = Date.now()
      Toast.error('学习数据保存失败，请检查浏览器存储空间，并立即在设置中导出备份。')
    }
  }

  async function persistNow() {
    if (!ready || initializing || runtimeStore.globalLoading) return
    try {
      await Promise.all([
        dataSync.saveDictState(store.$state),
        dataSync.saveLocalAndSync(SyncDataType.setting, settingStore.$state),
      ])
    } catch (error) {
      reportSaveError(error)
    }
  }

  const onvisibilitychange = () => {
    // Flush before suspension; focus guards used to discard pending changes.
    if (document.hidden) void persistNow()
  }
  const onPageHide = () => { void persistNow() }

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onvisibilitychange)
    window.removeEventListener('pagehide', onPageHide)
    unsub?.()
    unsub2?.()
  })

  //init 有可能重复执行，因为从老网站导了数据之后需要 init
  async function init() {
    if (initializing) return
    initializing = true
    ready = false
    console.time('init')

    //先清理副作用，避免重复监听
    unsub?.()
    unsub2?.()
    document.removeEventListener('visibilitychange', onvisibilitychange)
    window.removeEventListener('pagehide', onPageHide)

    await ensureHashGuardBeforeInit()
    // await userStore.init()
    await store.init()
    await settingStore.init()
    settingStore.load = true
    store.load = true
    console.timeEnd('init')
    initializing = false // 初始化完成，允许保存数据
    ready = true

    //等数据全部准备好，再开启监听，避免循环保存-同步
    document.addEventListener('visibilitychange', onvisibilitychange)
    window.addEventListener('pagehide', onPageHide)
    //用 $subscribe 替代 watch
    unsub = store.$subscribe(
      debounce(async (mutation, data: BaseState) => {
        if (fetching || !ready || runtimeStore.globalLoading) return
        if (data._ignoreWatch) {
          data._ignoreWatch = false
          return
        }
        if (mutation.type === 'direct' && mutation.events?.key === '_ignoreWatch') {
          return
        }
        fetching = true
        try {
          await dataSync.saveDictState(data)
        } catch (error) {
          reportSaveError(error)
        } finally {
          fetching = false
        }
      }, 150)
    )

    unsub2 = settingStore.$subscribe(
      debounce(async (mutation, data: SettingState) => {
        if (fetching2 || !ready || runtimeStore.globalLoading) return
        if (data._ignoreWatch) {
          data._ignoreWatch = false
          return
        }
        if (mutation.type === 'direct' && mutation.events?.key === '_ignoreWatch') {
          return
        }
        fetching2 = true
        try {
          await dataSync.saveLocalAndSync(SyncDataType.setting, data)
        } catch (error) {
          reportSaveError(error)
        } finally {
          fetching2 = false
        }
      }, 150)
    )

    runtimeStore.isNew = APP_VERSION.version > Number(settingStore.webAppVersion)
    // runtimeStore.isNew = true
    runtimeStore.isError = false
  }

  return init
}
