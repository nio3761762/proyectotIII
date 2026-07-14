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
              <ShoppingBag class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                {{ esNuevo ? 'Registrar' : 'Editar' }} Producto
              </h1>
              <p class="text-gray-500 mt-0.5 text-sm">{{ esNuevo ? 'Completa los datos del nuevo producto' : 'Modifica la información del producto' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid principal -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">

      <!-- ── Columna 2/3: datos + presentaciones ── -->
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
              <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
                <Type class="h-4 w-4 mr-2 text-orange-500" /> Nombre del Producto <span class="text-red-500 ml-1">*</span>
              </label>
              <input v-model="form.nombre" @blur="validar('nombre')" @input="validar('nombre')"
                :class="inputClass('nombre')" placeholder="Ej: Cuñape" />
              <p v-if="errores.nombre" class="err">{{ errores.nombre }}</p>
            </div>

            <!-- Descripción corta -->
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
                <FileText class="h-4 w-4 mr-2 text-orange-500" /> Descripción <span class="text-red-500 ml-1">*</span>
              </label>
              <textarea v-model="form.descripcion" @blur="validar('descripcion')"
                :class="inputClass('descripcion')" rows="2" class="resize-none"
                placeholder="Descripción breve del producto..." />
              <p v-if="errores.descripcion" class="err">{{ errores.descripcion }}</p>
            </div>

            <!-- Descripción larga -->
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
                <AlignLeft class="h-4 w-4 mr-2 text-orange-500" /> Descripción Larga <span class="text-gray-400 text-xs ml-1">(opcional)</span>
              </label>
              <textarea v-model="form.descripcionlarga" :class="inputClass(null)" rows="3" class="resize-none"
                placeholder="Descripción detallada, ingredientes, modo de preparación..." />
            </div>

            <!-- Categoría + Subcategoría -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
                  <LayoutGrid class="h-4 w-4 mr-2 text-orange-500" /> Categoría <span class="text-red-500 ml-1">*</span>
                </label>
                <select v-model="selCategoria" @change="onCategoriaChange" :class="inputClass(null)">
                  <option value="">Seleccionar</option>
                  <option v-for="c in categorias" :key="c.idcategoria" :value="c.idcategoria">{{ c.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
                  <Layers class="h-4 w-4 mr-2 text-orange-500" /> Subcategoría <span class="text-red-500 ml-1">*</span>
                </label>
                <select v-model="form.idsubcategoria" :disabled="!selCategoria || cargandoSub"
                  @blur="validar('subcategoria')" :class="inputClass('subcategoria')">
                  <option value="">{{ cargandoSub ? 'Cargando...' : 'Seleccionar' }}</option>
                  <option v-for="s in subcategorias" :key="s.idsubcategoria" :value="s.idsubcategoria">{{ s.nombre }}</option>
                </select>
                <p v-if="errores.subcategoria" class="err">{{ errores.subcategoria }}</p>
              </div>
            </div>

          </div>
        </div>

        <!-- Presentaciones y precios -->
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Tag class="h-5 w-5 text-blue-600" /> Presentaciones y Precios
            </h3>
          </div>
          <div class="p-6 space-y-5">

            <!-- Formulario inline para agregar/editar pre sentación -->
            <div class="bg-blue-50/60 rounded-2xl p-5 space-y-4">
              <p class="text-sm font-semibold text-blue-700 flex items-center gap-1.5">
                <component :is="presEnEdicion !== null ? Pencil : Plus" class="h-3.5 w-3.5" />
                {{ presEnEdicion !== null ? 'Editando presentación' : 'Nueva presentación' }}
              </p>

              <!-- Presentación + imagen lado a lado -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Presentación -->
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Presentación <span class="text-red-500">*</span></label>
                  <select v-model="nuevaPres.idpresentacion" :class="inputSmClass(erroresPres.idpresentacion)">
                    <option value="">Seleccionar presentación</option>
                    <option v-for="p in presentaciones" :key="p.idpresentacion" :value="p.idpresentacion">{{ p.nombre }}</option>
                  </select>
                  <p v-if="erroresPres.idpresentacion" class="err">{{ erroresPres.idpresentacion }}</p>
                </div>

                <!-- Imagen de la presentación -->
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Imagen (opcional)</label>
                  <div class="flex items-center gap-2">
                    <div class="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0 flex items-center justify-center">
                      <img v-if="nuevaPres.previewUrl" :src="nuevaPres.previewUrl" class="w-full h-full object-cover" />
                      <ImageIcon v-else class="h-5 w-5 text-gray-300" />
                    </div>
                    <input type="file" accept="image/*" @change="onArchivoPres" ref="fileInputPres"
                      class="w-full py-1.5 px-2 border-0 shadow-sm bg-white rounded-xl text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 file:mr-2 file:py-0.5 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 transition-all" />
                  </div>
                </div>
              </div>

              <!-- Precio venta + precio mayor + cantidad + comision -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Precio Venta (Bs.) <span class="text-red-500">*</span></label>
                  <input v-model.number="nuevaPres.precio" type="number" min="0" step="0.01"
                    :class="inputSmClass(erroresPres.precio)" placeholder="0.00" />
                  <p v-if="erroresPres.precio" class="err">{{ erroresPres.precio }}</p>
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Precio Mayor (Bs.) <span class="text-red-500">*</span></label>
                  <input v-model.number="nuevaPres.preciomayor" type="number" min="0" step="0.01"
                    :class="inputSmClass(erroresPres.preciomayor)" placeholder="0.00" />
                  <p v-if="erroresPres.preciomayor" class="err">{{ erroresPres.preciomayor }}</p>
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Comisión (Bs.)</label>
                  <input v-model.number="nuevaPres.comision" type="number" min="0" step="0.01"
                    :class="inputSmClass(null)" :placeholder="(nuevaPres.precio && nuevaPres.preciomayor) ? (nuevaPres.precio - nuevaPres.preciomayor).toFixed(2) : '0.00'" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Cantidad <span class="text-red-500">*</span></label>
                  <input v-model.number="nuevaPres.cantidad" type="number" min="0"
                    :class="inputSmClass(erroresPres.cantidad)" placeholder="0" />
                  <p v-if="erroresPres.cantidad" class="err">{{ erroresPres.cantidad }}</p>
                </div>
              </div>

              <!-- Acciones del formulario de presentación -->
              <div class="flex gap-2 justify-end">
                <button v-if="presEnEdicion !== null" @click="cancelarEdicionPres" type="button"
                  class="px-4 py-2 text-sm border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors flex items-center gap-1">
                  <X class="h-3.5 w-3.5" /> Cancelar
                </button>
                <button @click="agregarPresentacion" type="button"
                  class="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow transition-all flex items-center gap-1 font-semibold">
                  <component :is="presEnEdicion !== null ? Save : Plus" class="h-3.5 w-3.5" />
                  {{ presEnEdicion !== null ? 'Actualizar' : 'Agregar' }}
                </button>
              </div>
            </div>

            <p v-if="errores.presentaciones" class="err">{{ errores.presentaciones }}</p>

            <!-- Lista de presentaciones -->
            <div v-if="form.presentaciones.length" class="space-y-2">
              <div v-for="(p, idx) in form.presentaciones" :key="idx"
                :class="['flex items-center justify-between px-4 py-3 bg-white rounded-2xl border shadow-sm transition-all',
                  presEnEdicion === idx ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-100',
                  p.idestado === 0 ? 'opacity-60 bg-gray-50 border-dashed' : '']">
                <!-- Info presentación -->
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center relative">
                    <img v-if="p.previewUrl || p.urlImagen" :src="p.previewUrl || p.urlImagen" class="w-full h-full object-cover" />
                    <Tag v-else class="h-4 w-4 text-gray-300" />
                    <div v-if="p.idestado === 0" class="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                      <EyeOff class="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold text-gray-800">{{ nombrePresentacion(p.idpresentacion) }}</p>
                      <span v-if="p.idestado === 0" class="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-md font-bold uppercase tracking-wider">Inactivo</span>
                      <span v-else class="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded-md font-bold uppercase tracking-wider">Activo</span>
                    </div>
                    <p class="text-xs text-gray-500">
                      Venta: <strong class="text-orange-600">Bs. {{ p.precio }}</strong> · 
                      Mayor: Bs. {{ p.preciomayor }} · 
                      Comisión: <span class="text-green-600 font-medium">Bs. {{ p.comision }}</span> · 
                      Cant: <span class="font-medium text-blue-600">{{ p.cantidad }}</span>
                    </p>
                  </div>
                </div>
                <!-- Acciones -->
                <div class="flex gap-1.5">
                  <button @click="editarPresentacion(idx)"
                    :disabled="presEnEdicion !== null && presEnEdicion !== idx"
                    class="w-7 h-7 border border-orange-200 hover:bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                    title="Editar">
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button @click="toggleEstadoPres(idx)"
                    :disabled="presEnEdicion !== null"
                    :class="[
                      'w-7 h-7 border rounded-xl flex items-center justify-center transition-colors disabled:opacity-40',
                      p.idestado === 0 ? 'border-green-200 hover:bg-green-50 text-green-500' : 'border-red-200 hover:bg-red-50 text-red-500'
                    ]"
                    :title="p.idestado === 0 ? 'Activar' : (p.idproductomedida ? 'Desactivar' : 'Eliminar')">
                    <component :is="p.idestado === 0 ? Eye : (p.idproductomedida ? EyeOff : Trash2)" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-400 text-sm italic">
              Agrega al menos una presentación para poder guardar
            </div>

          </div>
        </div>
      </div>

      <!-- ── Columna 1/3: imagen del producto ── -->
      <div class="space-y-6">
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 rounded-3xl overflow-hidden sticky top-6">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon class="h-5 w-5 text-purple-600" /> Imagen del Producto
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <!-- Preview -->
            <div class="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-2 border-dashed border-orange-200 flex items-center justify-center">
              <img v-if="preview" :src="preview" class="w-full h-full object-cover rounded-2xl" />
              <div v-else class="text-center p-4">
                <ShoppingBag class="h-14 w-14 text-orange-300 mx-auto mb-2" />
                <p class="text-xs text-gray-400">Sin imagen seleccionada</p>
              </div>
            </div>
            <!-- Input file -->
            <input type="file" accept="image/*" @change="onArchivoProducto"
              class="w-full py-2.5 px-4 border-0 shadow-md bg-gray-50/80 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all" />
            <p v-if="preview" class="text-xs text-gray-400 text-center">Haz clic en el input para cambiar la imagen</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones guardar -->
    <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
      <button type="button" @click="$emit('cancelar')"
        class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2 text-gray-600 font-medium">
        <X class="h-4 w-4" /> Cancelar
      </button>
      <button @click="guardar" :disabled="guardando"
        class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold">
        <LoaderCircle v-if="guardando" class="h-4 w-4 animate-spin" />
        <Save v-else class="h-4 w-4" />
        {{ guardando ? 'Guardando...' : (esNuevo ? 'Registrar Producto' : 'Actualizar Producto') }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import {
  ArrowLeft, ShoppingBag, Info, Type, FileText, AlignLeft,
  LayoutGrid, Layers, Tag, Plus, X, Save, LoaderCircle,
  Pencil, Trash2, Eye, EyeOff
} from 'lucide-vue-next';
import { ImageIcon } from 'lucide-vue-next';
import { SubirFoto }            from '@/Server/api';
import { ObtenerSubCategorias } from '@/Server/Categoria';

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
  producto:       { type: Object, default: null  }, // null = nuevo
  guardando:      { type: Boolean, default: false },
  categorias:     { type: Array,  default: () => [] }, // [{ idcategoria, nombre }]
  presentaciones: { type: Array,  default: () => [] }, // [{ idpresentacion, nombre }]
});

const emit = defineEmits(['guardar', 'cancelar']);

const esNuevo = computed(() => !props.producto?.idproducto);

// ── Formulario principal ──────────────────────────────────────────────────────
const form = reactive({
  idproducto:       null,
  nombre:           '',
  descripcion:      '',
  descripcionlarga: '',
  idsubcategoria:   '',
  imagen:           '',          // URL actual en el servidor
  presentaciones:   [],          // [{ idproductomedida?, idpresentacion, precio, preciomayor, cantidad, urlImagen, archivo?, idestado }]
});

const errores = reactive({ nombre: '', descripcion: '', subcategoria: '', presentaciones: '' });
const preview  = ref('');        // preview imagen producto
const archivo  = ref(null);      // File objeto para subir

// Categoría dependiente
const selCategoria  = ref('');
const subcategorias = ref([]);
const cargandoSub   = ref(false);

// Refs para inputs de archivo
const fileInputPres = ref(null);

// ── Presentación en proceso ───────────────────────────────────────────────────
const nuevaPres = reactive({
  idproductomedida: null,
  idpresentacion:   '',
  precio:           null,
  preciomayor:      null,
  comision:         null,
  cantidad:         null,
  urlImagen:        '',          // URL ya subida o vacío
  previewUrl:       '',          // preview local
  archivo:          null,        // File para subir al guardar
  idestado:         1,
});
const erroresPres = reactive({ idpresentacion: '', precio: '', preciomayor: '', cantidad: '' });
const presEnEdicion = ref(null); // índice de la presentación en edición, o null

const cancelarEdicionPres = () => {
  presEnEdicion.value = null;
  Object.assign(nuevaPres, {
    idproductomedida: null, idpresentacion: '', precio: null, preciomayor: null, comision: null, cantidad: null,
    urlImagen: '', previewUrl: '', archivo: null, idestado: 1,
  });
  if (fileInputPres.value) fileInputPres.value.value = '';
  Object.keys(erroresPres).forEach(k => erroresPres[k] = '');
};

// ── Subcategorías ─────────────────────────────────────────────────────────────
const cargarSubcategorias = async (idcat) => {
  if (!idcat) return;
  cargandoSub.value = true;
  try {
    const r = await ObtenerSubCategorias(idcat);
    const listaRaw = r.result ?? r ?? [];
    // Normalizamos para que siempre tenga idsubcategoria en minúsculas
    subcategorias.value = listaRaw.map(s => ({
      idsubcategoria: s.idsubcategoria ?? s.IdSubCategoria,
      nombre: s.nombre ?? s.Nombre
    }));
  } catch (err) {
    console.error('Error al cargar subcategorías:', err);
    subcategorias.value = [];
  } finally {
    cargandoSub.value = false;
  }
};

// ── Inicializar al abrir ──────────────────────────────────────────────────────
const inicializar = async () => {
  const p = props.producto;
 

  // Limpiar
  Object.assign(form, { idproducto: null, nombre: '', descripcion: '', descripcionlarga: '', idsubcategoria: '', imagen: '', presentaciones: [] });
  preview.value = ''; archivo.value = null;
  selCategoria.value = ''; subcategorias.value = [];
  Object.keys(errores).forEach(k => errores[k] = '');
  cancelarEdicionPres();

  if (!p) return;

  form.idproducto       = p.idproducto           ?? p.IdProducto;
  form.nombre           = (p.nombre || p.Nombre)?.trim() ?? '';
  form.descripcion      = p.descripcion          ?? p.Descripcion ?? '';
  form.descripcionlarga = p.descripcionlarga     ?? p.Descripcionlarga ?? '';
  form.imagen           = p.imagen               ?? p.Imagen ?? p.Url ?? '';
  preview.value         = form.imagen;

  // Extraer ID de subcategoría y categoría padre
  const subcat = p.Subcategoria || p.SubCategoria;
  const idSub = subcat?.idsubcategoria ?? subcat?.IdSubCategoria ?? '';
  const idCat = subcat?.Categoria?.idcategoria ?? subcat?.Categoria?.IdCategoria;


  if (idCat) {
    selCategoria.value = idCat;
     await cargarSubcategorias(idCat);  
    // Asignar DESPUÉS de cargar la lista para que el match sea efectivo
    form.idsubcategoria = idSub;
  } else {
    form.idsubcategoria = idSub;
  }

  // Mapear presentaciones existentes
  const medidas = p.Productomedida ?? p.productomedida ?? [];
  form.presentaciones = medidas.map(pm => ({
    idproductomedida: pm.IdProductoMedida ?? pm.idproductomedida,
    idpresentacion:   pm.Presentacion?.IdPresentacion ?? pm.Presentacion?.idpresentacion ?? '',
    precio:           pm.PrecioVenta ?? pm.Precio ?? 0,
    preciomayor:      pm.PrecioMayor ?? 0,
    comision:         pm.Comision    ?? 0,
    cantidad:         pm.Cantidad    ?? pm.cantidad ?? 0,
    urlImagen:        pm.Imagen      ?? pm.Imagen ?? pm.Url ?? '',
    previewUrl:       pm.Imagen      ?? pm.Imagen ?? pm.Url ?? '',
    archivo:          null,
    idestado:         pm.Estado?.idestado ?? pm.Estado?.Idestado ?? pm.Estado ?? 1,
  }));
};

watch(() => props.producto, inicializar, { immediate: true });

const onCategoriaChange = async () => {
  form.idsubcategoria = ''; subcategorias.value = [];
  if (selCategoria.value) await cargarSubcategorias(selCategoria.value);
};

// ── Imagen del producto ───────────────────────────────────────────────────────
const onArchivoProducto = (e) => {
  const file = e.target.files[0]; if (!file) return;
  archivo.value = file;
  const r = new FileReader(); r.onload = (ev) => { preview.value = ev.target.result; }; r.readAsDataURL(file);
};

// ── Imagen de la presentación (preview inmediato) ─────────────────────────────
const onArchivoPres = (e) => {
  const file = e.target.files[0]; if (!file) return;
  nuevaPres.archivo = file;
  const r = new FileReader(); r.onload = (ev) => { nuevaPres.previewUrl = ev.target.result; }; r.readAsDataURL(file);
};

// ── Clases input ──────────────────────────────────────────────────────────────
const BASE    = 'w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-sm';
const SM_BASE = 'w-full px-3 py-2.5 border-0 shadow-md bg-white rounded-xl transition-all text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20';

const inputClass   = (campo) => campo && errores[campo] ? `${BASE} ring-2 ring-red-500/20 bg-red-50` : BASE;
const inputSmClass = (err)   => err  ? `${SM_BASE} ring-2 ring-red-500/20 bg-red-50` : SM_BASE;

// ── Validaciones ──────────────────────────────────────────────────────────────
const validar = (campo) => {
  switch (campo) {
    case 'nombre':
      errores.nombre = !form.nombre?.trim() ? 'El nombre es requerido.'
        : form.nombre.trim().length > 50 ? 'Máximo 50 caracteres.' : '';
      break;
    case 'descripcion':
      errores.descripcion = !form.descripcion?.trim() ? 'La descripción es requerida.' : '';
      break;
    case 'subcategoria':
      errores.subcategoria = !form.idsubcategoria ? 'La subcategoría es requerida.' : '';
      break;
  }
};

const validarPres = () => {
  erroresPres.idpresentacion = !nuevaPres.idpresentacion ? 'Selecciona una presentación.' : '';
  erroresPres.precio         = (!nuevaPres.precio && nuevaPres.precio !== 0) || nuevaPres.precio <= 0 ? 'Debe ser > 0.' : '';
  erroresPres.preciomayor    = (!nuevaPres.preciomayor && nuevaPres.preciomayor !== 0) || nuevaPres.preciomayor <= 0 ? 'Debe ser > 0.' : '';
  erroresPres.cantidad       = (nuevaPres.cantidad === null || nuevaPres.cantidad === undefined || nuevaPres.cantidad < 0) ? 'Debe ser >= 0.' : '';
  return Object.values(erroresPres).every(e => !e);
};

const validarTodo = () => {
  ['nombre', 'descripcion', 'subcategoria'].forEach(validar);
  errores.presentaciones = form.presentaciones.length === 0 ? 'Agrega al menos una presentación.' : '';
  return Object.values(errores).every(e => !e);
};

// ── CRUD presentaciones ───────────────────────────────────────────────────────
const nombrePresentacion = (id) =>
  props.presentaciones.find(p => p.idpresentacion === id)?.nombre ?? id;

const agregarPresentacion = () => {
  if (!validarPres()) return;
  
  // Si no se ingresó comisión, se calcula automáticamente
  let comisionFinal = nuevaPres.comision;
  if (comisionFinal === null || comisionFinal === undefined || comisionFinal === '') {
    comisionFinal = Math.max(0, nuevaPres.precio - nuevaPres.preciomayor);
  }

  const obj = {
    idproductomedida: nuevaPres.idproductomedida,
    idpresentacion:   nuevaPres.idpresentacion,
    precio:           nuevaPres.precio,
    preciomayor:      nuevaPres.preciomayor,
    comision:         comisionFinal,
    cantidad:         nuevaPres.cantidad,
    urlImagen:        nuevaPres.urlImagen,
    previewUrl:       nuevaPres.previewUrl,
    archivo:          nuevaPres.archivo,
    idestado:         nuevaPres.idestado,
  };
  if (presEnEdicion.value !== null) {
    form.presentaciones[presEnEdicion.value] = obj;
  } else {
    form.presentaciones.push(obj);
  }
  cancelarEdicionPres();
};

const editarPresentacion = (idx) => {
  presEnEdicion.value = idx;
  const p = form.presentaciones[idx];
  Object.assign(nuevaPres, {
    idproductomedida: p.idproductomedida,
    idpresentacion:   p.idpresentacion,
    precio:           p.precio,
    preciomayor:      p.preciomayor,
    comision:         p.comision,
    cantidad:         p.cantidad,
    urlImagen:        p.urlImagen,
    previewUrl:       p.previewUrl,
    archivo:          p.archivo,
    idestado:         p.idestado,
  });
};

const toggleEstadoPres = (idx) => {
  const p = form.presentaciones[idx];
  if (!p.idproductomedida) {
    // Si es nuevo, lo quitamos directamente
    form.presentaciones.splice(idx, 1);
  } else {
    // Si ya existe, cambiamos su estado (1: activo, 0: inactivo)
    p.idestado = p.idestado === 1 ? 0 : 1;
  }
};

// ── Guardar ───────────────────────────────────────────────────────────────────
const guardar = async () => {
  if (!validarTodo()) return;

  // 1. Subir imagen del producto si hay archivo nuevo
  let urlImagen = form.imagen;
  if (archivo.value) {
    try { urlImagen = await SubirFoto(archivo.value); }
    catch (e) { console.error('Error subiendo imagen del producto', e); }
  }

  // 2. Subir imágenes de presentaciones que tengan archivo nuevo
  const presentacionesPayload = await Promise.all(
    form.presentaciones.map(async (p) => {
      let url = p.urlImagen ?? '';
      if (p.archivo) {
        try { url = await SubirFoto(p.archivo); }
        catch (e) { console.error('Error subiendo imagen de presentación', e); }
      }
      return {
        ...(p.idproductomedida ? { Idproductomedida: p.idproductomedida } : {}),
        Idpresentacion: p.idpresentacion,
        Precio:         p.precio,
        PrecioMayor:    p.preciomayor,
        Comision:       p.comision,
        Cantidad:       p.cantidad,
        Url:            url || undefined,
        Idestado:       p.idestado,
      };
    })
  );

  // 3. Emitir payload al padre
  emit('guardar', {
    idproducto:       form.idproducto,
    Nombre:           form.nombre.trim(),
    Descripcion:      form.descripcion.trim(),
    Descripcionlarga: form.descripcionlarga.trim() || undefined,
    IdSubCategoria:   form.idsubcategoria,
    Url:              urlImagen || undefined,
    Productomedida:   presentacionesPayload,
  });
};
</script>

<style >
</style>
