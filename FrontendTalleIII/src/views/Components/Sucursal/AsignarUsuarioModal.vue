
<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
    <div class="bg-white/95 backdrop-blur-sm border-white/50 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Asignar Usuarios a {{ sucursal?.Nombre }}</h2>
          <button @click="$emit('close')" class="text-white hover:text-gray-200 transition-colors"><X class="h-6 w-6" /></button>
        </div>
      </div>
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <div class="space-y-4">
          <div v-if="usuariosDisponibles.length === 0" class="text-center text-gray-600 py-8">No hay usuarios disponibles para asignar.</div>
          <div v-else>
            <div v-for="usuario in usuariosDisponibles" :key="usuario.IdUsuario" class="flex items-center justify-between p-3 rounded-xl shadow-sm mb-2" :class="usuariosAsignados.some(u => u.id === usuario.IdUsuario) ? 'bg-orange-100 border border-orange-300' : 'bg-gray-50'">
              <div class="flex items-center gap-3">
                <User class="h-5 w-5 text-gray-500" />
                <div v-if="usuario.Persona !== null">
                  <span class="font-medium text-gray-800">{{ usuario?.Persona?.Nombre }} {{ usuario?.Persona?.ApellidoPaterno }}</span>
                  <span class="text-sm text-gray-500 block">{{ usuario?.Rolusuario?.[0]?.Rol.Nombre || 'Sin rol' }} </span>
                </div>
              </div>
              <button @click="$emit('toggle-asignacion', usuario.IdUsuario)" :class="['p-2 rounded-full text-white shadow-md transition-all duration-300', usuariosAsignados.some(u => u.id === usuario.IdUsuario) ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600']">
                <UserMinus v-if="usuariosAsignados.some(u => u.id === usuario.IdUsuario)" class="h-4 w-4" />
                <UserPlus v-else class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex justify-end gap-4">
        <button @click="$emit('close')" class="px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border-2 border-gray-300 bg-transparent hover:bg-gray-100 text-gray-600">Cancelar</button>
        <button @click="$emit('guardar')" class="px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700">Guardar Asignación</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X, User, UserPlus, UserMinus } from 'lucide-vue-next';

defineProps({
  show: { type: Boolean, required: true },
  sucursal: { type: Object, default: null },
  usuariosDisponibles: { type: Array, required: true },
  usuariosAsignados: { type: Array, required: true },
});

defineEmits(['close', 'toggle-asignacion', 'guardar']);
</script>
