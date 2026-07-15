<template>
  <div class="space-y-8">
    <div class="relative overflow-hidden animate-fade-in-up">
      <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <div class="flex items-center gap-4">
          <button @click="$emit('cancelar')" class="rounded-2xl hover:bg-orange-50 p-2 transition-colors">
            <ArrowLeft class="h-5 w-5" />
          </button>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <UserPlus class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                {{ esNuevo ? 'Registrar' : 'Actualizar' }} Persona
              </h1>
              <p class="text-gray-600 mt-1">
                {{ esNuevo ? 'Crea una nueva persona en el sistema' : 'Modifica los datos de la persona' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-2 space-y-6 animate-fade-in-up delay-100">
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
          <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <User class="h-5 w-5 text-orange-600" />
              Informacion Personal
            </h3>
          </div>

          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <User class="h-5 w-5 mr-2 text-orange-500" /> Nombre
                </label>
                <input
                  v-model="form.nombre"
                  @input="errors.nombre = validateField('nombre', form.nombre)"
                  @blur="errors.nombre = validateField('nombre', form.nombre)"
                  :class="inputClass('nombre')"
                  placeholder="Ingresa el nombre"
                />
                <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <User class="h-5 w-5 mr-2 text-orange-500" /> Clasificación
                </label>
                <select
                  v-model="form.tipo"
                  :class="inputClass('tipo')"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="REVENDEDOR">REVENDEDOR</option>
                  <option value="EMPRESA">EMPRESA</option>
                   <option value="CLIENTE_REVENDEDOR">CLIENTE_REVENDEDOR</option>
                </select>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <User class="h-5 w-5 mr-2 text-orange-500" /> Apellido Paterno
                </label>
                <input
                  v-model="form.apellidopaterno"
                  @input="errors.apellidopaterno = validateField('apellidopaterno', form.apellidopaterno)"
                  @blur="errors.apellidopaterno = validateField('apellidopaterno', form.apellidopaterno)"
                  :class="inputClass('apellidopaterno')"
                  placeholder="Ingresa el apellido paterno"
                />
                <p v-if="errors.apellidopaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidopaterno }}</p>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <User class="h-5 w-5 mr-2 text-orange-500" /> Apellido Materno
                </label>
                <input
                  v-model="form.apellidomaterno"
                  @input="errors.apellidomaterno = validateField('apellidomaterno', form.apellidomaterno)"
                  @blur="errors.apellidomaterno = validateField('apellidomaterno', form.apellidomaterno)"
                  :class="inputClass('apellidomaterno')"
                  placeholder="Ingresa el apellido materno (opcional)"
                />
                <p v-if="errors.apellidomaterno" class="text-red-500 text-xs italic mt-1">{{ errors.apellidomaterno }}</p>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <Calendar class="h-5 w-5 mr-2 text-orange-500" /> Fecha de Nacimiento
                </label>
                <input v-model="form.fechadenacimiento" type="date" :class="inputClass('fechadenacimiento')" />
              </div>

              <div class="md:col-span-2">
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <Accessibility class="h-5 w-5 mr-2 text-orange-500" /> Genero
                </label>
                <div class="flex gap-3">
                  <label
                    v-for="g in generos"
                    :key="g.value"
                    :class="[
                      'flex items-center gap-2 px-5 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 font-medium text-sm select-none',
                      form.genero === g.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 text-gray-600'
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="form.genero"
                      :value="g.value"
                      class="hidden"
                      @change="errors.genero = validateField('genero', form.genero)"
                    />
                    <span>{{ g.emoji }}</span>
                    {{ g.label }}
                  </label>
                </div>
                <p v-if="errors.genero" class="text-red-500 text-xs italic mt-1">{{ errors.genero }}</p>
              </div>

              <div class="md:col-span-2">
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <Smartphone class="h-5 w-5 mr-2 text-orange-500" /> Celulares
                </label>
                <div
                  v-for="(cel, index) in form.celulares"
                  :key="index"
                  class="flex items-center gap-2 mb-2"
                >
                  <input
                    v-model="form.celulares[index].numero"
                    @input="index === 0 ? errors.celular = validateField('celular', form.celulares[0].numero) : null"
                    @blur="index === 0 ? errors.celular = validateField('celular', form.celulares[0].numero) : null"
                    :placeholder="'Celular #' + (index + 1)"
                    :class="[inputClass(null), { 'ring-2 ring-red-500/20 bg-red-50': errors.celular && index === 0 }]"
                  />
                  <button
                    type="button"
                    @click="eliminarCelular(index)"
                    :disabled="form.celulares.length === 1"
                    class="text-red-500 hover:text-red-700 p-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
                <p v-if="errors.celular" class="text-red-500 text-xs italic mt-1">{{ errors.celular }}</p>
                <button
                  type="button"
                  @click="agregarCelular"
                  :disabled="form.celulares.length >= 4"
                  class="text-sm text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                  + Agregar otro numero
                </button>
              </div>

              <div class="md:col-span-2">
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <IdCard class="h-5 w-5 mr-2 text-orange-500" /> Cedula de Identidad
                </label>
                <div class="flex">
                  <input
                    v-model="form.documento"
                    @input="errors.documento = validateField('documento', form.documento)"
                    @blur="errors.documento = validateField('documento', form.documento)"
                    :class="['w-full pl-4 pr-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-l-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.documento }]"
                    placeholder="Numero de CI"
                  />
                  <select
                    v-model="form.idcomplemento"
                    class="pl-3 pr-4 py-4 border-l border-gray-200 shadow-md bg-gray-50/80 rounded-r-2xl transition-all duration-300 text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option :value="''">Sin complemento</option>
                    <option v-for="comp in complementos" :key="comp.idcomplemento ?? comp.IdComplemento" :value="comp.idcomplemento ?? comp.IdComplemento">
                      {{ comp.nombre ?? comp.Nombre ?? comp.descripcion ?? comp.Descripcion }}
                    </option>
                  </select>
                </div>
                <p v-if="errors.documento" class="text-red-500 text-xs italic mt-1">{{ errors.documento }}</p>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <Map class="h-5 w-5 mr-2 text-orange-500" /> Barrio
                </label>
                <Combobox v-model="form.barrio" by="idbarrio">
                  <div class="relative">
                    <ComboboxInput
                      class="w-full pl-4 pr-10 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                      :displayValue="(b) => b?.nombre || ''"
                      @change="queryBarrio = $event.target.value"
                      placeholder="Buscar barrio..."
                    />
                    <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon class="h-5 w-5 text-orange-500" />
                    </ComboboxButton>
                    <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryBarrio = ''">
                      <ComboboxOptions class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none">
                        <div v-if="barriosFiltrados.length === 0 && queryBarrio !== ''" class="px-4 py-3 text-gray-500 select-none">
                          No se encontraron resultados.
                        </div>
                        <ComboboxOption
                          v-for="barrio in barriosFiltrados"
                          :key="barrio.idbarrio"
                          :value="barrio"
                          v-slot="{ selected, active }"
                        >
                          <li :class="[active ? 'bg-orange-500 text-white' : 'text-gray-700', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                            <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ barrio.nombre }}</span>
                            <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3">
                              <CheckIcon class="h-5 w-5" :class="active ? 'text-white' : 'text-orange-500'" />
                            </span>
                          </li>
                        </ComboboxOption>
                      </ComboboxOptions>
                    </TransitionRoot>
                  </div>
                </Combobox>
                <p v-if="errors.barrio" class="text-red-500 text-xs italic mt-1">{{ errors.barrio }}</p>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <MapPin class="h-5 w-5 mr-2 text-orange-500" /> Direccion
                </label>
                <input
                  v-model="form.direccion"
                  @input="errors.direccion = validateField('direccion', form.direccion)"
                  @blur="errors.direccion = validateField('direccion', form.direccion)"
                  :class="inputClass('direccion')"
                  placeholder="Direccion completa"
                />
                <p v-if="errors.direccion" class="text-red-500 text-xs italic mt-1">{{ errors.direccion }}</p>
              </div>

              <div>
                <label class="flex items-center text-gray-700 font-semibold mb-2">
                  <ClipboardList class="h-5 w-5 mr-2 text-orange-500" /> Referencia
                </label>
                <input
                  v-model="form.referencia"
                  @input="errors.referencia = validateField('referencia', form.referencia)"
                  @blur="errors.referencia = validateField('referencia', form.referencia)"
                  :class="inputClass('referencia')"
                  placeholder="Referencia de la direccion"
                />
                <p v-if="errors.referencia" class="text-red-500 text-xs italic mt-1">{{ errors.referencia }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Session Table -->
        <div v-if="esNuevo && registrosSesion.length > 0" class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden animate-fade-in-up">
          <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <UserPlus class="h-5 w-5 text-orange-600" />
              Registros de esta sesión ({{ registrosSesion.length }})
            </h3>
          </div>
          <div class="p-6 overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-gray-400 text-sm uppercase tracking-wider">
                  <th class="pb-3 pr-4">#</th>
                  <th class="pb-3 pr-4">Nombre</th>
                  <th class="pb-3 pr-4">Apellido</th>
                  <th class="pb-3 pr-4">Tipo</th>
                  <th class="pb-3 pr-4">Documento</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(r, i) in registrosSesion" :key="r.id" class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-3 pr-4 font-bold text-gray-700">{{ i + 1 }}</td>
                  <td class="py-3 pr-4 text-gray-800">{{ r.nombre }}</td>
                  <td class="py-3 pr-4 text-gray-600">{{ r.apellidoPaterno }}</td>
                  <td class="py-3 pr-4">
                    <span :class="['px-3 py-1 rounded-full text-xs font-bold',
                      r.tipo === 'EMPLEADO' ? 'bg-blue-100 text-blue-600' :
                      r.tipo === 'USUARIO' ? 'bg-purple-100 text-purple-600' :
                      r.tipo === 'PROVEEDOR' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-orange-100 text-orange-600']">{{ r.tipo }}</span>
                  </td>
                  <td class="py-3 pr-4 text-gray-600">{{ r.documento || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div class="space-y-6">
        <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden animate-fade-in-up delay-200">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <Camera class="h-5 w-5 text-blue-600" />
              Foto de Perfil
            </h3>
          </div>
          <div class="p-6 text-center">
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden shadow-lg mx-auto mb-4">
              <img v-if="previewUrl" :src="previewUrl" alt="Vista previa" class="w-full h-full object-cover" />
              <User v-else class="h-16 w-16 text-white" />
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleArchivo"
              class="w-full py-3 px-4 border-0 shadow-md bg-gray-50/80 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
            />
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden animate-fade-in-up delay-300">
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <Mail class="h-5 w-5 text-green-600" />
              Contacto
            </h3>
          </div>
          <div class="p-6">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Mail class="h-5 w-5 mr-2 text-green-500" /> Email
            </label>
            <input
              v-model="form.email"
              type="email"
              @input="errors.email = validateField('email', form.email)"
              @blur="errors.email = validateField('email', form.email)"
              :class="['w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30', { 'ring-2 ring-red-500/20 bg-red-50': errors.email }]"
              placeholder="ejemplo@gmail.com"
            />
            <p v-if="errors.email" class="text-red-500 text-xs italic mt-1">{{ errors.email }}</p>
          </div>
        </div>

        <!-- Datos de Usuario (opcional) -->
        <div v-if="esNuevo" class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden animate-fade-in-up delay-400">
          <div class="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <Shield class="h-5 w-5 text-purple-600" />
              Datos de Usuario <span class="text-sm font-normal text-gray-500 ml-2">(opcional — si no se ingresa contraseña no se crea)</span>
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Contraseña</label>
                <input v-model="usuarioForm.password" type="password" placeholder="Ingrese contraseña" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl outline-none text-gray-700" />
                <p class="text-xs text-gray-400 mt-1">El nombre de usuario será el email registrado</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Repetir Contraseña</label>
                <input v-model="usuarioForm.confirmPassword" type="password" placeholder="Repita la contraseña" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl outline-none text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        <!-- Datos Laborales (opcional) -->
        <div v-if="esNuevo" class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden animate-fade-in-up delay-400">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <Briefcase class="h-5 w-5 text-blue-600" />
              Datos Laborales <span class="text-sm font-normal text-gray-500 ml-2">(opcional)</span>
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Sucursal</label>
                <select v-model="empleadoForm.idsucursal" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl outline-none text-gray-700">
                  <option value="">Seleccionar</option>
                  <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">{{ s.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Cargo</label>
                <select v-model="empleadoForm.idcargo" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl outline-none text-gray-700">
                  <option value="">Seleccionar</option>
                  <option v-for="c in cargos" :key="c.idcargo" :value="c.idcargo">{{ c.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Fecha Ingreso</label>
                <input v-model="empleadoForm.fechaingreso" type="date" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl outline-none text-gray-700" />
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Salario (Bs.)</label>
                <input v-model.number="empleadoForm.salario" type="number" min="0" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl outline-none text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        <!-- Datos de Proveedor (opcional) -->
        <div v-if="esNuevo" class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden animate-fade-in-up delay-400">
          <div class="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 p-6">
            <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
              <Truck class="h-5 w-5 text-emerald-600" />
              Datos de Proveedor <span class="text-sm font-normal text-gray-500 ml-2">(opcional)</span>
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">NIT</label>
                <input v-model="proveedorForm.nit" type="text" placeholder="Ingrese NIT" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl outline-none text-gray-700" />
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Razón Social</label>
                <input v-model="proveedorForm.razonSocial" type="text" placeholder="Ingrese razón social" class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl outline-none text-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 animate-fade-in-up delay-400">
      <button
        type="button"
        @click="$emit('cancelar')"
        class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2"
      >
        <X class="h-4 w-4" />
        Cancelar
      </button>

      <template v-if="esNuevo">
        <button
          v-if="registrosSesion.length > 0"
          @click="finalizar"
          :disabled="guardando"
          class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-75"
        >
          <LoaderCircle v-if="guardando" class="animate-spin h-4 w-4" />
          <UserPlus v-else class="h-4 w-4" />
          Finalizar
        </button>
        <button
          @click="guardarYContinuar"
          :disabled="guardando"
          class="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-75"
        >
          <LoaderCircle v-if="guardando" class="animate-spin h-4 w-4" />
          <Save v-else class="h-4 w-4" />
          Registrar y Continuar
        </button>
      </template>

      <button
        v-else
        @click="guardar"
        :disabled="guardando"
        class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-75"
      >
        <LoaderCircle v-if="guardando" class="animate-spin h-4 w-4" />
        <Save v-else class="h-4 w-4" />
        Actualizar Persona
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import {
  User, ArrowLeft, UserPlus, Camera, Save, X,
  IdCard, Mail, Calendar, MapPin, ClipboardList,
  Map, Smartphone, Accessibility, LoaderCircle,
  Building2, Briefcase, Shield, Truck
} from 'lucide-vue-next';
import {
  Combobox, ComboboxInput, ComboboxButton,
  ComboboxOptions, ComboboxOption, TransitionRoot
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import { listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';
import { listarCargo } from '@/Server/Empleado';
import { Listsucursal } from '@/Server/Sucural';
import { RegistrarPersona } from '@/Server/persona';
import { SubirFoto } from '@/Server/api';

const props = defineProps({
  persona: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
  complementos: { type: Array, default: () => [] },
  barrios: { type: Array, default: () => [] },
});

const emit = defineEmits(['cancelar', 'guardar', 'finalizar']);

const esNuevo = computed(() => !(props.persona?.idpersona ?? props.persona?.IdPersona));
const previewUrl = ref('');
const fileInput = ref(null);
const archivo = ref(null);
const queryBarrio = ref('');

const docsRegistrados = ref([]);
const emailsRegistrados = ref([]);
const numerosRegistrados = ref([]);

// Batch Registration State
const registrosSesion = ref([]);
const cargos = ref([]);
const sucursales = ref([]);
const guardando = ref(false);

// Empleado extra fields
const empleadoForm = reactive({
  idsucursal: '',
  idcargo: '',
  fechaingreso: new Date().toISOString().split('T')[0],
  salario: 0,
});

// Proveedor extra fields
const proveedorForm = reactive({
  nit: '',
  razonSocial: '',
});

// Usuario extra fields
const usuarioForm = reactive({
  password: '',
  confirmPassword: '',
});

const limpiarExtras = () => {
  empleadoForm.idsucursal = '';
  empleadoForm.idcargo = '';
  empleadoForm.fechaingreso = new Date().toISOString().split('T')[0];
  empleadoForm.salario = 0;
  proveedorForm.nit = '';
  proveedorForm.razonSocial = '';
  usuarioForm.password = '';
  usuarioForm.confirmPassword = '';
};

onMounted(async () => {
  try {
    const [docs, emails, nums, carg, sucs] = await Promise.all([
      listarDocumento(),
      listarEmail(),
      listarNumero(),
      listarCargo(),
      Listsucursal(),
    ]);
    docsRegistrados.value = docs || [];
    emailsRegistrados.value = emails || [];
    numerosRegistrados.value = nums || [];
    cargos.value = carg?.result || carg?.data || carg || [];
    sucursales.value = sucs?.result || sucs?.data || sucs || [];
  } catch (error) {
    console.error('Error al cargar datos de validación:', error);
  }
});

const formVacio = () => ({
  idpersona: null,
  nombre: '',
  tipo: 'NORMAL',
  apellidopaterno: '',
  apellidomaterno: '',
  fechadenacimiento: '',
  genero: 1,
  email: '',
  imagen: '',
  iddocumento: null,
  documento: '',
  idcomplemento: props.complementos[0]?.idcomplemento ?? props.complementos[0]?.IdComplemento ?? '',
  celulares: [{ idcelular: null, numero: '' }],
  barrio: null,
  direccion: '',
  referencia: '',
  iddireccion: null,
});
const desdePicker = ref(null);
const hastaPicker = ref(null);

const today = new Date().toISOString().split('T')[0];

const form = reactive(formVacio());
const errors = reactive({
  nombre: '',
  apellidopaterno: '',
  apellidomaterno: '',
  fechadenacimiento: new Date().toISOString().split('T')[0],
  genero: '',
  email: '',
  documento: '',
  celular: '',
  barrio: '',
  direccion: '',
  referencia: '',
});

const generos = [
  { value: 1, label: 'Hombre', emoji: 'H' },
  { value: 2, label: 'Mujer', emoji: 'M' },
  { value: 3, label: 'Otro', emoji: 'O' },
];

const formatDateLatino = (date) => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};
// Normalizar barrios para tener una estructura consistente
const barriosNormalizados = computed(() => 
  props.barrios.map(b => ({
    idbarrio: b.idbarrio ?? b.IdBarrio,
    nombre: b.nombre ?? b.Nombre
  }))
);

const barriosFiltrados = computed(() =>
  queryBarrio.value === ''
    ? barriosNormalizados.value
    : barriosNormalizados.value.filter((b) =>
        b.nombre.toLowerCase().includes(queryBarrio.value.toLowerCase())
      )
);

const inicializar = () => {
  const p = props.persona;
  Object.assign(form, formVacio());
  previewUrl.value = '';
  archivo.value = null;

  if (p) {
    const fechaNacimiento = p.fechadenacimiento ?? p.FechaDeNacimiento ?? '';
    const generoActual = p.genero ?? p.Genero;

    form.idpersona = p.idpersona ?? p.IdPersona ?? null;
    form.nombre = p.nombre ?? p.Nombre ?? '';
    form.tipo = p.tipo ?? p.Tipo ?? 'NORMAL';
    form.apellidopaterno = p.apellidopaterno ?? p.ApellidoPaterno ?? '';
    form.apellidomaterno = p.apellidomaterno ?? p.ApellidoMaterno ?? '';
    form.fechadenacimiento = fechaNacimiento ? String(fechaNacimiento).substring(0, 10) : '';
    form.genero = typeof generoActual === 'object'
      ? Number(generoActual?.idgenero ?? generoActual?.IdGenero ?? 1)
      : (generoActual === 'Mujer' ? 2 : generoActual === 'Otro' ? 3 : Number(generoActual) || 1);
    form.email = p.email ?? p.Email ?? '';
    form.imagen = p.imagen ?? p.Imagen ?? '';
    previewUrl.value = form.imagen;
    form.iddocumento = p.documento?.[0]?.iddocumento ?? p.documento?.[0]?.IdDocumento ?? null;
    form.documento = p.documento?.[0]?.documento ?? p.documento?.[0]?.Documento ?? '';
    form.idcomplemento = p.documento?.[0]?.complemento?.idcomplemento
      ?? p.documento?.[0]?.complemento?.IdComplemento
      ?? props.complementos[0]?.idcomplemento
      ?? props.complementos[0]?.IdComplemento
      ?? '';
    form.celulares = p.celulares?.length
      ? p.celulares.map((c) => ({
          idcelular: c.idcelular ?? c.IdCelular ?? null,
          numero: c.numero ?? c.Numero ?? '',
        }))
      : [{ idcelular: null, numero: '' }];
    form.barrio = p.direccion?.barrio
      ? {
          idbarrio: p.direccion.barrio.idbarrio ?? p.direccion.barrio.IdBarrio,
          nombre: p.direccion.barrio.nombre ?? p.direccion.barrio.Nombre,
        }
      : null;
    form.iddireccion = p.direccion?.iddireccion ?? p.direccion?.IdDireccion ?? null;
    form.direccion = p.direccion?.direccion ?? p.direccion?.Direccion ?? '';
    form.referencia = p.direccion?.referencia ?? p.direccion?.Referencia ?? '';
  }

  Object.keys(errors).forEach((k) => {
    errors[k] = '';
  });
};

watch(() => props.persona, inicializar, { immediate: true });

const inputBase = 'w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30';

const inputClass = (campo) =>
  campo && errors[campo]
    ? `${inputBase} ring-2 ring-red-500/20 bg-red-50`
    : inputBase;

const validateField = (field, value) => {
  let error = '';
  const editing = !esNuevo.value;
  const currentEmail = (props.persona?.email ?? props.persona?.Email ?? '').toLowerCase();

  switch (field) {
    case 'nombre':
      if (!value?.trim()) error = 'El nombre es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]+$/.test(value)) error = 'Solo puede contener letras y espacios.';
      break;
    case 'apellidopaterno':
      if (!value?.trim()) error = 'El apellido paterno es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]+$/.test(value)) error = 'Solo puede contener letras y espacios.';
      break;
    case 'apellidomaterno':
      if (value && !/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]+$/.test(value)) error = 'Solo puede contener letras y espacios.';
      break;
    case 'genero':
      if (!value) error = 'El genero es requerido.';
      break;
    case 'email':
      if (!value) error = 'El correo electronico es requerido.';
      else if ((value.match(/@/g) || []).length !== 1) error = 'El correo debe contener exactamente un @';
      else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = 'El correo no tiene un formato valido.';
      else if (!/^[a-zA-Z0-9._]+@/.test(value)) error = 'El correo contiene caracteres no validos.';
      else if (emailsRegistrados.value.some((e) => {
        const mail = (e.email || e.Email || '').toLowerCase();
        return mail === value.toLowerCase() && (!editing || mail !== currentEmail);
      })) {
        error = 'Este correo ya esta en uso.';
      }
      break;
    case 'documento':
      const currentDoc = props.persona?.documento?.[0]?.documento ?? props.persona?.documento?.[0]?.Documento;
      if (!value?.trim()) error = 'El numero de CI es requerido.';
      else if (!/^\d+$/.test(value)) error = 'El CI solo puede contener numeros.';
      else if (docsRegistrados.value.some((d) => {
        const docVal = d.documento || d.Documento;
        return docVal === value && (!editing || docVal !== currentDoc);
      })) {
        error = 'Este numero de CI ya esta registrado.';
      }
      break;
    case 'celular':
      const currentCel = props.persona?.celulares?.[0]?.numero ?? props.persona?.celulares?.[0]?.Numero;
      if (!value?.trim()) error = 'El celular es requerido.';
      else if (/\D/.test(value)) error = 'Solo debe contener numeros.';
      else if (value.length < 7) error = 'Debe tener al menos 7 digitos.';
      else if (numerosRegistrados.value.some((c) => {
        const numVal = c.numero || c.Numero;
        return numVal === value && (!editing || numVal !== currentCel);
      })) {
        error = 'Este numero ya esta registrado.';
      }
      break;
    case 'barrio':
      // if (!form.barrio?.idbarrio) error = 'Debe seleccionar un barrio.';
      break;
    case 'direccion':
      if (value && !/^[a-zA-Z0-9\s.,#\-ñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'La direccion contiene caracteres no validos.';
      break;
    case 'referencia':
      if (value && !/^[a-zA-Z0-9\s.,#\-ñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) error = 'La referencia contiene caracteres no validos.';
      break;
  }

  return error;
};

const validateForm = () => {
  errors.nombre = validateField('nombre', form.nombre);
  errors.apellidopaterno = validateField('apellidopaterno', form.apellidopaterno);
  errors.apellidomaterno = validateField('apellidomaterno', form.apellidomaterno);
  errors.genero = validateField('genero', form.genero);
  errors.email = validateField('email', form.email);
  errors.documento = validateField('documento', form.documento);
  errors.celular = validateField('celular', form.celulares[0]?.numero);
  errors.barrio = validateField('barrio', form.barrio);
  errors.direccion = validateField('direccion', form.direccion);
  errors.referencia = validateField('referencia', form.referencia);

  return Object.values(errors).every((e) => !e);
};

const handleArchivo = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  archivo.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const agregarCelular = () => {
  if (form.celulares.length >= 4) return;
  const ultimo = form.celulares[form.celulares.length - 1];
  if (!ultimo || ultimo.numero.trim() !== '') {
    form.celulares.push({ idcelular: null, numero: '' });
  }
};

const eliminarCelular = (index) => {
  if (form.celulares.length > 1) {
    form.celulares.splice(index, 1);
  }
};

const tieneDatosEmpleado = () => empleadoForm.idcargo || empleadoForm.idsucursal;
const tieneDatosProveedor = () => proveedorForm.nit.trim();
const tieneDatosUsuario = () => usuarioForm.password.trim();

const construirPayload = () => ({
  IdPersona: form.idpersona,
  Nombre: form.nombre.trim(),
  Tipo: form.tipo,
  ApellidoPaterno: form.apellidopaterno.trim(),
  ApellidoMaterno: form.apellidomaterno.trim(),
  FechaDeNacimiento: form.fechadenacimiento,
  IdGenero: Number(form.genero),
  Email: form.email.trim(),
  Url: form.imagen,
  archivo: archivo.value,
  Celulares: form.celulares
    .filter((c) => c.numero?.trim())
    .map((c) => ({
      IdCelular: c.idcelular ?? null,
      Numero: c.numero.trim(),
    })),
  Documento: [{
    IdDocumento: form.iddocumento,
    Documento: form.documento.trim(),
    IdTipodocumento: 2,
    Complemento: form.idcomplemento || null,
  }],
  Direccion: {
    IdDireccion: form.iddireccion,
    IdBarrio: form.barrio?.idbarrio ?? null,
    Direccion: form.direccion.trim(),
    Referencia: form.referencia.trim(),
  },
  // Auto-detect types based on filled fields
  crearEmpleado: tieneDatosEmpleado(),
  crearUsuario: tieneDatosUsuario(),
  crearProveedor: tieneDatosProveedor(),
  // Extra data
  ...(tieneDatosEmpleado() ? {
    IdSucursal: empleadoForm.idsucursal || null,
    Cargos: empleadoForm.idcargo ? [empleadoForm.idcargo] : [],
    FechaIngreso: empleadoForm.fechaingreso || null,
    Salario: empleadoForm.salario || 0,
    fecha: new Date().toISOString().substring(0, 10),
  } : {}),
  ...(tieneDatosProveedor() ? {
    Nit: proveedorForm.nit.trim(),
    RazonSocial: proveedorForm.razonSocial.trim() || null,
  } : {}),
  ...(tieneDatosUsuario() ? {
    Contrasena: usuarioForm.password,
  } : {}),
});

const limpiarFormulario = () => {
  Object.assign(form, formVacio());
  archivo.value = null;
  previewUrl.value = '';
  limpiarExtras();
  Object.keys(errors).forEach(k => errors[k] = '');
};

const guardar = () => {
  if (!validateForm()) return;
  emit('guardar', construirPayload());
};

const enviarPayload = async (payload) => {
  let imageUrl = payload.Url ?? '';
  if (payload.archivo) {
    imageUrl = await SubirFoto(payload.archivo);
  }
  const data = {
    IdPersona: payload.IdPersona,
    Nombre: payload.Nombre,
    Tipo: payload.Tipo,
    ApellidoPaterno: payload.ApellidoPaterno,
    ApellidoMaterno: payload.ApellidoMaterno,
    FechaDeNacimiento: payload.FechaDeNacimiento,
    IdGenero: payload.IdGenero,
    Email: payload.Email,
    Url: imageUrl,
    IdDireccion: payload.Direccion?.IdDireccion ?? null,
    IdBarrio: payload.Direccion?.IdBarrio ?? null,
    Direccion: payload.Direccion?.Direccion ?? '',
    Referencia: payload.Direccion?.Referencia ?? '',
    Celulares: payload.Celulares ?? [],
    Documento: payload.Documento ?? [],
    crearEmpleado: payload.crearEmpleado,
    crearUsuario: payload.crearUsuario,
    crearProveedor: payload.crearProveedor,
    IdSucursal: payload.IdSucursal,
    Cargos: payload.Cargos,
    FechaIngreso: payload.FechaIngreso,
    Salario: payload.Salario,
    fecha: payload.fecha,
    Nit: payload.Nit,
    RazonSocial: payload.RazonSocial,
    IdTipoProveedor: payload.IdTipoProveedor,
    Contrasena: payload.Contrasena,
  };
  return await RegistrarPersona(data);
};

const guardarYContinuar = async () => {
  if (!validateForm()) return;
  guardando.value = true;
  try {
    const payload = construirPayload();
    const respuesta = await enviarPayload(payload);
    const id = respuesta?.IdPersona || respuesta?.idpersona || respuesta?.data?.IdPersona;

    const tiposCreados = [];
    if (payload.crearEmpleado) tiposCreados.push('EMPLEADO');
    if (payload.crearUsuario) tiposCreados.push('USUARIO');
    if (payload.crearProveedor) tiposCreados.push('PROVEEDOR');
    if (tiposCreados.length === 0) tiposCreados.push(form.tipo);

    registrosSesion.value.push({
      id: id || Date.now(),
      nombre: payload.Nombre,
      apellidoPaterno: payload.ApellidoPaterno,
      tipo: tiposCreados.join(' + '),
      documento: payload.Documento[0]?.Documento || '',
    });
    limpiarFormulario();
  } catch (error) {
    console.error('Error al registrar:', error);
  } finally {
    guardando.value = false;
  }
};

const finalizar = async () => {
  const tieneDatos = form.nombre.trim() || form.documento.trim();
  if (tieneDatos) {
    if (!validateForm()) return;
    guardando.value = true;
    try {
      const payload = construirPayload();
      await enviarPayload(payload);
    } catch (error) {
      console.error('Error al registrar último:', error);
      guardando.value = false;
      return;
    }
    guardando.value = false;
  }
  emit('finalizar', {
    sesion: [...registrosSesion.value],
    cerrar: true,
  });
  emit('cancelar');
};
</script>
