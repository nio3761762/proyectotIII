<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Package class="h-8 w-8" />
            <div>
              <h2 class="text-xl font-bold">Administrar Ingredientes</h2>
              <p class="text-sm text-red-200">{{ product?.Producto?.Nombre }}</p>
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
          
          <!-- Left Column: Form -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Plus class="h-5 w-5 text-orange-500" />
                {{ ingredienteEnEdicionIndex === null ? 'Agregar Ingrediente' : 'Editar Ingrediente' }}
            </h3>
            <div>
              <label class="text-sm font-semibold text-gray-600">Insumo <span class="text-red-500">*</span></label>
              <select 
                v-model="nuevoIngrediente.IdInsumo"
                @blur="errors.insumo = validateIngredientField('insumo', nuevoIngrediente.IdInsumo)"
                @change="errors.insumo = validateIngredientField('insumo', nuevoIngrediente.IdInsumo)"
                :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', errors.insumo ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200']"
              >
                <option disabled value="">Seleccione un insumo</option>
                <option v-for="insumo in insumos" :key="insumo.IdProducto" :value="insumo.IdProducto">
                  {{ insumo.Nombre }}
                </option>
              </select>
              <p v-if="errors.insumo" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ errors.insumo }}
              </p>
            </div>
            
            <!-- Medidas -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-600">Categoría <span class="text-red-500">*</span></label>
                <select 
                  v-model="nuevoIngrediente.IdCategoriaMedida"
                  @blur="errors.categoriaMedida = validateIngredientField('categoriaMedida', nuevoIngrediente.IdCategoriaMedida)"
                  @change="errors.categoriaMedida = validateIngredientField('categoriaMedida', nuevoIngrediente.IdCategoriaMedida); cargarMedidasIngrediente()"
                  :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', errors.categoriaMedida ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200']"
                >
                  <option disabled value="">Seleccione</option>
                  <option v-for="cat in categoriaMedidas" :key="cat.IdCategoriaMedida" :value="cat.IdCategoriaMedida">
                    {{ cat.Nombre }}
                  </option>
                </select>
                <p v-if="errors.categoriaMedida" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ errors.categoriaMedida }}
                </p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-600">Unidad <span class="text-red-500">*</span></label>
                <select 
                  v-model="nuevoIngrediente.IdUnidadMedida"
                  :disabled="!nuevoIngrediente.IdCategoriaMedida"
                  @blur="errors.unidadMedida = validateIngredientField('unidadMedida', nuevoIngrediente.IdUnidadMedida)"
                  @change="errors.unidadMedida = validateIngredientField('unidadMedida', nuevoIngrediente.IdUnidadMedida)"
                  :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:bg-gray-100', errors.unidadMedida ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200']"
                >
                  <option disabled value="">Seleccione</option>
                  <option v-for="medida in medidasIngrediente" :key="medida.IdUnidadMedida" :value="medida.IdUnidadMedida">
                    {{ medida.Nombre }}
                  </option>
                </select>
                <p v-if="errors.unidadMedida" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ errors.unidadMedida }}
                </p>
              </div>
            </div>
            
            <!-- Cantidad Insumo -->
            <div>
              <label class="text-sm font-semibold text-gray-600">Cantidad de Insumo <span class="text-red-500">*</span></label>
              <input 
                type="number" 
                v-model.number="nuevoIngrediente.Cantidad" 
                placeholder="Ej: 100"
                @blur="errors.cantidad = validateIngredientField('cantidad', nuevoIngrediente.Cantidad)"
                @input="errors.cantidad = validateIngredientField('cantidad', nuevoIngrediente.Cantidad)"
                :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', errors.cantidad ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200']"
              />
              <p v-if="errors.cantidad" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ errors.cantidad }}
              </p>
            </div>
            
            <!-- Cantidad Producida -->
            <div>
              <label class="text-sm font-semibold text-gray-600">Cantidad Producida (Receta)</label>
              <input type="number" v-model.number="cantidadProducida" placeholder="1" min="1" class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
            </div>

            <!-- Buttons -->
            <div class="pt-2">
              <div v-if="ingredienteEnEdicionIndex === null">
                <button @click.prevent="agregarIngrediente" :disabled="isFormInvalid" class="w-full px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus class="h-5 w-5" />
                  Agregar a la Lista
                </button>
              </div>
              <div v-else class="flex gap-4">
                <button @click.prevent="actualizarIngrediente" :disabled="isFormInvalid" class="flex-1 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save class="h-5 w-5" />
                  Guardar
                </button>
                <button @click.prevent="cancelarEdicionIngrediente" class="flex-1 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2">
                  <X class="h-5 w-5" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: List -->
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package class="h-5 w-5 text-orange-500" />
              Ingredientes Agregados
            </h3>
            <div v-if="ingredientesProducto.length > 0" class="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div v-for="(ing, index) in ingredientesProducto" :key="index" 
                    class="bg-white/60 rounded-2xl p-4 border border-gray-200 flex justify-between items-center transition-colors"
                    :class="{'bg-orange-100 text-orange-900 font-semibold': ingredienteEnEdicionIndex === index, 'hover:bg-white/80': ingredienteEnEdicionIndex !== index}">
                    
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800">{{ getInsumoName(ing.ingredienteId) }}</p>
                        <p class="text-sm text-gray-600">Cantidad: {{ quitarDecimalesCero(ing.totalPeso) }} {{ getMedidaName(ing.UnidadmedidaId) }}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <button @click.prevent="editarIngrediente(index)" :disabled="ingredienteEnEdicionIndex !== null" class="text-orange-600 hover:text-orange-800 disabled:text-gray-300 disabled:cursor-not-allowed p-1 rounded-md hover:bg-orange-100 transition-colors">
                            <Pencil class="h-4 w-4" />
                        </button>
                        <button @click.prevent="quitarIngrediente(index)" :disabled="ingredienteEnEdicionIndex !== null" class="text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed p-1 rounded-md hover:bg-red-100 transition-colors">
                            <Trash2 class="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-10 text-gray-400 h-full flex flex-col justify-center items-center">
               <Package class="h-12 w-12 text-gray-300 mb-4" />
              <p class="font-semibold text-gray-600">No hay ingredientes</p>
              <p class="text-sm">Agregue uno desde el formulario.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-100 p-4 flex justify-end gap-4 flex-shrink-0 border-t">
        <button @click="closeModal" class="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-300 font-semibold">
          Cancelar
        </button>
        <button @click="guardarIngredientes" class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2">
          <Save class="h-5 w-5" />
          Guardar Receta
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, reactive } from 'vue';
import { Package, Plus, X, Save, AlertCircle, Pencil, Trash2 } from 'lucide-vue-next';
import { listarInsumos } from '@/Server/Insumo';
import { ObtenerMedidas, listarCategoriaMedidas, ObtenrCategoriaMedida } from '@/Server/Medida';
import { actualizarIngredienteReceta, getProductoIngrediente } from '@/Server/Ingrediente';

