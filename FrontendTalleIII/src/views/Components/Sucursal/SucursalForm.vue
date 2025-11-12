
<template>
  <div class="space-y-8">
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <div class="flex items-center gap-4">
          <button @click="$emit('cancelar')" class="rounded-2xl hover:bg-orange-50 p-2 transition-colors">
            <ArrowLeft class="h-5 w-5" />
          </button>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <Building class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                {{ esNuevaSucursal ? 'Registrar' : 'Actualizar' }} Sucursal
              </h1>
              <p class="text-gray-600 mt-1">{{ esNuevaSucursal ? 'Crea una nueva sucursal' : 'Modifica los datos de la sucursal' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="$emit('guardar')" class="space-y-8">
      <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
        <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
          <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
            <Info class="h-5 w-5 text-orange-600" />
            Información General
          </h3>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Building class="h-5 w-5 mr-2 text-orange-500" />
              Nombre de la Sucursal
            </label>
            <input :value="sucursalEditada.Nombre" @input="$emit('update:sucursalEditada', { ...sucursalEditada, Nombre: $event.target.value })" @blur="validateField('nombre')" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.nombre ? 'border-red-500' : 'border-gray-200']" placeholder="Ej: Sucursal Centro"/>
            <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
          </div>
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Hash class="h-5 w-5 mr-2 text-orange-500" />
              Número de Sucursal
            </label>
            <input :value="sucursalEditada.Nro" @input="$emit('update:sucursalEditada', { ...sucursalEditada, Nro: $event.target.value })" @blur="validateField('nro')" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.nro ? 'border-red-500' : 'border-gray-200']" placeholder="Ej: 001"/>
            <p v-if="errors.nro" class="text-red-500 text-xs italic mt-1">{{ errors.nro }}</p>
          </div>
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Smartphone class="h-5 w-5 mr-2 text-orange-500" />
              Celular
            </label>
            <input :value="sucursalEditada.Celular" type="tel" @input="$emit('update:sucursalEditada', { ...sucursalEditada, Celular: $event.target.value })" @blur="validateField('celular')" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.celular ? 'border-red-500' : 'border-gray-200']" placeholder="+591 70123456"/>
            <p v-if="errors.celular" class="text-red-500 text-xs italic mt-1">{{ errors.celular }}</p>
          </div>
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Info class="h-5 w-5 mr-2 text-orange-500" />
              Tipo de Sucursal
            </label>
            <select :value="sucursalEditada.Central" @change="$emit('update:sucursalEditada', { ...sucursalEditada, Central: $event.target.value })" class="w-full pl-4 pr-4 py-3 border-gray-200 border rounded-2xl">
              <option :value="1">Central</option>
              <option :value="2">Normal</option>
            </select>
          </div>
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Clock class="h-5 w-5 mr-2 text-orange-500" />
              Hora de Entrada
            </label>
            <input :value="sucursalEditada.Horario.HoraEntrada" type="time" @input="$emit('update:sucursalEditada', { ...sucursalEditada, Horario: { ...sucursalEditada.Horario, HoraEntrada: $event.target.value } })" @blur="validateField('horaEntrada')" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.horaEntrada ? 'border-red-500' : 'border-gray-200']"/>
            <p v-if="errors.horaEntrada" class="text-red-500 text-xs italic mt-1">{{ errors.horaEntrada }}</p>
          </div>
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Clock class="h-5 w-5 mr-2 text-orange-500" />
              Hora de Salida
            </label>
            <input :value="sucursalEditada.Horario.HoraSalida" type="time" @input="$emit('update:sucursalEditada', { ...sucursalEditada, Horario: { ...sucursalEditada.Horario, HoraSalida: $event.target.value } })" @blur="validateField('horaSalida')" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.horaSalida ? 'border-red-500' : 'border-gray-200']"/>
            <p v-if="errors.horaSalida" class="text-red-500 text-xs italic mt-1">{{ errors.horaSalida }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
          <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
            <MapPin class="h-5 w-5 text-blue-600" />
            Ubicación
          </h3>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Globe class="h-5 w-5 mr-2 text-blue-500" />
              Departamento
            </label>
            <select :value="selectedDepartamento" @change="$emit('update:selectedDepartamento', $event.target.value)" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.departamento ? 'border-red-500' : 'border-gray-200']">
              <option :value="null" disabled>Seleccione un departamento</option>
              <option v-for="depto in departamentos" :key="depto.IdDepto" :value="depto.IdDepto">
                {{ depto.Nombre }}
              </option>
            </select>
            <p v-if="errors.departamento" class="text-red-500 text-xs italic mt-1">{{ errors.departamento }}</p>
          </div>
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Building class="h-5 w-5 mr-2 text-blue-500" />
              Ciudad
            </label>
            <select :value="selectedCiudad" :disabled="!selectedDepartamento || ciudades.length === 0" @change="$emit('update:selectedCiudad', $event.target.value)" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.ciudad ? 'border-red-500' : 'border-gray-200']">
              <option :value="null" disabled>Seleccione una ciudad</option>
              <option v-for="ciudad in ciudades" :key="ciudad.IdCiudad" :value="ciudad.IdCiudad">
                {{ ciudad.Nombre }}
              </option>
            </select>
            <p v-if="errors.ciudad" class="text-red-500 text-xs italic mt-1">{{ errors.ciudad }}</p>
          </div>
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Map class="h-5 w-5 mr-2 text-blue-500" />
              Distrito
            </label>
            <select :value="selectedDistrito" :disabled="!selectedCiudad || distritos.length === 0" @change="$emit('update:selectedDistrito', $event.target.value)" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.distrito ? 'border-red-500' : 'border-gray-200']">
              <option :value="null" disabled>Seleccione un distrito</option>
              <option v-for="distrito in distritos" :key="distrito.IdDistrito" :value="distrito.IdDistrito">
                {{ distrito.Nombre }}
              </option>
            </select>
            <p v-if="errors.distrito" class="text-red-500 text-xs italic mt-1">{{ errors.distrito }}</p>
          </div>
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <MapPin class="h-5 w-5 mr-2 text-blue-500" />
              Barrio
            </label>
            <select :value="selectedBarrio" :disabled="!selectedDistrito || barrios.length === 0" @change="$emit('update:selectedBarrio', $event.target.value)" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.barrio ? 'border-red-500' : 'border-gray-200']">
              <option :value="null" disabled>Seleccione un barrio</option>
              <option v-for="barrio in barrios" :key="barrio.IdBarrio" :value="barrio.IdBarrio">
                {{ barrio.Nombre }}
              </option>
            </select>
            <p v-if="errors.barrio" class="text-red-500 text-xs italic mt-1">{{ errors.barrio }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <MapPin class="h-5 w-5 mr-2 text-blue-500" />
              Dirección
            </label>
            <input :value="sucursalEditada.Direccion.Direccion" @input="$emit('update:sucursalEditada', { ...sucursalEditada, Direccion: { ...sucursalEditada.Direccion, Direccion: $event.target.value } })" @blur="validateField('direccion')" :class="['w-full pl-4 pr-4 py-3 border rounded-2xl', errors.direccion ? 'border-red-500' : 'border-gray-200']" placeholder="Av. Principal #123"/>
            <p v-if="errors.direccion" class="text-red-500 text-xs italic mt-1">{{ errors.direccion }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <ClipboardList class="h-5 w-5 mr-2 text-blue-500" />
              Referencia
            </label>
            <input :value="sucursalEditada.Direccion.Referencia" @input="$emit('update:sucursalEditada', { ...sucursalEditada, Direccion: { ...sucursalEditada.Direccion, Referencia: $event.target.value } })" class="w-full pl-4 pr-4 py-3 border-gray-200 border rounded-2xl" placeholder="Cerca del mercado central"/>
          </div>
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Globe class="h-5 w-5 mr-2 text-blue-500" />
              Ubicacion
            </label>
            <input :value="sucursalEditada.Direccion.UbicacionGPS" @input="$emit('update:sucursalEditada', { ...sucursalEditada, Direccion: { ...sucursalEditada.Direccion, UbicacionGPS: $event.target.value } })" class="w-full pl-4 pr-4 py-3 border-gray-200 border rounded-2xl" placeholder="Ubicacion GPS"/>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button type="button" @click="$emit('cancelar')" class="px-8 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 border-2 border-gray-300 bg-transparent hover:bg-gray-100 text-gray-600">
          <X class="h-4 w-4" />
          Cancelar
        </button>
        <button type="submit" class="px-8 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700 transform hover:scale-105">
          <Save class="h-4 w-4" />
          Guardar Sucursal
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import {
  Building, ArrowLeft, Save, X, Info, Hash, Smartphone, Clock, MapPin, Map, ClipboardList, Globe
} from 'lucide-vue-next';

const props = defineProps({
  sucursalEditada: { type: Object, required: true },
  esNuevaSucursal: { type: Boolean, required: true },
  errors: { type: Object, required: true },
  departamentos: { type: Array, required: true },
  ciudades: { type: Array, required: true },
  distritos: { type: Array, required: true },
  barrios: { type: Array, required: true },
  selectedDepartamento: { type: [Number, String], default: null },
  selectedCiudad: { type: [Number, String], default: null },
  selectedDistrito: { type: [Number, String], default: null },
  selectedBarrio: { type: [Number, String], default: null },
});

const emit = defineEmits([
  'update:sucursalEditada',
  'update:selectedDepartamento',
  'update:selectedCiudad',
  'update:selectedDistrito',
  'update:selectedBarrio',
  'cancelar',
  'guardar',
]);

const validateField = (field) => {
    let value;
    switch (field) {
        case 'nombre':
            value = props.sucursalEditada.Nombre;
            break;
        case 'nro':
            value = props.sucursalEditada.Nro;
            break;
        case 'celular':
            value = props.sucursalEditada.Celular;
            break;
        case 'horaEntrada':
            value = props.sucursalEditada.Horario.HoraEntrada;
            break;
        case 'horaSalida':
            value = props.sucursalEditada.Horario.HoraSalida;
            break;
        case 'departamento':
            value = props.selectedDepartamento;
            break;
        case 'ciudad':
            value = props.selectedCiudad;
            break;
        case 'distrito':
            value = props.selectedDistrito;
            break;
        case 'barrio':
            value = props.selectedBarrio;
            break;
        case 'direccion':
            value = props.sucursalEditada.Direccion.Direccion;
            break;
    }

    let error = '';
    const stringValue = (value === null || value === undefined) ? '' : String(value);

    switch (field) {
        case 'nombre':
            if (!stringValue.trim()) error = 'El nombre es requerido.';
            else if (!/^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(stringValue)) error = 'El nombre solo puede contener letras, números y espacios.';
            break;
        case 'nro':
            if (!stringValue.trim()) error = 'El número es requerido.';
            else if (!/^\d+$/.test(stringValue)) error = 'El número solo puede contener dígitos.';
            break;
        case 'celular':
            if (stringValue.trim() && !/^\d+$/.test(stringValue)) error = 'El celular solo puede contener números.';
            else if (stringValue.trim() && !(stringValue.length >= 7 && stringValue.length <= 8)) error = 'El celular debe tener 7 u 8 dígitos.';
            break;
        case 'horaEntrada':
            if (!value) error = 'La hora de entrada es requerida.';
            break;
        case 'horaSalida':
            if (!value) error = 'La hora de salida es requerida.';
            else if (props.sucursalEditada.Horario.HoraEntrada && value <= props.sucursalEditada.Horario.HoraEntrada) error = 'La hora de salida debe ser posterior a la de entrada.';
            break;
        case 'departamento':
            if (!value) error = 'Debe seleccionar un departamento.';
            break;
        case 'ciudad':
            if (!value) error = 'Debe seleccionar una ciudad.';
            break;
        case 'distrito':
            if (!value) error = 'Debe seleccionar un distrito.';
            break;
        case 'barrio':
            if (!value) error = 'Debe seleccionar un barrio.';
            break;
        case 'direccion':
            if (!stringValue.trim()) error = 'La dirección es requerida.';
            break;
    }
    emit('update:errors', { ...props.errors, [field]: error });
};

const validateForm = () => {
    validateField('nombre');
    validateField('nro');
    validateField('celular');
    validateField('horaEntrada');
    validateField('horaSalida');
    validateField('departamento');
    validateField('ciudad');
    validateField('distrito');
    validateField('barrio');
    validateField('direccion');
    return Object.values(props.errors).every(err => !err);
};

defineExpose({ validateForm });

</script>
