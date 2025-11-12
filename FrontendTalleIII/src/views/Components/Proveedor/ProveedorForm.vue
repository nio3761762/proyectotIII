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
                {{ esNuevoProveedor ? 'Registrar' : 'Actualizar' }} Proveedor
              </h1>
              <p class="text-gray-600 mt-1">
                {{ esNuevoProveedor ? 'Crea un nuevo proveedor en el sistema' : 'Modifica los datos del proveedor' }}
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
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><User class="h-5 w-5 mr-2 text-orange-500" />Nombre (*)</label>
                  <input v-model="proveedor.Persona.Nombre" @input="validate('nombre')" @blur="validate('nombre')" :class="inputClass(errors.nombre)" placeholder="Ingresa el nombre" />
                  <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><User class="h-5 w-5 mr-2 text-orange-500" />Apellido Paterno (*)</label>
                  <input v-model="proveedor.Persona.ApellidoPaterno" @input="validate('apellidoPaterno')" @blur="validate('apellidoPaterno')" :class="inputClass(errors.apellidoPaterno)" placeholder="Ingresa el apellido paterno" />
                  <p v-if="errors.apellidoPaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoPaterno }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><User class="h-5 w-5 mr-2 text-orange-500" />Apellido Materno</label>
                  <input v-model="proveedor.Persona.ApellidoMaterno" @input="validate('apellidoMaterno')" @blur="validate('apellidoMaterno')" :class="inputClass(errors.apellidoMaterno)" placeholder="Ingresa el apellido materno" />
                  <p v-if="errors.apellidoMaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoMaterno }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><Calendar class="h-5 w-5 mr-2 text-orange-500" />Fecha de Nacimiento</label>
                  <input v-model="proveedor.Persona.FechaDeNacimiento" type="date" :class="inputClass()" />
                </div>

                <div class="md:col-span-2">
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><Accessibility class="h-5 w-5 mr-2 text-orange-500" />Género (*)</label>
                  <div class="flex gap-6">
                    <label v-for="gen in generos" :key="gen.id" class="inline-flex items-center">
                      <input v-model.number="proveedor.Persona.Genero.IdGenero" type="radio" :value="gen.id" class="text-orange-600" @change="validate('genero')" />
                      <span class="ml-2 text-gray-700">{{ gen.nombre }}</span>
                    </label>
                  </div>
                  <p v-if="errors.genero" class="text-red-500 text-xs italic mt-1">{{ errors.genero }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><Smartphone class="h-5 w-5 mr-2 text-orange-500" />Celulares (*)</label>
                  <div v-for="(telefono, index) in proveedor.Persona.Celulares" :key="index" class="flex items-center gap-2 mb-2">
                    <input v-model="proveedor.Persona.Celulares[index].Numero" @input="validate('celular')" @blur="validate('celular')" :placeholder="'Celular #' + (index + 1)" :class="inputClass(errors.celular && index === 0)" />
                    <button type="button" @click="eliminarCelular(index)" class="text-red-600 hover:text-red-800 p-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"><X class="h-4 w-4" /></button>
                  </div>
                  <p v-if="errors.celular" class="text-red-500 text-xs italic mt-1">{{ errors.celular }}</p>
                  <button type="button" @click="agregarCelular" :disabled="proveedor.Persona.Celulares.length >= 4" class="text-sm text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">+ Agregar otro número</button>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><IdCard class="h-5 w-5 mr-2 text-orange-500" />NIT (*)</label>
                  <input v-model="proveedor.Persona.Documento[0].Documento" type="text" @input="validate('documento')" @blur="validate('documento')" :class="inputClass(errors.documento)" placeholder="Número de NIT" />
                  <p v-if="errors.documento" class="text-red-500 text-xs italic mt-1">{{ errors.documento }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><Mail class="h-5 w-5 mr-2 text-orange-500" />Email (*)</label>
                  <input v-model="proveedor.Persona.Email.Email" type="email" @input="validate('email')" @blur="validate('email')" :class="inputClass(errors.email)" placeholder="ejemplo@correo.com" />
                  <p v-if="errors.email" class="text-red-500 text-xs italic mt-1">{{ errors.email }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><User class="h-5 w-5 mr-2 text-orange-500" />Razón Social (*)</label>
                  <input v-model="proveedor.RazonSocial" @input="validate('razonSocial')" @blur="validate('razonSocial')" :class="inputClass(errors.razonSocial)" placeholder="Ingresa la razón social" />
                  <p v-if="errors.razonSocial" class="text-red-500 text-xs italic mt-1">{{ errors.razonSocial }}</p>
                </div>

                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2"><User class="h-5 w-5 mr-2 text-orange-500" />Tipo de Proveedor (*)</label>
                  <select v-model="proveedor.Tipoproveedor.IdTipoProveedor" @change="validate('tipoProveedor')" :class="inputClass(errors.tipoProveedor)">
                    <option disabled :value="null">Seleccione un tipo</option>
                    <option v-for="tipo in Tipoproveedores" :key="tipo.IdTipoProveedor" :value="tipo.IdTipoProveedor">{{ tipo.Nombre }}</option>
                  </select>
                  <p v-if="errors.tipoProveedor" class="text-red-500 text-xs italic mt-1">{{ errors.tipoProveedor }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
              <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold"><Camera class="h-5 w-5 text-blue-600" />Foto del Perfil</h3>
            </div>
            <div class="p-6 text-center">
              <div class="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg mx-auto mb-4">
                <img v-if="previewUrl" :src="previewUrl" alt="Vista previa" class="w-full h-full object-cover" />
                <User v-else class="h-16 w-16 text-white" />
              </div>
              <input ref="fileInput" type="file" accept="image/*" @change="handleArchivo" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
            <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
              <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold"><MapPin class="h-5 w-5 text-orange-600" />Información de Dirección</h3>
            </div>
            <div class="p-6 space-y-6">
              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2"><Map class="h-5 w-5 mr-2 text-orange-500" />Barrio</label>
                <Combobox v-model="proveedor.Persona.Direccion.Barrio">
                  <div class="relative mt-1">
                    <ComboboxInput :class="inputClass()" :displayValue="(barrio) => barrio?.Nombre || ''" @change="queryBarrio = $event.target.value" />
                    <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2"><ChevronUpDownIcon class="h-5 w-5 text-orange-500" aria-hidden="true" /></ComboboxButton>
                    <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryBarrio = ''">
                      <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        <div v-if="filteredBarrios.length === 0 && queryBarrio !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">No se encontraron resultados.</div>
                        <ComboboxOption v-for="barrio in filteredBarrios" :key="barrio.IdBarrio" :value="barrio" v-slot="{ selected, active }">
                          <li :class="{ 'bg-orange-500 text-white': active }, 'relative cursor-default select-none py-2 pl-10 pr-4'">
                            <span :class="[{ 'font-semibold': selected }, 'block truncate']">{{ barrio.Nombre }}</span>
                            <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500"><CheckIcon class="h-5 w-5" aria-hidden="true" /></span>
                          </li>
                        </ComboboxOption>
                      </ComboboxOptions>
                    </TransitionRoot>
                  </div>
                </Combobox>
              </div>
              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2"><MapPin class="h-5 w-5 mr-2 text-orange-500" />Dirección</label>
                <input v-model="proveedor.Persona.Direccion.Direccion" @input="validate('direccion')" @blur="validate('direccion')" :class="inputClass(errors.direccion)" placeholder="Dirección completa" />
                <p v-if="errors.direccion" class="text-red-500 text-xs italic mt-1">{{ errors.direccion }}</p>
              </div>
              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2"><ClipboardList class="h-5 w-5 mr-2 text-orange-500" />Referencia</label>
                <input v-model="proveedor.Persona.Direccion.Referencia" @input="validate('referencia')" @blur="validate('referencia')" :class="inputClass(errors.referencia)" placeholder="Referencia de la dirección" />
                <p v-if="errors.referencia" class="text-red-500 text-xs italic mt-1">{{ errors.referencia }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button type="button" @click="$emit('cancelar')" class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2">
          <X class="h-4 w-4" />
          Cancelar
        </button>
        <button type="button" @click="guardar" class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
          <Save class="h-4 w-4" />
          Guardar Proveedor
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { ArrowLeft, UserPlus, User, Calendar, Accessibility, Smartphone, IdCard, Mail, MapPin, Map, ClipboardList, Camera, X, Save } from 'lucide-vue-next';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  proveedorEditado: { type: Object, required: true },
  esNuevoProveedor: { type: Boolean, default: true },
  Tipoproveedores: { type: Array, required: true },
  barrios: { type: Array, required: true },
  email: { type: Array, required: true },
  documento: { type: Array, required: true },
  numero: { type: Array, required: true },
});

const emit = defineEmits(['guardar-proveedor', 'cancelar']);

const proveedor = ref(JSON.parse(JSON.stringify(props.proveedorEditado)));
const errors = reactive({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', email: '', documento: '', celular: '', genero: '', direccion: '', referencia: '', razonSocial: '', tipoProveedor: '' });

const previewUrl = ref(null);
const archivo = ref(null);
const fileInput = ref(null);
const queryBarrio = ref('');

const generos = [{id: 1, nombre: 'Masculino'}, {id: 2, nombre: 'Femenino'}, {id: 3, nombre: 'Otro'}];

const inputClass = (hasError) => [
  'w-full pl-12 pr-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30',
  { 'ring-2 ring-red-500/20 bg-red-50': hasError }
];

const filteredBarrios = computed(() =>
  queryBarrio.value === ''
    ? props.barrios
    : props.barrios.filter((b) => b.Nombre.toLowerCase().includes(queryBarrio.value.toLowerCase()))
);

watch(() => props.proveedorEditado, (newVal) => {
  proveedor.value = JSON.parse(JSON.stringify(newVal));
  previewUrl.value = proveedor.value.Persona?.Imagen?.Url || null;
}, { deep: true, immediate: true });

const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const agregarCelular = () => {
  const celulares = proveedor.value.Persona.Celulares;
  if (celulares.length < 4) {
    celulares.push({ IdCelular: null, Numero: '' });
  }
};

const eliminarCelular = (index) => {
  if (proveedor.value.Persona.Celulares.length > 1) {
    proveedor.value.Persona.Celulares.splice(index, 1);
  }
};

const validateField = (field, value) => {
    let error = '';
    const isEditing = !props.esNuevoProveedor;

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
            if (value && !/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'El apellido solo puede contener letras y espacios.';
            break;
        case 'email':
            if (!value) error = 'El correo electrónico es requerido.';
            else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = 'El formato del correo no es válido.';
            else {
                const emailId = isEditing ? proveedor.value.Persona.Email.IdEmail : null;
                if (props.email.some(e => e.Email.toLowerCase() === value.toLowerCase() && e.IdEmail !== emailId)) error = 'Este correo electrónico ya está en uso.';
            }
            break;
        case 'documento':
            if (!value || !value.trim()) error = 'El NIT es requerido.';
            else if (!/^\d+$/.test(value)) error = 'El NIT solo puede contener números.';
            else {
                const docId = isEditing ? proveedor.value.Persona.Documento[0].IdDocumento : null;
                if (props.documento.some(d => d.Documento === value && d.IdDocumento !== docId)) error = 'Este número de documento ya está registrado.';
            }
            break;
        case 'celular':
            if (!value || !value.trim()) error = 'El número de celular es requerido.';
            else if (!/\D/.test(value)) error = 'Solo debe contener números.';
            else if (!(value.length >= 7 && value.length <= 8)) error = 'El número de celular debe tener 7 u 8 dígitos.';
            else {
                const celularId = isEditing ? proveedor.value.Persona.Celulares[0]?.IdCelular : null;
                if (props.numero.some(n => n.Numero === value && n.IdCelular !== celularId)) error = 'Este número de celular ya está registrado.';
            }
            break;
        case 'genero':
            if (!value || ![1, 2, 3].includes(value)) error = 'El género es requerido.';
            break;
        case 'direccion':
            if (value && !/^[a-zA-Z0-9\s.,#\-ñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'La dirección contiene caracteres no válidos.';
            break;
        case 'referencia':
            if (value && !/^[a-zA-Z0-9\s.,#\-ñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'La referencia contiene caracteres no válidos.';
            break;
        case 'razonSocial':
            if (!value || !value.trim()) error = 'La Razón Social es requerida.';
            break;
        case 'tipoProveedor':
            if (!value) error = 'El Tipo de Proveedor es requerido.';
            break;
    }
    return error;
};

const validate = (field) => {
    const valueMap = {
        nombre: proveedor.value.Persona.Nombre,
        apellidoPaterno: proveedor.value.Persona.ApellidoPaterno,
        apellidoMaterno: proveedor.value.Persona.ApellidoMaterno,
        email: proveedor.value.Persona.Email.Email,
        documento: proveedor.value.Persona.Documento[0].Documento,
        celular: proveedor.value.Persona.Celulares[0]?.Numero,
        genero: proveedor.value.Persona.Genero.IdGenero,
        direccion: proveedor.value.Persona.Direccion.Direccion,
        referencia: proveedor.value.Persona.Direccion.Referencia,
        razonSocial: proveedor.value.RazonSocial,
        tipoProveedor: proveedor.value.Tipoproveedor.IdTipoProveedor,
    };
    errors[field] = validateField(field, valueMap[field]);
};

const validateForm = () => {
  Object.keys(errors).forEach(field => validate(field));
  return Object.values(errors).every(error => !error);
};

const guardar = () => {
  if (validateForm()) {
    emit('guardar-proveedor', { proveedor: proveedor.value, archivo: archivo.value });
  }
};

</script>
