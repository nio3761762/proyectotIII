<template>
  <div class="min-h-screen bg-gradient-to-br  relative overflow-hidden p-6">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- Vista Principal de Productos  -->
    <div v-if="!showRegistration">
      <ProductoHeader
        @open-add-modal="openAddModal"
        @export-pdf="exportarPDF"
      />

      <ProductoFilters
        v-model:searchQuery="searchQuery"
        :TIeneSucursal="TIeneSucursal"
        v-model:selectedTienda="selectedTienda"
        :sucursales="sucursales"
        v-model:filtroCategoria="filtroCategoria"
        :categorias="categorias"
        v-model:filtroSubcategoria="filtroSubcategoria"
        :subcategoriasParaFiltro="subcategoriasParaFiltro"
        v-model:selec="selec"
        @open-add-modal="openAddModal"
        @export-pdf="exportarPDF"
      />

      <ProductoList
        :selec="selec"
        :paginatedProductos="paginatedProductos"
        :paginatedPaquetes="paginatedPaquetes"
        :pp="pp"
        :expandedProducts="expandedProducts"
        :paquetesPorProducto="paquetesPorProducto"
        :calcularPaquetesPosibles="calcularPaquetesPosibles"
        :getPromocionesParaProducto="getPromocionesParaProducto"
        :promocionesPosiblesCalculadas="promocionesPosiblesCalculadas"
        :selectedTienda="selectedTienda"
        @open-photo-modal="openPhotoModal"
        @toggle-details="toggleDetails"
        @update-cantidad-producto-en-tienda="updateCantidadProductoEnTienda"
        @update-cantidad-producto="updateCantidadProducto"
        @open-edit-modal="openEditModal"
        @open-ingrediente-modal="openIngredienteModal"
        @open-presentations-modal-from-list="openPresentationsModalFromList"
        @abrir-modal-activar-desactivar="abrirModalActivarDesactivar"
        @open-add-modal="openAddModal"
      />

      <ProductoPagination
        :totalPages="totalPages"
        :totalPagesPaquetes="totalPagesPaquetes"
        v-model:currentPage="currentPage"
        :paginacionInfo="paginacionInfo"
        :paginacionInfoPaquetes="paginacionInfoPaquetes"
        :visiblePages="visiblePages"
        :selec="selec"
      />
    </div>

    <!-- Vista de Registro/Edición -->
    <div v-else>
      <ProductoFormHeader
        :esEdicion="esEdicion"
        @close-product-modal="closeProductModal"
      />

      <!-- Form -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <div class="space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Información Básica -->
              <ProductoBasicInfo
                v-model:neewProducto="neewProducto"
                :errors="errors"
                v-model:selectedCategoria="selectedCategoria"
                :categorias="categorias"
                :subcategoria="subcategoria"
                v-model:selectedCategoriaMedida="selectedCategoriaMedida"
                :categoriaMedidas="categoriaMedidas"
                :medidas="medidas"
                @validate-field="validateField"
              />

            <!-- GESTION DE PAQUETES (AHORA UN BOTON Y LISTA) -->
              <ProductoImageUpload
                :neewProducto="neewProducto"
                :previewUrl="previewUrl"
                @handle-archivo="handleArchivo"
                @open-photo-modal="openPhotoModal"
              />

          </div>

          <ProductoFormActions
            :esEdicion="esEdicion"
            @close-product-modal="closeProductModal"
            @guardar-producto="guardarProducto"
          />
        </div>
      </div>
    </div>  


        <ProductoPackageModal
          :show="showPaqueteModal"
          :productoParaPaquetes="productoParaPaquetes"
          :paqueteEnEdicionIndex="paqueteEnEdicionIndex"
          v-model:nuevoPaquete="nuevoPaquete"
          :paqueteErrors="paqueteErrors"
          :presentacion="presentacion"
          :paquetesEnModal="paquetesEnModal"
          v-model:selectedCategoriaMedidaPaquete="selectedCategoriaMedidaPaquete"
          :categoriaMedidas="categoriaMedidas"
          :medidasPaquete="medidasPaquete"
          :previewPaqueteUrl="previewPaqueteUrl"
          @close="showPaqueteModal = false"
          @cancelar-edicion-paquete="cancelarEdicionPaquete"
          @validate-paquete-field="validatePaqueteField"
          @handle-archivo-paquete="handleArchivoPaquete"
          @guardar-paquete="guardarPaquete"
          @editar-paquete="editarPaquete"
          @eliminar-paquete="eliminarPaquete"
          @guardar-cambios-de-paquetes="guardarCambiosDePaquetes"
        />



    <!-- Modal Confirmación -->
    <ConfirmacionModal
      :show="modalActivarDesactivar"
      :title="neewProducto.Estado === 1 ? '¿Desactivar Producto?' : '¿Activar Producto?'"
      :confirmText="neewProducto.Estado === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="neewProducto.Estado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-10 w-10 text-orange-500"
      @confirm="confirmarActivacionDesactivacion"
      @cancel="modalActivarDesactivar = false"
    >
      ¿Está seguro de {{ neewProducto.Estado === 1 ? 'desactivar' : 'activar' }} el producto
      <span class="font-semibold text-gray-800">{{ neewProducto.Nombre }}</span>?
    </ConfirmacionModal>

    <ProductoPhotoModal
      :show="showPhotoModal"
      :previewUrl="previewUrl"
      @close="closePhotoModal"
      @handle-archivo="handleArchivo"
      @handle-image-upload="handleImageUpload"
    />

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

    <!-- New IngredienteRegistroModal -->
    <IngredienteRegistroModal 
      :show="showIngredienteModal" 
      :product="selectedProductForIngredients" 
      @close="showIngredienteModal = false"
      @ingredients-updated="ListarProductos"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, defineProps } from 'vue';
