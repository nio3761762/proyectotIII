<template>
  <div class="min-h-screen">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <Transition name="page" mode="out-in">
      <div v-if="showForm" class="relative">
        <div class="flex items-center gap-3 mb-8">
          <button @click="cancelForm" class="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all">
            <ArrowLeft class="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 class="text-2xl font-bold text-gray-800">{{ editingItem ? 'Editar Gasto' : 'Nuevo Gasto General' }}</h2>
            <p class="text-sm text-gray-500">Registra un gasto administrativo u operativo</p>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 animate-fade-in">
          <form @submit.prevent="handleSubmit" class="space-y-6 max-w-xl">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Nombre del Gasto</label>
              <div class="relative">
                <FileText class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input v-model="form.nombre" type="text" required
                  class="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
                  placeholder="Ej: Suministros de oficina" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
                <div class="relative">
                  <CalendarIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input v-model="form.fecha" type="date" required
                    class="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Costo (Bs)</label>
                <div class="relative">
                  <DollarSign class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input v-model="form.costo" type="number" step="0.01" min="0" required
                    class="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
                    placeholder="0.00" />
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-gray-100">
              <button type="submit"
                class="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center gap-2">
                <Check class="h-5 w-5" />
                {{ editingItem ? 'Actualizar Gasto' : 'Registrar Gasto' }}
              </button>
              <button type="button" @click="cancelForm"
                class="px-8 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-else class="relative space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center">
              <DollarSign class="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Gastos Generales</h1>
              <p class="text-sm text-gray-500">Administración de gastos operativos y administrativos</p>
            </div>
          </div>
          <button @click="showForm = true"
            class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center gap-2 shadow-md">
            <Plus class="h-5 w-5" />
            Nuevo Gasto
          </button>
        </div>

        <!-- Search & Filters -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-5">
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div class="flex gap-3 flex-1 max-w-lg">
              <div class="relative flex-1">
                <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input v-model="search" @input="debouncedSearch" type="text" placeholder="Buscar por nombre..."
                  class="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white" />
              </div>
              <div class="relative">
                <CalendarIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input v-model="fechaFiltro" @change="onFechaChange" type="date"
                  class="pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white" />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500 uppercase block">Ver</label>
                <div class="flex rounded-xl bg-gray-100/80 p-0.5 gap-0.5 border border-gray-200/50">
                  <button v-for="op in limiteOpciones" :key="op" @click="setLimit(op)" type="button"
                    :class="['min-w-[36px] px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200',
                      limit === op ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']">
                    {{ op }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-32">
          <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-6"></div>
          <p class="text-gray-500 font-medium animate-pulse">Cargando gastos...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="gastos.length === 0" class="bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
          <div class="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search class="h-12 w-12 text-gray-300" />
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">No se encontraron gastos</h3>
          <p class="text-gray-500 mb-8">Registra un nuevo gasto general para empezar</p>
          <button @click="showForm = true"
            class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all inline-flex items-center gap-2">
            <Plus class="h-5 w-5" />
            Nuevo Gasto
          </button>
        </div>

        <!-- Table -->
        <div v-else class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <th class="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                  <th class="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                  <th class="text-right px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Costo</th>
                  <th class="text-center px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="gasto in gastos" :key="gasto.idgastogeneral"
                  class="border-b border-gray-50 hover:bg-orange-50/30 transition-all duration-200 group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-orange-200">
                        {{ (gasto.nombre || '?').charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <span class="font-bold text-gray-800">{{ gasto.nombre }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <CalendarIcon class="h-4 w-4 text-gray-400" />
                      <span class="text-gray-600 font-medium">{{ formatDate(gasto.fecha) }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="inline-block px-4 py-1.5 bg-orange-50 rounded-xl text-orange-700 font-black text-sm">
                      {{ formatCurrency(gasto.costo) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="startEdit(gasto)" class="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                        <Pencil class="h-4 w-4" />
                      </button>
                      <button @click="prepareAnular(gasto)" class="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Anular">
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Table Footer -->
          <div class="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span class="text-sm text-gray-500 font-medium">
              Mostrando {{ gastos.length }} de {{ totalItems }} gastos
            </span>
          </div>
        </div>

        <!-- Pagination -->
        <Paginado
          v-if="totalPaginas > 0"
          v-model:paginaActual="currentPage"
          :totalPaginas="totalPaginas"
          :total="totalItems"
          :limite="limit"
        />
      </div>
    </Transition>

    <!-- Anular Modal -->
    <AnularModal
      :show="showAnularModal"
      title="¿Anular este Gasto?"
      message="El gasto quedará inhabilitado. Puedes revertirlo después."
      @confirm="confirmAnular"
      @close="showAnularModal = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Search, Plus, DollarSign, Pencil, Trash2, ArrowLeft, FileText, Calendar as CalendarIcon, Check } from 'lucide-vue-next';
import { listarGastosGenerales, registrarGastoGeneral, anularGastoGeneral, updateGastoGeneral } from '@/Server/Gasto';
import { getLocalDate } from '@/utils/formatters';
import Paginado from '../Modals/Paginado.vue';
import AnularModal from '../Shared/AnularModal.vue';

const emit = defineEmits(['toast']);

const showForm = ref(false);
const editingItem = ref(null);
const loading = ref(false);
const gastos = ref([]);
const totalItems = ref(0);
const totalPaginas = ref(0);
const currentPage = ref(1);
const limit = ref(8);
const search = ref('');
const fechaFiltro = ref(getLocalDate());

const limiteOpciones = [5, 8, 12, 20];

const setLimit = (val) => {
  limit.value = val;
  currentPage.value = 1;
  fetchGastos();
};

const onFechaChange = () => {
  currentPage.value = 1;
  fetchGastos();
};

const showAnularModal = ref(false);
const selectedGastoId = ref(null);

const form = ref({
  nombre: '',
  fecha: getLocalDate(),
  costo: 0,
});

let debounceTimer = null;
const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchGastos();
  }, 400);
};

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const fetchGastos = async () => {
  loading.value = true;
  try {
    const fecha = fechaFiltro.value || null;
    const response = await listarGastosGenerales(
      search.value || null,
      fecha,
      fecha,
      currentPage.value,
      limit.value
    );
    gastos.value = response.data;
    totalItems.value = parseInt(response.total);
    totalPaginas.value = Math.ceil(totalItems.value / limit.value);
  } catch (error) {
    const msg = error?.response?.data?.message || 'Error al cargar gastos';
    emit('toast', { message: msg, type: 'error' });
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    if (editingItem.value) {
      await updateGastoGeneral(editingItem.value.idgastogeneral, form.value.nombre, form.value.fecha, form.value.costo);
      emit('toast', { message: 'Gasto actualizado correctamente', type: 'success' });
    } else {
      await registrarGastoGeneral(form.value.nombre, form.value.fecha, form.value.costo);
      emit('toast', { message: 'Gasto registrado correctamente', type: 'success' });
    }
    cancelForm();
    fetchGastos();
  } catch (error) {
    emit('toast', { message: 'Error al guardar el gasto', type: 'error' });
  }
};

const cancelForm = () => {
  showForm.value = false;
  editingItem.value = null;
  form.value = { nombre: '', fecha: getLocalDate(), costo: 0 };
};

const startEdit = (gasto) => {
  editingItem.value = gasto;
  form.value = {
    nombre: gasto.nombre,
    fecha: gasto.fecha ? gasto.fecha.split('T')[0] : getLocalDate(),
    costo: Number(gasto.costo),
  };
  showForm.value = true;
};

const prepareAnular = (gasto) => {
  selectedGastoId.value = gasto.idgastogeneral;
  showAnularModal.value = true;
};

const confirmAnular = async () => {
  try {
    const res = await anularGastoGeneral(selectedGastoId.value);
    emit('toast', { message: res.message || 'Gasto anulado correctamente', type: 'success' });
    fetchGastos();
  } catch (error) {
    emit('toast', { message: 'Error al anular el gasto', type: 'error' });
  } finally {
    showAnularModal.value = false;
  }
};

watch(currentPage, () => {
  fetchGastos();
});

onMounted(fetchGastos);
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
