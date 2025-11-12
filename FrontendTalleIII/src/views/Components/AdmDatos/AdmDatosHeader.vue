
<template>
  <div
    class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden mb-6"
  >
    <!-- Cover Background -->
    <div class="relative h-48 bg-gradient-to-r from-orange-500 via-red-600 to-orange-700">
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>

    <!-- Business Info -->
    <div class="relative px-8 pb-8">
      <div class="flex flex-col md:flex-row md:items-center gap-6 -mt-20">
        <!-- Logo -->
        <div class="relative -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24 xl:-mt-32">
          <div class="w-40 h-40 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
            <img
              :src="dato?.Imagen?.Url || '/placeholder.svg?height=128&width=128'"
              :alt="dato?.Nombre"
              class="w-full h-full object-full"
            />
          </div>
          <button
            @click="$emit('abrir-modal-foto', dato)"
            class="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Camera class="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <!-- Business Info -->
        <div class="flex-1 md:mb-4">
          <div class="mb-4">
            <h1 class="text-3xl md:text-4xl font-bold text-black md:text-white mb-2">
              {{ dato?.Nombre }}
            </h1>
            <div class="flex items-center gap-2 text-black md:text-white">
              <User class="h-4 w-4 text-black md:text-white" />
              <span>Propietario: {{ dato?.Persona.Nombre }} {{ dato?.Persona.ApellidoPaterno }}</span>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
              <Mail class="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div class="text-xs text-blue-600 font-semibold mb-1">Email</div>
              <div class="text-sm font-bold text-gray-800 truncate">{{ dato?.Email.Email }}</div>
            </div>

            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
              <Phone class="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div class="text-xs text-green-600 font-semibold mb-1">Celular</div>
              <div class="text-sm font-bold text-gray-800">{{ dato?.Celular }}</div>
            </div>

            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
              <Building class="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div class="text-xs text-purple-600 font-semibold mb-1">Sucursales</div>
              <div class="text-lg font-bold text-gray-800">{{ sucursales.length }}</div>
            </div>

            <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 text-center">
              <Shield class="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div class="text-xs text-orange-600 font-semibold mb-1">Estado</div>
              <div class="text-sm font-bold text-green-600">Activo</div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="mt-6 flex justify-end">
            <button
              @click="$emit('abrir-modal-edicion-datos')"
              class="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <Edit class="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span class="font-semibold">Editar Información</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup>
import {
  Building, Camera, Edit, Phone, Mail, User, Shield
} from 'lucide-vue-next';

defineProps({
  dato: {
    type: Object,
    required: true
  },
  sucursales: {
    type: Array,
    required: true
  }
});

defineEmits(['abrir-modal-foto', 'abrir-modal-edicion-datos']);
</script>
