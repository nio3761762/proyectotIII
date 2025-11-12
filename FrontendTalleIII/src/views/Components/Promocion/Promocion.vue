<template>
  <div class="min-h-screen bg-gradient-to-br p-6 space-y-8">
    <!-- Promotions List -->
    <div v-if="!showForm" class="space-y-6">
      <PromocionHeader
        :activePromotions="activePromotions"
        :totalPromotions="promotions.length"
        @new-promotion="resetForm(); showForm = true"
      />

      <PromocionFilters
        v-model="filters"
        :statusOptions="statusOptions"
      />
     
      <PromocionList
        :promotions="paginatedPromotions"
        :promotionPrices="promotionPrices"
        :originalPromotionPrices="originalPromotionPrices"
        :expandedPromotions="expandedPromotions"
        :precioIndividual="precioIndividual"
        :precioUnico="precioUnico"
        :formatarValidez="formatarValidez"
        @toggle-expanded="toggleExpanded"
        @edit-promotion="editPromotion"
        @delete-promotion="deletePromotion"
      />

      <PromocionPagination
        v-if="totalPages > 0"
        :totalPages="totalPages"
        :currentPage="currentPage"
        :paginacionInfo="paginacionInfo"
        :visiblePages="visiblePages"
        @update:currentPage="currentPage = $event"
      />
    </div>

    <!-- Promotion Form -->
    <div v-if="showForm" class="space-y-8">
      <PromocionFormHeader
        :isEditing="isEditing"
        @close-form="showForm = false"
      />

      <!-- Form Content -->
      <form @submit.prevent="savePromotion" class="space-y-8">
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <!-- Basic Information -->
          <div class="xl:col-span-2 space-y-6">
            <PromocionBasicInfo
              v-model:formData="formData"
              :promotionTypes="promotionTypes"
              :previewUrl="previewUrl"
              @handle-archivo="handleArchivo"
            />

            <!-- Date and Time -->
            <PromocionValidity
              v-model:formData="formData"
            />
          </div>

          <!-- Product Management -->
          <div class="space-y-6">
            <PromocionProductSelector
              v-model:selectionType="selectionType"
              v-model:selectedPaquete="selectedPaquete"
              v-model:queryPaquete="queryPaquete"
              :filteredPaquetes="filteredPaquetes"
              v-model:paqueteForm="paqueteForm"
              :editingProductIndex="editingProductIndex"
              v-model:productForm="productForm"
              v-model:queryProducto="queryProducto"
              :filteredProductos="filteredProductos"
              :pp="pp"
              @add-paquete-to-promotion="addPaqueteToPromotion"
              @cancel-edit-item="cancelEditItem"
              @add-product="addProduct"
            />

            <!-- productos List -->
            <PromocionAddedProducts
              :formData="formData"
              :precioIndividual="precioIndividual"
              :calculateTotalPrice="calculateTotalPrice"
              @edit-item="editItem"
              @remove-product="removeProduct"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <PromocionFormActions
          @cancel-form="showForm = false"
          @save-promotion="savePromotion"
        />
      </form>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmacionModal
      :show="showConfirmModal"
      :title="selectedPromotion?.Estado.IdEstado === 1 ? '¿Desactivar Promoción?' : '¿Activar Promoción?'"
      :confirmText="selectedPromotion?.Estado.IdEstado === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar" 
      :confirmButtonClass="selectedPromotion?.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="selectedPromotion?.Estado.IdEstado === 1 ? Trash2 : Check"
      :iconClass="selectedPromotion?.Estado.IdEstado === 1 ? 'h-8 w-8 text-red-600' : 'h-8 w-8 text-green-600'"
      @confirm="confirmDelete"
      @cancel="showConfirmModal = false"
    >
      ¿Está seguro de que desea {{ selectedPromotion?.Estado.IdEstado === 1 ? 'desactivar' : 'activar' }} la promoción
      <span class="font-semibold text-gray-900 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-lg">
        {{ selectedPromotion?.Nombre }}
      </span>?
      <br />
      <span class="text-sm text-gray-500 mt-2 block">
        {{ selectedPromotion?.Estado.IdEstado === 1
          ? 'Esta acción desactivará la promoción y no estará disponible para los clientes.'
          : 'Esta acción activará la promoción y estará disponible para los clientes.'
        }}
      </span>
    </ConfirmacionModal>
    <Toast position="bottom-right" />
  <!-- Success Toast -->
    <div
      v-if="showSuccessToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Trash2, Check, CheckCircle } from 'lucide-vue-next'; // Only import what's needed here

