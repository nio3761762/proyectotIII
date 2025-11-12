
<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Edit class="h-6 w-6" />
            <h2 class="text-xl font-bold">Editar Información de la Empresa</h2>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-xl hover:bg-white/20 transition-colors"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <form @submit.prevent="$emit('guardar-datos')" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre -->
            <div class="md:col-span-2 space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Building class="h-4 w-4 text-orange-500" />
                Nombre de la Empresa
              </label>
              <input
                :value="datoActual.Nombre"
                @input="$emit('update:datoActual', { ...datoActual, Nombre: $event.target.value })"
                @blur="validateField('nombre', datoActual.Nombre)"
                type="text"
                :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nombre }]"
                required
              />
               <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail class="h-4 w-4 text-orange-500" />
                Email
              </label>
              <input
                :value="datoActual.Email.Email"
                @input="$emit('update:datoActual', { ...datoActual, Email: { ...datoActual.Email, Email: $event.target.value } })"
                @blur="validateField('email', datoActual.Email.Email)"
                type="email"
                :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.email }]"
                required
              />
               <p v-if="errors.email" class="text-red-500 text-xs italic mt-1">{{ errors.email }}</p>
            </div>

            <!-- Celular -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone class="h-4 w-4 text-orange-500" />
                Celular
              </label>
              <input
                :value="datoActual.Celular"
                @input="$emit('update:datoActual', { ...datoActual, Celular: $event.target.value })"
                @blur="validateField('celular', datoActual.Celular)"
                type="tel"
                :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.celular }]"
              />
               <p v-if="errors.celular" class="text-red-500 text-xs italic mt-1">{{ errors.celular }}</p>
            </div>

            <!-- Propietario -->
            <div class="md:col-span-2 space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User class="h-4 w-4 text-orange-500" />
                Propietario
              </label>
              <div class="relative">
                <Combobox :modelValue="datoActual.Persona" @update:modelValue="$emit('update:datoActual', { ...datoActual, Persona: $event }); validateField('propietario', $event)">
                  <div class="relative mt-1">
                    <div :class="['relative w-full cursor-default rounded-lg text-left shadow-md focus:outline-none sm:text-sm', { 'ring-2 ring-red-500/20 bg-red-50': errors.propietario }]" >
                      <ComboboxInput class="w-full pl-12 pr-4 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300
             text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"  :displayValue="(propietario) => propietario ? `${propietario.Nombre} ${propietario.ApellidoPaterno} ${propietario.ApellidoMaterno}`.trim() : ''"
               @change="$emit('update:queryPropietario', $event.target.value)" />
                      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                      </ComboboxButton>
                    </div>
                    <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="$emit('update:queryPropietario', '')">
                      <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        <div v-if="propietariosFiltrados.length === 0 && queryPropietario !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                          No se encontraron resultados.
                        </div>
                        <ComboboxOption v-for="propietario in propietariosFiltrados" :key="propietario.IdPersona" :value="propietario.Persona" v-slot="{ selected, active }">
                          <li :class="[active ? 'bg-orange-500 text-white' : 'text-gray-700', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                            <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ propietario.Persona.Nombre }} {{ propietario.Persona.ApellidoPaterno }} {{ propietario.Persona.ApellidoMaterno }}</span>
                            <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500"><CheckIcon class="h-5 w-5" aria-hidden="true" /></span>
                          </li>
                        </ComboboxOption>
                      </ComboboxOptions>
                    </TransitionRoot>
                  </div>
                </Combobox>
                 <p v-if="errors.propietario" class="text-red-500 text-xs italic mt-1">{{ errors.propietario }}</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          Cancelar
        </button>

        <button
          @click="$emit('guardar-datos')"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  Building, Edit, Phone, Mail, User, X
} from 'lucide-vue-next';
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const props = defineProps({
  show: { type: Boolean, required: true },
  datoActual: { type: Object, required: true },
  errors: { type: Object, required: true },
  propietario: { type: Array, required: true },
  queryPropietario: { type: String, default: '' },
  email: { type: Array, required: true },
  numero: { type: Array, required: true },
});

const emit = defineEmits([
  'close',
  'update:datoActual',
  'update:errors',
  'update:queryPropietario',
  'guardar-datos',
]);

const validateField = (field, value) => {
  let error = '';
  const isEditing = props.datoActual && props.datoActual.IdDatos;

  switch (field) {
    case 'nombre':
      if (!value || !value.trim()) error = 'El nombre es requerido.';
      else if (!/^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚüÜ']*$/.test(value)) error = 'El nombre solo puede contener letras, números y espacios.';
      break;
    case 'email':
      if (!value) {
        error = 'El correo electrónico es requerido.';
      } if ((value.match(/@/g) || []).length !== 1) {
          error = 'El correo debe contener exactamente un símbolo @';
        } else if (!value.endsWith('@gmail.com')) {
          error = 'El correo debe terminar en @gmail.com';
        } else {
            const localPart = value.split('@')[0];
            if (!/^[a-zA-Z0-9._]+$/.test(localPart)) {
                error = 'El correo solo puede contener letras, números, "." o "_"';
            }
        }
       if(!error) {
        const emailId = isEditing ? props.datoActual.Email.IdEmail : null;
        if (props.email.some(e => e.Email.toLowerCase() === value.toLowerCase() && e.IdEmail !== emailId)) {
          error = 'Este correo electrónico ya está en uso.';
        }
      }
      break;
    case 'celular':
      if (!value || !value.trim()) {
        error = 'El número de celular es requerido.';
      } else if (!/^\d+$/.test(value)) {
        error = 'El celular solo puede contener números.';
      } else if (!(value.length >= 7 && value.length <= 8)) {
        error = 'El número de celular debe tener 7 u 8 dígitos.';
      }
      break;
    case 'propietario':
        if (!value || !value.IdPersona) {
            error = 'Debe seleccionar un propietario.';
        }
        break;
  }
  emit('update:errors', { ...props.errors, [field]: error });
  return error;
};

const validateForm = () => {
  validateField('nombre', props.datoActual.Nombre);
  validateField('email', props.datoActual.Email.Email);
  validateField('celular', props.datoActual.Celular);
  validateField('propietario', props.datoActual.Persona);

  return Object.values(props.errors).every(error => !error);
};

const propietariosFiltrados = computed(() => {
  const query = props.queryPropietario.toLowerCase().trim();
  return query === ''
    ? props.propietario
    : props.propietario.filter((b) => {
        const nombreCompleto = `${b.Persona.Nombre} ${b.Persona.ApellidoPaterno} ${b.Persona.ApellidoMaterno}`.toLowerCase();
        return nombreCompleto.includes(query);
      });
});

defineExpose({ validateForm });
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
