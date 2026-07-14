<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
    <!-- Loading dentro de la vista -->
    <Transition name="fade" mode="out-in">
      <div v-if="cargandoInicial" class="flex items-center justify-center py-20">
        <div class="text-center">
          <!-- Animación de carga con icono de camión -->
          <div class="relative mb-6">
            <div class="w-20 h-20 mx-auto relative">
              <!-- Círculo exterior animado -->
              <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
              <!-- Círculo giratorio -->
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
              <!-- Icono central -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg animate-bounce-slow">
                  <Truck class="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <!-- Texto de carga -->
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
            Cargando Proveedores
          </h3>
          <p class="text-gray-500 text-sm">Preparando datos...</p>
          <!-- Barra de progreso -->
          <div class="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div v-else>
        <div v-if="!modoEdicion">
          <!-- Header -->
          <div class="relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-2xl"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/20 to-orange-500/20 rounded-full blur-xl"></div>

            <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                    <Users class="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                      Gestión de Proveedores
                    </h1>
                    <p class="text-gray-600 mt-1 font-medium">Administra todos los proveedores del sistema</p>
                  </div>
                </div>

                <div class="hidden md:flex items-center space-x-6">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-800">{{ proveedoresActivos }}</div>
                    <div class="text-sm text-gray-500">Activos</div>
                  </div>
                  <div class="w-px h-12 bg-gray-200"></div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-800">{{ proveedores.length }}</div>
                    <div class="text-sm text-gray-500">Total</div>
                  </div>
                  <div class="p-2 bg-green-100 rounded-xl">
                    <TrendingUp class="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mt-6">
            <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <!-- Search Section -->
              <div class="flex-1 max-w-md">
                <div class="relative group">
                  <div class="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="relative">
                    <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-orange-500 transition-colors" />
                    <input
                      :value="filtros.nombre"
                      @input="updateFiltro('nombre', $event.target.value)"
                      placeholder="Buscar por nombre..."
                      class="w-full pl-12 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-3">
                <button
                  @click="iniciarModoEdicion()"
                  class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <Plus class="h-4 w-4" />
                  Nuevo Proveedor
                </button>
              </div>
            </div>

            <!-- Filters Row -->
            <div class="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div class="flex items-center gap-2">
                <Filter class="h-4 w-4 text-gray-500" />
                <span class="text-sm font-semibold text-gray-700">Filtros:</span>
              </div>

              <!-- Status Filter -->
              <div class="flex flex-col">
                <label class="text-sm font-semibold text-gray-700 mb-1">Estado:</label>
                <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1">
                  <button
                    v-for="status in statusOptions"
                    :key="status.value"
                    @click="updateFiltro('estado', status.value)"
                    :class="[
                      'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300',
                      filtros.estado === status.value
                        ? 'bg-white text-gray-800 shadow-md transform scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    ]"
                  >
                    <div class="flex items-center gap-2">
                      <div :class="['w-2 h-2 rounded-full', status.color]"></div>
                      {{ status.label }}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Proveedores List -->
          <div class="relative mt-8">
            <Transition name="fade">
              <div v-if="isFiltering" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
              </div>
            </Transition>

            <div v-if="proveedoresPaginados && proveedoresPaginados.length > 0">
              <!-- Desktop Grid View -->
              <div class="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div
                  v-for="proveedor in proveedoresPaginados"
                  :key="proveedor.IdProveedor + '-desktop'"
                  class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
                >
                  <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div class="relative p-6">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                          <img v-if="proveedor?.Persona?.Imagen?.Url" :src="proveedor.Persona.Imagen.Url" alt="Foto" class="w-12 h-12 object-cover" />
                          <User v-else class="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                            {{ proveedor.Persona.Nombre }} {{ proveedor.Persona.ApellidoPaterno }}
                          </h3>
                          <p class="text-gray-600 text-sm">{{ proveedor.Persona.Email.Email }}</p>
                        </div>
                      </div>
                      <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', proveedor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
                        {{ proveedor.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>

                    <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-700">Información Clave</span>
                        <button @click="toggleDetalles(proveedor.IdProveedor)" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors">
                          {{ proveedorExpandido === proveedor.IdProveedor ? 'Ocultar' : 'Ver más' }}
                          <ChevronDown v-if="proveedorExpandido !== proveedor.IdProveedor" class="h-4 w-4" />
                          <ChevronUp v-else class="h-4 w-4" />
                        </button>
                      </div>
                      <div class="space-y-2">
                        <template v-for="documento in proveedor.Persona.Documento" :key="documento.IdDocumento">
                          <div v-if="!documento.Complemento" class="flex items-center gap-2 text-sm text-gray-600">
                            <IdCard class="h-4 w-4 text-orange-500" />
                            <span>{{ documento.Documento }}</span>
                          </div>
                        </template>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                          <Phone class="h-4 w-4 text-green-500" />
                          <span>{{ proveedor.Persona.Celulares[0]?.Numero || 'N/A' }}</span>
                        </div>
                      </div>
                    </div>

                    <div v-if="proveedorExpandido === proveedor.IdProveedor" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
                      <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                        <div class="font-semibold text-gray-800 mb-2 text-sm">Datos Adicionales</div>
                        <div class="space-y-2">
                          <div class="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar class="h-3 w-3 text-blue-500" />
                            <span>Edad: {{ calcularEdad(proveedor?.Persona?.FechaDeNacimiento) }} años</span>
                          </div>
                          <div class="flex items-start gap-2 text-xs text-gray-600">
                            <MapPin class="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p class="font-medium text-gray-700">{{ proveedor.Persona?.Direccion?.Direccion || 'No especificada' }}</p>
                              <p class="text-gray-500">Barrio: {{ proveedor?.Persona?.Direccion?.Barrio?.Nombre || 'N/A' }}</p>
                              <p class="text-gray-500">Ref: {{ proveedor?.Persona?.Direccion?.Referencia || 'N/A' }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="proveedor.Persona.Celulares && proveedor.Persona.Celulares.length > 1" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                        <div class="font-semibold text-gray-800 mb-2 text-sm">Otros Números</div>
                        <div class="space-y-1">
                          <div v-for="celular in proveedor.Persona.Celulares.slice(1)" :key="celular.IdCelular" class="flex items-center gap-2 text-xs text-gray-600">
                            <Phone class="h-3 w-3 text-green-500" />
                            <span>{{ celular.Numero }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button @click="iniciarModoEdicion(proveedor)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                        <Edit class="h-4 w-4" />
                        Editar
                      </button>
                      <button @click="abrirModalConfirmacion(proveedor.IdProveedor, proveedor.Persona.Nombre, proveedor.Estado.IdEstado)" :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1', proveedor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-600']">
                        <Trash2 v-if="proveedor.Estado.IdEstado === 1" class="h-4 w-4" />
                        <Check v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile View -->
              <div class="md:hidden space-y-4">
                <div
                  v-for="proveedor in proveedoresPaginados"
                  :key="proveedor.IdProveedor + '-mobile'"
                  class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
                >
                  <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                          <img v-if="proveedor?.Persona.Imagen?.Url" :src="proveedor.Persona.Imagen.Url" alt="Foto" class="w-12 h-12 object-cover" />
                          <User v-else class="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 class="text-lg font-bold text-gray-800">{{ proveedor.Persona.Nombre }} {{ proveedor.Persona.ApellidoPaterno }}</h3>
                          <p class="text-gray-600 text-sm">{{ proveedor.Persona.Email.Email }}</p>
                        </div>
                      </div>
                      <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', proveedor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
                        {{ proveedor.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>

                    <div class="mb-4 p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-700">Información Clave</span>
                        <button @click="toggleDetalles(proveedor.IdProveedor)" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors">
                          {{ proveedorExpandido === proveedor.IdProveedor ? 'Ocultar' : 'Ver detalles' }}
                          <ChevronDown v-if="proveedorExpandido !== proveedor.IdProveedor" class="h-4 w-4" />
                          <ChevronUp v-else class="h-4 w-4" />
                        </button>
                      </div>
                      <div v-if="proveedorExpandido !== proveedor.IdProveedor" class="space-y-1 text-sm text-gray-600 animate-fade-in">
                        <template v-for="documento in proveedor.Persona.Documento" :key="documento.IdDocumento">
                          <div v-if="!documento.Complemento"><span class="font-semibold text-orange-600"></span>{{ documento.Documento }}</div>
                        </template>
                        <div><span class="font-semibold text-green-600">Teléfono:</span> {{ proveedor.Persona.Celulares[0]?.Numero || 'N/A' }}</div>
                      </div>
                    </div>

                    <div v-if="proveedorExpandido === proveedor.IdProveedor" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
                      <div class="bg-gray-50 rounded-2xl p-3">
                        <div class="text-xs font-semibold text-orange-600 mb-1">Edad</div>
                        <div class="text-gray-800 text-sm">{{ calcularEdad(proveedor?.Persona.FechaDeNacimiento) }} años</div>
                      </div>
                      <div class="bg-gray-50 rounded-2xl p-3">
                        <div class="text-xs font-semibold text-orange-600 mb-1">NIT</div>
                        <div class="text-gray-800 text-sm">{{ proveedor.Persona?.Documento[0]?.Documento || 'N/A' }}</div>
                      </div>
                      <div class="bg-gray-50 rounded-2xl p-3">
                        <div class="text-xs font-semibold text-orange-600 mb-1">Dirección</div>
                        <div class="text-gray-800 text-sm">{{ proveedor?.Persona?.Direccion?.Direccion || 'N/A' }}</div>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button @click="iniciarModoEdicion(proveedor)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                        <Edit class="h-4 w-4" />
                        Editar
                      </button>
                      <button @click="abrirModalConfirmacion(proveedor.IdProveedor, proveedor.Persona.Nombre, proveedor.Estado.IdEstado)" :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1', proveedor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-600']">
                        <Trash2 v-if="proveedor.Estado.IdEstado === 1" class="h-4 w-4" />
                        <Check v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!isFiltering && proveedoresPaginados.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center mt-8">
              <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <Users class="h-12 w-12 text-orange-500" />
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay proveedores</h3>
              <p class="text-gray-500">No se encontraron proveedores que coincidan con los filtros aplicados.</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPaginas > 0" class="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
            <div class="text-gray-600 text-sm font-medium">
              {{ paginacionInfo }}
            </div>
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-2">
              <div class="flex items-center gap-1">
                <button
                  @click="paginaActual = paginaActual - 1"
                  :disabled="paginaActual === 1"
                  class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft class="h-4 w-4" />
                </button>

                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="paginaActual = page"
                  :class="[
                    'rounded-2xl min-w-[40px] px-3 py-2 text-sm font-medium transition-colors',
                    paginaActual === page
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'hover:bg-orange-50 text-gray-600'
                  ]"
                >
                  {{ page }}
                </button>

                <button
                  @click="paginaActual = paginaActual + 1"
                  :disabled="paginaActual === totalPaginas"
                  class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
                >
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProveedorForm
          v-else
          :proveedor-editado="proveedorEditado"
          :es-nuevo-proveedor="esNuevoProveedor"
          :Tipoproveedores="Tipoproveedores"
          :barrios="barrios"
          :email="email"
          :documento="documento"
          :numero="numero"
          @guardar-proveedor="guardarProveedor"
          @cancelar="cancelarModoEdicion"
        />
      </div>
    </Transition>

    <ConfirmacionModal
      :show="modalAct"
      :title="proveedorParaAccion?.estadoActual === 1 ? '¿Desactivar Proveedor?' : '¿Activar Proveedor?'"
      :confirmText="proveedorParaAccion?.estadoActual === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="proveedorParaAccion?.estadoActual === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'"
      :iconComponent="AlertTriangle"
      iconClass="h-8 w-8 text-orange-600"
      @confirm="confirmar"
      @cancel="cerrarModalConfirmacion"
    >
      ¿Está seguro de que desea {{ proveedorParaAccion?.estadoActual === 1 ? 'desactivar' : 'activar' }} al proveedor
      <span class="font-semibold text-gray-900 bg-orange-100 px-2 py-1 rounded-lg">
        {{ proveedorParaAccion?.nombre }}
      </span>?
    </ConfirmacionModal>

    <div v-if="showSuccessToast" class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl z-50">
      <CheckCircle class="h-5 w-5 inline mr-2" />
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, shallowRef, onUnmounted } from 'vue';
import { AlertTriangle, CheckCircle, Truck, Plus, Filter, Search, Users, TrendingUp, User, ChevronDown, ChevronUp, IdCard, Phone, Calendar, MapPin, Edit, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-vue-next';

import ProveedorForm from './ProveedorForm.vue';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';

import { listarBarrios } from '@/Server/api';
import { listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';
import { SubirFoto } from '@/Server/Foto';
import { listarProveedores, DeleteProveedor, updateProveedor, RegistrarProveedor, listarTipoProveedores } from '@/Server/Proveedor';

// --- State ---
const proveedores = shallowRef([]);
const filteredProveedores = ref([]);
const isFiltering = ref(false);
let worker = null;
const cargandoInicial = ref(true);

const Tipoproveedores = ref([]);
const barrios = ref([]);
const email = ref([]);
const documento = ref([]);
const numero = ref([]);

const modoEdicion = ref(false);
const esNuevoProveedor = ref(true);
const proveedorEditado = ref(null);

const modalAct = ref(false);
const proveedorParaAccion = ref(null);

const showSuccessToast = ref(false);
const successMessage = ref('');

const filtros = ref({ nombre: "", estado: "Todos" });
const proveedorExpandido = ref(null);

const statusOptions = [
  { value: "Todos", label: "Todos", color: "bg-gray-500" },
  { value: "Activo", label: "Activo", color: "bg-green-500" },
  { value: "Inactivo", label: "Inactivo", color: "bg-red-500" }
];

const paginaActual = ref(1);
const itemsPerPage = 6;

// --- Computed properties ---
const proveedoresActivos = computed(() => proveedores.value.filter(u => u.Estado.IdEstado === 1).length);

const totalPaginas = computed(() => Math.ceil(filteredProveedores.value.length / itemsPerPage));

const proveedoresPaginados = computed(() => {
  const start = (paginaActual.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProveedores.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = filteredProveedores.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} proveedores`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

// --- Methods ---
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 'N/A';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

const updateFiltro = (key, value) => {
  filtros.value[key] = value;
};

const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => { showSuccessToast.value = false; }, 3000);
};

const refreshProveedores = async () => {
  try {
    proveedores.value = await listarProveedores();
  } catch (error) {
    console.error('Error al recargar proveedores:', error);
  }
};

const fetchInitialFormData = async () => {
  try {
    [Tipoproveedores.value, barrios.value, documento.value, email.value, numero.value] = await Promise.all([
      listarTipoProveedores(),
      listarBarrios(),
      listarDocumento(),
      listarEmail(),
      listarNumero(),
    ]);
  } catch (error) {
    console.error('Error al cargar datos de formulario:', error);
  }
};

const resetProveedorEditado = () => ({
  IdProveedor: null,
  RazonSocial: '',
  Tipoproveedor: { IdTipoProveedor: null },
  Estado: { IdEstado: 1 },
  Persona: {
    IdPersona: null, Nombre: "", ApellidoPaterno: "", ApellidoMaterno: "",
    FechaDeNacimiento: "", Genero: { IdGenero: 1 },
    Celulares: [{ IdCelular: null, Numero: "" }],
    Direccion: { IdDireccion: '', Direccion: '', Referencia: '', Barrio: { IdBarrio: '', Nombre: '' } },
    Email: { IdEmail: null, Email: "" },
    Imagen: { IdImagen: null, Url: '' },
    Documento: [{ IdDocumento: null, Documento: '', Complemento: null, Tipodocumento: { IdTipoDocumento: 1 } }]
  }
});

const iniciarModoEdicion = (proveedor = null) => {
  if (proveedor) {
    esNuevoProveedor.value = false;
    proveedorEditado.value = JSON.parse(JSON.stringify(proveedor));
  } else {
    esNuevoProveedor.value = true;
    proveedorEditado.value = resetProveedorEditado();
  }
  modoEdicion.value = true;
};

const cancelarModoEdicion = () => {
  modoEdicion.value = false;
  proveedorEditado.value = null;
};

const guardarProveedor = async ({ proveedor, archivo }) => {

  try {
    let imageUrl = proveedor.Persona.Imagen?.Url;
    if (archivo) {
      imageUrl = await SubirFoto(archivo);
    }

    const payload = {
      ...proveedor,
      IdPersona: proveedor.Persona.IdPersona,
      Nombre: proveedor.Persona.Nombre,
      ApellidoPaterno: proveedor.Persona.ApellidoPaterno,
      ApellidoMaterno: proveedor.Persona.ApellidoMaterno,
      FechaDeNacimiento: proveedor.Persona.FechaDeNacimiento,
      IdGenero: proveedor.Persona.Genero.IdGenero,
      Email: proveedor.Persona.Email.Email,
      IdEmail: proveedor.Persona.Email?.IdEmail,
      Url: imageUrl,
      IdDireccion: proveedor.Persona.Direccion?.IdDireccion,
      IdBarrio: proveedor.Persona.Direccion.Barrio.IdBarrio,
      Direccion: proveedor.Persona.Direccion.Direccion,
      Referencia: proveedor.Persona.Direccion.Referencia,
      Celulares: proveedor.Persona.Celulares,
      Documento: proveedor.Persona.Documento?.map(sub => ({
        IdDocumento: sub.IdDocumento,
        Documento: sub.Documento,
        IdTipodocumento: sub.Tipodocumento.IdTipoDocumento,
        Complemento: sub.Complemento?.IdComplemento
      })),
    };
 cancelarModoEdicion();
    const response = esNuevoProveedor.value
      ? await RegistrarProveedor(payload)
      : await updateProveedor(payload);
    await refreshProveedores();
    mostrarNotificacion(response.message);

  } catch (error) {
    console.error('Error al guardar el proveedor:', error);
    mostrarNotificacion('Error al guardar el proveedor.', 'error');
  }
};

const toggleDetalles = (proveedorId) => {
  proveedorExpandido.value = proveedorExpandido.value === proveedorId ? null : proveedorId;
};

const abrirModalConfirmacion = (id, nombre, estadoActual) => {
  proveedorParaAccion.value = { id, nombre, estadoActual };
  modalAct.value = true;
};

const cerrarModalConfirmacion = () => {
  modalAct.value = false;
  proveedorParaAccion.value = null;
};

const confirmar = async () => {
  if (proveedorParaAccion.value) {
    const id = proveedorParaAccion.value.id;
    cerrarModalConfirmacion();
    try {
      const response = await DeleteProveedor(id);
      await refreshProveedores();
      mostrarNotificacion(response.message);
    } catch (error) {
      console.error('Error al cambiar estado del proveedor:', error);
      mostrarNotificacion('Error al cambiar el estado del proveedor.', 'error');
    }
  }
};

const triggerWorker = (data, filters) => {
  if (worker) {
    isFiltering.value = true;
    const clonedData = JSON.parse(JSON.stringify(data));
    const clonedFilters = JSON.parse(JSON.stringify(filters));
    worker.postMessage({ proveedores: clonedData, filtros: clonedFilters });
  }
};

watch(filtros, (newFiltros) => {
  paginaActual.value = 1;
  triggerWorker(proveedores.value, newFiltros);
}, { deep: true });

watch(proveedores, (newProveedores) => {
  triggerWorker(newProveedores, filtros.value);
});


onMounted(async () => {
  worker = new Worker(new URL('@/workers/proveedorFilter.js', import.meta.url), { type: 'module' });

  worker.onmessage = (event) => {
    filteredProveedores.value = event.data;
    isFiltering.value = false;
  };

  worker.onerror = (error) => {
    console.error("Error en el Worker:", error);
    isFiltering.value = false;
  };

  await Promise.all([
    refreshProveedores(),
    fetchInitialFormData()
  ]);

  setTimeout(() => {
    cargandoInicial.value = false;
  }, 200);
});

onUnmounted(() => {
  if (worker) worker.terminate();
});

</script>

<style scoped>
/* Animación de carga */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animación bounce lenta para el icono */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 1.5s ease-in-out infinite;
}

/* Barra de progreso animada */
@keyframes loading-bar {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 60%;
    margin-left: 20%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}

.animate-loading-bar {
  animation: loading-bar 0.5s ease-in-out infinite;
}

/* Toast animations */
.fixed {
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
