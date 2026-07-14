<template>
  <!-- Modal -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl"><Ruler class="h-5 w-5" /></div>
          <div>
            <h2 class="text-xl font-bold">{{ esNueva ? 'Nueva' : 'Editar' }} Categoría de Medida</h2>
            <p class="text-orange-200 text-sm">{{ esNueva ? 'Registra una nueva categoría y sus unidades' : 'Modifica los datos' }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 overflow-y-auto flex-grow">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Columna izquierda: nombre de categoría -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 h-fit">
            <h3 class="text-base font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Tag class="h-4 w-4" /> Información Principal
            </h3>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-1">
                Nombre de la Categoría <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.nombre"
                @blur="validarNombre"
                @input="validarNombre"
                :class="inputClass('nombre')"
                placeholder="Ej: Peso, Volumen, Longitud"
              />
              <p v-if="errores.nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" /> {{ errores.nombre }}
              </p>
            </div>
          </div>

          <!-- Columna derecha: unidades -->
          <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5">
            <h3 class="text-base font-bold text-orange-800 mb-4 flex items-center gap-2">
              <Scale class="h-4 w-4" /> Unidades de Medida
            </h3>

            <div class="space-y-3 max-h-72 overflow-y-auto pr-1 mb-3">
              <div
                v-for="(u, idx) in form.unidades"
                :key="idx"
                class="p-3 bg-white/80 rounded-xl shadow-sm border border-orange-100 space-y-2"
                :class="u.idestado === 2 ? 'opacity-60' : ''"
              >
                <!-- Cabecera unidad -->
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-gray-600">Unidad #{{ idx + 1 }}</span>
                  <button
                    type="button"
                    @click="toggleUnidad(idx)"
                    :class="['p-1.5 rounded-full transition-colors',
                      u.idestado === 2 ? 'bg-green-100 hover:bg-green-200 text-green-600' : 'bg-red-100 hover:bg-red-200 text-red-500']"
                    :title="u.idestado === 2 ? 'Restaurar' : 'Eliminar'"
                  >
                    <RotateCcw v-if="u.idestado === 2" class="h-3.5 w-3.5" />
                    <Trash2 v-else class="h-3.5 w-3.5" />
                  </button>
                </div>

                <!-- Campos nombre + abreviatura + cantidad -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="col-span-2">
                    <label class="text-xs text-gray-600 font-semibold mb-0.5 block">Nombre <span class="text-red-500">*</span></label>
                    <input
                      v-model="u.nombre"
                      :disabled="u.idestado === 2"
                      @blur="validarUnidad(idx, 'nombre')"
                      @input="validarUnidad(idx, 'nombre')"
                      :class="inputSmClass(erroresUnidades[idx]?.nombre)"
                      placeholder="Ej: Gramo"
                    />
                    <p v-if="erroresUnidades[idx]?.nombre" class="text-red-500 text-xs italic mt-0.5 flex items-center gap-1">
                      <AlertCircle class="h-3 w-3" />{{ erroresUnidades[idx].nombre }}
                    </p>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 font-semibold mb-0.5 block">Abreviatura <span class="text-red-500">*</span></label>
                    <input
                      v-model="u.abreviatura"
                      :disabled="u.idestado === 2"
                      @blur="validarUnidad(idx, 'abreviatura')"
                      @input="validarUnidad(idx, 'abreviatura')"
                      :class="inputSmClass(erroresUnidades[idx]?.abreviatura)"
                      placeholder="Ej: g"
                    />
                    <p v-if="erroresUnidades[idx]?.abreviatura" class="text-red-500 text-xs italic mt-0.5 flex items-center gap-1">
                      <AlertCircle class="h-3 w-3" />{{ erroresUnidades[idx].abreviatura }}
                    </p>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 font-semibold mb-0.5 block">Cantidad base <span class="text-red-500">*</span></label>
                    <input
                      v-model.number="u.cantidad"
                      type="number"
                      :disabled="u.idestado === 2"
                      @blur="validarUnidad(idx, 'cantidad')"
                      :class="inputSmClass(erroresUnidades[idx]?.cantidad)"
                      placeholder="1"
                      min="0"
                      step="any"
                    />
                    <p v-if="erroresUnidades[idx]?.cantidad" class="text-red-500 text-xs italic mt-0.5 flex items-center gap-1">
                      <AlertCircle class="h-3 w-3" />{{ erroresUnidades[idx].cantidad }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="form.unidades.length === 0" class="text-center text-gray-400 text-sm py-4 italic">
                Sin unidades aún
              </div>
            </div>

            <button
              type="button"
              @click="agregarUnidad"
              class="w-full py-2 text-sm font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <Plus class="h-4 w-4" /> Añadir Unidad de Medida
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50/80 p-5 flex gap-3 border-t border-gray-100 flex-shrink-0">
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
import { reactive, ref, computed, watch } from 'vue';
import {
  Ruler, X, Tag, Scale, Plus, RotateCcw, Trash2,
  AlertCircle, Save, LoaderCircle
} from 'lucide-vue-next';

const props = defineProps({
  show:         { type: Boolean, required: true },
  medida:       { type: Object,  default: null  }, // null = nueva
  guardando:    { type: Boolean, default: false },
  // Para validar duplicados globales
  todasMedidas: { type: Array,   default: () => [] },
});

const emit = defineEmits(['close', 'guardar']);

const esNueva = computed(() => !props.medida?.idcategoriamedida);

// ── Formulario ────────────────────────────────────────────────────────────────
const form = reactive({ idcategoriamedida: null, nombre: '', unidades: [] });
const errores = reactive({ nombre: '' });
const erroresUnidades = ref([]); // array de { nombre, abreviatura, cantidad }

const inicializar = () => {
  const m = props.medida;
  form.idcategoriamedida = null;
  form.nombre = '';
  form.unidades = [];
  errores.nombre = '';
  erroresUnidades.value = [];

  if (!m) return;

  form.idcategoriamedida = m.idcategoriamedida;
  form.nombre            = m.nombre ?? '';
  form.unidades          = (m.Unidadmedida ?? []).map(u => ({
    idunidadmedida: u.IdUnidadMedida ?? null,
    nombre:         u.Nombre         ?? '',
    abreviatura:    u.Abreviatura    ?? '',
    cantidad:       Number(u.Cantidad ?? 1),
    idestado:       u.Estado         ?? 1,
  }));
  erroresUnidades.value = form.unidades.map(() => ({ nombre: '', abreviatura: '', cantidad: '' }));
};

watch(() => [props.show, props.medida], ([v]) => { if (v) inicializar(); }, { immediate: true });

// ── Clases input ──────────────────────────────────────────────────────────────
const inputBase = 'w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20';
const inputClass = (campo) => errores[campo] ? `${inputBase} ring-2 ring-red-500/20 bg-red-50` : inputBase;
const inputSmBase = 'w-full px-3 py-2 border-0 shadow-md bg-gray-50/80 rounded-xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-sm';
const inputSmClass = (err) => err ? `${inputSmBase} ring-2 ring-red-500/20 bg-red-50` : inputSmBase;

// ── Validaciones ──────────────────────────────────────────────────────────────
const validarNombre = () => {
  const v = form.nombre?.trim();
  if (!v) { errores.nombre = 'El nombre es requerido.'; return; }
  if (v.length > 50) { errores.nombre = 'Máximo 50 caracteres.'; return; }
  if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/.test(v)) { errores.nombre = 'Solo letras y espacios.'; return; }
  // Verificar duplicado ignorando la categoría actual
  const dup = props.todasMedidas.some(m =>
    (m.nombre ?? '').toLowerCase() === v.toLowerCase() &&
    m.idcategoriamedida !== form.idcategoriamedida
  );
  errores.nombre = dup ? 'Ya existe una categoría con este nombre.' : '';
};

