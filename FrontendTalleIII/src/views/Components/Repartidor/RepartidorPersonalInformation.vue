<template>
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
            :value="repartidorEditado.Nombre"
            @input="$emit('update:repartidorEditado', { ...repartidorEditado, Nombre: $event.target.value })"
            @blur="$emit('validateField', 'nombre', repartidorEditado.Nombre)"
            :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nombre }]"
            placeholder="Nombre del repartidor"
          />
          <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <User class="h-5 w-5 mr-2 text-orange-500" />
            Apellido Paterno
          </label>
          <input
            :value="repartidorEditado.ApellidoPaterno"
            @input="$emit('update:repartidorEditado', { ...repartidorEditado, ApellidoPaterno: $event.target.value })"
            @blur="$emit('validateField', 'apellidoPaterno', repartidorEditado.ApellidoPaterno)"
            :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.apellidoPaterno }]"
            placeholder="Apellido paterno"
          />
          <p v-if="errors.apellidoPaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoPaterno }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <User class="h-5 w-5 mr-2 text-orange-500" />
            Apellido Materno
          </label>
          <input
            :value="repartidorEditado.ApellidoMaterno"
            @input="$emit('update:repartidorEditado', { ...repartidorEditado, ApellidoMaterno: $event.target.value })"
            @blur="$emit('validateField', 'apellidoMaterno', repartidorEditado.ApellidoMaterno)"
            :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.apellidoMaterno }]"
            placeholder="Apellido materno"
          />
          <p v-if="errors.apellidoMaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoMaterno }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Calendar class="h-5 w-5 mr-2 text-orange-500" />
            Fecha de Nacimiento
          </label>
          <input
            :value="repartidorEditado.FechaDeNacimiento"
            @input="$emit('update:repartidorEditado', { ...repartidorEditado, FechaDeNacimiento: $event.target.value })"
            type="date"
            class="w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
          />
        </div>

        <div class="md:col-span-2">
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Accessibility class="h-5 w-5 mr-2 text-orange-500" />
            Género
          </label>
          <div class="flex gap-6">
            <label class="inline-flex items-center">
              <input
                :checked="repartidorEditado.Genero.IdGenero === 1"
                @change="$emit('update:repartidorEditado', { ...repartidorEditado, Genero: { IdGenero: 1 } }); $emit('validateField', 'genero', 1)"
                type="radio"
                :value="1"
                class="text-orange-600"
              />
              <span class="ml-2 text-gray-700">Masculino</span>
            </label>
            <label class="inline-flex items-center">
              <input
                :checked="repartidorEditado.Genero.IdGenero === 2"
                @change="$emit('update:repartidorEditado', { ...repartidorEditado, Genero: { IdGenero: 2 } }); $emit('validateField', 'genero', 2)"
                type="radio"
                :value="2"
                class="text-orange-600"
              />
              <span class="ml-2 text-gray-700">Femenino</span>
            </label>
            <label class="inline-flex items-center">
              <input
                :checked="repartidorEditado.Genero.IdGenero === 3"
                @change="$emit('update:repartidorEditado', { ...repartidorEditado, Genero: { IdGenero: 3 } }); $emit('validateField', 'genero', 3)"
                type="radio"
                :value="3"
                class="text-orange-600"
              />
              <span class="ml-2 text-gray-700">Otro</span>
            </label>
          </div>
          <p v-if="errors.genero" class="text-red-500 text-xs italic mt-1">{{ errors.genero }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Phone class="h-5 w-5 mr-2 text-orange-500" />
            Celulares
          </label>
          <div v-for="(celular, index) in repartidorEditado.Celulares" :key="index" class="flex items-center gap-2 mb-2">
            <input
              :value="celular.Numero"
              @input="$emit('updateCelular', index, $event.target.value)"
              @blur="index === 0 ? $emit('validateField', 'celular', repartidorEditado.Celulares[0].Numero) : null"
              :placeholder="'Celular #' + (index + 1)"
              :class="['flex-1 w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.celular && index === 0 }]"
            />
            <button
              type="button"
              @click="$emit('eliminarCelular', index)"
              class="text-red-600 hover:text-red-800 p-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <p v-if="errors.celular" class="text-red-500 text-xs italic mt-1">{{ errors.celular }}</p>
          <button
            type="button"
            @click="$emit('agregarCelular')"
            :disabled="repartidorEditado.Celulares.length >= 4"
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
              :value="repartidorEditado.Documento[0].Documento"
              @input="$emit('updateDocumento', 0, $event.target.value)"
              @blur="$emit('validateField', 'ci', repartidorEditado.Documento[0].Documento)"
              :class="['flex-1 pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-l-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.ci }]"
              placeholder="Cédula de Identidad"
            />
            <select
              :value="repartidorEditado.Documento[0].Complemento.IdComplemento"
              @change="$emit('updateDocumentoComplemento', 0, $event.target.value)"
              class="pl-12 pr-4 py-4 px-4  border-l-0 shadow-md  bg-gray-50/80 rounded-r-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
            >
              <option v-for="comp in complementos" :key="comp.IdComplemento" :value="comp.IdComplemento">{{ comp.Nombre }}</option>
            </select>
          </div>
          <p v-if="errors.ci" class="text-red-500 text-xs italic mt-1">{{ errors.ci }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Briefcase class="h-5 w-5 mr-2 text-orange-500" />
            NIT
          </label>
          <input
            :value="repartidorEditado.Documento[1].Documento"
            @input="$emit('updateDocumento', 1, $event.target.value)"
            @blur="$emit('validateField', 'nit', repartidorEditado.Documento[1].Documento)"
            :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nit }]"
            placeholder="Número de NIT"
          />
          <p v-if="errors.nit" class="text-red-500 text-xs italic mt-1">{{ errors.nit }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Mail class="h-5 w-5 mr-2 text-orange-500" />
            Correo Electrónico
          </label>
          <input
            :value="repartidorEditado.Email.Email"
            type="email"
            @input="$emit('update:repartidorEditado', { ...repartidorEditado, Email: { ...repartidorEditado.Email, Email: $event.target.value } })"
            @blur="$emit('validateField', 'email', repartidorEditado.Email.Email)"
            :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.email }]"
            placeholder="correo@ejemplo.com"
          />
          <p v-if="errors.email" class="text-red-500 text-xs italic mt-1">{{ errors.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { User, Calendar, Accessibility, Phone, IdCard, Briefcase, Mail, X } from 'lucide-vue-next';

const props = defineProps({
  repartidorEditado: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    required: true
  },
  complementos: {
    type: Array,
    required: true
  },
  emailList: {
    type: Array,
    required: true
  },
  documentoList: {
    type: Array,
    required: true
  },
  numeroList: {
    type: Array,
    required: true
  }
});

const emit = defineEmits([
  'update:repartidorEditado',
  'validateField',
  'agregarCelular',
  'eliminarCelular',
  'updateCelular',
  'updateDocumento',
  'updateDocumentoComplemento'
]);
</script>
