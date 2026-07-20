<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-gradient-to-r from-orange-50 to-red-50 text-gray-600 text-xs sm:text-sm uppercase tracking-wider">
            <th class="px-3 sm:px-6 py-3 sm:py-4 font-black">Persona</th>
            <th class="px-3 sm:px-6 py-3 sm:py-4 font-black hidden sm:table-cell">Documento</th>
            <th class="px-3 sm:px-6 py-3 sm:py-4 font-black hidden sm:table-cell">Contacto</th>
            <th class="px-3 sm:px-6 py-3 sm:py-4 font-black">
              <span v-if="modo === 'usuario'">Roles</span>
              <span v-else-if="modo === 'proveedor'">Tipo</span>
              <span v-else-if="modo === 'empleado'">Cargo</span>
              <span v-else>Info</span>
            </th>
            <th class="px-3 sm:px-6 py-3 sm:py-4 font-black">Estado</th>
            <th class="px-3 sm:px-6 py-3 sm:py-4 font-black text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <template v-for="persona in personas" :key="persona.idpersona">
            <tr
              :class="['hover:bg-orange-50/30 transition-colors group', persona.estado === 0 && modo === 'general' ? 'opacity-60' : '']"
            >
              <td class="px-3 sm:px-6 py-3 sm:py-4">
                <div class="flex items-center gap-2 sm:gap-3">
                  <div class="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                    <img
                      v-if="persona.imagen"
                      :src="persona.imagen"
                      class="w-full h-full object-cover"
                      alt=""
                    />
                    <span v-else class="text-xs sm:text-sm">{{ (persona.nombre || '?')[0] }}{{ (persona.apellidopaterno || '')[0] }}</span>
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="font-bold text-gray-800 text-xs sm:text-sm truncate">
                      {{ persona.nombre }} {{ persona.apellidopaterno }}
                    </span>
                    <span class="text-[10px] sm:text-xs text-gray-500 truncate">{{ persona.email || 'Sin email' }}</span>
                  </div>
                </div>
              </td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-700 text-xs sm:text-sm">
                    {{ persona.documento?.[0]?.documento || '-' }}
                  </span>
                  <span v-if="persona.documento?.[0]?.complemento" class="text-[10px] sm:text-xs text-gray-400">
                    {{ persona.documento[0].complemento.descripcion }}
                  </span>
                </div>
              </td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                <div class="flex flex-col">
                  <span class="text-xs sm:text-sm text-gray-700 truncate max-w-[120px]">
                    {{ persona.celulares?.map(c => c.numero).join(', ') || '-' }}
                  </span>
                  <span class="text-[10px] sm:text-xs text-gray-400">
                    {{ formatFecha(persona.fechadenacimiento) }}
                  </span>
                </div>
              </td>
              <td class="px-3 sm:px-6 py-3 sm:py-4">
                <!-- General: Dirección -->
                <template v-if="modo === 'general'">
                  <span class="text-sm text-gray-700">
                    {{ persona.direccion?.barrio?.nombre  ? 'B. ' + persona.direccion.barrio.nombre + ', ' + persona.direccion.direccion : persona?.direccion?.direccion? persona.direccion.direccion : 'Sin dirección' }}
                  </span>
                </template>
                <!-- Usuario: Roles -->
                <template v-else-if="modo === 'usuario' && persona.usuario">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="rol in persona.usuario.roles"
                      :key="rol.idrol"
                      class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
                    >
                      {{ rol.nombre }}
                    </span>
                    <span v-if="!persona.usuario.roles?.length" class="text-xs text-gray-400">Sin roles</span>
                  </div>
                </template>
                <!-- Proveedor: Tipo -->
                <template v-else-if="modo === 'proveedor' && persona.proveedor">
                  <span class="text-sm font-medium text-emerald-600">
                    {{ persona.proveedor.tipoproveedor?.nombre || 'S/T' }}
                  </span>
                </template>
                <!-- Empleado: Cargo / Salario -->
                <template v-else-if="modo === 'empleado' && persona.empleado">
                  <div class="flex flex-col">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="cargo in persona.empleado.cargos"
                        :key="cargo.idcargo"
                        class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase border border-blue-100"
                      >
                        {{ cargo.nombre }}
                      </span>
                    </div>
                    <span class="text-xs font-bold text-gray-600 mt-1">
                      Bs. {{ persona.empleado.salario?.monto ? Number(persona.empleado.salario.monto).toFixed(2) : '0.00' }}
                    </span>
                  </div>
                </template>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>
              <td class="px-3 sm:px-6 py-3 sm:py-4">
                <span :class="['px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase whitespace-nowrap', badgeClass(persona)]">
                  {{ badgeLabel(persona) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 text-right">
                <div class="flex justify-end gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 group-hover:sm:opacity-100 transition-opacity">
                  <button
                    @click.stop="toggleRow(persona.idpersona)"
                    class="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                    :title="expandedRows[persona.idpersona] ? 'Ocultar detalles' : 'Ver detalles'"
                  >
                    <ChevronDown :class="['h-4 w-4 transition-transform', { 'rotate-180': expandedRows[persona.idpersona] }]" />
                  </button>
                  <button
                    @click.stop="$emit('editar', persona)"
                    class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    title="Editar"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    @click.stop="$emit('toggleEstado', persona)"
                    :class="['p-2 rounded-xl transition-all shadow-sm',
                      persona.estado === 1
                        ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                        : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white']"
                    :title="persona.estado === 1 ? 'Desactivar' : 'Activar'"
                  >
                    <ToggleRight v-if="persona.estado === 1" class="h-4 w-4" />
                    <ToggleLeft v-else class="h-4 w-4" />
                  </button>
                  <button
                    @click.stop="$emit('foto', persona)"
                    class="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    title="Actualizar foto"
                  >
                    <Camera class="h-4 w-4" />
                  </button>
                  <button
                    v-if="!persona.proveedor"
                    @click.stop="$emit('asignarUsuario', persona)"
                    class="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-500 hover:text-white transition-all shadow-sm"
                    title="Asignar usuario"
                  >
                    <UserCog class="h-4 w-4" />
                  </button>
                  <button
                    v-if="!persona.usuario"
                    @click.stop="$emit('asignarProveedor', persona)"
                    class="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    title="Asignar proveedor"
                  >
                    <Truck class="h-4 w-4" />
                  </button>
                  <button
                    v-if="!persona.proveedor"
                    @click.stop="$emit('asignarEmpleado', persona)"
                    class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    title="Asignar empleado"
                  >
                    <Briefcase class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <!-- Expanded Detail Row -->
            <tr v-if="expandedRows[persona.idpersona]">
              <td colspan="6" class="p-0">
                <div class="bg-gray-50/50 p-3 sm:p-6 sm:pl-16 border-t border-gray-100">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div class="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                      <p class="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Dirección</p>
                      <p class="text-xs sm:text-sm text-gray-700">
                        {{ persona.direccion?.barrio?.nombre ? 'B. ' + persona.direccion.barrio.nombre : 'Sin dirección' }}
                      </p>
                      <p v-if="persona.direccion?.direccion" class="text-[11px] sm:text-xs text-gray-500 mt-1">
                        {{ persona.direccion.direccion }}
                      </p>
                    </div>
                    <div class="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                      <p class="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Fecha de Nacimiento</p>
                      <p class="text-xs sm:text-sm text-gray-700">{{ formatFecha(persona.fechadenacimiento) || '-' }}</p>
                    </div>
                    <div class="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                      <p class="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Celulares</p>
                      <p class="text-xs sm:text-sm text-gray-700">
                        {{ persona.celulares?.map(c => c.numero).join(', ') || 'Sin celular' }}
                      </p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div v-if="personas.length === 0" class="p-10 text-center text-sm text-gray-400 font-medium">
      No hay personas para mostrar
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ChevronDown, X, Pencil, Camera, UserCog, Truck, Briefcase, ToggleLeft, ToggleRight } from 'lucide-vue-next';

const props = defineProps({
  personas: { type: Array, required: true },
  modo: { type: String, default: 'general' }
});

defineEmits(['editar', 'toggleEstado', 'foto', 'asignarUsuario', 'asignarProveedor', 'asignarEmpleado']);

const expandedRows = ref({});

const toggleRow = (id) => {
  expandedRows.value[id] = !expandedRows.value[id];
};

const badgeClass = (persona) => {
  if (props.modo === 'usuario') {
    return persona.usuario?.estado === 1
      ? 'bg-purple-100 text-purple-700'
      : 'bg-gray-100 text-gray-500';
  }
  if (props.modo === 'proveedor') {
    return persona.proveedor?.estado === 1
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-gray-100 text-gray-500';
  }
  if (props.modo === 'empleado') {
    return persona.empleado?.estado === 1
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-500';
  }
  return persona.estado === 1
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-500';
};

const badgeLabel = (persona) => {
  if (props.modo === 'usuario') {
    if (!persona.usuario) return 'Sin usuario';
    return persona.usuario.estado === 1 ? 'Activo' : 'Inactivo';
  }
  if (props.modo === 'proveedor') {
    if (!persona.proveedor) return 'Sin proveedor';
    return persona.proveedor.estado === 1 ? 'Activo' : 'Inactivo';
  }
  if (props.modo === 'empleado') {
    if (!persona.empleado) return 'Sin empleado';
    return persona.empleado.estado === 1 ? 'Activo' : 'Inactivo';
  }
  return persona.estado === 1 ? 'Activo' : 'Inactivo';
};

const formatFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};
</script>