import { useAlertStore } from '../../../stores/alertStore.js';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';
import IngredienteRegistroModal from './IngredienteRegistroModal.vue';
import ProductoHeader from './ProductoHeader.vue';
import ProductoFilters from './ProductoFilters.vue';
import ProductoList from './ProductoList.vue';
import ProductoPagination from './ProductoPagination.vue';
import ProductoFormHeader from './ProductoFormHeader.vue';
import ProductoBasicInfo from './ProductoBasicInfo.vue';
import ProductoImageUpload from './ProductoImageUpload.vue';
import ProductoFormActions from './ProductoFormActions.vue';
import ProductoPackageModal from './ProductoPackageModal.vue';
import ProductoPhotoModal from './ProductoPhotoModal.vue';
import { AlertTriangle, CheckCircle } from 'lucide-vue-next';
 import { listarPaquetesEnProductos,listarEnProductos, ObtenerSucursalproducto, PrecioProducto, ObtenerPaquetes, IncrementProducto, IncrementProductoCantidad, DeleteProducto,  
      addProducto, updateProducto, listarProductosConpromociones, ObtenerPaqueteProducto, ObtenerPresentacion, listarProductos } from '@/Server/Producto'                 
import { listarSucursales } from '@/Server/api'                                                                                                                                
import { listarCategorias, listarSubCategorias, ObtenerCategoria, ObtenerSubCategorias} from '@/Server/Categoria';                                                             
 import { SubirFoto } from '@/Server/api';                                                                                                                                      
 import { SucursalUsuario } from '@/Server/Usuario';                                                                                                                            
 import { listarPresentacionesestado } from '@/Server/Presentacion';                                                                                                            
 import {ObtenerMedidas, listarCategoriaMedidas, ObtenrCategoriaMedida} from '@/Server/Medida'              
 
 
 import { listarInsumos } from '@/Server/Insumo';                                                                                                                               
 import { registrarProduccionDeProducto, actualizarIngredienteReceta,getProductoIngrediente } from '@/Server/Ingrediente';  

const alertStore = useAlertStore();

// Reactive data
const showRegistration = ref(false)
const showPaqueteModal = ref(false)
const searchQuery = ref('')
const selectedTienda = ref('TODOS')
const modalActivarDesactivar = ref(false)
const esEdicion = ref(false)
const showToast = ref(false)
const toastMessage = ref('');
const toastType = ref('success') // 'success' or 'error'
const currentPage = ref(1)
const itemsPerPage = 8;
const paqueteEnEdicionIndex = ref(null)
const products = ref([]);
const sucursales = ref([]);
const precioTemporal = ref(0)
const subcategoria = ref([]);
const subcategorias = ref([]);
const categorias = ref([]);
const selectedCategoria = ref('');
const medidas = ref([]);
const categoriaMedidas = ref([]);
const selectedCategoriaMedida = ref('');
const selectedCategoriaMedidaPaquete = ref('');
const medidasPaquete = ref([]);
const selec = ref('Producto')
const insumos = ref([]);
const medidasIngrediente = ref([]);
const ingredienteEnEdicionIndex = ref(null);
const nuevoIngrediente = ref({
  IdIngrediente:'',
  IdInsumo: '',
  IdCategoriaMedida: '',
  IdUnidadMedida: '',
  Cantidad: 0,
});
const todasLasMedidas = ref([]);

// New state for ingredient modal
const showIngredienteModal = ref(false);
const selectedProductForIngredients = ref(null);

// Filtros
const filtroCategoria = ref('TODOS');
const filtroSubcategoria = ref('TODOS');
const subcategoriasParaFiltro = ref([]);

// State for standalone package modal
const productoParaPaquetes = ref(null);
const paquetesEnModal = ref([]);

// Validation errors
const errors = reactive({
  nombre: '',
  descripcion: '',
  categoria: '',
  subcategoria: '',
  categoriaMedida: '',
  unidadMedida: '',
  precio: '',
  precioMayor: '',
  stockMinimo: '',
});

const paqueteErrors = reactive({
  presentacion: '',
  nombre: '',
  categoriaMedida: '',
  unidadMedida: '',
  cantidad: '',
  precioVenta: '',
  precioMayor: '',
  stockMinimo: '',
});

const validateField = (field, value) => {
  let error = '';
  const allProducts = products.value;
  const isEditing = esEdicion.value;
  const currentProductId = neewProducto.value.IdProducto;

  switch (field) {
    case 'nombre':
      if (!value) error = 'El nombre es requerido.';
      else if (value.length > 50) error = 'El nombre no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z0-9\s\-.,()ñÑáéíóúÁÉÍÓÚ]*$/.test(value)) error = 'El nombre tiene caracteres no permitidos.';
      else {
        const lowerCaseValue = value.toLowerCase();
        const isDuplicate = allProducts.some(prod => {
          if (isEditing && prod.Producto.IdProducto === currentProductId) {
            return false;
          }
          return prod.Producto.Nombre.toLowerCase() === lowerCaseValue;
        });
        if (isDuplicate) error = 'Ya existe un producto con este nombre.';
      }
      break;
    case 'descripcion':
      if (!value) error = 'La descripción es requerida.';
      break;
    case 'categoria':
      if (!value) error = 'La categoría es requerida.';
      break;
    case 'subcategoria':
      if (!value) error = 'La subcategoría es requerida.';
      break;
    case 'categoriaMedida':
      if (!value) error = 'La categoría de medida es requerida.';
      break;
    case 'unidadMedida':
      if (!value) error = 'La unidad de medida es requerida.';
      break;
    case 'precio':
      if (value === null || value === undefined || value <= 0) error = 'El precio debe ser mayor que 0.';
      break;
    case 'precioMayor':
      if (value === null || value === undefined || value <= 0) error = 'El precio por mayor debe ser mayor que 0.';
      break;
    case 'stockMinimo':
      if (value === null || value === undefined || value <= 0) error = 'El stock mínimo no puede ser negativo.';
      break;
    default:
      break;
  }
  errors[field] = error;
};