import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';
import PromocionHeader from './PromocionHeader.vue';
import PromocionFilters from './PromocionFilters.vue';
import PromocionList from './PromocionList.vue';
import PromocionPagination from './PromocionPagination.vue';
import PromocionFormHeader from './PromocionFormHeader.vue';
import PromocionBasicInfo from './PromocionBasicInfo.vue';
import PromocionValidity from './PromocionValidity.vue';
import PromocionProductSelector from './PromocionProductSelector.vue';
import PromocionAddedProducts from './PromocionAddedProducts.vue';
import PromocionFormActions from './PromocionFormActions.vue';

import { listarPromociones, registrarPromocion, actualizarPromocion, eliminarPromocion } from '@/Server/Promocion';
import { listarProductos, PrecioProducto, listarPaqueteSin, ObtenerPaqueteProducto } from '@/Server/Producto';
import { listarTipoPromocion } from '@/Server/TipoPromocion';
import { SubirFoto } from '@/Server/api';

// Reactive data
const promotions = ref([]);
const productos = ref([]);
const promotionTypes = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const selectedPromotion = ref(null);
const showConfirmModal = ref(false);
const expandedPromotions = ref({});
const currentPage = ref(1);
const itemsPerPage = 6;
const showSuccessToast = ref(false);
const successMessage = ref('');
const paquete = ref([]);
const selectedPaquete = ref(null);
const queryPaquete = ref('');
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
const filters = ref({
  nombre: "",
  estado: "Todos",
});

const statusOptions = [
  { value: "Todos", label: "Todos", color: "bg-gray-500" },
  { value: "Activo", label: "Activo", color: "bg-green-500" },
  { value: "Inactivo", label: "Inactivo", color: "bg-red-500" },
];
const queryProducto = ref('');
const selectionType = ref('producto');

const archivo = ref('');
const previewUrl = ref('');

const formData = ref({
  Nombre: "",
  Descripcion: "",
  Tipopromocion: { IdTipoPromocion: "" },
  Rango: {
    FechaInicio: "",
    FechaFin: "",
    HoraInicio: "",
    HoraFin: "",
  },
  Promocionproducto: [],
  IdImagen: null,
  Url: '',
});

const productForm = ref({
  IdPromocionProducto:null, 
  Paquete:null,
  Producto: { IdProducto: null,Nombre:'' },
  Cantidad: 1,
  PrecioVenta: 0,
  Descuento: 0
});

const paqueteForm = ref({
  Cantidad: 1,
  PrecioVenta: 0,
});



const editingProductIndex = ref(null);

const availableproductos = computed(() => {
  const addedProductIds = new Set(
    formData.value.Promocionproducto
      .filter(p => p.Producto)
      .map(p => p.Producto.IdProducto)
  );
  if (isEditing.value && productForm.value.Producto) {
    addedProductIds.delete(productForm.value.Producto.IdProducto);
  }
  return productos.value.filter(p => !addedProductIds.has(p.IdProducto));
});


const filteredProductos = computed(() => {
  const addedProductIds = formData.value.Promocionproducto
    .filter(p => p.Producto) // Only consider items that are products
    .map(p => p.Producto.IdProducto);

  const currentEditingProductId = productForm.value.Producto?.IdProducto;

  return productos.value.filter(p => {
    const isAdded = addedProductIds.includes(p.IdProducto);
    const isEditing = p.IdProducto === currentEditingProductId;
    const matchesQuery = queryProducto.value === '' || p.Nombre.toLowerCase().includes(queryProducto.value.toLowerCase());

    return (!isAdded || isEditing) && matchesQuery;
  });
});

