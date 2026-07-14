<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-amber-500 rounded-xl shadow-lg">
              <Flame class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">Gestionar Hornos</h2>
              <p class="text-sm text-gray-500">{{ sucursal?.nombre }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-white rounded-full transition-colors">
            <X class="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
            <p class="text-gray-500">Cargando hornos...</p>
          </div>

          <div v-else>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-700">Lista de Hornos</h3>
              <button 
                @click="agregarNuevoHorno"
                class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <Plus class="h-4 w-4" /> Agregar Horno
              </button>
            </div>

            <div v-if="hornos.length === 0" class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p class="text-gray-400">No hay hornos registrados para esta sucursal.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                v-for="(horno, index) in hornos" 
                :key="index" 
                :class="['bg-white border rounded-2xl p-5 shadow-sm transition-all relative group overflow-hidden', 
                  horno.Idestado === 0 ? 'bg-gray-50 border-gray-200 opacity-75' : 'border-gray-100 hover:shadow-md']"
              >
                <!-- Badge Estado -->
                <div class="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl" 
                  :class="horno.Idestado === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                  {{ horno.Idestado === 1 ? 'Activo' : 'Desactivado' }}
                </div>

                <div class="flex gap-4">
                  <!-- Foto del Horno -->
                  <div class="w-32 h-32 flex-shrink-0 relative group/photo">
                    <div class="w-full h-full rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                      <img v-if="horno.Url" :src="horno.Url" class="w-full h-full object-cover" />
                      <Flame v-else class="h-10 w-10 text-gray-300" />
                      
                      <!-- Overlay para subir foto -->
                      <div v-if="horno.Idestado !== 0" class="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                        <Camera class="h-6 w-6 text-white mb-1" />
                        <span class="text-[10px] text-white font-bold uppercase">Cambiar</span>
                        <input 
                          type="file" 
                          class="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*"
                          @change="(e) => manejarSubidaFoto(e, index)"
                        />
                      </div>
                    </div>
                    <!-- Spinner de carga para foto -->
                    <div v-if="horno.subiendoFoto" class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                      <div class="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
                    </div>
                  </div>

                  <!-- Datos -->
                  <div class="flex-1 space-y-4">
                    <div class="flex items-start gap-2">
                      <div class="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
                          <input 
                            v-model="horno.Nombre"
                            type="text"
                            :disabled="horno.Idestado === 0"
                            placeholder="Nombre del horno"
                            class="w-full mt-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                          />
                        </div>
                        <div>
                          <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cant. Latas</label>
                          <input 
                            v-model.number="horno.Cantidad"
                            type="number"
                            :disabled="horno.Idestado === 0"
                            placeholder="0"
                            class="w-full mt-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                      
                      <button 
                        @click="toggleEstado(index)"
                        :title="horno.Idestado === 1 ? 'Desactivar Horno' : 'Activar Horno'"
                        class="mt-5 p-2 rounded-xl transition-colors"
                        :class="horno.Idestado === 1 ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'"
                      >
                        <Power class="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consumos</label>
                        <button 
                          v-if="horno.Idestado !== 0"
                          @click="agregarEnergia(index)" 
                          class="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors uppercase font-bold"
                        >
                          + Añadir
                        </button>
                      </div>
                      
                      <div class="space-y-2">
                        <div v-for="(e, eIndex) in horno.Energia" :key="eIndex" class="flex gap-2 items-center">
                          <select 
                            v-model="e.Tipo"
                            :disabled="horno.Idestado === 0"
                            class="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                          >
                            <option value="Gas GLP">Gas GLP</option>
                            <option value="Gas Natural">Gas Natural</option>
                            <option value="Electricidad">Electricidad</option>
                            <option value="Leña">Leña</option>
                          </select>
                          <input 
                            v-model.number="e.Consumo"
                            type="number"
                            step="0.01"
                            :disabled="horno.Idestado === 0"
                            placeholder="Kw/m3"
                            class="w-16 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                          />
                          <button 
                            v-if="horno.Idestado !== 0"
                            @click="eliminarEnergia(index, eIndex)" 
                            class="text-red-400 hover:text-red-600"
                          >
                            <MinusCircle class="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            @click="$emit('close')"
            class="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="guardarCambios"
            :disabled="saving || loading"
            class="px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            <Save v-if="!saving" class="h-4 w-4" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, Flame, Plus, Save, MinusCircle, Camera, Power } from 'lucide-vue-next';
import { ListHornos, updateHorno } from '@/Server/Sucural';
import { SubirFoto } from '@/Server/api';

const props = defineProps({
  show: Boolean,
  sucursal: Object
});

const emit = defineEmits(['close', 'updated']);

const hornos = ref([]);
const loading = ref(false);
const saving = ref(false);

const cargarHornos = async () => {
  if (!props.sucursal?.idsucursal) return;
  
  loading.value = true;
  try {
    const resp = await ListHornos(props.sucursal.idsucursal);
    const data = resp.result || [];
    
    hornos.value = data.map(h => ({
      IdHorno: h.idhorno,
      IdSucursal: props.sucursal.idsucursal,
      Url: h.imagen || null,
      Nombre: h.nombre,
      Cantidad: h.cantidadlata || 0,
      Idestado: h.estado !== undefined ? h.estado : 1, 
      subiendoFoto: false,
      Energia: (h.energias || []).map(e => ({
        IdHornEnergia: e.idHornoEnergia,
        Tipo: e.tipoEnergia,
        Consumo: e.consumoPorHora
      }))
    }));
  } catch (err) {
    console.error('Error al cargar hornos:', err);
  } finally {
    loading.value = false;
  }
};

const agregarNuevoHorno = () => {
  hornos.value.push({
    IdHorno: null,
    IdSucursal: props.sucursal.idsucursal,
    Url: null,
    Nombre: '',
    Cantidad: 0,
    Idestado: 1,
    subiendoFoto: false,
    Energia: []
  });
};

const toggleEstado = (index) => {
  // En lugar de eliminar, cambiamos el estado
  hornos.value[index].Idestado = hornos.value[index].Idestado === 1 ? 0 : 1;
};

const manejarSubidaFoto = async (event, index) => {
  const file = event.target.files[0];
  if (!file) return;

  hornos.value[index].subiendoFoto = true;
  try {
    const url = await SubirFoto(file);
    hornos.value[index].Url = url;
  } catch (err) {
    console.error('Error al subir foto:', err);
  } finally {
    hornos.value[index].subiendoFoto = false;
  }
};

const agregarEnergia = (index) => {
  if (!hornos.value[index].Energia) hornos.value[index].Energia = [];
  hornos.value[index].Energia.push({
    IdHornEnergia: null,
    Tipo: 'Gas GLP',
    Consumo: 0
  });
};

const eliminarEnergia = (hornoIndex, energiaIndex) => {
  hornos.value[hornoIndex].Energia.splice(energiaIndex, 1);
};

const guardarCambios = async () => {
  saving.value = true;
  try {
    await updateHorno(hornos.value);
    emit('updated', 'Hornos actualizados correctamente');
    emit('close');
  } catch (err) {
    console.error('Error al guardar hornos:', err);
  } finally {
    saving.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) cargarHornos();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
