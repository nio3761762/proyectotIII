<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
    <div v-if="!modoEdicion">
      <ProveedorHeader 
        :proveedoresActivos="proveedoresActivos" 
        :totalProveedores="proveedores.length" 
      />
      <ProveedorFilters
        v-model="filtros"
        :status-options="statusOptions"
        @nuevo-proveedor="iniciarModoEdicion()"
        class="mt-6"
      />
      <ProveedorList
        :proveedores="proveedoresPaginados"
        :proveedor-expandido="proveedorExpandido"
        @toggle-detalles="toggleDetalles"
        @editar="iniciarModoEdicion"
        @abrir-modal="abrirModalConfirmacion"
      />
      <ProveedorPagination
        v-if="totalPaginas > 0"
        v-model:paginaActual="paginaActual"
        :paginacion-info="paginacionInfo"
        :total-paginas="totalPaginas"
        :visible-pages="visiblePages"
      />
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
import { ref, computed, onMounted, watch } from 'vue';
import { AlertTriangle, CheckCircle } from 'lucide-vue-next';

import ProveedorHeader from './ProveedorHeader.vue';
import ProveedorFilters from './ProveedorFilters.vue';
import ProveedorList from './ProveedorList.vue';
import ProveedorPagination from './ProveedorPagination.vue';
import ProveedorForm from './ProveedorForm.vue';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';

import { listarBarrios } from '@/Server/api';
import { listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';
import { SubirFoto } from '@/Server/Foto';
import { listarProveedores, DeleteProveedor, updateProveedor, RegistrarProveedor, listarTipoProveedores } from '@/Server/Proveedor';

// --- State ---
const proveedores = ref([]);
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

const proveedoresFiltrados = computed(() => {
  let filtrados = proveedores.value;
  if (filtros.value.nombre) {
    const nombreLower = filtros.value.nombre.toLowerCase();
    filtrados = filtrados.filter(p => 
      (p.Persona.Nombre.toLowerCase() + " " + p.Persona.ApellidoPaterno.toLowerCase()).includes(nombreLower)
    );
  }
  if (filtros.value.estado !== 'Todos') {
    const estadoId = filtros.value.estado === 'Activo' ? 1 : 2;
    filtrados = filtrados.filter(p => p.Estado.IdEstado === estadoId);
  }
  return filtrados;
});

const totalPaginas = computed(() => Math.ceil(proveedoresFiltrados.value.length / itemsPerPage));

const proveedoresPaginados = computed(() => {
  const start = (paginaActual.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return proveedoresFiltrados.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = proveedoresFiltrados.value.length;
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
const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => { showSuccessToast.value = false; }, 3000);
};

const fetchData = async () => {
  try {
    [proveedores.value, Tipoproveedores.value, barrios.value, documento.value, email.value, numero.value] = await Promise.all([
      listarProveedores(),
      listarTipoProveedores(),
      listarBarrios(),
      listarDocumento(),
      listarEmail(),
      listarNumero(),
    ]);
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
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
      Persona: {
        ...proveedor.Persona,
        Imagen: { ...proveedor.Persona.Imagen, Url: imageUrl }
      }
    };

    const response = esNuevoProveedor.value 
      ? await RegistrarProveedor(payload) 
      : await updateProveedor(payload);

    await fetchData();
    cancelarModoEdicion();
    mostrarNotificacion(response.message);
  } catch (error) {
    console.error('Error al guardar el proveedor:', error);
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
    try {
      const response = await DeleteProveedor(proveedorParaAccion.value.id);
      await fetchData();
      mostrarNotificacion(response.message);
    } catch (error) {
      console.error('Error al cambiar estado del proveedor:', error);
    }
    cerrarModalConfirmacion();
  }
};

watch(proveedoresFiltrados, () => {
  if (paginaActual.value > totalPaginas.value) {
    paginaActual.value = totalPaginas.value || 1;
  }
});

onMounted(fetchData);
</script>