const props = defineProps({
  show: Boolean,
  product: Object,
});

const emit = defineEmits(['close', 'ingredients-updated']);

// Component State
const insumos = ref([]);
const categoriaMedidas = ref([]);
const medidasIngrediente = ref([]);
const todasLasMedidas = ref([]);
const ingredientesProducto = ref([]);
const ingredienteEnEdicionIndex = ref(null);
const cantidadProducida = ref(1);

const nuevoIngrediente = ref({
  IdIngrediente: '',
  IdInsumo: '',
  IdCategoriaMedida: '',
  IdUnidadMedida: '',
  Cantidad: null,
});

// Validation
const errors = reactive({
  insumo: '',
  categoriaMedida: '',
  unidadMedida: '',
  cantidad: '',
});

const validateIngredientField = (field, value) => {
  let error = '';
  switch (field) {
    case 'insumo':
      if (!value) error = 'Debe seleccionar un insumo.';
      break;
    case 'categoriaMedida':
      if (!value) error = 'Debe seleccionar una categoría.';
      break;
    case 'unidadMedida':
      if (!value) error = 'Debe seleccionar una unidad.';
      break;
    case 'cantidad':
      if (value === null || value === undefined) error = 'La cantidad es requerida.';
      else if (isNaN(value) || Number(value) <= 0) error = 'La cantidad debe ser mayor a 0.';
      break;
    default:
      break;
  }
  return error;
};

const isFormInvalid = computed(() => {
  return !nuevoIngrediente.value.IdInsumo ||                                                                                                                                                
     !nuevoIngrediente.value.IdCategoriaMedida ||                                                                                                                                       
     !nuevoIngrediente.value.IdUnidadMedida ||                                                                                                                                          
         !nuevoIngrediente.value.Cantidad ||                                                                                                                                                
          nuevoIngrediente.value.Cantidad <= 0;  
});

