<template>
  <div class="min-h-screen p-6 space-y-8">
    <MedidaHeader
      :categoriasActivas="categoriasActivas"
      :totalCategorias="categoriasMedida.length"
    />
    <MedidaFilters
      v-model="filtros"
      :statusOptions="statusOptions"
      @nueva-medida="abrirModalRegistro"
    />
    <MedidaList
      :categorias="categoriasPaginadas"
      :categoriaExpandido="categoriaExpandido"
      :contarUnidades="contarUnidades"
      :obtenerUnidades="obtenerUnidades"
      :quitarDecimalesCero="quitarDecimalesCero"
      @toggle-unidades="toggleUnidades"
      @editar="abrirModalEdicion"
      @cambiar-estado="abrirModalActivarDesactivar"
    />
    <MedidaPagination
      v-if="totalPaginas > 0"
      :totalPaginas="totalPaginas"
      v-model:paginaActual="paginaActual"
      :paginacionInfo="paginacionInfo"
      :visiblePages="visiblePages"
    />

    <MedidaFormModal
      :show="mostrarModal"
      :esEdicion="esEdicion"
      :categoriaActual="categoriaActual"
      :errors="errors"
      :unidadErrors="unidadErrors"
      :isSaving="isSaving"
      @close="cerrarModal"
      @update:categoriaActual="categoriaActual = $event"
      @agregar-unidad="agregarUnidadAlModal"
      @toggle-unidad-estado="toggleUnidadEstadoEnModal"
      @guardar="guardarCategoriaMedida"
      @validate-categoria="validateCategoriaField"
      @update:unidad="updateUnidad"
      @validate-unidad="validateUnidad"
    />

    <ConfirmacionModal
      :show="modalActivarDesactivar"
      :title="categoriaActual.Estado?.IdEstado === 1 ? '¿Desactivar Medida?' : '¿Activar Medida?'"
      :confirmText="categoriaActual.Estado?.IdEstado === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="categoriaActual.Estado?.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-10 w-10 text-orange-500"
      @confirm="confirmarActivacionDesactivacion"
      @cancel="modalActivarDesactivar = false"
    >
      ¿Está seguro de que desea {{ categoriaActual.Estado?.IdEstado === 1 ? 'desactivar' : 'activar' }} la categoría <span class="font-semibold">{{ categoriaActual.Nombre }}</span>?
    </ConfirmacionModal>

    <div
      v-if="showToast"
      class="fixed top-6 right-6 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
      :class="{
        'bg-green-500': toastType === 'success',
        'bg-red-500': toastType === 'error'
      }"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import {
  AlertTriangle, CheckCircle
} from 'lucide-vue-next';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';
import MedidaHeader from './MedidaHeader.vue';
import MedidaFilters from './MedidaFilters.vue';
import MedidaList from './MedidaList.vue';
import MedidaPagination from './MedidaPagination.vue';
import MedidaFormModal from './MedidaFormModal.vue';
import { listarMedidas, RegistrarCategoriaMedida, UpdateCategoriaMedida, DeleteCategoriaMedida } from '@/Server/Medida';

const categoriasMedida = ref([]);
const filtros = ref({ Nombre: '', estado: 'Todos' });
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
const toastType = ref('success');
const isSaving = ref(false);
const paginaActual = ref(1);
const itemsPorPagina = ref(6);
const categoriaExpandido = ref(null);

const categoriaActual = ref({ IdCategoriaMedida: null, Nombre: '', Estado: { IdEstado: 1 }, Unidadmedida: [] });
const unidadesOriginales = ref([]);

const errors = reactive({
  nombre: '',
});

const unidadErrors = reactive({});

const validateCategoriaField = (field, value, allCategories = [], isEditing = false, currentCategoryId = null) => {
  let error = '';
  switch (field) {
    case 'nombre':
      if (!value) error = 'El nombre de la categoría es requerido.';
      else if (value.length > 50) error = 'El nombre no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z\s]*$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      else {
        const lowerCaseValue = value.toLowerCase();
        const isDuplicate = allCategories.some(cat => {
          if (isEditing && cat.IdCategoriaMedida === currentCategoryId) {
            return false;
          }
          return cat.Nombre.toLowerCase() === lowerCaseValue;
        });
        if (isDuplicate) error = 'Ya existe una categoría de medida con este nombre.';
      }
      break;
    default:
      break;
  }
  errors.nombre = error;
  return error;
};

