<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mt-8">
    <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
      <!-- Search Section -->
      <div class="flex-1 max-w-md">
        <div class="relative group">
          <div class="relative">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-orange-500 transition-colors" />
            <input
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
              placeholder="Buscar por nombre..."
              class="w-full pl-12 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from 'lucide-vue-next';

defineProps({
  modelValue: String,
});
defineEmits(['update:modelValue']);
</script>