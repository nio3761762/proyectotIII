
<template>
  <div class="min-h-screen">
    <RolHeader
      :rolesActivos="rolesActivos"
      :totalRoles="roles.length"
    />
    <RolFilters
      v-model="filtros"
      :statusOptions="statusOptions"
      @nuevo-rol="abrirModalRegistro"
    />
    <RolList
      :roles="rolesPaginados"
      :permisoExpandido="permisoExpandido"
      :contarPermisos="contarPermisos"
      :obtenerMenusDelRol="obtenerMenusDelRol"
      :agruparPermisosPorMenu="agruparPermisosPorMenu"
      @toggle-permisos="togglePermisos"
      @editar="abrirModalEdicion"
      @cambiar-estado="abrirModalActivarDesactivar"
      @nuevo-rol="abrirModalRegistro"
    />
    <RolPagination
      v-if="totalPaginas > 0"
      :totalPaginas="totalPaginas"
      v-model:paginaActual="paginaActual"
      :paginacionInfo="paginacionInfo"
      :visiblePages="visiblePages"
    />

    <!-- Modal Crear/Editar -->
    <RolFormModal
      :show="mostrarModal"
      :esEdicion="esEdicion"
      :rolActual="rolActual"
      :menus="menus"
      :menusSeleccionados="menusSeleccionados"
      :permisosSeleccionados="permisosSeleccionados"
      :permisosPorMenu="permisosPorMenu"
      :formValido="formValido"
      @close="cerrarModal"
      @update:rolActual="rolActual = $event"
      @update:menusSeleccionados="menusSeleccionados = $event"
      @update:permisosSeleccionados="permisosSeleccionados = $event"
      @toggle-menu="toggleMenu"
      @guardar-rol="guardarRol"
    />

    <!-- Modal Confirmación -->
    <ConfirmacionModal
      :show="modalActivarDesactivar"
      :title="rolActual.Estado?.IdEstado === 1 ? '¿Desactivar Rol?' : '¿Activar Rol?'"
      :confirmText="rolActual.Estado?.IdEstado === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="rolActual.Estado?.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-10 w-10 text-orange-500"
      @confirm="confirmarActivacionDesactivacion"
      @cancel="modalActivarDesactivar = false"
    >
      ¿Está seguro de {{ rolActual.Estado?.IdEstado === 1 ? 'desactivar' : 'activar' }} el rol
      <span class="font-semibold text-gray-800">{{ rolActual.nombre }}</span>?
    </ConfirmacionModal>

    <!-- Toast -->
    <div
      v-if="showToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  AlertTriangle, CheckCircle
} from 'lucide-vue-next';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';
import RolHeader from './RolHeader.vue';
import RolFilters from './RolFilters.vue';
import RolList from './RolList.vue';
import RolPagination from './RolPagination.vue';
import RolFormModal from './RolFormModal.vue';
import { 
  listarRoles as apiListarRoles, 
  DeleteROl, 
  listarMenus, 
  addRol, 
  updateRol, 
  listarpermisoMenu,
  listarRolMenus
} from '@/Server/rol';

// --- Estado Reactivo ---
const roles = ref([]);
const menus = ref([]);
const filtros = ref({
  nombre: '',
  estado: 'Todos'
});
const statusOptions = [
  { value: "Todos", label: "Todos", color: "bg-gray-500" },
  { value: "Activo", label: "Activo", color: "bg-green-500" },
  { value: "Inactivo", label: "Inactivo", color: "bg-red-500" }
];

const mostrarModal = ref(false);
const modalActivarDesactivar = ref(false);
const esEdicion = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const paginaActual = ref(1);
const itemsPorPagina = ref(6);
const permisoExpandido = ref(null);

const rolActual = ref({
  IdRol: null,
  nombre: '',
  Estado: { IdEstado: 1 }
});

const menusSeleccionados = ref([]);
const permisosSeleccionados = ref({}); 
const permisosPorMenu = ref({});

// --- Propiedades Computadas ---
const rolesActivos = computed(() => roles.value.filter(r => r.Estado.IdEstado === 1).length);

const rolesFiltrados = computed(() => {
  let resultado = roles.value;

  if (filtros.value.nombre) {
    resultado = resultado.filter(rol => 
      rol.Nombre.toLowerCase().includes(filtros.value.nombre.toLowerCase())
    );
  }

  if (filtros.value.estado !== 'Todos') {
    const estadoId = filtros.value.estado === 'Activo' ? 1 : 2;
    resultado = resultado.filter(rol => rol.Estado.IdEstado === estadoId);
  }

  return resultado;
});

const totalPaginas = computed(() => {
  const total = Math.ceil(rolesFiltrados.value.length / itemsPorPagina.value);
  return total > 0 ? total : 1;
});

const rolesPaginados = computed(() => {
  if (paginaActual.value > totalPaginas.value) {
    paginaActual.value = totalPaginas.value;
  }
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
  const fin = inicio + itemsPorPagina.value;
  return rolesFiltrados.value.slice(inicio, fin);
});

const formValido = computed(() => {
  return rolActual.value.nombre.trim() !== '' && menusSeleccionados.value.length > 0 && Object.values(permisosSeleccionados.value).some(p => p.length > 0);
});

