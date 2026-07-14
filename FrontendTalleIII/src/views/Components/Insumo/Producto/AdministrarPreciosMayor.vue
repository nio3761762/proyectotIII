<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Tag class="h-8 w-8" />
            <div>
              <h2 class="text-xl font-bold">Precios al por Mayor</h2>
              <p class="text-sm text-blue-100">{{ productDescription }}</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto flex-grow bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Columna izquierda: Formulario -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Plus class="h-5 w-5 text-blue-500" />
              {{ editIndex === null ? 'Nuevo Precio Mayor' : 'Editar Precio Mayor' }}
            </h3>

            <!-- Presentación del Producto -->
            <div>
              <label class="text-sm font-semibold text-gray-600">Presentación <span class="text-red-500">*</span></label>
              <select
                v-model="form.idproductomedida"
                @change="onMedidaChange"
                class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl transition-all text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50">
                <option disabled value="">Seleccione una presentación</option>
                <option v-for="pm in productomedidas" :key="pm.idproductomedida" :value="pm.idproductomedida">
                  {{ pm.presentacionNombre }} (x {{ pm.cantidad }}) - Bs. {{ pm.precioVenta }}
                </option>
              </select>
            </div>

            <!-- Cantidad Mínima -->
            <div>
              <label class="text-sm font-semibold text-gray-600">Cantidad Mínima <span class="text-red-500">*</span></label>
              <input
                type="number"
                v-model.number="form.cantidad"
                placeholder="Ej: 12"
                class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl transition-all text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <!-- Precio -->
            <div>
              <label class="text-sm font-semibold text-gray-600">Precio (Bs.) <span class="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                v-model.number="form.precio"
                placeholder="Ej: 10.50"
                class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl transition-all text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button
                @click="resetFormPreserveMedida"
                class="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                @click="addToPending"
                :disabled="!form.idproductomedida || !form.cantidad || !form.precio"
                class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save class="h-4 w-4" />
                {{ editIndex === null ? 'Agregar' : 'Actualizar' }}
              </button>
            </div>
          </div>

          <!-- Columna derecha: Lista -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <List class="h-5 w-5 text-blue-500" />
              Precios Configurados
            </h3>

            <div class="space-y-3">
              <div v-if="!form.idproductomedida" class="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                <p class="text-gray-400 italic">Selecciona una presentación para ver sus precios</p>
              </div>
              <div v-else-if="localPrecios.length === 0" class="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                <p class="text-gray-400 italic">No hay precios configurados para esta presentación</p>
              </div>

              <div
                v-for="(item, index) in localPrecios"
                :key="index"
                :class="['bg-white p-4 rounded-2xl border transition-all flex items-center justify-between group',
                  item.estado === 0 ? 'bg-gray-100 border-gray-200 opacity-60 grayscale' : 'border-gray-100 hover:shadow-md']"
              >
                <div class="flex items-center gap-4">
                  <div :class="['p-3 rounded-xl', item.estado === 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-50 text-blue-600']">
                    <Tag class="h-5 w-5" />
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">Bs. {{ item.precio }}</p>
                    <p class="text-xs text-gray-500">Desde {{ item.cantidad }} unidades</p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button
                    @click="editItem(index)"
                    :disabled="item.estado === 0"
                    :class="['p-2 rounded-xl transition-colors',
                      item.estado === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-orange-500 hover:bg-orange-50']"
                    title="Editar"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    @click="toggleStatus(index)"
                    :class="['p-2 rounded-xl transition-all duration-300',
                      item.estado === 0 
                        ? 'text-green-600 bg-green-100 hover:bg-green-200 shadow-lg shadow-green-500/50 animate-pulse scale-110' 
                        : 'text-red-500 hover:bg-red-50']"
                    :title="item.estado === 0 ? 'Activar' : 'Desactivar'"
                  >
                    <component :is="item.estado === 0 ? Eye : EyeOff" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 bg-white border-t border-gray-100 flex justify-end gap-4 flex-shrink-0">
        <button
          @click="closeModal"
          class="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
        >
          Cerrar
        </button>
        <button
          @click="saveAll"
          :disabled="guardando || !hasChanges"
          class="px-10 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all font-bold flex items-center gap-2"
        >
          <LoaderCircle v-if="guardando" class="h-5 w-5 animate-spin" />
          <CheckCircle v-else class="h-5 w-5" />
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { Tag, X, Plus, Save, List, Pencil, Eye, EyeOff, CheckCircle, LoaderCircle } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  product: Object,
  guardando: Boolean
});

