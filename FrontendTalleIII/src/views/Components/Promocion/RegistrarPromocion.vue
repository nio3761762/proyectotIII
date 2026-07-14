<template>
  <div class="space-y-8">

    <!-- Header -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <div class="flex items-center gap-4">
          <button @click="$emit('cancelar')" class="rounded-2xl hover:bg-orange-50 p-2 transition-colors flex-shrink-0">
            <ArrowLeft class="h-5 w-5 text-gray-600" />
          </button>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <BadgePercent class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                {{ esNueva ? 'Nueva' : 'Editar' }} Promoción
              </h1>
              <p class="text-gray-500 text-sm mt-0.5">{{ esNueva ? 'Define los datos de la nueva promoción' : 'Modifica los datos de la promoción' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">

      <!-- ── Columna 2/3: datos + vigencia ── -->
      <div class="xl:col-span-2 space-y-6">

        <!-- Información básica -->
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Info class="h-5 w-5 text-orange-600" /> Información Básica
            </h3>
          </div>
          <div class="p-6 space-y-5">

            <!-- Nombre -->
            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Tag class="h-4 w-4 mr-2 text-orange-500" /> Nombre <span class="text-red-500 ml-1">*</span>
              </label>
              <input v-model="form.Nombre" @blur="validar('Nombre')" :class="inputClass('Nombre')" placeholder="Ej: Combo bolsa de Cuñape" />
              <p v-if="errores.Nombre" class="err">{{ errores.Nombre }}</p>
            </div>

            <!-- Descripción -->
            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <AlignLeft class="h-4 w-4 mr-2 text-orange-500" /> Descripción
              </label>
              <textarea v-model="form.Descripcion" :class="inputClass(null)" rows="3" class="resize-none"
                placeholder="Describe los beneficios de la promoción..." />
            </div>

            <!-- Tipo de promoción -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <ListFilter class="h-4 w-4 mr-2 text-orange-500" /> Tipo de Promoción <span class="text-red-500 ml-1">*</span>
                </label>
                <select v-model="form.Tipopromocion.IdTipoPromocion" @change="validar('Tipopromocion')" :class="inputClass('Tipopromocion')">
                  <option value="">Seleccionar tipo</option>
                  <option v-for="t in tiposPromocion" :key="t.idtipopromocion" :value="t.idtipopromocion">{{ t.nombre }}</option>
                </select>
                <p v-if="errores.Tipopromocion" class="err">{{ errores.Tipopromocion }}</p>
              </div>
            </div>

            <!-- Límite de uso + tipo descuento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Users class="h-4 w-4 mr-2 text-orange-500" /> Límite de Uso <span class="text-gray-400 text-xs ml-1">(opcional)</span>
                </label>
                <input v-model.number="form.LimiteUso" type="number" min="0" :class="inputClass(null)" placeholder="Sin límite" />
              </div>
              <div>
                <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <BadgePercent class="h-4 w-4 mr-2 text-orange-500" /> Tipo de Descuento
                </label>
                <select v-model="form.TipoDescuento" :class="inputClass(null)">
                  <option value="porcentaje">Porcentaje</option>
                  <option value="monto">Monto fijo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Vigencia (fechas y horas) -->
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar class="h-5 w-5 text-blue-600" /> Vigencia de la Promoción
            </h3>
          </div>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Calendar class="h-4 w-4 mr-2 text-orange-500" /> Fecha Inicio <span class="text-red-500 ml-1">*</span>
              </label>
              <input v-model="form.Rango.FechaInicio" type="date" @blur="validar('FechaInicio')" :class="inputClass('FechaInicio')" />
              <p v-if="errores.FechaInicio" class="err">{{ errores.FechaInicio }}</p>
            </div>
            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Calendar class="h-4 w-4 mr-2 text-orange-500" /> Fecha Fin <span class="text-red-500 ml-1">*</span>
              </label>
              <input v-model="form.Rango.FechaFin" type="date" @blur="validar('FechaFin')" :class="inputClass('FechaFin')" />
              <p v-if="errores.FechaFin" class="err">{{ errores.FechaFin }}</p>
            </div>
            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Clock class="h-4 w-4 mr-2 text-orange-500" /> Hora Inicio
              </label>
              <input v-model="form.Rango.HoraInicio" type="time" :class="inputClass(null)" />
            </div>
            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Clock class="h-4 w-4 mr-2 text-orange-500" /> Hora Fin
              </label>
              <input v-model="form.Rango.HoraFin" type="time" :class="inputClass(null)" />
            </div>
          </div>
        </div>

        <!-- Lista de productos de la promoción -->
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package class="h-5 w-5 text-green-600" /> Productos de la Promoción
            </h3>
            <div class="bg-white px-4 py-1.5 rounded-2xl shadow-sm border border-green-100">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Promoción:</span>
              <span class="ml-2 text-lg font-bold text-green-600">Bs. {{ Number(form.Preciopromocion).toFixed(2) }}</span>
            </div>
          </div>
          <div class="p-6">
            <p v-if="errores.Promocionproducto" class="err mb-3">{{ errores.Promocionproducto }}</p>

            <div v-if="form.Promocionproducto.length === 0" class="text-center py-8 text-gray-400 text-sm italic">
              Agrega al menos un producto
            </div>

            <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
              <div v-for="(pp, idx) in form.Promocionproducto" :key="idx"
                :class="['flex items-center justify-between px-4 py-3 rounded-2xl border transition-all',
                  pp.IdEstado === 2 ? 'bg-gray-50 opacity-60 border-gray-200' : 'bg-white border-gray-100 shadow-sm']">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                    <img v-if="pp._imagen" :src="pp._imagen" class="w-full h-full object-cover" />
                    <Package v-else class="h-4 w-4 text-gray-300" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">{{ pp._nombreProducto }}</p>
                    <p class="text-xs text-gray-400">
                      {{ pp._presentacion }} · x{{ pp.Cantidad }}
                      · Bs. {{ Number(pp.Precio).toFixed(2) }}
                      <span v-if="pp.Descuento" class="text-green-500 ml-1">-{{ pp.Descuento }}%</span>
                    </p>
                  </div>
                </div>
                <div class="flex gap-1.5">
                  <button @click="editarItem(idx)" :disabled="itemEnEdicion !== null && itemEnEdicion !== idx"
                    class="w-7 h-7 border border-orange-200 hover:bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40">
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button @click="toggleItemEstado(idx)" :disabled="itemEnEdicion !== null"
                    :class="['w-7 h-7 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40',
                      pp.IdEstado === 2 ? 'border border-green-200 hover:bg-green-50 text-green-500' : 'border border-red-200 hover:bg-red-50 text-red-500']">
                    <ToggleLeft v-if="pp.IdEstado === 2" class="h-3.5 w-3.5" />
                    <ToggleRight v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Columna 1/3: imagen + agregar producto ── -->
      <div class="space-y-6">

        <!-- Imagen -->
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon class="h-5 w-5 text-purple-600" /> Imagen
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-2 border-dashed border-orange-200 flex items-center justify-center">
              <img v-if="preview" :src="preview" class="w-full h-full object-cover rounded-2xl" />
              <div v-else class="text-center p-4">
                <BadgePercent class="h-14 w-14 text-orange-300 mx-auto mb-2" />
                <p class="text-xs text-gray-400">Sin imagen</p>
              </div>
            </div>
            <input type="file" accept="image/*" @change="onArchivo"
              class="w-full py-2.5 px-4 border-0 shadow-md bg-gray-50/80 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all" />
          </div>
        </div>

        <!-- Agregar producto a la promoción -->
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 rounded-3xl overflow-hidden sticky top-6">
          <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-5">
            <h3 class="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Plus class="h-4 w-4 text-orange-600" />
              {{ itemEnEdicion !== null ? 'Editando producto' : 'Agregar Producto' }}
            </h3>
          </div>
          <div class="p-5 space-y-4">

            <!-- Select producto -->
            <div>
              <label class="text-xs font-semibold text-gray-600 mb-1 block">Producto <span class="text-red-500">*</span></label>
              <select v-model="itemForm.idproducto" @change="onProductoChange" :class="selSmClass(erroresItem.idproducto)">
                <option value="">Seleccionar producto</option>
                <option v-for="p in productos" :key="p.idproducto" :value="p.idproducto">{{ p.nombre }}</option>
              </select>
              <p v-if="erroresItem.idproducto" class="err">{{ erroresItem.idproducto }}</p>
            </div>

            <!-- Select medida/presentación (dependiente del producto) -->
            <div>
              <label class="text-xs font-semibold text-gray-600 mb-1 block">
                Presentación <span class="text-red-500">*</span>
                <span v-if="cargandoMedidas" class="text-gray-400 font-normal ml-1">(cargando...)</span>
              </label>
              <select v-model="itemForm.idproductomedida" :disabled="!itemForm.idproducto || cargandoMedidas"
                @change="onMedidaChange" :class="selSmClass(erroresItem.idproductomedida)">
                <option value="">{{ cargandoMedidas ? 'Cargando...' : 'Seleccionar presentación' }}</option>
                <option v-for="m in medidasProducto" :key="m.idproductomedida" :value="m.idproductomedida">
                  {{ m.presentacion?.Nombre ?? 'Sin presentación' }} — {{ m.cantidad }} u. — Bs. {{ m.precioventa }}
                </option>
              </select>
              <p v-if="erroresItem.idproductomedida" class="err">{{ erroresItem.idproductomedida }}</p>

              <!-- Precio venta referencial -->
              <div v-if="medidaSeleccionada" class="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400 px-1">
                <DollarSign class="h-3 w-3 text-green-500" />
                Precio venta ref.: <strong class="text-green-600">Bs. {{ Number(medidaSeleccionada.precioventa).toFixed(2) }}</strong>
              </div>
            </div>

            <!-- Cantidad + precio de la promo -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Cantidad <span class="text-red-500">*</span></label>
                <input v-model.number="itemForm.cantidad" type="number" min="1" :class="selSmClass(erroresItem.cantidad)" placeholder="1" />
                <p v-if="erroresItem.cantidad" class="err">{{ erroresItem.cantidad }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Precio Total (Bs.) <span class="text-red-500">*</span></label>
                <input v-model.number="itemForm.precio" type="number" min="0" step="0.01" :class="selSmClass(erroresItem.precio)" placeholder="0.00" />
                <p v-if="erroresItem.precio" class="err">{{ erroresItem.precio }}</p>
              </div>
            </div>

            <!-- Descuento (automático) -->
            <div>
              <label class="text-xs font-semibold text-gray-600 mb-1 block">Descuento (%)</label>
              <input v-model.number="itemForm.descuento" type="number" readonly 
                class="w-full px-3 py-2.5 border-0 shadow-inner bg-gray-100/50 rounded-xl text-sm text-gray-500 outline-none cursor-not-allowed font-medium" 
                placeholder="0.00" />
              <p class="text-[10px] text-gray-400 mt-1 px-1 flex items-center gap-1">
                <Info class="h-3 w-3" /> Se calcula automáticamente según el precio total
              </p>
            </div>

            <!-- Botones -->
            <div class="flex gap-2">
              <button v-if="itemEnEdicion !== null" @click="cancelarEdicion" type="button"
                class="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-600 py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1">
                <X class="h-3.5 w-3.5" /> Cancelar
              </button>
              <button @click="agregarItem" type="button"
                class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-xl shadow text-sm transition-all flex items-center justify-center gap-1 font-semibold">
                <component :is="itemEnEdicion !== null ? Save : Plus" class="h-3.5 w-3.5" />
                {{ itemEnEdicion !== null ? 'Actualizar' : 'Agregar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones guardar -->
    <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
      <button type="button" @click="$emit('cancelar')"
        class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl text-gray-600 font-medium transition-colors flex items-center gap-2">
        <X class="h-4 w-4" /> Cancelar
      </button>
      <button @click="guardar" :disabled="guardando"
        class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60 text-white rounded-2xl shadow-lg transition-all flex items-center gap-2 font-semibold">
        <LoaderCircle v-if="guardando" class="h-4 w-4 animate-spin" />
        <Save v-else class="h-4 w-4" />
        {{ guardando ? 'Guardando...' : (esNueva ? 'Registrar Promoción' : 'Actualizar Promoción') }}
      </button>
    </div>
  </div>
</template>
 
<script setup>
import { reactive, ref, computed, watch } from 'vue';
import {
  ArrowLeft, BadgePercent, Info, Tag, AlignLeft, ListFilter,
  DollarSign, Users, Calendar, Clock, Package, ImageIcon,
  Plus, X, Save, LoaderCircle, Pencil, ToggleLeft, ToggleRight
} from 'lucide-vue-next';
import { SubirFoto }           from '@/Server/api';
import { listMedidasdeProducto } from '@/Server/Producto';

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
  promocion:      { type: Object,  default: null  },
  guardando:      { type: Boolean, default: false },
  tiposPromocion: { type: Array,   default: () => [] }, // [{ idtipopromocion, nombre }]
  productos:      { type: Array,   default: () => [] }, // [{ idproducto, nombre }]
});

const emit = defineEmits(['guardar', 'cancelar']);

const esNueva = computed(() => !props.promocion?.idpromocion);

// ── Formulario principal ──────────────────────────────────────────────────────
const form = reactive({
  IdPromocion:    null,
  Nombre:         '',
  Descripcion:    '',
  Tipopromocion:  { IdTipoPromocion: '' },
  Preciopromocion:'',
  LimiteUso:      null,
  TipoDescuento:  'porcentaje',
  Rango: { IdRango: null, FechaInicio: '', FechaFin: '', HoraInicio: '', HoraFin: '' },
  Promocionproducto: [], // items con _nombreProducto, _presentacion, _imagen para display
  Url: '',
});

const errores = reactive({
  Nombre: '', Tipopromocion: '', Preciopromocion: '', FechaInicio: '', FechaFin: '', Promocionproducto: ''
});
const preview = ref('');
const archivo = ref(null);

// ── Item a agregar ────────────────────────────────────────────────────────────
const itemForm = reactive({ idproducto: '', idproductomedida: '', cantidad: 1, precio: null, descuento: 0 });
const erroresItem = reactive({ idproducto: '', idproductomedida: '', cantidad: '', precio: '' });
const medidasProducto = ref([]);       // medidas del producto seleccionado
const cargandoMedidas = ref(false);
const itemEnEdicion   = ref(null);     // índice o null
const cargandoEdicion = ref(false);    // Flag para evitar escalado al cargar datos

const medidaSeleccionada = computed(() =>
  medidasProducto.value.find(m => m.idproductomedida === itemForm.idproductomedida) ?? null
);

// ── Watchers para el itemForm ────────────────────────────────────────────────
// Escalar precio cuando cambia la cantidad (solo si NO estamos cargando para editar)
watch(() => itemForm.cantidad, (newQty, oldQty) => {
  if (cargandoEdicion.value) return;
  if (newQty > 0 && oldQty > 0 && itemForm.precio !== null) {
    const unitario = itemForm.precio / oldQty;
    itemForm.precio = Number((unitario * newQty).toFixed(2));
  }
});

// Calcular descuento automáticamente
watch([() => itemForm.precio, () => itemForm.cantidad, medidaSeleccionada], () => {
  const medida = medidaSeleccionada.value;
  if (!medida || !itemForm.cantidad || itemForm.precio === null) {
    itemForm.descuento = 0;
    return;
  }
  const totalRef = Number(medida.precioventa) * itemForm.cantidad;
  if (totalRef <= 0) {
    itemForm.descuento = 0;
    return;
  }
  const desc = ((totalRef - itemForm.precio) / totalRef * 100);
  itemForm.descuento = Number(desc.toFixed(2));
});

const cancelarEdicion = () => {
  itemEnEdicion.value = null;
  Object.assign(itemForm, { idproducto: '', idproductomedida: '', cantidad: 1, precio: null, descuento: 0 });
  medidasProducto.value = [];
  Object.keys(erroresItem).forEach(k => erroresItem[k] = '');
};

// ── Inicializar desde la promoción recibida ───────────────────────────────────
const inicializar = async () => {
  const p = props.promocion;
  // Limpiar
  Object.assign(form, {
    IdPromocion: null, Nombre: '', Descripcion: '',
    Tipopromocion: { IdTipoPromocion: '' }, Preciopromocion: '',
    LimiteUso: null, TipoDescuento: 'porcentaje',
    Rango: { IdRango: null, FechaInicio: '', FechaFin: '', HoraInicio: '', HoraFin: '' },
    Promocionproducto: [], Url: '',
  });
  preview.value = ''; archivo.value = null;
  Object.keys(errores).forEach(k => errores[k] = '');
  cancelarEdicion();

  if (!p) return;
  // ... rest of the logic

  form.IdPromocion    = p.idpromocion;
  form.Nombre         = p.nombre          ?? '';
  form.Descripcion    = p.descripcion     ?? '';
  form.Tipopromocion  = { IdTipoPromocion: p.Tipopromocion?.IdTipoPromocion ?? '' };
  form.Preciopromocion= p.preciopromocion ?? '';
  form.LimiteUso      = p.limiteuso       ?? null;
  form.TipoDescuento  = p.tipodescuento   ?? 'porcentaje';
  form.Url            = p.imagen          ?? '';
  preview.value       = p.imagen          ?? '';

  if (p.Rango) {
    form.Rango = {
      IdRango:    p.Rango.IdRango,
      FechaInicio:p.Rango.FechaInicio,
      FechaFin:   p.Rango.FechaFin,
      HoraInicio: p.Rango.HoraInicio ?? '',
      HoraFin:    p.Rango.HoraFin    ?? '',
    };
  }

  // Mapear Promocionproducto con datos de display
  form.Promocionproducto = (p.Promocionproducto ?? []).map(pp => ({
    IdPromocionProducto: pp.IdPromocionProducto,
    IdProducto:          pp.Productomedida?.IdProductoMedida,  // será el idproductomedida
    Cantidad:            pp.Cantidad,
    Precio:              pp.Precio,
    Descuento:           pp.Descuento,
    IdEstado:            pp.Estado ?? 1,
    // campos de display
    _idproductomedida:   pp.Productomedida?.IdProductoMedida,
    _nombreProducto:     pp.Productomedida?.Producto?.Nombre ?? '—',
    _presentacion:       pp.Productomedida?.Presentacion?.Nombre ?? '',
    _imagen:             pp.Productomedida?.Imagen ?? '',
  }));
};

watch(() => props.promocion, inicializar, { immediate: true });

// ── Selección de producto → cargar medidas ────────────────────────────────────
const onProductoChange = async () => {
  itemForm.idproductomedida = '';
  medidasProducto.value = [];
  if (!itemForm.idproducto) return;

  cargandoMedidas.value = true;
  try {
    const r = await listMedidasdeProducto(itemForm.idproducto);
    medidasProducto.value = Array.isArray(r) ? r : (r.result ?? r.data ?? []);
  } catch { medidasProducto.value = []; }
  finally { cargandoMedidas.value = false; }
};

const onMedidaChange = () => {
  // Pre-rellenar precio total con (precio venta unitario * cantidad)
  if (medidaSeleccionada.value) {
    itemForm.precio = Number(medidaSeleccionada.value.precioventa) * itemForm.cantidad;
  }
};

// ── Imagen ────────────────────────────────────────────────────────────────────
const onArchivo = (e) => {
  const file = e.target.files[0]; if (!file) return;
  archivo.value = file;
  const r = new FileReader(); r.onload = (ev) => { preview.value = ev.target.result; }; r.readAsDataURL(file);
};

// ── Clases input ──────────────────────────────────────────────────────────────
const BASE    = 'w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20';
const SM      = 'w-full px-3 py-2.5 border-0 shadow-md bg-white rounded-xl transition-all text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-500/20';
const inputClass = (campo) => campo && errores[campo] ? `${BASE} ring-2 ring-red-500/20 bg-red-50` : BASE;
const selSmClass = (err)  => err  ? `${SM} ring-2 ring-red-500/20 bg-red-50` : SM;

// ── Cálculo automático de precio ──────────────────────────────────────────────
const totalCalculado = computed(() => {
  return form.Promocionproducto
    .filter(pp => pp.IdEstado !== 2)
    .reduce((acc, pp) => acc + Number(pp.Precio), 0);
});

watch(totalCalculado, (val) => {
  form.Preciopromocion = val;
}, { immediate: true });

// ── Validaciones ──────────────────────────────────────────────────────────────
const validar = (campo) => {
  switch (campo) {
    case 'Nombre':          errores.Nombre          = !form.Nombre?.trim() ? 'Requerido.' : ''; break;
    case 'Tipopromocion':   errores.Tipopromocion   = !form.Tipopromocion.IdTipoPromocion ? 'Requerido.' : ''; break;
    case 'FechaInicio':     errores.FechaInicio     = !form.Rango.FechaInicio ? 'Requerido.' : ''; break;
    case 'FechaFin':        errores.FechaFin        = !form.Rango.FechaFin ? 'Requerido.' : ''; break;
  }
};

const validarTodo = () => {
  ['Nombre','Tipopromocion','FechaInicio','FechaFin'].forEach(validar);
  errores.Promocionproducto = form.Promocionproducto.filter(p => p.IdEstado !== 2).length === 0
    ? 'Agrega al menos un producto activo.' : '';
  return Object.values(errores).every(e => !e);
};

// ── CRUD productos de la promo ────────────────────────────────────────────────
const validarItem = () => {
  erroresItem.idproducto       = !itemForm.idproducto ? 'Requerido.' : '';
  erroresItem.idproductomedida = !itemForm.idproductomedida ? 'Requerido.' : '';
  erroresItem.cantidad         = !itemForm.cantidad || itemForm.cantidad <= 0 ? 'Debe ser > 0.' : '';
  erroresItem.precio           = (!itemForm.precio && itemForm.precio !== 0) || itemForm.precio < 0 ? 'Requerido.' : '';
  return Object.values(erroresItem).every(e => !e);
};

const agregarItem = () => {
  if (!validarItem()) return;
  const medida = medidaSeleccionada.value;

  const obj = {
    IdPromocionProducto: itemEnEdicion.value !== null
      ? form.Promocionproducto[itemEnEdicion.value].IdPromocionProducto : null,
    IdProducto:         itemForm.idproductomedida, // backend recibe idproductomedida como IdProducto
    Cantidad:           itemForm.cantidad,
    Precio:             itemForm.precio, // Guardamos el precio tal cual (ya es el total de la línea)
    Descuento:          itemForm.descuento,
    IdEstado:           1,
    // display
    _idproductomedida:  itemForm.idproductomedida,
    _nombreProducto:    props.productos.find(p => p.idproducto === itemForm.idproducto)?.nombre ?? '',
    _presentacion:      medida?.presentacion?.Nombre ?? '',
    _imagen:            medida?.imagen ?? '',
  };

  if (itemEnEdicion.value !== null) {
    form.Promocionproducto[itemEnEdicion.value] = obj;
  } else {
    form.Promocionproducto.push(obj);
  }
  cancelarEdicion();
};

const editarItem = async (idx) => {
  cargandoEdicion.value = true; // Bloqueamos el escalado automático
  itemEnEdicion.value = idx;
  const pp = form.Promocionproducto[idx];

  // Encontrar el idproducto a partir del idproductomedida
  const idpm = pp._idproductomedida;
  for (const prod of props.productos) {
    try {
      const r = await listMedidasdeProducto(prod.idproducto);
      const lista = Array.isArray(r) ? r : (r.result ?? r.data ?? []);
      if (lista.some(m => m.idproductomedida === idpm)) {
        itemForm.idproducto       = prod.idproducto;
        medidasProducto.value     = lista;
        itemForm.idproductomedida = idpm;
        break;
      }
    } catch { /* continuar */ }
  }

  itemForm.cantidad  = pp.Cantidad;
  itemForm.precio    = pp.Precio; // Mantenemos el precio original de la lista
  itemForm.descuento = pp.Descuento;

  // Liberamos el bloqueo en el siguiente ciclo para que cambios posteriores sí escalen
  setTimeout(() => { cargandoEdicion.value = false; }, 100);
};

const toggleItemEstado = (idx) => {
  const pp = form.Promocionproducto[idx];
  pp.IdEstado = pp.IdEstado === 1 ? 2 : 1;
};

// ── Guardar ───────────────────────────────────────────────────────────────────
const guardar = async () => {
  if (!validarTodo()) return;

  let urlImagen = form.Url;
  if (archivo.value) {
    try { urlImagen = await SubirFoto(archivo.value); }
    catch (e) { console.error('Error subiendo imagen:', e); }
  }

  const payload = {
    IdPromocion:  form.IdPromocion,
    Nombre:       form.Nombre.trim(),
    Descripcion:  form.Descripcion.trim(),
    Tipopromocion:{ IdTipoPromocion: Number(form.Tipopromocion.IdTipoPromocion) },
    Preciopromocion: form.Preciopromocion,
    LimiteUso:    form.LimiteUso || undefined,
    TipoDescuento: form.TipoDescuento,
    Url:          urlImagen || undefined,
    Rango: {
      IdRango:    form.Rango.IdRango,
      FechaInicio:form.Rango.FechaInicio,
      FechaFin:   form.Rango.FechaFin,
      HoraInicio: form.Rango.HoraInicio,
      HoraFin:    form.Rango.HoraFin,
    },
    Promocionproducto: form.Promocionproducto.map(pp => ({
      IdPromocionProducto: pp.IdPromocionProducto ?? undefined,
      IdProducto:          pp.IdProducto,      // = idproductomedida
      Cantidad:            pp.Cantidad,
      Precio:              pp.Precio,
      Descuento:           pp.Descuento,
      IdEstado:            pp.IdEstado,
    })),
  };

  emit('guardar', payload);
};
</script>

<style scoped>
</style>
