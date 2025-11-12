<template>
  <div class="min-h-screen p-6 space-y-8">
<!-- bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 -->
    <!-- VISTA PRINCIPAL: LISTA DE REPARTIDORES -->
    <div v-if="!modoEdicion">
      <RepartidorListHeader
        :repartidoresActivos="repartidoresActivos"
        :totalRepartidores="repartidores.length"
      />

      <RepartidorFilters
        v-model:nombreFilter="filtros.nombre"
        v-model:estadoFilter="filtros.estado"
        :statusOptions="statusOptions"
        @nuevoRepartidor="iniciarModoEdicion()"
      />

      <!-- Repartidores List -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        <RepartidorCard
          v-for="repartidor in repartidoresPaginados"
          :key="repartidor.IdRepartidor"
          :repartidor="repartidor"
          @editRepartidor="iniciarModoEdicion"
          @confirmChangeStatus="confirmarCambioEstado"
        />
      </div>

      <RepartidorEmptyState :show="repartidoresPaginados.length === 0" />

      <RepartidorPagination
        v-if="totalPaginas > 0"
        :totalPaginas="totalPaginas"
        :paginaActual="paginaActual"
        :paginacionInfo="paginacionInfo"
        :visiblePages="visiblePages"
        @prevPage="paginaActual--"
        @nextPage="paginaActual++"
        @goToPage="page => paginaActual = page"
      />
    </div>

    <!-- VISTA DE EDICIÓN/REGISTRO -->
    <div v-else class="space-y-8">
      <RepartidorFormHeader
        :esNuevoRepartidor="esNuevoRepartidor"
        @cancelarEdicion="cancelarModoEdicion"
      />

      <!-- Form Content -->
      <div class="space-y-8">
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <!-- Personal Information -->
          <div class="xl:col-span-2 space-y-6">
            <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
              <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
                <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
                  <User class="h-5 w-5 text-orange-600" />
                  Información Personal
                </h3>
              </div>
              <div class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <User class="h-5 w-5 mr-2 text-orange-500" />
                      Nombre
                    </label>
                    <input
                      v-model="repartidorEditado.Nombre"
                      @input="errors.nombre = validateField('nombre', repartidorEditado.Nombre)"
                      @blur="errors.nombre = validateField('nombre', repartidorEditado.Nombre)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nombre }]"
                      placeholder="Nombre del repartidor"
                    />
                    <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
                  </div>

                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <User class="h-5 w-5 mr-2 text-orange-500" />
                      Apellido Paterno
                    </label>
                    <input
                      v-model="repartidorEditado.ApellidoPaterno"
                      @input="errors.apellidoPaterno = validateField('apellidoPaterno', repartidorEditado.ApellidoPaterno)"
                      @blur="errors.apellidoPaterno = validateField('apellidoPaterno', repartidorEditado.ApellidoPaterno)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.apellidoPaterno }]"
                      placeholder="Apellido paterno"
                    />
                    <p v-if="errors.apellidoPaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoPaterno }}</p>
                  </div>

                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <User class="h-5 w-5 mr-2 text-orange-500" />
                      Apellido Materno
                    </label>
                    <input
                      v-model="repartidorEditado.ApellidoMaterno"
                      @input="errors.apellidoMaterno = validateField('apellidoMaterno', repartidorEditado.ApellidoMaterno)"
                      @blur="errors.apellidoMaterno = validateField('apellidoMaterno', repartidorEditado.ApellidoMaterno)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.apellidoMaterno }]"
                      placeholder="Apellido materno"
                    />
                    <p v-if="errors.apellidoMaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidoMaterno }}</p>
                  </div>

                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <Calendar class="h-5 w-5 mr-2 text-orange-500" />
                      Fecha de Nacimiento
                    </label>
                    <input
                      v-model="repartidorEditado.FechaDeNacimiento"
                      type="date"
                      class="w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
                    />
                  </div>

                  <div class="md:col-span-2">
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <Accessibility class="h-5 w-5 mr-2 text-orange-500" />
                      Género
                    </label>
                    <div class="flex gap-6">
                      <label class="inline-flex items-center">
                        <input v-model.number="repartidorEditado.Genero.IdGenero" type="radio" :value="1" class="text-orange-600" @change="errors.genero = validateField('genero', repartidorEditado.Genero.IdGenero)" />
                        <span class="ml-2 text-gray-700">Masculino</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input v-model.number="repartidorEditado.Genero.IdGenero" type="radio" :value="2" class="text-orange-600" @change="errors.genero = validateField('genero', repartidorEditado.Genero.IdGenero)" />
                        <span class="ml-2 text-gray-700">Femenino</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input v-model.number="repartidorEditado.Genero.IdGenero" type="radio" :value="3" class="text-orange-600" @change="errors.genero = validateField('genero', repartidorEditado.Genero.IdGenero)" />
                        <span class="ml-2 text-gray-700">Otro</span>
                      </label>
                    </div>
                    <p v-if="errors.genero" class="text-red-500 text-xs italic mt-1">{{ errors.genero }}</p>
                  </div>

                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <Phone class="h-5 w-5 mr-2 text-orange-500" />
                      Celulares
                    </label>
                    <div v-for="(celular, index) in repartidorEditado.Celulares" :key="index" class="flex items-center gap-2 mb-2">
                      <input
                        v-model="repartidorEditado.Celulares[index].Numero"
                        @input="index === 0 ? errors.celular = validateField('celular', repartidorEditado.Celulares[0].Numero) : null"
                        @blur="index === 0 ? errors.celular = validateField('celular', repartidorEditado.Celulares[0].Numero) : null"
                        :placeholder="'Celular #' + (index + 1)"
                        :class="['flex-1 w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.celular && index === 0 }]"
                      />
                      <button
                        type="button"
                        @click="eliminarCelular(index)"
                        class="text-red-600 hover:text-red-800 p-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                    <p v-if="errors.celular" class="text-red-500 text-xs italic mt-1">{{ errors.celular }}</p>
                    <button
                      type="button"
                      @click="agregarCelular()"
                      :disabled="repartidorEditado.Celulares.length >= 4"
                      class="text-sm text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Agregar otro número
                    </button>
                  </div>

                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <IdCard class="h-5 w-5 mr-2 text-orange-500" />
                      CI
                    </label>
                    <div class="flex">
                      <input
                        v-model="repartidorEditado.Documento[0].Documento"
                        @input="errors.ci = validateField('ci', repartidorEditado.Documento[0].Documento)"
                        @blur="errors.ci = validateField('ci', repartidorEditado.Documento[0].Documento)"
                        :class="['flex-1 pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-l-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.ci }]"
                        placeholder="Cédula de Identidad"
                      />
                      <select v-model="repartidorEditado.Documento[0].Complemento.IdComplemento" class="pl-12 pr-4 py-4 px-4  border-l-0 shadow-md  bg-gray-50/80 rounded-r-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30">
                        <option v-for="comp in complementos" :key="comp.IdComplemento" :value="comp.IdComplemento">{{ comp.Nombre }}</option>
                      </select>
                    </div>
                    <p v-if="errors.ci" class="text-red-500 text-xs italic mt-1">{{ errors.ci }}</p>
                  </div>

                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <Briefcase class="h-5 w-5 mr-2 text-orange-500" />
                      NIT
                    </label>
                    <input
                      v-model="repartidorEditado.Documento[1].Documento"
                      @input="errors.nit = validateField('nit', repartidorEditado.Documento[1].Documento)"
                      @blur="errors.nit = validateField('nit', repartidorEditado.Documento[1].Documento)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.nit }]"
                      placeholder="Número de NIT"
                    />
                    <p v-if="errors.nit" class="text-red-500 text-xs italic mt-1">{{ errors.nit }}</p>
                  </div>

                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <Mail class="h-5 w-5 mr-2 text-orange-500" />
                      Correo Electrónico
                    </label>
                    <input
                      v-model="repartidorEditado.Email.Email"
                      type="email"
                      @input="errors.email = validateField('email', repartidorEditado.Email.Email)"
                      @blur="errors.email = validateField('email', repartidorEditado.Email.Email)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.email }]"
                      placeholder="correo@ejemplo.com"
                    />
                    <p v-if="errors.email" class="text-red-500 text-xs italic mt-1">{{ errors.email }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contract Information -->
            <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
              <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
                <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
                  <Briefcase class="h-5 w-5 text-orange-600" />
                  Información de Contratación
                </h3>
              </div>
              <div class="p-6 space-y-6">
                <div>
                  <label class="flex items-center text-gray-700 font-semibold mb-2">
                    <Briefcase class="h-5 w-5 mr-2 text-orange-600" />
                    Tipo de Contrato
                  </label>
                  <select
                    v-model="repartidorEditado.IdEmpresaReparto"
                    @change="errors.idEmpresaReparto = validateField('idEmpresaReparto', repartidorEditado.IdEmpresaReparto)"
                                          :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.idEmpresaReparto }]"
                  >
                    <option disabled value="">Seleccione</option>
                    <option v-for="empresa in Empresa" :value="empresa.IdEmpresaReparto">{{ empresa.NombreEmpresa }}</option>
                  </select>
                  <p v-if="errors.idEmpresaReparto" class="text-red-500 text-xs italic mt-1">{{ errors.idEmpresaReparto }}</p>
                </div>
              </div>
            </div>

            <!-- Driving Information -->
            <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
              <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
                <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
                  <Car class="h-5 w-5 text-orange-600" />
                  Información de Conducción
                </h3>
              </div>
              <div class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <ClipboardList class="h-5 w-5 mr-2 text-orange-500" />
                      Tipo de Licencia
                    </label>
                    <select
                      v-model="repartidorEditado.IdTipoLicencia"
                      @change="errors.idTipoLicencia = validateField('idTipoLicencia', repartidorEditado.IdTipoLicencia)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.idTipoLicencia }]"
                    >
                      <option disabled value="">Seleccione</option>
                      <option v-for="licencia in Licencia" :value="licencia.IdTipoLicencia">{{ licencia.NombreTipoLicencia }}</option>
                    </select>
                    <p v-if="errors.idTipoLicencia" class="text-red-500 text-xs italic mt-1">{{ errors.idTipoLicencia }}</p>
                  </div>
                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <ClipboardList class="h-5 w-5 mr-2 text-orange-500" />
                      Número de Licencia
                    </label>
                    <input
                      v-model="repartidorEditado.NumeroLicencia"
                      @input="errors.numeroLicencia = validateField('numeroLicencia', repartidorEditado.NumeroLicencia)"
                      @blur="errors.numeroLicencia = validateField('numeroLicencia', repartidorEditado.NumeroLicencia)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.numeroLicencia }]"
                      placeholder="Ej: 1234567"
                    />
                    <p v-if="errors.numeroLicencia" class="text-red-500 text-xs italic mt-1">{{ errors.numeroLicencia }}</p>
                  </div>
                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <Car class="h-5 w-5 mr-2 text-orange-500" />
                      Placa del Vehículo
                    </label>
                    <input
                      v-model="repartidorEditado.PlacaVehiculo"
                      @input="errors.placaVehiculo = validateField('placaVehiculo', repartidorEditado.PlacaVehiculo)"
                      @blur="errors.placaVehiculo = validateField('placaVehiculo', repartidorEditado.PlacaVehiculo)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.placaVehiculo }]"
                      placeholder="Ej: 1234-ABC"
                    />
                    <p v-if="errors.placaVehiculo" class="text-red-500 text-xs italic mt-1">{{ errors.placaVehiculo }}</p>
                  </div>
                  <div>
                    <label class="flex items-center text-gray-700 font-semibold mb-2">
                      <Car class="h-5 w-5 mr-2 text-orange-500" />
                      Tipo de Vehículo
                    </label>
                    <select
                      v-model="repartidorEditado.TipoVehiculo"
                      @change="errors.tipoVehiculo = validateField('tipoVehiculo', repartidorEditado.TipoVehiculo)"
                      :class="['w-full pl-12 pr-4 py-4 border-0 shadow-md  bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.tipoVehiculo }]"
                    >
                      <option disabled value="">Seleccione</option>
                      <option v-for="type in vehicleTypes" :key="type" :value="type">{{ type }}</option>
                    </select>
                    <p v-if="errors.tipoVehiculo" class="text-red-500 text-xs italic mt-1">{{ errors.tipoVehiculo }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Photo Section -->
          <div class="space-y-6">
            <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
              <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
                <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
                  <Camera class="h-5 w-5 text-orange-600" />
                  Foto del Repartidor
                </h3>
              </div>
              <div class="p-6 text-center">
                <div class="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg mx-auto mb-4">
                  <img v-if="previewUrl" :src="previewUrl" alt="Vista previa" class="w-full h-full object-cover" />
                  <User v-else class="h-16 w-16 text-white" />
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleArchivo"
                  class="w-full border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-2xl px-4 py-3 outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="cancelarModoEdicion()"
            class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2"
          >
            <X class="h-4 w-4" />
            Cancelar
          </button>
          <button
           @click="guardarRepartidor"
            class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Save class="h-4 w-4" />
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN -->
    <ConfirmacionModal
      :show="modalAct"
      :title="repartidorParaAccion?.estadoActual === 1 ? '¿Desactivar Repartidor?' : '¿Activar Repartidor?'"
      :confirmText="repartidorParaAccion?.estadoActual === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="repartidorParaAccion?.estadoActual === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-8 w-8 text-orange-600"
      @confirm="confirmar"
      @cancel="cerrarModalConfirmacion"
    >
      ¿Está seguro de que desea {{ repartidorParaAccion?.estadoActual === 1 ? 'desactivar' : 'activar' }} al repartidor
      <span class="font-semibold text-gray-900 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-lg">
        {{ repartidorParaAccion?.nombre }}
      </span>?
    </ConfirmacionModal>
     <!--  Success Toast -->
    <div
      v-if="showSuccessToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fdba74, #f97316);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f97316, #ea580c);
}
</style>


