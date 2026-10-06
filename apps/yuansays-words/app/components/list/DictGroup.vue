<script setup lang="ts">
import {watch} from "vue";
import type {DictResource} from '@/core/types';
import {uniqueTaggedDicts} from '@/core/utils/dictCatalog.ts';
import DictList from "./DictList.vue";

const props = defineProps<{
  category: string,
  groupByTag: Record<string, DictResource[]>,
  selectId: string
}>()
const emit = defineEmits<{
  selectDict: [val: { dict: DictResource, index: number }]
  detail: [],
}>()
const allTag = '全部'
const tagList = $computed(() => [allTag, ...Object.keys(props.groupByTag).filter(tag => tag !== allTag)])
let currentTag = $ref(allTag)
let list = $computed(() => {
  if (currentTag !== allTag) return props.groupByTag[currentTag] || []
  return uniqueTaggedDicts<DictResource>(props.groupByTag)
})

watch(() => props.groupByTag, () => {
  currentTag = allTag
})

</script>

<template>
  <div>
    <div class="flex items-center">
      <div class="category shrink-0">{{ category }}：</div>
      <div class="tags">
        <div class="tag" :class="i === currentTag &&'active'"
             @click="currentTag = i"
             v-for="i in tagList" :key="i">{{ i }}
        </div>
      </div>
    </div>

    <DictList
        @selectDict="e => emit('selectDict',e)"
        :list="list"
        :select-id="selectId"/>
  </div>
</template>

<style scoped lang="scss">

.tags {
  display: flex;
  flex-wrap: wrap;
  margin: 1rem 0;

  .tag {
    color: var(--color-font-1);
    cursor: pointer;
    padding: 0.4rem 1rem;
    border-radius: 2rem;

    &.active {
      color: var(--color-font-active-1);
      background: gray;
    }
  }
}


@media (max-width: 768px) {
  .flex.items-center {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    .category {
      font-size: 1rem;
      font-weight: bold;
    }

    .tags {
      margin: 0.5rem 0;
      gap: 0.3rem;

      .tag {
        padding: 0.3rem 0.8rem;
        font-size: 0.9rem;
        min-height: 44px;
        min-width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

// 超小屏幕适配
@media (max-width: 480px) {
  .flex.items-center {
    .category {
      font-size: 0.9rem;
    }

    .tags {
      .tag {
        padding: 0.2rem 0.6rem;
        font-size: 0.8rem;
      }
    }
  }
}

</style>
