<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    @click.self="$emit('cancelar')"
  >
    <div class="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">
      <div class="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 sm:p-6">
        <div class="flex items-start sm:items-center justify-between gap-4">
          <div class="min-w-0">
            <h2 class="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              {{ esEdicion ? 'Actualizar Roles' : 'Crear Usuario y Roles' }}
            </h2>
            <p class="text-purple-100 text-xs sm:text-sm mt-1 truncate">
              {{ nombrePersona }}
            </p>
          </div>
          <button @click="$emit('cancelar')" class="text-white hover:text-purple-100 transition-colors shrink-0">
            <X class="h-5 sm:h-6 w-5 sm:w-6" />
          </button>
        </div>
      </div>

      <div class="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[85vh] overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Persona</label>
            <input :value="nombrePersona" readonly class="w-full border-gray-200 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 cursor-not-allowed text-sm" />
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Email</label>
            <input :value="emailPersona || 'Sin email registrado'" readonly class="w-full border-gray-200 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 cursor-not-allowed text-sm" />
          </div>
        </div>

        <div v-if="!esEdicion" class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Contraseña</label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
              <input
                v-model="form.contrasena"
                type="password"
                placeholder="Ingrese la contraseña"
                class="w-full pl-12 pr-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <p v-if="errores.contrasena" class="text-red-500 text-xs italic mt-1">{{ errores.contrasena }}</p>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Repetir contraseña</label>
            <div class="relative">
              <ShieldCheck class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
              <input
                v-model="form.confirmarContrasena"
                type="password"
                placeholder="Repita la contraseña"
                class="w-full pl-12 pr-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <p v-if="errores.confirmarContrasena" class="text-red-500 text-xs italic mt-1">{{ errores.confirmarContrasena }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-gray-50/80 rounded-3xl p-5 border border-gray-100">
            <div class="flex items-center gap-2 mb-4">
              <BadgeCheck class="h-5 w-5 text-emerald-600" />
              <h3 class="text-lg font-bold text-gray-800">Roles Asignados</h3>
            </div>

            <div v-if="cargandoRoles" class="py-10 text-center text-gray-500">
              Cargando roles asignados...
            </div>

            <div v-else-if="rolesAsignadosNormalizados.length" class="flex flex-wrap gap-2">
              <button
                v-for="rol in rolesAsignadosNormalizados"
                :key="rol.id"
                type="button"
                @click="toggleRolAsignado(rol.id)"
                :class="[
                  'px-3 py-2 rounded-2xl text-sm font-medium transition-all border',
                  form.rolesAEliminar.includes(rol.id)
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                ]"
              >
                {{ rol.nombre }}
              </button>
            </div>

            <div v-else class="py-10 text-center text-gray-400 text-sm">
              No tiene roles asignados todavía.
            </div>

            <p class="text-xs text-gray-500 mt-3">
              Haz clic en un rol asignado para marcarlo como desasignado.
            </p>
          </div>

          <div class="bg-gray-50/80 rounded-3xl p-5 border border-gray-100">
            <div class="flex items-center gap-2 mb-4">
              <ListChecks class="h-5 w-5 text-purple-600" />
              <h3 class="text-lg font-bold text-gray-800">Roles Disponibles</h3>
            </div>

            <div v-if="cargandoRoles" class="py-10 text-center text-gray-500">
              Cargando roles disponibles...
            </div>

            <div v-else-if="rolesDisponibles.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="rol in rolesDisponibles"
                :key="rol.id"
                type="button"
                @click="toggleRol(rol.id)"
                :class="[
                  'px-4 py-3 rounded-2xl border-2 transition-all duration-300 font-medium text-sm text-left',
                  form.rolesSeleccionados.includes(rol.id)
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white border-purple-500 shadow-lg'
                    : 'border-purple-200 text-purple-600 hover:border-purple-300 hover:bg-purple-50'
                ]"
              >
                {{ rol.nombre }}
              </button>
            </div>

            <div v-else class="py-10 text-center text-gray-400 text-sm">
              No hay más roles disponibles para asignar.
            </div>

            <p v-if="errores.roles" class="text-red-500 text-xs italic mt-3">{{ errores.roles }}</p>
          </div>
        </div>

        <div v-if="form.rolesSeleccionados.length || rolesAEliminarDetalle.length" class="bg-purple-50 border border-purple-100 rounded-2xl p-4 space-y-3">
          <p class="text-sm font-semibold text-purple-700">Cambios listos para guardar</p>
          <div v-if="form.rolesSeleccionados.length">
            <p class="text-xs font-medium text-purple-600 mb-2">Roles a asignar</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="rol in rolesSeleccionadosDetalle"
                :key="rol.id"
                class="px-3 py-1.5 bg-white text-purple-700 rounded-xl text-sm border border-purple-200"
              >
                {{ rol.nombre }}
              </span>
            </div>
          </div>
          <div v-if="rolesAEliminarDetalle.length">
            <p class="text-xs font-medium text-red-600 mb-2">Roles a desasignar</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="rol in rolesAEliminarDetalle"
                :key="rol.id"
                class="px-3 py-1.5 bg-white text-red-700 rounded-xl text-sm border border-red-200"
              >
                {{ rol.nombre }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200">
          <button
            @click="$emit('cancelar')"
            class="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <X class="h-4 w-4" />
            Cancelar
          </button>
          <button
            @click="emitirGuardar"
            :disabled="guardando || !puedeGuardar"
            class="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-0 sm:min-w-44 text-sm"
          >
            <LoaderCircle v-if="guardando" class="animate-spin h-4 w-4" />
            <Save v-else class="h-4 w-4" />
            {{ guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { X, Save, LoaderCircle, Lock, ShieldCheck, BadgeCheck, ListChecks } from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  persona: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
  cargandoRoles: { type: Boolean, default: false },
  roles: { type: Array, default: () => [] },
  rolesAsignados: { type: Array, default: () => [] },
});

const emit = defineEmits(['guardar', 'cancelar']);

const form = reactive({
  contrasena: '',
  confirmarContrasena: '',
  rolesSeleccionados: [],
  rolesAEliminar: [],
});

const errores = reactive({
  contrasena: '',
  confirmarContrasena: '',
  roles: '',
});

const normalizarRol = (rol) => ({
  id: rol?.IdRol ?? rol?.idrol ?? rol?.id ?? '',
  nombre: rol?.Nombre ?? rol?.nombre ?? '',
});

const idUsuarioActual = computed(() =>
  props.persona?.usuario?.idusuario
  ?? props.persona?.usuario?.IdUsuario
  ?? props.persona?.IdUsuario
  ?? ''
);

const idPersonaActual = computed(() =>
  props.persona?.idpersona
  ?? props.persona?.IdPersona
  ?? ''
);

const nombrePersona = computed(() => {
  if (!props.persona) return '';
  return [
    props.persona.nombre ?? props.persona.Nombre ?? '',
    props.persona.apellidopaterno ?? props.persona.ApellidoPaterno ?? '',
    props.persona.apellidomaterno ?? props.persona.ApellidoMaterno ?? '',
  ].filter(Boolean).join(' ');
});

const emailPersona = computed(() =>
  props.persona?.email
  ?? props.persona?.Email
  ?? props.persona?.correo
  ?? ''
);

const esEdicion = computed(() => Boolean(idUsuarioActual.value));

const rolesAsignadosNormalizados = computed(() =>
  (props.rolesAsignados ?? [])
    .map(normalizarRol)
    .filter((rol) => rol.id)
);

const rolesDisponibles = computed(() => {
  const asignadosIds = new Set(rolesAsignadosNormalizados.value.map((rol) => rol.id));
  return (props.roles ?? [])
    .map(normalizarRol)
    .filter((rol) => rol.id && rol.id !== 'ROL-0' && !asignadosIds.has(rol.id));
});

const rolesSeleccionadosDetalle = computed(() => {
  const seleccionados = new Set(form.rolesSeleccionados);
  return rolesDisponibles.value.filter((rol) => seleccionados.has(rol.id));
});

const rolesAEliminarDetalle = computed(() => {
  const ids = new Set(form.rolesAEliminar);
  return rolesAsignadosNormalizados.value.filter((rol) => ids.has(rol.id));
});

const puedeGuardar = computed(() => {
  if (props.cargandoRoles) return false;
  if (!form.rolesSeleccionados.length && !form.rolesAEliminar.length) return false;
  if (esEdicion.value) return true;
  return Boolean(form.contrasena && form.confirmarContrasena);
});

const limpiarFormulario = () => {
  form.contrasena = '';
  form.confirmarContrasena = '';
  form.rolesSeleccionados = [];
  form.rolesAEliminar = [];
  errores.contrasena = '';
  errores.confirmarContrasena = '';
  errores.roles = '';
};

const toggleRol = (idRol) => {
  errores.roles = '';
  if (form.rolesSeleccionados.includes(idRol)) {
    form.rolesSeleccionados = form.rolesSeleccionados.filter((id) => id !== idRol);
    return;
  }
  form.rolesSeleccionados = [...form.rolesSeleccionados, idRol];
};

const toggleRolAsignado = (idRol) => {
  if (form.rolesAEliminar.includes(idRol)) {
    form.rolesAEliminar = form.rolesAEliminar.filter((id) => id !== idRol);
    return;
  }
  form.rolesAEliminar = [...form.rolesAEliminar, idRol];
};

const validar = () => {
  errores.contrasena = '';
  errores.confirmarContrasena = '';
  errores.roles = '';

  if (!esEdicion.value) {
    if (!form.contrasena) {
      errores.contrasena = 'La contraseña es requerida.';
    } else if (form.contrasena.length < 6) {
      errores.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!form.confirmarContrasena) {
      errores.confirmarContrasena = 'Debe repetir la contraseña.';
    } else if (form.confirmarContrasena !== form.contrasena) {
      errores.confirmarContrasena = 'Las contraseñas no coinciden.';
    }
  }

  if (!form.rolesSeleccionados.length && !form.rolesAEliminar.length) {
    errores.roles = 'Seleccione al menos un cambio en los roles.';
  }

  return !errores.contrasena && !errores.confirmarContrasena && !errores.roles;
};

const emitirGuardar = () => {
  if (!validar()) return;

  emit('guardar', {
    IdUsuario: idUsuarioActual.value || null,
    IdPersona: idPersonaActual.value || null,
    Contrasena: form.contrasena,
    Roles: [...form.rolesSeleccionados],
    RolesAEliminar: [...form.rolesAEliminar],
  });
};

watch(() => props.show, (visible) => {
  if (visible) limpiarFormulario();
});

watch(() => props.persona, () => {
  limpiarFormulario();
});
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.25);
  border-radius: 9999px;
}
</style>