const validatePaqueteField = (field, value) => {
  let error = '';
  const allPackages = paquetesEnModal.value;
  const isEditingIndex = paqueteEnEdicionIndex.value;
  switch (field) {
    case 'presentacion':
      if (!value) error = 'La presentación es requerida.';
      break;
    case 'nombre':
      if (!value) error = 'El nombre del paquete es requerido.';
      else if (!/^[a-zA-Z0-9\s\-.,()ñÑáéíóúÁÉÍÓÚ]*$/.test(value)) error = 'El nombre del paquete tiene caracteres no permitidos.';
      else {
        const lowerCaseValue = value.toLowerCase();
        const isDuplicate = allPackages.some((pkg, index) => {
          if (isEditingIndex !== null && index === isEditingIndex) {
            return false;
          }
          return pkg.Nombre.toLowerCase() === lowerCaseValue;
        });
        if (isDuplicate) error = 'Ya existe un paquete con este nombre.';
      }
      break;
    case 'categoriaMedida':
      if (!value) error = 'La categoría de medida es requerida.';
      break;
    case 'unidadMedida':
      if (!value) error = 'La unidad de medida es requerida.';
      break;
    case 'cantidad':
      if (!value || value <= 0) error = 'La cantidad debe ser mayor que 0.';
      break;
    case 'precioVenta':
      if (value === null || value === undefined || value <= 0) error = 'El precio de venta debe ser mayor que 0.';
      break;
    case 'precioMayor':
      if (value === null || value === undefined || value <= 0) error = 'El precio por mayor debe ser mayor que 0.';
      break;
    case 'stockMinimo':
      if (value === null || value === undefined || value <= 0) error = 'El stock mínimo debe ser mayor que 0.';
      break;
    default:
      break;
  }
  paqueteErrors[field] = error;
};

const validateForm = () => {
  validateField('nombre', neewProducto.value.Nombre);
  validateField('descripcion', neewProducto.value.Descripcion);
  validateField('categoria', selectedCategoria.value);
  validateField('subcategoria', neewProducto.value.IdSubCategoria);
  validateField('categoriaMedida', selectedCategoriaMedida.value);
  validateField('unidadMedida', neewProducto.value.IdUnidadMedida);
  validateField('precio', neewProducto.value.Precio);
  validateField('precioMayor', neewProducto.value.PrecioMayor);
  validateField('stockMinimo', neewProducto.value.StockMinimo);
  return Object.values(errors).every(error => !error);
};

const validatePaqueteForm = () => {
  validatePaqueteField('presentacion', nuevoPaquete.value.IdPresentacion);
  validatePaqueteField('nombre', nuevoPaquete.value.Nombre);
  validatePaqueteField('categoriaMedida', selectedCategoriaMedidaPaquete.value);
  validatePaqueteField('unidadMedida', nuevoPaquete.value.IdUnidadMedida);
  validatePaqueteField('cantidad', nuevoPaquete.value.Cantidad);
  validatePaqueteField('precioVenta', nuevoPaquete.value.PrecioVenta);
  validatePaqueteField('precioMayor', nuevoPaquete.value.PrecioMayor);
  validatePaqueteField('stockMinimo', nuevoPaquete.value.StockMinimo);

  return Object.values(paqueteErrors).every(error => !error);
};


watch(selec, async (newVal) => {
  currentPage.value = 1;
  if (newVal === 'Presentacion') {
    await ListarPaquetesSucursal();
  } else if (newVal === 'Producto') {
    await ListarProductos();
  }
});

watch(filtroCategoria, async (newVal) => {
  filtroSubcategoria.value = 'TODOS';
  if (newVal) {
    subcategoriasParaFiltro.value = await ObtenerSubCategorias(newVal);
  } else {
    subcategoriasParaFiltro.value = [];
  }
  await ListarProductos(); // Always call ListarProductos for category changes
});

watch(filtroSubcategoria, async () => {
  await ListarProductos(); // Always call ListarProductos for subcategory changes
});

watch(selectedCategoriaMedidaPaquete, async (newVal) => {  
  if (newVal) {
      if (paqueteEnEdicionIndex.value === null) { // Only clear if it's a new package
          nuevoPaquete.value.IdUnidadMedida = '';
      }
      await obtenerMedidasPaquete(newVal)
  } else {
    medidasPaquete.value = [];
  }
});

watch(selectedCategoria, async (newVal) => {
  if (newVal) {
    neewProducto.value.IdSubCategoria = ''; // Clear subcategory when category changes
    await Obtenersubcategoria(newVal);
  } else {
    subcategoria.value = []; // Clear subcategories if no category is selected
  }
});

watch(selectedCategoriaMedida, async (newVal) => {  
  if (newVal) {
      neewProducto.value.IdUnidadMedida = '';
     await obtenerMedidas(newVal);
  } else {
    medidas.value = [];
  }
});

watch(selectedTienda, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    if (selec.value === 'Presentacion') {
      await ListarPaquetesSucursal();
    } else if (selec.value === 'Producto') {
      await ListarProductos();
    }
  }
});

const archivo = ref('');
const previewUrl = ref('');
const TIeneSucursal = ref(false)
const expandedProducts = ref({});
const showPhotoModal = ref(false);
const presentacion = ref([]);
const paquetes = ref([]);
const promocionesPosiblesCalculadas = reactive({});
const pp = ref({});
const previewPaqueteUrl = ref('');

const openPhotoModal = () => {
  showPhotoModal.value = true;
};

const fetchPrecioProducto = async (id) => {
  if (!id) return;
  if (!pp.value[id] || esEdicion.value) {
    try {
      const response = await PrecioProducto(id);
      pp.value[id] = response;
    } catch (error) {
      console.error(`Error fetching price for product ${id}:`, error);
      pp.value[id] = { Precio: 0 }; // Cache failure
    }
  }
};

const closePhotoModal = () => {
  showPhotoModal.value = false;
};

