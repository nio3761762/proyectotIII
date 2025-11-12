
<template>
  <div class="min-h-screen space-y-8">
    <!-- VISTA PRINCIPAL: LISTA DE SUCURSALES -->
    <div v-if="!modoEdicion">
      <SucursalHeader
        :sucursalesActivas="sucursalesActivas"
        :totalSucursales="sucursales.length"
      />
      <SucursalFilters
        v-model="filtros"
        :statusOptions="statusOptions"
        @nueva-sucursal="iniciarModoEdicion()"
      />
      <SucursalList
        :sucursales="sucursalesPaginadas"
        :sucursalExpandida="sucursalExpandida"
        @toggle-detalles="toggleDetalles"
        @editar="iniciarModoEdicion"
        @asignar-usuarios="abrirModalAsignacion"
        @cambiar-estado="abrirModalConfirmacion"
      />
      <SucursalPagination
        v-if="totalPaginas > 0"
        :totalPaginas="totalPaginas"
        v-model:paginaActual="paginaActual"
        :paginacionInfo="paginacionInfo"
        :visiblePages="visiblePages"
      />
    </div>

    <!-- VISTA DE EDICIÓN/REGISTRO -->
    <SucursalForm
      v-else
      ref="sucursalForm"
      :sucursalEditada="sucursalEditada"
      :esNuevaSucursal="esNuevaSucursal"
      :errors="errors"
      :departamentos="departamentos"
      :ciudades="ciudades"
      :distritos="distritos"
      :barrios="barrios"
      v-model:selectedDepartamento="selectedDepartamento"
      v-model:selectedCiudad="selectedCiudad"
      v-model:selectedDistrito="selectedDistrito"
      v-model:selectedBarrio="selectedBarrio"
      @update:sucursalEditada="sucursalEditada = $event"
      @update:errors="errors = $event"
      @cancelar="cancelarModoEdicion"
      @guardar="guardarSucursal"
    />

    <!-- MODAL DE CONFIRMACIÓN -->
    <ConfirmacionModal
      :show="modalConfirmacion"
      :title="sucursalParaAccion?.Estado.IdEstado === 1 ? '¿Desactivar Sucursal?' : '¿Activar Sucursal?'"
      :confirmText="sucursalParaAccion?.Estado.IdEstado === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="sucursalParaAccion?.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-8 w-8 text-orange-600"
      @confirm="confirmarAccion"
      @cancel="cerrarModalConfirmacion"
    >
      ¿Está seguro de que desea {{ sucursalParaAccion?.Estado.IdEstado === 1 ? 'desactivar' : 'activar' }} la sucursal
      <span class="font-semibold text-gray-900 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-lg">{{ sucursalParaAccion?.Nombre }}</span>?
    </ConfirmacionModal>

    <!-- MODAL ASIGNAR USUARIOS -->
    <AsignarUsuarioModal
      :show="modalAsignarUsuarios"
      :sucursal="sucursalParaAccion"
      :usuariosDisponibles="usuariosDisponibles"
      :usuariosAsignados="usuariosAsignados"
      @close="cerrarModalAsignacion"
      @toggle-asignacion="toggleAsignacionUsuario"
      @guardar="guardarAsignacion"
    />

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="fixed top-6 right-6 bg-green-500 text-white py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in">
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slide-in 0.3s ease-out; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #fdba74, #f97316); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #f97316, #ea580c); }
</style>

<script setup>
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue';
import {
  AlertTriangle, CheckCircle
} from 'lucide-vue-next';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';
import SucursalHeader from './SucursalHeader.vue';
import SucursalFilters from './SucursalFilters.vue';
import SucursalList from './SucursalList.vue';
import SucursalPagination from './SucursalPagination.vue';
import SucursalForm from './SucursalForm.vue';
import AsignarUsuarioModal from './AsignarUsuarioModal.vue';
import { getDepartamento, getCiudad, getDistrito, getBarrio } from '@/Server/Direccion';
import { listarSucursales, addSucursal, UpdateSucursal, DelSucursal } from '@/Server/api';
import { listarUsuarios, usuariosSinSucursal, listarUsuarioAsignado, asignarUsuarioASucursal } from '@/Server/Usuario';

// --- State  ---
const sucursales = ref([]);
const usuariosDisponibles = ref([]);
const usuariosAsignadosOriginal = ref([]);

const modoEdicion = ref(false);
const esNuevaSucursal = ref(true);
const modalConfirmacion = ref(false);
const modalAsignarUsuarios = ref(false);
const showSuccessToast = ref(false);
const successMessage = ref('');
const sucursalExpandida = ref(null);
const isPreloading = ref(false);

const filtros = ref({ nombre: "", estado: "Todos" });
const statusOptions = [
  { value: "Todos", label: "Todas", color: "bg-gray-500" },
  { value: "Activo", label: "Activas", color: "bg-green-500" },
  { value: "Inactivo", label: "Inactivas", color: "bg-red-500" }
];

