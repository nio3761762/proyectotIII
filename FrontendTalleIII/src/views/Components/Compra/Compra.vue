<template>
  <div class="min-h-screen p-4 md:p-8 relative">
    <!-- Background decorations -->
    <div class="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl -z-10"></div>
    <div class="fixed bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl -z-10"></div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/50 w-fit">
      <button @click="activeTab = 'compras'"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
        :class="activeTab === 'compras' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200' : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'">
        <Truck class="h-4 w-4" />
        Compras
      </button>
      <button @click="activeTab = 'gastos'"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
        :class="activeTab === 'gastos' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200' : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'">
        <DollarSign class="h-4 w-4" />
        Gastos Generales
      </button>
    </div>

    <!-- Compras Tab -->
    <template v-if="activeTab === 'compras'">
      <!-- Header -->
      <div v-if="!showRegistration" class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8 animate-fade-in">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <Truck class="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Gestión de Compras
              </h1>
              <p class="text-gray-500 font-medium">Panel de control de adquisiciones</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="hidden lg:flex items-center space-x-6 mr-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ totalItems }}</div>
                <div class="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Compras</div>
              </div>
              <div class="w-px h-10 bg-gray-200"></div>
              <div class="p-3 bg-orange-100 rounded-2xl text-orange-600">
                <TrendingUp class="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <Transition name="page" mode="out-in">
        <div v-if="showRegistration">
          <RegistrarCompra 
            :compraToEdit="editingCompra"
            @saved="handleSaved" 
            @cancel="handleCancelRegistration" 
            @toast="showToastMessage"
          />
        </div>

        <div v-else class="space-y-6">
          <!-- Filters -->
          <FiltrosCompra @filter="handleFilter" @add="showRegistration = true" :initialLimit="limit" v-model:viewMode="viewMode" />

          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-500 font-medium animate-pulse">Obteniendo registros...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="compras.length === 0" class="bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search class="h-10 w-10" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron compras</h3>
            <p class="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>

          <!-- Cards Grid -->
          <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <CompraCard 
              v-for="compra in compras" 
              :key="compra.idcompra" 
              :compra="compra" 
              @anular="prepareAnular"
              @editar="startEdit"
            />
          </div>

          <!-- Table View -->
          <CompraTable v-else :compras="compras" @anular="prepareAnular" @editar="startEdit" />

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

      <!-- Shared Modals -->
      <AnularModal 
        :show="showAnularModal"
        title="¿Anular esta Compra?"
        message="Al anular la compra, se revertirán los movimientos de inventario asociados. Esta acción no se puede deshacer."
        @confirm="confirmAnular"
        @close="showAnularModal = false"
      />
    </template>

    <!-- Gastos Generales Tab -->
    <GastoGeneral v-if="activeTab === 'gastos'" @toast="showToastMessage" />

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed bottom-10 right-10 z-[100]">
        <div 
          class="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold animate-slide-up"
          :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
        >
          <component :is="toast.type === 'success' ? CheckCircle : AlertCircle" class="h-6 w-6" />
          {{ toast.message }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Truck, Search, TrendingUp, CheckCircle, AlertCircle, DollarSign } from 'lucide-vue-next';
import { listarCompras, anularCompra } from '@/Server/Compra';
import { getLocalDate } from '@/utils/formatters';

// ... (rest of imports)
import FiltrosCompra from './FiltrosCompra.vue';
import CompraCard from './CompraCard.vue';
import CompraTable from './CompraTable.vue';
import RegistrarCompra from './RegistrarCompra.vue';
import Paginado from '../Modals/Paginado.vue';
import AnularModal from '../Shared/AnularModal.vue';
import GastoGeneral from '../Gasto/GastoGeneral.vue';

// State
const activeTab = ref('compras');
const showRegistration = ref(false);
const editingCompra = ref(null);
const loading = ref(false);
const compras = ref([]);
const totalItems = ref(0);
const totalPaginas = ref(0);
const currentPage = ref(1);
const limit = ref(8);
const viewMode = ref('cards');

// Filters State
const today = getLocalDate();
const currentFilters = ref({
  search: '',
  fecha: today,
  estado: -1
});

// Modal State
const showAnularModal = ref(false);
const selectedCompraId = ref(null);

// Toast State
const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

// Actions
const fetchCompras = async () => {
  loading.value = true;
  try {
    const response = await listarCompras(
      currentFilters.value.search,
      currentFilters.value.fecha,
      currentFilters.value.estado,
      currentPage.value,
      limit.value
    );
    compras.value = response.data;
    totalItems.value = parseInt(response.total);
    totalPaginas.value = Math.ceil(totalItems.value / limit.value);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    showToastMessage('Error al cargar las compras', 'error');
  } finally {
    loading.value = false;
  }
};

const handleFilter = (filters) => {
  const { limit: newLimit, ...otherFilters } = filters;
  limit.value = newLimit;
  currentFilters.value = { ...otherFilters };
  currentPage.value = 1;
  fetchCompras();
};

const prepareAnular = (compra) => {
  selectedCompraId.value = compra.idcompra;
  showAnularModal.value = true;
};

const confirmAnular = async () => {
  try {
    const res = await anularCompra(selectedCompraId.value);
    showToastMessage(res.message || 'Compra anulada correctamente', 'success');
    fetchCompras();
  } catch (error) {
    showToastMessage('Error al anular la compra', 'error');
  } finally {
    showAnularModal.value = false;
  }
};

const startEdit = (compra) => {
  editingCompra.value = compra;
  showRegistration.value = true;
};

const handleCancelRegistration = () => {
  showRegistration.value = false;
  editingCompra.value = null;
};

const handleSaved = () => {
  showRegistration.value = false;
  editingCompra.value = null;
  currentPage.value = 1;
  fetchCompras();
};

const showToastMessage = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
};

// Watchers
watch(currentPage, () => {
  fetchCompras();
});

// Initial load
onMounted(fetchCompras);
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
