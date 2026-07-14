<template>
  <!-- Modal overlay -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <LayoutGrid class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ esNueva ? 'Nueva' : 'Editar' }} Categoría</h2>
            <p class="text-orange-200 text-sm">{{ esNueva ? 'Registra una nueva categoría' : 'Modifica los datos' }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 overflow-y-auto flex-grow space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Columna izquierda: datos principales -->
          <div class="space-y-5">
            <!-- Imagen + preview -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 space-y-4">
              <h3 class="text-base font-bold text-blue-800 flex items-center gap-2">
                <ImageIcon class="h-4 w-4" /> Información Principal
              </h3>

              <!-- Preview foto -->
              <div class="flex justify-center">
                <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center overflow-hidden shadow-md">
                  <img v-if="previewUrl" :src="previewUrl" alt="preview" class="w-full h-full object-cover" />
                  <LayoutGrid v-else class="h-10 w-10 text-orange-400" />
                </div>
              </div>

              <!-- Subir imagen -->
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  @change="onArchivoSeleccionado"
                  class="w-full py-2.5 px-4 border-0 shadow-md bg-gray-50/80 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                />
              </div>

              <!-- Nombre -->
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                  <Tag class="h-4 w-4 text-gray-500" /> Nombre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.nombre"
                  @blur="validarNombre"
                  :class="inputClass(errores.nombre)"
                  placeholder="Ej: Panadería"
                />
                <p v-if="errores.nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" /> {{ errores.nombre }}
                </p>
              </div>
            </div>
          </div>

          <!-- Columna derecha: subcategorías -->
          <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5">
            <h3 class="text-base font-bold text-orange-800 mb-4 flex items-center gap-2">
              <Folder class="h-4 w-4" /> Subcategorías
            </h3>

            <div class="space-y-2 max-h-64 overflow-y-auto pr-1 mb-3">
              <div
                v-for="(sub, index) in form.subcategorias"
                :key="index"
                class="p-3 bg-white/80 rounded-xl shadow-sm border border-orange-100 space-y-2"
                :class="sub.idestado === 0 ? 'opacity-60' : ''"
              >
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-gray-600 flex items-center gap-1">
                    <Folder class="h-3.5 w-3.5 text-gray-400" /> Subcategoría #{{ index + 1 }}
                  </label>
                  <button
                    type="button"
                    @click="toggleSubcategoria(index)"
                    :class="['p-1.5 rounded-full transition-colors',
                      sub.idestado === 0 ? 'bg-green-100 hover:bg-green-200 text-green-600' : 'bg-red-100 hover:bg-red-200 text-red-500']"
                    :title="sub.idestado === 0 ? 'Restaurar' : 'Eliminar'"
                  >
                    <RotateCcw v-if="sub.idestado === 0" class="h-3.5 w-3.5" />
                    <Trash2 v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  v-model="sub.nombre"
                  :disabled="sub.idestado === 2"
                  @blur="validarSubcategoria(index)"
                  :class="inputClass(errores.subcategorias[index])"
                  placeholder="Nombre de subcategoría"
                />
                <p v-if="errores.subcategorias[index]" class="text-red-500 text-xs italic flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" /> {{ errores.subcategorias[index] }}
                </p>
              </div>

              <div v-if="form.subcategorias.length === 0" class="text-center text-gray-400 text-sm py-4 italic">
                Sin subcategorías aún
              </div>
            </div>

            <button
              type="button"
              @click="agregarSubcategoria"
              class="w-full py-2 text-sm font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <Plus class="h-4 w-4" /> Añadir Subcategoría
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50/80 p-5 flex gap-3 flex-shrink-0 border-t border-gray-100">
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-600 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <X class="h-4 w-4" /> Cancelar
        </button>
        <button
          @click="guardar"
          :disabled="guardando"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60 text-white py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <LoaderCircle v-if="guardando" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          {{ guardando ? 'Guardando...' : (esNueva ? 'Crear' : 'Actualizar') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import {
  LayoutGrid, X, Tag, Folder, RotateCcw, Trash2,
  AlertCircle, Save, LoaderCircle, Plus
} from 'lucide-vue-next';
import { ImageIcon } from 'lucide-vue-next';
import { SubirFoto } from '@/Server/Foto';

const props = defineProps({
  show:      { type: Boolean, required: true },
  categoria: { type: Object,  default: null  }, // null = nueva
  guardando: { type: Boolean, default: false },
  // Lista de todas las categorías para validar duplicados
  todasCategorias: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'guardar']);

// ── Estado local ─────────────────────────────────────────────────────────────
const esNueva    = ref(true);
const previewUrl = ref('');
const archivo    = ref(null);

const formVacio = () => ({
  idcategoria:   null,
  nombre:        '',
  imagen:        '',
  subcategorias: [],
});

const form    = reactive(formVacio());
const errores = reactive({ nombre: '', subcategorias: [] });

// ── Inicializar ───────────────────────────────────────────────────────────────
const inicializar = () => {
  const c = props.categoria;
  if (!c) {
    Object.assign(form, formVacio());
    esNueva.value    = true;
    previewUrl.value = '';
    archivo.value    = null;
    errores.nombre   = '';
    errores.subcategorias = [];
    return;
  }

  esNueva.value       = false;
  form.idcategoria    = c.idcategoria    ?? c.IdCategoria ?? null;
  form.nombre         = c.nombre         ?? c.Nombre      ?? '';
  form.imagen         = c.imagen         ?? c.Imagen?.Url ?? '';
  previewUrl.value    = form.imagen;
  archivo.value       = null;

  // Mapear subcategorías — soporta ambas estructuras (nueva y vieja)
  form.subcategorias  = (c.subcategorias ?? c.Subcategoria ?? []).map(s => ({
    idsubcategoria: s.idsubcategoria ?? s.IdSubCategoria ?? null,
    nombre:         s.nombre         ?? s.Nombre         ?? '',
    idestado:       s.estado         ?? s.Estado?.IdEstado ?? 1,
  }));

  errores.nombre       = '';
  errores.subcategorias = [];
};

watch(() => [props.show, props.categoria], inicializar, { immediate: true });

// ── Archivo imagen ────────────────────────────────────────────────────────────
const onArchivoSeleccionado = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  archivo.value    = file;
  previewUrl.value = URL.createObjectURL(file);
};

// ── Clases dinámicas ──────────────────────────────────────────────────────────
const inputClass = (error) => [
  'w-full py-2.5 px-4 border rounded-2xl text-sm transition-all outline-none focus:ring-2',
  error
    ? 'border-red-300 bg-red-50 focus:ring-red-500/10'
    : 'border-gray-200 bg-gray-50/80 focus:bg-white focus:ring-blue-500/20'
];

// ── Subcategorías ─────────────────────────────────────────────────────────────
const agregarSubcategoria = () => {
  form.subcategorias.push({ idsubcategoria: null, nombre: '', idestado: 1 });
  errores.subcategorias.push('');
};

const toggleSubcategoria = (index) => {
  const sub = form.subcategorias[index];
  if (!sub.idsubcategoria) {
    // Nueva (no guardada) → eliminar directo
    form.subcategorias.splice(index, 1);
    errores.subcategorias.splice(index, 1);
  } else {
    // Existente → alternar estado activo/inactivo
    sub.idestado = sub.idestado === 1 ? 0 : 1;
  }
};

// ── Validaciones ──────────────────────────────────────────────────────────────
const validarNombre = () => {
  const v = form.nombre?.trim();
  if (!v) { errores.nombre = 'El nombre es requerido.'; return; }
  if (v.length > 50) { errores.nombre = 'Máximo 50 caracteres.'; return; }
  if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/.test(v)) { errores.nombre = 'Solo letras y espacios.'; return; }
  const dup = props.todasCategorias.some(c =>
    (c.nombre ?? c.Nombre ?? '').toLowerCase() === v.toLowerCase() &&
    (c.idcategoria ?? c.IdCategoria) !== form.idcategoria
  );
  errores.nombre = dup ? 'Ya existe una categoría con este nombre.' : '';
};