const filteredPaquetes = computed(() => {
  const addedPaqueteIds = new Set(
    formData.value.Promocionproducto
      .filter(p => p.Paquete)
      .map(p => p.Paquete.IdPaquete)
  );

  if (editingProductIndex.value !== null && selectedPaquete.value) {
      addedPaqueteIds.delete(selectedPaquete.value.IdPaquete);
  }

  let filtered = paquete.value.filter(p => !addedPaqueteIds.has(p.IdPaquete));

  if (queryPaquete.value !== '') {
    filtered = filtered.filter(p =>
      p.Nombre.toLowerCase().includes(queryPaquete.value.toLowerCase())
    );
  }

  return filtered;
});



// API loading functions
const cargarPromociones = async () => {
  try {
    promotions.value = await listarPromociones();
  } catch (error) {
    mostrarNotificacion('No se pudieron cargar las promociones.', 'error');
  }
};

const cargarProductos = async () => {
  try {
    productos.value = await listarProductos();
    console.log( productos.value)
    for(const prod of productos.value)
    await PrecioProducto(prod.IdProducto)
  } catch (error) {
    mostrarNotificacion('No se pudieron cargar los productos.', 'error');
  }
};
const pp = ref({})
const precioProducto = async (id) => {
  try {
     const response = await PrecioProducto(id);
     pp.value[id] = response;
  } catch (error) {
    mostrarNotificacion('No se pudieron cargar los productos.', 'error');
  }
};

const cargarTipoPromocion = async () => {
  try {
    promotionTypes.value = await listarTipoPromocion();
  } catch (error) {
    mostrarNotificacion('No se pudieron cargar los tipos de promoción.', 'error');
  }
};
const ListarPaquetes = async () => {
  try {
    const response = await listarPaqueteSin();
    paquete.value = response;
  } catch (error) {
    console.error('Error al cargar paquetes y sus presentaciones:', error);
  }
};

onMounted(() => {
  cargarPromociones();
  cargarProductos();
  cargarTipoPromocion();
  ListarPaquetes();
   const intervalo = setInterval(cargarPromociones, 30000); // cada 30 segundos

  onUnmounted(() => {
    clearInterval(intervalo);
  });
});

// Computed properties
const activePromotions = computed(() => {
  return promotions.value.filter(p => p.Estado.IdEstado === 1).length;
});

const filteredPromotions = computed(() => {
  let filtered = promotions.value;

  if (filters.value.nombre) {
    const nombreLower = filters.value.nombre.toLowerCase();
    filtered = filtered.filter(p => p.Nombre.toLowerCase().includes(nombreLower));
  }

  if (filters.value.estado !== "Todos") {
    const estadoId = filters.value.estado === "Activo" ? 1 : 2;
    filtered = filtered.filter(p => p.Estado.IdEstado === estadoId);
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredPromotions.value.length / itemsPerPage);
});

const promotionPrices = ref({});
const originalPromotionPrices = ref({});

const paginatedPromotions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPromotions.value.slice(start, end);
});

watch(paginatedPromotions, (newPromotions) => {
  if (newPromotions.length > 0) {
    newPromotions.forEach(async (p) => {
      if (p.IdPromocion) {
        const prices = await calculatePromotionPrices(p.Promocionproducto);
        promotionPrices.value[p.IdPromocion] = prices.discounted;
        originalPromotionPrices.value[p.IdPromocion] = prices.original;
      }
    });
  }
}, { immediate: true, deep: true });

