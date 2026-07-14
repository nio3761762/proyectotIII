<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 space-y-5">
    <div class="flex flex-wrap gap-3 items-end">
      <!-- Búsqueda -->
      <div class="flex-1 min-w-[180px]">
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Buscar</label>
        <div class="relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-hover:text-orange-500 transition-colors pointer-events-none" />
          <input
            :value="search"
            @input="$emit('update:search', $event.target.value)"
            placeholder="Nombre del rol..."
            class="w-full pl-9 pr-4 py-2.5 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-gray-700 placeholder:text-gray-400 outline-none text-sm"
          />
        </div>
      </div>

      <div class="hidden sm:block w-px h-9 bg-gray-200 self-end mb-0.5"></div>

      <!-- Estado -->
      <div>
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Estado</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1">
          <button
            v-for="op in estadoOpciones" :key="op.value"
            @click="$emit('update:estado', op.value)"
            :class="['px-3 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-1.5',
              estado === op.value ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >
            <div :class="['w-1.5 h-1.5 rounded-full', op.color]"></div>
            {{ op.label }}
          </button>
        </div>
      </div>

      <div class="hidden sm:block w-px h-9 bg-gray-200 self-end mb-0.5"></div>

      <!-- Por página -->
      <div>
        <label class="text-xs font-semibold text-gray-500 mb-1 block">Por página</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1">
          <button
            v-for="op in limiteOpciones" :key="op"
            @click="$emit('update:limite', op)"
            :class="['min-w-[36px] px-2.5 py-1.5 text-sm font-medium rounded-xl transition-all duration-200',
              limite === op ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >
            {{ op }}
          </button>
        </div>
      </div>

      <!-- Slot acciones -->
      <div class="ml-auto self-end">
        <slot name="acciones" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from 'lucide-vue-next';

defineProps({
  search: { type: String, default: '' },
  estado: { type: String, default: '-1' },
  limite: { type: Number, default: 8 },
});

const emit = defineEmits(['update:search', 'update:estado', 'update:limite']);

const estadoOpciones = [
  { value: '-1', label: 'Todos', color: 'bg-gray-400' },
  { value: '1', label: 'Activos', color: 'bg-green-500' },
  { value: '0', label: 'Inactivos', color: 'bg-red-400' },
];

const limiteOpciones = [5, 8, 12, 20];
</script>
