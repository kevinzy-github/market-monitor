<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4 px-4">
      <h2 class="text-lg font-bold text-gray-900">自选基金 ({{ funds.length }})</h2>
      <button @click="$emit('add')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">添加</button>
    </div>
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div v-if="funds.length === 0" class="p-8 text-center text-gray-500"><p>暂无基金，点击「添加」按钮添加自选基金</p></div>
      <template v-else><FundRow v-for="(fund, index) in funds" :key="fund.code" :fund="fund" @edit="$emit('edit', index)" /></template>
    </div>
  </div>
</template>

<script setup lang="ts">
import FundRow from './FundRow.vue'
import type { FundWithProfit } from '../api'
defineProps<{ funds: FundWithProfit[] }>()
defineEmits<{ add: []; edit: [index: number] }>()
</script>