<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { listarRepartidores, registrarRepartidor, actualizarRepartidor, cambiarEstadoRepartidor, listarEpresaReoparto, listarTipoLiecencia } from '@/Server/Repartidor.js';
import { listarComplemento,listarDocumento,listarEmail,listarNumero   } from '@/Server/Complemento';
import { SubirFoto } from '@/Server/Foto';
import { Mail,Camera,Save,Accessibility,Calendar, AlertTriangle, CheckCircle, X, ClipboardList,Car, IdCard,Briefcase, User, Phone,  MapPin } from 'lucide-vue-next';
import RepartidorListHeader from './RepartidorListHeader.vue';
import RepartidorFilters from './RepartidorFilters.vue';
import RepartidorCard from './RepartidorCard.vue';
import RepartidorEmptyState from './RepartidorEmptyState.vue';
import RepartidorPagination from './RepartidorPagination.vue';
import RepartidorFormHeader from './RepartidorFormHeader.vue';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';

// --- State ---
const repartidores = ref([]);
const complementos = ref([]);
const modoEdicion = ref(false);
const esNuevoRepartidor = ref(true);
const previewUrl = ref(null);
const fileInput = ref(null);
const archivoParaSubir = ref(null);
const Licencia = ref([]);
const Empresa = ref([]);
const vehicleTypes = ref(['Moto', 'Bicicleta', 'Auto', 'Camion']);
const repartidorEditado = ref(null);

