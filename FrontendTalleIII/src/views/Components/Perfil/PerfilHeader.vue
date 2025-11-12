<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden mb-6">
    <!-- Cover Background -->
    <div class="relative h-48 bg-gradient-to-r from-orange-500 via-red-600 to-orange-700">
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div class="absolute top-6 right-6">
        <button
          @click="abrirModalFoto"
          class="bg-white/20 backdrop-blur-sm text-white p-3 rounded-2xl shadow-lg hover:bg-white/30 transition-all duration-300 group"
        >
          <Camera class="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>

    <!--   .Profile Info -->
    <div class="relative px-8 pb-8">
      <div class="flex flex-col md:flex-row md:items-end gap-6 -mt-20">
        <!-- Avatar -->
        <div class="relative">
          <div class="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
            <img 
              :src="persona?.Imagen?.Url || '/placeholder.svg?height=128&width=128'" 
              :alt="persona?.Nombre"
              class="w-full h-full object-cover"
            />
          </div>
          <button
            @click="abrirModalFoto"
            class="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Camera class="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <!-- User Info -->
        <div class="flex-1 md:mb-4 text-white">
          <div class="mb-4">
            <h1 class="text-3xl md:text-4xl font-bold  bg-gradient-to-r  from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent mb-2">
             
             <div class="text-black md:text-white"> {{ persona?.Nombre }} {{ persona?.ApellidoPaterno }}
              </div>
            </h1>
            <div class="flex items-center gap-2 text-black md:text-white">
              <Mail class="h-4 w-4 " />
              <span>{{ persona?.Email?.Email || 'Sin email' }}</span>
            </div>
          </div>

          <!-- Quick Stats  -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
              <Calendar class="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div class="text-lg font-bold text-gray-800">{{ calcularEdad(persona?.FechaDeNacimiento) }}</div>
              <div class="text-xs text-blue-600 font-semibold">Años</div>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
              <Phone class="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div class="text-lg font-bold text-gray-800">{{ persona?.Celulares?.length || 0 }}</div>
              <div class="text-xs text-green-600 font-semibold">Teléfonos</div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
              <MapPin class="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div class="text-lg font-bold text-gray-800">1</div>
              <div class="text-xs text-purple-600 font-semibold">Dirección</div>
            </div>
            
            <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 text-center">
              <Shield class="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div class="text-lg font-bold text-gray-800">{{ persona?.Usuario.Rolusuario[0]?.Rol.Nombre }}</div>
              <div class="text-xs text-orange-600 font-semibold">Rol</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { Camera, Mail, Calendar, Phone, MapPin, Shield } from 'lucide-vue-next';

const props = defineProps({
  persona: Object,
});

const emits = defineEmits(['abrir-modal-foto']);

const abrirModalFoto = () => {
  emits('abrir-modal-foto');
};

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
