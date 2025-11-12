<template>
  <div 
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="cerrar"
  >
    <div class="bg-white/95 backdrop-blur-sm border-white/50 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Editar Perfil</h2>
          <button @click="cerrar" class="text-white hover:text-gray-200 transition-colors"><X class="h-6 w-6" /></button>
        </div>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <form @submit.prevent="guardar" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User class="h-4 w-4 text-orange-500" />
                Nombre
              </label>
              <input
                :value="perfilData.nombre"
                @input="$emit('update:perfil-data', { ...perfilData, nombre: $event.target.value }); $emit('validate-field', 'nombre', $event.target.value)"
                @blur="$emit('validate-field', 'nombre', $event.target.value)"
                type="text"
                :class="['w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700', { 'ring-2 ring-red-500/20 bg-red-50': errors.nombre }]"
                required
              />
              <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
            </div>

            <!-- Apellido Paterno -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User class="h-4 w-4 text-orange-500" />
                Apellido Paterno
              </label>
              <input
                :value="perfilData.apellidoPaterno"
                @input="$emit('update:perfil-data', { ...perfilData, apellidoPaterno: $event.target.value }); $emit('validate-field', 'apellidoPaterno', $event.target.value)"
                @blur="$emit('validate-field', 'apellidoPaterno', $event.target.value)"
                type="text"
                :class="['w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700', { 'ring-2 ring-red-500/20 bg-red-50': errors.apellidoPaterno }]"
                required
              />
              <p v-if="errors.apellidoPaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoPaterno }}</p>
            </div>

            <!-- Apellido Materno -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User class="h-4 w-4 text-orange-500" />
                Apellido Materno
              </label>
              <input
                :value="perfilData.apellidoMaterno"
                @input="$emit('update:perfil-data', { ...perfilData, apellidoMaterno: $event.target.value })"
                type="text"
                class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700"
              />
            </div>

            <!-- Teléfono -->
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone class="h-4 w-4 text-orange-500" />
                Teléfonos
              </label>
              <div v-for="(telefono, index) in perfilData.celulares" :key="index" class="flex items-center gap-2 mb-2">
                <input
                  :value="telefono.Numero"
                  @input="handleCelularInput(index, $event.target.value)"
                  type="tel"
                  :placeholder="'Teléfono #' + (index + 1)"
                  class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700"
                />
              
              </div>
             
            </div>

            <!-- Documento CI -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <IdCard class="h-4 w-4 text-orange-500" />
                CI
              </label>
              <div class="flex">
                <input
                  :value="perfilData.documento[0].Documento"
                  @input="handleDocumentoInput('Documento', $event.target.value)"
                  type="text"
                  placeholder="Número de CI"
                  class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-l-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700"
                />
                <select
                  :value="perfilData.documento[0].Complemento.IdComplemento"
                  @change="handleDocumentoInput('IdComplemento', $event.target.value)"
                  class="px-4 py-3 bg-white/60 backdrop-blur-sm border border-l-0 border-orange-200 rounded-r-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700"
                >
                  <option v-for="comp in complemento" :key="comp.IdComplemento" :value="comp.IdComplemento">
                    {{ comp.Nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Fecha de Nacimiento -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar class="h-4 w-4 text-orange-500" />
                Fecha de Nacimiento
              </label>
              <input
                :value="perfilData.fechaDeNacimiento"
                @input="$emit('update:perfil-data', { ...perfilData, fechaDeNacimiento: $event.target.value })"
                type="date"
                class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700"
              />
            </div>

            <!-- Barrio -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Map class="h-4 w-4 text-orange-500" />
                Barrio
              </label>
              <Combobox 
                :modelValue="perfilData.barrio"
                @update:modelValue="$emit('update:perfil-data', { ...perfilData, barrio: $event })"
              >
                <div class="relative mt-1">
                  <div class="relative w-full cursor-default rounded-lg text-left shadow-md focus:outline-none sm:text-sm">
                    <ComboboxInput class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700" :displayValue="(barrio) => barrio?.Nombre || ''" @change="queryBarrio = $event.target.value" />
                    <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon class="h-5 w-5 text-cyan-500" aria-hidden="true" />
                    </ComboboxButton>
                  </div>
                  <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryBarrio = ''">
                    <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                      <div v-if="filteredBarrios.length === 0 && queryBarrio !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                        No se encontraron resultados.
                      </div>
                      <ComboboxOption v-for="barrio in filteredBarrios" :key="barrio.IdBarrio" :value="barrio" v-slot="{ selected, active }">
                                                    <li :class="[active ? 'bg-orange-500 text-white' : 'text-gray-700', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                          <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ barrio.Nombre }}</span>
                          <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500"><CheckIcon class="h-5 w-5" aria-hidden="true" /></span>
                        </li>
                      </ComboboxOption>
                    </ComboboxOptions>
                  </TransitionRoot>
                </div>
              </Combobox>
            </div>

            <!-- Email -->
            <div class="md:col-span-2 space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail class="h-4 w-4 text-orange-500" />
                Email
              </label>
              <input
                :value="perfilData.email"
                @input="$emit('update:perfil-data', { ...perfilData, email: $event.target.value }); $emit('validate-field', 'email', $event.target.value)"
                @blur="$emit('validate-field', 'email', $event.target.value)"
                type="email"
                :class="['w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700', { 'ring-2 ring-red-500/20 bg-red-50': errors.email }]"
                required
              />
              <p v-if="errors.email" class="text-red-500 text-xs italic mt-1">{{ errors.email }}</p>
            </div>

            <!-- Dirección -->
            <div class="md:col-span-2 space-y-2">
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin class="h-4 w-4 text-orange-500" />
                Dirección
              </label>
              <input
                :value="perfilData.direccion"
                @input="$emit('update:perfil-data', { ...perfilData, direccion: $event.target.value })"
                type="text"
                class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700"
              />
            </div>
          </div>
        </form>
      </div>

      <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex justify-end gap-4">
        <button
          @click="cerrar"
          class="px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border-2 border-gray-300 bg-transparent hover:bg-gray-100 text-gray-600"
        >
          Cancelar
        </button>
        
        <button
          @click="guardar"
          class="px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import {
  User, Phone, Mail, MapPin, Calendar, IdCard, X, Map
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
  show: Boolean,
  perfilData: Object,
  barrios: Array,
  complemento: Array,
  errors: Object,
});

const emits = defineEmits(['cerrar', 'guardar', 'update:perfil-data', 'validate-field']);

const queryBarrio = ref('');

const filteredBarrios = computed(() =>
  queryBarrio.value === ''
    ? props.barrios
    : props.barrios.filter((b) =>
        b.Nombre.toLowerCase().includes(queryBarrio.value.toLowerCase())
      )
);

const cerrar = () => {
  emits('cerrar');
};

const guardar = () => {
  emits('guardar');
};

const handleCelularInput = (index, value) => {
  const newCelulares = [...props.perfilData.celulares];
  newCelulares[index] = { ...newCelulares[index], Numero: value };
  emits('update:perfil-data', { ...props.perfilData, celulares: newCelulares });
};

const handleDocumentoInput = (key, value) => {
  const newDocumento = [...props.perfilData.documento];
  if (key === 'IdComplemento') {
    newDocumento[0] = { ...newDocumento[0], Complemento: { IdComplemento: value } };
  } else {
    newDocumento[0] = { ...newDocumento[0], [key]: value };
  }
  emits('update:perfil-data', { ...props.perfilData, documento: newDocumento });
};
</script>
