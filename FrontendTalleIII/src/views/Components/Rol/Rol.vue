<template>
  <div class="min-h-screen">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

    <Transition name="fade" mode="out-in">
      <!-- Loading inicial -->
      <div v-if="cargandoInicial" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative mb-6">
            <div class="w-20 h-20 mx-auto relative">
              <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                  <Shield class="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">Cargando Roles</h3>
          <p class="text-gray-500 text-sm">Preparando datos...</p>
          <div class="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div v-else>
        <!-- Header -->
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <Shield class="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                  Gestión de Roles
                </h1>
                <p class="text-gray-600 mt-1 font-medium">Administra los niveles de acceso del sistema</p>
              </div>
            </div>
            <div class="hidden md:flex items-center space-x-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ paginacion.total ?? 0 }}</div>
                <div class="text-sm text-gray-500">Total</div>
              </div>
              <div class="p-2 bg-orange-100 rounded-xl">
                <TrendingUp class="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="mt-6">
          <FiltroRol
            v-model:search="filtros.search"
            v-model:estado="filtros.estado"
            v-model:limite="filtros.limite"
            @update:search="onSearchChange"
            @update:estado="onEstadoChange"
            @update:limite="onLimiteChange"
          >
            <template #acciones>
              <button
                @click="abrirFormularioNuevo"
                class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-bold"
              >
                <Plus class="h-4 w-4" />
                Nuevo Rol
              </button>
            </template>
          </FiltroRol>
        </div>

        <!-- Cards -->
        <div class="relative mt-6">
          <Transition name="fade">
            <div v-if="cargando" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
              <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          </Transition>

          <div v-if="!cargando && roles.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
            <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Shield class="h-10 w-10 text-orange-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-700 mb-2">No se encontraron roles</h3>
            <p class="text-gray-500">Intenta cambiar los filtros o registra un nuevo rol.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <RolCard
              v-for="rol in roles"
              :key="rol.idrol || rol.IdRol"
              :rol="rol"
              :permisoExpandido="permisoExpandido"
              @editar="abrirFormularioEditar"
              @toggleEstado="abrirModalConfirmacion"
              @togglePermisos="togglePermisos"
            />
          </div>

          <Paginado
            :paginaActual="paginacion.paginaActual"
            :totalPaginas="paginacion.totalPaginas"
            :total="paginacion.total"
            :limite="filtros.limite"
            @update:paginaActual="onCambiarPagina"
          />
        </div>
      </div>
    </Transition>

    <!-- Modal Registro/Edición -->
    <RegistrarRol
      :show="showModal"
      :rol="rolSeleccionado"
      :esEdicion="!!rolSeleccionado"
      :menus="menus"
      :menusSeleccionados="menusSeleccionados"
      :permisosSeleccionados="permisosSeleccionados"
      :permisosPorMenu="permisosPorMenu"
      :guardando="guardando"
      :cargandoDatos="cargandoDatosEdicion"
      @guardar="onGuardar"
      @cancelar="cerrarFormulario"
      @toggle-menu="toggleMenu"
      @update-permission="handlePermissionChange"
    />

    <!-- Notificación -->
    <Transition name="slide-up">
      <div v-if="notificacion.visible" class="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 font-semibold">
        <CheckCircle class="h-5 w-5" />
        {{ notificacion.mensaje }}
      </div>
    </Transition>

    <!-- Modal Confirmación -->
    <ModalConfirmacion
      :show="modalConfirmacion.visible"
      :mensaje="modalConfirmacion.accion"
      :nombreUsuario="modalConfirmacion.nombre"
      @confirmar="onConfirmarCambioEstado"
      @cancelar="cerrarModalConfirmacion"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, shallowRef } from 'vue';
import { Shield, TrendingUp, Plus, CheckCircle } from 'lucide-vue-next';

import { 
  listarRoles as apiListarRoles, 
  DeleteROl, 
  listarMenus, 
  addRol, 
  updateRol, 
  listarpermisoMenu,
  listarRolMenus
} from '@/Server/rol';

import FiltroRol from './FiltroRol.vue';
import RolCard from './RolCard.vue';
import RegistrarRol from './RegistrarRol.vue';
import Paginado from '@/views/Components/Modals/Paginado.vue';
import ModalConfirmacion  from '@/views/Components/Modals/ModalConfirmacion.vue';