const emailList = ref([]);
const documentoList = ref([]);
const numeroList = ref([]);

const errors = reactive({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaDeNacimiento: '',
  genero: '',
  celular: '',
  ci: '',
  nit: '',
  email: '',
  idEmpresaReparto: '',
  idTipoLicencia: '',
  numeroLicencia: '',
  placaVehiculo: '',
  tipoVehiculo: '',
});

const modalAct = ref(false);
const repartidorParaAccion = ref(null);
const mensajeModal = ref("");
const showSuccessToast = ref(false);
const successMessage = ref("");

const filtros = ref({
  nombre: "",
  estado: "Todos"
});

const statusOptions = [
  { value: "Todos", label: "Todos", color: "bg-gray-500" },
  { value: "Activo", label: "Activo", color: "bg-green-500" },
  { value: "Inactivo", label: "Inactivo", color: "bg-red-500" }
];

const paginaActual = ref(1);
const itemsPerPage = 6;

const repartidoresActivos = computed(() => {
  return repartidores.value.filter(r => r.Estado.IdEstado === 1).length
});

const repartidoresFiltrados = computed(() => {
  let repartidoresFiltrados = repartidores.value;

  if (filtros.value.nombre) {
    const nombreLower = filtros.value.nombre.toLowerCase();
    repartidoresFiltrados = repartidoresFiltrados.filter(repartidor =>
      (repartidor.Persona.Nombre.toLowerCase() + " " + repartidor.Persona.ApellidoPaterno.toLowerCase()).includes(nombreLower)
    );
  }

  if (filtros.value.estado !== 'Todos') {
    const estadoId = filtros.value.estado === 'Activo' ? 1 : 2;
    repartidoresFiltrados = repartidoresFiltrados.filter(repartidor =>
      repartidor.Estado.IdEstado === estadoId
    );
  }

  return repartidoresFiltrados;
});

