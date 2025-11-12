<template>
  <div class="space-y-8">
    <!-- Form Header -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <div class="flex items-center gap-4">
          <button @click="$emit('cancelar')" class="rounded-2xl hover:bg-orange-50 p-2 transition-colors">
            <ArrowLeft class="h-5 w-5" />
          </button>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <UserPlus class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                {{ esNuevoCliente ? 'Registrar' : 'Actualizar' }} Cliente
              </h1>
              <p class="text-gray-600 mt-1">
                {{ esNuevoCliente ? 'Crea un nuevo cliente en el sistema' : 'Modifica los datos del cliente' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="space-y-8">
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Personal Information -->
        <div class="xl:col-span-2 space-y-6">
          <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
            <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
              <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
                <User class="h-5 w-5 text-orange-600" />
                Información Personal
              </h3>
            </div>
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <User class="h-5 w-5 mr-2 text-orange-500" />
                    Nombre
                  </label>
                  <input
                    v-model="cliente.Nombre"
                    @input="errors.nombre = validateField('nombre', cliente.Nombre)"
                    @blur="errors.nombre = validateField('nombre', cliente.Nombre)"
                    :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nombre }]"
                    placeholder="Ingresa el nombre"
                  />
                  <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <User class="h-5 w-5 mr-2 text-orange-500" />
                    Apellido Paterno
                  </label>
                  <input
                    v-model="cliente.ApellidoPaterno"
                    @input="errors.apellidoPaterno = validateField('apellidoPaterno', cliente.ApellidoPaterno)"
                    @blur="errors.apellidoPaterno = validateField('apellidoPaterno', cliente.ApellidoPaterno)"
                    :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.apellidoPaterno }]"
                    placeholder="Ingresa el apellido paterno"
                  />
                  <p v-if="errors.apellidoPaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoPaterno }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <User class="h-5 w-5 mr-2 text-orange-500" />
                    Apellido Materno
                  </label>
                  <input
                    v-model="cliente.ApellidoMaterno"
                    @input="errors.apellidoMaterno = validateField('apellidoMaterno', cliente.ApellidoMaterno)"
                    @blur="errors.apellidoMaterno = validateField('apellidoMaterno', cliente.ApellidoMaterno)"
                    :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.apellidoMaterno }]"
                    placeholder="Ingresa el apellido materno"
                  />
                  <p v-if="errors.apellidoMaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoMaterno }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <Calendar class="h-5 w-5 mr-2 text-orange-500" />
                    Fecha de Nacimiento
                  </label>
                  <input
                    v-model="cliente.FechaDeNacimiento"
                    type="date"
                    @input="errors.fechaDeNacimiento = validateField('fechaDeNacimiento', cliente.FechaDeNacimiento)"
                    @blur="errors.fechaDeNacimiento = validateField('fechaDeNacimiento', cliente.FechaDeNacimiento)"
                    :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.fechaDeNacimiento }]"
                  />
                  <p v-if="errors.fechaDeNacimiento" class="text-red-500 text-xs italic mt-1">{{ errors.fechaDeNacimiento }}</p>
                </div>

                <div class="md:col-span-2">
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <Accessibility class="h-5 w-5 mr-2 text-orange-500" />
                    Género
                  </label>
                  <div class="flex gap-6">
                    <label class="inline-flex items-center">
                      <input v-model.number="cliente.Genero.IdGenero" type="radio" :value="1" class="text-orange-600" @change="errors.genero = validateField('genero', cliente.Genero.IdGenero)" />
                      <span class="ml-2 text-gray-700">Masculino</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input v-model.number="cliente.Genero.IdGenero" type="radio" :value="2" class="text-orange-600" @change="errors.genero = validateField('genero', cliente.Genero.IdGenero)" />
                      <span class="ml-2 text-gray-700">Femenino</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input v-model.number="cliente.Genero.IdGenero" type="radio" :value="3" class="text-orange-600" @change="errors.genero = validateField('genero', cliente.Genero.IdGenero)" />
                      <span class="ml-2 text-gray-700">Otro</span>
                    </label>
                  </div>
                  <p v-if="errors.genero" class="text-red-500 text-xs italic mt-1">{{ errors.genero }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <Smartphone class="h-5 w-5 mr-2 text-orange-500" />
                    Celulares
                  </label>
                  <div v-for="(telefono, index) in cliente.Celulares" :key="index" class="flex items-center gap-2 mb-2">
                    <input
                      v-model="cliente.Celulares[index].Numero"
                      @input="index === 0 ? errors.celular = validateField('celular', cliente.Celulares[0].Numero) : null"
                      @blur="index === 0 ? errors.celular = validateField('celular', cliente.Celulares[0].Numero) : null"
                      :placeholder="'Celular #' + (index + 1)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.celular && index === 0 }]"
                    />
                    <button
                      type="button"
                      @click="eliminarCelular(index)"
                      class="text-red-600 hover:text-red-800 p-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <X class="h-4 w-4" />
                    </button>
                  </div>
                  <p v-if="errors.celular" class="text-red-500 text-xs italic mt-1">{{ errors.celular }}</p>
                  <button
                    type="button"
                    @click="agregarCelular"
                    :disabled="cliente.Celulares.length >= 4"
                    class="text-sm text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Agregar otro número
                  </button>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <IdCard class="h-5 w-5 mr-2 text-orange-500" />
                    CI
                  </label>
                  <div class="flex">
                    <input
                      v-model="cliente.Documento[0].Documento"
                      type="text"
                      @input="errors.ci = validateField('ci', cliente.Documento[0].Documento)"
                      @blur="errors.ci = validateField('ci', cliente.Documento[0].Documento)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-l-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.ci }]"
                      placeholder="Número de CI"
                    />
                    <select
                      v-model="cliente.Documento[0].Complemento.IdComplemento"
                      class="pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-r-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
                    >
                      <option v-for="comp in complemento" :key="comp.IdComplemento" :value="comp.IdComplemento">
                        {{ comp.Nombre }}
                      </option>
                    </select>
                  </div>
                  <p v-if="errors.ci" class="text-red-500 text-xs italic mt-1">{{ errors.ci }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <IdCard class="h-5 w-5 mr-2 text-orange-500" />
                    NIT
                  </label>
                  <div class="flex">
                    <input
                      v-model="cliente.Documento[1].Documento"
                      type="text"
                      @input="errors.nit = validateField('nit', cliente.Documento[1].Documento)"
                      @blur="errors.nit = validateField('nit', cliente.Documento[1].Documento)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nit }]"
                      placeholder="Número de NIT"
                    />
                  </div>
                  <p v-if="errors.nit" class="text-red-500 text-xs italic mt-1">{{ errors.nit }}</p>
                </div>
                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <Mail class="h-5 w-5 mr-2 text-orange-500" />
                    Email
                  </label>
                  <input
                    v-model="cliente.Email.Email"
                    type="email"
                    @input="errors.email = validateField('email', cliente.Email.Email)"
                    @blur="errors.email = validateField('email', cliente.Email.Email)"
                    :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.email }]"
                    placeholder="ejemplo@gmail.com"
                  />
                  <p v-if="errors.email" class="text-red-500 text-xs italic mt-1">{{ errors.email }}</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Address Information -->
          <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
            <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
              <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
                <MapPin class="h-5 w-5 text-orange-600" />
                Información de Dirección
              </h3>
            </div>
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <Map class="h-5 w-5 mr-2 text-orange-500" />
                    Barrio
                  </label>
                  <Combobox v-model="cliente.Direccion.Barrio"
                    @update:modelValue="errors.barrio = validateField('barrio', cliente.Direccion.Barrio)"
                    @blur="errors.barrio = validateField('barrio', cliente.Direccion.Barrio)"
                  >
                    <div class="relative mt-1">
                      <div :class="['relative w-full cursor-default rounded-lg text-left shadow-md focus:outline-none sm:text-sm', { 'ring-2 ring-red-500/20 bg-red-50': errors.barrio }]" >
                        <ComboboxInput class="w-full pl-12 pr-4 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30" :displayValue="(barrio) => barrio?.Nombre || ''" @change="queryBarrio = $event.target.value" />
                        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
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
                  <p v-if="errors.barrio" class="text-red-500 text-xs italic mt-1">{{ errors.barrio }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <MapPin class="h-5 w-5 mr-2 text-orange-500" />
                    Dirección
                  </label>
                  <input
                    v-model="cliente.Direccion.Direccion"
                    @input="errors.direccion = validateField('direccion', cliente.Direccion.Direccion)"
                    @blur="errors.direccion = validateField('direccion', cliente.Direccion.Direccion)"
                    :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.direccion }]"
                    placeholder="Dirección completa"
                  />
                  <p v-if="errors.direccion" class="text-red-500 text-xs italic mt-1">{{ errors.direccion }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <ClipboardList class="h-5 w-5 mr-2 text-orange-500" />
                    Referencia
                  </label>
                  <input
                    v-model="cliente.Direccion.Referencia"
                    @input="errors.referencia = validateField('referencia', cliente.Direccion.Referencia)"
                    @blur="errors.referencia = validateField('referencia', cliente.Direccion.Referencia)"
                    :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.referencia }]"
                    placeholder="Referencia de la dirección"
                  />
                  <p v-if="errors.referencia" class="text-red-500 text-xs italic mt-1">{{ errors.referencia }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Photo and User Data -->
        <div class="space-y-6">
          <!-- Photo Section -->
          <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
              <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
                <Camera class="h-5 w-5 text-blue-600" />
                Foto del Perfil
              </h3>
            </div>
            <div class="p-6 text-center">
              <div class="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg mx-auto mb-4">
                <img v-if="previewUrl" :src="previewUrl" alt="Vista previa" class="w-full h-full object-cover" />
                <User v-else class="h-16 w-16 text-white" />
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleArchivo"
                class="w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('cancelar')"
          class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2"
        >
          <X class="h-4 w-4" />
          Cancelar
        </button>
        <button
          type="button"
          @click="guardar"
          class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <Save class="h-4 w-4" />
          Guardar Cliente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { ArrowLeft, UserPlus, User, Calendar, Accessibility, Smartphone, IdCard, Mail, MapPin, Map, ClipboardList, Camera, X, Save } from 'lucide-vue-next';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, TransitionRoot } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const props = defineProps({
  clienteEditado: {
    type: Object,
    required: true
  },
  esNuevoCliente: {
    type: Boolean,
    default: true
  },
  complemento: {
    type: Array,
    required: true
  },
  barrios: {
    type: Array,
    required: true
  },
  emailList: Array,
  documentoList: Array,
  numeroList: Array
});