// --- Estado ---
const cargandoInicial = ref(true);
const cargando = ref(false);
const guardando = ref(false);
const showModal = ref(false);
const rolSeleccionado = ref(null);
const roles = shallowRef([]);
const menus = ref([]);
const permisoExpandido = ref(null);
const cargandoDatosEdicion = ref(false);

const paginacion = reactive({
  paginaActual: 1,
  totalPaginas: 1,
  total: 0
});

const filtros = reactive({
  search: '',
  estado: '-1',
  limite: 8
});

const notificacion = reactive({
  visible: false,
  mensaje: ''
});

const modalConfirmacion = reactive({
  visible: false,
  nombre: '',
  accion: '',
  id: null
});

// Estado para RegistrarRol
const menusSeleccionados = ref([]);
const permisosSeleccionados = ref({}); 
const permisosPorMenu = ref({});
const cachePermisosPorMenu = new Map();

let debounceTimer = null;
let worker = null;

// --- Métodos de Carga ---
const cargarRoles = async () => {
  try {
    cargando.value = true;
     const estadoParam = filtros.estado === '-1' ? undefined : filtros.estado;
    
    const resp = await apiListarRoles(
      filtros.search || undefined,
      estadoParam,
      paginacion.paginaActual,
      filtros.limite
    );

    roles.value = resp.data || [];
    paginacion.total = parseInt(resp.total) || 0;
    paginacion.totalPaginas = Math.ceil(paginacion.total / filtros.limite);
    
  } catch (err) {
    console.error('Error al cargar roles:', err);
    mostrarNotificacion('Error al cargar roles');
  } finally {
    cargando.value = false;
    cargandoInicial.value = false;
  }
};

const cargarMenusBase = async () => {
  try {
    menus.value = await listarMenus();
  } catch (err) {
    console.error('Error al cargar menús:', err);
  }
};

// --- Métodos de Acción ---
const onSearchChange = (val) => {
  filtros.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    paginacion.paginaActual = 1;
    cargarRoles();
  }, 400);
};

const onEstadoChange = (val) => {
  filtros.estado = val;
  paginacion.paginaActual = 1;
  cargarRoles();
};

const onLimiteChange = (val) => {
  filtros.limite = val;
  paginacion.paginaActual = 1;
  cargarRoles();
};

const onCambiarPagina = (page) => {
  paginacion.paginaActual = page;
  cargarRoles();
};

const togglePermisos = (rolId) => {
  permisoExpandido.value = permisoExpandido.value === rolId ? null : rolId;
};

// --- Gestión de Formulario ---
const abrirFormularioNuevo = () => {
  rolSeleccionado.value = null;
  limpiarFormulario();
  showModal.value = true;
};

const abrirFormularioEditar = async (rol) => {
  rolSeleccionado.value = { ...rol };
  limpiarFormulario();
  showModal.value = true;
  cargandoDatosEdicion.value = true;

  try {
    const idRol = rol.idrol || rol.IdRol;
    const asociaciones = await listarRolMenus(idRol);
    
    const menusMap = new Map();
    const permisosAgrupados = {};

    for (const item of asociaciones) {
      if (item.menu) {
        const menuId = item.menu.IdMenu;
        if (!menusMap.has(menuId)) {
          menusMap.set(menuId, item.menu);
          permisosAgrupados[menuId] = [];
        }
        if (item.Permiso) {
          permisosAgrupados[menuId].push(item.Permiso.IdPermiso);
        }
      }
    }

    const menusDelRol = Array.from(menusMap.values());
    menusSeleccionados.value = menusDelRol;
    permisosSeleccionados.value = { ...permisosAgrupados };
    
    await cargarPermisosParaMenusEnParalelo(menusDelRol);
  } catch (err) {
    console.error("Error al cargar detalles:", err);
    mostrarNotificacion("Error al cargar los detalles del rol.");
  } finally {
    cargandoDatosEdicion.value = false;
  }
};

const limpiarFormulario = () => {
  menusSeleccionados.value = [];
  permisosSeleccionados.value = {};
  permisosPorMenu.value = {};
};