const emit = defineEmits(['close', 'guardar']);

// Estado
const productomedidas = computed(() => {
  if (!props.product) return [];
  // Asegurarnos de acceder correctamente a la estructura, ya sea de Insumo.vue o de RegistrarProducto.vue
  const medidas = props.product.Productomedida || props.product.productomedida || [];
  return medidas.map(m => ({
    idproductomedida: m.IdProductoMedida ?? m.idproductomedida,
    presentacionNombre: m.Presentacion?.Nombre ?? m.Presentacion?.nombre ?? 'Sin nombre',
    cantidad: m.Cantidad ?? m.cantidad ?? 0,
    precioVenta: m.PrecioVenta ?? m.precioventa ?? 0,
    precios: m.Productomedidaprecio || m.productomedidaprecio || []
  }));
});

const productDescription = computed(() => {
  return props.product?.nombre || props.product?.Nombre || 'Producto';
});

const form = reactive({
  idproductomedidaprecio: null,
  idproductomedida: '',
  cantidad: null,
  precio: null,
  estado: 1
});

const editIndex = ref(null);
const localPrecios = ref([]);
const hasChanges = ref(false);

const closeModal = () => {
  resetForm();
  localPrecios.value = [];
  hasChanges.value = false;
  emit('close');
};

const resetForm = () => {
  form.idproductomedidaprecio = null;
  form.idproductomedida = '';
  form.cantidad = null;
  form.precio = null;
  form.estado = 1;
  editIndex.value = null;
};

const resetFormPreserveMedida = () => {
  const selectedMedida = form.idproductomedida;
  resetForm();
  form.idproductomedida = selectedMedida;
};

const onMedidaChange = () => {
  const medida = productomedidas.value.find(m => m.idproductomedida === form.idproductomedida);
  if (medida) {
    localPrecios.value = medida.precios.map(p => ({
      idproductomedidaprecio: p.IdProductoMedidaPrecio ?? p.idproductomedidaprecio,
      idproductomedida: form.idproductomedida,
      cantidad: p.CantidadMinima ?? p.cantidadminima ?? p.Cantidad ?? p.cantidad,
      precio: p.Precio ?? p.precio,
      estado: p.Estado ?? p.estado ?? 1
    }));
  } else {
    localPrecios.value = [];
  }
  resetFormPreserveMedida();
  hasChanges.value = false;
};

const addToPending = () => {
  if (!form.idproductomedida || form.cantidad === null || form.precio === null) return;

  const item = {
    idproductomedidaprecio: form.idproductomedidaprecio,
    idproductomedida: form.idproductomedida,
    cantidad: form.cantidad,
    precio: form.precio,
    estado: form.estado
  };

  if (editIndex.value !== null) {
    localPrecios.value[editIndex.value] = item;
  } else {
    localPrecios.value.push(item);
  }

  hasChanges.value = true;
  resetFormPreserveMedida();
};

const editItem = (index) => {
  const item = localPrecios.value[index];
  editIndex.value = index;
  form.idproductomedidaprecio = item.idproductomedidaprecio;
  form.idproductomedida = item.idproductomedida;
  form.cantidad = item.cantidad;
  form.precio = item.precio;
  form.estado = item.estado;
};

const toggleStatus = (index) => {
  localPrecios.value[index].estado = localPrecios.value[index].estado === 1 ? 0 : 1;
  hasChanges.value = true;
};

const saveAll = () => {
  // Mapear al formato que espera el servidor
  const payload = localPrecios.value.map(p => ({
    IdProductomedidaprecio: p.idproductomedidaprecio,
    Idproductomedida: p.idproductomedida,
    Cantidad: p.cantidad,
    precio: p.precio,
    Estado: p.estado
  }));

  emit('guardar', payload);
};

// Sincronizar cuando el producto cambie o el modal se abra
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Resetear el estado cada vez que se abre el modal
    resetForm();
    localPrecios.value = [];
    hasChanges.value = false;

    if (props.product) {
      // Si solo hay una medida, seleccionarla automáticamente
      if (productomedidas.value.length === 1) {
        form.idproductomedida = productomedidas.value[0].idproductomedida;
        onMedidaChange();
      }
    }
  }
});
</script>
