<template>
  <div class="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
        <User class="h-5 w-5 text-white" />
      </div>
      <h2 class="text-2xl font-bold text-gray-800">Información Personal</h2>
    </div>

    <div class="space-y-6">
      <!-- Nombre Completo -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
        <div class="flex items-center gap-2 mb-3">
          <User class="h-5 w-5 text-blue-600" />
          <label class="text-sm font-semibold text-blue-700">Nombre Completo</label>
        </div>
        <p class="text-lg font-medium text-gray-800">
          {{ persona?.Nombre }} {{ persona?.ApellidoPaterno }} {{ persona?.ApellidoMaterno }}
        </p>
      </div>

      <!-- Contacto -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
          <div class="flex items-center gap-2 mb-3">
            <Phone class="h-5 w-5 text-green-600" />
            <label class="text-sm font-semibold text-green-700">Teléfono</label>
          </div>
          <p class="text-lg font-medium text-gray-800">
            {{ persona?.Celulares?.[0]?.Numero || 'No especificado' }}
          </p>
        </div>

        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
          <div class="flex items-center gap-2 mb-3">
            <Mail class="h-5 w-5 text-purple-600" />
            <label class="text-sm font-semibold text-purple-700">Email</label>
          </div>
          <p class="text-lg font-medium text-gray-800">
            {{ persona?.Email?.Email || 'No especificado' }}
          </p>
        </div>
      </div>

      <!-- Dirección -->
      <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
        <div class="flex items-center gap-2 mb-3">
          <MapPin class="h-5 w-5 text-orange-600" />
          <label class="text-sm font-semibold text-orange-700">Dirección</label>
        </div>
        <p class="text-lg font-medium text-gray-800">
          B. {{ persona?.Direccion?.Barrio?.Nombre }}, {{ persona?.Direccion?.Direccion }}
        </p>
      </div>

      <!-- Fecha de Nacimiento -->
      <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6">
        <div class="flex items-center gap-2 mb-3">
          <Calendar class="h-5 w-5 text-yellow-600" />
          <label class="text-sm font-semibold text-yellow-700">Fecha de Nacimiento</label>
        </div>
        <p class="text-lg font-medium text-gray-800">
        {{ calcularEdad(persona?.FechaDeNacimiento) }} años
        </p>
      </div>

      <!-- Documento CI -->
      <div class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
        <div class="flex items-center gap-2 mb-3">
          <IdCard class="h-5 w-5 text-cyan-600" />
          <label class="text-sm font-semibold text-cyan-700">Documento de Identidad</label>
        </div>
        <p class="text-lg font-medium text-gray-800">
          {{ persona?.Documento?.[0]?.Documento || 'No especificado' }} {{ persona?.Documento?.[0]?.Complemento?.Nombre }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { User, Phone, Mail, MapPin, Calendar, IdCard } from 'lucide-vue-next';

defineProps({
  persona: Object,
});

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
};
</script>
