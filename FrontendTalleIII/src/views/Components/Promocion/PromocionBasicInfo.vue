<template>
  <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
    <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
      <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
        <Edit class="h-5 w-5 text-orange-600" />
        Información Básica
      </h3>
    </div>
    <div class="p-6 space-y-6">
      <div>
        <label class="flex items-center text-gray-700 font-semibold mb-2">
          <Tag class="h-4 w-4 mr-2 text-gray-500" /> Nombre de la Promoción
        </label>
        <input
          :value="formData.Nombre"
          @input="$emit('update:formData', { ...formData, Nombre: $event.target.value })"
          required
          class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
          placeholder="Ej: Combo Familiar Deluxe"
        />
      </div>

      <div>
        <label class="flex items-center text-gray-700 font-semibold mb-2">
          <AlignLeft class="h-4 w-4 mr-2 text-gray-500" /> Descripción
        </label>
        <textarea
          :value="formData.Descripcion"
          @input="$emit('update:formData', { ...formData, Descripcion: $event.target.value })"
          required
          class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 min-h-[100px] resize-none"
          placeholder="Describe los beneficios y detalles de la promoción..."
        ></textarea>
      </div>

      <div>
        <label class="flex items-center text-gray-700 font-semibold mb-2">
          <ListFilter class="h-4 w-4 mr-2 text-gray-500" /> Tipo de Promoción
        </label>
        <select
          :value="formData.Tipopromocion.IdTipoPromocion"
          @change="$emit('update:formData', { ...formData, Tipopromocion: { IdTipoPromocion: $event.target.value } })"
          class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
        >
          <option value="">Seleccione el tipo de promoción</option>
          <option
            v-for="type in promotionTypes"
            :key="type.IdTipoPromocion"
            :value="type.IdTipoPromocion"
          >
            {{ type.Nombre }}
          </option>
        </select>
      </div>

      <!-- Imagen de la Promoción -->
      <div >
        <label class="flex items-center text-gray-700 font-semibold mb-2">
          <ImageIcon class="h-4 w-4 mr-2 text-gray-500" />
           Imagen de la Promoción
        </label>
       
        <div class="space-y-4">
          <input
            type="file"
            accept="image/*"
            @change="$emit('handle-archivo', $event)"
            class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          <div v-if="previewUrl || formData?.Url" class="flex justify-center">
            <div class="relative">
              <img
                :src="previewUrl || formData?.Url || '/placeholder.svg?height=100&width=100'"
                alt="Previsualización"
                class="w-48 h-48 object-cover rounded-2xl shadow-lg border-2 border-white"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Edit, Tag, AlignLeft, ListFilter, ImageIcon } from 'lucide-vue-next';

defineProps({
  formData: Object,
  promotionTypes: Array,
  previewUrl: String,
});
defineEmits(['update:formData', 'handle-archivo']);
</script>