<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="$emit('cancelar')"
    >
      <div
        class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative flex-shrink-0">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <Package class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ esNuevo ? 'Nueva' : 'Editar' }} Presentación</h2>
              <p class="text-orange-100 text-sm font-medium">
                {{ esNuevo ? 'Registrar una nueva presentación' : 'Actualizar datos de la presentación' }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('cancelar')" 
            class="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-grow p-8 space-y-6">
          <div class="space-y-2">
            <label class="flex items-center text-gray-700 font-bold mb-1 ml-1">
              <Type class="h-5 w-5 mr-2 text-orange-500" /> Nombre
            </label>
            <div class="relative group">
              <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              <input
                v-model="form.Nombre"
                @input="errors.Nombre = validateField('Nombre', form.Nombre)"
                @blur="errors.Nombre = validateField('Nombre', form.Nombre)"
                :class="inputClass('Nombre')"
                placeholder="Ej: Bolsa, Caja, Botella..."
                ref="nombreInput"
              />
            </div>
            <Transition name="slide-down">
              <p v-if="errors.Nombre" class="text-red-500 text-xs italic mt-1 ml-2 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" /> {{ errors.Nombre }}
              </p>
            </Transition>
          </div>

          <div class="space-y-2">
            <label class="flex items-center text-gray-700 font-bold mb-1 ml-1">
              <Type class="h-5 w-5 mr-2 text-orange-500" /> Abreviatura
            </label>
            <div class="relative group">
              <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              <input
                v-model="form.Abreviatura"
                @input="errors.Abreviatura = validateField('Abreviatura', form.Abreviatura)"
                @blur="errors.Abreviatura = validateField('Abreviatura', form.Abreviatura)"
                :class="inputClass('Abreviatura')"
                placeholder="Ej: bls, cj, bot..."
              />
            </div>
            <Transition name="slide-down">
              <p v-if="errors.Abreviatura" class="text-red-500 text-xs italic mt-1 ml-2 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" /> {{ errors.Abreviatura }}
              </p>
            </Transition>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-gray-50/80 border-t border-gray-100 flex gap-4 flex-shrink-0">
          <button
            type="button"
            @click="$emit('cancelar')"
            class="flex-1 px-6 py-3 border border-gray-200 hover:bg-gray-100 rounded-2xl bg-white transition-all text-gray-600 font-semibold flex items-center justify-center gap-2"
          >
            <X class="h-4 w-4" />
            Cancelar
          </button>
          <button
            @click="guardar"
            :disabled="guardando"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed font-bold"
          >
            <LoaderCircle v-if="guardando" class="animate-spin h-5 w-5" />
            <Save v-else class="h-5 w-5" />
            {{ guardando ? 'Guardando...' : (esNuevo ? 'Registrar' : 'Actualizar') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { Package, X, Type, Save, LoaderCircle, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  presentacion: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
  presentacionesExistentes: { type: Array, default: () => [] },
});

const emit = defineEmits(['cancelar', 'guardar']);

const nombreInput = ref(null);
const esNuevo = computed(() => !props.presentacion?.IdPresentacion && !props.presentacion?.idpresentacion);

const formVacio = () => ({
  IdPresentacion: null,
  Nombre: '',
  Abreviatura: '',
});

const form = reactive(formVacio());
const errors = reactive({
  Nombre: '',
  Abreviatura: '',
});

const inicializar = () => {
  const p = props.presentacion;
  Object.assign(form, formVacio());
  if (p) {
    form.IdPresentacion = p.IdPresentacion || p.idpresentacion || null;
    form.Nombre = p.Nombre || p.nombre || '';
    form.Abreviatura = p.Abreviatura || p.abreviatura || '';
  }
  errors.Nombre = '';
  errors.Abreviatura = '';
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    inicializar();
    nextTick(() => {
      if (nombreInput.value) nombreInput.value.focus();
    });
  }
});

const inputBase = 'w-full px-5 py-4 border-0 shadow-sm bg-white rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-500/20 ring-1 ring-gray-200';

const inputClass = (campo) =>
  campo && errors[campo]
    ? `${inputBase} ring-2 ring-red-500/50 bg-red-50/30`
    : inputBase;

const validateField = (field, value) => {
  let error = '';
  switch (field) {
    case 'Nombre':
      if (!value?.trim()) error = 'El nombre es requerido.';
      else if (value.length > 50) error = 'El nombre no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]+$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      else {
        const lowerCaseValue = value.trim().toLowerCase();
        const isDuplicate = props.presentacionesExistentes.some(pres => {
          const presId = pres.IdPresentacion || pres.idpresentacion;
          const currentId = form.IdPresentacion;
          if (presId === currentId) return false;
          return (pres.Nombre || pres.nombre).toLowerCase() === lowerCaseValue;
        });
        if (isDuplicate) error = 'Ya existe una presentación con este nombre.';
      }
      break;
    case 'Abreviatura':
      if (!value?.trim()) error = 'La abreviatura es requerida.';
      else if (value.length > 10) error = 'La abreviatura no puede tener más de 10 caracteres.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ.]+$/.test(value)) error = 'La abreviatura solo puede contener letras, espacios y puntos.';
      break;
  }
  return error;
};

const validateForm = () => {
  errors.Nombre = validateField('Nombre', form.Nombre);
  errors.Abreviatura = validateField('Abreviatura', form.Abreviatura);
  return !errors.Nombre && !errors.Abreviatura;
};

const guardar = () => {
  if (!validateForm()) return;
  emit('guardar', { ...form });
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
