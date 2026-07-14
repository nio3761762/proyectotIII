<template>
  <div
    class="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200"
  >
    <!-- Decoración hover -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <div class="relative p-6">

      <!-- Cabecera: avatar + nombre + badge estado -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
            <img v-if="persona.imagen" :src="persona.imagen" :alt="persona.nombre" class="w-12 h-12 object-cover" />
            <span v-else class="text-white font-bold text-lg">
              {{ persona.nombre?.charAt(0)?.toUpperCase() }}{{ persona.apellidopaterno?.charAt(0)?.toUpperCase() }}
            </span>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              {{ persona.nombre }} {{ persona.apellidopaterno }}
            </h3>
            <p class="text-gray-500 text-sm">{{ persona.apellidomaterno }}</p>
          </div>
        </div>

        <!-- Badge: estado según modo -->
        <span :class="['px-3 py-1 rounded-xl text-white text-xs font-medium flex-shrink-0', badgeClass]">
          {{ badgeLabel }}
        </span>
      </div>

      <!-- Info base -->
      <div class="space-y-2 mb-4 p-3 bg-gray-50/80 rounded-2xl">

        <!-- CI -->
        <div v-if="persona.documento?.length" class="flex items-center gap-2 text-sm text-gray-600">
          <IdCard class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span>
            CI: {{ persona.documento[0].documento }}
            <span v-if="persona.documento[0].complemento" class="text-gray-400">
              ({{ persona.documento[0].complemento.descripcion }})
            </span>
          </span>
        </div>

        <!-- Celulares -->
        <div v-if="persona.celulares?.length" class="flex items-center gap-2 text-sm text-gray-600">
          <Smartphone class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span>{{ persona.celulares.map(c => c.numero).join(' / ') }}</span>
        </div>

        <!-- Barrio -->
        <div v-if="persona.direccion?.barrio" class="flex items-center gap-2 text-sm text-gray-600">
          <MapPin class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span>{{"B. " +persona.direccion.barrio.nombre }}, {{ persona.direccion.direccion ? persona.direccion.direccion : '' }}</span>
        </div>

        <!-- Fecha nacimiento -->
        <div v-if="persona.fechadenacimiento" class="flex items-center gap-2 text-sm text-gray-600">
          <Calendar class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span>{{ formatFecha(persona.fechadenacimiento) }}</span>
        </div>

        <!-- Email -->
        <div v-if="persona.email" class="flex items-center gap-2 text-sm text-gray-600">
          <Mail class="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span class="truncate">{{ persona.email }}</span>
        </div>

        <!-- Info extra modo USUARIO -->
        <template v-if="modo === 'usuario' && persona.usuario">
          <div class="border-t border-gray-200 pt-2 mt-2 space-y-1">
            <div class="flex items-center gap-2 text-sm text-purple-600 font-medium">
              <UserCog class="h-4 w-4 flex-shrink-0" />
              <span>Usuario asignado</span>
            </div>
            <div v-if="persona.usuario.roles?.length" class="flex flex-wrap gap-1 pl-6">
              <span
                v-for="rol in persona.usuario.roles"
                :key="rol.idrol"
                class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
              >
                {{ rol.nombre }}
              </span>
            </div>
          </div>
        </template>

        <!-- Info extra modo PROVEEDOR -->
        <template v-if="modo === 'proveedor' && persona.proveedor">
          <div class="border-t border-gray-200 pt-2 mt-2">
            <div class="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <Truck class="h-4 w-4 flex-shrink-0" />
              <span>{{ persona.proveedor.nombre ?? 'Proveedor asignado' }}</span>
            </div>
            <div v-if="persona.proveedor.tipoproveedor" class="pl-6 text-xs text-gray-500">
              {{ persona.proveedor.tipoproveedor.nombre }}
            </div>
          </div>
        </template>

        <!-- Info extra modo EMPLEADO -->
        <template v-if="modo === 'empleado' && persona.empleado">
          <div class="border-t border-gray-200 pt-2 mt-2 space-y-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <Briefcase class="h-4 w-4 flex-shrink-0" />
                <span>Empleado asignado</span>
              </div>
              <div class="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200">
                Bs. {{ persona?.empleado?.salario?.monto 
  ? Number(persona.empleado.salario.monto).toFixed(2) 
  : '0.00' }}
              </div>

            </div>
            <div v-if="persona.empleado.sucursal" class="flex items-center gap-2 text-xs text-gray-500 pl-6">
              <MapPin class="h-3 w-3" />
              <span>{{ persona.empleado.sucursal.nombre }}</span>
            </div>
            <div v-if="persona.empleado.cargos?.length" class="flex flex-wrap gap-1 pl-6 mt-1">
              <span
                v-for="cargo in persona.empleado.cargos"
                :key="cargo.idcargo"
                class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase border border-blue-100"
              >
                {{ cargo.nombre }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- Acciones: una sola fila -->
      <div class="flex gap-2">
        <button
          @click="$emit('editar', persona)"
          class="h-9 px-3 flex-shrink-0 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 rounded-2xl text-sm transition-all duration-200 flex items-center gap-1"
        >
          <Pencil class="h-3.5 w-3.5" />
          Editar
        </button>

        <!-- Toggle estado persona -->
        <button
          @click="$emit('toggleEstado', persona)"
          :class="[
            'w-9 h-9 flex-shrink-0 rounded-2xl transition-all duration-200 flex items-center justify-center',
            persona.estado === 1
              ? 'border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500'
              : 'border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600'
          ]"
          :title="persona.estado === 1 ? 'Desactivar' : 'Activar'"
        >
          <ToggleLeft v-if="persona.estado !== 1" class="h-4 w-4" />
          <ToggleRight v-else class="h-4 w-4" />
        </button>

        <!-- Foto -->
        <button
          @click="$emit('foto', persona)"
          class="w-9 h-9 flex-shrink-0 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-500 rounded-2xl transition-all duration-200 flex items-center justify-center"
          title="Actualizar foto"
        >
          <Camera class="h-4 w-4" />
        </button>

        <!-- Asignar usuario: deshabilitado si ya tiene proveedor -->
        <button
          @click="$emit('asignarUsuario', persona)"
          :disabled="!!persona.proveedor"
          :class="[
            'w-9 h-9 flex-shrink-0 rounded-2xl transition-all duration-200 flex items-center justify-center',
            persona.proveedor
              ? 'border border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-600'
          ]"
          :title="persona.proveedor ? 'Ya tiene proveedor asignado' : 'Asignar usuario'"
        >
          <UserCog class="h-4 w-4" />
        </button>

        <!-- Asignar proveedor: deshabilitado si ya tiene usuario -->
        <button
          @click="$emit('asignarProveedor', persona)"
          :disabled="!!persona.usuario"
          :class="[
            'w-9 h-9 flex-shrink-0 rounded-2xl transition-all duration-200 flex items-center justify-center',
            persona.usuario
              ? 'border border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-600'
          ]"
          :title="persona.usuario ? 'Ya tiene usuario asignado' : 'Asignar proveedor'"
        >
          <Truck class="h-4 w-4" />
        </button>

        <!-- Asignar empleado -->
        <button
          @click="$emit('asignarEmpleado', persona)"
          :disabled="!!persona.proveedor"
          :class="[
            'w-9 h-9 flex-shrink-0 rounded-2xl transition-all duration-200 flex items-center justify-center',
            persona.proveedor
              ? 'border border-gray-200 text-gray-300 cursor-not-allowed'
              : ' border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all duration-200 flex items-center justify-center'
          ]"
           title="Asignar empleado"
        >
          <Briefcase class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  IdCard, Smartphone, MapPin, Calendar, Mail,
  Pencil, ToggleLeft, ToggleRight, Camera, UserCog, Truck, Briefcase
} from 'lucide-vue-next';