const validarUnidad = (idx, campo) => {
  if (!erroresUnidades.value[idx]) erroresUnidades.value[idx] = { nombre: '', abreviatura: '', cantidad: '' };
  const u = form.unidades[idx];
  const v = u[campo];

  switch (campo) {
    case 'nombre': {
      if (!v?.trim()) { erroresUnidades.value[idx].nombre = 'Requerido.'; break; }
      if (v.length > 50) { erroresUnidades.value[idx].nombre = 'Máx 50 caracteres.'; break; }
      if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/.test(v)) { erroresUnidades.value[idx].nombre = 'Solo letras.'; break; }
      // Duplicado en el mismo formulario
      const dupForm = form.unidades.some((u2, i) => i !== idx && u2.idestado !== 2 && (u2.nombre ?? '').toLowerCase() === v.toLowerCase());
      // Duplicado global (ignorar el mismo id)
      const dupGlobal = props.todasMedidas.some(m =>
        m.Unidadmedida?.some(u2 => (u2.Nombre ?? '').toLowerCase() === v.toLowerCase() && u2.IdUnidadMedida !== u.idunidadmedida)
      );
      erroresUnidades.value[idx].nombre = dupForm ? 'Nombre duplicado en la lista.' : dupGlobal ? `'${v}' ya existe en el sistema.` : '';
      break;
    }
    case 'abreviatura': {
      if (!v?.trim()) { erroresUnidades.value[idx].abreviatura = 'Requerida.'; break; }
      if (v.length > 10) { erroresUnidades.value[idx].abreviatura = 'Máx 10 caracteres.'; break; }
      if (!/^[a-zA-Z]+$/.test(v)) { erroresUnidades.value[idx].abreviatura = 'Solo letras.'; break; }
      const dupForm = form.unidades.some((u2, i) => i !== idx && u2.idestado !== 2 && (u2.abreviatura ?? '').toLowerCase() === v.toLowerCase());
      const dupGlobal = props.todasMedidas.some(m =>
        m.Unidadmedida?.some(u2 => (u2.Abreviatura ?? '').toLowerCase() === v.toLowerCase() && u2.IdUnidadMedida !== u.idunidadmedida)
      );
      erroresUnidades.value[idx].abreviatura = dupForm ? 'Abreviatura duplicada.' : dupGlobal ? `'${v}' ya existe en el sistema.` : '';
      break;
    }
    case 'cantidad':
      erroresUnidades.value[idx].cantidad = (!v && v !== 0) || v <= 0 ? 'Debe ser mayor que 0.' : '';
      break;
  }
};

