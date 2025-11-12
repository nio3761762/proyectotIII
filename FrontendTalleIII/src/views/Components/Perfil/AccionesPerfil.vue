<template>
  <div class="space-y-6">
    <!-- Quick Actions -->
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
          <Settings class="h-5 w-5 text-white" />
        </div>
        <h3 class="text-xl font-bold text-gray-800">Acciones</h3>
      </div>

      <div class="space-y-4">
        <button
          @click="abrirModalEdicion"
          class="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
        >
          <Edit class="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span class="font-semibold">Editar Perfil</span>
        </button>

        <button
          @click="abrirModalContrasena"
          class="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
        >
          <Lock class="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span class="font-semibold">Cambiar Contraseña</span>
        </button>

        
      </div>
    </div>

    <!-- Security Info -->
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center">
          <Shield class="h-5 w-5 text-white" />
        </div>
        <h3 class="text-xl font-bold text-gray-800">Seguridad</h3>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
          <div class="flex items-center gap-3">
            <CheckCircle class="h-5 w-5 text-green-600" />
            <span class="text-sm font-medium text-gray-700">Cuenta Verificada</span>
          </div>
          <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">Activo</span>
        </div>

        <div class="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
          <div class="flex items-center gap-3">
            <Key class="h-5 w-5 text-blue-600" />
            <span class="text-sm font-medium text-gray-700">Última Actualización</span>
          </div>
          <span class="text-xs text-gray-500">Hace 2 días</span>
        </div>

        <div class="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
          <div class="flex items-center gap-3">
            <Clock class="h-5 w-5 text-purple-600" />
            <span class="text-sm font-medium text-gray-700">Último Acceso</span>
          </div>
          <span class="text-xs text-gray-500">Hoy, 14:30</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';
import { Settings, Edit, Lock, Shield, CheckCircle, Key, Clock } from 'lucide-vue-next';

const emits = defineEmits(['abrir-modal-edicion', 'abrir-modal-contrasena']);

const abrirModalEdicion = () => {
  emits('abrir-modal-edicion');
};

const abrirModalContrasena = () => {
  emits('abrir-modal-contrasena');
};
</script>
