<template>
  <div class="min-h-screen p-6 space-y-8">
    <CategoriaHeader
      :categoriasActivos="categoriasActivos"
      :totalCategorias="categorias.length"
    />
    <CategoriaFilters
      v-model="filtros"
      :statusOptions="statusOptions"
      @nueva-categoria="abrirModalRegistro"
    />
    <CategoriaList
      :categorias="categoriasPaginados"
      :categoriaExpandido="categoriaExpandido"
      :contarSubCategorias="contarSubCategorias"
      :obtenerSubCategoria="obtenerSubCategoria"
      @toggle-subcategorias="toggleSubcategorias"
      @editar="abrirModalEdicion"
      @cambiar-estado="abrirModalActivarDesactivar"
    />
    <CategoriaPagination
      v-if="totalPaginas > 0"
      :totalPaginas="totalPaginas"
      v-model:paginaActual="paginaActual"
      :paginacionInfo="paginacionInfo"
      :visiblePages="visiblePages"
    />

    <CategoriaFormModal
      :show="mostrarModal"
      :esEdicion="esEdicion"
      :categoriaActual="categoriaActual"
      :errors="categoriaErrors"
      :previewUrl="previewUrl"
      @close="cerrarModal"
      @update:categoriaActual="categoriaActual = $event"
      @handle-image-upload="handleImageUpload"
      @agregar-subcategoria="agregarSubcategoriaAlModal"
      @toggle-subcategoria-estado="toggleSubcategoriaEstadoEnModal"
      @guardar="guardarCategoria"
      @validate="validateCategoriaField"
      @update:subcategoria="updateSubcategoria"
      @validate-subcategoria="validateSubcategoria"
    />

    <ConfirmacionModal
      :show="modalActivarDesactivar"
      :title="categoriaActual.Estado?.IdEstado === 1 ? '¿Desactivar Categoría?' : '¿Activar Categoría?'"
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

    <div v-if="showToast" class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in">
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
import CategoriaHeader from './CategoriaHeader.vue';
import CategoriaFilters from './CategoriaFilters.vue';
import CategoriaList from './CategoriaList.vue';
import CategoriaPagination from './CategoriaPagination.vue';
import CategoriaFormModal from './CategoriaFormModal.vue';
import { SubirFoto } from '@/Server/Foto';
import { listarCategorias, RegistrarCategoria, UpdateCategoria, DeleteCategoria } from '@/Server/Categoria';

const categorias = ref([]);
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
const paginaActual = ref(1);
const itemsPorPagina = ref(6);
const categoriaExpandido = ref(null);
const archivo = ref(null);
const previewUrl = ref(null);

const categoriaActual = ref({ IdCategoria: null, Nombre: '', Estado: { IdEstado: 1 }, Imagen: { IdImagen: null, Url: '' }, Subcategoria: [] });
const subcategoriasOriginales = ref([]);

const categoriaErrors = reactive({
  nombre: '',
  subcategorias: []
});

const validateCategoriaField = (field, value, allCategorias = [], isEditing = false, currentCategoriaId = null) => {
  let error = '';
  switch (field) {
    case 'nombre':
      if (!value) error = 'El nombre es requerido.';
      else if (value.length > 50) error = 'El nombre no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z\s]*$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      else {
        const lowerCaseValue = value.toLowerCase();
        const isDuplicate = allCategorias.some(cat => {
          if (isEditing && cat.IdCategoria === currentCategoriaId) {
            return false;
          }
          return cat.Nombre.toLowerCase() === lowerCaseValue;
        });
        if (isDuplicate) error = 'Ya existe una categoría con este nombre.';
      }
      break;
    default:
      break;
  }
  categoriaErrors.nombre = error;
  return error;
};

const validateSubcategoriaField = (field, value, allSubcategorias = [], isEditingIndex = null) => {
  let error = '';
  switch (field) {
    case 'nombre':
      if (!value) error = 'El nombre de la subcategoría es requerido.';
      else if (value.length > 50) error = 'El nombre no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z\s]*$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      else {
        const lowerCaseValue = value.toLowerCase();
        const isDuplicate = allSubcategorias.some((sub, index) => {
          if (isEditingIndex !== null && index === isEditingIndex) {
            return false;
          }
          return sub.Nombre.toLowerCase() === lowerCaseValue;
        });
        if (isDuplicate) error = 'Ya existe una subcategoría con este nombre.';
      }
      break;
    default:
      break;
  }
  return error;
};

const validateCategoriaForm = () => {
  categoriaErrors.nombre = '';
  categoriaErrors.subcategorias = [];

  let isValid = true;

  categoriaErrors.nombre = validateCategoriaField('nombre', categoriaActual.value.Nombre, categorias.value, esEdicion.value, categoriaActual.value.IdCategoria);
  if (categoriaErrors.nombre) isValid = false;

  categoriaActual.value.Subcategoria.forEach((sub, index) => {
    const subError = validateSubcategoriaField('nombre', sub.Nombre, categoriaActual.value.Subcategoria, index);
    if (subError) {
      categoriaErrors.subcategorias[index] = subError;
      isValid = false;
    } else {
      categoriaErrors.subcategorias[index] = '';
    }
  });

  return isValid;
};

const categoriasActivos = computed(() => categorias.value.filter(r => r.Estado.IdEstado === 1).length);