const validarTodo = () => {
  validarNombre();
  form.unidades.forEach((_, i) => { ['nombre','abreviatura','cantidad'].forEach(c => validarUnidad(i, c)); });
  const unidadesOk = erroresUnidades.value.every(e => !e.nombre && !e.abreviatura && !e.cantidad);
  return !errores.nombre && unidadesOk;
};

// ── CRUD unidades ─────────────────────────────────────────────────────────────
const agregarUnidad = () => {
  form.unidades.push({ idunidadmedida: null, nombre: '', abreviatura: '', cantidad: 1, idestado: 1 });
  erroresUnidades.value.push({ nombre: '', abreviatura: '', cantidad: '' });
};

const toggleUnidad = (idx) => {
  const u = form.unidades[idx];
  if (!u.idunidadmedida) {
    // Nueva → eliminar
    form.unidades.splice(idx, 1);
    erroresUnidades.value.splice(idx, 1);
  } else {
    // Existente → alternar estado
    u.idestado = u.idestado === 1 ? 2 : 1;
  }
};

// ── Guardar ───────────────────────────────────────────────────────────────────
const guardar = () => {
  if (!validarTodo()) return;
  emit('guardar', {
    IdCategoriaMedida: form.idcategoriamedida,
    Nombre:            form.nombre.trim(),
    Unidadmedida:      form.unidades.map(u => ({
      ...(u.idunidadmedida ? { IdUnidadMedida: u.idunidadmedida } : {}),
      Nombre:      u.nombre.trim(),
      Abreviatura: u.abreviatura.trim(),
      Cantidad:    u.cantidad,
      IdEstado:    u.idestado,
    })),
  });
};
</script>