const cerrarFormulario = () => {
  showModal.value = false;
  rolSeleccionado.value = null;
};

const onGuardar = async (formData) => {
  guardando.value = true;
  try {
    const isEdit = !!rolSeleccionado.value;
    const idRol = rolSeleccionado.value?.idrol || rolSeleccionado.value?.IdRol;
    
    const respuesta = isEdit 
      ? await updateRol(idRol, formData.nombre, permisosSeleccionados.value)
      : await addRol(formData.nombre, permisosSeleccionados.value);

    mostrarNotificacion(respuesta?.message || (isEdit ? 'Rol actualizado' : 'Rol registrado'));
    cerrarFormulario();
    await cargarRoles();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar');
  } finally {
    guardando.value = false;
  }
};

// --- Lógica de Selección de Permisos (desde Rol.vue original) ---
const handlePermissionChange = ({ menuId, permisoId, checked }) => {
  const currentPermisos = permisosSeleccionados.value[menuId] || [];
  if (checked) {
    if (!currentPermisos.includes(permisoId)) {
      permisosSeleccionados.value[menuId] = [...currentPermisos, permisoId];
    }
  } else {
    permisosSeleccionados.value[menuId] = currentPermisos.filter(id => id !== permisoId);
  }
};

const cargarPermisosParaMenusEnParalelo = async (menusArray) => {
  const promesas = menusArray.map(async (menu) => {
    const menuId = menu.IdMenu;
    if (cachePermisosPorMenu.has(menuId)) {
      permisosPorMenu.value[menuId] = cachePermisosPorMenu.get(menuId);
      return;
    }
    try {
      const permisos = await listarpermisoMenu(menuId);
      cachePermisosPorMenu.set(menuId, permisos);
      permisosPorMenu.value[menuId] = permisos;
    } catch (err) {
      permisosPorMenu.value[menuId] = [];
    }
  });
  await Promise.all(promesas);
};

const toggleMenu = async (menu) => {
  const index = menusSeleccionados.value.findIndex(m => m.IdMenu === menu.IdMenu);
  if (index > -1) {
    menusSeleccionados.value.splice(index, 1);
    delete permisosSeleccionados.value[menu.IdMenu];
  } else {
    menusSeleccionados.value.push(menu);
    permisosSeleccionados.value[menu.IdMenu] = [];
    await cargarPermisosParaMenuSingle(menu);
  }
};

const cargarPermisosParaMenuSingle = async (menu) => {
  const menuId = menu.IdMenu;
  if (permisosPorMenu.value[menuId]) return;
  if (cachePermisosPorMenu.has(menuId)) {
    permisosPorMenu.value[menuId] = cachePermisosPorMenu.get(menuId);
    return;
  }
  try {
    const permisos = await listarpermisoMenu(menuId);
    cachePermisosPorMenu.set(menuId, permisos);
    permisosPorMenu.value[menuId] = permisos;
  } catch (err) {
    permisosPorMenu.value[menuId] = [];
  }
};

// --- Confirmación de Cambio de Estado ---
const abrirModalConfirmacion = (rol) => {
  const estadoActual = rol.Estado || rol.estado;
  modalConfirmacion.id = rol.idrol || rol.IdRol;
  modalConfirmacion.nombre = rol.Nombre || rol.nombre;
  modalConfirmacion.accion = estadoActual === 1 ? 'Desactivar' : 'Activar';
  modalConfirmacion.visible = true;
};

const cerrarModalConfirmacion = () => {
  modalConfirmacion.visible = false;
};

const onConfirmarCambioEstado = async () => {
  const id = modalConfirmacion.id;
  cerrarModalConfirmacion();
  if (!id) return;
  try {
    const resp = await DeleteROl(id);
    mostrarNotificacion(resp?.message || 'Estado actualizado');
    await cargarRoles();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cambiar el estado');
  }
};

const mostrarNotificacion = (mensaje) => {
  notificacion.mensaje = mensaje;
  notificacion.visible = true;
  setTimeout(() => {
    notificacion.visible = false;
  }, 3000);
};

// --- Lifecycle ---
onMounted(async () => {
  await Promise.all([
    cargarRoles(),
    cargarMenusBase()
  ]);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