const calculateAndStorePromotions = async () => {
  for (const key in promocionesPosiblesCalculadas) {
    delete promocionesPosiblesCalculadas[key];
  }
  console.log(products.value)
  for (const prod of products.value) {
    const promosForProduct = getPromocionesParaProducto(prod.Producto.IdProducto);
    for (const promo of promosForProduct) {
      const result = await calcularPromocionesPosibles(promo);
      if (!promocionesPosiblesCalculadas[prod.Producto.IdProducto]) {
        promocionesPosiblesCalculadas[prod.Producto.IdProducto] = {};
      }
      promocionesPosiblesCalculadas[prod.Producto.IdProducto][promo.IdPromocion] = result;
    }
  };
};
const calcularPresnetaciones = async () =>{
  for (const prod of products.value)
    await obtenerpaquete(prod.Producto.IdProducto)
}
const toggleDetails = (productoId) => {
  expandedProducts.value[productoId] = !expandedProducts.value[productoId];
};

 const paquetess = ref([])
 const paquetesss = ref([])
 const ListarPaquetesSucursal = async () => {
  try {
    const response = await listarPaquetesEnProductos(selectedTienda.value);
    paquetess.value = response;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const ListarProductos = async () => {
  try {
    const response = await listarEnProductos(selectedTienda.value,filtroSubcategoria.value);
    products.value = response;
    console.log(products.value)
    for(const prod of  products.value ){
      await fetchPrecioProducto(prod.Producto.IdProducto)
    }
 
    await calculateAndStorePromotions();
    await calcularPresnetaciones();
 
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};
const ListarSubCategorias = async () => {
  try {
    const response = await listarSubCategorias();
    subcategorias.value = response;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const obtenerPaquetes = async (id) => {
  try {
    const response = await ObtenerPaqueteProducto(id);
    paquetes.value = response;
    console.log( paquetes.value)
    return response; // Return the fetched packages
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    return []; // Return empty array on error
  }
};

const ListarPrecentacion = async () => {
  try {
    const response = await listarPresentacionesestado();
    presentacion.value = response;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const ListarSucursal = async () => {
  try {
    const response = await listarSucursales();
    sucursales.value = [{IdSucursal: 'TODOS', Nombre: 'Todas las Tiendas'}].concat(response);
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const ListarInsumos = async () => {
  try {
    insumos.value = await listarInsumos();
  } catch (error) {
    console.error('Error al cargar insumos:', error);
  }
};

const agregarIngrediente = () => {
  if (nuevoIngrediente.value.IdInsumo && nuevoIngrediente.value.IdUnidadMedida && nuevoIngrediente.value.Cantidad > 0) {
    neewProducto.value.ingredientes.push({ ...nuevoIngrediente.value });
    nuevoIngrediente.value = {
      IdIngrediente:'',
      IdInsumo: '',
      IdCategoriaMedida: '',
      IdUnidadMedida: '',
      Cantidad: 0,
    };
    medidasIngrediente.value = [];
  }
};

const actualizarIngrediente = () => {
  if (ingredienteEnEdicionIndex.value !== null) {
    neewProducto.value.ingredientes[ingredienteEnEdicionIndex.value] = { ...nuevoIngrediente.value };
    cancelarEdicionIngrediente();
  }
};

const cancelarEdicionIngrediente = () => {
  ingredienteEnEdicionIndex.value = null;
  nuevoIngrediente.value = {
    IdIngrediente: '',
    IdInsumo: '',
    IdCategoriaMedida: '',
    IdUnidadMedida: '',
    Cantidad: 0,
  };
  medidasIngrediente.value = [];
};

const editarIngrediente = async (index) => {
  ingredienteEnEdicionIndex.value = index;
  const ingredienteAEditar = neewProducto.value.ingredientes[index];
  
  nuevoIngrediente.value = { ...ingredienteAEditar };

  if (ingredienteAEditar.IdCategoriaMedida) {
    await cargarMedidasIngrediente();
    nuevoIngrediente.value.IdUnidadMedida = ingredienteAEditar.IdUnidadMedida;
  }
};

const quitarIngrediente = (index) => {
  neewProducto.value.ingredientes.splice(index, 1);
};

const cargarMedidasIngrediente = async () => {
  if (nuevoIngrediente.value.IdCategoriaMedida) {
    medidasIngrediente.value = await ObtenerMedidas(nuevoIngrediente.value.IdCategoriaMedida);
    nuevoIngrediente.value.IdUnidadMedida = '';
  }
};

const getInsumoName = (id) => {
  const insumo = insumos.value.find(i => i.IdProducto === id);
  return insumo ? insumo.Nombre : '';
};

const getMedidaName = (id) => {
  const medida = todasLasMedidas.value.find(m => m.IdUnidadMedida === id);
  return medida ? medida.Nombre : '';
};

const cargarTodasLasMedidas = async () => {
  const response = await listarCategoriaMedidas();
  const promesas = response.map(cat => ObtenerMedidas(cat.IdCategoriaMedida));
  const arraysDeMedidas = await Promise.all(promesas);
  todasLasMedidas.value = [].concat(...arraysDeMedidas);
};



const ListarCategoriasPrincipales = async () => {
  try {
    const response = await listarCategorias();
    categorias.value = response;
  } catch (error) {
    console.error('Error al cargar categorias:', error);
  }
};

const ListarCategoriaMedidas = async () => {
  try {
    categoriaMedidas.value = await listarCategoriaMedidas();
  } catch (error) {
    console.error('Error al cargar las categorías de medida:', error);
  }
};

const neewProducto = ref({
  IdProductoSucursal:null,
  Cantidad:0,
  IdProducto: null,
  Nombre: '',
  Descripcion: '',
  IdProductomedida:'',
  IdPrecio:'',
  Precio:  0 ,
  PrecioMayor:0,
  StockMinimo: 5,
  Estado: 1,
  IdImagen:null,
  Url:'',
  IdSubCategoria: '' ,
  IdUnidadMedida:'',
  Paquete: [],
  Productomedida:[],
  ingredientes: []
}) ///
const ElProductoMedida = ref ({
  Cantidad:0,
  Precio:  0 ,
  PrecioMayor:0,
  IdProductomedida:'',
  IdUnidadMedida:'',
})
const nuevoPaquete = ref({
  Nombre: '',
  IdUnidadMedida:'',
  Cantidad: 1,
  PrecioVenta: 0,
  PrecioMayor: 0,
  StockMinimo: 5,
  IdPresentacion: '' ,
  Estado: 1, 
  Url: '',
  archivo: null,
  IdImagen: null
})

const promociones = ref([]);

const ListarPromociones = async () => {
  try {
    const response = await listarProductosConpromociones();
    promociones.value = response;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};       

const IngredienteProductos = async (id) => {
  let response;
  try {
     response = await getProductoIngrediente(id);
  } catch (error) {
    console.error('Error al cargar los ingredientes:', error);
  }
  return response || []
};

const quitarDecimalesCero = (valor) => {
  return Number(valor).toString();
};
// Computed
const productosFiltrados = computed(() => {
  let filtered = products.value;

  if (searchQuery.value) {
    const nombreLower = searchQuery.value.toLowerCase();
    filtered = filtered.filter(producto =>
      (producto.Producto.Nombre.toLowerCase() + " " + producto.Producto.Descripcion.toLowerCase()).includes(nombreLower)
    );
  }
  return filtered;
});

const paquetesFiltrados = computed(() => {
  let filtered = paquetess.value;

  if (searchQuery.value) {
    const nombreLower = searchQuery.value.toLowerCase();
    filtered = filtered.filter(paquete =>
      (paquete.Paquete.Nombre.toLowerCase()).includes(nombreLower)
    );
  }

  if (selectedTienda.value !== 'TODOS') {
    filtered = filtered.filter(paquete => paquete.Sucursal === selectedTienda.value);
  }

  return filtered;
});

const totalPages = computed(() => {
  if (selec.value === 'Producto') {
    return Math.ceil(productosFiltrados.value.length / itemsPerPage);
  }
  return 0;
});

const totalPagesPaquetes = computed(() => {
  if (selec.value === 'Presentacion') {
    return Math.ceil(paquetesFiltrados.value.length / itemsPerPage);
  }
  return 0;
});

const paginatedProductos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return productosFiltrados.value.slice(start, end);
});

const paginatedPaquetes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return paquetesFiltrados.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  if (selec.value === 'Producto') {
    const total = productosFiltrados.value.length;
    const inicio = total === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1;
    const fin = Math.min(inicio + itemsPerPage - 1, total);
    return `Mostrando ${inicio}-${fin} de ${total} productos`;
  }
  return '';
});

const paginacionInfoPaquetes = computed(() => {
  if (selec.value === 'Presentacion') {
    const total = paquetesFiltrados.value.length;
    const inicio = total === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1;
    const fin = Math.min(inicio + itemsPerPage - 1, total);
    return `Mostrando ${inicio}-${fin} de ${total} presentaciones`;
  }
  return '';
});

const visiblePages = computed(() => {
  const pages = [];
  const total = selec.value === 'Producto' ? totalPages.value : totalPagesPaquetes.value;
   for (let i = 1; i <= total; i++) {
    pages.push(i);
  }
  return pages;
});


// Methods
const getPromocionesParaProducto = (productoId) => {
  if (!promociones.value) return [];
  return promociones.value.filter(promo =>
    promo.Estado.IdEstado === 1 &&
    promo.Promocionproducto.some(pp => pp.Producto && pp.Producto.IdProducto === productoId || pp.Paquete && pp.Paquete.IdPaquete === productoId)
  );
};

const getAvailableProductStock = (productId, productList = products.value) => {
  const productEntry = productList.find(p => p.Producto.IdProducto === productId);
  if (productEntry) {
    return productEntry.Cantidad;
  }
  return 0;
};

const getAvailablePaqueteStock = (productId, productList = paquetesss.value) => {
  console.log(productList)
  const productEntry = productList.find(p => p.Paquete.IdPaquete === productId);
  if (productEntry) {
    return productEntry.Cantidad;
  }
  return 0;
};

//wwwww
// Función única y completa
const calcularPromocionesPosibles = async (promocion) => {
  // Validaciones básicas
  if (!promocion || !Array.isArray(promocion.Promocionproducto) || promocion.Promocionproducto.length === 0) {
    return 0;
  }


  // Procesar cada item de la promoción
  const posiblesPorItem = await Promise.all(promocion.Promocionproducto.map(async item => {
    const cantidadRequeridaPromocion = Number(item?.Cantidad ?? 0);
    if (cantidadRequeridaPromocion <= 0) return Infinity;

    if (item.Producto) {
      const availableStock = getAvailableProductStock(item.Producto.IdProducto, products.value);
      return Math.floor(availableStock / cantidadRequeridaPromocion);

    } else if (item.Paquete) {
      const idPaquete = item.Paquete.IdPaquete;
      try {
        const packageDetails = await ObtenerPresentacion(idPaquete);
        if (!packageDetails || !packageDetails.IdProducto || !packageDetails.Cantidad) {
          console.warn(`Package details incomplete for IdPaquete: ${idPaquete}`);
          return 0;
        }

        const unitsPerPackage = Number(packageDetails.Cantidad);
        const constituentProductId = packageDetails.IdProducto;

        if (unitsPerPackage <= 0) return 0;

        const availableConstituentProductStock = getAvailableProductStock(constituentProductId, products.value);
        const packagesThatCanBeFormed = Math.floor(availableConstituentProductStock / unitsPerPackage);

        return Math.floor(packagesThatCanBeFormed / cantidadRequeridaPromocion);

      } catch (error) {
        console.error(`Error fetching package details for ${idPaquete}:`, error);
        return 0;
      }
    }

    return 0;
  }));

  const resultado = Math.min(...posiblesPorItem);
  return resultado === Infinity ? 0 : resultado;
};


const calcularPaquetesPosibles = (IdProductoSucursal, IdProducto, IdPaquete) => {
  const paquete = paquetesPorProducto.value[IdProducto]?.find(p => p.IdPaquete === IdPaquete);
  if (!paquete || paquete.Cantidad <= 0) return 0;

  if (selectedTienda.value === 'TODOS'){
  const totalCantidad = products.value.reduce((total, stock) => {
    if (stock.Producto.IdProducto === IdProducto) {
      return total + stock.Cantidad;
    }
    return total;
  }, 0);

  return Math.floor(totalCantidad / paquete.Cantidad);
    } else{
  const totalCantidad = products.value.reduce((total, stock) => {
    if (stock.IdProductoSucursal === IdProductoSucursal) {
      return total + stock.Cantidad;
    }
    return total;
  }, 0);

  return Math.floor(totalCantidad / paquete.Cantidad);

    }
};



const paquetesPorProducto = ref({});

const obtenerpaquete = async (IdProducto) => {
  try {
    const response = await ObtenerPaqueteProducto(IdProducto);
    paquetesPorProducto.value[IdProducto] = response;
  } catch (error) {
    console.error(`Error al obtener paquetes para el producto ${IdProducto}:`, error);
    paquetesPorProducto.value[IdProducto] = [];
  }
};

const getCategoryName = (subcategoryId) => {
  const subcat = subcategorias.value.find(s => s.IdSubCategoria === subcategoryId);
  if (subcat) {
    const cat = categorias.value.find(c => c.IdCategoria === subcat.IdCategoria);
    return cat ? cat.Nombre : 'Desconocida';
  }
  return 'Desconocida';
};

const getSubcategoryName = (subcategoryId) => {
  const subcat = subcategorias.value.find(s => s.IdSubCategoria === subcategoryId);
  return subcat ? subcat.Nombre : 'Desconocida';
};

const openAddModal = () => {
  esEdicion.value = false;
  resetProductForm();
  showRegistration.value = true;
};

watch(selectedCategoriaMedida, async (newVal) => {  
  if (newVal) {
      neewProducto.value.IdUnidadMedida = '';
     await obtenerMedidas(newVal);
  } else {
    medidas.value = [];
  }
});

const obtenersubCategoria =  async (Id) => {
  try {
    const response = await ObtenerSubCategorias(Id);
    subcategoria.value = response;
  } catch (error) {
    console.error("Error al obtener laa aubcategorias:", error);
  }
};

const openEditModal = async (product) => {
  console.log(product)
  console.log( pp.value[product.Producto.IdProducto])
   const Categoria = await ObtenrCategoriaMedida(pp.value[product.Producto.IdProducto].Unidadmedida);
  const subcategoria = await ObtenerCategoria(product.Producto.Subcategoria.IdSubCategoria);
  selectedCategoria.value = subcategoria.IdCategoria;
   selectedCategoriaMedida.value = Categoria.IdCategoriaMedida;
  await obtenerMedidas(selectedCategoriaMedida.value);
   await obtenersubCategoria(selectedCategoria.value);
const fetchedPaquetes = await obtenerPaquetes(product.Producto.IdProducto);
  esEdicion.value = true;
  neewProducto.value.IdProductoSucursal = product?.IdProductoSucursal;
  neewProducto.value.Cantidad = product.Cantidad;
  neewProducto.value.IdProducto = product.Producto.IdProducto;
  neewProducto.value.Nombre = product.Producto.Nombre;
  neewProducto.value.Descripcion = product.Producto.Descripcion;
  neewProducto.value.IdProductomedida= pp.value[product.Producto.IdProducto]?.Id,
  neewProducto.value.IdPrecio = product.Producto.IdPrecio;
  neewProducto.value.Precio = pp.value[product.Producto.IdProducto]?.Precio || 0;
  neewProducto.value.PrecioMayor = pp.value[product.Producto.IdProducto]?.PrecioMayor || 0;
  neewProducto.value.IdImagen = product.Producto.IdImagen;
  neewProducto.value.Url = product.Producto.Imagen?.Url || '';
  previewUrl.value = product.Producto.Imagen?.Url || '';
  neewProducto.value.IdSubCategoria = product.Producto.Subcategoria.IdSubCategoria;
  neewProducto.value.IdUnidadMedida = pp.value[product.Producto.IdProducto].Unidadmedida;
  neewProducto.value.StockMinimo = product.StockMinimo;

  neewProducto.value.ingredientes = (await IngredienteProductos(product.Producto.IdProducto)).map(ing => ({
    IdIngrediente: ing.IdIngrediente,
    IdInsumo: ing.ingredienteId,
    IdCategoriaMedida: todasLasMedidas.value.find(m => m.IdUnidadMedida === ing.UnidadmedidaId)?.IdCategoriaMedida || '',
    IdUnidadMedida: ing.UnidadmedidaId,
    Cantidad: ing.totalPeso,
  }));

  showRegistration.value = true;
};

const closeProductModal = () => {
  showRegistration.value = false;
  resetProductForm();
};

const resetProductForm = () => {
  neewProducto.value = {
    IdProductoSucursal:null,
    Cantidad:0,
    IdProducto: null,
    Nombre: '',
    Descripcion: '',
    IdProductomedida:'',
    IdPrecio:'',
    Precio:  0 ,
    PrecioMayor:0,
    StockMinimo: 5,
    Estado: 1,
    IdImagen:null,
    Url:'',
    IdSubCategoria: '' ,
    IdUnidadMedida:'',
    Paquete: [],
    ingredientes: []
  };
  selectedCategoria.value = '';
  selectedCategoriaMedida.value = '';
  previewUrl.value = '';
  Object.keys(errors).forEach(key => errors[key] = '');
  resetIngredientForm();
};

const resetIngredientForm = () => {
  nuevoIngrediente.value = {
    IdIngrediente:'',
    IdInsumo: '',
    IdCategoriaMedida: '',
    IdUnidadMedida: '',
    Cantidad: 0,
  };
  medidasIngrediente.value = [];
  ingredienteEnEdicionIndex.value = null;
};
const handleImageUpload = async () => {
  if (!archivo.value) return;
  try {
    const response = await SubirFoto(archivo.value);
    console.log(response)
    if (response) {
      neewProducto.value.Url = response;
    }
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    showToastMessage('Error al subir la imagen');
  }
};

const guardarProducto = async () => {
  if (!validateForm()) {
    showToastMessage('error', 'Por favor, corrija los errores del formulario.');
    return;
  }
  
  const productoData = {
     Nombre: neewProducto.value.Nombre,
      Descripcion: neewProducto.value.Descripcion,
      Url: neewProducto.value?.Url,
      IdSubCategoria: neewProducto.value.IdSubCategoria,
      IdUnidadMedida: neewProducto.value.IdUnidadMedida,
      IdImagen: neewProducto.value?.IdImagen,
      StockMinimo: neewProducto.value.StockMinimo,
      IdTipo: 'ITP-2', // Asumo que este es fijo
      IdMarca: '', // Asumo que este es fijo
      Cantidad: neewProducto.value.Cantidad,
      Paquete: neewProducto.value.Paquete,
       Productomedida:[
        {
      IdProductomedida:neewProducto.value?.IdProductomedida,
      Precio: neewProducto.value.Precio,
      PrecioMayor: neewProducto.value.PrecioMayor,
      IdUnidadMedida:neewProducto.value?.IdUnidadMedida, 
      Cantidad :0,
        }
    ],
  };

  try {
     await handleImageUpload();
    let response;
     if (esEdicion.value) {
       productoData.id = neewProducto.value.IdProducto;
     response = await updateProducto(productoData);
    } else {
     response = await addProducto(productoData);
    
    }
      showToastMessage(response.message);
      alertStore.fetchAlerts();
    closeProductModal();
    await ListarProductos(); 
  } catch (error) {
    console.error('Error al guardar producto:', error);
    showToastMessage('error', 'Error al guardar producto.');
  }
};

const abrirModalActivarDesactivar = (product) => {
  neewProducto.value.IdProducto = product.Producto.IdProducto;
  neewProducto.value.Nombre = product.Producto.Nombre;
  neewProducto.value.Estado = product.Producto.Estado;
  modalActivarDesactivar.value = true;
};

const confirmarActivacionDesactivacion = async () => {
  try {
   const response = await DeleteProducto(neewProducto.value.IdProducto);
    showToastMessage(response.message);
    //'success', `Producto ${neewProducto.value.Estado === 1 ? 'desactivado' : 'activado'} exitosamente.`
    modalActivarDesactivar.value = false;
    await ListarProductos();
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    showToastMessage('error', 'Error al cambiar estado del producto.');
  }
};

const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
    previewUrl.value = URL.createObjectURL(file);
  } else {
    archivo.value = '';
    previewUrl.value = '';
  }
};

// const handlePhotoUpload = async () => {
//   if (archivo.value) {
//     try {
//       const formData = new FormData();
//       formData.append('imagen', archivo.value);
//       const response = await SubirFoto(formData);
//       neewProducto.value.Url = response;
//       showToastMessage('success', 'Imagen subida exitosamente.');
//     } catch (error) {
//       console.error('Error al subir la imagen:', error);
//       showToastMessage('error', 'Error al subir la imagen.');
//     }
//   }
// };

const updateCantidadProductoEnTienda = async (producto, cambio) => {
  try {
    
    if(producto.Paquete){
      const stockProducto = getAvailableProductStock(producto.Paquete.Producto.IdProducto);
      const resultado = stockProducto - (producto.Paquete.Cantidad * cambio);

      if(resultado < 0){
        entrada = true;
        showToastMessage("No es posible disminuir, stock insuficiente.");
        return; 
      }
    }

    // Validación normal para producto individual
    const newCantidad = producto.Cantidad + cambio;
    if (newCantidad < 0) {
      showToastMessage("No puede bajar más, stock en cero.");
      return;
    }

    // Si pasa las validaciones, realiza la actualización
    await IncrementProductoCantidad({
      id: producto.IdProductoSucursal,
      IdProducto: producto?.Producto?.IdProducto,
      Cantidad: newCantidad
    });

    showToastMessage('Stock actualizado.');
    await ListarProductos();
    await ListarPaquetesSucursal();
    alertStore.fetchAlerts();

  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    showToastMessage('error', 'Error al actualizar stock.');
  }
};

const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};
 const ListarPaquetesSucursals = async () => {
  try {
    paquetesss.value = await listarPaquetesEnProductos(selectedTienda.value);
    
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};
const updateCantidadProducto = async (producto, cantidad) => {
  try {
    // Validación: no negativos
  
    if (cantidad < 0) {
      showToastMessage('error', 'La cantidad no puede ser negativa.');
      return;
    }
     
    let cantidadFinal = cantidad;

    //  Validación solo cuando es paquete
    if (producto.Paquete) {
      await ListarPaquetesSucursals();
      const unidadesPorPaquete = producto.Paquete.Cantidad; // ej. 5 unidades por paquete
      const stockBaseDisponible = getAvailableProductStock(producto.Paquete.Producto.IdProducto);
      const cantidadActual = getAvailablePaqueteStock(producto.Paquete.IdPaquete); // paquetes actuales en tienda 
      const paquetesExtraPosibles = Math.floor(stockBaseDisponible / unidadesPorPaquete);
      const maxPaquetes = cantidadActual + paquetesExtraPosibles;

          if(maxPaquetes <= cantidad){
          cantidadFinal = maxPaquetes;
          producto.Cantidad = cantidadFinal; 
          }

      
      
    }

    // Actualizar cantidad real
   
    await IncrementProductoCantidad({
      id: producto.IdProductoSucursal,
      IdProducto: producto?.Producto?.IdProducto,
      Cantidad: cantidadFinal
    });

    await ListarProductos();
    await ListarPaquetesSucursal();
    alertStore.fetchAlerts();
    showToastMessage('Stock actualizado.');

  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    showToastMessage('error', 'Error al actualizar stock.');
  }
};



const exportarPDF = () => {
  // Logic for exporting PDF
  showToastMessage('info', 'Generando reporte PDF...');
};

const Obtenersubcategoria = async (id) => {
  try {
    subcategoria.value = await ObtenerSubCategorias(id);
  } catch (error) {
    console.error('Error al cargar subcategorías:', error);
  }
};

const obtenerMedidas = async (id) => {
  try {
    medidas.value = await ObtenerMedidas(id);
  } catch (error) {
    console.error('Error al cargar medidas:', error);
  }
};

const obtenerMedidasPaquete = async (id) => {
  try {
    medidasPaquete.value = await ObtenerMedidas(id);
  } catch (error) {
    console.error('Error al cargar medidas del paquete:', error);
  }
};  //fff

// Package Modal Logic
const openPresentationsModalFromList = async (product) => {
  neewProducto.value.IdProductoSucursal = product?.IdProductoSucursal;
  neewProducto.value.Cantidad = product.Cantidad;
  neewProducto.value.IdProducto = product.Producto.IdProducto;
  neewProducto.value.Nombre = product.Producto.Nombre;
  neewProducto.value.Descripcion = product.Producto.Descripcion;
  neewProducto.value.IdProductomedida= pp.value[product.Producto.IdProducto]?.Id,
  neewProducto.value.IdPrecio = product.Producto.IdPrecio;
  neewProducto.value.Precio = pp.value[product.Producto.IdProducto]?.Precio || 0;
  neewProducto.value.PrecioMayor = pp.value[product.Producto.IdProducto]?.PrecioMayor || 0;
  neewProducto.value.IdImagen = product.Producto.IdImagen;
  neewProducto.value.Url = product.Producto.Imagen?.Url || '';
  previewUrl.value = product.Producto.Imagen?.Url || '';
  neewProducto.value.IdSubCategoria = product.Producto.Subcategoria.IdSubCategoria;
  neewProducto.value.IdUnidadMedida = pp.value[product.Producto.IdProducto].Unidadmedida;
  neewProducto.value.StockMinimo = product.StockMinimo;

  productoParaPaquetes.value = product;
   const fetchedPaquetes = await obtenerPaquetes(product.Producto.IdProducto);
  paquetesEnModal.value = fetchedPaquetes.map(p => ({
    IdPaquete: p.IdPaquete,
    Nombre: p.Nombre,
    IdUnidadMedida: p.Unidadmedida,
    IdPresentacion: p.Presentacion,
    Cantidad: p.Cantidad,
    PrecioVenta: p.PrecioVenta,
    PrecioMayor:p.PrecioMayor,
    Estado: p.Estado,
    IdImagen:p.IdImagen,
    Url:p.Url,
    StockMinimo:p.StockMinimo //
  }));
  console.log(paquetesEnModal.value)
  showPaqueteModal.value = true;
};

const guardarPaquete = async () => {
  if (!validatePaqueteForm()) {
    showToastMessage('error', 'Por favor, corrija los errores del formulario del paquete.');
    return;
  }

  const newPackageData = {
    ...nuevoPaquete.value,
    IdProducto: productoParaPaquetes.value.Producto.IdProducto,
    localPreviewUrl: previewPaqueteUrl.value
  };

  if (paqueteEnEdicionIndex.value !== null) {
    // Update existing package
    paquetesEnModal.value[paqueteEnEdicionIndex.value] = newPackageData;
    showToastMessage('Presentación actualizada temporalmente.');
  } else {
    // Add new package
    paquetesEnModal.value.push(newPackageData);
    showToastMessage( 'Presentación agregada temporalmente.');
  }
  resetPaqueteForm();
};

const editarPaquete = async (index) => {
  paqueteEnEdicionIndex.value = index;
  const paqueteAEditar = paquetesEnModal.value[index];
  nuevoPaquete.value = { ...paqueteAEditar };
  previewPaqueteUrl.value = paqueteAEditar.localPreviewUrl || paqueteAEditar.Url;
    
  const medida = todasLasMedidas.value.find(m => m.IdUnidadMedida === paqueteAEditar.IdUnidadMedida);
  if (medida) {
    const Categoria = await ObtenrCategoriaMedida(paqueteAEditar.IdUnidadMedida);
    selectedCategoriaMedidaPaquete.value = Categoria.IdCategoriaMedida;
    nuevoPaquete.value.IdUnidadMedida = paqueteAEditar.IdUnidadMedida;
  }
};

const eliminarPaquete = (index) => {
  paquetesEnModal.value[index].Estado = paquetesEnModal.value[index].Estado === 1 ? 2 : 1; // Toggle state
  showToastMessage('success', 'Estado de presentación cambiado temporalmente.');
};

const cancelarEdicionPaquete = () => {
  paqueteEnEdicionIndex.value = null;
  resetPaqueteForm();
};

const resetPaqueteForm = () => {
  nuevoPaquete.value = {
    Nombre: '',
    IdUnidadMedida:'',
    Cantidad: 1,
    PrecioVenta: 0,
    PrecioMayor: 0,
    StockMinimo: 5,
    IdPresentacion: '' ,
    Estado: 1,
    Url: '',
    archivo: null,
    IdImagen: null
  };
  previewPaqueteUrl.value = '';
  selectedCategoriaMedidaPaquete.value = '';
  medidasPaquete.value = [];
  Object.keys(paqueteErrors).forEach(key => paqueteErrors[key] = '');
};

const handleArchivoPaquete = (event) => {
  const file = event.target.files[0];
  if (file) {
    nuevoPaquete.value.archivo = file;
    previewPaqueteUrl.value = URL.createObjectURL(file);
  } else {
    nuevoPaquete.value.archivo = null;
    previewPaqueteUrl.value = '';
  }
};

const guardarCambiosDePaquetes = async () => {
  if (!productoParaPaquetes.value?.Producto?.IdProducto) {
    showToastMessage('error', 'No se pudo identificar el producto para guardar las presentaciones.');
    return;
  }

  try {
    for (const paquete of paquetesEnModal.value) {
      if (paquete.archivo) {
        try {
          const imageUrl = await SubirFoto(paquete.archivo);
          paquete.Url = imageUrl;
          paquete.archivo = null;
        } catch (uploadError) {
          console.error('Error al subir la imagen de la presentación:', uploadError);
          showToastMessage('error', `Error al subir imagen para ${paquete.Nombre}.`);
          return;
        }
      }
    }

    neewProducto.value.Paquete = paquetesEnModal.value;

    const productoData = {
      id: neewProducto.value.IdProducto,
      Paquete: neewProducto.value.Paquete,
      Productomedida: [
        {
          IdProductomedida: neewProducto.value.IdProductomedida,
          Precio: neewProducto.value.Precio,
          PrecioMayor: neewProducto.value.PrecioMayor,
          IdUnidadMedida: neewProducto.value.IdUnidadMedida,
          Cantidad: 0,
        }
      ],
    };

   const response =  await updateProducto(productoData);
    showToastMessage(response.message);
    showPaqueteModal.value = false;
    await ListarProductos();

  } catch (error) {
    console.error('Error al guardar cambios de paquetes:', error);
    showToastMessage('error', 'Error al guardar cambios de presentaciones.');
  }
};

// New method to open the ingredient modal
const openIngredienteModal = (product) => {
  selectedProductForIngredients.value = product;
  showIngredienteModal.value = true;
};


onMounted(async () => {
  await ListarSucursal();
  await ListarCategoriasPrincipales();
  await ListarSubCategorias();
  await ListarPrecentacion();
  await ListarCategoriaMedidas();
  await cargarTodasLasMedidas();
  await ListarInsumos();
  await ListarPromociones();
  await ListarProductos();
  await ListarPaquetesSucursal();
  alertStore.fetchAlerts();
  const userSucursal = await SucursalUsuario();
  if (userSucursal && userSucursal.IdSucursal) {
    selectedTienda.value = userSucursal.IdSucursal;
    TIeneSucursal.value = true;
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos para el scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #c0c0c0;
}
</style>