const paginacionInfo = computed(() => {
  const total = filteredPromotions.value.length;
  const inicio = total === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} promociones`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i);
  }
  return pages;
});

const formatarValidez = (rango) => {
  if (!rango || !rango.FechaFin || !rango.HoraFin) {
    return 'Vigencia no definida';
  }

  try {
    const fechaFin = new Date(rango.FechaFin + 'T00:00:00');
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const nombreDia = diasSemana[fechaFin.getUTCDay()];
    const dia = fechaFin.getUTCDate();
    const nombreMes = meses[fechaFin.getUTCMonth()];
    const anio = fechaFin.getUTCFullYear();

    const horaFin = rango.HoraFin.substring(0, 5);

    return `Válido hasta el ${nombreDia}, ${dia} de ${nombreMes} de ${anio} a las ${horaFin}h`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Vigencia inválida';
  }
};

// Methods
const calculatePromotionPrices = async (productos) => {
  let totalDiscounted = 0;
  let totalOriginal = 0;
  const activeProducts = productos.filter((p) => p.Estado.IdEstado === 1);
  for (const item of activeProducts) {
    let itemOriginalPrice = 0;
    let itemDiscountedPrice = 0;

    if (item.Producto && item.Producto.IdProducto) {
      if (!pp.value[item.Producto.IdProducto]) {
        await precioProducto(item.Producto.IdProducto);
      }
      const priceInfo = pp.value[item.Producto.IdProducto];
      if (priceInfo && priceInfo.Precio) {
        itemOriginalPrice = (priceInfo.Precio || 0) * (item.Cantidad || 0);
        const discount = (item.Descuento || 0) / 100;
        itemDiscountedPrice = itemOriginalPrice * (1 - discount);
      }
    } else if (item.Paquete) {
        itemOriginalPrice = (item.Paquete.PrecioVenta || 0) * (item.Cantidad || 0);
        const discount = (item.Descuento || 0) / 100;
        itemDiscountedPrice = itemOriginalPrice * (1 - discount);
    }
    totalOriginal += itemOriginalPrice;
    totalDiscounted += itemDiscountedPrice;
  }
  return {
    discounted: totalDiscounted.toFixed(2),
    original: totalOriginal.toFixed(2)
  };
};
const precioIndividual= ref({});

const calculateItemPrice = async (item) => {
    if (item.Producto && item.Producto.IdProducto) {
        if (!pp.value[item.Producto.IdProducto]) {
            await precioProducto(item.Producto.IdProducto);
        }
        const priceInfo = pp.value[item.Producto.IdProducto];
        const basePrice = (priceInfo.Precio || 0) * (item.Cantidad || 0);
        const discount = (item.Descuento || 0) / 100;
        return (basePrice * (1 - discount)).toFixed(2);
    } else if (item.Paquete) {
        const paquetePrecio = item.Paquete.PrecioVenta || item.Paquete.precio_venta || 0;
        const basePrice = (paquetePrecio) * (item.Cantidad || 0);
        const discount = (item.Descuento || 0) / 100;
        return (basePrice * (1 - discount)).toFixed(2);
    }
    return '0.00';
}

const calculateProduct = async (product) => {
  if (!product) {
    return '0.00';
  }
  if (!pp.value[product.IdProducto]) {
        await precioProducto(product.IdProducto);
      }
      const priceInfo = pp.value[product.IdProducto];

  return priceInfo.Precio;
};


const calculateProductFormPrice = () => {
  if (!productForm.value.Producto) return '0.00';
  return (productForm.value.PrecioVenta || 0);
};

const calculateTotalPrice = () => {
  const total = formData.value.Promocionproducto
    .filter((p) => p.Estado.IdEstado === 1)
    .reduce((total, product) => {
      return total + Number(product.PrecioVenta || 0);
    }, 0);

  return Number(total.toFixed(2));
};
const precioUnico = ref({})
// Watcher for existing promotions when they are expanded
watch(expandedPromotions, (expanded) => {
  for (const promoId in expanded) {
    if (expanded[promoId]) {
      const promotion = promotions.value.find(p => p.IdPromocion === promoId);
      if (promotion) {
        promotion.Promocionproducto.forEach(async (item) => {
          if (item.IdPromocionProducto) {
            precioIndividual.value[item.IdPromocionProducto] = await calculateItemPrice(item);
            if (item.Producto) {
                precioUnico.value[item.Producto.IdProducto] = await calculateProduct(item.Producto);
            }
          }
        });
      }
    }
  }
}, { deep: true });



const addPaqueteToPromotion = async () => {
  if (!selectedPaquete.value) return;

  const precioUnitario = selectedPaquete.value.PrecioVenta;

  if (precioUnitario === 0) {
    console.error("El precio unitario no puede ser cero.");
    return;
  }

  const precioBase = precioUnitario * paqueteForm.value.Cantidad;
  const descuento = ((precioBase - paqueteForm.value.PrecioVenta) / precioBase) * 100;

  const newPromotionItem = {
    IdPromocionProducto: editingProductIndex.value !== null ? formData.value.Promocionproducto[editingProductIndex.value].IdPromocionProducto : null,
    Paquete: selectedPaquete.value,
    Producto: null,
    Nombre: selectedPaquete.value.Nombre, // For display purposes
    Cantidad: paqueteForm.value.Cantidad,
    PrecioVenta: paqueteForm.value.PrecioVenta,
    Descuento: descuento.toFixed(2),
    Estado: { IdEstado: 1 },
  };

  if (editingProductIndex.value !== null) {
    formData.value.Promocionproducto[editingProductIndex.value] = newPromotionItem;
  } else {
    formData.value.Promocionproducto.push(newPromotionItem);
  }
  cancelEditItem();
}

const toggleExpanded = (id) => {
  expandedPromotions.value[id] = !expandedPromotions.value[id];
};

const editPromotion = async (promotion) => {
  selectionType.value = 'producto';
  selectedPromotion.value = promotion;
  isEditing.value = true;
  formData.value = JSON.parse(JSON.stringify(promotion));
  formData.value.IdImagen = promotion.Imagen?.IdImagen;
  formData.value.Url = promotion.Imagen?.Url
  previewUrl.value = promotion.Imagen?.Url; // Set preview for existing image
  archivo.value = promotion.Imagen?.Url; // Set archivo to URL for handlePhotoUpload to know it's not a new file

  // Calculate prices for items in the form
  await Promise.all(formData.value.Promocionproducto.map(async (item) => {
    if (item.IdPromocionProducto) {
        const price = await calculateItemPrice(item);
        item.PrecioVenta = Number(price);
        precioIndividual.value[item.IdPromocionProducto] = price;
        if (item.Producto) {
            precioUnico.value[item.Producto.IdProducto] = await calculateProduct(item.Producto);
        }
    }
  }));

  showForm.value = true;
};

const deletePromotion = (promotion) => {
  selectedPromotion.value = promotion;
  showConfirmModal.value = true;
};

const confirmDelete = async () => {
  if (selectedPromotion.value) {
    try {
      await eliminarPromocion(selectedPromotion.value.IdPromocion);
      mostrarNotificacion('El estado de la promoción ha sido cambiado.');
      await cargarPromociones();
    } catch (error) {
      mostrarNotificacion('No se pudo cambiar el estado de la promoción.', 'error');
    }
  }
  showConfirmModal.value = false;
  selectedPromotion.value = null;
};

const addProduct = async () => {
  if (!productForm.value.Producto || !productForm.value.Producto.IdProducto) return;

  const selectedProduct = productos.value.find(p => p.IdProducto === productForm.value.Producto.IdProducto);
  if (!selectedProduct) return;

  if (!pp.value[productForm.value.Producto.IdProducto]) {
    await precioProducto(productForm.value.Producto.IdProducto);
  }

  const priceInfo = pp.value[productForm.value.Producto.IdProducto];
  const precioUnitario = priceInfo.Precio || 0;

  if (precioUnitario === 0) {
    console.error("El precio unitario no puede ser cero.");
    return;
  }

  const precioBase = precioUnitario * productForm.value.Cantidad;
  const descuento = ((precioBase - productForm.value.PrecioVenta) / precioBase) * 100;

  const newProduct = {
    IdPromocionProducto: editingProductIndex.value !== null ? formData.value.Promocionproducto[editingProductIndex.value].IdPromocionProducto : null,
    Paquete:null,
    Producto: selectedProduct,
    Cantidad: productForm.value.Cantidad,
    PrecioVenta: productForm.value.PrecioVenta,
    Descuento: descuento.toFixed(2),
    Estado: { IdEstado: 1 },
  };

  if (editingProductIndex.value !== null) {
    formData.value.Promocionproducto[editingProductIndex.value] = newProduct;
  } else {
    formData.value.Promocionproducto.push(newProduct);
  }
  cancelEditItem();
};

const editItem = async (index) => {
  const item = formData.value.Promocionproducto[index];
  editingProductIndex.value = index;

  if (item.Producto) {
    // Logic for editing a product
    selectionType.value = 'producto';
    if (!pp.value[item.Producto.IdProducto]) {
      await precioProducto(item.Producto.IdProducto);
    }
    const priceInfo = pp.value[item.Producto.IdProducto];
    const precioBase = (priceInfo.Precio || 0) * item.Cantidad;
    const precioVenta = precioBase * (1 - (item.Descuento || 0) / 100);

    productForm.value = {
      IdPromocionProducto: item.IdPromocionProducto,
      Paquete: null,
      Producto: item.Producto,
      Cantidad: item.Cantidad,
      PrecioVenta: precioVenta.toFixed(2),
      Descuento: item.Descuento,
    };
  } else if (item.Paquete) {
    // Logic for editing a package
    selectionType.value = 'paquete';
    selectedPaquete.value = item.Paquete;
    const precioVenta = await calculateItemPrice(item);
    paqueteForm.value = {
      Cantidad: item.Cantidad,
      PrecioVenta: Number(precioVenta),
    };
  }
};

const removeProduct = (index) => {
  const product = formData.value.Promocionproducto[index];
  formData.value.Promocionproducto[index] = {
    ...product,
    Estado: { IdEstado: product.Estado.IdEstado === 1 ? 2 : 1 },
  };
};

const cancelEditItem = () => {
  editingProductIndex.value = null;
  productForm.value = {
    IdPromocionProducto:null,
    Producto: null,
    Cantidad: 1,
    PrecioVenta: 0,
    Descuento: 0,
  };
  // Also reset package form
  selectedPaquete.value = null;
  paqueteForm.value.Cantidad = 1;
  paqueteForm.value.PrecioVenta = 0;
};

const savePromotion = async () => {
  await handlePhotoUpload(); // Upload image before saving
 console.log(formData.value)
  const promocionToSend = JSON.parse(JSON.stringify(formData.value));
  promocionToSend.Promocionproducto = promocionToSend.Promocionproducto.map(pp => {
    const item = {
      IdPromocionProducto: pp.IdPromocionProducto,
      Cantidad: pp.Cantidad,
      Descuento: pp.Descuento,
      IdEstado: pp.Estado.IdEstado,
    };
    if (pp.Producto) {    
      item.IdProducto = pp.Producto.IdProducto;
    } else 
    if (pp.Paquete) {
      item.IdPaquete = pp.Paquete.IdPaquete;
    }
    return item;
  });
console.log(promocionToSend)
  try {
  console.log(promocionToSend)
    let response;
    if (isEditing.value) {
      response = await actualizarPromocion(promocionToSend);
      
    } else {
      response = await registrarPromocion(promocionToSend);
    }
    
    await cargarPromociones();
    showForm.value = false;
    mostrarNotificacion(response.message);
  } catch (error) {
    mostrarNotificacion('Ocurrió un error al guardar la promoción.', 'error');
  }
};

const resetForm = () => {
  formData.value = {
    Nombre: "",
    Descripcion: "",
    Tipopromocion: { IdTipoPromocion: "" },
    Rango: { FechaInicio: "", FechaFin: "", HoraInicio: "", HoraFin: "" },
    Promocionproducto: [],
    IdImagen: null,
    Url: '',
  };
  productForm.value = {
    Paquete:null,
    Producto: null,
    Cantidad: 1,
    PrecioVenta: 0,
    Descuento: 0,
  };
  paqueteForm.value.Cantidad = 1;
  paqueteForm.value.PrecioVenta = 0;
  editingProductIndex.value = null;
  isEditing.value = false;
  selectedPromotion.value = null;
  selectionType.value = 'producto';
  previewUrl.value = ''; // Clear preview URL
  archivo.value = ''; // Clear selected file
};

watch(showForm, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

const mostrarNotificacion = (mensaje, tipo = 'success') => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handlePhotoUpload = async () => {
  if (!archivo.value || (isEditing.value && typeof archivo.value === 'string')) {
    return;
  }
  try {
    const imageUrl = await SubirFoto(archivo.value);
    formData.value.Url = imageUrl;
  } catch (error) {
    mostrarNotificacion('No se pudo subir la imagen.', 'error');
  }
};
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
</style>