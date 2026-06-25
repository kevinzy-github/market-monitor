<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
    <div class="bg-white w-full rounded-t-lg p-6 max-h-96 overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">{{ isNew ? '添加基金' : '编辑基金' }}</h3>
        <button @click="close" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">基金代码</label><input v-model="form.code" :disabled="!isNew" type="text" placeholder="如 000216" class="w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">基金名称</label><input v-model="form.name" type="text" placeholder="基金名称" class="w-full px-3 py-2 border border-gray-300 rounded" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">买入净值</label><input v-model.number="form.buyNav" type="number" step="0.0001" placeholder="0.0000" class="w-full px-3 py-2 border border-gray-300 rounded" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">持有份额</label><input v-model.number="form.shares" type="number" step="0.01" placeholder="0.00" class="w-full px-3 py-2 border border-gray-300 rounded" /></div>
        <div class="flex gap-3 pt-4">
          <button @click="save" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-medium">保存</button>
          <button v-if="!isNew" @click="remove" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded font-medium">删除</button>
          <button @click="close" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded font-medium">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PortfolioItem } from '../api'

const props = withDefaults(defineProps<{ isOpen: boolean; item?: PortfolioItem }>(), { item: () => ({ code: '', name: '', buyNav: 0, shares: 0 }) })
const emit = defineEmits<{ close: []; save: [item: PortfolioItem]; remove: [] }>()
const form = ref<PortfolioItem>({ code: '', name: '', buyNav: 0, shares: 0 })
const isNew = ref(true)

watch(() => props.isOpen, (open) => {
  if (open) { form.value = props.item ? { ...props.item } : { code: '', name: '', buyNav: 0, shares: 0 }; isNew.value = !props.item }
})

const close = () => emit('close')
const save = () => { if (!form.value.code || !form.value.name) { alert('请输入基金代码和名称'); return }; emit('save', { ...form.value }); close() }
const remove = () => { if (confirm('确定删除该基金吗？')) { emit('remove'); close() } }
</script>