const validarSubcategoria = (index) => {
  const v = form.subcategorias[index]?.nombre?.trim();
  if (!v) { errores.subcategorias[index] = 'El nombre es requerido.'; return; }
  if (v.length > 50) { errores.subcategorias[index] = 'Máximo 50 caracteres.'; return; }
  if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/.test(v)) { errores.subcategorias[index] = 'Solo letras y espacios.'; return; }
  const dup = form.subcategorias.some((s, i) =>
    i !== index && s.idestado !== 2 && (s.nombre ?? '').toLowerCase() === v.toLowerCase()
  );
  errores.subcategorias[index] = dup ? 'Nombre duplicado en la lista.' : '';
};

const validarTodo = () => {
  validarNombre();
  form.subcategorias.forEach((_, i) => validarSubcategoria(i));
  return !errores.nombre && errores.subcategorias.every(e => !e);
};

// ── Guardar ───────────────────────────────────────────────────────────────────
const guardar = async () => {
  if (!validarTodo()) return;

  // Subir imagen si hay archivo nuevo
  let urlImagen = form.imagen;
  if (archivo.value) {
    try { urlImagen = await SubirFoto(archivo.value);
    
     }
    catch { /* el padre mostrará el error */ }
  }

  emit('guardar', {
    idcategoria:   form.idcategoria,
    nombre:        form.nombre.trim(),
    imagen:        urlImagen,
    subcategorias: form.subcategorias
      .filter(s => s.nombre.trim()) // solo las que tienen nombre
      .map(s => ({
        ...(s.idsubcategoria ? { idsubcategoria: s.idsubcategoria } : {}),
        nombre:   s.nombre.trim(),
        idestado: s.idestado,
      })),
  });
};

// Exponer para que el padre pueda forzar reset si quiere
defineExpose({ inicializar });
</script>
