<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-orange-500 rounded-xl shadow-lg">
              <Banknote class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">Gestión de Gastos</h2>
              <p class="text-sm text-gray-500">{{ sucursal?.nombre }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-white rounded-full transition-colors">
            <X class="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Filtro por Periodo y Botón Agregar -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div class="flex-1 max-w-xs">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Filtrar por Periodo</label>
              <div class="relative">
                <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  v-model="periodoFiltro"
                  type="month"
                  class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  @change="cargarGastos"
                />
              </div>
            </div>

            <button 
              @click="mostrarFormulario = !mostrarFormulario"
              class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Plus class="h-4 w-4" /> Registrar Gasto
            </button>
          </div>

          <!-- Formulario para agregar gasto -->
          <Transition name="slide-down">
            <div v-if="mostrarFormulario" class="bg-white border-2 border-orange-100 rounded-2xl p-6 shadow-sm">
              <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle class="h-5 w-5 text-orange-500" /> Nuevo Gasto
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Periodo</label>
                  <input v-model="nuevoGasto.Periodo" type="month" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Tipo</label>
                  <select v-model="nuevoGasto.Tipo" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                    <option value="FIJO">FIJO</option>
                    <option value="VARIABLE">VARIABLE</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Servicio</label>
                  <select v-model="nuevoGasto.Servicio" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                    <option value="Luz">Luz</option>
                    <option value="Agua">Agua</option>
                    <option value="Gas Natural">Gas Natural</option>
                    <option value="Internet">Internet</option>
                    <option value="Alquiler">Alquiler</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Consumo</label>
                  <input v-model.number="nuevoGasto.Consumo" type="number" step="0.01" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Monto (Bs)</label>
                  <input v-model.number="nuevoGasto.Monto" type="number" step="0.01" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="0.00" />
                </div>
              </div>
              <div class="mt-4 flex justify-end gap-2">
                <button @click="mostrarFormulario = false" class="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Cancelar</button>
                <button 
                  @click="agregarGasto" 
                  :disabled="!esGastoValido || guardando"
                  class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <Save v-if="!guardando" class="h-4 w-4" />
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {{ guardando ? 'Guardando...' : 'Guardar Gasto' }}
                </button>
              </div>
            </div>
          </Transition>

          <!-- Listado -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-700">Historial de Gastos</h3>
              <span v-if="periodoFiltro" class="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Periodo: {{ periodoFiltro }}
              </span>
            </div>

            <div v-if="loading" class="flex flex-col items-center justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
              <p class="text-gray-500 font-medium">Cargando historial...</p>
            </div>

            <div v-else-if="!periodoFiltro" class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Search class="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p class="text-gray-400 font-medium">Seleccione un periodo para ver los gastos.</p>
            </div>

            <div v-else-if="gastos.length === 0" class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Banknote class="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p class="text-gray-400 font-medium">No hay gastos registrados en este periodo.</p>
            </div>

            <div v-else class="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
              <table class="w-full text-left border-collapse bg-white">
                <thead class="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Servicio</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Consumo</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="g in gastos" :key="g.igasto" class="hover:bg-orange-50/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="text-sm font-semibold text-gray-700">{{ formatearFecha(g.fecha) }}</span>
                        <span class="text-[10px] text-gray-400 uppercase font-bold">{{ g.periodo }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-medium text-gray-600">{{ g.servicio }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span :class="['px-2 py-1 rounded-lg text-[10px] font-bold uppercase', 
                        g.tipo === 'FIJO' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600']">
                        {{ g.tipo }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-sm font-medium text-gray-600">{{ g.consumo || '-' }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-sm font-bold text-gray-800">{{ g.monto }} Bs</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 font-bold border-t border-gray-100">
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-right text-gray-600 uppercase text-xs tracking-wider">Total del Periodo</td>
                    <td class="px-6 py-4 text-right text-orange-600 text-lg">{{ totalGastos.toFixed(2) }} Bs</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-100 flex justify-end bg-gray-50">
          <button 
            @click="$emit('close')"
            class="px-8 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all shadow-lg font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { X, Banknote, Calendar, Plus, Save, Search, PlusCircle } from 'lucide-vue-next';
import { ListGasto, createGasto } from '@/Server/Sucural';

const props = defineProps({
  show: Boolean,
  sucursal: Object
});

const emit = defineEmits(['close', 'updated']);

const loading = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const periodoFiltro = ref(new Date().toISOString().slice(0, 7)); // Formato YYYY-MM
const gastos = ref([]);

const nuevoGasto = ref({
  Periodo: new Date().toISOString().slice(0, 7),
  Tipo: 'FIJO',
  Servicio: 'Luz',
  Consumo: null,
  Monto: null
});

const esGastoValido = computed(() => {
  return nuevoGasto.value.Periodo && nuevoGasto.value.Tipo && nuevoGasto.value.Servicio && nuevoGasto.value.Monto > 0;
});

const totalGastos = computed(() => {
  return gastos.value.reduce((acc, g) => acc + (parseFloat(g.monto) || 0), 0);
});

const cargarGastos = async () => {
  if (!props.sucursal?.idsucursal || !periodoFiltro.value) {
    gastos.value = [];
    return;
  }
  
  loading.value = true;
  try {
    const resp = await ListGasto(props.sucursal.idsucursal, periodoFiltro.value);
    gastos.value = resp.result || [];
  } catch (err) {
    console.error('Error al cargar gastos:', err);
  } finally {
    loading.value = false;
  }
};

const agregarGasto = async () => {
  if (!esGastoValido.value) return;

  guardando.value = true;
  try {
    const payload = [{
      ...nuevoGasto.value,
      IdSucursal: props.sucursal.idsucursal
    }];
    
    await createGasto(payload);
    
    // Reset form
    nuevoGasto.value = {
      Periodo: new Date().toISOString().slice(0, 7),
      Tipo: 'FIJO',
      Servicio: 'Luz',
      Consumo: null,
      Monto: null
    };
    mostrarFormulario.value = false;
    
    // Si el periodo del nuevo gasto coincide con el filtro, recargar
    if (payload[0].Periodo === periodoFiltro.value) {
      await cargarGastos();
    } else {
      periodoFiltro.value = payload[0].Periodo;
      await cargarGastos();
    }
    
    emit('updated', 'Gasto registrado correctamente');
  } catch (err) {
    console.error('Error al registrar gasto:', err);
  } finally {
    guardando.value = false;
  }
};

const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    cargarGastos();
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease-out; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); }
</style>
