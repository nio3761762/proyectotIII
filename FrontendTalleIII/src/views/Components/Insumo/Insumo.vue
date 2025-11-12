<template>
  <div class="min-h-screen ">
    
    <!-- Insumo Management View  -->
    <div v-if="currentView === 'list'">
      <InsumoHeader @open-add-product-modal="openAddProductoModal" />

      <InsumoFilters :searchQuery="searchQuery" @update:searchQuery="searchQuery = $event" @open-add-product-modal="openAddProductoModal" />

      <InsumoList
        :paginatedInsumos="paginatedInsumos"
        :expandedInsumos="expandedInsumos"
        @toggle-details="toggleDetails"
        @edit-product="EditarProducto"
        @delete-product="eliminarProducto"
        @open-add-product-modal="openAddProductoModal"
      />

      <InsumoPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        :paginacionInfo="paginacionInfo"
        @update:currentPage="currentPage = $event"
      />
    </div>

    <!-- Product Add/Edit View -->
    <div v-if="currentView === 'form'">
      <InsumoForm
        :esEdicionProducto="esEdicionProducto"
        :newProducto="newProducto"
        :errors="errors"
        :marcas="marcas"
        :categorias="categorias"
        :selectedCategoria="selectedCategoria"
        :subcategoria="subcategoria"
        :previewUrl="previewUrl"
        :nuevaMedida="nuevaMedida"
        :medidaErrors="medidaErrors"
        :categoriaMedidas="categoriaMedidas"
        :selectedCategoriaMedida="selectedCategoriaMedida"
        :medidas="medidas"
        :medidaEnEdicionIndex="medidaEnEdicionIndex"
        @update:newProducto="newProducto = $event"
        @update:selectedCategoria="selectedCategoria = $event"
        @validate-field="validateFieldWrapper"
        @handle-archivo="handleArchivo"
        @update:nuevaMedida="nuevaMedida = $event"
        @update:selectedCategoriaMedida="selectedCategoriaMedida = $event"
        @validate-medida-field="validateMedidaFieldWrapper"
        @add-measure="agregarMedida"
        @edit-measure="EditarMedida"
        @cancel-edit-measure="cancelarEdicionMedida"
        @delete-measure="eliminarMedida"
        @close-product-modal="closeProductModal"
        @save-product="guardarProducto"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmacionModal
      :show="showDeleteModal"
      :title="productoAEliminar?.Estado?.IdEstado === 1 ? '¿Desactivar Insumo?' : '¿Activar Insumo?'"
      :confirmText="productoAEliminar?.Estado?.IdEstado === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="productoAEliminar?.Estado?.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-10 w-10 text-orange-500"
      @confirm="confirmarEliminacion"
      @cancel="closeDeleteModal"
    >
      ¿Está seguro de que desea {{ productoAEliminar?.Estado?.IdEstado === 1 ? 'desactivar' : 'activar' }} el insumo
      <span class="font-semibold text-gray-800">{{ productoAEliminar?.Nombre }}</span>?
    </ConfirmacionModal>

    <!-- Toast -->
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
import { ref, onMounted, watch, computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { AlertTriangle, CheckCircle } from 'lucide-vue-next';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';
import InsumoHeader from './InsumoHeader.vue';
import InsumoFilters from './InsumoFilters.vue';
import InsumoList from './InsumoList.vue';
import InsumoPagination from './InsumoPagination.vue';
import InsumoForm from './/InsumoForm.vue';

import { listarInsumos, crearInsumo, actualizarInsumo, eliminarInsumo } from '@/Server/Insumo';
import { listarCategorias, listarSubCategorias, ObtenerCategoria, ObtenerSubCategorias} from '@/Server/Categoria';
import { ObtenerMedidas, listarCategoriaMedidas, ObtenrCategoriaMedida } from '@/Server/Medida';
import { getMarcas } from '@/Server/Marca';
import { SubirFoto } from '@/Server/api';

const route = useRoute();
const currentView = ref('list'); // 'list' or 'form'

// Modal visibility states
const esEdicionProducto = ref(false);
const showDeleteModal = ref(false);
const productoAEliminar = ref(null);
const marcas = ref([]);

// Main data refs
const insumos = ref([]);
const categorias = ref([]);
const subcategoria = ref([]);
const fullSubcategoryList = ref([]);
const medidas = ref([]);
const categoriaMedidas = ref([]);

// Search and Pagination
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 8;
const expandedInsumos = ref({});

const toggleDetails = (id) => {
  expandedInsumos.value[id] = !expandedInsumos.value[id];
};
const quitarDecimalesCero = (valor) => {
  return Number(valor).toString();
};

const validateField = (field, value, allInsumos = [], isEditing = false, currentInsumoId = null) => {
  let error = '';
  switch (field) {
    case 'nombre':
      if (!value) error = 'El nombre es requerido.';
      else if (value.length > 50) error = 'El nombre no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z0-9\s]*$/.test(value)) error = 'El nombre solo puede contener letras, números y espacios.';
      else {
        const lowerCaseValue = value.toLowerCase();
        const isDuplicate = allInsumos.some(ins => {
          if (isEditing && ins.IdProducto === currentInsumoId) {
            return false;
          }
          return ins.Nombre.toLowerCase() === lowerCaseValue;
        });
        if (isDuplicate) error = 'Ya existe un insumo con este nombre.';
      }
      break;
    case 'descripcion':
      if (!value) error = 'La descripción es requerida.';
      break;
    case 'subcategoria':
      if (!value) error = 'La subcategoría es requerida.';
      break;
    case 'marca':
      if (!value) error = 'La marca es requerida.';
      break;
    case 'medidas':
      if (!value || value.length === 0) error = 'Debe agregar al menos una medida.';
      break;
    default:
      break;
  }
  return error;
};

const validateMedidaField = (field, value) => {
  let error = '';
  switch (field) {
    case 'idUnidadMedida':
      if (!value) error = 'La unidad de medida es requerida.';
      break;
    case 'precio':
      if (value === null || value === undefined || value <= 0) error = 'El precio debe ser mayor que 0.';
      break;
    case 'precioMayor':
      if (value === null || value === undefined || value <= 0) error = 'El precio por mayor debe ser mayor que 0.';
      break;
    case 'cantidad':
      if (value === null || value === undefined || value <= 0) error = 'La cantidad debe ser mayor que 0.';
      break;
    case 'categoriaMedida':
      if (!value) error = 'La categoría de medida es requerida.';
      break;
    default:
      break;
  }
  return error;
};

const validateFieldWrapper = (field, value) => {
  errors[field] = validateField(field, value, insumos.value, esEdicionProducto.value, newProducto.value.IdProducto);
};

const validateMedidaFieldWrapper = (field, value) => {
  medidaErrors[field] = validateMedidaField(field, value);
};

const validateForm = () => {
  errors.nombre = validateField('nombre', newProducto.value.Nombre, insumos.value, esEdicionProducto.value, newProducto.value.IdProducto);
  errors.descripcion = validateField('descripcion', newProducto.value.Descripcion);
  errors.subcategoria = validateField('subcategoria', newProducto.value.IdSubCategoria);
  errors.marca = validateField('marca', newProducto.value.IdMarca);
  errors.medidas = validateField('medidas', newProducto.value.Productomedida);

  return Object.values(errors).every(error => !error);
};

const validateMedidaForm = () => {
  medidaErrors.categoriaMedida = validateMedidaField('categoriaMedida', selectedCategoriaMedida.value);
  medidaErrors.idUnidadMedida = validateMedidaField('idUnidadMedida', nuevaMedida.value.IdUnidadMedida);
  medidaErrors.precio = validateMedidaField('precio', nuevaMedida.value.Precio);
  medidaErrors.precioMayor = validateMedidaField('precioMayor', nuevaMedida.value.PrecioMayor);
  medidaErrors.cantidad = validateMedidaField('cantidad', nuevaMedida.value.Cantidad);

  return Object.values(medidaErrors).every(error => !error);
};



// Product form refs
const initialProduct = {
  IdProducto: '',
  Nombre: '',
  Descripcion: '',
  IdSubCategoria: '',
  IdMarca: '',
  Url: '',
  IdImagen: '',
  Productomedida: [],
  FechaVencimiento: ''
};

// Validation errors
const errors = reactive({
  nombre: '',
  descripcion: '',
  subcategoria: '',
  marca: '',
  medidas: '', // For the array of product measures
});

const medidaErrors = reactive({
  idUnidadMedida: '',
  precio: '',
  precioMayor: '',
  cantidad: '',
  categoriaMedida: '',
});
const newProducto = ref({ ...initialProduct });
const initialMedida = {
    IdProductomedida:'',
    IdUnidadMedida: '',
    Abreviatura:'',
    Precio: 0,
    PrecioMayor: 0,
    Cantidad: 0,
    CantidadGastada: 0
};
const nuevaMedida = ref({...initialMedida});
const selectedCategoria = ref('');
const selectedCategoriaMedida = ref('');
const archivo = ref(null);
const previewUrl = ref('');
const medidaEnEdicionIndex = ref(null);

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('success');

// Computed properties for filtering and pagination
const filteredInsumos = computed(() => {
  if (!searchQuery.value) {
    return insumos.value;
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return insumos.value.filter(insumo => 
    insumo.Nombre.toLowerCase().includes(lowerCaseQuery) ||
    insumo.Descripcion.toLowerCase().includes(lowerCaseQuery)
  );
});

const totalPages = computed(() => Math.ceil(filteredInsumos.value.length / itemsPerPage));

const paginatedInsumos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredInsumos.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = filteredInsumos.value.length;
  const inicio = total === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} insumos`;
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    let start = Math.max(2, currentPage.value - 2);
    let end = Math.min(total - 1, currentPage.value + 2);

    if (currentPage.value > 4) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage.value < total - 3) {
      pages.push('...');
    }
    pages.push(total);
  }
  return pages;
});


// Watchers
watch(selectedCategoria, async (newVal) => {
  if (newVal) {
    newProducto.value.IdSubCategoria = '';
    await obtenersubcategoria(newVal);
  } else {
    subcategoria.value = [];
  }
});

watch(selectedCategoriaMedida, async (newVal) => {  
  if (newVal) {
      nuevaMedida.value.IdUnidadMedida = '';
     await obtenerMedidas(newVal);
  } else {
    medidas.value = [];
  }
});

// Data Fetching Functions
const fetchinsumos = async () => { try { insumos.value = await listarInsumos();  console.log(insumos.value) } catch (e) { console.error(e); } };
// esto devuelve el backend al metodo listarInsumo
// [
//     {
//         "IdProducto": "09212025PROD-1",
//         "Nombre": "Harina",
//         "Descripcion": "Harina",
//         "FechaRegistro": "2025-09-21",
//         "HoraRegistro": null,
//         "Fechaactualizacion": null,
//         "FechaVencimiento": null,
//         "StockMinimo": null,
//         "Estado": {
//             "IdEstado": 1,
//             "Nombre": "Activo"
//         },
//         "Marca": {
//             "IdMarca": "MRC-2",
//             "Nombre": "Emapa"
//         },
//         "Tipoproducto": {
//             "IdTipoProducto": "ITP-1",
//             "Nombre": "Insumo"
//         },
//         "Subcategoria": {
//             "IdSubCategoria": "09212025SCT-1",
//             "Nombre": "Insumos",
//             "Categoria": {
//                 "IdCategoria": "09212025CAT-1",
//                 "Nombre": "Alimentos",
//                 "FechaRegistro": "2025-09-21",
//                 "FechaActualizacion": null
//             }
//         },
//         "Imagen": {
//             "IdImagen": "09212025IMG-1",
//             "Url": "http://localhost:3000/uploads/1758491864845.jpeg"
//         },
//         "Productomedida": [
//             {
//                 "IdProductoMedida": "09212025PM-21",
//                 "FechaRegistro": "2025-10-03",
//                 "Cantidad": "100.000",
//                 "PrecioVenta": "1.00",
//                 "PrecioMayor": "0.10",
//                 "Unidadmedida": {
//                     "IdUnidadMedida": 1,
//                     "Nombre": "Kilogramo",
//                     "Abreviatura": "Kg",
//                     "Cantidad": "1.000",
//                     "FechaRegistro": "2025-07-13",
//                     "Categoria": {
//                         "IdCategoriaMedida": "CTM-2",
//                         "Nombre": "Peso",
//                         "FechaRegistro": "2025-08-29",
//                         "FechaActualizacion": "2025-10-13"
//                     }
//                 }
//             }
//         ]
//     },
//     {
//         "IdProducto": "10082025PROD-1",
//         "Nombre": "Leche",
//         "Descripcion": "Leche",
//         "FechaRegistro": "2025-10-08",
//         "HoraRegistro": null,
//         "Fechaactualizacion": null,
//         "FechaVencimiento": null,
//         "StockMinimo": null,
//         "Estado": {
//             "IdEstado": 1,
//             "Nombre": "Activo"
//         },
//         "Marca": {
//             "IdMarca": "MRC-1",
//             "Nombre": "Famosa"
//         },
//         "Tipoproducto": {
//             "IdTipoProducto": "ITP-1",
//             "Nombre": "Insumo"
//         },
//         "Subcategoria": {
//             "IdSubCategoria": "09212025SCT-1",
//             "Nombre": "Insumos",
//             "Categoria": {
//                 "IdCategoria": "09212025CAT-1",
//                 "Nombre": "Alimentos",
//                 "FechaRegistro": "2025-09-21",
//                 "FechaActualizacion": null
//             }
//         },
//         "Imagen": null,
//         "Productomedida": [
//             {
//                 "IdProductoMedida": "10082025PM-1",
//                 "FechaRegistro": "2025-10-08",
//                 "Cantidad": "1.000",
//                 "PrecioVenta": "8.00",
//                 "PrecioMayor": "7.00",
//                 "Unidadmedida": {
//                     "IdUnidadMedida": 4,
//                     "Nombre": "Litro",
//                     "Abreviatura": "Lt",
//                     "Cantidad": "1.000",
//                     "FechaRegistro": "2025-07-13",
//                     "Categoria": {
//                         "IdCategoriaMedida": "CTM-3",
//                         "Nombre": "Volumen",
//                         "FechaRegistro": "2025-08-29",
//                         "FechaActualizacion": "2025-10-13"
//                     }
//                 }
//             }
//         ]
//     }
// ]


const fetchCategorias = async () => { try { categorias.value = await listarCategorias(); } catch (e) { console.error(e); } };
const fetchCategoriaMedidas = async () => { try { categoriaMedidas.value = await listarCategoriaMedidas(); } catch (e) { console.error(e); } };
const obtenersubcategoria = async (id) => { try { subcategoria.value = await ObtenerSubCategorias(id); } catch (e) { console.error(e); } };
const obtenerMedidas = async (id) => { try { medidas.value = await ObtenerMedidas(id); } catch (e) { console.error(e); } };
const fetchAllSubcategories = async () => { try { fullSubcategoryList.value = await listarSubCategorias(); } catch(e) { console.error(e); }};
const ListarMarcas = async () => { try {marcas.value = await getMarcas();} catch (e) {console.error(e)}};

// Helper Functions
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const openAddProductoModal = () => {
  esEdicionProducto.value = false;
  newProducto.value = { ...initialProduct, Productomedida: [] };
  previewUrl.value = '';
  archivo.value = null;
  currentView.value = 'form';
  // Clear validation errors
  Object.keys(errors).forEach(key => errors[key] = '');
  Object.keys(medidaErrors).forEach(key => medidaErrors[key] = '');
};


const closeProductModal = () => {
    currentView.value = 'list';
}

const obtenerCategoria = async (Id) => {
  try {
    const response = await ObtenerCategoria(Id);
    selectedCategoria.value = response.IdCategoria;
  } catch (error) {
    console.error("Error al obtener los paquetes:", error);
  }
};

const EditarProducto = async (producto) => {
  esEdicionProducto.value = true;
  const productoToEdit = JSON.parse(JSON.stringify(producto));
  await obtenerCategoria(producto.Subcategoria.IdSubCategoria);
  await obtenersubcategoria(selectedCategoria.value);
  newProducto.value = {
     IdProducto:producto.IdProducto,
      Nombre: producto.Nombre,
      Descripcion: producto.Descripcion,
      IdSubCategoria: producto.Subcategoria.IdSubCategoria,
      IdMarca: producto.Marca.IdMarca,
      Url: producto?.Imagen?.Url,
      IdImagen:producto?.Imagen?.IdImagen,
    Productomedida: producto.Productomedida.map(pm => ({
      IdProductomedida: pm.IdProductoMedida,
      IdUnidadMedida: pm.Unidadmedida.IdUnidadMedida,
      Abreviatura: pm.Unidadmedida.Abreviatura,
      nombreCategoria:pm.Unidadmedida.Categoria.Nombre,
      nombreUnidad:pm.Unidadmedida.Nombre,
      Precio: pm.PrecioVenta,
      PrecioMayor: pm.PrecioMayor,
      Cantidad: pm.Cantidad
    }))
  }
  previewUrl.value = productoToEdit.Imagen?.Url || '';
  currentView.value = 'form';
};

// Product/Insumo Methods
const handleImageUpload = async () => {
  if (!archivo.value) return;
  try {
    const response = await SubirFoto(archivo.value);
    if (response) {
      newProducto.value.Url = response;
    }
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    showToastMessage('Error al subir la imagen', 'error');
  }
};

const guardarProducto = async () => {
    if (!validateForm()) {
        return;
    }
    try {
        await handleImageUpload();

        const datosProducto = {
            Nombre: newProducto.value.Nombre,
            Descripcion: newProducto.value.Descripcion,
            Url: newProducto.value?.Url,
            IdSubCategoria: newProducto.value.IdSubCategoria,
            IdImagen: newProducto.value?.IdImagen,
            IdTipo: 'ITP-1',
            IdMarca: newProducto.value.IdMarca,
            Productomedida: newProducto.value.Productomedida.map(pm => ({
                IdProductomedida: pm?.IdProductomedida,
                Precio: pm.Precio,
                PrecioMayor: pm.PrecioMayor,
                IdUnidadMedida: pm.IdUnidadMedida,
                Cantidad: pm.Cantidad
            }))
        };
        let response;  
        if (esEdicionProducto.value) {
          datosProducto.id = newProducto.value.IdProducto;
          response =  await actualizarInsumo(datosProducto);
        } else {
          response =  await crearInsumo(datosProducto);
        }

        await fetchinsumos();
        closeProductModal();
        showToastMessage(response.message, 'success');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      showToastMessage('Error al guardar el producto', 'error');
    }
};



const formatStock = (productomedida) => {
  if (!productomedida || productomedida.length === 0) {
    return 'Sin stock';
  }
  return productomedida.map(pm => `${pm.Stock} ${pm.Unidadmedida.Abreviatura}`).join(', ');
};

const eliminarProducto = (producto) => {
  productoAEliminar.value = producto;
  showDeleteModal.value = true;
};

const confirmarEliminacion = async () => {
  if (!productoAEliminar.value) return;
  try {
   const response = await eliminarInsumo(productoAEliminar.value.IdProducto);
    await fetchinsumos();
    showToastMessage(response.message, 'success');
  } catch (error) {
    console.error('Error changing product state:', error);
    showToastMessage('Error al cambiar el estado del producto', 'error');
  } finally {
    closeDeleteModal();
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  productoAEliminar.value = null;
};

// Medida Methods
const agregarMedida = () => {
    if (!validateMedidaForm()) {
        return;
    }
    const unit = medidas.value.find(m => m.IdUnidadMedida === nuevaMedida.value.IdUnidadMedida);
    const category = categoriaMedidas.value.find(c => c.IdCategoriaMedida === selectedCategoriaMedida.value);
    const medidaConNombres = {
        ...nuevaMedida.value,
        nombreUnidad: unit ? unit.Nombre : '?',
        Abreviatura: unit ? unit.Abreviatura : '?',
        nombreCategoria: category ? category.Nombre : '?'
    };
    if (medidaEnEdicionIndex.value !== null) {
        newProducto.value.Productomedida[medidaEnEdicionIndex.value] = medidaConNombres;
    } else {
        newProducto.value.Productomedida.push(medidaConNombres);
    }
    cancelarEdicionMedida();
};
const EditarMedida = async (index) => {
    medidaEnEdicionIndex.value = index;
    const medidaAEditar = newProducto.value.Productomedida[index];
    await obtenerCategoriaMedida(medidaAEditar.IdUnidadMedida);
    nuevaMedida.value = { ...medidaAEditar };
};
const cancelarEdicionMedida = () => {
    medidaEnEdicionIndex.value = null;
    nuevaMedida.value = { ...initialMedida };
    selectedCategoriaMedida.value = '';
};
const eliminarMedida = (index) => { newProducto.value.Productomedida.splice(index, 1); };
const obtenerCategoriaMedida = async (Id) => { try { const r = await ObtenrCategoriaMedida(Id); selectedCategoriaMedida.value = r.IdCategoriaMedida; } catch (e) { console.error(e); }};

// Helper Functions
const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
    const reader = new FileReader();
    reader.onload = (e) => { previewUrl.value = e.target.result; };
    reader.readAsDataURL(file);
  }
};

// Lifecycle Hook
onMounted(async () => {
  await Promise.all([
    fetchinsumos(),
    fetchCategorias(),
    fetchCategoriaMedidas(),
    fetchAllSubcategories(),
    ListarMarcas()
  ]);
  if (route.query.action === 'add') {
    openAddProductoModal();
  }
});
</script>

<style scoped>
.animate-slide-in {
  animation: slide-in-right 0.5s forwards;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