const paginacionInfo = computed(() => {
  const total = rolesFiltrados.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPorPagina.value + 1;
  const fin = Math.min(inicio + itemsPorPagina.value - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} roles`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

// --- Métodos ---
const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const listarRolesAPI = async () => {
  try {
    roles.value = await apiListarRoles();
  } catch (error) {
    console.error("Error al cargar roles:", error);
    showToastMessage("Error al cargar los roles.");
  }
};

const listarMenusAPI = async () => {
  try {
    menus.value = await listarMenus();
  } catch (error) {
    console.error("Error al cargar menús:", error);
    showToastMessage("Error al cargar los menús.");
  }
};

const limpiarFormularioModal = () => {
  rolActual.value = { IdRol: null, nombre: '', Estado: { IdEstado: 1 } };
  menusSeleccionados.value = [];
  permisosSeleccionados.value = {};
  permisosPorMenu.value = {};
};

const abrirModalRegistro = () => {
  esEdicion.value = false;
  limpiarFormularioModal();
  mostrarModal.value = true;
};

const abrirModalEdicion = async (rol) => {
  esEdicion.value = true;
  limpiarFormularioModal();
  rolActual.value = { IdRol: rol.IdRol, nombre: rol.Nombre, Estado: rol.Estado };

  try {
    const asociaciones = await listarRolMenus(rol.IdRol);
    
    const menusDelRol = obtenerMenusDelRol(asociaciones);
    menusSeleccionados.value = menusDelRol;

    const permisosAgrupados = agruparPermisosPorMenu(asociaciones);

    for (const menu of menusDelRol) {
      await cargarPermisosParaMenu(menu);
      const permisosExistentes = permisosAgrupados[menu.IdMenu]?.permisos || [];
      permisosSeleccionados.value[menu.IdMenu] = permisosExistentes.map(p => p.IdPermiso);
    }
    
    mostrarModal.value = true;
  } catch (error) {
    console.error("Error al obtener detalles del rol:", error);
    showToastMessage("Error al cargar los detalles del rol.");
  }
};

const cerrarModal = () => {
  mostrarModal.value = false;
};

const cargarPermisosParaMenu = async (menu) => {
  if (!permisosPorMenu.value[menu.IdMenu]) {
    try {
      permisosPorMenu.value[menu.IdMenu] = await listarpermisoMenu(menu.IdMenu);
    } catch (error) {
      console.error(`Error al cargar permisos para ${menu.Nombre}:`, error);
      showToastMessage(`No se pudieron cargar los permisos para ${menu.Nombre}.`);
      permisosPorMenu.value[menu.IdMenu] = [];
    }
  }
};

const toggleMenu = (menu) => {
  const index = menusSeleccionados.value.findIndex(m => m.IdMenu === menu.IdMenu);
  if (index > -1) {
    menusSeleccionados.value.splice(index, 1);
    delete permisosSeleccionados.value[menu.IdMenu];
  } else {
    menusSeleccionados.value.push(menu);
    permisosSeleccionados.value[menu.IdMenu] = [];
    cargarPermisosParaMenu(menu);
  }
};

const guardarRol = async () => {
  if (!formValido.value) {
    showToastMessage('Complete todos los campos requeridos.');
    return;
  }

  try {
    if (esEdicion.value) {
      
      await updateRol(rolActual.value.IdRol, rolActual.value.nombre, permisosSeleccionados.value);

     
      showToastMessage('Rol actualizado exitosamente');
    } else {
      await addRol(rolActual.value.nombre, permisosSeleccionados.value);
      showToastMessage('Rol creado exitosamente');
    }
    await listarRolesAPI();
    cerrarModal();
  } catch (error) {
    console.error("Error al guardar el rol:", error);
    showToastMessage("Error al guardar el rol.");
  }
};

const togglePermisos = (rolId) => {
  permisoExpandido.value = permisoExpandido.value === rolId ? null : rolId;
};

const abrirModalActivarDesactivar = (rol) => {
  rolActual.value = { IdRol: rol.IdRol, nombre: rol.Nombre, Estado: rol.Estado };
  modalActivarDesactivar.value = true;
};

const confirmarActivacionDesactivacion = async () => {
  try {
    await DeleteROl(rolActual.value.IdRol);
    const accion = rolActual.value.Estado.IdEstado === 1 ? 'desactivado' : 'activado';
    showToastMessage(`Rol ${accion} exitosamente`);
    await listarRolesAPI();
  } catch (error) {
    console.error("Error al cambiar estado del rol:", error);
    showToastMessage("Error al cambiar el estado del rol.");
  }
  modalActivarDesactivar.value = false;
};

const contarPermisos = (rolMenus) => {
  return rolMenus?.length || 0;
};

const obtenerMenusDelRol = (rolMenus) => {
  if (!rolMenus) return [];
  const menusMap = new Map();
  rolMenus.forEach(item => {
    if (item.menu) {
      menusMap.set(item.menu.IdMenu, item.menu);
    }
  });
  return Array.from(menusMap.values());
};

const agruparPermisosPorMenu = (rolMenus) => {
  if (!rolMenus) return {};
  return rolMenus.reduce((acc, rolMenu) => {
    if (rolMenu.menu && rolMenu.Permiso) {
      if (!acc[rolMenu.menu.IdMenu]) {
        acc[rolMenu.menu.IdMenu] = {
          menu: rolMenu.menu,
          permisos: []
        };
      }
      acc[rolMenu.menu.IdMenu].permisos.push(rolMenu.Permiso);
    }
    return acc;
  }, {});
};

// --- Ciclo de Vida ---
onMounted(() => {
  listarRolesAPI();
  listarMenusAPI();
});
</script>

<style scoped>
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

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fdba74, #f97316);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f97316, #ea580c);
}
</style>