const resetErrors = () => {
  errors.insumo = '';
  errors.categoriaMedida = '';
  errors.unidadMedida = '';
  errors.cantidad = '';
};

// Computed Properties
const getInsumoName = (id) => {
  const insumo = insumos.value.find(i => i.IdProducto === id);
  return insumo ? insumo.Nombre : 'Desconocido';
};

const getMedidaName = (id) => {
  const medida = todasLasMedidas.value.find(m => m.IdUnidadMedida === id);
  return medida ? medida.Nombre : 'Desconocida';
};

// Methods
const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  nuevoIngrediente.value = {
    IdIngrediente: '',
    IdInsumo: '',
    IdCategoriaMedida: '',
    IdUnidadMedida: '',
    Cantidad: null,
  };
  medidasIngrediente.value = [];
  ingredienteEnEdicionIndex.value = null;
  resetErrors();
};

const cargarInsumos = async () => {
  try {
    insumos.value = await listarInsumos();
  } catch (error) {
    console.error('Error al cargar insumos:', error);
  }
};

const cargarCategoriasMedida = async () => {
  try {
    categoriaMedidas.value = await listarCategoriaMedidas();
    const promesas = categoriaMedidas.value.map(cat => ObtenerMedidas(cat.IdCategoriaMedida));
    const arraysDeMedidas = await Promise.all(promesas);
    todasLasMedidas.value = [].concat(...arraysDeMedidas);
  } catch (error) {
    console.error('Error al cargar categorías de medida:', error);
  }
};

const cargarMedidasIngrediente = async () => {
  if (nuevoIngrediente.value.IdCategoriaMedida) {
    try {
      medidasIngrediente.value = await ObtenerMedidas(nuevoIngrediente.value.IdCategoriaMedida);
    } catch (error) {
      console.error('Error al cargar medidas:', error);
      medidasIngrediente.value = [];
    }
  } else {
    medidasIngrediente.value = [];
  }
};

const fetchIngredientesProducto = async (productId) => {
  if (productId) {
    try {
      const response = await getProductoIngrediente(productId);
      const registeredQuantity = props.product.Producto.Cantidad > 0 ? props.product.Producto.Cantidad : 1;
      ingredientesProducto.value = response.map(ing => {
        const basePeso = ing.Peso / registeredQuantity;
        return {
          IdIngrediente: ing.IdIngrediente,
          ingredienteId: ing.IdInsumo,
          basePeso: basePeso,
          totalPeso: ing.Peso,
          UnidadmedidaId: ing.IdUnidadMedida,
        }
      });
    } catch (error) {
      console.error('Error al cargar ingredientes del producto:', error);
      ingredientesProducto.value = [];
    }
  }
};

const validateForm = () => {
  errors.insumo = validateIngredientField('insumo', nuevoIngrediente.value.IdInsumo);
  errors.categoriaMedida = validateIngredientField('categoriaMedida', nuevoIngrediente.value.IdCategoriaMedida);
  errors.unidadMedida = validateIngredientField('unidadMedida', nuevoIngrediente.value.IdUnidadMedida);
  errors.cantidad = validateIngredientField('cantidad', nuevoIngrediente.value.Cantidad);
  return !Object.values(errors).some(e => e);
}

const agregarIngrediente = () => {
  if (!validateForm()) {
    return;
  }

  const isDuplicate = ingredientesProducto.value.some(
    (ing) => ing.ingredienteId === nuevoIngrediente.value.IdInsumo
  );

  if (isDuplicate) {
    // Here you might want to show a toast or an alert
    console.warn("Este insumo ya ha sido agregado.");
    return;
  }

  const currentQuantity = cantidadProducida.value > 0 ? cantidadProducida.value : 1;
  const basePeso = nuevoIngrediente.value.Cantidad / currentQuantity;

  ingredientesProducto.value.push({
    ingredienteId: nuevoIngrediente.value.IdInsumo,
    basePeso: basePeso,
    totalPeso: nuevoIngrediente.value.Cantidad,
    UnidadmedidaId: nuevoIngrediente.value.IdUnidadMedida,
  });
  resetForm();
};