const validateUnidadField = (index, field, value, allUnits = []) => {
  const lowerCaseValue = value ? String(value).toLowerCase() : '';
  const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);

  if (field === 'nombre') {
    if (!value) return 'El nombre de la unidad es requerido.';
    if (value.length > 50) return 'El nombre no puede tener más de 50 caracteres.';
    if (!/^[a-zA-Z\s]*$/.test(value)) return 'El nombre solo puede contener letras y espacios.';
  } else if (field === 'abreviatura') {
    if (!value) return 'La abreviatura es requerida.';
    if (value.length > 10) return 'La abreviatura no puede tener más de 10 caracteres.';
    if (!/^[a-zA-Z]*$/.test(value)) return 'La abreviatura solo puede contener letras.';
  } else if (field === 'cantidad') {
    if (value === null || value === undefined || value <= 0) return 'La cantidad debe ser mayor que 0.';
    return '';
  }

  const duplicateInForm = allUnits.find((unit, idx) => 
    idx !== index && unit[capitalizedField] && String(unit[capitalizedField]).toLowerCase() === lowerCaseValue
  );
  if (duplicateInForm) {
    return `La ${field} no puede estar duplicada en la misma categoría.`;
  }

  const currentUnit = allUnits[index];
  const isDuplicateGlobally = categoriasMedida.value.some(cat => 
    cat.Unidadmedida && cat.Unidadmedida.some(unit => {
      if (unit[capitalizedField] && String(unit[capitalizedField]).toLowerCase() === lowerCaseValue) {
        if (esEdicion.value && currentUnit && currentUnit.IdUnidadMedida) {
          return unit.IdUnidadMedida !== currentUnit.IdUnidadMedida;
        }
        return true;
      }
      return false;
    })
  );

  if (isDuplicateGlobally) {
    return `La ${field} '${value}' ya existe en el sistema.`;
  }

  return '';
};

const validateForm = () => {
  errors.nombre = validateCategoriaField('nombre', categoriaActual.value.Nombre, categoriasMedida.value, esEdicion.value, categoriaActual.value.IdCategoriaMedida);

  let allUnitsValid = true;
  categoriaActual.value.Unidadmedida.forEach((unidad, index) => {
    unidadErrors[index] = {
      nombre: validateUnidadField(index, 'nombre', unidad.Nombre, categoriaActual.value.Unidadmedida),
      abreviatura: validateUnidadField(index, 'abreviatura', unidad.Abreviatura, categoriaActual.value.Unidadmedida),
      cantidad: validateUnidadField(index, 'cantidad', unidad.Cantidad, categoriaActual.value.Unidadmedida),
    };
    if (Object.values(unidadErrors[index]).some(error => error !== '')) {
      allUnitsValid = false;
    }
  });

  return Object.values(errors).every(error => !error) && allUnitsValid;
};

const quitarDecimalesCero = (valor) => {
  return Number(valor).toString();
};

const categoriasActivas = computed(() => categoriasMedida.value.filter(r => r.Estado.IdEstado === 1).length);

const categoriasFiltradas = computed(() => {
  let resultado = categoriasMedida.value;
  if (filtros.value.Nombre) {
    resultado = resultado.filter(c => c.Nombre.toLowerCase().includes(filtros.value.Nombre.toLowerCase()));
  }
  if (filtros.value.estado !== 'Todos') {
    const estadoId = filtros.value.estado === 'Activo' ? 1 : 2;
    resultado = resultado.filter(c => c.Estado.IdEstado === estadoId);
  }
  return resultado;
});

const totalPaginas = computed(() => Math.ceil(categoriasFiltradas.value.length / itemsPorPagina.value));