const props = defineProps({
  persona: { type: Object, required: true },
  // 'general' | 'usuario' | 'proveedor' | 'empleado'
  modo:    { type: String, default: 'general' },
});

defineEmits(['editar', 'toggleEstado', 'foto', 'asignarUsuario', 'asignarProveedor', 'asignarEmpleado']);

// Badge dinámico según modo
const badgeClass = computed(() => {
  if (props.modo === 'usuario') {
    const activo = props.persona.usuario?.estado === 1;
    return activo
      ? 'bg-gradient-to-r from-purple-500 to-violet-600'
      : 'bg-gradient-to-r from-gray-400 to-gray-500';
  }
  if (props.modo === 'proveedor') {
    const activo = props.persona.proveedor?.estado === 1;
    return activo
      ? 'bg-gradient-to-r from-emerald-500 to-green-600'
      : 'bg-gradient-to-r from-gray-400 to-gray-500';
  }
  if (props.modo === 'empleado') {
    const activo = props.persona.empleado?.estado === 1;
    return activo
      ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
      : 'bg-gradient-to-r from-gray-400 to-gray-500';
  }
  // general: estado de la persona
  return props.persona.estado === 1
    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
    : 'bg-gradient-to-r from-gray-400 to-gray-500';
});

const badgeLabel = computed(() => {
  if (props.modo === 'usuario') {
    if (!props.persona.usuario) return 'Sin usuario';
    return props.persona.usuario.estado === 1 ? 'Activo' : 'Inactivo';
  }
  if (props.modo === 'proveedor') {
    if (!props.persona.proveedor) return 'Sin proveedor';
    return props.persona.proveedor.estado === 1 ? 'Activo' : 'Inactivo';
  }
  if (props.modo === 'empleado') {
    if (!props.persona.empleado) return 'Sin empleado';
    return props.persona.empleado.estado === 1 ? 'Activo' : 'Inactivo';
  }
  return props.persona.estado === 1 ? 'Activo' : 'Inactivo';
});

const formatFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};
</script>