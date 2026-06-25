<template>
  <div class="bg-white border-b border-gray-200 p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer" @click="$emit('edit')">
    <div class="flex-1">
      <div class="text-sm font-medium text-gray-900">{{ fund.name }}</div>
      <div class="text-xs text-gray-500 mt-1">代码: {{ fund.code }}</div>
    </div>
    <div class="text-right mr-4">
      <div :class="['text-sm font-semibold', fund.changePercent >= 0 ? 'text-red-500' : 'text-green-500']">{{ fund.changePercent >= 0 ? '+' : '' }}{{ fund.changePercent.toFixed(2) }}%</div>
      <div class="text-xs text-gray-500 mt-1">净值: {{ fund.currentNav.toFixed(4) }}</div>
    </div>
    <div v-if="fund.shares" class="text-right">
      <div :class="['text-sm font-semibold', (fund.profit || 0) >= 0 ? 'text-red-500' : 'text-green-500']">{{ (fund.profit || 0) >= 0 ? '+' : '' }}{{ fund.profit?.toFixed(2) }}</div>
      <div class="text-xs text-gray-500 mt-1">持有: {{ fund.shares }}份</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FundWithProfit } from '../api'
defineProps<{ fund: FundWithProfit }>()
defineEmits<{ edit: [] }>()
</script>
