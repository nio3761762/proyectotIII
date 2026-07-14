<template>
  <div class="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
        <User class="h-5 w-5 text-white" />
      </div>
      <h2 class="text-2xl font-bold text-gray-800">Información Personal</h2>
    </div>

    <div class="space-y-4">

      <!-- Nombre completo -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-2">
          <User class="h-4 w-4 text-blue-600" />
          <span class="text-sm font-semibold text-blue-700">Nombre Completo</span>
        </div>
        <p class="text-base font-medium text-gray-800">
          {{ persona.nombre }} {{ persona.apellidopaterno }} {{ persona.apellidomaterno }}
        </p>
      </div>

      <!-- Contacto -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-2">
            <Phone class="h-4 w-4 text-green-600" />
            <span class="text-sm font-semibold text-green-700">Celular(es)</span>
          </div>
          <p v-if="persona.celulares?.length" class="text-base font-medium text-gray-800">
            {{ persona.celulares.map(c => c.numero).join(' / ') }}
          </p>
          <p v-else class="text-gray-400 text-sm italic">No especificado</p>
        </div>

        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-2">
            <Mail class="h-4 w-4 text-purple-600" />
            <span class="text-sm font-semibold text-purple-700">Email</span>
          </div>
          <p class="text-base font-medium text-gray-800 truncate">
            {{ persona.email || 'No especificado' }}
          </p>
        </div>
      </div>

      <!-- CI -->
      <div class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-2">
          <IdCard class="h-4 w-4 text-cyan-600" />
          <span class="text-sm font-semibold text-cyan-700">Cédula de Identidad</span>
        </div>
        <p class="text-base font-medium text-gray-800">
          {{ persona.documento?.documento || 'No especificado' }}
          <span v-if="persona.documento?.complemento" class="text-gray-500">
            · {{ persona.documento.complemento.nombre }}
          </span>
        </p>
      </div>

      <!-- Fecha nacimiento -->
      <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-2">
          <Calendar class="h-4 w-4 text-yellow-600" />
          <span class="text-sm font-semibold text-yellow-700">Fecha de Nacimiento</span>
        </div>
        <p class="text-base font-medium text-gray-800">
          {{ formatFecha(persona.fechadenacimiento) }}
          <span v-if="edad > 0" class="text-gray-500 text-sm ml-2">({{ edad }} años)</span>
        </p>
      </div>

      <!-- Dirección -->
      <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-2">
          <MapPin class="h-4 w-4 text-orange-600" />
          <span class="text-sm font-semibold text-orange-700">Dirección</span>
        </div>
        <p v-if="persona.direccion" class="text-base font-medium text-gray-800">
          {{ persona.direccion.direccion }}
          <span v-if="persona.direccion.barrio" class="text-gray-500"> · B. {{ persona.direccion.barrio.nombre }}</span>
        </p>
        <p v-else class="text-gray-400 text-sm italic">No especificada</p>
      </div>

      <!-- Roles -->
      <div v-if="persona.usuario?.roles?.length" class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-3">
          <Shield class="h-4 w-4 text-indigo-600" />
          <span class="text-sm font-semibold text-indigo-700">Roles</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="rol in persona.usuario.roles"
            :key="rol.idrol"
            class="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-sm"
          >
            {{ rol.nombre }}
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { User, Phone, Mail, IdCard, Calendar, MapPin, Shield } from 'lucide-vue-next';

const props = defineProps({
  persona: { type: Object, required: true },
});

const edad = computed(() => {
  if (!props.persona?.fechadenacimiento) return 0;
  const hoy = new Date();
  const nac = new Date(props.persona.fechadenacimiento);
  let e = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) e--;
  return e;
});

const formatFecha = (f) => {
  if (!f) return 'No especificada';
  return new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
};
</script>
