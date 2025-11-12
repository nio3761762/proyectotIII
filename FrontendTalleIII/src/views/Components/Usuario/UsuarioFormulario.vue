<template>
  <div class="space-y-8">
    <!-- Form Header -->
    <div class="relative overflow-hidden animate-fade-in-up">
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
                {{ esNuevoUsuario ? 'Registrar' : 'Actualizar' }} Usuario
              </h1>
              <p class="text-gray-600 mt-1">
                {{ esNuevoUsuario ? 'Crea un nuevo usuario en el sistema' : 'Modifica los datos del usuario' }}
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
        <div class="xl:col-span-2 space-y-6 animate-fade-in-up delay-100">
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
                    v-model="usuarioEditado.Persona.Nombre"
                    @input="errors.nombre = validateField('nombre', usuarioEditado.Persona.Nombre)"
                    @blur="errors.nombre = validateField('nombre', usuarioEditado.Persona.Nombre)"
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
                    v-model="usuarioEditado.Persona.ApellidoPaterno"
                    @input="errors.apellidoPaterno = validateField('apellidoPaterno', usuarioEditado.Persona.ApellidoPaterno)"
                    @blur="errors.apellidoPaterno = validateField('apellidoPaterno', usuarioEditado.Persona.ApellidoPaterno)"
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
                    v-model="usuarioEditado.Persona.ApellidoMaterno"
                    @input="errors.apellidoMaterno = validateField('apellidoMaterno', usuarioEditado.Persona.ApellidoMaterno)"
                    @blur="errors.apellidoMaterno = validateField('apellidoMaterno', usuarioEditado.Persona.ApellidoMaterno)"
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
                    v-model="usuarioEditado.Persona.FechaDeNacimiento"
                    type="date"
                    class="w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><Accessibility class="h-5 w-5 mr-2 text-orange-500" />Género</label>
                  <div class="flex gap-6">
                    <label class="inline-flex items-center">
                      <input v-model.number="usuarioEditado.Persona.Genero.IdGenero" type="radio" :value="1" class="text-orange-600" @change="errors.genero = validateField('genero', usuarioEditado.Persona.Genero.IdGenero)" />
                      <span class="ml-2 text-gray-700">Masculino</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input v-model.number="usuarioEditado.Persona.Genero.IdGenero" type="radio" :value="2" class="text-orange-600" @change="errors.genero = validateField('genero', usuarioEditado.Persona.Genero.IdGenero)" />
                      <span class="ml-2 text-gray-700">Femenino</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input v-model.number="usuarioEditado.Persona.Genero.IdGenero" type="radio" :value="3" class="text-orange-600" @change="errors.genero = validateField('genero', usuarioEditado.Persona.Genero.IdGenero)" />
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
                  <div v-for="(telefono, index) in usuarioEditado.Persona.Celulares" :key="index" class="flex items-center gap-2 mb-2">
                    <input
                      v-model="usuarioEditado.Persona.Celulares[index].Numero"
                      @input="index === 0 ? errors.celular = validateField('celular', usuarioEditado.Persona.Celulares[0].Numero) : null"
                      @blur="index === 0 ? errors.celular = validateField('celular', usuarioEditado.Persona.Celulares[0].Numero) : null"
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
                    @click="agregarCelular()"
                    :disabled="usuarioEditado.Persona.Celulares.length >= 4"
                    class="text-sm text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Agregar otro número
                  </button>
                </div>

                <div v-for="usuario in usuarioEditado.Persona.Documento">
                 <div 
                 v-if="usuario.Complemento"
                 > 
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <IdCard class="h-5 w-5 mr-2 text-orange-500" />
                    CI
                  </label>
                  <div class="flex">
                    <input
                      v-model="usuario.Documento"
                      type="text"
                      @input="errors.documento = validateField('documento', usuario.Documento)"
                      @blur="errors.documento = validateField('documento', usuario.Documento)"
                      :class="['w-full pl-12 pr-4 py-4  px-4 border-0 shadow-md  bg-gray-50/80 rounded-l-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.documento }]"
                      placeholder="Número de CI"
                    />
                    <select
                      v-model="usuario.Complemento.IdComplemento"
                      class=" pl-12 pr-4 py-4 px-4  border-l-0 shadow-md  bg-gray-50/80 rounded-r-2xl transition-all duration-300
                    text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
                    >
                      <option v-for="comp in complemento" :key="comp.IdComplemento" :value="comp.IdComplemento">
                        {{ comp.Nombre }}
                      </option>
                    </select>

                  </div>
                  <p v-if="errors.documento" class="text-red-500 text-xs italic mt-1">{{ errors.documento }}</p>
                </div>
                </div>
                 
                 <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <Map class="h-5 w-5 mr-2 text-orange-500" />
                  Barrio
                </label>
                <Combobox v-model="usuarioEditado.Persona.Direccion.Barrio">
                  <div class="relative mt-1">
                    <div class="relative w-full cursor-default rounded-lg text-left shadow-md focus:outline-none sm:text-sm">
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
              </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <MapPin class="h-5 w-5 mr-2 text-orange-500" />
                    Dirección
                  </label>
                  <input
                    v-model="usuarioEditado.Persona.Direccion.Direccion"
                    @input="errors.direccion = validateField('direccion', usuarioEditado.Persona.Direccion.Direccion)"
                    @blur="errors.direccion = validateField('direccion', usuarioEditado.Persona.Direccion.Direccion)"
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
                    v-model="usuarioEditado.Persona.Direccion.Referencia"
                    @input="errors.referencia = validateField('referencia', usuarioEditado.Persona.Direccion.Referencia)"
                    @blur="errors.referencia = validateField('referencia', usuarioEditado.Persona.Direccion.Referencia)"
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
          <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden animate-fade-in-up delay-200">
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
                class="w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300
             text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <!-- User Credentials -->
          <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden animate-fade-in-up delay-300">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6">
              <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
                <Lock class="h-5 w-5 text-green-600" />
                Credenciales de Usuario
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <Mail class="h-5 w-5 mr-2 text-green-500" />
                  Email
                </label>
                <input
                  v-model="usuarioEditado.Persona.Email.Email"
                  type="email"
                  @input="errors.email = validateField('email', usuarioEditado.Persona.Email.Email)"
                  @blur="errors.email = validateField('email', usuarioEditado.Persona.Email.Email)"
                  :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.email }]"
                  placeholder="ejemplo@gmail.com"
                />
                <p v-if="errors.email" class="text-red-500 text-xs italic mt-1">{{ errors.email }}</p>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <Lock class="h-5 w-5 mr-2 text-green-500" />
                  Contraseña
                </label>
                <input
                  v-model="usuarioEditado.Contrasena"
                  type="password"
                  @input="errors.password = validateField('password', usuarioEditado.Contrasena)"
                  @blur="errors.password = validateField('password', usuarioEditado.Contrasena)"
                  :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.password }]"
                  placeholder="Ingrese una contraseña"
                />
                <p v-if="errors.password" class="text-red-500 text-xs italic mt-1">{{ errors.password }}</p>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <Lock class="h-5 w-5 mr-2 text-green-500" />
                  Repetir Contraseña
                </label>
                <input
                  v-model="usuarioEditado.confirmContrasena"
                  type="password"
                  @input="errors.confirmPassword = validateField('confirmPassword', usuarioEditado.confirmContrasena)"
                  @blur="errors.confirmPassword = validateField('confirmPassword', usuarioEditado.confirmContrasena)"
                  :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.confirmPassword }]"
                  placeholder="Repita la contraseña"
                />
                <p v-if="errors.confirmPassword" class="text-red-500 text-xs italic mt-1">{{ errors.confirmPassword }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 animate-fade-in-up delay-400">
        <button
          type="button"
          @click="$emit('cancelar')"
          class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2"
        >
          <X class="h-4 w-4" />
          Cancelar
        </button>
        <button
          @click="guardarUsuario"
          class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <Save class="h-4 w-4" />
          Guardar Usuario
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import {
  User, ArrowLeft, UserPlus, Camera, Lock, Save, X,
  IdCard, Mail, Calendar, MapPin, ClipboardList, Map,
  Smartphone, Accessibility
} from 'lucide-vue-next';
import {
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions,
  ComboboxOption, TransitionRoot
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import { listarBarrios } from '@/Server/api';
import { RegistrarUsuario, updateUsuario } from '@/Server/Usuario';
import { listarComplemento, listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';
import { SubirFoto } from '@/Server/Foto';

const getCleanUserObject = () => ({
  IdUsuario: null,
  Persona: {
    IdPersona: null,
    Nombre: "",
    ApellidoPaterno: "",
    ApellidoMaterno: "",
    FechaDeNacimiento: "",
    Genero: { IdGenero: 1 },
    Celulares: [{ IdCelular: null, Numero: '' }],
    Direccion: {
      IdDireccion: '',
      Direccion: '',
      Referencia: '',
      Barrio: { IdBarrio: '', Nombre: '' }
    },
    Email: { IdEmail: null, Email: "" },
    Imagen: { IdImagen: null, Url: '' },
    Documento: [{
      IdDocumento: null,
      Documento: '',
      Complemento: { IdComplemento: "C-1", Nombre: '' },
      Tipodocumento: { IdTipoDocumento: 2, Nombre: 'CI' }
    }],
  },
  Contrasena: "",
  confirmContrasena: ""
});

// --- Props & Emits ---
const props = defineProps({
  usuario: {
    type: Object,
    default: null
  },
  emails: {
    type: Array,
    required: true
  },
  documentos: {
    type: Array,
    required: true
  },
  numeros: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['cancelar', 'guardar']);

// --- State ---
const usuarioEditado = ref(getCleanUserObject());
const esNuevoUsuario = ref(true);
const previewUrl = ref('');
const fileInput = ref(null);
const archivo = ref(null);
const complemento = ref([]);
const barrios = ref([]);
const queryBarrio = ref('');

const errors = reactive({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  documento: '',
  password: '',
  confirmPassword: '',
  celular: '',
  barrio: '',
  genero: '',
  direccion: '',
  referencia: ''
});

// --- Computed ---
const filteredBarrios = computed(() =>
  queryBarrio.value === ''
    ? barrios.value
    : barrios.value.filter((b) =>
        b.Nombre.toLowerCase().includes(queryBarrio.value.toLowerCase())
      )
);

// --- Methods ---
const initializeForm = () => {
  esNuevoUsuario.value = !props.usuario;
  if (props.usuario) {
    usuarioEditado.value = JSON.parse(JSON.stringify(props.usuario));
    usuarioEditado.value.Contrasena = "";
    usuarioEditado.value.confirmContrasena = "";
    previewUrl.value = props.usuario.Persona?.Imagen?.Url || null;
  } else {
    usuarioEditado.value = getCleanUserObject();
    previewUrl.value = null;
  }
  archivo.value = null;
};

const validateField = (field, value) => {
  let error = '';
  const isEditing = !esNuevoUsuario.value;

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
          const emailId = isEditing ? usuarioEditado.value.Persona.Email.IdEmail : null;
          if (props.emails.some(e => e.Email.toLowerCase() === value.toLowerCase() && e.IdEmail !== emailId)) {
            error = 'Este correo electrónico ya está en uso.';
          }
        }
      }
      break;
    case 'documento':
        const doc = usuarioEditado.value.Persona.Documento[0];
        if (!value || !value.trim()) {
            error = 'El número de documento es requerido.';
        } else if (!/^\d+$/.test(value)) {
            error = 'El CI solo puede contener números.';
        } else {
            const docId = isEditing ? doc.IdDocumento : null;
            if (props.documentos.some(d => d.Documento === value && d.IdDocumento !== docId)) {
                error = 'Este número de documento ya está registrado en el sistema.';
            }
        }
      break;
    case 'password':
      if (!isEditing || value) {
        if (!value) {
          error = 'La contraseña es requerida.';
        } else if (value.length < 6) {
          error = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value) || !/[@$!%*#?&]/.test(value)) {
          error = 'Debe contener mayúscula, minúscula, número y caracter especial.';
        }
      }
      break;
    case 'confirmPassword':
      if (usuarioEditado.value.Contrasena && value !== usuarioEditado.value.Contrasena) {
        error = 'Las contraseñas no coinciden.';
      }
      break;
    case 'celular':
        if (!value || !value.trim()) {
            error = 'El número de celular es requerido.';
        } else if (/\D/.test(value)) {
            error = 'Solo debe contener números.';
        } else if (!(value.length >= 7 && value.length <= 8)) {
            error = 'El número de celular debe tener 7 u 8 dígitos.';
        } else {
            const celularId = isEditing ? usuarioEditado.value.Persona.Celulares[0]?.IdCelular : null;
            if (props.numeros.some(n => n.Numero === value && n.IdCelular !== celularId)) {
                error = 'Este número de celular ya está registrado.';
            }
        }
        break;
    case 'genero':
        if (!value || ![1, 2, 3].includes(value)) {
            error = 'El género es requerido.';
        }
        break;
    case 'direccion':
        if (value && !/^[a-zA-Z0-9\s.,#\-ñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) {
            error = 'La dirección contiene caracteres no válidos.';
        }
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
  errors.nombre = validateField('nombre', usuarioEditado.value.Persona.Nombre);
  errors.apellidoPaterno = validateField('apellidoPaterno', usuarioEditado.value.Persona.ApellidoPaterno);
  errors.apellidoMaterno = validateField('apellidoMaterno', usuarioEditado.value.Persona.ApellidoMaterno);
  errors.email = validateField('email', usuarioEditado.value.Persona.Email.Email);
  errors.documento = validateField('documento', usuarioEditado.value.Persona.Documento[0].Documento);
  errors.password = validateField('password', usuarioEditado.value.Contrasena);
  errors.confirmPassword = validateField('confirmPassword', usuarioEditado.value.confirmContrasena);
  errors.celular = validateField('celular', usuarioEditado.value.Persona.Celulares[0]?.Numero);
  errors.barrio = validateField('barrio', usuarioEditado.value.Persona.Direccion.Barrio);
  errors.genero = validateField('genero', usuarioEditado.value.Persona.Genero.IdGenero);
  errors.direccion = validateField('direccion', usuarioEditado.value.Persona.Direccion.Direccion);
  errors.referencia = validateField('referencia', usuarioEditado.value.Persona.Direccion.Referencia);

  return Object.values(errors).every(error => !error);
};

const guardarUsuario = async () => {
  if (!validateForm()) {
    return;
  }
  try {
    await handlePhotoUpload();

    const dato = {
      IdUsuario: usuarioEditado.value.IdUsuario,
      IdPersona: usuarioEditado.value.Persona.IdPersona,
      Nombre: usuarioEditado.value.Persona.Nombre,
      ApellidoPaterno: usuarioEditado.value.Persona.ApellidoPaterno,
      ApellidoMaterno: usuarioEditado.value.Persona.ApellidoMaterno,
      FechaDeNacimiento: usuarioEditado.value.Persona.FechaDeNacimiento,
      IdGenero: usuarioEditado.value.Persona.Genero.IdGenero,
      Email: usuarioEditado.value.Persona.Email.Email,
      IdEmail: usuarioEditado.value.Persona.Email.IdEmail,
      Url: usuarioEditado.value.Persona?.Imagen?.Url,
      IdDireccion: usuarioEditado.value.Persona.Direccion.IdDireccion,
      IdBarrio: usuarioEditado.value.Persona.Direccion.Barrio.IdBarrio,
      Direccion: usuarioEditado.value.Persona.Direccion.Direccion,
      Referencia: usuarioEditado.value.Persona.Direccion.Referencia,
      Contrasena: usuarioEditado.value.Contrasena,
      Celulares: usuarioEditado.value.Persona.Celulares,
      Documento: usuarioEditado.value.Persona.Documento?.map(sub => ({
        IdDocumento: sub.IdDocumento,
        Documento: sub.Documento,
        IdTipodocumento: sub.Tipodocumento.IdTipoDocumento,
        Complemento: sub.Complemento?.IdComplemento
      })),
    };
    
    if (esNuevoUsuario.value) {
      dato.IdImagen = usuarioEditado.value.Persona?.Imagen?.IdImagen;
    }

    emit('guardar', dato);

  } catch (error) {
    console.error('Error al guardar el usuario:', error);
  }
};

const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const handlePhotoUpload = async () => {
  if (!archivo.value || (esNuevoUsuario.value && typeof archivo.value === 'string')) {
    return;
  }
  try {
    const imageUrl = await SubirFoto(archivo.value);
    if (!usuarioEditado.value.Persona.Imagen) {
      usuarioEditado.value.Persona.Imagen = {};
    }
    usuarioEditado.value.Persona.Imagen.Url = imageUrl;
  } catch (error) {
    console.error('No se pudo subir la imagen.', error);
  }
};

const agregarCelular = () => {
  const celulares = usuarioEditado.value.Persona.Celulares;
  if (celulares.length < 4) {
    if (celulares.length === 0 || celulares[celulares.length - 1].Numero.trim() !== '') {
      celulares.push({ IdCelular: null, Numero: '' });
    }
  }
};

const eliminarCelular = (index) => {
  if (usuarioEditado.value.Persona.Celulares.length > 1) {
    usuarioEditado.value.Persona.Celulares.splice(index, 1);
  }
};

const cargarBarrios = async () => {
  try {
    barrios.value = await listarBarrios();
  } catch (error) {
    console.error('No se pudieron cargar los barrios.', error);
  }
};

const ListarComplemento = async () => {
  try {
    complemento.value = await listarComplemento();
  } catch (error) {
    console.error('Error al cargar complementos:', error);
  }
};

// --- Lifecycle & Watchers ---
onMounted(async () => {
  await cargarBarrios();
  await ListarComplemento();
  initializeForm();
});

watch(() => props.usuario, () => {
  initializeForm();
}, { deep: true });

</script>
