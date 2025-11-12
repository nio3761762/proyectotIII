<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl overflow-y-auto max-h-[90vh] animate-fade-in">
      <div class="p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ esEdicionProducto ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        <div  class="space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2"><Info class="h-5 w-5" />Información Básica</h3>
                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><Type class="h-4 w-4 text-blue-500" />Nombre del Producto</label>
                    <input v-model="newProducto.Nombre" type="text" placeholder="Ej: Coca Cola 500ml" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><FileText class="h-4 w-4 text-blue-500" />Descripción</label>
                    <textarea v-model="newProducto.Descripcion" placeholder="Describe las características del producto..." rows="3" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" required></textarea>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><Bookmark class="h-4 w-4 text-blue-500" />Marca</label>
                    <select v-model="newProducto.IdMarca" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="" disabled>Selecciona una marca</option>
                      <option v-for="marca in marcas" :key="marca.IdMarca" :value="marca.IdMarca">{{ marca.Nombre }}</option>
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><Tag class="h-4 w-4 text-blue-500" />Categoría</label>
                      <select v-model="selectedCategoria" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="" disabled hidden>Selecciona una categoría</option>
                        <option v-for="cat in categorias" :key="cat.IdCategoria" :value="cat.IdCategoria">{{ cat.Nombre }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><Tag class="h-4 w-4 text-blue-500" />Subcategoría</label>
                      <select v-model="newProducto.IdSubCategoria" :disabled="!selectedCategoria" class="w-full disabled:bg-gray-100 px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="" disabled hidden>Selecciona una subcategoría</option>
                        <option v-for="cat in subcategoria" :key="cat.IdSubCategoria" :value="cat.IdSubCategoria">{{ cat.Nombre }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2"><ImageIcon class="h-5 w-5" />Imagen del Producto</h3>
                <div class="flex items-center gap-4">
                  <div class="w-full">
                    <div class="space-y-4">
                      <input ref="fileInput" type="file" accept="image/*" @change="handleArchivo" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                      <div v-if="previewUrl" class="flex justify-center">
                        <div class="relative">
                          <img :src="previewUrl" alt="Previsualización" class="w-48 h-48 object-cover rounded-2xl shadow-lg border-2 border-white" />
                          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-6">
              <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2"><Ruler class="h-5 w-5" />Unidades de Medida y Precios</h3>
                <div class="space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">Categoría de Medida</label>
                      <select v-model="selectedCategoriaMedida" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="" disabled>Seleccione una categoría</option>
                        <option v-for="cat in categoriaMedidas" :key="cat.IdCategoriaMedida" :value="cat.IdCategoriaMedida">{{ cat.Nombre }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">Unidad de Medida</label>
                      <select v-model="nuevaMedida.IdUnidadMedida" :disabled="!selectedCategoriaMedida" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100">
                        <option value="" disabled>Seleccione</option>
                        <option v-for="medida in medidas" :key="medida.IdUnidadMedida" :value="medida.IdUnidadMedida">{{ medida.Nombre }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><DollarSign class="h-4 w-4 text-orange-500" />Precio Base</label>
                      <input v-model.number="nuevaMedida.Precio" type="number" step="0.01" placeholder="0.00" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><DollarSign class="h-4 w-4 text-orange-500" />Precio por Mayor</label>
                      <input v-model.number="nuevaMedida.PrecioMayor" type="number" step="0.01" placeholder="0.00" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><Package class="h-4 w-4 text-orange-500" />Cantidad</label>
                    <input v-model.number="nuevaMedida.Cantidad" type="number" min="0" placeholder="0" class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div class="flex gap-3">
                    <button @click.prevent="agregarMedida" class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white py-3 rounded-2xl shadow-lg font-semibold flex items-center justify-center gap-2"><Plus v-if="medidaEnEdicionIndex === null" class="h-4 w-4" /><Save v-else class="h-4 w-4" />{{ medidaEnEdicionIndex === null ? 'Agregar Medida' : 'Actualizar Medida' }}</button>
                    <button v-if="medidaEnEdicionIndex !== null" @click.prevent="cancelarEdicionMedida" class="w-full bg-gray-500 text-white py-3 rounded-2xl shadow-lg font-semibold flex items-center justify-center gap-2"><X class="h-4 w-4" />Cancelar</button>
                  </div>
                </div>
                <div v-if="newProducto.Productomedida.length > 0" class="mt-6 pt-6 border-t border-orange-200">
                  <h4 class="text-md font-bold text-orange-800 mb-4">Medidas Agregadas</h4>
                  <div class="space-y-3">
                    <div v-for="(medida, index) in newProducto.Productomedida" :key="index" class="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-orange-200 flex items-center justify-between">
                      <div>
                        <p class="font-semibold text-gray-800">{{ medida.nombreUnidad }}</p>
                        <p class="text-sm text-gray-600">{{ medida.nombreCategoria }}: {{ medida.Cantidad }} {{ medida.Abreviatura }} | Precio: {{ medida.Precio }} Bs. | Por Mayor: {{ medida.PrecioMayor }} Bs.</p>
                      </div>
                      <div class="flex gap-2">
                        <button @click.prevent="EditarMedida(index)" class="text-blue-600 hover:text-blue-900"><Edit class="h-4 w-4" /></button>
                        <button @click.prevent="eliminarMedida(index)" class="text-red-500 hover:text-red-700"><Trash2 class="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button type="button" @click="closeModal" class="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg font-semibold flex items-center gap-2"><X class="h-5 w-5" />Cancelar</button>
            <button type="submit" @click="guardarProducto" class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white rounded-2xl shadow-lg font-semibold flex items-center gap-2"><Save class="h-5 w-5" />Guardar Producto</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showToast" class="fixed top-6 right-6 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-[60] animate-slide-in" :class="{ 'bg-green-500': toastType === 'success', 'bg-red-500': toastType === 'error' }">
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue';
import { Package, Plus, Trash2, Save, X, Info, Type, Tag, Ruler, DollarSign, ImageIcon, FileText, Edit, Bookmark, CheckCircle } from 'lucide-vue-next';
import { crearInsumo, actualizarInsumo } from '@/Server/Insumo';
import { listarCategorias, listarSubCategorias, ObtenerCategoria } from '@/Server/Categoria';
import { ObtenerMedidas, listarCategoriaMedidas, ObtenrCategoriaMedida } from '@/Server/Medida';
import { getMarcas } from '@/Server/Marca';
import { SubirFoto } from '@/Server/api';

const props = defineProps({
  show: Boolean,
  insumoId: { // Allow passing an ID for editing
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['close', 'insumo-saved']);

const esEdicionProducto = ref(false);
const marcas = ref([]);
const categorias = ref([]);
const subcategoria = ref([]);
const medidas = ref([]);
const categoriaMedidas = ref([]);

const initialProduct = {
  IdProducto: '',
  Nombre: '',
  Descripcion: '',
  IdSubCategoria: '',
  IdMarca: '',
  Url: '',
  IdImagen: '',
  Productomedida: []
};
const newProducto = ref({ ...initialProduct });

const initialMedida = {
  IdProductomedida: '',
  IdUnidadMedida: '',
  Abreviatura: '',
  Precio: 0,
  PrecioMayor: 0,
  Cantidad: 0
};
const nuevaMedida = ref({ ...initialMedida });

const selectedCategoria = ref('');
const selectedCategoriaMedida = ref('');
const archivo = ref(null);
const previewUrl = ref('');
const medidaEnEdicionIndex = ref(null);

const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('success');

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm();
    fetchAllInitialData();
    // if (props.insumoId) { // Logic to load insumo for editing can be added here
    //   esEdicionProducto.value = true;
    //   // fetch and load insumo data
    // }
  }
});

watch(selectedCategoria, async (newVal) => {
  if (newVal) {
    newProducto.value.IdSubCategoria = '';
    await obtenersubcategoria(newVal);
  } else {
    subcategoria.value = [];
  }
});

watch(selectedCategoriaMedida, async (newVal) => {
  if (newVal) {
    nuevaMedida.value.IdUnidadMedida = '';
    await obtenerMedidas(newVal);
  } else {
    medidas.value = [];
  }
});

const fetchAllInitialData = async () => {
    await Promise.all([
        fetchCategorias(),
        fetchCategoriaMedidas(),
        ListarMarcas()
    ]);
};

const fetchCategorias = async () => { try { categorias.value = await listarCategorias(); } catch (e) { console.error(e); } };
const fetchCategoriaMedidas = async () => { try { categoriaMedidas.value = await listarCategoriaMedidas(); } catch (e) { console.error(e); } };
const obtenersubcategoria = async (id) => { try { subcategoria.value = await listarSubCategorias(id); } catch (e) { console.error(e); } };
const obtenerMedidas = async (id) => { try { medidas.value = await ObtenerMedidas(id); } catch (e) { console.error(e); } };
const ListarMarcas = async () => { try { marcas.value = await getMarcas(); } catch (e) { console.error(e) } };

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3000);
};

const resetForm = () => {
    newProducto.value = { ...initialProduct, Productomedida: [] };
    nuevaMedida.value = { ...initialMedida };
    selectedCategoria.value = '';
    selectedCategoriaMedida.value = '';
    previewUrl.value = '';
    archivo.value = null;
    esEdicionProducto.value = false;
    medidaEnEdicionIndex.value = null;
}

const closeModal = () => {
  emit('close');
};

const handleImageUpload = async () => {
  if (!archivo.value) return null;
  try {
    const response = await SubirFoto(archivo.value);
    return response;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    showToastMessage('Error al subir la imagen', 'error');
    return null;
  }
};

const guardarProducto = async () => {
  try {
    const imageUrl = await handleImageUpload();
    if (archivo.value && !imageUrl) {
        // Stop if image upload fails but was intended
        return;
    }

    const datosProducto = {
      Nombre: newProducto.value.Nombre,
      Descripcion: newProducto.value.Descripcion,
      Url: imageUrl || newProducto.value.Url,
      IdSubCategoria: newProducto.value.IdSubCategoria,
      IdImagen: newProducto.value.IdImagen,
      IdTipo: 'ITP-1', // Assuming this is constant for Insumo
      IdMarca: newProducto.value.IdMarca,
      Productomedida: newProducto.value.Productomedida.map(pm => ({
        IdProductomedida: pm.IdProductomedida,
        Precio: pm.Precio,
        PrecioMayor: pm.PrecioMayor,
        IdUnidadMedida: pm.IdUnidadMedida,
        Cantidad: pm.Cantidad
      }))
    };

    let response;
    if (esEdicionProducto.value) {
      datosProducto.id = newProducto.value.IdProducto;
      response = await actualizarInsumo(datosProducto);
    } else {
      response = await crearInsumo(datosProducto);
    }

    showToastMessage(response.message, 'success');
    emit('insumo-saved');
    closeModal();
  } catch (error) {
    console.error('Error al guardar el producto:', error);
    showToastMessage(error.message || 'Error al guardar el producto', 'error');
  }
};

const agregarMedida = () => {
  if (!nuevaMedida.value.IdUnidadMedida || nuevaMedida.value.Precio <= 0) return;
  const unit = medidas.value.find(m => m.IdUnidadMedida === nuevaMedida.value.IdUnidadMedida);
  const category = categoriaMedidas.value.find(c => c.IdCategoriaMedida === selectedCategoriaMedida.value);
  const medidaConNombres = {
    ...nuevaMedida.value,
    nombreUnidad: unit ? unit.Nombre : '?',
    Abreviatura: unit ? unit.Abreviatura : '?',
    nombreCategoria: category ? category.Nombre : '?'
  };
  if (medidaEnEdicionIndex.value !== null) {
    newProducto.value.Productomedida[medidaEnEdicionIndex.value] = medidaConNombres;
  } else {
    newProducto.value.Productomedida.push(medidaConNombres);
  }
  cancelarEdicionMedida();
};

const EditarMedida = async (index) => {
  medidaEnEdicionIndex.value = index;
  const medidaAEditar = newProducto.value.Productomedida[index];
  const cat = categoriaMedidas.value.find(c => c.Nombre === medidaAEditar.nombreCategoria);
  if (cat) {
      selectedCategoriaMedida.value = cat.IdCategoriaMedida;
      await obtenerMedidas(cat.IdCategoriaMedida);
  }
  nuevaMedida.value = { ...medidaAEditar };
};

const cancelarEdicionMedida = () => {
  medidaEnEdicionIndex.value = null;
  nuevaMedida.value = { ...initialMedida };
  selectedCategoriaMedida.value = '';
};

const eliminarMedida = (index) => { newProducto.value.Productomedida.splice(index, 1); };

const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
    const reader = new FileReader();
    reader.onload = (e) => { previewUrl.value = e.target.result; };
    reader.readAsDataURL(file);
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slide-in {
  animation: slide-in-right 0.5s forwards;
}
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