const emit = defineEmits(['guardar-cliente', 'cancelar']);

const cliente = ref(JSON.parse(JSON.stringify(props.clienteEditado)));

const previewUrl = ref(null);
const archivo = ref(null);
const fileInput = ref(null);
const queryBarrio = ref('');

const errors = reactive({
  nombre: '', 
  apellidoPaterno: '', 
  apellidoMaterno: '', 
  fechaDeNacimiento: '', 
  genero: '', 
  celular: '', 
  ci: '', 
  nit: '', 
  email: '', 
  barrio: '', 
  direccion: '', 
  referencia: ''
});

const filteredBarrios = computed(() =>
  queryBarrio.value === ''
    ? props.barrios
    : props.barrios.filter((b) =>
        b.Nombre.toLowerCase().includes(queryBarrio.value.toLowerCase())
      )
);

watch(() => props.clienteEditado, (newVal) => {
  cliente.value = JSON.parse(JSON.stringify(newVal));
  if (cliente.value.Imagen?.Url) {
    previewUrl.value = cliente.value.Imagen.Url;
  } else {
    previewUrl.value = null;
  }
}, { deep: true, immediate: true });

const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const agregarCelular = () => {
  const celulares = cliente.value.Celulares;
  if (celulares.length < 4) {
    if (celulares.length === 0 || celulares[celulares.length - 1].Numero.trim() !== '') {
      celulares.push({ IdCelular: null, Numero: '' });
    }
  }
};

