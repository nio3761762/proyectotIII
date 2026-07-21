<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="bg-gradient-to-r from-gray-700 to-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 p-8 opacity-10">
        <PackageX class="h-32 w-32" />
      </div>
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
              Inventario
            </span>
          </div>
          <h2 class="text-3xl font-black">Dar de Baja Productos</h2>
          <p class="text-gray-300 text-sm font-medium mt-1">
            Registra productos no vendidos o sobrantes que serán dados de baja del inventario
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="bg-white/10 text-white p-3 rounded-2xl hover:bg-white/20 transition-all active:scale-95 border border-white/20"
        >
          <X class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <Loader2 class="h-10 w-10 text-gray-400 animate-spin" />
    </div>

    <!-- Error -->
    <div v-if="!loading && error" class="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-red-200">
      <div class="flex flex-col items-center gap-4">
        <div class="p-4 bg-red-50 rounded-full">
          <AlertCircle class="h-10 w-10 text-red-400" />
        </div>
        <p class="text-red-500 font-bold text-lg">{{ error }}</p>
        <button @click="loadData" class="px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Table -->
    <div v-if="!loading && !error && itemsDisponibles.length > 0" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
      <div class="p-4 sm:p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-gray-100 rounded-xl">
            <Package class="h-5 w-5 text-gray-500" />
          </div>
          <h3 class="text-lg font-bold text-gray-800">
            Productos con Stock ({{ itemsDisponibles.length }})
          </h3>
        </div>
        <span class="px-4 py-1.5 bg-white rounded-xl text-[10px] font-black text-gray-500 border border-gray-100 uppercase tracking-widest">
          {{ cantidadSeleccionada }} a dar de baja
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/30">
              <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto</th>
              <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Stock Actual</th>
              <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cantidad a Dar de Baja</th>
              <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Motivo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in itemsDisponibles" :key="item.id" class="hover:bg-gray-50/30 transition-colors">
              <td class="p-4 text-sm">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                    <Package class="h-6 w-6 text-blue-400" />
                  </div>
                  <p class="font-bold text-gray-700">{{ item.nombre }}</p>
                </div>
              </td>
              <td class="p-4 text-center">
                <span class="text-sm font-black text-gray-700">
                  {{ item.stock }}
                </span>
              </td>
              <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <input
                    v-model.number="item.cantidadBaja"
                    type="number"
                    :min="0"
                    :max="item.stock"
                    class="w-24 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-700 outline-none font-black text-gray-800 text-center text-sm"
                    placeholder="0"
                  />
                  <span class="text-[10px] text-gray-400 font-bold">/ {{ item.stock }}</span>
                </div>
              </td>
              <td class="p-4">
                <input
                  v-model="item.motivo"
                  type="text"
                  class="w-full min-w-[140px] px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-700 outline-none font-bold text-gray-700 text-xs"
                  placeholder="Ej: No vendido, vencido..."
                  :disabled="!item.cantidadBaja"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm text-gray-500 font-bold">
            <ClipboardList class="h-5 w-5" />
            <span>{{ itemsParaBaja.length }} producto(s) seleccionado(s)</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-red-500 font-bold">
            <Trash2 class="h-5 w-5" />
            <span>{{ cantidadTotalBaja }} unidades en total</span>
          </div>
        </div>
        <button
          @click="showConfirmModal = true"
          :disabled="itemsParaBaja.length === 0 || submitting"
          class="w-full sm:w-auto px-8 py-4 bg-gray-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl hover:bg-gray-900 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-3"
        >
          <component :is="submitting ? Loader2 : PackageX" :class="['h-5 w-5', { 'animate-spin': submitting }]" />
          {{ submitting ? 'PROCESANDO...' : `DAR DE BAJA (${itemsParaBaja.length})` }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && itemsDisponibles.length === 0" class="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
      <div class="flex flex-col items-center gap-4">
        <div class="p-4 bg-gray-50 rounded-full">
          <PackageCheck class="h-10 w-10 text-gray-300" />
        </div>
        <p class="text-gray-500 font-medium text-lg">No hay productos con stock disponible para dar de baja.</p>
        <p class="text-gray-400 text-sm">Todos los artículos en esta sucursal ya tienen stock en cero.</p>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
        <div class="p-8">
          <div class="flex items-center gap-4 mb-8">
            <div class="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-200">
              <AlertTriangle class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-black text-gray-800">Confirmar Baja</h3>
              <p class="text-gray-400 text-sm font-bold">Se darán de baja los siguientes productos</p>
            </div>
          </div>

          <div class="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-8">
            <div v-for="item in itemsParaBaja" :key="item.id" class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <Package class="h-4 w-4 text-gray-400" />
                  <span class="font-bold text-gray-800 text-sm">{{ item.nombre }}</span>
                </div>
                <span class="text-sm font-black text-red-500">-{{ item.cantidadBaja }}</span>
              </div>
              <p class="text-[10px] text-gray-500 font-bold ml-6">
                {{ item.motivo }}
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="showConfirmModal = false" class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button
              @click="handleSubmit"
              :disabled="submitting"
              class="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-red-100 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              {{ submitting ? 'PROCESANDO...' : `CONFIRMAR BAJA` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Package, PackageX, PackageCheck, Loader2, X, AlertCircle, ClipboardList, Trash2, AlertTriangle } from 'lucide-vue-next'
import { getInventario, registrarBajaInventario } from '@/Server/Inventario'

const props = defineProps({
  IdSucursal: { type: [Number, String], required: true }
})

const emit = defineEmits(['toast', 'success', 'close'])

const loading = ref(false)
const error = ref('')
const submitting = ref(false)
const showConfirmModal = ref(false)

const itemsDisponibles = ref([])

const loadData = async () => {
  loading.value = true
  error.value = ''
  itemsDisponibles.value = []

  try {
    const res = await getInventario(props.IdSucursal, '', 10000, 1)
    const rows = res.result || []

    itemsDisponibles.value = rows
      .filter(r => Number(r.cantidad) > 0)
      .map(r => ({
        id: r.idproducto,
        nombre: r.nombre,
        tipo: 'PRODUCTO',
        stock: Number(r.cantidad),
        cantidadBaja: 0,
        motivo: ''
      }))
  } catch (err) {
    console.error('Error loading inventory:', err)
    error.value = err.response?.data?.message || err.message || 'Error al cargar inventario'
  } finally {
    loading.value = false
  }
}

const itemsParaBaja = computed(() => {
  return itemsDisponibles.value.filter(i => i.cantidadBaja > 0)
})

const cantidadSeleccionada = computed(() => {
  return itemsParaBaja.value.length
})

const cantidadTotalBaja = computed(() => {
  return itemsParaBaja.value.reduce((sum, i) => sum + i.cantidadBaja, 0)
})

const handleSubmit = async () => {
  const items = itemsParaBaja.value.map(i => ({
    IdProducto: i.id,
    Cantidad: i.cantidadBaja,
    Motivo: i.motivo || 'Sin motivo'
  }))

  if (items.length === 0) {
    emit('toast', 'Seleccione al menos un producto con cantidad mayor a 0', 'error')
    return
  }

  submitting.value = true
  try {
    await registrarBajaInventario(props.IdSucursal, items)
    emit('toast', `${items.length} producto(s) dado(s) de baja correctamente`, 'success')
    showConfirmModal.value = false
    itemsDisponibles.value.forEach(i => { i.cantidadBaja = 0; i.motivo = '' })
    emit('success')
  } catch (err) {
    emit('toast', err.response?.data?.message || err.message || 'Error al dar de baja', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}
.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
