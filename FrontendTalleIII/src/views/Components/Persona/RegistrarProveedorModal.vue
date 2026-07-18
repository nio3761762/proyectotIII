<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    @click.self="$emit('cancelar')"
  >
    <div class="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div class="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 flex-shrink-0">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold">
              {{ esEdicion ? 'Actualizar Proveedor' : 'Registrar Proveedor' }}
            </h2>
            <p class="text-emerald-100 text-sm mt-1">{{ nombrePersona }}</p>
          </div>
          <button @click="$emit('cancelar')" class="text-white hover:text-emerald-100 transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="overflow-y-auto flex-grow p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Persona</label>
            <input :value="nombrePersona" readonly class="w-full border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Email</label>
            <input :value="emailPersona || 'Sin email registrado'" readonly class="w-full border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 cursor-not-allowed" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-gray-700 font-semibold mb-2">Razón social</label>
            <div class="relative">
              <Building2 class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
              <input
                v-model="form.razonSocial"
                type="text"
                placeholder="Ingrese la razón social"
                class="w-full pl-12 pr-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <p v-if="errores.razonSocial" class="text-red-500 text-xs italic mt-1">{{ errores.razonSocial }}</p>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">NIT</label>
            <div class="relative">
              <BadgeInfo class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
              <input
                v-model="form.nit"
                type="text"
                placeholder="Ingrese el NIT"
                class="w-full pl-12 pr-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <p v-if="errores.nit" class="text-red-500 text-xs italic mt-1">{{ errores.nit }}</p>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Tipo proveedor</label>
            <div class="relative">
              <Truck class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500 pointer-events-none" />
              <select
                v-model="form.idTipoProveedor"
                class="w-full pl-12 pr-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 appearance-none"
              >
                <option value="">Seleccione un tipo</option>
                <option
                  v-for="tipo in tiposProveedorNormalizados"
                  :key="tipo.id"
                  :value="tipo.id"
                >
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>
            <p v-if="errores.idTipoProveedor" class="text-red-500 text-xs italic mt-1">{{ errores.idTipoProveedor }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            @click="$emit('cancelar')"
            class="px-6 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2"
          >
            <X class="h-4 w-4" />
            Cancelar
          </button>
          <button
            @click="emitirGuardar"
            :disabled="guardando"
            class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-40"
          >
            <LoaderCircle v-if="guardando" class="animate-spin h-4 w-4" />
            <Save v-else class="h-4 w-4" />
            {{ guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Registrar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { X, Save, LoaderCircle, Building2, BadgeInfo, Truck } from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  persona: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
  tiposProveedor: { type: Array, default: () => [] },
});

const emit = defineEmits(['guardar', 'cancelar']);

const form = reactive({
  razonSocial: '',
  nit: '',
  idTipoProveedor: '',
});

const errores = reactive({
  razonSocial: '',
  nit: '',
  idTipoProveedor: '',
});

const tiposProveedorNormalizados = computed(() =>
  (props.tiposProveedor ?? []).map((tipo) => ({
    id: String(tipo?.idtipoproveedor ?? tipo?.IdTipoProveedor ?? ''),
    nombre: tipo?.nombre ?? tipo?.Nombre ?? '',
  })).filter((tipo) => tipo.id)
);

const esEdicion = computed(() => Boolean(props.persona?.proveedor?.idproveedor ?? props.persona?.proveedor?.IdProveedor));

const nombrePersona = computed(() => {
  if (!props.persona) return '';
  return [
    props.persona.nombre ?? props.persona.Nombre ?? '',
    props.persona.apellidopaterno ?? props.persona.ApellidoPaterno ?? '',
    props.persona.apellidomaterno ?? props.persona.ApellidoMaterno ?? '',
  ].filter(Boolean).join(' ');
});

const emailPersona = computed(() =>
  props.persona?.email
  ?? props.persona?.Email
  ?? ''
);

const cargarFormulario = () => {
  form.razonSocial = props.persona?.proveedor?.razonsocial ?? props.persona?.proveedor?.RazonSocial ?? '';
  const nitActual = props.persona?.proveedor?.nit ?? props.persona?.proveedor?.Nit ?? '';
  form.nit = nitActual == null ? '' : String(nitActual);
  form.idTipoProveedor = String(
    props.persona?.proveedor?.tipoproveedor?.idtipoproveedor
    ?? props.persona?.proveedor?.tipoproveedor?.IdTipoProveedor
    ?? ''
  );

  errores.razonSocial = '';
  errores.nit = '';
  errores.idTipoProveedor = '';
};

const validar = () => {
  errores.razonSocial = '';
  errores.nit = '';
  errores.idTipoProveedor = '';

  if (!form.razonSocial.trim()) {
    errores.razonSocial = 'La razón social es requerida.';
  }

  if (form.nit && !/^\d+$/.test(form.nit)) {
    errores.nit = 'El NIT solo puede contener números.';
  }

  if (!form.idTipoProveedor) {
    errores.idTipoProveedor = 'Debe seleccionar el tipo de proveedor.';
  }

  return !errores.razonSocial && !errores.nit && !errores.idTipoProveedor;
};

const emitirGuardar = () => {
  if (!validar()) return;

  const nitNormalizado = typeof form.nit === 'string'
    ? form.nit.trim()
    : String(form.nit ?? '').trim();

  emit('guardar', {
    IdProveedor: props.persona?.proveedor?.idproveedor ?? props.persona?.proveedor?.IdProveedor ?? null,
    IdPersona: props.persona?.idpersona ?? props.persona?.IdPersona ?? null,
    RazonSocial: form.razonSocial.trim(),
    Nit: nitNormalizado || null,
    IdTipoProveedor: Number(form.idTipoProveedor),
  });
};

watch(() => props.show, (visible) => {
  if (visible) cargarFormulario();
});

watch(() => props.persona, () => {
  cargarFormulario();
});
</script>
