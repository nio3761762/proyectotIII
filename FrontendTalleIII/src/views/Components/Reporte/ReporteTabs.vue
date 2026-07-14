<template>
  <div class="mb-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-2">
    <div class="flex items-center gap-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="$emit('update:activeTab', tab.id)" 
        :class="['flex-1 text-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300', activeTab === tab.id ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'hover:bg-orange-50 text-gray-600']"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

defineEmits(['update:activeTab'])

const tabs = [
  { id: 'financiero', label: 'Financiero' },
  { id: 'ventas', label: 'Detalle de Ventas' },
  { id: 'pedidos', label: 'Detalle de Pedidos' },
  { id: 'transferencias', label: 'Transferencias' },
  { id: 'compras', label: 'Compras' },
  { id: 'produccion', label: 'Producción' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'kardex', label: 'Kardex' },
  { id: 'comision', label: 'Comisiones' },
  { id: 'gastos-generales',  label: 'Gastos Generales' },
  { id: 'resumen-semanal',  label: 'Resumen Semanal' }
]
</script>
