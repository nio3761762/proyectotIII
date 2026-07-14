<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Package class="h-8 w-8" />
            <div>
              <h2 class="text-xl font-bold">Administrar Ingredientes</h2>
              <p class="text-sm text-red-200">{{ displayProductName }}</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto flex-grow bg-gray-50">
        <!-- Loading Receta -->
        <div v-if="cargandoReceta" class="flex flex-col items-center justify-center py-20 space-y-4">
          <LoaderCircle class="h-12 w-12 text-orange-500 animate-spin" />
          <p class="text-gray-500 font-medium">Cargando receta del producto...</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Columna izquierda: Formulario -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Plus class="h-5 w-5 text-orange-500" />
              {{ ingredienteEnEdicionIndex === null ? 'Agregar Ingrediente' : 'Editar Ingrediente' }}
            </h3>

            <!-- Insumo -->
            <div>
              <label class="text-sm font-semibold text-gray-600">Insumo <span class="text-red-500">*</span></label>
              <select
                v-model="nuevoIngrediente.IdInsumo"
                @change="errors.insumo = validateIngredientField('insumo', nuevoIngrediente.IdInsumo)"
                :class="selClass(errors.insumo)">
                <option disabled value="">Seleccione un insumo</option>
                <option v-for="insumo in allInsumos" :key="insumo.idinsumo" :value="insumo.idinsumo">
                  {{ insumo.nombre }}
                </option>
              </select>
              <p v-if="errors.insumo" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />{{ errors.insumo }}
              </p>
            </div>

            <!-- Categoría + Unidad -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-600">Categoría <span class="text-red-500">*</span></label>
                <select
                  v-model="selCategoriaMedida"
                  @change="onCategoriaMedidaChange"
                  :class="selClass(errors.categoriaMedida)">
                  <option disabled value="">Seleccione</option>
                  <option v-for="cat in categoriaMedidas" :key="cat.idcategoriamedida" :value="cat.idcategoriamedida">
                    {{ cat.nombre }}
                  </option>
                </select>
                <p v-if="errors.categoriaMedida" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />{{ errors.categoriaMedida }}
                </p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-600">Unidad <span class="text-red-500">*</span></label>
                <select
                  v-model="nuevoIngrediente.IdUnidadMedida"
                  :disabled="!selCategoriaMedida || cargandoUnidades"
                  @change="errors.unidadMedida = validateIngredientField('unidadMedida', nuevoIngrediente.IdUnidadMedida)"
                  :class="selClass(errors.unidadMedida)">
                  <option disabled value="">{{ cargandoUnidades ? 'Cargando...' : 'Seleccione' }}</option>
                  <option v-for="medida in medidasIngrediente" :key="medida.idunidadmedida" :value="medida.idunidadmedida">
                    {{ medida.nombre }} ({{ medida.abreviatura }})
                  </option>
                </select>
                <p v-if="errors.unidadMedida" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />{{ errors.unidadMedida }}
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
                @input="errors.cantidad = validateIngredientField('cantidad', nuevoIngrediente.Cantidad)"
                :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50',
                  errors.cantidad ? 'border-red-400' : 'border-gray-200']"
              />
              <p v-if="errors.cantidad" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />{{ errors.cantidad }}
              </p>
            </div>

            <div class="border-t border-gray-200 pt-4 space-y-4">
              <h4 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Datos de la Receta</h4>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <Package class="h-3.5 w-3.5" /> Rendimiento
                  </label>
                  <input type="number" v-model.number="rendimiento" placeholder="1" min="1"
                    class="w-full px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <Timer class="h-3.5 w-3.5" /> Tiempo (min)
                  </label>
                  <input type="number" v-model.number="tiempoHorneado" placeholder="0" min="0"
                    class="w-full px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Boxes class="h-3.5 w-3.5" /> Cantidad por Lata
                </label>
                <input type="number" v-model.number="cantidadPorLata" placeholder="0" min="0"
                  class="w-full px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
            </div>

            <!-- Botones -->
            <div class="pt-2">
              <div v-if="ingredienteEnEdicionIndex === null">
                <button @click.prevent="agregarIngrediente" :disabled="isFormInvalid"
                  class="w-full px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg">
                  <Plus class="h-5 w-5" /> Agregar a la Lista
                </button>
              </div>
              <div v-else class="flex gap-4">
                <button @click.prevent="actualizarIngrediente" :disabled="isFormInvalid"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save class="h-5 w-5" /> Guardar
                </button>
                <button @click.prevent="cancelarEdicionIngrediente"
                  class="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <X class="h-5 w-5" /> Cancelar
                </button>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Lista de ingredientes -->
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package class="h-5 w-5 text-orange-500" />
              Ingredientes Agregados
            </h3>
            <div v-if="ingredientesProducto.length > 0" class="space-y-3 max-h-96 overflow-y-auto pr-2">
              <div v-for="(ing, index) in ingredientesProducto" :key="index"
                class="bg-white/60 rounded-2xl p-4 border border-gray-200 flex justify-between items-center transition-colors"
                :class="{'ring-2 ring-orange-400 bg-orange-50': ingredienteEnEdicionIndex === index}">
                <div class="flex items-center gap-4 flex-1">
                  <div class="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 shadow-sm">
                    <img v-if="ing.imagen" :src="ing.imagen" :alt="ing.nombre" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-orange-50">
                      <Package class="h-6 w-6 text-orange-200" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800 line-clamp-1">{{ ing.nombre }}</p>
                    <p class="text-sm text-gray-600">Cantidad: {{ quitarDecimalesCero(ing.totalPeso) }} {{ getMedidaName(ing.UnidadmedidaId) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
                  <button @click.prevent="editarIngrediente(index)"
                    :disabled="ingredienteEnEdicionIndex !== null && ingredienteEnEdicionIndex !== index"
                    class="text-orange-600 hover:text-orange-800 disabled:text-gray-300 disabled:cursor-not-allowed p-2 rounded-xl hover:bg-orange-100 transition-colors">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button @click.prevent="quitarIngrediente(index)"
                    :disabled="ingredienteEnEdicionIndex !== null"
                    class="text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed p-2 rounded-xl hover:bg-red-100 transition-colors">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-10 text-gray-400 flex flex-col justify-center items-center h-full">
              <Package class="h-12 w-12 text-gray-300 mb-4" />
              <p class="font-semibold text-gray-600">No hay ingredientes</p>
              <p class="text-sm">Agregue uno desde el formulario.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-100 p-4 flex justify-end gap-4 flex-shrink-0 border-t">
        <button @click="closeModal"
          class="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-all">
          Cancelar
        </button>
        <button @click="handleGuardar" :disabled="guardando"
          class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 transition-all">
          <LoaderCircle v-if="guardando" class="h-5 w-5 animate-spin" />
          <Save v-else class="h-5 w-5" />
          {{ guardando ? 'Guardando...' : 'Guardar Receta' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive } from 'vue';
import { Package, Plus, X, Save, AlertCircle, Pencil, Trash2, LoaderCircle, Timer, Boxes } from 'lucide-vue-next';
import { ObtenerMedidas } from '@/Server/Medida';
import { getProductoIngrediente, eliminarIngredienteReceta } from '@/Server/Ingrediente';

const props = defineProps({
  show: Boolean,
  product: Object,
  guardando: Boolean,
  allInsumos:      { type: Array, default: () => [] },
  categoriaMedidas:{ type: Array, default: () => [] },
  todasLasUnidades:{ type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'guardar']);

const medidasIngrediente      = ref([]);
const ingredientesProducto    = ref([]);
const ingredienteEnEdicionIndex = ref(null);
const selCategoriaMedida      = ref('');
const cargandoUnidades        = ref(false);
const cargandoReceta          = ref(false);

const idReceta                = ref(null);
const rendimiento             = ref(1);
const tiempoHorneado          = ref(0);
const cantidadPorLata         = ref(0);

const nuevoIngrediente = ref({ IdIngrediente: '', IdInsumo: '', IdUnidadMedida: '', Cantidad: null });

const errors = reactive({ insumo: '', categoriaMedida: '', unidadMedida: '', cantidad: '' });

const displayProductName = computed(() =>
  props.product?.Producto?.nombre || props.product?.Producto?.Nombre ||
  props.product?.nombre || props.product?.Nombre || 'Sin nombre'
);

const productId = computed(() =>
  props.product?.Producto?.idproducto || props.product?.Producto?.IdProducto ||
  props.product?.idproducto || props.product?.IdProducto
);

// ── Validaciones ──────────────────────────────────────────────────────────────
const validateIngredientField = (field, value) => {
  switch (field) {
    case 'insumo':        return !value ? 'Debe seleccionar un insumo.' : '';
    case 'categoriaMedida': return !value ? 'Debe seleccionar una categoría.' : '';
    case 'unidadMedida':  return !value ? 'Debe seleccionar una unidad.' : '';
    case 'cantidad':      return (!value && value !== 0) || isNaN(value) || Number(value) <= 0 ? 'La cantidad debe ser mayor a 0.' : '';
    default: return '';
  }
};

const isFormInvalid = computed(() =>
  !nuevoIngrediente.value.IdInsumo ||
  !selCategoriaMedida.value ||
  !nuevoIngrediente.value.IdUnidadMedida ||
  !nuevoIngrediente.value.Cantidad ||
  nuevoIngrediente.value.Cantidad <= 0
);

const getMedidaName = (id) => {
  const found = props.todasLasUnidades.find(m => m.idunidadmedida === id || m.IdUnidadMedida === id);
  if (found) return found.nombre ?? found.Nombre ?? '';
  const fromForm = medidasIngrediente.value.find(m => m.idunidadmedida === id);
  return fromForm?.nombre ?? 'Desconocida';
};

// ── Métodos ───────────────────────────────────────────────────────────────────
const closeModal = () => { emit('close'); resetForm(); };

const resetForm = () => {
  nuevoIngrediente.value = { IdIngrediente: '', IdInsumo: '', IdUnidadMedida: '', Cantidad: null };
  selCategoriaMedida.value = ''; 
  medidasIngrediente.value = [];
  ingredienteEnEdicionIndex.value = null;
  Object.keys(errors).forEach(k => errors[k] = '');
};

const onCategoriaMedidaChange = async () => {
  nuevoIngrediente.value.IdUnidadMedida = '';
  medidasIngrediente.value = [];
  errors.categoriaMedida = validateIngredientField('categoriaMedida', selCategoriaMedida.value);
  if (!selCategoriaMedida.value) return;

  cargandoUnidades.value = true;
  try {
    const response = await ObtenerMedidas(selCategoriaMedida.value);
    medidasIngrediente.value = response.result ?? response ?? [];
  } catch (error) {
    console.error('Error al cargar medidas:', error);
    medidasIngrediente.value = [];
  } finally {
    cargandoUnidades.value = false;
  }
};

const initIngredientes = async () => {
  if (!productId.value) return;

  cargandoReceta.value = true;
  try {
    const data = await getProductoIngrediente(productId.value);
    if (data && data.receta && data.receta.length > 0) {
      const mainReceta = data.receta[0];
      idReceta.value = mainReceta.idReceta;
      rendimiento.value = mainReceta.rendimiento || 1;
      tiempoHorneado.value = mainReceta.tiempoHorneadoMin || 0;
      cantidadPorLata.value = mainReceta.cantidadPorLata || 0;

      ingredientesProducto.value = mainReceta.ingredientes.map(ing => ({
        IdIngrediente:  ing.idIngrediente,
        ingredienteId:  ing.insumo?.idInsumo || ing.insumo?.IdInsumo,
        nombre:         ing.insumo?.nombre   || ing.insumo?.Nombre || 'Insumo',
        imagen:         ing.insumo?.imagen   || ing.insumo?.Imagen || null,
        totalPeso:      ing.cantidad,
        UnidadmedidaId: ing.unidadMedida?.idUnidadMedida || ing.unidadMedida?.IdUnidadMedida,
      }));
    } else {
      // No tiene receta
      idReceta.value = null;
      rendimiento.value = 1;
      tiempoHorneado.value = 0;
      cantidadPorLata.value = 0;
      ingredientesProducto.value = [];
    }
  } catch (err) {
    console.error('Error al cargar receta:', err);
  } finally {
    cargandoReceta.value = false;
  }
};

const agregarIngrediente = () => {
  const v = nuevoIngrediente.value;
  errors.insumo         = validateIngredientField('insumo',          v.IdInsumo);
  errors.categoriaMedida= validateIngredientField('categoriaMedida', selCategoriaMedida.value);
  errors.unidadMedida   = validateIngredientField('unidadMedida',    v.IdUnidadMedida);
  errors.cantidad       = validateIngredientField('cantidad',         v.Cantidad);
  if (Object.values(errors).some(e => e)) return;

  const isDuplicate = ingredientesProducto.value.some(ing => ing.ingredienteId === v.IdInsumo);
  if (isDuplicate) { errors.insumo = 'Este insumo ya fue agregado.'; return; }

  const insumoData = props.allInsumos.find(i => i.idinsumo === v.IdInsumo);

  ingredientesProducto.value.push({
    ingredienteId: v.IdInsumo,
    nombre:        insumoData?.nombre || 'Insumo',
    imagen:        insumoData?.imagen || null,
    totalPeso:     v.Cantidad,
    UnidadmedidaId:v.IdUnidadMedida,
  });
  resetForm();
};

const editarIngrediente = async (index) => {
  Object.keys(errors).forEach(k => errors[k] = '');
  ingredienteEnEdicionIndex.value = index;
  const ing = ingredientesProducto.value[index];

  nuevoIngrediente.value.IdIngrediente  = ing.IdIngrediente;
  nuevoIngrediente.value.IdInsumo       = ing.ingredienteId;
  nuevoIngrediente.value.Cantidad       = ing.totalPeso;
  nuevoIngrediente.value.IdUnidadMedida = ing.UnidadmedidaId;

  const unidadEncontrada = props.todasLasUnidades.find(
    m => m.idunidadmedida === ing.UnidadmedidaId || m.IdUnidadMedida === ing.UnidadmedidaId
  );

  if (unidadEncontrada) {
    const idcat = unidadEncontrada.idcategoriamedida ?? unidadEncontrada.IdCategoriaMedida;
    if (idcat) {
      selCategoriaMedida.value = idcat;
      const unidades = props.todasLasUnidades.filter(
        m => (m.idcategoriamedida ?? m.IdCategoriaMedida) === idcat
      );
      if (unidades.length > 0) {
        medidasIngrediente.value = unidades;
        return;
      }
    }
  }

  cargandoUnidades.value = true;
  for (const cat of props.categoriaMedidas) {
    try {
      const res = await ObtenerMedidas(cat.idcategoriamedida);
      const meds = res.result ?? res ?? [];
      const found = meds.find(
        m => m.idunidadmedida === ing.UnidadmedidaId || m.IdUnidadMedida === ing.UnidadmedidaId
      );
      if (found) {
        selCategoriaMedida.value = cat.idcategoriamedida;
        medidasIngrediente.value = meds;
        break;
      }
    } catch { /* continuar */ }
  }
  cargandoUnidades.value = false;
};

const actualizarIngrediente = () => {
  if (ingredienteEnEdicionIndex.value === null || isFormInvalid.value) return;
  const v = nuevoIngrediente.value;
  const isDuplicate = ingredientesProducto.value.some(
    (ing, idx) => idx !== ingredienteEnEdicionIndex.value && ing.ingredienteId === v.IdInsumo
  );
  if (isDuplicate) { errors.insumo = 'Este insumo ya fue agregado.'; return; }

  const insumoData = props.allInsumos.find(i => i.idinsumo === v.IdInsumo);

  ingredientesProducto.value[ingredienteEnEdicionIndex.value] = {
    IdIngrediente:  v.IdIngrediente,
    ingredienteId:  v.IdInsumo,
    nombre:         insumoData?.nombre || 'Insumo',
    imagen:         insumoData?.imagen || null,
    totalPeso:      v.Cantidad,
    UnidadmedidaId: v.IdUnidadMedida,
  };
  cancelarEdicionIngrediente();
};

const cancelarEdicionIngrediente = () => { ingredienteEnEdicionIndex.value = null; resetForm(); };

const quitarIngrediente = async (index) => {
  const ing = ingredientesProducto.value[index];
  if (ing.IdIngrediente) {
    try {
      await eliminarIngredienteReceta(ing.IdIngrediente);
    } catch (error) {
      console.error('Error al eliminar ingrediente del backend:', error);
    }
  }
  ingredientesProducto.value.splice(index, 1);
};

const handleGuardar = () => {
  if (!productId.value) return;

  const payload = {
    idReceta: idReceta.value,
    data: {
      Receta: {
        IdProducto: productId.value,
        Rendimiento: rendimiento.value,
        Tiempo: tiempoHorneado.value,
        cantidad: cantidadPorLata.value
      },
      ingredientes: ingredientesProducto.value.map(ing => ({
        IdIngrediente: ing.IdIngrediente,
        Peso:          ing.totalPeso,
        Insumo:        ing.ingredienteId,
        UnidadMedida:  ing.UnidadmedidaId,
      })),
      // Para registrarProduccionDeProducto (si es nuevo)
      Ingredientes: ingredientesProducto.value.map(ing => ({
        Peso:          ing.totalPeso,
        Insumo:        ing.ingredienteId,
        UnidadMedida:  ing.UnidadmedidaId,
      }))
    }
  };
  emit('guardar', payload);
};

const quitarDecimalesCero = (valor) => Number(valor).toString();

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm();
    initIngredientes();
  } else {
    ingredientesProducto.value = [];
    idReceta.value = null;
    resetForm();
  }
});

// ── Clases ────────────────────────────────────────────────────────────────────
const selClass = (err) => ['w-full px-4 py-3 border bg-white rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all',
  err ? 'border-red-400' : 'border-gray-200'].join(' ');
</script>

<style scoped>
</style>
