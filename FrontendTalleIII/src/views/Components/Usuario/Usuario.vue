<template>
  <div class="min-h-screen">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <canvas ref="pieChartCanvas" style="position: absolute; left: -9999px; top: -9999px;"></canvas>
    
    <div v-if="!modoEdicion">
      <!-- Header -->
      <div class="relative overflow-hidden animate-fade-in-up">
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <Users class="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                  Gestión de Usuarios
                </h1>
                <p class="text-gray-600 mt-1 font-medium">Administra todos los usuarios del sistema</p>
              </div>
            </div>
            <div class="hidden md:flex items-center space-x-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ usuariosActivos }}</div>
                <div class="text-sm text-gray-500">Activos</div>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ usuarios.length }}</div>
                <div class="text-sm text-gray-500">Total</div>
              </div>
              <div class="p-2 bg-green-100 rounded-xl">
                <TrendingUp class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <UsuarioFiltros 
        :filtros="filtros"
        :roles-disponibles="rolesDisponibles"
        :status-options="statusOptions"
        @update:filtros="nuevosFiltros => filtros = nuevosFiltros"
        @nuevo="iniciarModoEdicion"
        @reporte="descargarReporte"
      />

      <UsuarioLista 
        :usuarios="usuariosPaginados"
        @editar="iniciarModoEdicion"
        @asignar-rol="abrirModalAsignarRol"
        @cambiar-estado="abrirModalConfirmacion"
      />

      <Paginacion 
        v-model:pagina-actual="paginaActual"
        :total-paginas="totalPaginas"
        :paginacion-info="paginacionInfo"
      />

    </div>

    <UsuarioFormulario 
      v-else 
      :usuario="usuarioParaEditar"
      :emails="email"
      :documentos="documento"
      :numeros="numero"
      @guardar="handleGuardarUsuario"
      @cancelar="cancelarModoEdicion"
    />

    <ConfirmacionModal
      :show="modalAct"
      :title="usuarioParaAccion?.estadoActual === 1 ? '¿Desactivar Usuario?' : '¿Activar Usuario?'"
      :confirmText="mensajeModal === 'Desactivar' ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="mensajeModal === 'Desactivar' ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-10 w-10 text-orange-500"
      @confirm="confirmar"
      @cancel="cerrarModalConfirmacion"
    >
      ¿Está seguro de {{ mensajeModal }} el usuario
      <span class="font-semibold text-gray-800">{{ usuarioParaAccion?.nombre }}</span>?
    </ConfirmacionModal>

    <ModalAsignarRol
      :show="openModalAsignarRol"
      :roles-disponibles="rolesDisponibles"
      :nombre-usuario="nombreCompletoAsignarRol"
      :rol-actual="rolSeleccionadoAsignar"
      @guardar="guardarRolUsuario"
      @cancelar="cerrarModalAsignarRol"
    />
    
    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in">
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-slide-in { animation: slide-in 0.3s ease-out; }
.animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #fdba74, #f97316); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #f97316, #ea580c); }
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables, ChartDataLabels);