const totalPaginas = computed(() => {
  return Math.ceil(repartidoresFiltrados.value.length / itemsPerPage)
});

const repartidoresPaginados = computed(() => {
  const start = (paginaActual.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return repartidoresFiltrados.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = repartidoresFiltrados.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} repartidores`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

const resetRepartidorEditado = () => {
  repartidorEditado.value = {
      IdRepartidor: null,
      IdPersona: null,
      Nombre: "",
      ApellidoPaterno: "",
      ApellidoMaterno: "",
      FechaDeNacimiento: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
      Email: { IdEmail: null, Email: "" },
      Imagen: null,
      Genero: { IdGenero: 1 },
      Documento: [
        { 
           IdDocumento: '',
          Documento: '',
          Complemento: { IdComplemento: 'C-1'},
          Tipodocumento: { IdTipoDocumento: 2 }
        },
        {
          IdDocumento: '',
          Documento: '',
          Complemento: null,
          Tipodocumento: { IdTipoDocumento: 1 }
        }
      ],
      Celulares: [{ Numero: "" }], // Initialize with one empty phone number
      IdEmpresaReparto: "",
      IdTipoLicencia: "",
      NumeroLicencia: "",
      PlacaVehiculo: "",
      TipoVehiculo: "",
  };
  previewUrl.value = null;
  archivoParaSubir.value = null;
  // Clear all errors
  Object.keys(errors).forEach(key => {
    errors[key] = "";
  });
};

const validateField = (field, value) => {
  let error = '';
  switch (field) {
    case 'nombre':
      if (!value || !value.trim()) error = 'El nombre es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      break;
    case 'apellidoPaterno':
      if (!value || !value.trim()) error = 'El apellido paterno es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'El apellido solo puede contener letras y espacios.';
      break;
    case 'apellidoMaterno':
      if (value && !/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) {
        error = 'El apellido solo puede contener letras y espacios.';
      }
      break;
    case 'genero':
      if (!value || ![1, 2, 3].includes(value)) {
        error = 'El género es requerido.';
      }
      break;
    case 'celular':
      if (!value || !value.trim()) {
        error = 'El número de celular es requerido.';
      } else if (/\D/.test(value)) {
        error = 'Solo debe contener números.';
      } else if (!(value.length >= 7 && value.length <= 8)) {
        error = 'El número de celular debe tener 7 u 8 dígitos.';
      } else {
        const isEditing = repartidorEditado.value.IdRepartidor !== null;
        const existingNumero = numeroList.value.find(
          n => n.Numero === value && (isEditing ? !repartidorEditado.value.Celulares.some(c => c.Numero === n.Numero) : true)
        );
        if (existingNumero) {
          error = 'Este número de celular ya está registrado.';
        }
      }
      break;
    case 'ci':
      if (!value || !value.trim()) {
        error = 'El número de documento es requerido.';
      } else if (!/^\d+$/.test(value)) {
        error = 'El CI solo puede contener números.';
      }
      else {
        const isEditing = repartidorEditado.value.IdRepartidor !== null;
        const currentDocumentId = repartidorEditado.value.Documento[0].IdDocumento;
        console.log('CI Validation - Value:', value, 'isEditing:', isEditing, 'Current Document ID:', currentDocumentId);

        const existingDocumento = documentoList.value.find(d => {
          console.log('  Checking document:', d);
          if (d.Documento === value) {
            if (isEditing && currentDocumentId && d.IdDocumento === currentDocumentId) {
              console.log('    Excluding current document:', d.IdDocumento);
              return false;
            }
            console.log('    Found duplicate or new document:', d.IdDocumento);
            return true;
          }
          return false;
        });
        if (existingDocumento) {
          error = 'Este número de documento ya está registrado en el sistema.';
        }
      }
      break;
    case 'nit':
      if (value && !/^\d+$/.test(value)) {
        error = 'El NIT solo puede contener números.';
      } else if (value) { // Only check uniqueness if a value is provided
        const isEditing = repartidorEditado.value.IdRepartidor !== null;
        const currentDocumentId = repartidorEditado.value.Documento[1].IdDocumento; // Note: index 1 for NIT

        const existingDocumento = documentoList.value.find(d => {
          if (d.Documento === value) {
            if (isEditing && currentDocumentId && d.IdDocumento === currentDocumentId) {
              return false;
            }
            return true;
          }
          return false;
        });
        if (existingDocumento) {
          error = 'Este número de NIT ya está registrado en el sistema.';
        }
      }
      break;
    case 'email':
      if (!value) {
        error = 'El correo electrónico es requerido.';
      } else {
        if ((value.match(/@/g) || []).length !== 1) {
          error = 'El correo debe contener exactamente un símbolo @';
        } else if (!value.endsWith('@gmail.com')) {
          error = 'El correo debe terminar en @gmail.com';
        } else {
          const localPart = value.split('@')[0];
          if (!/^[a-zA-Z0-9._]+$/.test(localPart)) {
            error = 'El correo solo puede contener letras, números, "." o "_"';
          }
        }
        if (!error) {
          const isEditing = repartidorEditado.value.IdRepartidor !== null;
          const currentEmailId = repartidorEditado.value.Email.IdEmail;

          const existingEmail = emailList.value.find(e => {
            if (e.Email.toLowerCase() === value.toLowerCase()) {
              if (isEditing && currentEmailId && e.IdEmail === currentEmailId) {
                return false;
              }
              return true;
            }
            return false;
          });
          if (existingEmail) {
            error = 'Este correo electrónico ya está en uso.';
          }
        }
      }
      break;
    case 'idEmpresaReparto':
      if (!value) error = 'La empresa de reparto es requerida.';
      break;
    case 'idTipoLicencia':
      if (!value) error = 'El tipo de licencia es requerido.';
      break;
    case 'numeroLicencia':
      if (!value || !value.trim()) {
        error = 'El número de licencia es requerido.';
      } else if (!/^\d+$/.test(value)) {
        error = 'El número de licencia solo puede contener números.';
      } else {
        const isEditing = repartidorEditado.value.IdRepartidor !== null;
        const existingRepartidor = repartidores.value.find(
          r => r.NumeroLicencia === value && (isEditing ? r.IdRepartidor !== repartidorEditado.value.IdRepartidor : true)
        );
        if (existingRepartidor) {
          error = 'Este número de licencia ya está registrado.';
        }
      }
      break;
    case 'placaVehiculo':
      if (!value || !value.trim()) error = 'La placa del vehículo es requerida.';
      break;
    case 'tipoVehiculo':
      if (!value || !value.trim()) error = 'El tipo de vehículo es requerido.';
      break;
  }
  return error;
};

const validateForm = () => {
  errors.nombre = validateField('nombre', repartidorEditado.value.Nombre);
  errors.apellidoPaterno = validateField('apellidoPaterno', repartidorEditado.value.ApellidoPaterno);
  errors.apellidoMaterno = validateField('apellidoMaterno', repartidorEditado.value.ApellidoMaterno);
  errors.genero = validateField('genero', repartidorEditado.value.Genero.IdGenero);
  errors.celular = validateField('celular', repartidorEditado.value.Celulares[0]?.Numero);
  errors.ci = validateField('ci', repartidorEditado.value.Documento[0].Documento);
  errors.nit = validateField('nit', repartidorEditado.value.Documento[1].Documento);
  errors.email = validateField('email', repartidorEditado.value.Email.Email);
  errors.idEmpresaReparto = validateField('idEmpresaReparto', repartidorEditado.value.IdEmpresaReparto);
  errors.idTipoLicencia = validateField('idTipoLicencia', repartidorEditado.value.IdTipoLicencia);
  errors.numeroLicencia = validateField('numeroLicencia', repartidorEditado.value.NumeroLicencia);
  errors.placaVehiculo = validateField('placaVehiculo', repartidorEditado.value.PlacaVehiculo);
  errors.tipoVehiculo = validateField('tipoVehiculo', repartidorEditado.value.TipoVehiculo);

  return Object.values(errors).every(error => !error);
};

const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 1000);
};

// --- Methods ---

const cargarDatosIniciales = async () => {
  try {
    repartidores.value = await listarRepartidores();
    complementos.value = await listarComplemento();
    Empresa.value = await listarEpresaReoparto();
    Licencia.value = await listarTipoLiecencia();
    documentoList.value = await listarDocumento();
    emailList.value = await listarEmail();
    numeroList.value = await listarNumero();
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
  }
};

const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivoParaSubir.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const iniciarModoEdicion = (repartidor = null) => {
  if (repartidor) {
    esNuevoRepartidor.value = false;
   // // Deep copy the repartidor object
    repartidorEditado.value = JSON.parse(JSON.stringify(repartidor));

    // Map backend properties from Persona object to frontend model
    repartidorEditado.value.IdPersona = repartidor.Persona?.IdPersona || null;
    repartidorEditado.value.Nombre = repartidor.Persona?.Nombre || "";
    repartidorEditado.value.ApellidoPaterno = repartidor.Persona?.ApellidoPaterno || "";
    repartidorEditado.value.ApellidoMaterno = repartidor.Persona?.ApellidoMaterno || "";
    repartidorEditado.value.FechaDeNacimiento = repartidor.Persona?.FechaDeNacimiento || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    repartidorEditado.value.Email = repartidor.Persona?.Email || { IdEmail: null, Email: "" };
    repartidorEditado.value.Genero = repartidor.Persona?.Genero || { IdGenero: 1 };
    repartidorEditado.value.Imagen = repartidor.Persona?.Imagen || null;
    repartidorEditado.value.Celulares = repartidor.Persona?.Celulares && repartidor.Persona.Celulares.length > 0 ? repartidor.Persona.Celulares : [{ Numero: '' }]; // Handle multiple phones
    repartidorEditado.value.Documento = [
  { IdDocumento: null, Documento: '', Complemento: { IdComplemento: 'C-1' }, Tipodocumento: { IdTipoDocumento: 2 } }, // CI
  { IdDocumento: null, Documento: '', Complemento: null, Tipodocumento: { IdTipoDocumento: 1 } } // Otro documento (ej. NIT)
];
  if (repartidor.Persona?.Documento?.length) {
  for (const doc of repartidor.Persona.Documento) {
    const tipo = doc.Tipodocumento?.IdTipoDocumento;
    if (tipo === '2') { // CI
      repartidorEditado.value.Documento[0] = {
        IdDocumento: doc.IdDocumento,
        Documento: doc.Documento,
        Complemento: doc.Complemento ? { IdComplemento: doc.Complemento.IdComplemento } :{ IdComplemento: 'C-1' } ,
        Tipodocumento: { IdTipoDocumento: tipo }
      };
    } else { // Otro documento
      repartidorEditado.value.Documento[1] = {
        IdDocumento: doc?.IdDocumento,
        Documento: doc?.Documento,
        Complemento: null,
        Tipodocumento: { IdTipoDocumento: tipo }
      };
    }
  }
} 
    // Map direct repartidor properties
    repartidorEditado.value.IdEmpresaReparto = repartidor.EmpresaReparto?.IdEmpresaReparto || "";
    repartidorEditado.value.IdTipoLicencia = repartidor.TipoLicencia?.IdTipoLicencia || "";
    repartidorEditado.value.NumeroLicencia = repartidor.NumeroLicencia || "";
    repartidorEditado.value.PlacaVehiculo = repartidor.PlacaVehiculo || "";
    repartidorEditado.value.TipoVehiculo = repartidor.TipoVehiculo || "";


    previewUrl.value = repartidorEditado.value.Imagen?.Url || null;
     console.log(repartidorEditado.value)
  } else {
    esNuevoRepartidor.value = true;
    resetRepartidorEditado();
  }
  modoEdicion.value = true;
};

const cancelarModoEdicion = () => {
  modoEdicion.value = false;
  resetRepartidorEditado();
};

const guardarRepartidor = async () => {
  if (!validateForm()) { // Add validation check
    return;
  }
  try {
    if (archivoParaSubir.value) {
      const imageUrl = await SubirFoto(archivoParaSubir.value);
      console.log(imageUrl)
      if (!repartidorEditado.value.Imagen) {
        repartidorEditado.value.Imagen = {};
      }
      repartidorEditado.value.Imagen.Url = imageUrl;
    }
     const dato = {
    IdRepartidor: repartidorEditado.value?.IdRepartidor,
    TipoVehiculo: repartidorEditado.value.TipoVehiculo,
    PlacaVehiculo: repartidorEditado.value.PlacaVehiculo,
    NumeroLicencia: repartidorEditado.value.NumeroLicencia,
    IdEmpresaReparto: repartidorEditado.value.IdEmpresaReparto,
    IdTipoLicencia: repartidorEditado.value.IdTipoLicencia,
        IdPersona: repartidorEditado.value?.IdPersona,
        Nombre: repartidorEditado.value.Nombre,
        ApellidoPaterno: repartidorEditado.value.ApellidoPaterno,
        ApellidoMaterno: repartidorEditado.value.ApellidoMaterno ?? null,
    FechaDeNacimiento: calcularEdad(repartidorEditado.value.FechaDeNacimiento) < 18 ? null : repartidorEditado.value.FechaDeNacimiento,
    IdEmail: repartidorEditado.value.Email?.IdEmail ?? null,
        Email: repartidorEditado.value.Email?.Email ?? "",
        IdGenero: repartidorEditado.value.Genero.IdGenero,
        Imagen: repartidorEditado.value.Imagen,
        Url:repartidorEditado.value?.Imagen?.Url,
        IdImagen:repartidorEditado.value?.Imagen?.IdImagen,
        Celulares: repartidorEditado.value.Celulares.map(c => ({
            IdCelular:c?.IdCelular,
            Numero: c.Numero
        })),
      Documento: repartidorEditado.value.Documento.map(d => ({
    IdDocumento: d.IdDocumento ?? null,
    Documento: d.Documento,
    Tipodocumento: d.Tipodocumento?.IdTipoDocumento ?? null,
    Complemento: d.Complemento?.IdComplemento ?? null
}))
  };
console.log('Datos del repartidor a enviar:', dato);
  let response ='';
    if (esNuevoRepartidor.value) {
      response = await registrarRepartidor(dato);
    } else {
      response = await actualizarRepartidor(dato);
    
    }
      mostrarNotificacion(response.message);
    cancelarModoEdicion();
    await cargarDatosIniciales();
  } catch (error) {
    console.error('Error al guardar el repartidor:', error);
  }
};

const confirmarCambioEstado = (repartidor) => {
  repartidorParaAccion.value = { IdRepartidor: repartidor.IdRepartidor, nombre: `${repartidor.Persona.Nombre} ${repartidor.Persona.ApellidoPaterno}`, estadoActual: repartidor.Estado.IdEstado };
  mensajeModal.value = repartidor.Estado.IdEstado === 1 ? "Desactivar" : "Activar";
  modalAct.value = true;
};

const cerrarModalConfirmacion = () => {
  modalAct.value = false;
  repartidorParaAccion.value = null;
};

const confirmar = async () => {
  if (repartidorParaAccion.value) {
    try {
      try {
      const response = await cambiarEstadoRepartidor(repartidorParaAccion.value.IdRepartidor);
      mostrarNotificacion(response.message);
      await cargarDatosIniciales();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }
  cerrarModalConfirmacion();
};

const agregarCelular = () => {
  const celulares = repartidorEditado.value.Celulares;
  if (celulares.length < 4) {
    if (celulares.length === 0 || celulares[celulares.length - 1].Numero.trim() !== '') {
      celulares.push({ Numero: '' });
    }
  }
};

const eliminarCelular = (index) => {
  if (repartidorEditado.value.Celulares.length > 1) {
    repartidorEditado.value.Celulares.splice(index, 1);
    // Re-validate the first cellular number if it was affected
    if (index === 0 && repartidorEditado.value.Celulares.length > 0) {
      errors.celular = validateField('celular', repartidorEditado.value.Celulares[0].Numero);
    } else if (repartidorEditado.value.Celulares.length === 0) {
      errors.celular = validateField('celular', ''); // Clear error if no numbers left
    }
  } else if (repartidorEditado.value.Celulares.length === 1) {
    // If only one number, clear it and trigger validation
    repartidorEditado.value.Celulares[0].Numero = '';
    errors.celular = validateField('celular', '');
  }
};

const updateCelular = (index, value) => {
  repartidorEditado.value.Celulares[index].Numero = value;
  errors.celular = validateField('celular', repartidorEditado.value.Celulares[0].Numero);
};

const updateDocumento = (index, value) => {
  repartidorEditado.value.Documento[index].Documento = value;
  if (index === 0) {
    errors.ci = validateField('ci', repartidorEditado.value.Documento[0].Documento);
  } else if (index === 1) {
    errors.nit = validateField('nit', repartidorEditado.value.Documento[1].Documento);
  }
};

const updateDocumentoComplemento = (index, value) => {
  repartidorEditado.value.Documento[index].Complemento.IdComplemento = value;
};


const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 0; // Return 0 or handle as needed if date is not set
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

// --- Lifecycle Hook ---
onMounted(() => {
  resetRepartidorEditado();
  cargarDatosIniciales();
});
// esto es lo que fevuelve la lista para repartidores 
// [
//     {
//         "IdRepartidor": "09112025REP-1",
//         "TipoVehiculo": "Moto",
//         "PlacaVehiculo": "",
//         "NumeroLicencia": "5298",
//         "Persona": {
//             "IdPersona": "09112025PER-11",
//             "Nombre": "Hugo",
//             "ApellidoPaterno": "Arenas",
//             "ApellidoMaterno": null,
//             "FechaDeNacimiento": null,
//             "FechaRegistro": "2025-09-11",
//             "FechaActualizacion": null,
//             "Email": {
//                 "IdEmail": "09112025EM-4",
//                 "Email": "Hugo@gmail.com"
//             },
//             "Genero": {
//                 "IdGenero": 1,
//                 "Nombre": "Masculino"
//             },
//             "Imagen": null,
//             "Celulares": [
//                 {
//                     "IdCelular": "09112025CEL-2",
//                     "Numero": "74232"
//                 }
//             ],
//             "Documento": [
//                 {
//                     "IdDocumento": "09112025DC-2",
//                     "Documento": "32414",
//                     "Tipodocumento": null,
//                     "Complemento": null
//                 }
//             ]
//         },
//         "Estado": {
//             "IdEstado": 1,
//             "Nombre": "Activo"
//         },
//         "EmpresaReparto": {
//             "IdEmpresaReparto": "EMP-001",
//             "NombreEmpresa": "PedidosYa"
//         },
//         "TipoLicencia": {
//             "IdTipoLicencia": "LIC-001",
//             "NombreTipoLicencia": "Categoría A - Bicicletas y Motos"
//         }
//     }
// ]
</script>