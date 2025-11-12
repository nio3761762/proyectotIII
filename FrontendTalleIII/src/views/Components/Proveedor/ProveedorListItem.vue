<template>
  <div>
    <!-- Desktop Grid View -->
    <div class="hidden md:block group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
      <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div class="relative p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
              <img v-if="proveedor?.Persona?.Imagen?.Url" :src="proveedor.Persona.Imagen.Url" alt="Foto" class="w-12 h-12 object-cover" />
              <User v-else class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                {{ proveedor.Persona.Nombre }} {{ proveedor.Persona.ApellidoPaterno }}
              </h3>
              <p class="text-gray-600 text-sm">{{ proveedor.Persona.Email.Email }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', proveedor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
            {{ proveedor.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Información Clave</span>
            <button @click="$emit('toggle-detalles')" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors">
              {{ isExpanded ? 'Ocultar' : 'Ver más' }}
              <ChevronDown v-if="!isExpanded" class="h-4 w-4" />
              <ChevronUp v-else class="h-4 w-4" />
            </button>
          </div>
          <div class="space-y-2">
            <template v-for="documento in proveedor.Persona.Documento" :key="documento.IdDocumento">
              <div v-if="!documento.Complemento" class="flex items-center gap-2 text-sm text-gray-600">
                <IdCard class="h-4 w-4 text-orange-500" />
                <span>{{ documento.Documento }}</span>
              </div>
            </template>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Phone class="h-4 w-4 text-green-500" />
              <span>{{ proveedor.Persona.Celulares[0]?.Numero || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div v-if="isExpanded" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
          <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
            <div class="font-semibold text-gray-800 mb-2 text-sm">Datos Adicionales</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-xs text-gray-600">
                <Calendar class="h-3 w-3 text-blue-500" />
                <span>Edad: {{ calcularEdad(proveedor?.Persona?.FechaDeNacimiento) }} años</span>
              </div>
              <div class="flex items-start gap-2 text-xs text-gray-600">
                <MapPin class="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-700">{{ proveedor.Persona?.Direccion?.Direccion || 'No especificada' }}</p>
                  <p class="text-gray-500">Barrio: {{ proveedor?.Persona?.Direccion?.Barrio?.Nombre || 'N/A' }}</p>
                  <p class="text-gray-500">Ref: {{ proveedor?.Persona?.Direccion?.Referencia || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="proveedor.Persona.Celulares && proveedor.Persona.Celulares.length > 1" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
            <div class="font-semibold text-gray-800 mb-2 text-sm">Otros Números</div>
            <div class="space-y-1">
              <div v-for="celular in proveedor.Persona.Celulares.slice(1)" :key="celular.IdCelular" class="flex items-center gap-2 text-xs text-gray-600">
                <Phone class="h-3 w-3 text-green-500" />
                <span>{{ celular.Numero }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="$emit('editar', proveedor)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <Edit class="h-4 w-4" />
            Editar
          </button>
          <button @click="$emit('abrir-modal', proveedor.IdProveedor, proveedor.Persona.Nombre, proveedor.Estado.IdEstado)" :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1', proveedor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-600']">
            <Trash2 v-if="proveedor.Estado.IdEstado === 1" class="h-4 w-4" />
            <Check v-else class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="md:hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
              <img v-if="proveedor?.Persona.Imagen?.Url" :src="proveedor.Persona.Imagen.Url" alt="Foto" class="w-12 h-12 object-cover" />
              <User v-else class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ proveedor.Persona.Nombre }} {{ proveedor.Persona.ApellidoPaterno }}</h3>
              <p class="text-gray-600 text-sm">{{ proveedor.Persona.Email.Email }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', proveedor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
            {{ proveedor.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div class="mb-4 p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Información Clave</span>
            <button @click="$emit('toggle-detalles')" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors">
              {{ isExpanded ? 'Ocultar' : 'Ver detalles' }}
              <ChevronDown v-if="!isExpanded" class="h-4 w-4" />
              <ChevronUp v-else class="h-4 w-4" />
            </button>
          </div>
          <div v-if="!isExpanded" class="space-y-1 text-sm text-gray-600 animate-fade-in">
            <template v-for="documento in proveedor.Persona.Documento" :key="documento.IdDocumento">
              <div v-if="!documento.Complemento"><span class="font-semibold text-orange-600"></span>{{ documento.Documento }}</div>
            </template>
            <div><span class="font-semibold text-green-600">Teléfono:</span> {{ proveedor.Persona.Celulares[0]?.Numero || 'N/A' }}</div>
          </div>
        </div>

        <div v-if="isExpanded" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
          <div class="bg-gray-50 rounded-2xl p-3">
            <div class="text-xs font-semibold text-orange-600 mb-1">Edad</div>
            <div class="text-gray-800 text-sm">{{ calcularEdad(proveedor?.Persona.FechaDeNacimiento) }} años</div>
          </div>
          <div class="bg-gray-50 rounded-2xl p-3">
            <div class="text-xs font-semibold text-orange-600 mb-1">NIT</div>
            <div class="text-gray-800 text-sm">{{ proveedor.Persona?.Documento[0]?.Documento || 'N/A' }}</div>
          </div>
          <div class="bg-gray-50 rounded-2xl p-3">
            <div class="text-xs font-semibold text-orange-600 mb-1">Dirección</div>
            <div class="text-gray-800 text-sm">{{ proveedor?.Persona?.Direccion?.Direccion || 'N/A' }}</div>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="$emit('editar', proveedor)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <Edit class="h-4 w-4" />
            Editar
          </button>
          <button @click="$emit('abrir-modal', proveedor.IdProveedor, proveedor.Persona.Nombre, proveedor.Estado.IdEstado)" :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1', proveedor.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-600']">
            <Trash2 v-if="proveedor.Estado.IdEstado === 1" class="h-4 w-4" />
            <Check v-else class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, ChevronDown, ChevronUp, IdCard, Phone, Calendar, MapPin, Edit, Trash2, Check } from 'lucide-vue-next';

defineProps({
  proveedor: {
    type: Object,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-detalles', 'editar', 'abrir-modal']);

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 'N/A';
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

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