const paginaActual = ref(1);
const itemsPerPage = 6;

const sucursalEditada = ref(null);
const sucursalParaAccion = ref(null);
const mensajeModal = ref("");
const usuariosAsignados = ref([]);

// --- State for address ---
const departamentos = ref([]);
const ciudades = ref([]);
const distritos = ref([]);
const barrios = ref([]);

const selectedDepartamento = ref(null);
const selectedCiudad = ref(null);
const selectedDistrito = ref(null);
const selectedBarrio = ref(null);

const errors = reactive({
    nombre: '',
    nro: '',
    celular: '',
    horaEntrada: '',
    horaSalida: '',
    departamento: '',
    ciudad: '',
    distrito: '',
    barrio: '',
    direccion: ''
});

const sucursalForm = ref(null);

// --- Computed Properties ---
const sucursalesActivas = computed(() => sucursales.value.filter(s => s.Estado.IdEstado === 1).length);

const sucursalesFiltradas = computed(() => {
  let res = sucursales.value;
  if (filtros.value.nombre) {
    const nombreLower = filtros.value.nombre.toLowerCase();
    res = res.filter(s => s.Nombre.toLowerCase().includes(nombreLower));
  }
  if (filtros.value.estado !== 'Todos') {
    const estadoId = filtros.value.estado === 'Activo' ? 1 : 2;
    res = res.filter(s => s.Estado.IdEstado === estadoId);
  }
  return res;
});

const totalPaginas = computed(() => Math.ceil(sucursalesFiltradas.value.length / itemsPerPage));
const sucursalesPaginadas = computed(() => {
  const start = (paginaActual.value - 1) * itemsPerPage;
  return sucursalesFiltradas.value.slice(start, start + itemsPerPage);
});

