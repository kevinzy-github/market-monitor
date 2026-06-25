<template>
  <div class="grid grid-cols-2 gap-3 mb-6">
    <div v-for="idx in indices" :key="idx.code" class="bg-white rounded-lg p-4 shadow-sm">
      <div class="text-xs text-gray-600 mb-2">{{ idx.name }}</div>
      <div class="text-lg font-bold text-gray-900">{{ (idx.price || 0).toFixed(2) }}</div>
      <div class="flex justify-between items-end mt-2">
        <div :class="['text-sm font-semibold', (idx.change || 0) >= 0 ? 'text-red-500' : 'text-green-500']">{{ (idx.change || 0) >= 0 ? '+' : '' }}{{ (idx.change || 0).toFixed(2) }}</div>
        <div :class="['text-xs', (idx.changePercent || 0) >= 0 ? 'text-red-500' : 'text-green-500']">{{ (idx.changePercent || 0) >= 0 ? '+' : '' }}{{ (idx.changePercent || 0).toFixed(2) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IndexData } from '../api'
defineProps<{ indices: IndexData[] }>()
</script>
