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
      <button @click="activeTab = 'gastosSucursal'"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
        :class="activeTab === 'gastosSucursal' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200' : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'">
        <Banknote class="h-4 w-4" />
        Gastos Sucursal
      </button>
    </div>

    <!-- Header -->
    <div class="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8 animate-fade-in">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
            <Truck class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Gestión de Gastos
            </h1>
            <p class="text-gray-500 font-medium">Panel de control de adquisiciones y gastos</p>
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

          <!-- Unified Nuevo Registro Button with Dropdown -->
          <div ref="dropdownContainer" class="relative">
            <button @click="showNewDropdown = !showNewDropdown"
              class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center gap-2 shadow-md">
              <Plus class="h-5 w-5" />
              Nuevo Registro
              <ChevronDown class="h-4 w-4 transition-transform" :class="showNewDropdown ? 'rotate-180' : ''" />
            </button>

            <Transition name="dropdown">
              <div v-if="showNewDropdown"
                class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
                <button @click="selectNewType('compra')"
                  class="w-full flex items-center gap-3 px-5 py-4 hover:bg-orange-50 transition-colors text-left border-b border-gray-50">
                  <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Truck class="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">Compra</p>
                    <p class="text-xs text-gray-500">Adquisición de insumos</p>
                  </div>
                </button>
                <button @click="selectNewType('gastoGeneral')"
                  class="w-full flex items-center gap-3 px-5 py-4 hover:bg-orange-50 transition-colors text-left border-b border-gray-50">
                  <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign class="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">Gasto General</p>
                    <p class="text-xs text-gray-500">Gastos administrativos u operativos</p>
                  </div>
                </button>
                <button @click="selectNewType('gastoSucursal')"
                  class="w-full flex items-center gap-3 px-5 py-4 hover:bg-orange-50 transition-colors text-left">
                  <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Banknote class="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">Gasto de Sucursal</p>
                    <p class="text-xs text-gray-500">Servicios y gastos por sucursal</p>
                  </div>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Compras Tab -->
    <template v-if="activeTab === 'compras'">
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
          <FiltrosCompra @filter="handleFilter" :initialLimit="limit" v-model:viewMode="viewMode" />

          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-500 font-medium animate-pulse">Obteniendo registros...</p>
          </div>

          <div v-else-if="compras.length === 0" class="bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search class="h-10 w-10" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron compras</h3>
            <p class="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>

          <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <CompraCard
              v-for="compra in compras"
              :key="compra.idcompra"
              :compra="compra"
              @anular="prepareAnular"
              @editar="startEdit"
            />
          </div>

          <CompraTable v-else :compras="compras" @anular="prepareAnular" @editar="startEdit" />

          <Paginado
            v-if="totalPaginas > 0"
            v-model:paginaActual="currentPage"
            :totalPaginas="totalPaginas"
            :total="totalItems"
            :limite="limit"
          />
        </div>
      </Transition>

      <AnularModal
        :show="showAnularModal"
        title="¿Anular esta Compra?"
        message="Al anular la compra, se revertirán los movimientos de inventario asociados. Esta acción no se puede deshacer."
        @confirm="confirmAnular"
        @close="showAnularModal = false"
      />
    </template>

    <!-- Gastos Generales Tab -->
    <GastoGeneral v-if="activeTab === 'gastos'" ref="gastoGeneralRef" @toast="showToastMessage" />

    <!-- Gastos Sucursal Tab -->
    <template v-if="activeTab === 'gastosSucursal'">
      <Transition name="page" mode="out-in">
        <div class="space-y-6">
          <!-- Sucursal Selector + Periodo -->
          <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div class="flex flex-col md:flex-row gap-4 items-end justify-between">
              <div class="flex gap-4 flex-1">
                <div class="flex-1 max-w-xs">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Sucursal</label>
                  <div class="relative">
                    <Building class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select v-model="sucursalSeleccionada" @change="cargarGastosSucursal"
                      class="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold appearance-none">
                      <option value="" disabled>Seleccione Sucursal</option>
                      <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">
                        {{ s.nombre }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="max-w-[180px]">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Periodo</label>
                  <div class="relative">
                    <CalendarIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input v-model="periodoFiltro" type="month" @change="cargarGastosSucursal"
                      class="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                  </div>
                </div>
              </div>
              <p v-if="sucursalNombre" class="text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl">
                Total: {{ totalGastosSucursal.toFixed(2) }} Bs
              </p>
            </div>
          </div>

          <!-- Formulario Nuevo Gasto Sucursal -->
          <Transition name="slide-down">
            <div v-if="showSucursalForm" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-orange-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <PlusCircle class="h-5 w-5 text-orange-500" /> Nuevo Gasto de Sucursal
                </h3>
                <button @click="cancelSucursalForm" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X class="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form @submit.prevent="agregarGastoSucursal" class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Periodo</label>
                  <input v-model="nuevoGastoSucursal.Periodo" type="month"
                    class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Tipo</label>
                  <select v-model="nuevoGastoSucursal.Tipo"
                    class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                    <option value="FIJO">FIJO</option>
                    <option value="VARIABLE">VARIABLE</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Servicio</label>
                  <select v-model="nuevoGastoSucursal.Servicio"
                    class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm">
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
                  <input v-model.number="nuevoGastoSucursal.Consumo" type="number" step="0.01"
                    class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Monto (Bs)</label>
                  <input v-model.number="nuevoGastoSucursal.Monto" type="number" step="0.01"
                    class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="0.00" />
                </div>
                <div class="md:col-span-5 flex justify-end gap-3 mt-2">
                  <button type="button" @click="cancelSucursalForm"
                    class="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" :disabled="!esGastoSucursalValido || guardandoSucursal"
                    class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                    <Save v-if="!guardandoSucursal" class="h-4 w-4" />
                    <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {{ guardandoSucursal ? 'Guardando...' : 'Agregar a lista' }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>

          <!-- Pending List Gastos Sucursal -->
          <Transition name="slide-down">
            <div v-if="registeredGastosSucursal.length > 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-orange-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardList class="h-5 w-5 text-orange-500" /> Gastos Sucursal Pendientes ({{ registeredGastosSucursal.length }})
                </h3>
                <button @click="finalizeAllGastosSucursal" :disabled="guardandoSucursal"
                  class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                  <CheckCircle v-if="!guardandoSucursal" class="h-4 w-4" />
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {{ guardandoSucursal ? 'Guardando...' : 'Finalizar Todos' }}
                </button>
              </div>
              <div class="overflow-x-auto rounded-2xl border border-gray-100">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gradient-to-r from-orange-50 to-red-50">
                      <th class="text-left p-3 font-black text-gray-700 text-xs uppercase tracking-widest">#</th>
                      <th class="text-left p-3 font-black text-gray-700 text-xs uppercase tracking-widest">Servicio</th>
                      <th class="text-left p-3 font-black text-gray-700 text-xs uppercase tracking-widest">Tipo</th>
                      <th class="text-left p-3 font-black text-gray-700 text-xs uppercase tracking-widest">Periodo</th>
                      <th class="text-right p-3 font-black text-gray-700 text-xs uppercase tracking-widest">Consumo</th>
                      <th class="text-right p-3 font-black text-gray-700 text-xs uppercase tracking-widest">Monto</th>
                      <th class="text-center p-3 font-black text-gray-700 text-xs uppercase tracking-widest">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in registeredGastosSucursal" :key="idx" class="border-t border-gray-50 hover:bg-gray-50/50">
                      <td class="p-3 font-bold text-gray-400">{{ idx + 1 }}</td>
                      <td class="p-3 font-semibold text-gray-800">{{ item.Servicio }}</td>
                      <td class="p-3"><span :class="['px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase', item.Tipo === 'FIJO' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600']">{{ item.Tipo }}</span></td>
                      <td class="p-3 text-gray-600">{{ item.Periodo }}</td>
                      <td class="p-3 text-right text-gray-600">{{ item.Consumo || '-' }}</td>
                      <td class="p-3 font-black text-orange-600 text-right">{{ Number(item.Monto).toFixed(2) }} Bs.</td>
                      <td class="p-3 text-center">
                        <button @click="removeRegisteredGastoSucursal(idx)" class="text-red-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition-all">
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Transition>

          <!-- Listado Gastos Sucursal -->
          <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div v-if="!sucursalSeleccionada" class="p-16 text-center">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Building class="h-10 w-10" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Seleccione una sucursal</h3>
              <p class="text-gray-500">Elija una sucursal para ver sus gastos</p>
            </div>

            <div v-else-if="loadingSucursal" class="flex flex-col items-center justify-center py-16">
              <div class="w-14 h-14 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
              <p class="text-gray-500 font-medium animate-pulse">Cargando gastos...</p>
            </div>

            <div v-else-if="gastosSucursal.length === 0" class="p-16 text-center">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Banknote class="h-10 w-10" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">No hay gastos registrados</h3>
              <p class="text-gray-500">No se encontraron gastos para esta sucursal en el periodo seleccionado</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Servicio</th>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Consumo</th>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="g in gastosSucursal" :key="g.igasto" class="hover:bg-orange-50/30 transition-colors">
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
                      <span class="text-sm font-bold text-gray-800">{{ Number(g.monto).toFixed(2) }} Bs</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 font-bold border-t border-gray-100">
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-right text-gray-600 uppercase text-xs tracking-wider">Total del Periodo</td>
                    <td class="px-6 py-4 text-right text-orange-600 text-lg">{{ totalGastosSucursal.toFixed(2) }} Bs</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </Transition>
    </template>

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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Truck, Search, TrendingUp, CheckCircle, AlertCircle, DollarSign, Plus, ChevronDown, Banknote, Building, Calendar as CalendarIcon, PlusCircle, Save, X, ClipboardList, Trash2 } from 'lucide-vue-next';
import { listarCompras, anularCompra } from '@/Server/Compra';
import { getLocalDate } from '@/utils/formatters';
import { Listsucursal, ListGasto, createGasto } from '@/Server/Sucural';

import FiltrosCompra from './FiltrosCompra.vue';
import CompraCard from './CompraCard.vue';
import CompraTable from './CompraTable.vue';
import RegistrarCompra from './RegistrarCompra.vue';
import Paginado from '../Modals/Paginado.vue';
import AnularModal from '../Shared/AnularModal.vue';
import GastoGeneral from '../Gasto/GastoGeneral.vue';

// State
const activeTab = ref(localStorage.getItem('compraActiveTab') || 'compras');
const showRegistration = ref(false);
const editingCompra = ref(null);
const loading = ref(false);
const compras = ref([]);
const totalItems = ref(0);
const totalPaginas = ref(0);
const currentPage = ref(1);
const limit = ref(8);
const viewMode = ref('cards');

// Dropdown
const showNewDropdown = ref(false);

// Gasto General ref
const gastoGeneralRef = ref(null);

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

// Gastos Sucursal State
const sucursales = ref([]);
const sucursalSeleccionada = ref('');
const periodoFiltro = ref(new Date().toISOString().slice(0, 7));
const gastosSucursal = ref([]);
const loadingSucursal = ref(false);
const showSucursalForm = ref(false);
const guardandoSucursal = ref(false);
const registeredGastosSucursal = ref([]);

const nuevoGastoSucursal = ref({
  Periodo: new Date().toISOString().slice(0, 7),
  Tipo: 'FIJO',
  Servicio: 'Luz',
  Consumo: null,
  Monto: null
});

const esGastoSucursalValido = computed(() => {
  return nuevoGastoSucursal.value.Periodo &&
    nuevoGastoSucursal.value.Tipo &&
    nuevoGastoSucursal.value.Servicio &&
    nuevoGastoSucursal.value.Monto > 0;
});

const totalGastosSucursal = computed(() => {
  return gastosSucursal.value.reduce((acc, g) => acc + (parseFloat(g.monto) || 0), 0);
});

const sucursalNombre = computed(() => {
  const s = sucursales.value.find(s => s.idsucursal === sucursalSeleccionada.value);
  return s?.nombre || '';
});

// Actions
const selectNewType = (type) => {
  showNewDropdown.value = false;
  switch (type) {
    case 'compra':
      activeTab.value = 'compras';
      showRegistration.value = true;
      editingCompra.value = null;
      break;
    case 'gastoGeneral':
      activeTab.value = 'gastos';
      nextTick(() => {
        gastoGeneralRef.value?.openForm();
      });
      break;
    case 'gastoSucursal':
      activeTab.value = 'gastosSucursal';
      showSucursalForm.value = true;
      if (!sucursalSeleccionada.value && sucursales.value.length > 0) {
        sucursalSeleccionada.value = sucursales.value[0].idsucursal;
        cargarGastosSucursal();
      }
      break;
  }
};

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

const showToastMessage = (msg, type = 'success') => {
  const message = typeof msg === 'object' ? msg.message : msg;
  const toastType = typeof msg === 'object' ? (msg.type || type) : type;
  toast.value = { show: true, message, type: toastType };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
};

// Gastos Sucursal Actions
const cargarGastosSucursal = async () => {
  if (!sucursalSeleccionada.value || !periodoFiltro.value) {
    gastosSucursal.value = [];
    return;
  }

  loadingSucursal.value = true;
  try {
    const resp = await ListGasto(sucursalSeleccionada.value, periodoFiltro.value);
    gastosSucursal.value = resp.result || [];
  } catch (err) {
    console.error('Error al cargar gastos de sucursal:', err);
    showToastMessage('Error al cargar gastos de sucursal', 'error');
  } finally {
    loadingSucursal.value = false;
  }
};

const agregarGastoSucursal = () => {
  if (!esGastoSucursalValido.value) return;

  registeredGastosSucursal.value.push({
    ...nuevoGastoSucursal.value,
    IdSucursal: sucursalSeleccionada.value
  });

  showToastMessage('Gasto agregado a la lista', 'success');

  nuevoGastoSucursal.value = {
    Periodo: new Date().toISOString().slice(0, 7),
    Tipo: 'FIJO',
    Servicio: 'Luz',
    Consumo: null,
    Monto: null
  };
};

const removeRegisteredGastoSucursal = (index) => {
  registeredGastosSucursal.value.splice(index, 1);
};

const finalizeAllGastosSucursal = async () => {
  if (registeredGastosSucursal.value.length === 0) return;

  guardandoSucursal.value = true;
  try {
    const payload = registeredGastosSucursal.value.map(item => ({
      ...item,
      IdSucursal: sucursalSeleccionada.value
    }));

    await createGasto(payload);

    const periodo = payload[0].Periodo;
    if (periodo === periodoFiltro.value) {
      await cargarGastosSucursal();
    } else {
      periodoFiltro.value = periodo;
      await cargarGastosSucursal();
    }

    registeredGastosSucursal.value = [];
    showSucursalForm.value = false;
    showToastMessage(`${payload.length} gasto(s) de sucursal registrado(s) correctamente`, 'success');
  } catch (err) {
    console.error('Error al registrar gastos de sucursal:', err);
    showToastMessage('Error al registrar los gastos', 'error');
  } finally {
    guardandoSucursal.value = false;
  }
};

const cancelSucursalForm = () => {
  showSucursalForm.value = false;
  nuevoGastoSucursal.value = {
    Periodo: new Date().toISOString().slice(0, 7),
    Tipo: 'FIJO',
    Servicio: 'Luz',
    Consumo: null,
    Monto: null
  };
};

const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Watchers
watch(currentPage, () => {
  fetchCompras();
});

watch(activeTab, (tab) => {
  localStorage.setItem('compraActiveTab', tab);
});

const dropdownContainer = ref(null);

const handleClickOutside = (e) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(e.target)) {
    showNewDropdown.value = false;
  }
};

watch(showNewDropdown, (val) => {
  if (val) {
    nextTick(() => {
      document.addEventListener('click', handleClickOutside);
    });
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Initial load
onMounted(async () => {
  fetchCompras();
  try {
    const s = await Listsucursal();
    sucursales.value = s;
  } catch (err) {
    console.error('Error loading sucursales:', err);
  }
});
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

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
