<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8">
    <div>
      <ComisionHeader 
        :comisionesActivas="comisionesActivas" 
        :totalComisiones="comisiones.length" 
      />
      <ComisionFilters
        v-model="filtros"
        :status-options="statusOptions"
        @nueva-comision="iniciarModoEdicion()"
        class="mt-6"
      />
      <ComisionList
        :comisiones="comisionesPaginadas"
        :pp="pp"
        @editar="iniciarModoEdicion"
        @abrir-modal="abrirModalConfirmacion"
      />
      <ComisionPagination
        v-if="totalPaginas > 0"
        v-model:paginaActual="paginaActual"
        :paginacion-info="paginacionInfo"
        :total-paginas="totalPaginas"
        :visible-pages="visiblePages"
      />
    </div>

    <ComisionFormModal
      v-if="modoEdicion"
      :comision-editada="comisionEditada"
      :es-nueva-comision="esNuevaComision"
      :productos="productos"
      :pp="pp"
      @guardar-comision="guardarComision"
      @cerrar-modal="cerrarModal"
    />

    <ConfirmacionModal
      :show="modalAct"
      :title="comisionParaAccion?.Estado === 1 ? '¿Desactivar Comisión?' : '¿Activar Comisión?'"
      :confirmText="comisionParaAccion?.Estado === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="comisionParaAccion?.Estado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'"
      :iconComponent="AlertTriangle"
      iconClass="h-8 w-8 text-orange-600"
      @confirm="confirmar"
      @cancel="cerrarModalConfirmacion"
    >
      ¿Está seguro de que desea {{ comisionParaAccion?.Estado === 1 ? 'desactivar' : 'activar' }} la comisión
      <span class="font-semibold text-gray-900 bg-orange-100 px-2 py-1 rounded-lg">
        {{ comisionParaAccion?.Nombre }}
      </span>?
    </ConfirmacionModal>

    <div v-if="showSuccessToast" class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl z-50">
      <Check class="h-5 w-5 inline mr-2" />
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { AlertTriangle, Check } from 'lucide-vue-next';

import ComisionHeader from './ComisionHeader.vue';
import ComisionFilters from './ComisionFilters.vue';
import ComisionList from './ComisionList.vue';
import ComisionPagination from './ComisionPagination.vue';
import ComisionFormModal from './ComisionFormModal.vue';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';

import { listarComisiones, AddComisiones, UpdateComision, DeleteComision } from '@/Server/Comision';
import { listarProductos, PrecioProducto } from '@/Server/Producto';

const comisiones = ref([]);
const productos = ref([]);
const pp = ref({});

const filtros = ref({
  nombre: "",
  estado: 0
});

const statusOptions = [
  { value: 0, label: "Todos", color: "bg-gray-500" },
  { value: 1, label: "Activo", color: "bg-green-500" },
  { value: 2, label: "Inactivo", color: "bg-red-500" }
];

const paginaActual = ref(1);
const itemsPerPage = 6;

const modoEdicion = ref(false);
const esNuevaComision = ref(true);
const comisionEditada = ref(null);

const modalAct = ref(false);
const comisionParaAccion = ref(null);

const showSuccessToast = ref(false);
const successMessage = ref('');

const comisionesActivas = computed(() => comisiones.value.filter(c => c.Estado === 1).length);

const filteredComisiones = computed(() => {
  let filtered = comisiones.value;
  if (filtros.value.nombre) {
    const lowerQuery = filtros.value.nombre.toLowerCase();
    filtered = filtered.filter(c => c.Nombre.toLowerCase().includes(lowerQuery));
  }
  if (filtros.value.estado !== 0) {
    filtered = filtered.filter(c => c.Estado === filtros.value.estado);
  }
  return filtered;
});

const totalPaginas = computed(() => Math.ceil(filteredComisiones.value.length / itemsPerPage));

const comisionesPaginadas = computed(() => {
  const start = (paginaActual.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredComisiones.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = filteredComisiones.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} comisiones`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

const fetchAllData = async () => {
  try {
    const [comisionesData, productosData] = await Promise.all([
      listarComisiones(),
      listarProductos()
    ]);
    comisiones.value = comisionesData;
    productos.value = productosData;
    for (const prod of productosData) {
      const precioData = await PrecioProducto(prod.IdProducto);
      pp.value[prod.IdProducto] = precioData;
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
};

const iniciarModoEdicion = (comision = null) => {
  if (comision) {
    esNuevaComision.value = false;
    const productoSeleccionado = productos.value.find(p => p.IdProducto === comision.IdProducto);
    const monto = ((comision.Cantidad * pp.value[comision.IdProducto]?.Precio) * (comision.Porcentaje / 100)).toFixed(2);
    comisionEditada.value = {
      ...JSON.parse(JSON.stringify(comision)),
      Producto: productoSeleccionado ?? null,
      Monto: Number(monto) || 0,
      Cantidad: Number(comision.Cantidad) || 0,
    };
  } else {
    esNuevaComision.value = true;
    comisionEditada.value = {
      IdComision: null,
      Nombre: '',
      Cantidad: 1,
      Monto: 0.00,
      Porcentaje: '',
      Producto: null,
      Estado: true
    };
  }
  modoEdicion.value = true;
};

const cerrarModal = () => {
  modoEdicion.value = false;
  comisionEditada.value = null;
};

const guardarComision = async (comisionData) => {
  try {
    const data = {
      IdComision: comisionData.IdComision,
      Porcentaje: comisionData.Porcentaje,
      IdProducto: comisionData.Producto.IdProducto,
      Cantidad: comisionData.Cantidad
    };
    const response = esNuevaComision.value ? await AddComisiones(data) : await UpdateComision(data);
    await fetchAllData();
    cerrarModal();
    mostrarNotificacion(response.message);
  } catch (error) {
    console.error('Error al guardar la comisión:', error);
  }
};

const abrirModalConfirmacion = (comision) => {
  comisionParaAccion.value = comision;
  modalAct.value = true;
};

const cerrarModalConfirmacion = () => {
  modalAct.value = false;
  comisionParaAccion.value = null;
};

const confirmar = async () => {
  if (comisionParaAccion.value) {
    try {
      const response = await DeleteComision(comisionParaAccion.value.IdComision);
      await fetchAllData();
      cerrarModalConfirmacion();
      mostrarNotificacion(response.message);
    } catch (error) {
      console.error('Error al cambiar estado de la comisión:', error);
    }
  }
};

onMounted(fetchAllData);
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>