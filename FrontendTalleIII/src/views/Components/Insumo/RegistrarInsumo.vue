<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <div class="flex items-center gap-4">
          <button @click="$emit('cancelar')" class="rounded-2xl hover:bg-orange-50 p-2 transition-colors">
            <ArrowLeft class="h-5 w-5" />
          </button>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <Package class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                {{ esNuevo ? 'Registrar' : 'Editar' }} Insumo
              </h1>
              <p class="text-gray-600 mt-1">{{ esNuevo ? 'Agrega un nuevo insumo' : 'Modifica los datos del insumo' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">

      <!-- Columna principal (2 cols) -->
      <div class="xl:col-span-2 space-y-6">

        <!-- Información básica -->
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <Info class="h-5 w-5 text-orange-600" /> Información Básica
            </h3>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

            <!-- Nombre -->
            <div class="md:col-span-2">
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <Type class="h-4 w-4 mr-2 text-orange-500" /> Nombre <span class="text-red-500 ml-1">*</span>
              </label>
              <input v-model="form.nombre" @blur="validar('nombre')" @input="validar('nombre')" :class="inputClass('nombre')" placeholder="Ej: Harina de trigo" />
              <p v-if="errores.nombre" class="text-red-500 text-xs italic mt-1">{{ errores.nombre }}</p>
            </div>

            <!-- Descripción -->
            <div class="md:col-span-2">
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <FileText class="h-4 w-4 mr-2 text-orange-500" /> Descripción <span class="text-red-500 ml-1">*</span>
              </label>
              <textarea v-model="form.descripcion" :class="inputClass('descripcion')" rows="3" placeholder="Describe el insumo..." class="resize-none" />
              <!-- <p v-if="errores.descripcion" class="text-red-500 text-xs italic mt-1">{{ errores.descripcion }}</p>  @blur="validar('descripcion')" -->
            </div>

            <!-- Categoría -->
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <LayoutGrid class="h-4 w-4 mr-2 text-orange-500" /> Categoría <span class="text-red-500 ml-1">*</span>
              </label>
              <select v-model="selCategoria" @change="onCategoriaChange" :class="inputClass(null)">
                <option value="">Seleccionar</option>
                <option v-for="c in categorias" :key="c.idcategoria" :value="c.idcategoria">{{ c.nombre }}</option>
              </select>
            </div> 

            <!-- Subcategoría -->
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <Layers class="h-4 w-4 mr-2 text-orange-500" /> Subcategoría <span class="text-red-500 ml-1">*</span>
              </label>
              <select v-model="form.idsubcategoria" :disabled="!selCategoria || cargandoSub" @blur="validar('subcategoria')" :class="inputClass('subcategoria')">
                <option value="">{{ cargandoSub ? 'Cargando...' : 'Seleccionar' }}</option>
                <option v-for="s in subcategorias" :key="s.idsubcategoria" :value="s.idsubcategoria">{{ s.nombre }}</option>
              </select>
              <p v-if="errores.subcategoria" class="text-red-500 text-xs italic mt-1">{{ errores.subcategoria }}</p>
            </div>

            <!-- Stock mínimo -->
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <AlertCircle class="h-4 w-4 mr-2 text-orange-500" /> Stock Mínimo
              </label>
              <input v-model.number="form.stockminimo" type="number" min="0" :class="inputClass(null)" placeholder="0" />
            </div>

          </div>
        </div>

        <!-- Medidas -->
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <Scale class="h-5 w-5 text-blue-600" /> Medidas
            </h3>
          </div>
          <div class="p-6 space-y-4">

            <!-- Formulario medida -->
            <div class="bg-blue-50/60 rounded-2xl p-4 space-y-3">
              <p class="text-sm font-semibold text-blue-700">
                {{ medidaEnEdicion !== null ? 'Editando medida' : 'Agregar medida' }}
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <!-- Categoría medida -->
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Cat. Medida <span class="text-red-500">*</span></label>
                  <select v-model="selCategoriaMedida" @change="onCategoriaMedidaChange" :class="inputSmClass(erroresMedida.categoriaMedida)">
                    <option value="">Seleccionar</option>
                    <option v-for="c in categoriaMedidas" :key="c.idcategoriamedida" :value="c.idcategoriamedida">{{ c.nombre }}</option>
                  </select>
                  <p v-if="erroresMedida.categoriaMedida" class="text-red-500 text-xs italic mt-0.5">{{ erroresMedida.categoriaMedida }}</p>
                </div>
                <!-- Unidad medida -->
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Unidad <span class="text-red-500">*</span></label>
                  <select v-model="nuevaMedida.idunidadmedida" :disabled="!selCategoriaMedida || cargandoUnidades" :class="inputSmClass(erroresMedida.idUnidadMedida)">
                    <option value="">{{ cargandoUnidades ? 'Cargando...' : 'Seleccionar' }}</option>
                    <option v-for="m in medidasDisponibles" :key="m.idunidadmedida" :value="m.idunidadmedida">{{ m.nombre }} ({{ m.abreviatura }})</option>
                  </select>
                  <p v-if="erroresMedida.idUnidadMedida" class="text-red-500 text-xs italic mt-0.5">{{ erroresMedida.idUnidadMedida }}</p>
                </div>
                <!-- Cantidad -->
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Cantidad <span class="text-red-500">*</span></label>
                  <input v-model.number="nuevaMedida.cantidad" type="number" min="1" :class="inputSmClass(erroresMedida.cantidad)" placeholder="1" />
                  <p v-if="erroresMedida.cantidad" class="text-red-500 text-xs italic mt-0.5">{{ erroresMedida.cantidad }}</p>
                </div>
              </div>

              <div class="flex gap-2 justify-end">
                <button v-if="medidaEnEdicion !== null" @click="cancelarEdicionMedida" type="button"
                  class="px-4 py-2 text-sm border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors flex items-center gap-1">
                  <X class="h-3.5 w-3.5" /> Cancelar
                </button>
                <button @click="agregarMedida" type="button"
                  class="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow transition-all flex items-center gap-1 font-semibold">
                  <Plus class="h-3.5 w-3.5" />
                  {{ medidaEnEdicion !== null ? 'Actualizar' : 'Agregar' }}
                </button>
              </div>
            </div>

            <p v-if="errores.medidas" class="text-red-500 text-xs italic">{{ errores.medidas }}</p>

            <!-- Lista de medidas -->
            <div v-if="form.medidas.length" class="space-y-2">
              <div v-for="(m, idx) in form.medidas" :key="idx"
                class="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all"
                :class="[
                  medidaEnEdicion === idx ? 'ring-2 ring-blue-400' : '',
                  m.estado === 0 ? 'opacity-60 bg-gray-50' : ''
                ]">
                <div class="flex items-center gap-3">
                  <div v-if="m.estado === 0" class="p-1.5 bg-gray-200 rounded-lg">
                    <X class="h-3 w-3 text-gray-500" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800" :class="m.estado === 0 ? 'line-through' : ''">
                      {{ m.cantidad }} {{ m.nombreUnidad }} <span class="text-gray-400 font-normal">({{ m.abreviatura }})</span>
                    </p>
                    <p class="text-xs text-gray-500">{{ m.nombreCategoria }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button @click="editarMedida(idx)" :disabled="(medidaEnEdicion !== null && medidaEnEdicion !== idx) || m.estado === 0"
                    class="w-7 h-7 border border-orange-200 hover:bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40">
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button @click="eliminarMedida(idx)" :disabled="medidaEnEdicion !== null"
                    :class="['w-7 h-7 border rounded-xl flex items-center justify-center transition-colors disabled:opacity-40',
                      m.estado === 0 ? 'border-green-200 hover:bg-green-50 text-green-500' : 'border-red-200 hover:bg-red-50 text-red-500']"
                    :title="m.estado === 0 ? 'Reactivar' : 'Bloquear'">
                    <RefreshCw v-if="m.estado === 0" class="h-3.5 w-3.5" />
                    <Trash2 v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-center text-gray-400 text-sm py-4 italic">Agrega al menos una medida</p>
          </div>
        </div>
      </div>

      <!-- Columna lateral: imagen -->
      <div class="space-y-6">
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <ImageIcon class="h-5 w-5 text-purple-600" /> Imagen
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="w-full h-44 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden flex items-center justify-center border-2 border-dashed border-orange-200">
              <img v-if="preview" :src="preview" class="w-full h-full object-cover rounded-2xl" />
              <div v-else class="text-center space-y-2">
                <Package class="h-12 w-12 text-orange-300 mx-auto" />
                <p class="text-xs text-gray-400">Sin imagen</p>
              </div>
            </div>
            <input type="file" accept="image/*" @change="onArchivo"
              class="w-full py-2.5 px-4 border-0 shadow-md bg-gray-50/80 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all" />
          </div>
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
      <button type="button" @click="$emit('cancelar')"
        class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2 text-gray-600">
        <X class="h-4 w-4" /> Cancelar
      </button>
      <button @click="guardar" :disabled="guardando"
        class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold">
        <LoaderCircle v-if="guardando" class="h-4 w-4 animate-spin" />
        <Save v-else class="h-4 w-4" />
        {{ guardando ? 'Guardando...' : (esNuevo ? 'Registrar' : 'Actualizar') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import {
  ArrowLeft, Package, Info, Type, FileText, LayoutGrid,
  Layers, AlertCircle, Scale, Plus, X, Save, LoaderCircle,
  Pencil, Trash2, RefreshCw
} from 'lucide-vue-next';
import { ImageIcon } from 'lucide-vue-next';
import { SubirFoto }           from '@/Server/api';
import { ObtenerSubCategorias } from '@/Server/Categoria';
import { ObtenerMedidas }       from '@/Server/Medida';

const props = defineProps({
  insumo:           { type: Object, default: null  },
  guardando:        { type: Boolean, default: false },
  categorias:       { type: Array,  default: () => [] },
  categoriaMedidas: { type: Array,  default: () => [] },
  // FIX: recibir todas las unidades ya precargadas para no hacer fetch en editarMedida
  todasUnidades:    { type: Array,  default: () => [] },
});

const emit = defineEmits(['guardar', 'cancelar']);

const esNuevo = computed(() => !props.insumo?.idinsumo);

// ── Formulario ────────────────────────────────────────────────────────────────
const form = reactive({
  idinsumo: null, nombre: '', descripcion: '', idsubcategoria: '', stockminimo: 0,
  medidas: [], imagen: '',
});
const errores = reactive({ nombre: '', descripcion: '', subcategoria: '', medidas: '' });
const preview = ref('');
const archivo = ref(null);

const selCategoria    = ref('');
const subcategorias   = ref([]);
const cargandoSub     = ref(false);
const selCategoriaMedida  = ref('');
const medidasDisponibles  = ref([]);
const cargandoUnidades    = ref(false);  // FIX: indicador de carga de unidades

const nuevaMedida = reactive({ idinsumomedida: null, idunidadmedida: '', cantidad: 1, estado: 1 });
const erroresMedida = reactive({ categoriaMedida: '', idUnidadMedida: '', cantidad: '' });
const medidaEnEdicion = ref(null);

// ── Subcategorías ─────────────────────────────────────────────────────────────
const cargarSubcategorias = async (idcat) => {
  if (!idcat) return;
  cargandoSub.value = true;
  try {
    const r = await ObtenerSubCategorias(idcat);
    subcategorias.value = r.result ?? r ?? [];
  } catch (err) {
    console.error('Error al cargar subcategorías:', err);
    subcategorias.value = [];
  } finally {
    cargandoSub.value = false;
  }
};

const onCategoriaChange = async () => {
  form.idsubcategoria = '';
  subcategorias.value = [];
  if (selCategoria.value) await cargarSubcategorias(selCategoria.value);
};

// ── Inicializar ───────────────────────────────────────────────────────────────
const inicializar = async () => {
  const ins = props.insumo;
  Object.assign(form, { idinsumo: null, nombre: '', descripcion: '', idsubcategoria: '', stockminimo: 0, medidas: [], imagen: '' });
  preview.value = ''; archivo.value = null;
  selCategoria.value = ''; subcategorias.value = [];
  selCategoriaMedida.value = ''; medidasDisponibles.value = [];
  medidaEnEdicion.value = null;
  Object.keys(errores).forEach(k => errores[k] = '');
  Object.keys(erroresMedida).forEach(k => erroresMedida[k] = '');

  if (!ins) return;

  form.idinsumo       = ins.idinsumo;
  form.nombre         = ins.nombre        ?? '';
  form.descripcion    = ins.descripcion   ?? '';
  form.stockminimo    = ins.stockminimo   ?? 0;
  form.imagen         = ins.imagen        ?? '';
  form.idsubcategoria = ins.Subcategoria?.IdSubCategoria ?? '';
  preview.value       = ins.imagen        ?? '';

  const idcat = ins.Subcategoria?.Categoria?.IdCategoria;
  if (idcat) {
    selCategoria.value = idcat;
    await cargarSubcategorias(idcat);
  }

  // FIX: usar todasUnidades precargadas para construir las medidas SIN hacer fetch
  form.medidas = (ins.Insumomedida ?? []).map(m => {
    const unidad = props.todasUnidades.find(u =>
      u.idunidadmedida === m.Unidadmedida?.IdUnidadMedida ||
      u.IdUnidadMedida === m.Unidadmedida?.IdUnidadMedida
    );
    return {
      idinsumomedida:    m.IdinsumoMedida,
      idunidadmedida:    m.Unidadmedida?.IdUnidadMedida,
      idcategoriamedida: m.Unidadmedida?.Categoria?.IdCategoriaMedida ?? '',
      cantidad:          m.Cantidad ?? 1,
      estado:            m.Estado !== undefined ? m.Estado : (m.IdEstado !== undefined ? m.IdEstado : 1),
      nombreUnidad:      m.Unidadmedida?.Nombre     ?? unidad?.nombre    ?? '',
      abreviatura:       m.Unidadmedida?.Abreviatura ?? unidad?.abreviatura ?? '',
      nombreCategoria:   m.Unidadmedida?.Categoria?.Nombre ?? '',
    };
  });
};

watch(() => props.insumo, inicializar, { immediate: true });

// ── Medidas disponibles ───────────────────────────────────────────────────────
const onCategoriaMedidaChange = async () => {
  nuevaMedida.idunidadmedida = ''; medidasDisponibles.value = [];
  if (!selCategoriaMedida.value) return;
  cargandoUnidades.value = true;
  try {
    const r = await ObtenerMedidas(selCategoriaMedida.value);
    medidasDisponibles.value = r.result ?? r ?? [];
  } catch { medidasDisponibles.value = []; }
  finally { cargandoUnidades.value = false; }
};

// ── Imagen ────────────────────────────────────────────────────────────────────
const onArchivo = (e) => {
  const file = e.target.files[0]; if (!file) return;
  archivo.value = file;
  const reader = new FileReader();
  reader.onload = (ev) => { preview.value = ev.target.result; };
  reader.readAsDataURL(file);
};

// ── Validaciones ──────────────────────────────────────────────────────────────
const validar = (campo) => {
  switch (campo) {
    case 'nombre':       errores.nombre       = !form.nombre?.trim() ? 'Requerido.' : form.nombre.length > 50 ? 'Máximo 50 caracteres.' : ''; break;
    // case 'descripcion':  errores.descripcion  = !form.descripcion?.trim() ? 'Requerido.' : ''; break;
    case 'subcategoria': errores.subcategoria = !form.idsubcategoria ? 'Requerido.' : ''; break;
  }
};

// ── Clases ────────────────────────────────────────────────────────────────────
const inputBase = 'w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20';
const inputClass = (campo) => campo && errores[campo] ? `${inputBase} ring-2 ring-red-500/20 bg-red-50` : inputBase;
const inputSmBase = 'w-full px-3 py-2 border-0 shadow-md bg-white rounded-xl transition-all text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20';
const inputSmClass = (err) => err ? `${inputSmBase} ring-2 ring-red-500/20 bg-red-50` : inputSmBase;


const validarMedida = () => {
  erroresMedida.categoriaMedida = !selCategoriaMedida.value ? 'Requerido.' : '';
  erroresMedida.idUnidadMedida  = !nuevaMedida.idunidadmedida ? 'Requerido.' : '';
  erroresMedida.cantidad        = !nuevaMedida.cantidad || nuevaMedida.cantidad <= 0 ? 'Debe ser > 0.' : '';
  return Object.values(erroresMedida).every(e => !e);
};

const validarTodo = () => {
  ['nombre','descripcion','subcategoria'].forEach(validar);
  errores.medidas = form.medidas.length === 0 ? 'Agrega al menos una medida.' : '';
  return Object.values(errores).every(e => !e);
};

// ── CRUD Medidas ──────────────────────────────────────────────────────────────
const agregarMedida = () => {
  if (!validarMedida()) return;
  const unidad   = medidasDisponibles.value.find(m => m.idunidadmedida === nuevaMedida.idunidadmedida);
  const catMedida= props.categoriaMedidas.find(c => c.idcategoriamedida === selCategoriaMedida.value);
  const obj = {
    idinsumomedida:    nuevaMedida.idinsumomedida || null,
    idunidadmedida:    nuevaMedida.idunidadmedida,
    idcategoriamedida: selCategoriaMedida.value,
    cantidad:          nuevaMedida.cantidad,
    estado:            nuevaMedida.estado,
    nombreUnidad:      unidad?.nombre       ?? '',
    abreviatura:       unidad?.abreviatura  ?? '',
    nombreCategoria:   catMedida?.nombre    ?? '',
  };
  if (medidaEnEdicion.value !== null) form.medidas[medidaEnEdicion.value] = obj;
  else form.medidas.push(obj);
  cancelarEdicionMedida();
};

// FIX: editarMedida YA NO hace fetch; usa todasUnidades precargadas
const editarMedida = async (idx) => {
  medidaEnEdicion.value = idx;
  const m = form.medidas[idx];
  nuevaMedida.idinsumomedida = m.idinsumomedida;
  nuevaMedida.idunidadmedida = m.idunidadmedida;
  nuevaMedida.cantidad       = m.cantidad;
  nuevaMedida.estado         = m.estado;

  // Cargar unidades de la categoría guardada en la medida
  if (m.idcategoriamedida) {
    selCategoriaMedida.value = m.idcategoriamedida;
    // Filtrar desde todasUnidades sin hacer ningún fetch
    const disponibles = props.todasUnidades.filter(u =>
      (u.idcategoriamedida ?? u.IdCategoriaMedida) === m.idcategoriamedida
    );
    if (disponibles.length > 0) {
      medidasDisponibles.value = disponibles;
    } else {
      // Fallback: si las unidades no tienen idcategoriamedida embebido, hacer fetch solo una vez
      cargandoUnidades.value = true;
      try {
        const r = await ObtenerMedidas(m.idcategoriamedida);
        medidasDisponibles.value = r.result ?? r ?? [];
      } catch { medidasDisponibles.value = []; }
      finally { cargandoUnidades.value = false; }
    }
  } else {
    // Fallback por nombre de categoría usando la lista de categorías disponibles
    const catMatch = props.categoriaMedidas.find(c => c.nombre === m.nombreCategoria);
    if (catMatch) {
      selCategoriaMedida.value = catMatch.idcategoriamedida;
      cargandoUnidades.value = true;
      try {
        const r = await ObtenerMedidas(catMatch.idcategoriamedida);
        medidasDisponibles.value = r.result ?? r ?? [];
      } catch { medidasDisponibles.value = []; }
      finally { cargandoUnidades.value = false; }
    }
  }
};

const cancelarEdicionMedida = () => {
  medidaEnEdicion.value = null;
  Object.assign(nuevaMedida, { idinsumomedida: null, idunidadmedida: '', cantidad: 1, estado: 1 });
  selCategoriaMedida.value = ''; medidasDisponibles.value = [];
  Object.keys(erroresMedida).forEach(k => erroresMedida[k] = '');
};

const eliminarMedida = (idx) => { 
  const m = form.medidas[idx];
  if (m.idinsumomedida) {
    m.estado = m.estado === 1 ? 0 : 1;
  } else {
    form.medidas.splice(idx, 1); 
  }
};

// ── Guardar ───────────────────────────────────────────────────────────────────
const guardar = async () => {
  if (!validarTodo()) return;
  let urlImagen = form.imagen;
  if (archivo.value) { try { urlImagen = await SubirFoto(archivo.value); } catch { /* continuar */ } }
  emit('guardar', {
    idinsumo:      form.idinsumo,
    Nombre:        form.nombre.trim(),
    Descripcion:   form.descripcion.trim(),
    IdSubCategoria:form.idsubcategoria,
    stockminimo:   form.stockminimo,
    Url:           urlImagen,
    Insumomedida:  form.medidas.map(m => ({
      ...(m.idinsumomedida ? { IdInsumomedida: m.idinsumomedida } : {}),
      IdUnidadMedida: m.idunidadmedida,
      Cantidad:       m.cantidad,
      IdEstado:       m.estado
    })),
  });
};
</script>