const categoriasFiltrados = computed(() => {
  let resultado = categorias.value;
  if (filtros.value.Nombre) {
    resultado = resultado.filter(c => c.Nombre.toLowerCase().includes(filtros.value.Nombre.toLowerCase()));
  }
  if (filtros.value.estado !== 'Todos') {
    const estadoId = filtros.value.estado === 'Activo' ? 1 : 2;
    resultado = resultado.filter(c => c.Estado.IdEstado === estadoId);
  }
  return resultado;
});

const totalPaginas = computed(() => {
  return Math.ceil(categoriasFiltrados.value.length / itemsPorPagina.value)
});

const categoriasPaginados = computed(() => {
  const start = (paginaActual.value - 1) * itemsPorPagina.value;
  const end = start + itemsPorPagina.value;
  return categoriasFiltrados.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = categoriasFiltrados.value.length;
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

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3000);
};

const ListarCategorias = async () => {
  try {
    categorias.value = await listarCategorias();
  } catch (error) {
    showToastMessage("Error al cargar las categorías.");
  }
};

const limpiarFormularioModal = () => {
  categoriaActual.value = { IdCategoria: null, Nombre: '', Estado: { IdEstado: 1 }, Imagen: { IdImagen: null, Url: '' }, Subcategoria: [] };
  subcategoriasOriginales.value = [];
  archivo.value = null;
  previewUrl.value = null;
};

const abrirModalRegistro = () => {
  esEdicion.value = false;
  limpiarFormularioModal();
  categoriaErrors.nombre = '';
  categoriaErrors.subcategorias = [];
  mostrarModal.value = true;
};

const abrirModalEdicion = (categoria) => {
  esEdicion.value = true;
  limpiarFormularioModal();
  categoriaActual.value = JSON.parse(JSON.stringify(categoria));
  if (!categoriaActual.value.Subcategoria) {
      categoriaActual.value.Subcategoria = [];
  }
  subcategoriasOriginales.value = JSON.parse(JSON.stringify(categoria.Subcategoria || []));
  if(categoria.Imagen && categoria.Imagen.Url) previewUrl.value = categoria.Imagen.Url;
  categoriaErrors.nombre = '';
  categoriaErrors.subcategorias = [];
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  limpiarFormularioModal();
  categoriaErrors.nombre = '';
  categoriaErrors.subcategorias = [];
};

const handlePhotoUpload = async () => {
  if (!archivo.value) return;
  try {
    const imageUrl = await SubirFoto(archivo.value);
    if (!categoriaActual.value.Imagen) categoriaActual.value.Imagen = {};
    categoriaActual.value.Imagen.Url = imageUrl;
  } catch (error) {
    showToastMessage('No se pudo subir la imagen.');
  }
};

const agregarSubcategoriaAlModal = () => {
    if (!Array.isArray(categoriaActual.value.Subcategoria)) {
        categoriaActual.value.Subcategoria = [];
    }
    categoriaActual.value.Subcategoria.push({ IdSubCategoria: null, Nombre: '', Estado: { IdEstado: 1 } });
};

const toggleSubcategoriaEstadoEnModal = (index) => {
    const sub = categoriaActual.value.Subcategoria[index];
    if (sub.IdSubCategoria) {
        sub.Estado.IdEstado = sub.Estado.IdEstado === 1 ? 2 : 1;
    } else {
        categoriaActual.value.Subcategoria.splice(index, 1);
    }
};

const guardarCategoria = async () => {
  if (!validateCategoriaForm()) {
    showToastMessage('Por favor, corrija los errores en el formulario.', 'error');
    return;
  }
  
  await handlePhotoUpload();

  const catDato = {
    IdCategoria: categoriaActual.value.IdCategoria,
    Nombre: categoriaActual.value.Nombre,
    Url: categoriaActual.value.Imagen?.Url,
    IdImagen: categoriaActual.value.Imagen?.IdImagen,
    Subcategoria: categoriaActual.value.Subcategoria?.map(sub => ({
      IdSubCategoria: sub.IdSubCategoria,
      Nombre: sub.Nombre,
      IdEstado: sub.Estado?.IdEstado
    }))
  };

  try {
    const response = esEdicion.value ? await UpdateCategoria(catDato) : await RegistrarCategoria(catDato);
    
    showToastMessage(response.message || 'Operación completada');
    await ListarCategorias();
    cerrarModal();
  } catch (error) {
    showToastMessage("Error al guardar la categoría o sus subcategorías.");
  }
};

const toggleSubcategorias = (id) => {
  categoriaExpandido.value = categoriaExpandido.value === id ? null : id;
};

const abrirModalActivarDesactivar = (categoria) => {
  categoriaActual.value = { ...categoria };
  modalActivarDesactivar.value = true;
};

const confirmarActivacionDesactivacion = async () => {
    try {
        const response = await DeleteCategoria(categoriaActual.value.IdCategoria);
        showToastMessage(response.message);
        await ListarCategorias();
    } catch (error) {
        showToastMessage("Error al cambiar el estado de la categoría.");
    }
    modalActivarDesactivar.value = false;
};

const contarSubCategorias = (sub) => sub?.length || 0;
const obtenerSubCategoria = (sub) => sub?.filter(s => s.Estado.IdEstado === 1) || [];

const updateSubcategoria = ({ index, value }) => {
  categoriaActual.value.Subcategoria[index].Nombre = value;
};

const validateSubcategoria = ({ index, value }) => {
  categoriaErrors.subcategorias[index] = validateSubcategoriaField('nombre', value, categoriaActual.value.Subcategoria, index);
};

onMounted(ListarCategorias);

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