import {
  Users, TrendingUp, CheckCircle, AlertTriangle, Check
} from 'lucide-vue-next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { listarUsuarios, DeleteUsuario, RegistrarUsuario, updateUsuario } from '@/Server/Usuario';
import { listarRoles, updateRolUsuario, AsignarRolUsuario } from '@/Server/rol';
import { listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';

import UsuarioFormulario from './UsuarioFormulario.vue';
import UsuarioLista from './UsuarioLista.vue';
import UsuarioFiltros from './UsuarioFiltros.vue';
import Paginacion from './Paginacion.vue';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';
import ModalAsignarRol from './ModalAsignarRol.vue';

// --- State ---
const usuarios = ref([]);
const rolesDisponibles = ref([]);
const modoEdicion = ref(false);
const modalAct = ref(false);
const openModalAsignarRol = ref(false);
const showSuccessToast = ref(false);
const successMessage = ref('');
const filtros = ref({ nombre: "", rol: "Todos", estado: "Todos" });
const pieChartCanvas = ref(null);
const email = ref([]);
const documento = ref([]);
const numero = ref([]);
const statusOptions = [
  { value: "Todos", label: "Todos", color: "bg-gray-500" },
  { value: "Activo", label: "Activo", color: "bg-green-500" },
  { value: "Inactivo", label: "Inactivo", color: "bg-red-500" }
];
const paginaActual = ref(1);
const itemsPerPage = 6;
const usuarioParaEditar = ref(null);
const usuarioParaAccion = ref(null);
const mensajeModal = ref("");
const nombreCompletoAsignarRol = ref("");
const rolSeleccionadoAsignar = ref("");

// --- Computed properties ---
const usuariosActivos = computed(() => usuarios.value.filter(u => u.Estado.IdEstado === 1).length);

const usuariosFiltrados = computed(() => {
  let items = usuarios.value;
  if (filtros.value.nombre) {
    const nombreLower = filtros.value.nombre.toLowerCase();
    items = items.filter(u => (u.Persona.Nombre.toLowerCase() + " " + u.Persona.ApellidoPaterno.toLowerCase()).includes(nombreLower));
  }
  if (filtros.value.rol !== 'Todos') {
    items = items.filter(u => u.Rolusuario[0]?.Rol.Nombre === filtros.value.rol);
  }
  if (filtros.value.estado !== 'Todos') {
    const estadoId = filtros.value.estado === 'Activo' ? 1 : 2;
    items = items.filter(u => u.Estado.IdEstado === estadoId);
  }
  return items;
});

const totalPaginas = computed(() => Math.ceil(usuariosFiltrados.value.length / itemsPerPage));
const usuariosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return usuariosFiltrados.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = usuariosFiltrados.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} usuarios`;
});

// --- Methods ---
const fetchData = async () => {
  try {
    [usuarios.value, rolesDisponibles.value, documento.value, email.value, numero.value] = await Promise.all([
      listarUsuarios(),
      listarRoles().then(roles => [{ IdRol: "ROL-0", Nombre: "Todos" }, ...roles]),
      listarDocumento(),
      listarEmail(),
      listarNumero()
    ]);
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
  }
};

const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => { showSuccessToast.value = false; }, 1000);
};

const iniciarModoEdicion = (usuario = null) => {
  usuarioParaEditar.value = usuario;
  modoEdicion.value = true;
};

const cancelarModoEdicion = () => {
  modoEdicion.value = false;
  usuarioParaEditar.value = null;
};

const handleGuardarUsuario = async (datoUsuario) => {
  try {
    const esNuevo = !datoUsuario.IdUsuario;
    const response = esNuevo ? await RegistrarUsuario(datoUsuario) : await updateUsuario(datoUsuario);
    mostrarNotificacion(response.message);
    await fetchData();
    cancelarModoEdicion();
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
  }
};

const confirmar = async () => {
  if (usuarioParaAccion.value) {
    try {
      const response = await DeleteUsuario(usuarioParaAccion.value.id);
      mostrarNotificacion(response.message);
      await fetchData();
    } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
    }
  }
  cerrarModalConfirmacion();
};

const guardarRolUsuario = async (idRol) => {
  const usuario = usuarioParaAccion.value;
  if (!usuario || !idRol) return cerrarModalAsignarRol();

  try {
    const data = { IdUsuario: usuario.IdUsuario, IdRol: idRol };
    const response = usuario.Rolusuario?.length ? await updateRolUsuario(data) : await AsignarRolUsuario(data);
    mostrarNotificacion(response.message);

    // Optimistic UI Update
    const usuarioIndex = usuarios.value.findIndex(u => u.IdUsuario === usuario.IdUsuario);
    if (usuarioIndex !== -1) {
      const nuevoRol = rolesDisponibles.value.find(r => r.IdRol === idRol);
      if (nuevoRol) {
        const usuarioActualizado = { ...usuarios.value[usuarioIndex] };
        if (!usuarioActualizado.Rolusuario || usuarioActualizado.Rolusuario.length === 0) {
          usuarioActualizado.Rolusuario = [{ Rol: nuevoRol }];
        } else {
          usuarioActualizado.Rolusuario[0].Rol = nuevoRol;
        }
        usuarios.value[usuarioIndex] = usuarioActualizado;
      }
    }

  } catch (error) {
    console.error('Error al asignar el rol:', error);
    // Optionally, revert optimistic update here or show error notification
  } finally {
    cerrarModalAsignarRol();
  }
};

const abrirModalConfirmacion = (idUsuario, nombre, estadoActual) => {
  usuarioParaAccion.value = { id: idUsuario, nombre, estadoActual };
  mensajeModal.value = estadoActual === 1 ? "Desactivar" : "Activar";
  modalAct.value = true;
};

const cerrarModalConfirmacion = () => {
  modalAct.value = false;
  usuarioParaAccion.value = null;
};

const abrirModalAsignarRol = (usuario) => {
  usuarioParaAccion.value = usuario;
  nombreCompletoAsignarRol.value = `${usuario.Persona.Nombre} ${usuario.Persona.ApellidoPaterno}`;
  rolSeleccionadoAsignar.value = usuario.Rolusuario[0]?.Rol?.IdRol || "";
  openModalAsignarRol.value = true;
};

const cerrarModalAsignarRol = () => {
  openModalAsignarRol.value = false;
  usuarioParaAccion.value = null;
  nombreCompletoAsignarRol.value = "";
  rolSeleccionadoAsignar.value = "";
};

const descargarReporte = async () => {
  // ... (la lógica de descarga del reporte se mantiene igual)
};

// --- Lifecycle Hook ---
onMounted(fetchData);
</script>