const categoriasPaginadas = computed(() => {
  const start = (paginaActual.value - 1) * itemsPorPagina.value;
  const end = start + itemsPorPagina.value;
  return categoriasFiltradas.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = categoriasFiltradas.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPorPagina.value + 1;
  const fin = Math.min(inicio + itemsPorPagina.value - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} categorías`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3000);
};

const ListarCategoriasMedida = async () => {
  try {
    categoriasMedida.value = await listarMedidas();
  } catch (error) {
    showToastMessage("Error al cargar las categorías de medida.", 'error');
  }
};

const limpiarFormularioModal = () => {
  categoriaActual.value = { IdCategoriaMedida: null, Nombre: '', Estado: { IdEstado: 1 }, Unidadmedida: [] };
  unidadesOriginales.value = [];
  Object.keys(errors).forEach(key => errors[key] = '');
  Object.keys(unidadErrors).forEach(key => delete unidadErrors[key]);
};

const abrirModalRegistro = () => {
  esEdicion.value = false;
  limpiarFormularioModal();
  mostrarModal.value = true;
};

const abrirModalEdicion = (categoria) => {
  esEdicion.value = true;
  limpiarFormularioModal();
  categoriaActual.value = JSON.parse(JSON.stringify(categoria));
  if (!categoriaActual.value.Unidadmedida) {
      categoriaActual.value.Unidadmedida = [];
  }
  categoriaActual.value.Unidadmedida.forEach((unidad, index) => {
    if (unidad.Cantidad) {
        unidad.Cantidad = Number(unidad.Cantidad);
    }
    unidadErrors[index] = {
      nombre: '',
      abreviatura: '',
      cantidad: '',
    };
  });
  unidadesOriginales.value = JSON.parse(JSON.stringify(categoria.Unidadmedida || []));
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  limpiarFormularioModal();
};

const agregarUnidadAlModal = () => {
    if (!Array.isArray(categoriaActual.value.Unidadmedida)) {
        categoriaActual.value.Unidadmedida = [];
    }
    const newIndex = categoriaActual.value.Unidadmedida.length;
    categoriaActual.value.Unidadmedida.push({ IdUnidadMedida: null, Nombre: '', Abreviatura: '', Cantidad: 1, Estado: { IdEstado: 1 } });
    unidadErrors[newIndex] = { nombre: '', abreviatura: '', cantidad: '' };
};

const toggleUnidadEstadoEnModal = (index) => {
    const unidad = categoriaActual.value.Unidadmedida[index];
    if (unidad.IdUnidadMedida) {
        unidad.Estado.IdEstado = unidad.Estado.IdEstado === 1 ? 2 : 1;
    } else {
        categoriaActual.value.Unidadmedida.splice(index, 1);
        delete unidadErrors[index];
        const newUnidadErrors = {};
        categoriaActual.value.Unidadmedida.forEach((_, newIdx) => {
          if (unidadErrors[newIdx] !== undefined) {
            newUnidadErrors[newIdx] = unidadErrors[newIdx];
          }
        });
        Object.assign(unidadErrors, newUnidadErrors);
    }
};

const guardarCategoriaMedida = async () => {
  if (!validateForm()) {
    showToastMessage('Por favor, corrija los errores en el formulario.', 'error');
    return;
  }
  
  isSaving.value = true;
  const catDato = {
      IdCategoriaMedida: categoriaActual.value.IdCategoriaMedida,
      Nombre: categoriaActual.value.Nombre,
      Unidadmedida: categoriaActual.value.Unidadmedida?.map(u => ({
        IdUnidadMedida: u.IdUnidadMedida,
        Nombre: u.Nombre,
        Abreviatura: u.Abreviatura,
        Cantidad: u.Cantidad,
        IdEstado: u.Estado?.IdEstado
      }))
  };

  try {
    const response = esEdicion.value ? await UpdateCategoriaMedida(catDato) : await RegistrarCategoriaMedida(catDato);
    showToastMessage(response.message || 'Operación completada', 'success');
    await ListarCategoriasMedida();
    cerrarModal();
  } catch (error) {
    showToastMessage("Error al guardar la categoría de medida.", 'error');
  } finally {
    isSaving.value = false;
  }
};

const toggleUnidades = (id) => {
  categoriaExpandido.value = categoriaExpandido.value === id ? null : id;
};

const abrirModalActivarDesactivar = (categoria) => {
  categoriaActual.value = { ...categoria };
  modalActivarDesactivar.value = true;
};

const confirmarActivacionDesactivacion = async () => {
    try {
        const response = await DeleteCategoriaMedida(categoriaActual.value.IdCategoriaMedida);
        showToastMessage(response.message, 'success');
        await ListarCategoriasMedida();
    } catch (error) {
        showToastMessage("Error al cambiar el estado de la categoría.", 'error');
    }
    modalActivarDesactivar.value = false;
};

const contarUnidades = (unidades) => unidades?.length || 0;
const obtenerUnidades = (unidades) => unidades?.filter(u => u.Estado.IdEstado === 1) || [];

const updateUnidad = ({ index, field, value }) => {
  categoriaActual.value.Unidadmedida[index][field] = value;
};

const validateUnidad = ({ index, field }) => {
  const unidad = categoriaActual.value.Unidadmedida[index];
  unidadErrors[index][field] = validateUnidadField(index, field, unidad[field], categoriaActual.value.Unidadmedida);
};

onMounted(ListarCategoriasMedida);

</script>

<style scoped>
.animate-fade-in { animation: fade-in 0.3s ease-out; }
@keyframes fade-in { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.animate-slide-in { animation: slide-in 0.3s ease-out; }
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #fdba74, #f97316); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #f97316, #ea580c); }
</style>