const eliminarCelular = (index) => {
  if (cliente.value.Celulares.length > 1) {
    cliente.value.Celulares.splice(index, 1);
    if (index === 0 && cliente.value.Celulares.length > 0) {
      errors.celular = validateField('celular', cliente.value.Celulares[0].Numero);
    } else if (cliente.value.Celulares.length === 0) {
      errors.celular = validateField('celular', '');
    }
  } else if (cliente.value.Celulares.length === 1) {
    cliente.value.Celulares[0].Numero = '';
    errors.celular = validateField('celular', '');
  }
};

const validateField = (field, value) => {
  let error = '';
  switch (field) {
    case 'nombre':
      if (!value || !value.trim()) error = 'El nombre es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      break;
    case 'apellidoPaterno':
      if (!value || !value.trim()) error = 'El apellido paterno es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'El apellido solo puede contener letras y espacios.';
      break;
    case 'apellidoMaterno':
      if (value && !/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) {
        error = 'El apellido solo puede contener letras y espacios.';
      }
      break;
    case 'genero':
      if (!value || ![1, 2, 3].includes(value)) {
        error = 'El género es requerido.';
      }
      break;
    case 'celular':
      if (!value || !value.trim()) {
        error = 'El número de celular es requerido.';
      } else if (/\[^0-9]/g.test(value)) {
        error = 'Solo debe contener números.';
      } else if (!(value.length >= 7 && value.length <= 8)) {
        error = 'El número de celular debe tener 7 u 8 dígitos.';
      } else {
        const isEditing = cliente.value.IdPersona !== null;
        const existingNumero = props.numeroList.find(
          n => n.Numero === value && (isEditing ? !cliente.value.Celulares.some(c => c.Numero === n.Numero) : true)
        );
        if (existingNumero) {
          error = 'Este número de celular ya está registrado.';
        }
      }
      break;
    case 'ci':
      if (!value || !value.trim()) {
        error = 'El número de documento es requerido.';
      } else if (!/^\d+$/.test(value)) {
        error = 'El CI solo puede contener números.';
      } else {
        const isEditing = cliente.value.IdPersona !== null;
        const currentDocumentId = cliente.value.Documento[0].IdDocumento;

        const existingDocumento = props.documentoList.find(d => {
          if (d.Documento === value) {
            if (isEditing && currentDocumentId && d.IdDocumento === currentDocumentId) {
              return false;
            }
            return true;
          }
          return false;
        });
        if (existingDocumento) {
          error = 'Este número de documento ya está registrado en el sistema.';
        }
      }
      break;
    case 'nit':
      if (value && !/^\d+$/.test(value)) {
        error = 'El NIT solo puede contener números.';
      } else if (value) { 
        const isEditing = cliente.value.IdPersona !== null;
        const currentDocumentId = cliente.value.Documento[1].IdDocumento;

        const existingDocumento = props.documentoList.find(d => {
          if (d.Documento === value) {
            if (isEditing && currentDocumentId && d.IdDocumento === currentDocumentId) {
              return false;
            }
            return true;
          }
          return false;
        });
        if (existingDocumento) {
          error = 'Este número de NIT ya está registrado en el sistema.';
        }
      }
      break;
    case 'email':
      if (!value) {
        error = 'El correo electrónico es requerido.';
      } else {
        if ((value.match(/@/g) || []).length !== 1) {
          error = 'El correo debe contener exactamente un símbolo @';
        } else if (!value.endsWith('@gmail.com')) {
          error = 'El correo debe terminar en @gmail.com';
        } else {
          const localPart = value.split('@')[0];
          if (!/^[a-zA-Z0-9._]+$/.test(localPart)) {
            error = 'El correo solo puede contener letras, números, "." o "_"';
          }
        }
        if (!error) {
          const isEditing = cliente.value.IdPersona !== null;
          const currentEmailId = cliente.value.Email.IdEmail;

          const existingEmail = props.emailList.find(e => {
            if (e.Email.toLowerCase() === value.toLowerCase()) {
              if (isEditing && currentEmailId && e.IdEmail === currentEmailId) {
                return false;
              }
              return true;
            }
            return false;
          });
          if (existingEmail) {
            error = 'Este correo electrónico ya está en uso.';
          }
        }
      }
      break;
    case 'barrio':
      if (!value || !value.IdBarrio) error = 'El barrio es requerido.';
      break;
    case 'direccion':
      if (!value || !value.trim()) error = 'La dirección es requerida.';
      else if (!/^[a-zA-Z0-9\s.,#\-ñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'La dirección contiene caracteres no válidos.';
      break;
    case 'referencia':
      if (value && !/^[a-zA-Z0-9\s.,#\-ñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) {
        error = 'La referencia contiene caracteres no válidos.';
      }
      break;
  }
  return error;
};

const validateForm = () => {
  errors.nombre = validateField('nombre', cliente.value.Nombre);
  errors.apellidoPaterno = validateField('apellidoPaterno', cliente.value.ApellidoPaterno);
  errors.apellidoMaterno = validateField('apellidoMaterno', cliente.value.ApellidoMaterno);
  errors.genero = validateField('genero', cliente.value.Genero.IdGenero);
  errors.celular = validateField('celular', cliente.value.Celulares[0]?.Numero);
  errors.ci = validateField('ci', cliente.value.Documento[0].Documento);
  errors.nit = validateField('nit', cliente.value.Documento[1].Documento);
  errors.email = validateField('email', cliente.value.Email.Email);
  errors.barrio = validateField('barrio', cliente.value.Direccion.Barrio);
  errors.direccion = validateField('direccion', cliente.value.Direccion.Direccion);
  errors.referencia = validateField('referencia', cliente.value.Direccion.Referencia);

  return Object.values(errors).every(error => !error);
};

const guardar = () => {
  if (validateForm()) {
    emit('guardar-cliente', { cliente: cliente.value, archivo: archivo.value });
  }
};

</script>
