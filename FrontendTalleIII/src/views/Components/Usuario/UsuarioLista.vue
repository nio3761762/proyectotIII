<template>
  <div class="space-y-6 mt-8">
    <!-- Desktop Grid View -->
    <div class="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
      <div v-for="(usuario, index) in usuarios" :key="usuario.IdUsuario" class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in-up" :style="{ 'animation-delay': `${index * 0.2}s` }">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                <img v-if="usuario.Persona?.Imagen?.Url" :src="usuario.Persona.Imagen.Url" alt="Foto" class="w-12 h-12 object-cover" />
                <User v-else class="h-6 w-6 text-white" />
              </div>
              <div>
                <!-- hola -->
                <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                  {{ usuario.Persona.Nombre }} {{ usuario.Persona.ApellidoPaterno }}
                </h3>
                <p class="text-gray-600 text-sm">{{ usuario.Persona.Email.Email }}</p>
              </div>
            </div>
            <!--  -->
            <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', usuario.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
              {{ usuario.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Información Clave</span>
              <button @click="toggleDetalles(usuario.IdUsuario)" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors">
                {{ usuarioExpandido === usuario.IdUsuario ? 'Ocultar' : 'Ver más' }}
                <ChevronDown v-if="usuarioExpandido !== usuario.IdUsuario" class="h-4 w-4" />
                <ChevronUp v-else class="h-4 w-4" />
              </button>
            </div>
            <div class="space-y-2">
              <div v-for="us in usuario.Persona.Documento" class="flex items-center gap-2 text-sm text-gray-600">
                <IdCard v-if="us.Complemento" class="h-4 w-4 text-orange-500" />
                <span v-if="us.Complemento">{{us.Documento }} {{ us.Complemento.Nombre }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Shield class="h-4 w-4 text-blue-500" />
                <span>{{ usuario.Rolusuario[0]?.Rol.Nombre || 'Sin Rol' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Phone class="h-4 w-4 text-green-500" />
                <span>{{ usuario.Persona.Celulares[0]?.Numero || 'N/A' }}</span>
              </div>
            </div>
          </div>
          <div v-if="usuarioExpandido === usuario.IdUsuario" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
            <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
              <div class="font-semibold text-gray-800 mb-2 text-sm">Datos Adicionales</div>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar class="h-3 w-3 text-blue-500" />
                  <span>Edad: {{ calcularEdad(usuario.Persona?.FechaDeNacimiento) }} años</span>
                </div>
                <div class="flex items-start gap-2 text-xs text-gray-600">
                  <MapPin class="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="font-medium text-gray-700">{{ usuario.Persona?.Direccion?.Direccion || 'No especificada' }}</p>
                    <p class="text-gray-500">Barrio: {{ usuario.Persona?.Direccion?.Barrio?.Nombre || 'N/A' }}</p>
                    <p class="text-gray-500">Ref: {{ usuario.Persona?.Direccion?.Referencia || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="usuario.Persona.Celulares && usuario.Persona.Celulares.length > 1" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
              <div class="font-semibold text-gray-800 mb-2 text-sm">Otros Números</div>
              <div class="space-y-1">
                <div v-for="celular in usuario.Persona.Celulares.slice(1)" :key="celular.IdCelular" class="flex items-center gap-2 text-xs text-gray-600">
                  <Phone class="h-3 w-3 text-green-500" />
                  <span>{{ celular.Numero }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-200/80">
            <button @click="$emit('editar', usuario)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Edit class="h-4 w-4" />
              Editar
            </button>
            <div class="flex items-center gap-2">
               <button @click="$emit('asignar-rol', usuario)" class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center">
              <Key class="h-4 w-4" />
            </button>
            <button @click="$emit('cambiar-estado', usuario.IdUsuario, usuario.Persona.Nombre, usuario.Estado.IdEstado)" :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1', usuario.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700']">
              <Trash2 v-if="usuario.Estado.IdEstado === 1" class="h-4 w-4" />
              <Check v-else class="h-4 w-4" />
            </button>
            </div>
           
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="md:hidden space-y-4">
      <div v-for="(usuario, index) in usuarios" :key="usuario.IdUsuario" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in-up" :style="{ 'animation-delay': `${index * 0.2}s` }">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                <img v-if="usuario.Persona?.Imagen?.Url" :src="usuario.Persona.Imagen.Url" alt="Foto" class="w-12 h-12 object-cover" />
                <User v-else class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800">
                  {{ usuario.Persona.Nombre }} {{ usuario.Persona.ApellidoPaterno }}
                </h3>
                <p class="text-gray-600 text-sm">{{ usuario.Persona.Email.Email }}</p>
              </div>
            </div>
            <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', usuario.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600']">
              {{ usuario.Estado.IdEstado === 1 ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="mb-4 p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Información Clave</span>
              <button @click="toggleDetalles(usuario.IdUsuario)" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors">
                {{ usuarioExpandido === usuario.IdUsuario ? 'Ocultar' : 'Ver detalles' }}
                <ChevronDown v-if="usuarioExpandido !== usuario.IdUsuario" class="h-4 w-4" />
                <ChevronUp v-else class="h-4 w-4" />
              </button>
            </div>
            <div v-if="usuarioExpandido !== usuario.IdUsuario" class="space-y-1 text-sm text-gray-600 animate-fade-in">
              <div v-for="us in usuario.Persona.Documento" class="flex items-center gap-2 text-sm text-gray-600">
                <IdCard v-if="us.Complemento" class="h-4 w-4 text-orange-500" />
                <span v-if="us.Complemento">{{us.Documento }} {{ us.Complemento.Nombre }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Shield class="h-4 w-4 text-blue-500" />
                <span>{{ usuario.Rolusuario[0]?.Rol.Nombre || 'Sin Rol' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Phone class="h-4 w-4 text-green-500" />
                <span>{{ usuario.Persona.Celulares[0]?.Numero || 'N/A' }}</span>
              </div>
            </div>
          </div>
          <div v-if="usuarioExpandido === usuario.IdUsuario" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
             <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                  <div class="font-semibold text-gray-800 mb-2 text-sm">Datos Adicionales</div>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar class="h-3 w-3 text-blue-500" />
                      <span>Edad: {{ calcularEdad(usuario.Persona?.FechaDeNacimiento) }} años</span>
                    </div>
                    <div class="flex items-start gap-2 text-xs text-gray-600">
                      <MapPin class="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p class="font-medium text-gray-700">{{ usuario.Persona?.Direccion?.Direccion || 'No especificada' }}</p>
                        <p class="text-gray-500">Barrio: {{ usuario.Persona?.Direccion?.Barrio?.Nombre || 'N/A' }}</p>
                        <p class="text-gray-500">Ref: {{ usuario.Persona?.Direccion?.Referencia || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="usuario.Persona.Celulares && usuario.Persona.Celulares.length > 1" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                  <div class="font-semibold text-gray-800 mb-2 text-sm">Otros Números</div>
                  <div class="space-y-1">
                    <div v-for="celular in usuario.Persona.Celulares.slice(1)" :key="celular.IdCelular" class="flex items-center gap-2 text-xs text-gray-600">
                      <Phone class="h-3 w-3 text-green-500" />
                      <span>{{ celular.Numero }}</span>
                    </div>
                  </div>
                </div>
          </div>
          <div class="flex gap-2">
            <button @click="$emit('editar', usuario)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Edit class="h-4 w-4" />
              Editar
            </button>
            <button @click="$emit('asignar-rol', usuario)" class="flex-1 border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Key class="h-4 w-4" />
              Rol
            </button>
            <button @click="$emit('cambiar-estado', usuario.IdUsuario, usuario.Persona.Nombre, usuario.Estado.IdEstado)" :class="['rounded-xl px-3 py-2 text-sm font-medium border-0 shadow-lg text-white transition-colors flex items-center justify-center gap-1', usuario.Estado.IdEstado === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700']">
              <Trash2 v-if="usuario.Estado.IdEstado === 1" class="h-4 w-4" />
              <Check v-else class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="usuarios.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center animate-fade-in-up">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
        <Users class="h-12 w-12 text-orange-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay usuarios</h3>
      <p class="text-gray-500">No se encontraron usuarios que coincidan con los filtros aplicados</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  Users, User, Edit, Key, Trash2, Check, IdCard, Shield, Phone, 
  Calendar, MapPin, ChevronDown, ChevronUp
} from 'lucide-vue-next';

defineProps({
  usuarios: {
    type: Array,
    required: true
  }
});

defineEmits(['editar', 'asignar-rol', 'cambiar-estado']);

const usuarioExpandido = ref(null);

const toggleDetalles = (usuarioId) => {
  usuarioExpandido.value = usuarioExpandido.value === usuarioId ? null : usuarioId;
};

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
.animate-fade-in-up {
  animation: fade-in-up 1s ease-out forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
