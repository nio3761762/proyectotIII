<template>
  <div class="animate-fade-in space-y-6 pb-20">
    <!-- Header -->
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-linear-to-br from-orange-50 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
            <Package class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Registro de Entregas y Ajustes
            </h1>
            <p class="text-gray-600 text-sm">Gestiona entregas y liquidaciones para varias personas en un solo lote</p>
          </div>
        </div>
        
        <button
          @click="$emit('cancel')"
          class="p-3 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <X class="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>

    <!-- Main Work Area -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Catalog (7 cols) -->
      <div class="lg:col-span-7">
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex flex-col h-full min-h-[600px]">
          <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <Search class="h-5 w-5 text-orange-500" />
            Catálogo de Productos
          </h3>

          <!-- Filtros -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="relative group">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input v-model="filtroNombre" type="text" placeholder="Buscar..."
                class="w-full pl-10 pr-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 font-bold text-xs outline-none transition-all" />
            </div>
            <select v-model="filtroCategoria" class="px-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 font-bold text-xs outline-none transition-all">
              <option value="TODOS">Categoría</option>
              <option v-for="cat in categorias" :key="cat.idcategoria" :value="cat.idcategoria">{{ cat.nombre }}</option>
            </select>
            <select v-model="filtroSubcategoria" :disabled="filtroCategoria === 'TODOS'"
              class="px-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 font-bold text-xs outline-none transition-all disabled:opacity-50">
              <option value="TODOS">Subcategoría</option>
              <option v-for="sc in subcategorias" :key="sc.idsubcategoria" :value="sc.idsubcategoria">{{ sc.nombre }}</option>
            </select>
          </div>

          <!-- Product Grid -->
          <div v-if="!idSucursalGeneral" class="flex-1 flex flex-col items-center justify-center text-gray-400 py-20">
             <div class="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
               <Building2 class="h-10 w-10 opacity-20" />
             </div>
             <p class="font-black uppercase tracking-widest text-[10px]">Selecciona la sucursal de origen</p>
          </div>
          
          <div v-else-if="loadingItems" class="flex-1 flex items-center justify-center py-20">
             <div class="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          </div>

          <div v-else class="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[450px]">
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 pb-4">
              <Productocard 
                v-for="p in productos" 
                :key="p.idproducto || p.IdProducto"
                :producto="p"
                :medidas="p.medidas || p.Productomedida || []"
                @select-medida="agregarProductoACurrent"
              />
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="idSucursalGeneral && productos.length > 0" class="pt-4 border-t border-gray-100 mt-4">
             <Paginado
               :paginaActual="paginacionProd.paginaActual"
               :totalPaginas="paginacionProd.totalPaginas"
               :total="paginacionProd.total"
               :limite="paginacionProd.limite"
               @update:paginaActual="onCambiarPaginaProd"
             />
          </div>
        </div>
      </div>

      <!-- Current Entry Editor (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-6">
        <!-- Configuration Area -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 space-y-4 relative z-10" style="overflow: visible;">
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">Sucursal de Salida</label>
            <select v-model="idSucursalGeneral" @change="onSucursalChange"
              class="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none transition-all shadow-inner">
              <option value="" disabled>Seleccionar Sucursal</option>
              <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">{{ s.nombre }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-gray-700">Fecha de Registro</label>
              <input v-model="fechaRegistro" type="date"
                class="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none transition-all shadow-inner" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-gray-700">Hora de Registro</label>
              <input v-model="horaRegistro" type="time"
                class="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none transition-all shadow-inner" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">Persona Actual</label>
            <div class="flex gap-2">
              <div class="relative flex-1 z-10">
                <Combobox v-model="currentPersonaId" nullable>
                  <div class="relative">
                    <ComboboxInput
                      class="w-full pl-10 pr-4 py-3 bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-gray-700 placeholder-gray-400 outline-none transition-all shadow-inner"
                      :displayValue="(id) => { if (!id) return ''; const p = personasDisponibles.find(per => (per.idpersona ?? per.idempleado ?? per.empleado?.idempleado) === id); return p ? `${p.nombre ?? p.Nombre} ${p.apellidopaterno ?? p.ApellidoPaterno}` : ''; }"
                      @change="queryPersona = $event.target.value"
                      placeholder="Buscar persona..."
                    />
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                    <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
                    </ComboboxButton>
                  </div>
                  <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryPersona = ''">
                    <ComboboxOptions class="absolute z-50 mt-1 w-full bg-white rounded-2xl shadow-lg border border-gray-200 max-h-60 overflow-auto py-1">
                      <div v-if="filteredPersonas.length === 0 && queryPersona !== ''" class="px-4 py-3 text-gray-500 text-sm text-center">
                        No se encontraron personas.
                      </div>
                      <ComboboxOption v-for="p in filteredPersonas" :key="p.idpersona ?? p.idempleado ?? p.empleado?.idempleado" :value="p.idpersona ?? p.idempleado ?? p.empleado?.idempleado" v-slot="{ selected, active }">
                        <li :class="['relative cursor-default select-none py-3 pl-10 pr-4', active ? 'bg-orange-500 text-white' : 'text-gray-900']">
                            <div :class="[selected ? 'font-medium' : 'font-normal']" class="flex items-center gap-3">
                             <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                               {{ ((p.nombre ?? p.Nombre)?.charAt(0) || '') + ((p.apellidopaterno ?? p.ApellidoPaterno)?.charAt(0) || '') }}
                             </div>
                             <div class="flex flex-col min-w-0">
                               <span class="truncate">{{ p.nombre ?? p.Nombre }} {{ p.apellidopaterno ?? p.ApellidoPaterno }}</span>
                             </div>
                           </div>
                          <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3">
                            <CheckIcon class="h-5 w-5" :class="active ? 'text-white' : 'text-orange-500'" />
                          </span>
                        </li>
                      </ComboboxOption>
                    </ComboboxOptions>
                  </TransitionRoot>
                </Combobox>
              </div>
              <button @click="abrirModalNuevaPersona" title="Agregar nueva persona"
                class="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg transition-all flex items-center gap-1 font-semibold text-sm">
                <UserPlus class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Current Products List -->
        <div class="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex flex-col min-h-[400px]">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
              <ShoppingCart class="h-4 w-4 text-orange-500" />
              Preparación: {{ currentPersonaNombre }}
            </h3>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 rounded-2xl p-4 border border-gray-100 mb-4">
            <div v-if="currentDetalles.length === 0" class="flex flex-col items-center justify-center h-full text-gray-300 py-10">
               <Package class="h-8 w-8 mb-2 opacity-10" />
               <p class="text-[9px] font-black uppercase tracking-widest text-center">Selecciona productos del catálogo</p>
            </div>
            
            <div class="space-y-3">
              <div v-for="(det, idx) in currentDetalles" :key="det.idProductoMedida" 
                class="bg-white p-3 rounded-2xl shadow-sm border border-orange-50 flex flex-col gap-3">
                
                <div class="flex gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                    <img v-if="det.imagen" :src="det.imagen" class="w-full h-full object-cover" />
                    <Package v-else class="h-5 w-5 text-orange-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[10px] font-black text-gray-800 truncate leading-tight">{{ det.nombre }}</p>
                    <p class="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{{ det.presentacion }}</p>
                    <div class="flex gap-2 mt-1">
                      <span class="text-[7px] font-black text-gray-400 uppercase">P.Venta: <b class="text-gray-500">Bs {{ det.precioNormal }}</b></span>
                      <span class="text-[7px] font-black text-orange-400 uppercase">P.Mayor: <b class="text-orange-600">Bs {{ det.precioMayor }}</b></span>
                      <span class="text-[7px] font-black text-emerald-400 uppercase">Com: <b class="text-emerald-600">Bs {{ det.comisionUnitaria }}</b></span>
                    </div>
                  </div>
                  <button @click="currentDetalles.splice(idx, 1)" class="text-red-300 hover:text-red-500 transition-colors">
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>

                <div class="flex items-center justify-between border-t border-gray-50 pt-2">
                   <div class="flex items-center gap-2">
                      <div class="flex items-center gap-1 bg-orange-50 rounded-lg p-1">
                        <button @click="updateQtyCurrent(idx, -1)" class="w-6 h-6 flex items-center justify-center bg-white rounded-md text-orange-600 text-[10px] font-black shadow-sm">-</button>
                        <input v-model.number="det.cantidadEntregada" type="number" min="0" class="w-14 text-center text-[10px] font-black bg-white border-0 rounded-md outline-none shadow-sm py-1 [&::-webkit-inner-spin-button]:opacity-100" />
                        <button @click="updateQtyCurrent(idx, 1)" class="w-6 h-6 flex items-center justify-center bg-white rounded-md text-orange-600 text-[10px] font-black shadow-sm">+</button>
                      </div>
                      <span class="text-[8px] font-black text-gray-400 uppercase">Entregados</span>
                   </div>
                   <button @click="openAjusteSubModal(idx)" 
                     class="px-3 py-1.5 bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-600 rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center gap-1 transition-all">
                     <Edit2 class="h-3 w-3" /> Ajustar
                   </button>
                </div>

                <div v-if="det.cantidadDevuelta > 0 || (det.ajustes && det.ajustes.length > 0)" class="flex flex-wrap gap-2 pt-1 border-t border-dashed border-orange-100">
                   <span v-if="det.cantidadDevuelta > 0" class="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[8px] font-black uppercase">No Vendido: {{ det.cantidadDevuelta }}</span>
                   <template v-for="(aj, aIdx) in (det.ajustes || [])" :key="aIdx">
                     <span class="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[8px] font-black uppercase">Ajuste #{{ aIdx + 1 }}: {{ aj.cantidad }} @ Bs {{ aj.precioVenta }}</span>
                   </template>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
             <div class="space-y-1.5">
               <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Observación Individual</label>
               <textarea v-model="currentObservacion" rows="2" placeholder="..."
                 class="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl font-bold text-[10px] text-gray-700 outline-none shadow-inner resize-none"></textarea>
             </div>
             
             <button @click="stageRegistro" :disabled="!isCurrentValid"
               class="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
               <Plus class="h-5 w-5" /> Añadir al Lote de Envío
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Summary Table (Footer List) -->
    <div v-if="loteRegistros.length > 0" class="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden animate-fade-in">
      <div class="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Users class="h-6 w-6" />
            </div>
            <div>
               <h3 class="text-xl font-bold text-gray-800 uppercase tracking-tight">Lote de Envío Preparado</h3>
               <p class="text-gray-500 text-xs font-bold uppercase tracking-widest">{{ loteRegistros.length }} Registros</p>
            </div>
         </div>

         <div class="flex items-center gap-8">
           <div class="text-right">
             <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Importe Neto Total</p>
             <p class="text-3xl font-black text-gray-800">Bs {{ totalLote.toFixed(2) }}</p>
           </div>
           <button @click="handleSubmit" :disabled="submitting"
             class="px-12 py-5 bg-linear-to-r from-orange-600 to-red-700 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
             <CheckCircle v-if="!submitting" class="h-6 w-6" />
             <Loader2 v-else class="h-6 w-6 animate-spin" />
             CONFIRMAR Y REGISTRAR TODO
           </button>
         </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Persona e Información General</th>
              <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Resumen Financiero</th>
              <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-for="(reg, idx) in loteRegistros" :key="idx">
              <!-- Main Row: Employee & Totals -->
              <tr class="bg-white hover:bg-orange-50/10 transition-colors">
                <td class="px-6 py-6 align-top">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg flex items-center justify-center text-white font-black text-sm">
                       {{ getPersonaNombre(reg.idpersona ?? reg.idEmpleado)[0] }}
                    </div>
                    <div class="flex flex-col">
                      <span class="font-black text-gray-800 text-lg leading-none">{{ getPersonaNombre(reg.idpersona ?? reg.idEmpleado) }}</span>
                      <span v-if="reg.observacion" class="text-[10px] text-gray-400 italic mt-1 font-bold">Obs: {{ reg.observacion }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="grid grid-cols-5 gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                    <div class="text-center">
                      <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total P. Venta</p>
                      <p class="text-xs font-black text-gray-700">Bs {{ calcRowTotals(reg).normal.toFixed(2) }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total P. Mayor</p>
                      <p class="text-xs font-black text-orange-600">Bs {{ calcRowTotals(reg).mayor.toFixed(2) }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Ajustes</p>
                      <p class="text-xs font-black text-blue-600">Bs {{ calcRowTotals(reg).ajustes.toFixed(2) }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Comisión Total</p>
                      <p class="text-xs font-black text-emerald-600">Bs {{ calcRowTotals(reg).comision.toFixed(2) }}</p>
                    </div>
                    <div class="text-center border-l border-gray-200">
                      <p class="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Neto Panadería</p>
                      <p class="text-sm font-black text-red-700">Bs {{ calcTotalReg(reg).toFixed(2) }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 text-center align-middle">
                  <button @click="removeOfLote(idx)" class="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm hover:shadow-md bg-white border border-gray-100">
                    <Trash2 class="h-6 w-6" />
                  </button>
                </td>
              </tr>
              <!-- Details Row: Product Table -->
              <tr>
                <td colspan="3" class="px-6 pb-8 pt-0">
                  <div class="bg-white border border-orange-100/50 rounded-[2rem] overflow-hidden shadow-sm">
                    <table class="w-full text-[10px]">
                      <thead class="bg-orange-50/50 text-orange-700 font-black uppercase tracking-wider">
                        <tr>
                          <th class="px-6 py-3">Producto</th>
                          <th class="px-4 py-3 text-center">Entregado</th>
                          <th class="px-4 py-3 text-center">P. Menor</th>
                          <th class="px-4 py-3 text-center">P. Mayor</th>
                          <th class="px-4 py-3 text-center">Comisión</th>
                          <th class="px-4 py-3 text-center text-red-600">Devueltos</th>
                          <th class="px-4 py-3 text-center text-blue-600">Ajustes</th>
                          <th class="px-4 py-3 text-center text-emerald-600">Total Comisión</th>
                          <th class="px-4 py-3 text-right text-orange-800">Subtotal Neto</th>
                        </tr> 
                      </thead>
                      <tbody class="divide-y divide-orange-50">
                        <tr v-for="d in reg.detalles" :key="d.idProductoMedida" class="hover:bg-orange-50/30 transition-colors">
                          <td class="px-6 py-3">
                            <div class="flex items-center gap-3">
                              <div class="w-6 h-6 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                <img v-if="d.imagen" :src="d.imagen" class="w-full h-full object-cover" />
                                <Package v-else class="h-3 w-3 text-orange-300" />
                              </div>
                              <span class="font-bold text-gray-800">{{ d.nombre }} ({{ d.presentacion }})</span>
                            </div>
                          </td>
                          <td class="px-4 py-3 text-center font-black">{{ d.cantidadEntregada }}</td>
                          <td class="px-4 py-3 text-center font-medium">Bs {{ d.precioNormal }}</td>
                          <td class="px-4 py-3 text-center font-medium">Bs {{ d.precioMayor }}</td>
                          <td class="px-4 py-3 text-center text-emerald-600 font-bold">Bs {{ d.comisionUnitaria }}</td>
                       
                          <td class="px-4 py-3 text-center text-red-500 font-black">{{ d.cantidadDevuelta || 0 }}</td>
                          <td class="px-4 py-3 text-center">
                            <template v-if="d.ajustes && d.ajustes.length > 0">
                              <div v-for="(aj, ai) in d.ajustes" :key="ai" class="text-[9px] leading-tight">
                                <span class="text-blue-600 font-black">{{ aj.cantidad }}</span> @ <span class="text-blue-600 font-bold">Bs {{ aj.precioVenta }}</span>
                              </div>
                            </template>
                            <span v-else class="text-blue-600 font-black">{{ d.cantidadAjustada || 0 }}</span>
                          </td>
                          <td class="px-4 py-3 text-center text-emerald-700 font-black">Bs {{ calcDetalleFinanzas(d).comisionTotal.toFixed(2) }}</td>
                          <td class="px-4 py-3 text-right font-black text-gray-800">
                            Bs {{ calcDetalleNeto(d).toFixed(2) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Ajuste de Detalle (Local) -->
    <Transition name="fade-backdrop">
      <div v-if="showAjusteModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
        <div class="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-in">
          <div class="bg-linear-to-r from-orange-600 to-red-700 p-8 text-white relative">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 class="text-xl font-black uppercase tracking-tight relative z-10">Ajustar Producto</h3>
            <p class="text-orange-100 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">
              {{ selectedDetalle?.nombre }} - {{ selectedDetalle?.presentacion }}
            </p>
          </div>

          <div class="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No Vendidos (Retorno)</label>
              <input v-model.number="ajusteForm.cantidadDevuelta" type="number" min="0" :max="selectedDetalle?.cantidadEntregada"
                class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-black text-sm outline-none shadow-inner" />
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ajustes de Precio</label>
                <button @click="agregarAjusteForm"
                  class="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1">
                  <Plus class="h-3.5 w-3.5" /> Añadir Ajuste
                </button>
              </div>

              <div v-if="ajusteForm.ajustes.length === 0" class="bg-gray-50/50 rounded-2xl p-6 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest border border-dashed border-gray-200">
                No hay ajustes. Agrega uno para registrar una venta con precio modificado.
              </div>

              <div v-for="(ajuste, idx) in ajusteForm.ajustes" :key="idx"
                class="bg-orange-50/30 rounded-2xl p-4 border border-orange-100/50 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Ajuste #{{ idx + 1 }}</span>
                  <button @click="ajusteForm.ajustes.splice(idx, 1)" class="text-red-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad</label>
                    <input v-model.number="ajuste.cantidad" type="number" min="0"
                      class="w-full px-3 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-black text-xs text-gray-700 outline-none shadow-sm" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio (Bs)</label>
                    <input v-model.number="ajuste.precioVenta" type="number" step="0.01" min="0"
                      class="w-full px-3 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-black text-xs text-gray-700 outline-none shadow-sm" />
                  </div>
                </div>
                <div class="space-y-1">
                  <label class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Observación</label>
                  <input v-model="ajuste.observacion" type="text" placeholder="Motivo de este ajuste..."
                    class="w-full px-3 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-bold text-[10px] text-gray-700 outline-none shadow-sm" />
                </div>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivo del Ajuste</label>
              <textarea v-model="ajusteForm.motivo" rows="2" placeholder="Describa el ajuste..."
                class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs outline-none shadow-inner resize-none"></textarea>
            </div>

            <div v-if="totalAjusteForm > 0" class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div class="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <span>Total Ajustado</span>
                <span class="text-orange-700">{{ totalAjusteForm }} unidades</span>
              </div>
            </div>

            <div class="pt-4 flex flex-col gap-3">
              <button @click="saveAjuste" 
                class="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-orange-700 transition-all">
                APLICAR CAMBIOS
              </button>
              <button @click="showAjusteModal = false" class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal: Nueva Persona -->
    <Transition name="fade-backdrop">
      <div v-if="showNuevaPersonaModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
        <div class="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-in">
          <div class="bg-linear-to-r from-orange-600 to-red-700 p-8 text-white relative">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 class="text-2xl font-bold tracking-tight relative z-10">Nueva Persona</h3>
            <p class="text-orange-100 text-sm font-medium mt-1 relative z-10">
              Registra una nueva persona como Cliente Revendedor
            </p>
          </div>

          <div class="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Nombre *</label>
                <input v-model="nuevaPersona.nombre" type="text" placeholder="Nombre"
                  @input="nuevaPersonaError.nombre = validarCampoPersona('nombre', nuevaPersona.nombre)"
                  @blur="nuevaPersonaError.nombre = validarCampoPersona('nombre', nuevaPersona.nombre)"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                <p v-if="nuevaPersonaError.nombre" class="text-red-500 text-xs mt-0.5">{{ nuevaPersonaError.nombre }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Apellido Paterno *</label>
                <input v-model="nuevaPersona.apellidoPaterno" type="text" placeholder="Apellido Paterno"
                  @input="nuevaPersonaError.apellidoPaterno = validarCampoPersona('apellidoPaterno', nuevaPersona.apellidoPaterno)"
                  @blur="nuevaPersonaError.apellidoPaterno = validarCampoPersona('apellidoPaterno', nuevaPersona.apellidoPaterno)"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                <p v-if="nuevaPersonaError.apellidoPaterno" class="text-red-500 text-xs mt-0.5">{{ nuevaPersonaError.apellidoPaterno }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Apellido Materno</label>
                <input v-model="nuevaPersona.apellidoMaterno" type="text" placeholder="Apellido Materno"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Género *</label>
                <div class="flex gap-2">
                  <button type="button" v-for="g in generos" :key="g.value" @click="nuevaPersona.genero = g.value"
                    :class="['flex-1 py-3 rounded-2xl font-semibold text-sm border-2 transition-all', nuevaPersona.genero === g.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300']">
                    {{ g.label }}
                  </button>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Celular *</label>
                <input v-model="nuevaPersona.celular" type="text" placeholder="Número de celular"
                  @input="nuevaPersonaError.celular = validarCampoPersona('celular', nuevaPersona.celular)"
                  @blur="nuevaPersonaError.celular = validarCampoPersona('celular', nuevaPersona.celular)"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                <p v-if="nuevaPersonaError.celular" class="text-red-500 text-xs mt-0.5">{{ nuevaPersonaError.celular }}</p>
              </div>
              <div class="md:col-span-2 space-y-1">
                <label class="text-sm font-semibold text-gray-700">Cédula de Identidad *</label>
                <div class="flex">
                  <input v-model="nuevaPersona.documento" type="text" placeholder="Número de CI"
                    @input="nuevaPersonaError.documento = validarCampoPersona('documento', nuevaPersona.documento)"
                    @blur="nuevaPersonaError.documento = validarCampoPersona('documento', nuevaPersona.documento)"
                    class="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-l-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                  <select v-model="nuevaPersona.idComplemento"
                    class="px-3 py-3 bg-gray-50 border-l border-gray-200 rounded-r-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner">
                    <option value="">Sin complemento</option>
                    <option v-for="comp in complementos" :key="comp.idcomplemento ?? comp.IdComplemento" :value="comp.idcomplemento ?? comp.IdComplemento">
                      {{ comp.nombre ?? comp.Nombre ?? comp.descripcion ?? comp.Descripcion }}
                    </option>
                  </select>
                </div>
                <p v-if="nuevaPersonaError.documento" class="text-red-500 text-xs mt-0.5">{{ nuevaPersonaError.documento }}</p>
              </div>
              <div class="md:col-span-2 space-y-1">
                <label class="text-sm font-semibold text-gray-700">Email *</label>
                <input v-model="nuevaPersona.email" type="email" placeholder="correo@gmail.com"
                  @input="nuevaPersonaError.email = validarCampoPersona('email', nuevaPersona.email)"
                  @blur="nuevaPersonaError.email = validarCampoPersona('email', nuevaPersona.email)"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                <p v-if="nuevaPersonaError.email" class="text-red-500 text-xs mt-0.5">{{ nuevaPersonaError.email }}</p>
              </div>
            </div>

            <div class="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-4">
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Barrio</label>
                <Combobox v-model="nuevaPersona.barrio" by="idbarrio">
                  <div class="relative">
                    <ComboboxInput
                      class="w-full pl-4 pr-10 py-3 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner"
                      :displayValue="(b) => b?.nombre || ''"
                      @change="queryBarrio = $event.target.value"
                      placeholder="Buscar barrio..."
                    />
                    <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
                    </ComboboxButton>
                    <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryBarrio = ''">
                      <ComboboxOptions class="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5">
                        <div v-if="barriosFiltrados.length === 0 && queryBarrio !== ''" class="px-4 py-3 text-gray-500 select-none">
                          No se encontraron resultados.
                        </div>
                        <ComboboxOption v-for="barrio in barriosFiltrados" :key="barrio.idbarrio" :value="barrio" v-slot="{ selected, active }">
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
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-sm font-semibold text-gray-700">Dirección</label>
                  <input v-model="nuevaPersona.direccion" type="text" placeholder="Calle y número"
                    class="w-full px-4 py-3 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-semibold text-gray-700">Referencia</label>
                  <input v-model="nuevaPersona.referencia" type="text" placeholder="Ej: frente al parque"
                    class="w-full px-4 py-3 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                </div>
              </div>
            </div>

            <div class="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <label class="text-sm font-semibold text-gray-700 block mb-2">Foto de Perfil</label>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 border-2 border-orange-200">
                  <img v-if="previewImagen" :src="previewImagen" class="w-full h-full object-cover" />
                  <User v-else class="h-6 w-6 text-gray-400" />
                </div>
                <input type="file" accept="image/*" @change="onImagenSeleccionada"
                  class="flex-1 py-2.5 px-4 bg-white border-0 rounded-2xl text-sm text-gray-700 outline-none shadow-inner file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-all" />
              </div>
            </div>

            <div class="pt-4 flex flex-col gap-3">
              <button @click="guardarNuevaPersona" :disabled="!nuevaPersonaValida || guardandoNuevaPersona"
                class="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <Loader2 v-if="guardandoNuevaPersona" class="h-5 w-5 animate-spin" />
                <template v-else><UserPlus class="h-5 w-5" /> REGISTRAR PERSONA</template>
              </button>
              <button @click="showNuevaPersonaModal = false" class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-semibold text-sm hover:bg-gray-200">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Notification Overlay -->
    <Transition name="slide-up">
      <div v-if="notification"
        class="fixed bottom-6 right-6 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[600] font-black uppercase text-xs tracking-widest bg-gradient-to-r from-orange-600 to-red-700">
        <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5" />
        <AlertTriangle v-else class="h-5 w-5" />
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { 
  Users, X, Building2, Package, Trash2, Search, Plus, Edit2, UserPlus,
  ShoppingCart, CheckCircle, AlertTriangle, Loader2, User
} from 'lucide-vue-next';
import {
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption,
  TransitionRoot
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

// Components
import Productocard from '../../Venta/Productocard.vue';
import Paginado from '../../Modals/Paginado.vue';

// Services
import { ListarProductosOnSucursal } from '@/Server/Producto';

import { listarCategorias, ObtenerSubCategorias } from '@/Server/Categoria';
import { registrarcontrolRevendedor } from '@/Server/ControlRevendedor';
import { RegistrarPersona, listarTodasPersonas } from '@/Server/persona';
import { listarComplemento, listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';
import { SubirFoto, listarBarrios } from '@/Server/api';
import { SucursalUsuario } from '@/Server/Usuario';

const props = defineProps({
  sucursales: { type: Array, default: () => [] },
  productoInicial: { type: Object, default: null }
});

const emit = defineEmits(['cancel', 'saved']);

// State
const submitting = ref(false);
const loadingItems = ref(false);
const personas = ref([]);
const productos = ref([]);
const categorias = ref([]);
const subcategorias = ref([]);
const notification = ref(null);

// Batch Flow State
const idSucursalGeneral = ref('');
const loteRegistros = ref([]); // Array of objects {idpersona, idEmpleado, detalles, observacion}
const fechaRegistro = ref(new Date().toLocaleDateString('en-CA'));
const horaRegistro = ref(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

// Current Editor State
const currentPersonaId = ref('');
const currentDetalles = ref([]);
const currentObservacion = ref('');

// Nueva Persona Modal State
const showNuevaPersonaModal = ref(false);
const guardandoNuevaPersona = ref(false);
const docsRegistrados = ref([]);
const emailsRegistrados = ref([]);
const numerosRegistrados = ref([]);
const complementos = ref([]);
const barrios = ref([]);
const queryBarrio = ref('');
const barriosFiltrados = computed(() => {
  if (!queryBarrio.value) return barrios.value;
  const q = queryBarrio.value.toLowerCase();
  return barrios.value.filter(b => b.nombre?.toLowerCase().includes(q));
});
const archivoImagen = ref(null);
const previewImagen = ref('');
const generos = [
  { value: 1, label: 'Hombre' },
  { value: 2, label: 'Mujer' },
  { value: 3, label: 'Otro' }
];
const nuevaPersona = reactive({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  celular: '',
  documento: '',
  idComplemento: '',
  email: '',
  genero: 1,
  barrio: null,
  direccion: '',
  referencia: ''
});
const nuevaPersonaError = reactive({
  nombre: '',
  apellidoPaterno: '',
  celular: '',
  documento: '',
  email: ''
});

// Ajuste Modal State
const showAjusteModal = ref(false);
const selectedDetalleIdx = ref(null);
const selectedDetalle = computed(() => currentDetalles.value[selectedDetalleIdx.value] || null);
const ajusteForm = reactive({
  cantidadDevuelta: 0,
  motivo: '',
  ajustes: []
});

const totalAjusteForm = computed(() => {
  return ajusteForm.ajustes.reduce((sum, a) => sum + (a.cantidad || 0), 0);
});

const nuevaPersonaValida = computed(() => {
  return nuevaPersona.nombre.trim()
    && nuevaPersona.apellidoPaterno.trim()
    && nuevaPersona.celular.trim()
    && nuevaPersona.documento.trim()
    && nuevaPersona.email.trim()
    && nuevaPersona.genero
    && !Object.values(nuevaPersonaError).some(e => e);
});

const onImagenSeleccionada = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  archivoImagen.value = file;
  previewImagen.value = URL.createObjectURL(file);
};

const limpiarErrores = () => {
  Object.keys(nuevaPersonaError).forEach(k => nuevaPersonaError[k] = '');
};

const validarCampoPersona = (campo, value) => {
  let error = '';
  switch (campo) {
    case 'nombre':
      if (!value?.trim()) error = 'El nombre es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]+$/.test(value)) error = 'Solo letras y espacios.';
      break;
    case 'apellidoPaterno':
      if (!value?.trim()) error = 'El apellido paterno es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]+$/.test(value)) error = 'Solo letras y espacios.';
      break;
    case 'email':
      if (!value) error = 'El correo es requerido.';
      else if ((value.match(/@/g) || []).length !== 1) error = 'Debe contener exactamente un @';
      else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = 'El correo no tiene un formato valido.';
      else if (!/^[a-zA-Z0-9._]+@/.test(value)) error = 'Caracteres no válidos en el correo.';
      else if (emailsRegistrados.value.some(e => (e.email || e.Email || '').toLowerCase() === value.toLowerCase())) {
        error = 'Este correo ya está en uso.';
      }
      break;
    case 'documento':
      if (!value?.trim()) error = 'El CI es requerido.';
      else if (!/^\d+$/.test(value)) error = 'Solo números.';
      else if (docsRegistrados.value.some(d => (d.documento || d.Documento) === value)) {
        error = 'Este CI ya está registrado.';
      }
      break;
    case 'celular':
      if (!value?.trim()) error = 'El celular es requerido.';
      else if (/\D/.test(value)) error = 'Solo números.';
      else if (value.length < 7) error = 'Debe tener al menos 7 dígitos.';
      else if (numerosRegistrados.value.some(c => (c.numero || c.Numero) === value)) {
        error = 'Este número ya está registrado.';
      }
      break;
  }
  return error;
};

const validarPersonaForm = () => {
  limpiarErrores();
  nuevaPersonaError.nombre = validarCampoPersona('nombre', nuevaPersona.nombre);
  nuevaPersonaError.apellidoPaterno = validarCampoPersona('apellidoPaterno', nuevaPersona.apellidoPaterno);
  nuevaPersonaError.email = validarCampoPersona('email', nuevaPersona.email);
  nuevaPersonaError.documento = validarCampoPersona('documento', nuevaPersona.documento);
  nuevaPersonaError.celular = validarCampoPersona('celular', nuevaPersona.celular);
  return !Object.values(nuevaPersonaError).some(e => e);
};

const abrirModalNuevaPersona = () => {
  nuevaPersona.nombre = '';
  nuevaPersona.apellidoPaterno = '';
  nuevaPersona.apellidoMaterno = '';
  nuevaPersona.celular = '';
  nuevaPersona.documento = '';
  nuevaPersona.idComplemento = '';
  nuevaPersona.email = '';
  nuevaPersona.genero = 1;
  nuevaPersona.barrio = null;
  nuevaPersona.direccion = '';
  nuevaPersona.referencia = '';
  archivoImagen.value = null;
  previewImagen.value = '';
  limpiarErrores();
  showNuevaPersonaModal.value = true;
  if (barrios.value.length === 0) {
    listarBarrios().then(res => {
      barrios.value = res?.data || res?.result || res || [];
    }).catch(() => {});
  }
};

const guardarNuevaPersona = async () => {
  if (!validarPersonaForm()) return;
  guardandoNuevaPersona.value = true;
  try {
    let imageUrl = '';
    if (archivoImagen.value) {
      imageUrl = await SubirFoto(archivoImagen.value);
    }

    const personaPayload = {
      Nombre: nuevaPersona.nombre.trim(),
      ApellidoPaterno: nuevaPersona.apellidoPaterno.trim(),
      ApellidoMaterno: nuevaPersona.apellidoMaterno.trim() || null,
      Email: nuevaPersona.email.trim(),
      IdGenero: nuevaPersona.genero,
      Url: imageUrl,
      Celulares: [{ Numero: nuevaPersona.celular.trim() }],
      Documento: [{ Documento: nuevaPersona.documento.trim(), IdTipodocumento: 2, Complemento: nuevaPersona.idComplemento || null }],
      IdBarrio: nuevaPersona.barrio?.idbarrio ?? null,
      Direccion: nuevaPersona.direccion.trim(),
      Referencia: nuevaPersona.referencia.trim(),
      Tipo: 'CLIENTE_REVENDEDOR'
    };

    const respPersona = await RegistrarPersona(personaPayload);
    const idPersona = respPersona?.IdPersona || respPersona?.idpersona || respPersona?.data?.IdPersona;

    if (!idPersona) throw new Error('No se pudo obtener el ID de la persona creada');

    showNuevaPersonaModal.value = false;
    showNotification('Persona registrada correctamente', 'success');
    await cargarPersonas();

    if (personasDisponibles.value.length > 0) {
      const ids = personasDisponibles.value.map(p => p.idpersona ?? p.idempleado ?? p.empleado?.idempleado);
      const nuevo = personas.value.find(p => !ids.includes(p.idpersona ?? p.idempleado ?? p.empleado?.idempleado)) || personasDisponibles.value[personasDisponibles.value.length - 1];
      currentPersonaId.value = nuevo.idpersona ?? nuevo.idempleado ?? nuevo.empleado?.idempleado;
    }
  } catch (error) {
    console.error(error);
    showNotification('Error al registrar la persona', 'error');
  } finally {
    guardandoNuevaPersona.value = false;
  }
};

const cargarValidaciones = async () => {
  try {
    const [docs, emails, nums, comps] = await Promise.all([
      listarDocumento(),
      listarEmail(),
      listarNumero(),
      listarComplemento()
    ]);
    docsRegistrados.value = docs || [];
    emailsRegistrados.value = emails || [];
    numerosRegistrados.value = nums || [];
    complementos.value = comps?.data || comps?.result || comps || [];
  } catch (error) {
    console.error('Error al cargar datos de validación:', error);
  }
};

const agregarAjusteForm = () => {
  ajusteForm.ajustes.push({ cantidad: 0, precioVenta: 0, observacion: '' });
};

// Catalog Filters
const filtroNombre = ref('');
const filtroCategoria = ref('TODOS');
const filtroSubcategoria = ref('TODOS');
const paginacionProd = reactive({ paginaActual: 1, totalPaginas: 1, total: 0, limite: 6 });

let debounceTimer = null;

// Computed
const currentPersonaNombre = computed(() => {
  const p = personas.value.find(per => (per.idpersona ?? per.idempleado ?? per.empleado?.idempleado) === currentPersonaId.value);
  return p ? `${p.nombre ?? p.Nombre} ${p.apellidopaterno ?? p.ApellidoPaterno}` : '...';
});

const isCurrentValid = computed(() => {
  return currentPersonaId.value && currentDetalles.value.length > 0;
});

const totalLote = computed(() => {
  return loteRegistros.value.reduce((acc, reg) => acc + calcTotalReg(reg), 0);
});

const isFormValid = computed(() => {
  return idSucursalGeneral.value && loteRegistros.value.length > 0;
});

const personasDisponibles = computed(() => {
  return personas.value.filter(p => {
    const pid = p.idpersona ?? p.IdPersona;
    const eid = p.idempleado ?? p.empleado?.idempleado;
    return !loteRegistros.value.some(r => r.idpersona === pid || (eid && r.idEmpleado === eid));
  });
});

const queryPersona = ref('');
const filteredPersonas = computed(() => {
  if (!queryPersona.value) return personasDisponibles.value;
  const q = queryPersona.value.toLowerCase();
  return personasDisponibles.value.filter(p =>
    `${p.nombre ?? p.Nombre} ${p.apellidopaterno ?? p.ApellidoPaterno} ${(p.apellidomaterno ?? p.ApellidoMaterno) || ''}`.toLowerCase().includes(q)
  );
});

const selectedPersona = computed(() => {
  return personas.value.find(p => (p.idpersona ?? p.IdPersona ?? p.idempleado ?? p.empleado?.idempleado) === currentPersonaId.value);
});

// Actions
const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => notification.value = null, 3000);
};

const getVentaAjustada = (d) => {
  const ajustes = d.ajustes || [];
  if (ajustes.length > 0) {
    return ajustes.reduce((sum, a) => sum + (a.cantidad || 0) * (a.precioVenta || 0), 0);
  }
  return (d.cantidadAjustada || 0) * (d.precioAjuste || 0);
};

const getCantidadAjustada = (d) => {
  const ajustes = d.ajustes || [];
  if (ajustes.length > 0) {
    return ajustes.reduce((sum, a) => sum + (a.cantidad || 0), 0);
  }
  return d.cantidadAjustada || 0;
};

const calcRowTotals = (reg) => {
  return reg.detalles.reduce((acc, d) => {
    const qtySold = d.cantidadEntregada - (d.cantidadDevuelta || 0);
    const qtyAjustada = getCantidadAjustada(d);
    const qtyNormal = Math.max(0, qtySold - qtyAjustada);

    // Sales breakdown
    const ventaNormal = qtyNormal * d.precioNormal;
    const ventaMayor = qtyNormal * d.precioMayor;
    const ventaAjustada = getVentaAjustada(d);
    
    const totalVenta = ventaNormal + ventaAjustada;
    const comisionTotal = qtySold * d.comisionUnitaria;
    const neto = totalVenta - comisionTotal;
    
    acc.normal += ventaNormal;
    acc.mayor += ventaMayor;
    acc.ajustes += ventaAjustada;
    acc.ventaTotal += totalVenta;
    acc.comision += comisionTotal;
    acc.neto += neto;
    return acc;
  }, { normal: 0, mayor: 0, ajustes: 0, ventaTotal: 0, comision: 0, neto: 0 });
};

const calcDetalleFinanzas = (d) => {
  const qtySold = d.cantidadEntregada - (d.cantidadDevuelta || 0);
  const qtyAjustada = getCantidadAjustada(d);
  const qtyNormal = Math.max(0, qtySold - qtyAjustada);

  const ventaBruta = (qtyNormal * d.precioNormal) + getVentaAjustada(d);
  const comisionTotal = qtySold * d.comisionUnitaria;
  const neto = ventaBruta - comisionTotal;

  return { ventaBruta, comisionTotal, neto, qtySold };
};

const calcDetalleNeto = (d) => calcDetalleFinanzas(d).neto;

const calcTotalReg = (reg) => calcRowTotals(reg).neto;

const getPersonaNombre = (id) => {
  const p = personas.value.find(per => (per.idpersona ?? per.idempleado ?? per.empleado?.idempleado) === id);
  return p ? `${p.nombre ?? p.Nombre} ${p.apellidopaterno ?? p.ApellidoPaterno}` : '...';
};

const cargarPersonas = async () => {
  try {
    const res = await listarTodasPersonas();
    const lista = Array.isArray(res) ? res : (res?.data ?? res?.result ?? res ?? []);
    personas.value = Array.isArray(lista) ? lista.map(p => ({
      ...p,
      idpersona: p.idpersona,
      idempleado: p.empleado?.idempleado ?? null
    })) : [];
  } catch (error) { console.error(error); }
};

const fetchItems = async () => {
  if (!idSucursalGeneral.value) return;
  loadingItems.value = true;
  try {
    const res = await ListarProductosOnSucursal(
      idSucursalGeneral.value,
      filtroNombre.value,
      paginacionProd.limite,
      paginacionProd.paginaActual,
      filtroCategoria.value === 'TODOS' ? null : filtroCategoria.value,
      filtroSubcategoria.value === 'TODOS' ? null : filtroSubcategoria.value
    );
    productos.value = res.result || [];
    paginacionProd.total = parseInt(res.total) || productos.value.length;
    paginacionProd.totalPaginas = Math.ceil(paginacionProd.total / paginacionProd.limite) || 1;
  } catch (e) { console.error(e); } finally { loadingItems.value = false; }
};

const onSucursalChange = () => {
  loteRegistros.value = [];
  currentDetalles.value = [];
  paginacionProd.paginaActual = 1;
  fetchItems();
};

const agregarProductoACurrent = ({ producto, medida }) => {
  if (!currentPersonaId.value) {
    showNotification("Selecciona una persona para añadir productos", "error");
    return;
  }

  const idPM = medida.idproductomedida || medida.IdProductoMedida;
  if (currentDetalles.value.some(d => d.idProductoMedida === idPM)) {
    currentDetalles.value.find(d => d.idProductoMedida === idPM).cantidadEntregada++;
    return;
  }
  
  // Use EXACT property name from backend for retail price
  const retailPrice = medida.precioventa || medida.Precio || 0;
  const wholesalePrice = medida.preciomayor || medida.PrecioMayor || retailPrice;

  currentDetalles.value.push({
    idProductoMedida: idPM,
    nombre: producto.nombre || producto.Nombre,
    presentacion: (typeof medida.presentacion === 'object' ? medida.presentacion.nombre : medida.presentacion) || medida.Nombre,
    precioNormal: retailPrice,
    precioMayor: wholesalePrice,
    precioVenta: retailPrice, // Correct value for registration
    comisionUnitaria: medida.comision || medida.Comision || 0,
    cantidadEntregada: 1,
    cantidadDevuelta: 0,
    cantidadAjustada: 0,
    precioAjuste: 0,
    motivo: '',
    imagen: producto.imagen || producto.Imagen?.Url
  });
};

const updateQtyCurrent = (idx, delta) => {
  const d = currentDetalles.value[idx];
  const newQty = d.cantidadEntregada + delta;
  if (newQty > 0) d.cantidadEntregada = newQty;
};

const openAjusteSubModal = (idx) => {
  selectedDetalleIdx.value = idx;
  const d = currentDetalles.value[idx];
  ajusteForm.cantidadDevuelta = d.cantidadDevuelta;
  ajusteForm.motivo = d.motivo;
  ajusteForm.ajustes = d.ajustes && d.ajustes.length > 0
    ? d.ajustes.map(a => ({ ...a }))
    : (d.cantidadAjustada > 0
        ? [{ cantidad: d.cantidadAjustada, precioVenta: d.precioAjuste || d.precioVenta, observacion: '' }]
        : []);
  showAjusteModal.value = true;
};

const saveAjuste = () => {
  const d = currentDetalles.value[selectedDetalleIdx.value];
  d.cantidadDevuelta = ajusteForm.cantidadDevuelta;
  d.motivo = ajusteForm.motivo;
  d.ajustes = ajusteForm.ajustes
    .filter(a => a.cantidad > 0)
    .map(a => ({ ...a }));
  d.cantidadAjustada = d.ajustes.reduce((s, a) => s + a.cantidad, 0);
  d.precioAjuste = d.ajustes.length > 0 ? d.ajustes[0].precioVenta : 0;
  showAjusteModal.value = false;
  showNotification("Ajuste aplicado correctamente", "success");
};

const stageRegistro = () => {
  if (!isCurrentValid.value) return;

  const personaSel = selectedPersona.value;
  
  loteRegistros.value.push({
    idpersona: personaSel?.idpersona ?? personaSel?.IdPersona ?? null,
    idEmpleado: personaSel?.idempleado ?? personaSel?.empleado?.idempleado ?? null,
    idSucursal: idSucursalGeneral.value,
    fecha: fechaRegistro.value,
    hora: horaRegistro.value,
    observacion: currentObservacion.value,
    detalles: [...currentDetalles.value]
  });

  // Clear for next unitary entry without closing component
  currentPersonaId.value = '';
  currentDetalles.value = [];
  currentObservacion.value = '';
  showNotification("Registro unitario añadido al lote", "success");
};

const removeOfLote = (idx) => {
  loteRegistros.value.splice(idx, 1);
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;
  submitting.value = true;
  try {
    const payload = loteRegistros.value.map(r => ({
      idpersona: r.idpersona,
      idEmpleado: r.idEmpleado,
      idSucursal: idSucursalGeneral.value,
      fecha: r.fecha || fechaRegistro.value,
      hora: r.hora || horaRegistro.value,
      observacion: r.observacion,
      detalles: r.detalles.map(d => {
        const qtyDevuelta = d.cantidadDevuelta || 0;
        const qtyAjustada = getCantidadAjustada(d);
        const qtyNormal = Math.max(0, d.cantidadEntregada - qtyDevuelta - qtyAjustada);
        const ajustes = d.ajustes || [];

        const detailObj = {
          idProductoMedida: d.idProductoMedida,
          cantidadEntregada: d.cantidadEntregada,
          cantidadDevuelta: qtyDevuelta,
          cantidadAjustada: qtyAjustada,
          precioAjuste: d.precioAjuste || 0,
          precioVenta: d.precioVenta,
          comisionUnitaria: d.comisionUnitaria,
          motivo: d.motivo,
          precios: []
        };

        if (qtyNormal > 0) {
          detailObj.precios.push({
            cantidad: qtyNormal,
            precioVenta: d.precioVenta,
            estado: 'NORMAL',
            observacion: null
          });
        }

        ajustes.forEach(a => {
          if (a.cantidad > 0) {
            detailObj.precios.push({
              cantidad: a.cantidad,
              precioVenta: a.precioVenta,
              estado: 'AJUSTE',
              observacion: a.observacion || d.motivo
            });
          }
        });

        return detailObj;
      })
    }));
    
    await registrarcontrolRevendedor(payload);
    emit('saved');
  } catch (error) {
    console.error(error);
    showNotification("Error al registrar el lote", "error");
  } finally {
    submitting.value = false;
  }
};

const onCambiarPaginaProd = (page) => {
  paginacionProd.paginaActual = page;
  fetchItems();
};

onMounted(async () => {
  try {
    const [cats] = await Promise.all([
      listarCategorias(),
      cargarPersonas(),
      cargarValidaciones()
    ]);
    categorias.value = cats.result|| cats.data || cats || [];
    
    const u = JSON.parse(localStorage.getItem('usuario'));
    if (u?.IdUsuario) {
      try {
        const sucResp = await SucursalUsuario(u.IdUsuario);
        if (sucResp?.idsucursal) {
          idSucursalGeneral.value = sucResp.idsucursal;
        }
      } catch (e) {
        console.error('Error al obtener sucursal del usuario:', e);
      }
    }
    
    if (idSucursalGeneral.value) {
      fetchItems();
    }
  } catch (e) { console.error(e); }
});

watch(filtroCategoria, async (v) => {
  filtroSubcategoria.value = 'TODOS';
  if (v !== 'TODOS') subcategorias.value = await ObtenerSubCategorias(v);
  else subcategorias.value = [];
  paginacionProd.paginaActual = 1;
  fetchItems();
});

watch([filtroSubcategoria, filtroNombre], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    paginacionProd.paginaActual = 1;
    fetchItems();
  }, 400);
});
</script>

<style scoped>
.fade-backdrop-enter-active, .fade-backdrop-leave-active { transition: opacity 0.3s ease; }
.fade-backdrop-enter-from, .fade-backdrop-leave-to { opacity: 0; }

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>