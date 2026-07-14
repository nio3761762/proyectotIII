<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <DollarSign class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ esNueva ? 'Registrar' : 'Editar' }} Comisión</h2>
            <p class="text-orange-200 text-sm">{{ esNueva ? 'Define los datos de la nueva comisión' : 'Modifica los datos de la comisión' }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 overflow-y-auto flex-grow space-y-5">

        <!-- Nombre -->
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
            <Tag class="h-4 w-4 mr-2 text-orange-500" /> Nombre <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            v-model="form.nombre"
            @blur="validar('nombre')"
            @input="validar('nombre')"
            :class="inputClass('nombre')"
            placeholder="Ej: Comisión de Bolsa de Cuñape"
          />
          <p v-if="errores.nombre" class="err">{{ errores.nombre }}</p>
        </div>

        <!-- Selección de ProductoMedida (producto + presentación) -->
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
            <ShoppingBag class="h-4 w-4 mr-2 text-orange-500" /> Producto / Presentación <span class="text-red-500 ml-1">*</span>
          </label>
          <Combobox v-model="form.productomedida" @update:modelValue="validar('productomedida')">
            <div class="relative">
              <ComboboxInput
                class="w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-sm"
                :class="{ 'ring-2 ring-red-500/20 bg-red-50': errores.productomedida }"
                :displayValue="(pm) => pm ? displayPm(pm) : ''"
                @change="queryPm = $event.target.value"
                placeholder="Buscar producto..."
              />
              <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronUpDownIcon class="h-5 w-5 text-orange-500" />
              </ComboboxButton>
              <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryPm = ''">
                <ComboboxOptions class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5">
                  <div v-if="pmFiltrados.length === 0 && queryPm !== ''" class="px-4 py-3 text-gray-400 select-none">
                    No se encontraron resultados.
                  </div>
                  <ComboboxOption
                    v-for="pm in pmFiltrados"
                    :key="pm.idproductomedida"
                    :value="pm"
                    v-slot="{ selected, active }"
                  >
                    <li :class="[active ? 'bg-orange-500 text-white' : 'text-gray-700', 'cursor-default select-none py-2 pl-10 pr-4 relative']">
                      <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                        {{ displayPm(pm) }}
                      </span>
                      <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3">
                        <CheckIcon class="h-5 w-5" :class="active ? 'text-white' : 'text-orange-500'" />
                      </span>
                    </li>
                  </ComboboxOption>
                </ComboboxOptions>
              </TransitionRoot>
            </div>
          </Combobox>
          <p v-if="errores.productomedida" class="err">{{ errores.productomedida }}</p>

          <!-- Precio venta del producto medida seleccionado -->
          <div v-if="form.productomedida" class="mt-2 flex items-center gap-2 text-xs text-gray-500 px-1">
            <DollarSign class="h-3.5 w-3.5 text-green-500" />
            Precio venta: <strong class="text-green-600">Bs. {{ Number(form.productomedida.precioventa ?? form.productomedida.PrecioVenta ?? 0).toFixed(2) }}</strong>
          </div>
        </div>

        <!-- Cantidad -->
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
            <Hash class="h-4 w-4 mr-2 text-orange-500" /> Cantidad <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            v-model.number="form.cantidad"
            type="number"
            min="1"
            step="1"
            @blur="validar('cantidad')"
            @input="validar('cantidad')"
            :class="inputClass('cantidad')"
            placeholder="Ej: 1"
          />
          <p v-if="errores.cantidad" class="err">{{ errores.cantidad }}</p>
        </div>

        <!-- Monto de la comisión -->
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2 text-sm">
            <Coins class="h-4 w-4 mr-2 text-orange-500" /> Monto de Comisión (Bs.) <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            v-model.number="form.monto"
            type="number"
            min="0"
            step="0.01"
            @blur="validar('monto')"
            @input="validar('monto')"
            :class="inputClass('monto')"
            placeholder="Ej: 0.50"
          />
          <p v-if="errores.monto" class="err">{{ errores.monto }}</p>
        </div>

        <!-- Porcentaje calculado automáticamente (solo lectura) -->
        <div class="bg-orange-50/60 rounded-2xl p-4 space-y-1">
          <p class="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
            <TrendingUp class="h-3.5 w-3.5" /> Porcentaje calculado automáticamente
          </p>
          <p class="text-2xl font-bold text-orange-600">
            {{ porcentajeCalculado }}%
          </p>
          <p class="text-xs text-gray-400">
            Monto / (Cantidad × Precio Venta) × 100
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div class="bg-gray-50/80 p-5 flex gap-3 border-t border-gray-100 flex-shrink-0">
        <button
          @click="$emit('close')"
          class="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-600 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <X class="h-4 w-4" /> Cancelar
        </button>
        <button
          @click="guardar"
          :disabled="guardando"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60 text-white py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <LoaderCircle v-if="guardando" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          {{ guardando ? 'Guardando...' : (esNueva ? 'Registrar' : 'Actualizar') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { DollarSign, X, Tag, ShoppingBag, Hash, Coins, Save, LoaderCircle, TrendingUp } from 'lucide-vue-next';
import {
  Combobox, ComboboxInput, ComboboxButton,
  ComboboxOptions, ComboboxOption, TransitionRoot,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const props = defineProps({
  show:      { type: Boolean, required: true },
  comision:  { type: Object,  default: null  }, // null = nueva
  guardando: { type: Boolean, default: false },
  // Lista de productomedidas: [{ idproductomedida, precioventa, preciomayor, producto:{IdProducto,Nombre}, presentacion:{Nombre} }]
  productosMedidas: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'guardar']);

const esNueva = computed(() => !props.comision?.idcomision);

// ── Formulario ────────────────────────────────────────────────────────────────
const form = reactive({
  idcomision:     null,
  nombre:         '',
  productomedida: null, // objeto productomedida seleccionado
  cantidad:       1,
  monto:          null,
});

const errores = reactive({ nombre: '', productomedida: '', cantidad: '', monto: '' });
const queryPm = ref('');

// ── Inicializar ───────────────────────────────────────────────────────────────
const inicializar = () => {
  const c = props.comision;
  form.idcomision = null; form.nombre = ''; form.productomedida = null;
  form.cantidad = 1; form.monto = null;
  Object.keys(errores).forEach(k => errores[k] = '');

  if (!c) return;

  form.idcomision = c.idcomision;
  form.nombre     = c.nombre ?? '';
  form.cantidad   = Number(c.cantidad) || 1;
  form.monto      = Number(c.preciocomision) || null;

  // Buscar el productomedida correspondiente en la lista
  const idpm = c.Productomedida?.IdProductoMedida ?? c.idproductomedida;
  if (idpm) {
    form.productomedida = props.productosMedidas.find(
      pm => (pm.idproductomedida ?? pm.IdProductoMedida) === idpm
    ) ?? null;
  }
};

watch(() => [props.show, props.comision], ([v]) => { if (v) inicializar(); }, { immediate: true });

// ── Combobox filtrado ─────────────────────────────────────────────────────────
const pmFiltrados = computed(() => {
  const q = queryPm.value.toLowerCase().trim();
  if (!q) return props.productosMedidas;
  return props.productosMedidas.filter(pm => displayPm(pm).toLowerCase().includes(q));
});

const displayPm = (pm) => {
  if (!pm) return '';
  const prod = pm.producto?.Nombre ?? pm.producto?.nombre ?? pm.Producto?.Nombre ?? '';
  const pres = pm.presentacion?.Nombre ?? pm.presentacion?.nombre ?? pm.Presentacion?.Nombre ?? '';
  const precio = pm.precioventa ?? pm.PrecioVenta ?? '';
  return [prod, pres && `(${pres})`, precio && `Bs. ${Number(precio).toFixed(2)}`].filter(Boolean).join(' ');
};

// ── Porcentaje calculado ──────────────────────────────────────────────────────
const porcentajeCalculado = computed(() => {
  const precio = Number(form.productomedida?.precioventa ?? form.productomedida?.PrecioVenta ?? 0);
  if (!precio || !form.cantidad || !form.monto) return '0.00';
  return ((form.monto / (form.cantidad * precio)) * 100).toFixed(4);
});

// ── Validaciones ──────────────────────────────────────────────────────────────
const inputBase = 'w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-sm';
const inputClass = (campo) => errores[campo] ? `${inputBase} ring-2 ring-red-500/20 bg-red-50` : inputBase;

const validar = (campo) => {
  switch (campo) {
    case 'nombre':
      errores.nombre = !form.nombre?.trim() ? 'El nombre es requerido.' : '';
      break;
    case 'productomedida':
      errores.productomedida = !form.productomedida ? 'Selecciona un producto.' : '';
      break;
    case 'cantidad':
      errores.cantidad = (!form.cantidad && form.cantidad !== 0) || form.cantidad <= 0
        ? 'La cantidad debe ser mayor a 0.' : '';
      break;
    case 'monto':
      errores.monto = (!form.monto && form.monto !== 0) || form.monto <= 0
        ? 'El monto debe ser mayor a 0.' : '';
      break;
  }
};

const validarTodo = () => {
  ['nombre', 'productomedida', 'cantidad', 'monto'].forEach(validar);
  return Object.values(errores).every(e => !e);
};

// ── Guardar ───────────────────────────────────────────────────────────────────
const guardar = () => {
  if (!validarTodo()) return;

  const idpm = form.productomedida?.idproductomedida ?? form.productomedida?.IdProductoMedida;

  emit('guardar', {
    IdComision:  form.idcomision,
    Nombre:      form.nombre.trim(),
    IdProducto:  idpm,        // backend espera IdProducto = idproductomedida
    Cantidad:    form.cantidad,
    Preciocomision: form.monto,
    Porcentaje:  Number(porcentajeCalculado.value),
  });
};
</script>

<style scoped>
</style>