const editarIngrediente = async (index) => {
  resetErrors();
  ingredienteEnEdicionIndex.value = index;
  const ingredienteAEditar = ingredientesProducto.value[index];

  try {
    const Categoria = await ObtenrCategoriaMedida(ingredienteAEditar.UnidadmedidaId);
    if (!Categoria) {
      console.error(`Category not found for measure ID: ${ingredienteAEditar.UnidadmedidaId}`);
      return;
    }

    nuevoIngrediente.value.IdCategoriaMedida = Categoria.IdCategoriaMedida;
    await cargarMedidasIngrediente();

    nuevoIngrediente.value.IdIngrediente = ingredienteAEditar.IdIngrediente;
    nuevoIngrediente.value.IdInsumo = ingredienteAEditar.ingredienteId;
    nuevoIngrediente.value.Cantidad = ingredienteAEditar.basePeso;
    nuevoIngrediente.value.IdUnidadMedida = ingredienteAEditar.UnidadmedidaId;
  } catch (error) {
    console.error('Error setting up ingredient for editing:', error);
  }
};

const actualizarIngrediente = () => {
  if (ingredienteEnEdicionIndex.value === null || !validateForm()) {
    return;
  }

  const isDuplicate = ingredientesProducto.value.some(
    (ing, idx) => idx !== ingredienteEnEdicionIndex.value && ing.ingredienteId === nuevoIngrediente.value.IdInsumo
  );

  if (isDuplicate) {
    console.warn("Este insumo ya ha sido agregado.");
    return;
  }

  const currentQuantity = cantidadProducida.value > 0 ? cantidadProducida.value : 1;
  const newBasePeso = nuevoIngrediente.value.Cantidad / currentQuantity;

  ingredientesProducto.value[ingredienteEnEdicionIndex.value] = {
    IdIngrediente: nuevoIngrediente.value.IdIngrediente,
    ingredienteId: nuevoIngrediente.value.IdInsumo,
    basePeso: newBasePeso,
    totalPeso: nuevoIngrediente.value.Cantidad,
    UnidadmedidaId: nuevoIngrediente.value.IdUnidadMedida,
  };
  cancelarEdicionIngrediente();
};

const cancelarEdicionIngrediente = () => {
  ingredienteEnEdicionIndex.value = null;
  resetForm();
};

const quitarIngrediente = (index) => {
  ingredientesProducto.value.splice(index, 1);
};

const guardarIngredientes = async () => {
  if (!props.product?.Producto?.IdProducto) {
    return;
  }
  const payload = {
    productId: props.product.Producto.IdProducto,
    cantidadProducida: cantidadProducida.value,
    ingredientes: ingredientesProducto.value.map(ing => ({
      IdIngrediente: ing.IdIngrediente,
      ingredienteId: ing.ingredienteId,
      totalPeso: ing.basePeso * cantidadProducida.value,
      UnidadmedidaId: ing.UnidadmedidaId,
    })),
  };
  try {
    await actualizarIngredienteReceta(props.product.Producto.IdProducto, payload);
    emit('ingredients-updated');
    closeModal();
  } catch (error) {
    console.error('Error al guardar ingredientes:', error);
  }
};
const quitarDecimalesCero = (valor) => {
  return Number(valor).toString();
};
// Watchers
watch(cantidadProducida, (newQuantity) => {
  if (newQuantity > 0) {
    ingredientesProducto.value.forEach(ing => {
      ing.totalPeso = ing.basePeso * newQuantity;
    });
  }
});

// Watchers
watch(cantidadProducida, (newQuantity) => {
  if (newQuantity > 0) {
    ingredientesProducto.value.forEach(ing => {
      ing.totalPeso = ing.basePeso * newQuantity;
    });
  }
});

watch(() => props.show, (newVal) => {
  if (newVal && props.product) {
    resetForm();
    fetchIngredientesProducto(props.product.Producto.IdProducto);
    cantidadProducida.value = props.product.Producto.Cantidad;
  } else if (!newVal) {
    ingredientesProducto.value = [];
    resetForm();
  }
});

watch(() => nuevoIngrediente.value.IdCategoriaMedida, (newVal) => {
  if (ingredienteEnEdicionIndex.value === null) {
    nuevoIngrediente.value.IdUnidadMedida = '';
  }
  if (newVal) {
    cargarMedidasIngrediente();
  } else {
    medidasIngrediente.value = [];
  }
});

// Lifecycle Hooks
onMounted(() => {
  cargarInsumos();
  cargarCategoriasMedida();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
