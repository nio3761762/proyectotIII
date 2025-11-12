<template>
  <div class="bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 relative">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <div class="w-full">
      <!-- Header Dashboard -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-3">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-lg flex items-center justify-center">
              <BarChart3 class="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Panel de Control
              </h1>
              <p class="text-gray-600">Panel de control y métricas principales</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl px-4 py-2">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-semibold text-green-700">Sistema Activo</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Última actualización</p>
              <p class="text-sm font-semibold text-gray-700">{{ fechaActual }}</p>
            </div>
          </div>
        </div>
      </div>

    

      <!-- Sección de Filtros -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-3">
        <div class="flex justify-between items-center cursor-pointer" @click="filtrosVisibles = !filtrosVisibles">
          <h2 class="text-xl font-bold text-gray-800">Filtros</h2>
          <button class="p-2 rounded-full hover:bg-gray-200/50 transition-colors">
            <ChevronDown class="h-6 w-6 text-gray-600 transition-transform duration-300" :class="{'rotate-180': !filtrosVisibles}" />
          </button>
        </div>
        <transition name="slide-fade">
          <div v-show="filtrosVisibles" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <label for="desde" class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  id="desde"
                  v-model="filtros.desde"
                  :max="filtros.hasta"
                  class="mt-1 block w-full px-4 py-2.5 bg-gray-100/50 border border-gray-300/70 rounded-xl shadow-md backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                />
              </div>
              <div>
                <label for="hasta" class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  id="hasta"
                  v-model="filtros.hasta"
                  :min="filtros.desde"
                  class="mt-1 block w-full px-4 py-2.5 bg-gray-100/50 border border-gray-300/70 rounded-xl shadow-md backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                />
              </div>
              <div>
                <label for="sucursal" class="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                <select
                  id="sucursal"
                  v-model="filtros.sucursal"
                  class="mt-1 block w-full px-4 py-2.5 bg-gray-100/50 border border-gray-300/70 rounded-xl shadow-md backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="">Todas</option>
                  <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.IdSucursal">
                    {{ sucursal.Nombre }}
                  </option>
                </select>
              </div>
              <div>
                <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  id="categoria"
                  v-model="filtros.categoria"
                  class="mt-1 block w-full px-4 py-2.5 bg-gray-100/50 border border-gray-300/70 rounded-xl shadow-md backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="TODOS">Todas</option>
                  <option v-for="categoria in categorias" :key="categoria.IdCategoria" :value="categoria.IdCategoria">
                    {{ categoria.Nombre }}
                  </option>
                </select>
              </div>
              <div>
                <label for="subcategoria" class="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                <select
                  id="subcategoria"
                  v-model="filtros.subcategoria"
                  :disabled="filtros.categoria === 'TODOS'"
                  class="mt-1 block w-full px-4 py-2.5 bg-gray-100/50 border border-gray-300/70 rounded-xl shadow-md backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 disabled:bg-gray-200"
                >
                  <option value="">Todas</option>
                  <option v-for="subcategoria in subcategorias" :key="subcategoria.IdSubCategoria" :value="subcategoria.IdSubCategoria">
                    {{ subcategoria.Nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Métricas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
        <!-- Ventas del Día -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 group">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign class="h-6 w-6 text-white" />
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-green-600 mb-1">HOY</p>
              <div 
  class="flex items-center gap-1"
 >
  <TrendingUp 
    class="h-3 w-3 text-green-500"
  />
  <span class="text-xs font-semibold">
   10%
  </span>
</div>

            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">Bs. {{ingresoTotal}}</h3>
          <p class="text-sm text-gray-600">Ventas del día</p>
          <div class="mt-4 bg-green-50 rounded-xl p-3">
            <div class="flex items-center justify-between text-sm">
               <span class="text-green-700 font-medium">Total de Ventas</span>
              <span class="text-green-600">{{ totalVentas }}</span>
              </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-green-700 font-medium">Meta diaria</span>
              <span class="text-green-600">{{ Math.round((ingresoTotal / metaDiaria) * 100) }}%</span>
            </div>
            <div class="w-full bg-green-200 rounded-full h-2 mt-2">
              <div 
                class="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min((ingresoTotal / metaDiaria) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Productos Vendidos -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 group">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package class="h-6 w-6 text-white" />
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-blue-600 mb-1">PRODUCTOS</p>
                 <div class="flex items-center gap-1">
  <TrendingUp 
    class="h-3 w-3 text-green-500"
   
  />
  <span class="text-xs font-semibold">
  10%
  </span>
</div>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">{{ totalProductosVendidos }}</h3>
          <p class="text-sm text-gray-600">Unidades vendidas</p>
          <div class="mt-4 flex items-center gap-2">
            <div v-if="productosMasVendidos.length > 0" class="flex-1 bg-blue-50 rounded-xl p-2 text-center">
              <p class="text-xs text-blue-600 font-semibold">{{ productosMasVendidos[0].name }}</p>
              <p class="text-sm font-bold text-blue-800">{{ productosMasVendidos[0].totalQuantity }}</p>
            </div>
            <div v-if="productosMasVendidos.length > 1" class="flex-1 bg-purple-50 rounded-xl p-2 text-center">
              <p class="text-xs text-purple-600 font-semibold">{{ productosMasVendidos[1].name }}</p>
              <p class="text-sm font-bold text-purple-800">{{ productosMasVendidos[1].totalQuantity }}</p>
            </div>
          </div>
        </div>

        <!-- Clientes Atendidos -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 group">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users class="h-6 w-6 text-white" />
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-purple-600 mb-1">CLIENTES</p>
                        <div class="flex items-center gap-1">
  <TrendingUp 
    class="h-3 w-3 text-green-500"
    
  />
  <span class="text-xs font-semibold">
   10%
  </span>
</div>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">{{ totalClientes }}</h3>
          <p class="text-sm text-gray-600">Clientes atendidos</p>
          <div class="mt-4 bg-purple-50 rounded-xl p-3">
            <div class="flex items-center justify-between">
              <div class="text-center flex-1">
                <p class="text-xs text-purple-600 font-semibold">Nuevos</p>
                <p class="text-lg font-bold text-purple-800">{{ clientesNuevos }}</p>
              </div>
              <div class="w-px h-8 bg-purple-200"></div>
              <div class="text-center flex-1">
                <p class="text-xs text-purple-600 font-semibold">Recurrentes</p>
                <p class="text-lg font-bold text-purple-800">{{ clientesRecurrentes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventario -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 group">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Archive class="h-6 w-6 text-white" />
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-orange-600 mb-1">STOCK</p>
              <div class="flex items-center gap-1">
                <AlertTriangle class="h-3 w-3 text-orange-500" />
                <span class="text-xs text-orange-600 font-semibold">{{ stockminimo }} Bajos</span>
              </div>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">{{ stock }}</h3>
          <p class="text-sm text-gray-600">Productos en stock</p>
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Stock crítico</span>
              <span class="text-red-600 font-semibold">{{ stockCritico }} items</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Stock normal</span>
              <span class="text-green-600 font-semibold">{{ stock - stockCritico > 0? (stock - stockCritico) : stock }} items</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Gráficos y Actividad -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-3">
        <!-- Gráfico de Ventas -->
        <div class="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                <TrendingUp class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800">Ventas de la Semana</h3>
                <p class="text-sm text-gray-600">Comparación con semana anterior</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                v-for="periodo in periodos" 
                :key="periodo"
                @click="periodoSeleccionado = periodo"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300',
                  periodoSeleccionado === periodo
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ periodo }}
              </button>
            </div>
          </div>
          
          <div class="h-64">
            <canvas id="salesChartCanvas"></canvas>
          </div>
        </div>

        <!-- Actividad Reciente -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center">
              <Activity class="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">Actividad Reciente</h3>
              <p class="text-sm text-gray-600">Últimas transacciones</p>
            </div>
          </div>

          <div class="space-y-4 max-h-80 overflow-y-auto">
            <div 
              v-for="actividad in actividadReciente" 
              :key="actividad.id"
              class="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300"
            >
              <div :class="[
                'w-10 h-10 rounded-2xl shadow-md flex items-center justify-center',
                (activityConfig[actividad.type] || activityConfig.default).color
              ]">
                <component :is="(activityConfig[actividad.type] || activityConfig.default).icon" class="h-5 w-5 text-white" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800">{{ actividad.description }}</p>
                <p class="text-xs text-gray-600">{{ formatTimeAgo(actividad.date, actividad.time) }}</p>
              </div>
              <div class="text-right">
                <p v-if="(activityConfig[actividad.type] || activityConfig.default).amountKey" :class="[
                  'text-sm font-bold',
                  (activityConfig[actividad.type] || activityConfig.default).textColor || 'text-gray-800'
                ]">
                  <span v-if="(activityConfig[actividad.type] || activityConfig.default).sign">{{ (activityConfig[actividad.type] || activityConfig.default).sign }} </span>
                  Bs. {{ actividad[(activityConfig[actividad.type] || activityConfig.default).amountKey] }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos Más Vendidos y Alertas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
        <!-- Productos Más Vendidos -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 relative overflow-hidden">
          <div class="flex items-center justify-between gap-3 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Star class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800">{{ top5Titulo }}</h3>
                <p class="text-sm text-gray-600">Top 5</p>
              </div>
            </div>
            <button @click="rotarTop5" class="p-2 rounded-full hover:bg-gray-200/50 transition-colors">
              <RefreshCw class="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <transition name="slide-up" mode="out-in">
            <div :key="top5Vista" class="space-y-4">
              <div 
                v-for="(item, index) in top5Datos" 
                :key="item.id"
                class="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300"
              >
                <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                  <img 
                    :src="item.imageUrl" 
                    :alt="item.name"
                    class="w-8 h-8 rounded-xl object-cover"
                  />
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-gray-800">{{ item.name }}</p>
                  <p class="text-sm text-gray-600">{{ item.totalQuantity }} unidades</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-purple-600">Bs. {{ item.totalPrice }}</p>
                  <div class="w-16 bg-purple-200 rounded-full h-2 mt-1">
                    <div 
                      class="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                      :style="{ width: `${(item.totalQuantity / (Math.max(...top5Datos.map(p => p.totalQuantity)) || 1)) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Alertas y Notificaciones -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <Bell class="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">Alertas del Sistema</h3>
              <p class="text-sm text-gray-600">Notificaciones importantes</p>
            </div>
          </div>

          <div class="space-y-4 max-h-80 overflow-y-auto">
            <div 
              v-for="alerta in alertas" 
              :key="alerta.id"
              :class="[
                'p-4 rounded-2xl border-l-4 transition-all duration-300 hover:shadow-md',
                alerta.tipo === 'critico' ? 'bg-red-50 border-red-500' :
                alerta.tipo === 'advertencia' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              ]"
            >
              <div class="flex items-start gap-3">
                <div :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center',
                  alerta.tipo === 'critico' ? 'bg-red-500' :
                  alerta.tipo === 'advertencia' ? 'bg-yellow-500' :
                  'bg-blue-500'
                ]">
                  <AlertTriangle v-if="alerta.tipo === 'critico'" class="h-4 w-4 text-white" />
                  <AlertCircle v-else-if="alerta.tipo === 'advertencia'" class="h-4 w-4 text-white" />
                  <Info v-else class="h-4 w-4 text-white" />
                </div> 
                <div class="flex-1">
                  <p :class="[
                    'font-semibold text-sm',
                    alerta.tipo === 'critico' ? 'text-red-800' :
                    alerta.tipo === 'advertencia' ? 'text-yellow-800' :
                    'text-blue-800'
                  ]">
                    {{ alerta.titulo }}
                  </p> 
                  <p :class="[
                    'text-xs mt-1',
                    alerta.tipo === 'critico' ? 'text-red-600' :
                    alerta.tipo === 'advertencia' ? 'text-yellow-600' :
                    'text-blue-600'
                  ]">
                    {{ alerta.descripcion }}
                  </p>
                  <p class="text-xs text-gray-500 mt-2">{{ formatTimeAgo(alerta.date, alerta.time) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- EEE -->
        </div>
      </div>

      <!-- Accesos Rápidos -->
      <!-- <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
            <Zap class="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800">Accesos Rápidos</h3>
            <p class="text-sm text-gray-600">Funciones más utilizadas</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button 
            v-for="acceso in accesosRapidos" 
            :key="acceso.id"
            class="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 text-center"
          >
            <div :class="[
              'w-12 h-12 mx-auto mb-8 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110',
              acceso.color
            ]">
              <component :is="acceso.icono" class="h-6 w-6 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
              {{ acceso.nombre }}
            </p>
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch  } from 'vue'
import { storeToRefs } from 'pinia';
import {
  BarChart3, DollarSign, Package, Users, Archive, TrendingUp, AlertTriangle,
  Activity, ShoppingCart, User, Star, Bell, AlertCircle, Info, Zap,
  Plus, FileText, Settings, Calculator, Truck, PieChart, ChevronDown, RefreshCw,
  ClipboardList
} from 'lucide-vue-next'
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { listarCubo, listarParaHoy, OlapCube, movimientos } from '@/Server/CubeOlap'
import { listarCategorias, ObtenerSubCategorias} from '@/Server/Categoria';
import { listarSucursales } from '@/Server/api'
import { useAlertStore } from '@/stores/alertStore';

// Store setup
const alertStore = useAlertStore();
const { allAlerts: alertas } = storeToRefs(alertStore);

// Reactive data
const periodoSeleccionado = ref('24H')
const periodos = ['24H', '7D', '30D', '90D']
const filtrosVisibles = ref(false)
const graficarCube = ref([]);
// Filtros para el dashboard
const filtros = ref({
  desde: new Date().toISOString().slice(0, 10),
  hasta: new Date().toISOString().slice(0, 10),
  sucursal: '',
  categoria: 'TODOS',
  subcategoria: ''
});
const hoy = new Date().toISOString().split("T")[0]
const sucursales = ref([]);
const categorias = ref([]);
const subcategorias = ref([]);


const ListarCategorias = async () => {
  try {
    categorias.value = await listarCategorias();
  } catch (error) {
    console.error('Error al cargar categorias:', error);
  }
};

watch(() => filtros.value.categoria, async (newVal) => {
  filtros.value.subcategoria = '';
  if (newVal && newVal !== '') {
    subcategorias.value = await ObtenerSubCategorias(newVal);
  } else {
    subcategorias.value = [];
  }
});


const ListarSucursal = async () => {
  try {
    console.log(hoy)
      sucursales.value = await listarSucursales(); 
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const Listarmoviminetos = async () => {
  try {
   //ss
      actividadReciente.value = await movimientos(5,filtros.value.sucursal); 
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const OCube = ref([])
const graficaOlap = ref(null);

const fetchGraficaData = async () => {
  try {
    let queryDesde = filtros.value.desde;
    const hasta = new Date(filtros.value.hasta + 'T00:00:00');

    if (periodoSeleccionado.value === '24H') {
      queryDesde = filtros.value.hasta;
    } else if (periodoSeleccionado.value === '7D') {
      const newDesde = new Date(hasta);
      newDesde.setDate(hasta.getDate() - 6);
      queryDesde = newDesde.toISOString().slice(0, 10);
    } else if (periodoSeleccionado.value === '30D') {
      const newDesde = new Date(hasta);
      newDesde.setDate(hasta.getDate() - 29);
      queryDesde = newDesde.toISOString().slice(0, 10);
    } else if (periodoSeleccionado.value === '90D') {
      const newDesde = new Date(hasta);
      newDesde.setDate(hasta.getDate() - 89);
      queryDesde = newDesde.toISOString().slice(0, 10);
    }

    graficaOlap.value = await OlapCube(filtros.value.sucursal, 2025, '', '', queryDesde, filtros.value.hasta, filtros.value.subcategoria);
    processAndAssignChartData();
  } catch (error) {
    console.error('Error fetching graph data:', error);
  }
};

const ListaRCUbOne = async () => {
  try {
      let queryDesde = filtros.value.desde;
      const hasta = new Date(filtros.value.hasta + 'T00:00:00');

      if (periodoSeleccionado.value === '24H') {
        queryDesde = filtros.value.hasta;
      } else if (periodoSeleccionado.value === '7D') {
        const newDesde = new Date(hasta);
        newDesde.setDate(hasta.getDate() - 6);
        queryDesde = newDesde.toISOString().slice(0, 10);
      } else if (periodoSeleccionado.value === '30D') {
        const newDesde = new Date(hasta);
        newDesde.setDate(hasta.getDate() - 29);
        queryDesde = newDesde.toISOString().slice(0, 10);
      } else if (periodoSeleccionado.value === '90D') {
        const newDesde = new Date(hasta);
        newDesde.setDate(hasta.getDate() - 89);
        queryDesde = newDesde.toISOString().slice(0, 10);
      }

      OCube.value = await OlapCube(filtros.value.sucursal,2025,'','',filtros.value.desde,filtros.value.hasta, filtros.value.subcategoria); 
      graficarCube.value = await OlapCube(filtros.value.sucursal,2025,'','',queryDesde,filtros.value.hasta, filtros.value.subcategoria); 
    console.log( OCube.value )
   
    } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const  calcularPorcentaje = (anterior, actual) => {
  if (anterior === 0 && actual === 0) return 0;
  if (anterior === 0 && actual > 0) return 100;
  if (anterior > 0 && actual === 0) return -100;
  return ((actual - anterior) / anterior * 100).toFixed(2);
}

const formatTimeAgo = (dateString, timeString) => {
  // Check for null or undefined inputs
  if (!dateString || !timeString) {
    return 'fecha inválida';
  }

  // Primary attempt: ISO 8601 format YYYY-MM-DDTHH:MM:SS
  let activityDateTime = new Date(`${dateString}T${timeString}`);

  // Fallback: If dateString is already a full timestamp (e.g., from new Date().toISOString())
  if (isNaN(activityDateTime.getTime())) {
    activityDateTime = new Date(dateString);
  }

  // If still invalid, we cannot proceed.
  if (isNaN(activityDateTime.getTime())) {
    console.error("Could not parse date:", dateString, timeString);
    return "fecha inválida";
  }

  const now = new Date();
  // Get difference in seconds. getTime() returns UTC milliseconds.
  const diffInSeconds = Math.floor((now.getTime() - activityDateTime.getTime()) / 1000);

  if (diffInSeconds < 5) {
    return 'ahora mismo';
  }

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  if (years > 0) return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
  if (months > 0) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  if (days > 0) return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  if (hours > 0) return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  if (minutes > 0) return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  return `hace unos segundos`;
};



// Métricas principales
const metaDiaria = ref(3000) 

const ingresoTotal = computed(() => {
    if (OCube.value && OCube.value.resumen) {
        return OCube.value?.resumen?.ingresoTotal;
    }
    return 0;
});

const stockminimo = computed(() => {
    if (OCube.value && OCube.value.resumen) {
        return OCube.value?.resumen?.resumenStock?.stockMinimo;
    }
    return 0;
});

const stockCritico = computed(() => {
    if (OCube.value && OCube.value.resumen) {
        return OCube.value?.resumen?.resumenStock?.stockCritico;
    }
    return 0;
});

const stock = computed(() => {
    if (OCube.value && OCube.value.resumen) {
        return OCube.value?.resumen?.resumenStock?.stockTotal;
    }
    return 0;
});

const totalProductosVendidos = computed(() => {
    if (OCube.value && OCube.value.resumen) {
        return (OCube.value?.resumen?.desglose?.ventasDirectasProducto + OCube.value?.resumen?.desglose?.paquetesVendidos);
    }
    return 0;
});

const totalClientes = computed(() => {
    if (OCube.value && OCube.value.resumen && OCube.value.resumen.resumenClientes) {
        return OCube.value?.resumen?.resumenClientes?.totalClientes;
    }
    return 0;
});
const totalVentas = computed(() => { //rr
    if (OCube.value && OCube.value.resumen ) {
        return OCube.value?.resumen?.totalVentas;
    }
    return 0;
});
const clientesNuevos = computed(() => {
    if (OCube.value && OCube.value.resumen && OCube.value.resumen.resumenClientes) {
        return OCube.value?.resumen?.resumenClientes?.clientesNuevos;
    }
    return 0;
});
const clientesRecurrentes = computed(() => {
    if (OCube.value && OCube.value.resumen && OCube.value.resumen.resumenClientes) {
        return OCube.value?.resumen?.resumenClientes?.clientesRecurrentes;
    }
    return 0;
});

 ////ddd
// Datos de ventas para el gráfico
const salesChartData = ref({ labels: [], datasets: [] });

const getMonthNumber = (monthName) => {
  const months = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
  };
  return months[monthName.toLowerCase()];
};

const monthlyDateRanges = ref([]);
const weeklyDateRanges = ref([]);

//djfjdj   
const processAndAssignChartData = () => {
  const labels = [];
  const data = [];
  const rawSalesData = {}; // To store daily totals

  if (!graficaOlap.value || !graficaOlap.value.cubo) {
    salesChartData.value = { labels: [], datasets: [{ label: 'Ventas Diarias (Bs.)', backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1, data: [] }] };
    updateChart();
    return;
  }

  const sortedDates = Object.keys(graficaOlap.value.cubo).sort();

  // First, aggregate all sales by day
  sortedDates.forEach(date => {
    let dailyTotalSales = 0;
    const storesData = graficaOlap.value.cubo[date];

    for (const storeName in storesData) {
      const storeSales = storesData[storeName];
      
      if (storeSales.promocion) {
        for (const promoName in storeSales.promocion) {
          const promo = storeSales.promocion[promoName];
          dailyTotalSales += (promo.cantidad || 0) * (promo.ingreso || 0);
        }
      }
      if (storeSales.producto) {
        for (const productName in storeSales.producto) {
          const product = storeSales.producto[productName];
          dailyTotalSales += (product.cantidad || 0) * (product.ingreso || 0);
        }
      }
      if (storeSales.paquete) {
        for (const packageName in storeSales.paquete) {
          const pkg = storeSales.paquete[packageName];
          dailyTotalSales += (pkg.cantidad || 0) * (pkg.ingreso || 0);
        }
      }
    }
    rawSalesData[date] = Math.round(dailyTotalSales * 10) / 10;
  });

  // Now, apply aggregation based on periodoSeleccionado
  if (periodoSeleccionado.value === '24H') {
    if (periodoSeleccionado.value === '24H') {
    const hourlyBuckets = {
      '00-02': 0, '03-05': 0, '06-08': 0, '09-11': 0,
      '12-14': 0, '15-17': 0, '18-20': 0, '21-23': 0,
    };
    const hastaDateStr = filtros.value.hasta;
    const salesForDay = graficaOlap.value.cubo[hastaDateStr];

    if (salesForDay) {
      for (const storeName in salesForDay) {
        const storeSales = salesForDay[storeName];
        const processSales = (saleItems) => {
          for (const itemName in saleItems) {
            const item = saleItems[itemName];
            const timeArray = item.time; 
            if (Array.isArray(timeArray) && timeArray.length > 0) {
              const timeStr = timeArray[0];
              if (typeof timeStr === 'string' && timeStr.length >= 2) {
                const hour = parseInt(timeStr.substring(0, 2), 10);
                const profit = (item.cantidad || 0) * (item.ingreso || 0);
                const roundedProfit = Math.round(profit * 10) / 10;

                if (!isNaN(hour)) {
                  if (hour >= 0 && hour <= 2) hourlyBuckets['00-02'] += roundedProfit;
                  else if (hour >= 3 && hour <= 5) hourlyBuckets['03-05'] += roundedProfit;
                  else if (hour >= 6 && hour <= 8) hourlyBuckets['06-08'] += roundedProfit;
                  else if (hour >= 9 && hour <= 11) hourlyBuckets['09-11'] += roundedProfit;
                  else if (hour >= 12 && hour <= 14) hourlyBuckets['12-14'] += roundedProfit;
                  else if (hour >= 15 && hour <= 17) hourlyBuckets['15-17'] += roundedProfit;
                  else if (hour >= 18 && hour <= 20) hourlyBuckets['18-20'] += roundedProfit;
                  else if (hour >= 21 && hour <= 23) hourlyBuckets['21-23'] += roundedProfit;
                }
              }
            }
          }
        };

        if (storeSales.promocion) processSales(storeSales.promocion);
        if (storeSales.producto) processSales(storeSales.producto);
        if (storeSales.paquete) processSales(storeSales.paquete);
      }
    }

    labels.push(...Object.keys(hourlyBuckets).map(label => `${label}h`));
    data.push(...Object.values(hourlyBuckets));

  }

  } else if (periodoSeleccionado.value === '7D') {
    const hastaDate = new Date(filtros.value.hasta + 'T00:00:00');
    for (let i = 6; i >= 0; i--) {
      const date = new Date(hastaDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);
      
      labels.push(dateString);
      data.push(rawSalesData[dateString] || 0);
    }

  } else if (periodoSeleccionado.value === '30D') {
    const weeklyTotals = [0, 0, 0, 0, 0];
    const newWeeklyRanges = [];
    const hastaDate = new Date(filtros.value.hasta + 'T00:00:00');

    for (let i = 0; i < 30; i++) {
      const date = new Date(hastaDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);
      
      const weekIndex = Math.floor(i / 7);
      if (weekIndex < 5) {
        weeklyTotals[weekIndex] += rawSalesData[dateString] || 0;
      }
    }

    weeklyTotals.reverse();

    const formatOptions = { day: '2-digit', month: '2-digit' };
    const today = new Date(hastaDate);

    for (let i = 0; i < weeklyTotals.length; i++) {
      const weekAgo = (weeklyTotals.length - 1 - i);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - (weekAgo * 7));
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (weekAgo * 7) - 6);

      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29);
      if (startDate < thirtyDaysAgo) {
          startDate.setTime(thirtyDaysAgo.getTime());
      }

      const endLabel = endDate.toLocaleDateString('es-ES', formatOptions);
      const startLabel = startDate.toLocaleDateString('es-ES', formatOptions);
      
      newWeeklyRanges.push(`${startLabel} - ${endLabel}`);
      labels.push(`Semana ${i + 1}`);
      data.push(Math.round(weeklyTotals[i] * 10) / 10);
    }
    weeklyDateRanges.value = newWeeklyRanges;

  } else if (periodoSeleccionado.value === '90D') {
    const monthlyTotals = {};
    const newMonthlyRanges = []; // Declare newMonthlyRanges here
    const hastaDate = new Date(filtros.value.hasta + 'T00:00:00');

    for (let i = 0; i < 90; i++) {
      const date = new Date(hastaDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);
      
      const monthYearKey = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      
      if (!monthlyTotals[monthYearKey]) {
        monthlyTotals[monthYearKey] = 0;
      }
      monthlyTotals[monthYearKey] += rawSalesData[dateString] || 0;
    }

    const sortedMonthKeys = Object.keys(monthlyTotals).sort((a, b) => {
      const monthNameA = a.split(' ')[0];
      const yearA = a.split(' ')[2];
      const monthNameB = b.split(' ')[0];
      const yearB = b.split(' ')[2];
      const dateA = new Date(yearA, getMonthNumber(monthNameA));
      const dateB = new Date(yearB, getMonthNumber(monthNameB));
      return dateA - dateB;
    });

    for (const monthKey of sortedMonthKeys) {
      const [monthName, , year] = monthKey.split(' ');
      const monthIndex = getMonthNumber(monthName);
      
      const firstDayOfMonth = new Date(year, monthIndex, 1);
      const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

      const formatOptions = { day: '2-digit', month: '2-digit' };
      const startLabel = firstDayOfMonth.toLocaleDateString('es-ES', formatOptions);
      const endLabel = lastDayOfMonth.toLocaleDateString('es-ES', formatOptions);

      newMonthlyRanges.push(`${startLabel} - ${endLabel}`);
      labels.push(monthKey.split(' ')[0].charAt(0).toUpperCase() + monthKey.split(' ')[0].slice(1));
      data.push(Math.round(monthlyTotals[monthKey] * 10) / 10);
    }
    monthlyDateRanges.value = newMonthlyRanges;
  }

  salesChartData.value = {
    labels: labels,
    datasets: [
      {
        label: 'Ventas (Bs.)', // Changed label to be more general
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        data: data
      }
    ]
  };
  updateChart();
};

// Actividad reciente
const actividadReciente = ref([])

const activityConfig = {
  Venta: { icon: ShoppingCart, color: 'bg-gradient-to-br from-green-500 to-emerald-600', amountKey: 'profit', sign: '+', textColor: 'text-green-600' },
  Cliente: { icon: User, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  Compra: { icon: Truck, color: 'bg-gradient-to-br from-yellow-500 to-amber-600', amountKey: 'total', sign: '-', textColor: 'text-red-600' },
  Producto: { icon: Package, color: 'bg-gradient-to-br from-orange-500 to-red-600' },
  Pedido: { icon: ClipboardList, color: 'bg-gradient-to-br from-purple-500 to-pink-600', amountKey: 'total', textColor: 'text-purple-600' },
  default: { icon: Activity, color: 'bg-gradient-to-br from-gray-500 to-slate-600' }
};

const productosMasVendidos = computed(() => {
  if (OCube.value && OCube.value.resumen && OCube.value.resumen.top5Productos) {
    return OCube.value.resumen.top5Productos;
  }
  return [];
});

// Productos más vendidos
const top5Vista = ref('Productos');
const top5Vistas = ['Productos', 'Paquetes', 'Promociones'];

const top5Titulo = computed(() => {
  const titulos = {
    Productos: 'Productos Más Vendidos',
    Paquetes: 'Presentaciones Más Vendidos',
    Promociones: 'Promociones Más Vendidas'
  };
  return titulos[top5Vista.value];
});

const top5Datos = computed(() => {
  if (!OCube.value || !OCube.value.resumen) return [];
  switch (top5Vista.value) {
    case 'Productos':
      return OCube.value.resumen.top5Productos || [];
    case 'Paquetes':
      return OCube.value.resumen.top5Paquetes || [];
    case 'Promociones':
      return OCube.value.resumen.top5Promociones || [];
    default:
      return [];
  }
});

const rotarTop5 = () => {
  const currentIndex = top5Vistas.indexOf(top5Vista.value);
  const nextIndex = (currentIndex + 1) % top5Vistas.length;
  top5Vista.value = top5Vistas[nextIndex];
};


// Chart.js related
let chartInstance = null; // Use let for reassignment

const createChart = () => {
  const ctx = document.getElementById('salesChartCanvas');
  if (ctx) {
    if (chartInstance) {
      chartInstance.destroy(); // Destroy previous instance
    }

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400); // Vertical gradient
    gradient.addColorStop(0, 'rgba(251, 146, 60, 0.8)'); // Tailwind orange-400
    gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.8)'); // Tailwind red-500
    gradient.addColorStop(1, 'rgba(234, 88, 12, 0.8)'); // Tailwind orange-600

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: salesChartData.value.labels,
        datasets: [
          {
            label: 'Ventas (Bs.)',
            backgroundColor: gradient, // Use the gradient
            borderColor: 'rgba(239, 68, 68, 1)', // A matching border color
            borderWidth: 1,
            data: salesChartData.value.data
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                const label = tooltipItems[0].label;
                if (periodoSeleccionado.value === '30D' && weeklyDateRanges.value.length > 0) {
                  const index = tooltipItems[0].dataIndex;
                  return weeklyDateRanges.value[index] || '';
                }
                if (periodoSeleccionado.value === '90D' && monthlyDateRanges.value.length > 0) {
                  const index = tooltipItems[0].dataIndex;
                  return monthlyDateRanges.value[index] || '';
                }
                if (periodoSeleccionado.value === '7D') {
                  const dateObj = new Date(label + 'T00:00:00');
                  return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(200, 200, 200, 0.2)' // Lighten grid lines
            },
            ticks: {
              color: 'rgb(107, 114, 128)' // gray-500
            }
          },
          x: {
            grid: {
              display: false // Remove vertical grid lines
            },
            ticks: {
              color: 'rgb(107, 114, 128)', // gray-500
              callback: function(value) {
                const label = this.getLabelForValue(value);
                if (periodoSeleccionado.value === '7D') {
                  const dateObj = new Date(label + 'T00:00:00');
                  const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
                }
                return label;
              }
            }
          }
        }
      }
    });
  }
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.data = salesChartData.value;
    chartInstance.update();
  } else {
    createChart(); // Recreate if for some reason it was destroyed
  }
};


// Accesos rápidos
const accesosRapidos = ref([
  {
    id: 1,
    nombre: 'Nueva Venta',
    icono: Plus,
    color: 'bg-gradient-to-br from-green-500 to-emerald-600'
  },
  {
    id: 2,
    nombre: 'Productos',
    icono: Package,
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  },
  {
    id: 3,
    nombre: 'Reportes',
    icono: FileText,
    color: 'bg-gradient-to-br from-purple-500 to-pink-600'
  },
  {
    id: 4,
    nombre: 'Inventario',
    icono: Archive,
    color: 'bg-gradient-to-br from-orange-500 to-red-600'
  },
  {
    id: 5,
    nombre: 'Calculadora',
    icono: Calculator,
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600'
  },
  {
    id: 6,
    nombre: 'Configuración',
    icono: Settings,
    color: 'bg-gradient-to-br from-gray-500 to-slate-600'
  }
])

// Computed
const fechaActual = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Función para aplicar filtros (simulada)
const aplicarFiltros = async () => {
  console.log("Aplicando filtros:", filtros.value);
  await ListaRCUbOne();
  await Listarmoviminetos(); // Call Listarmoviminetos here
  await fetchGraficaData();
};

// Observa cambios en los filtros y aplica los filtros automáticamente
watch(filtros, aplicarFiltros, { deep: true });

watch(periodoSeleccionado, (newPeriodo) => {
  // When a period button is clicked, just re-apply filters.
  // The date range logic is now handled internally by the data fetching function.
  if (newPeriodo) {
    aplicarFiltros();
  }
});



// Methods
onMounted( async () => {
  await ListarSucursal();
  await ListarCategorias();
  aplicarFiltros(); // This function now handles all data fetching
  createChart(); // Initialize chart on mount
  // Simular actualizaciones en tiempo real
  setInterval(() => {
    // Actualizar métricas aleatoriamente
    if (Math.random() > 0.7) {
      // ventasHoy.value += Math.floor(Math.random() * 50) + 10
      // productosVendidos.value += Math.floor(Math.random() * 3) + 1
      // clientesAtendidos.value += Math.floor(Math.random() * 2) + 1
    }
  }, 10000)
})
</script>

<style scoped>
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

/* Animaciones personalizadas */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Transition for filters */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>