const paginacionInfo = computed(() => {
  const total = sucursalesFiltradas.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} sucursales`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) { pages.push(i); }
  return pages;
});

// --- Methods ---
const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => { showSuccessToast.value = false; }, 3000);
};

const cargarDatos = async () => {
  try {
    sucursales.value = await listarSucursales();
  } catch (error) {
    console.error('Error al cargar sucursales:', error);
    mostrarNotificacion('Error al cargar sucursales.');
  }
};

// --- Methods for address ---
const cargarDepartamentos = async () => {
  try {
    departamentos.value = await getDepartamento();
  } catch (error) {
    console.error('Error al cargar departamentos:', error);
  }
};

const cargarCiudades = async () => {
  if (!selectedDepartamento.value) {
    ciudades.value = [];
    return;
  }
  try {
    ciudades.value = await getCiudad(selectedDepartamento.value);
    if (!isPreloading.value) {
        distritos.value = [];
        barrios.value = [];
        selectedCiudad.value = null;
        selectedDistrito.value = null;
        selectedBarrio.value = null;
    }
  } catch (error) {
    console.error('Error al cargar ciudades:', error);
  }
};

const cargarDistritos = async () => {
  if (!selectedCiudad.value) {
    distritos.value = [];
    return;
  }
  try {
    distritos.value = await getDistrito(selectedCiudad.value);
    if (!isPreloading.value) {
        barrios.value = [];
        selectedDistrito.value = null;
        selectedBarrio.value = null;
    }
  } catch (error) {
    console.error('Error al cargar distritos:', error);
  }
};

const cargarBarrios = async () => {
  if (!selectedDistrito.value) {
    barrios.value = [];
    return;
  }
  try {
    barrios.value = await getBarrio(selectedDistrito.value);
    if (isPreloading.value) {
        selectedBarrio.value = null;
    }
  } catch (error) {
    console.error('Error al cargar barrios:', error);
  }
};

const toggleDetalles = (id) => {
  sucursalExpandida.value = sucursalExpandida.value === id ? null : id;
};

const getCleanSucursal = () => ({
  IdSucursal: null,
  Datos: { IdDatos: 1 },
  Nombre: '',
  Celular: '',
  Nro: '',
  Central: 2,
  Horario: { IdHorario: null, HoraEntrada: '08:00', HoraSalida: '18:00' },
  Direccion: { IdDireccion: null, Referencia: '', Direccion: '', IdBarrio: null, UbicacionGPS: '' },
});

const iniciarModoEdicion = async (sucursal = null) => {
  modoEdicion.value = true;
  if (sucursal) {
    isPreloading.value = true;
    esNuevaSucursal.value = false;
    sucursalEditada.value = JSON.parse(JSON.stringify(sucursal));
    sucursalEditada.value.Central = sucursalEditada.value.Central ? 1 : 2;
    
    selectedDepartamento.value = sucursal.Direccion.Barrio.Distrito.Ciudad.Departamento.IdDepto;
    await cargarCiudades();
    selectedCiudad.value = sucursal.Direccion.Barrio.Distrito.Ciudad.IdCiudad;
    await cargarDistritos();
    selectedDistrito.value = sucursal.Direccion.Barrio.Distrito.IdDistrito;
    await cargarBarrios();
    selectedBarrio.value = sucursal.Direccion.Barrio.IdBarrio;
    
    await nextTick();
    isPreloading.value = false;
  } else {
    esNuevaSucursal.value = true;
    sucursalEditada.value = getCleanSucursal();
    selectedDepartamento.value = null;
    selectedCiudad.value = null;
    selectedDistrito.value = null;
    selectedBarrio.value = null;
  }
};

const cancelarModoEdicion = () => {
  modoEdicion.value = false;
  sucursalEditada.value = null;
  Object.keys(errors).forEach(key => errors[key] = '');
};

const guardarSucursal = async () => {
  if (sucursalForm.value && !sucursalForm.value.validateForm()) {
    return;
  }
  try {
    const payload = {
      ...sucursalEditada.value,
      IdBarrio: selectedBarrio.value,
      Direccion: sucursalEditada.value.Direccion.Direccion,
      Referencia: sucursalEditada.value.Direccion.Referencia,
      UbicacionGPS: sucursalEditada.value.Direccion.UbicacionGPS,
      Entrada: sucursalEditada.value.Horario.HoraEntrada,
      Salida: sucursalEditada.value.Horario.HoraSalida,
      id: sucursalEditada.value.IdSucursal,
    };
    const response = esNuevaSucursal.value ? await addSucursal(payload) : await UpdateSucursal(payload);
    await cargarDatos();
    cancelarModoEdicion();
    mostrarNotificacion(response.message);
  } catch (error) {
    console.error("Error al guardar sucursal:", error);
    mostrarNotificacion('Error al guardar la sucursal.');
  }
};

const abrirModalConfirmacion = (sucursal) => {
  sucursalParaAccion.value = sucursal;
  mensajeModal.value = sucursal.Estado.IdEstado === 1 ? "Desactivar" : "Activar";
  modalConfirmacion.value = true;
};

const cerrarModalConfirmacion = () => {
  modalConfirmacion.value = false;
  sucursalParaAccion.value = null;
};

const confirmarAccion = async () => {
  if (!sucursalParaAccion.value) return;
  try {
    const response = await DelSucursal(sucursalParaAccion.value.IdSucursal);
    await cargarDatos();
    mostrarNotificacion(response.message);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    mostrarNotificacion('Error al cambiar el estado.');
  } finally {
    cerrarModalConfirmacion();
  }
};

const abrirModalAsignacion = async (sucursal) => {
  sucursalParaAccion.value = sucursal;
  try {
    const [todos, asignados] = await Promise.all([
      usuariosSinSucursal(),
      listarUsuarioAsignado(sucursal.IdSucursal)
    ]);

    const usuariosYaAsignados = asignados[0]?.Usuariosucursal
      .filter(us => us.Estado.IdEstado === 1 && us.Usuario)
      .map(us => us.Usuario) || [];

    const todosUnicos = [...todos, ...usuariosYaAsignados].reduce((acc, u) => {
      if (u && !acc.some(x => x.IdUsuario === u.IdUsuario)) {
        acc.push(u);
      }
      return acc;
    }, []);

    usuariosDisponibles.value = todosUnicos;
    usuariosAsignados.value = usuariosYaAsignados.map(u => ({ id: u.IdUsuario }));
    usuariosAsignadosOriginal.value = [...usuariosAsignados.value];

    modalAsignarUsuarios.value = true;
  } catch (error) {
    console.error("Error al abrir modal de asignación:", error);
    mostrarNotificacion("Error al cargar datos de usuarios.");
  }
};

const cerrarModalAsignacion = () => {
  modalAsignarUsuarios.value = false;
  sucursalParaAccion.value = null;
  usuariosDisponibles.value = [];
  usuariosAsignados.value = [];
  usuariosAsignadosOriginal.value = [];
};

const toggleAsignacionUsuario = (idUsuario) => {
  const index = usuariosAsignados.value.findIndex(u => u.id === idUsuario);
  if (index > -1) {
    usuariosAsignados.value.splice(index, 1);
  } else {
    usuariosAsignados.value.push({ id: idUsuario });
  }
};

const guardarAsignacion = async () => {
  if (!sucursalParaAccion.value) return;
  try {
    const response = await asignarUsuarioASucursal(sucursalParaAccion.value.IdSucursal, usuariosAsignados.value);
    mostrarNotificacion(response.message);
  } catch (error) {
    console.error("Error al guardar asignación:", error);
    mostrarNotificacion("Error al guardar la asignación.");
  } finally {
    cerrarModalAsignacion();
  }
};

// --- Lifecycle Hook ---
onMounted(() => {
    cargarDatos();
    cargarDepartamentos();
});

// --- Watchers ---
watch(filtros, () => { paginaActual.value = 1; }, { deep: true });
watch(selectedDepartamento, cargarCiudades);
watch(selectedCiudad, cargarDistritos);
watch(selectedDistrito, cargarBarrios);

</script>
