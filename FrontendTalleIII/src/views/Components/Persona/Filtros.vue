<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 space-y-4 sm:space-y-5">
    <div class="flex flex-wrap gap-2 sm:gap-3 items-end">

      <!-- Búsqueda -->
      <div class="flex-1 min-w-[140px] sm:min-w-[180px] w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Buscar</label>
        <div class="relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-hover:text-orange-500 transition-colors pointer-events-none" />
          <input
            :value="search"
            @input="$emit('update:search', $event.target.value)"
            placeholder="Buscar..."
            class="w-full pl-9 pr-4 py-2 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-gray-700 placeholder:text-gray-400 outline-none text-sm"
          /> 
        </div>
      </div>

      <div class="hidden sm:block w-px h-9 bg-gray-200 self-end mb-0.5"></div>

      <!-- Estado -->
      <div>
        <label class="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Estado</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-0.5 sm:p-1 gap-0.5 sm:gap-1">
          <button
            v-for="op in estadoOpciones" :key="op.value"
            @click="$emit('update:estado', op.value)"
            :class="['px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-1 sm:gap-1.5',
              estado === op.value ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >
            <div :class="['w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full', op.color]"></div>
            {{ op.label }}
          </button>
        </div>
      </div>

      <div class="hidden sm:block w-px h-9 bg-gray-200 self-end mb-0.5"></div>

      <!-- Tipo de persona -->
      <div>
        <label class="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Tipo</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-0.5 sm:p-1 gap-0.5 sm:gap-1">
          <button
            v-for="op in tipoOpciones" :key="op.value"
            @click="onTipoChange(op.value)"
            :class="['px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-1 sm:gap-1.5',
              tipo === op.value ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >
            <component :is="op.icon" class="h-3 sm:h-3.5 w-3 sm:w-3.5" />
            {{ op.label }}
          </button>
        </div>
      </div>

      <!-- Rol (solo si tipo === 'usuario') -->
      <Transition name="slide-down">
        <div v-if="tipo === 'usuario'" class="w-full sm:w-auto">
          <label class="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Rol</label>
          <select
            :value="rol"
            @change="$emit('update:rol', $event.target.value)"
            class="w-full sm:w-auto py-2 px-2.5 sm:py-2.5 sm:px-3 border-0 shadow-md bg-gray-50/80 rounded-2xl text-xs sm:text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
          >
            <option value="">Todos los roles</option>
            <option v-for="r in roles" :key="r.idrol" :value="r.idrol">{{ r.nombre }}</option>
          </select>
        </div>
      </Transition>

      <!-- Tipo proveedor (solo si tipo === 'proveedor') -->
      <Transition name="slide-down">
        <div v-if="tipo === 'proveedor'" class="w-full sm:w-auto">
          <label class="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Tipo proveedor</label>
          <select
            :value="tipoProveedor"
            @change="$emit('update:tipoProveedor', $event.target.value)"
            class="w-full sm:w-auto py-2 px-2.5 sm:py-2.5 sm:px-3 border-0 shadow-md bg-gray-50/80 rounded-2xl text-xs sm:text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
          >
            <option value="">Todos los tipos</option>
            <option v-for="tp in tiposProveedor" :key="tp.idtipoproveedor" :value="tp.idtipoproveedor">{{ tp.nombre }}</option>
          </select>
        </div>
      </Transition>

      <!-- Cargo (solo si tipo === 'empleado') -->
      <Transition name="slide-down">
        <div v-if="tipo === 'empleado'" class="w-full sm:w-auto">
          <label class="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Cargo</label>
          <select
            :value="idCargo"
            @change="$emit('update:idCargo', $event.target.value)"
            class="w-full sm:w-auto py-2 px-2.5 sm:py-2.5 sm:px-3 border-0 shadow-md bg-gray-50/80 rounded-2xl text-xs sm:text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="">Todos los cargos</option>
            <option v-for="c in cargos" :key="c.idcargo" :value="c.idcargo">{{ c.nombre }}</option>
          </select>
        </div>
      </Transition>

      <div class="hidden sm:block w-px h-9 bg-gray-200 self-end mb-0.5"></div>

      <!-- Por página -->
      <div>
        <label class="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Pág.</label>
        <div class="flex rounded-2xl bg-gray-100/80 p-0.5 sm:p-1 gap-0.5 sm:gap-1">
          <button
            v-for="op in limiteOpciones" :key="op"
            @click="$emit('update:limite', op)"
            :class="['min-w-[28px] sm:min-w-[36px] px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-sm font-medium rounded-xl transition-all duration-200',
              limite === op ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
          >
            {{ op }}
          </button>
        </div>
      </div>

      <!-- Toggle Vista -->
      <div class="flex flex-col">
        <label class="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Vista</label>
        <div class="flex bg-gray-100/80 p-0.5 sm:p-1 rounded-2xl shadow-inner gap-0.5 sm:gap-1">
          <button 
            @click="$emit('update:viewMode', 'cards')"
            :class="['p-1.5 sm:p-2 rounded-xl transition-all duration-300', viewMode === 'cards' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
            title="Vista en Tarjetas"
          >
            <LayoutGrid class="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          </button>
          <button 
            @click="$emit('update:viewMode', 'table')"
            :class="['p-1.5 sm:p-2 rounded-xl transition-all duration-300', viewMode === 'table' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
            title="Vista en Tabla"
          >
            <List class="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          </button>
        </div>
      </div>

      <!-- Slot acciones -->
      <div class="ml-auto self-end w-full sm:w-auto">
        <slot name="acciones" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { Search, Users, UserCog, Truck, Briefcase, LayoutGrid, List } from 'lucide-vue-next';

defineProps({
  search:        { type: String, default: ''        },
  estado:        { type: String, default: '-1'      },
  tipo:          { type: String, default: 'general' },
  rol:           { type: String, default: ''        },
  tipoProveedor: { type: String, default: ''        },
  idCargo:       { type: String, default: ''        },
  limite:        { type: Number, default: 8         },
  viewMode:      { type: String, default: 'cards'   },
  roles:         { type: Array,  default: () => []  }, // [{ idrol, nombre }]
  tiposProveedor:{ type: Array,  default: () => []  }, // [{ idtipoproveedor, nombre }]
  cargos:        { type: Array,  default: () => []  }, // [{ idcargo, nombre }]
});

const emit = defineEmits([
  'update:search', 'update:estado', 'update:tipo',
  'update:rol', 'update:tipoProveedor', 'update:idCargo', 'update:limite',
  'update:viewMode',
]);

const estadoOpciones = [
  { value: '-1', label: 'Todos',     color: 'bg-gray-400'  },
  { value: '1',  label: 'Activos',   color: 'bg-green-500' },
  { value: '0',  label: 'Inactivos', color: 'bg-red-400'   },
];

const tipoOpciones = [
  { value: 'general',   label: 'General',   icon: Users   },
  { value: 'usuario',   label: 'Usuario',   icon: UserCog },
  { value: 'proveedor', label: 'Proveedor', icon: Truck   },
  { value: 'empleado',  label: 'Empleado',  icon: Briefcase },
];

const limiteOpciones = [5, 8, 12, 20];

const onTipoChange = (val) => {
  emit('update:tipo', val);
  emit('update:rol', '');
  emit('update:tipoProveedor', '');
  emit('update:idCargo', '');
};
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(-6px); }
</style>