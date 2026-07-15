<template>
  <div class="min-h-screen">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- Header -->
    <ReporteHeader />

    <!-- Filtros -->
    <ReporteFiltros 
      v-model:filtros="filtros"
      v-model:filtro-categoria="filtroCategoria"
      v-model:agrupar-por-semana="agruparPorSemana"
      :active-tab="activeTab"
      :sucursales="sucursales"
      :empleados="empleados"
      :revendedores="revendedores"
      :usuario-vendedor="usuarioVendedor"  
      :clientes="clientes"
      :metodo="metodo"
      :tiposPedido="tiposPedido"
      :categorias="categorias"
      :subcategorias-para-filtro="subcategoriasParaFiltro"
      :proveedores="proveedores"
      :insumos-lista="insumosLista"
      :productos="productosLista"
      @aplicar-filtro-rapido="aplicarFiltroRapido"
      @exportar-excel="exportarExcel"
      @exportar-pdf="exportarPDF"
    />

    <!-- Indicadores -->
    <!-- <ReporteIndicadores v-if="activeTab !== 'inventario' && activeTab !== 'kardex'" :indicadores="indicadores" :active-tab="activeTab" /> -->

    <!-- Pestañas de Navegación -->
    <ReporteTabs v-model:active-tab="activeTab" />

    <!-- Contenido de las Pestañas -->
    <div ref="tabContent" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div v-if="activeTab === 'financiero'">
        <FinancieroTable ref="financieroTableRef"
          :reporte="reporteFinanciero"
          :format-fecha="formatFecha"
          :agrupar-por-semana="agruparPorSemana"
        />
      </div>

      <div v-if="activeTab === 'ventas'">
        <VentasTable ref="ventasTableRef" :sorted-ventas="sortedVentas" :format-fecha="formatFecha" :consolidado="ventasConsolidada" :agrupar-por-semana="agruparPorSemana" />
      </div>

      <div v-if="activeTab === 'pedidos'">
        <PedidosTable ref="pedidosTableRef" :processed-pedidos-grouped="processedPedidosGrouped" :format-fecha="formatFecha" :consolidado="pedidosConsolidado" :agrupar-por-semana="agruparPorSemana" />
      </div>

      <div v-if="activeTab === 'transferencias'">
        <TransferenciaTable ref="transferenciasTableRef"
          :transferencias="transferencias"
          :consolidado="transferenciasConsolidada"
          :format-fecha="formatFecha"
          :agrupar-por-semana="agruparPorSemana"
        />
      </div>

      <div v-if="activeTab === 'compras'">
        <ComprasTable ref="comprasTableRef"
          :compras="comprasDetallada"
          :consolidado="comprasConsolidada"
          :format-fecha="formatFecha"
          :agrupar-por-semana="agruparPorSemana"
        />
      </div>

      <div v-if="activeTab === 'produccion'">
        <ProduccionTable ref="produccionTableRef"
          :consolidado="reporteProduccionConsolidada"
          :detallado="reporteProduccionDetallada"
          :format-fecha="formatFecha"
          :agrupar-por-semana="agruparPorSemana"
        />
      </div>

      <div v-if="activeTab === 'inventario'">
        <InventarioTable ref="inventarioTableRef"
          :consolidado="reporteInventario"
          :agrupar-por-semana="agruparPorSemana"
        />
      </div>

      <div v-if="activeTab === 'kardex'">
        <KardexTable 
          :reporte="reporteKardex"
          :format-fecha="formatFecha"
          :agrupar-por-semana="agruparPorSemana"
        />
      </div>

      <div v-if="activeTab === 'comision'">
        <ComisionTable ref="comisionTableRef"
          :detallado="comisionDetallada"
          :consolidado="comisionConsolidada"
          :format-fecha="formatFecha"
          :agrupar-por-semana="agruparPorSemana"
        />
      </div>

      <div v-if="activeTab === 'gastos-generales'">
        <GastosGeneralesTable ref="gastosGeneralesTableRef"
          :reporte="reporteGastosGenerales"
          :format-fecha="formatFecha"
          :agrupar-por-semana="agruparPorSemana"
        />
      </div>

      <div v-if="activeTab === 'resumen-semanal'">
        <ResumenSemanalTable 
          :fechadesde="filtros.fechadesde"
          :fechahasta="filtros.fechahasta"
          :idsucursal="filtros.idsucursal"
        />
      </div>

    </div>
  </div>  
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { listarPago } from "@/Server/Pago"
import { listarTipopedido } from "@/Server/Pedido"
import { ReporteComisionDetallado,ReporteComisionConsolidado , ReproteFinanciero, ReporteProduccion, ReporteProduccionConsolidado, ReporteKardex, ReporteInventario, ReportePresioHistorico, ReporteCompraConsolidada, ReporteVenta, ReporteVentaConsolidada, ReporteTransferencia, ReporteTransferenciaConsolidada, ReportePedido, ReportePedidoConsolidado, ReporteGastosGenerales, ReporteSemanalGeneral } from "@/Server/Reporte"
import { getRevendedores } from "@/Server/ControlRevendedor"
import { listarCategorias, ObtenerSubCategorias } from '@/Server/Categoria'
import { getEmpleadosVendedores } from "@/Server/Empleado.js"
import { listarUsuarioVendedor } from "@/Server/Usuario"
import { listarCliente } from "@/Server/persona"
import { Listsucursal } from "@/Server/Sucural"
import { listarProveedores } from "@/Server/Proveedor.js"
import { ListInsumo } from "@/Server/Insumo"
import { listProduct } from "@/Server/Producto.js"
//  COSTO_TOTAL: El costo final de toda la sesión de producción ,COSTO_INSUMOS: El valor monetario de todos los ingredientes utilizados. COSTO_MANO_OBRA: El costo calculado por el tiempo de los empleados. COSTO_INDIRECTO: El costo de energía y uso de hornos.lote.costo_unitario:Dentro de la tabla de lotes, representa el costo de fabricar una sola unidad de ese producto específico.
// Componentes extraídos
import ReporteHeader from './ReporteHeader.vue'
import ReporteFiltros from './ReporteFiltros.vue'
import ReporteIndicadores from './ReporteIndicadores.vue'
import ReporteTabs from './ReporteTabs.vue'
import VentasTable from './VentasTable.vue'
import PedidosTable from './PedidosTable.vue'
import TransferenciaTable from './TransferenciaTable.vue'
import ComprasTable from './ComprasTable.vue'
import ProduccionTable from './ProduccionTable.vue'
import InventarioTable from './InventarioTable.vue'
import KardexTable from './KardexTable.vue'
import FinancieroTable from './FinancieroTable.vue'
import ComisionTable from './ComisionTable.vue'
import GastosGeneralesTable from './GastosGeneralesTable.vue'
import ResumenSemanalTable from './ResumenSemanalTable.vue'

import logoMasasCori from '@/views/assets/LogoMasasCorir.png';

// --- Lógica de Pestañas ---
const activeTab = ref('financiero');
const reporteFinanciero = ref({ resumenGeneral: {}, reportePorSucursal: [], evolucionDiaria: [] });
const tabContent = ref(null);
const financieroTableRef = ref(null);
const ventasTableRef = ref(null);
const pedidosTableRef = ref(null);
const transferenciasTableRef = ref(null);
const comprasTableRef = ref(null);
const produccionTableRef = ref(null);
const inventarioTableRef = ref(null);
const comisionTableRef = ref(null);
const gastosGeneralesTableRef = ref(null);

// --- Agrupación por Semana ---
const agruparPorSemana = ref(false)

const getWeekMonday = (dateStr) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'Sin fecha') return dateStr
  const clean = dateStr.split('T')[0]
  const d = new Date(clean + 'T12:00:00')
  if (isNaN(d.getTime())) return clean
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const getWeekLabel = (mondayStr) => {
  if (!mondayStr || mondayStr === 'N/A' || mondayStr === 'Sin fecha') return mondayStr
  const d = new Date(mondayStr + 'T12:00:00')
  if (isNaN(d.getTime())) return mondayStr
  const end = new Date(d)
  end.setDate(d.getDate() + 6)
  const fmt = (date) => {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }
  return `${fmt(d)} - ${fmt(end)}`
}

const groupByWeek = (dayGroups, itemsKey, totalKey) => {
  const weeks = {}
  dayGroups.forEach(group => {
    const monday = getWeekMonday(group.fecha)
    if (!weeks[monday]) {
      const weekGroup = { fecha: monday, semanaLabel: getWeekLabel(monday) }
      weekGroup[itemsKey] = []
      if (totalKey) weekGroup[totalKey] = 0
      weeks[monday] = weekGroup
    }
    const week = weeks[monday]
    week[itemsKey].push(...(group[itemsKey] || []))
    if (totalKey) week[totalKey] += group[totalKey] || 0
  })
  return Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

// --- Lógica de Ordenamiento ---
const sortKey = ref('');
const sortOrder = ref('asc');

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

const processedVentasGrouped = computed(() => {
  const grouped = {};
  if (!ventas.value || !ventas.value.ventas) return [];

  ventas.value.ventas.forEach(venta => {
    const fechaKey = venta.fechaventa ? venta.fechaventa.split('T')[0] : 'N/A';
    
    if (!grouped[fechaKey]) {
      grouped[fechaKey] = {
        fecha: fechaKey,
        totalIngreso: 0,
        ventas: []
      };
    }

    const clientName = venta.cliente || 'Consumidor Final';
    const itemsCount = (venta.detalles && venta.detalles.length > 0) ? venta.detalles.length : 1;
    grouped[fechaKey].totalIngreso += parseFloat(venta.preciototal || 0);

    if (venta.detalles && venta.detalles.length > 0) {
      venta.detalles.forEach((detalle, index) => {
        const itemNombre = detalle.item_nombre || (detalle.presentacion === 'PROMOCIÓN' ? 'Promoción' : 'N/A');
        const displayNombre = `${itemNombre} (${detalle.presentacion})`;
        
        grouped[fechaKey].ventas.push({
          idVenta: venta.idventa,
          fecha: venta.fechaventa,
          cliente: clientName,
          sucursal: venta.sucursal || 'Sin sucursal',
          producto: displayNombre,
          cantidad: detalle.cantidad,
          precio: parseFloat(detalle.precio || '0').toFixed(2),
          subtotal: (parseFloat(detalle.cantidad) * parseFloat(detalle.precio || '0')).toFixed(2),
          estado: venta.estado === 0 ? 'Anulada' : 'Pagado',
          hasFactura: venta.tiene_factura,
          nroFactura: venta.nro_factura || 'S/F',
          urlFactura: venta.factura_url,
          precioTotalVenta: parseFloat(venta.preciototal || 0).toFixed(2),
          isFirstInSale: index === 0,
          clientRowspan: index === 0 ? itemsCount : 0,
        });
      });
    } else {
      grouped[fechaKey].ventas.push({
        idVenta: venta.idventa,
        fecha: venta.fechaventa,
        cliente: clientName,
        sucursal: venta.sucursal || 'Sin sucursal',
        producto: 'Sin detalles',
        cantidad: 0,
        precio: '0.00',
        subtotal: '0.00',
        estado: venta.estado === 0 ? 'Anulada' : 'Pagado',
        hasFactura: venta.tiene_factura,
        nroFactura: venta.nro_factura || 'S/F',
        urlFactura: venta.factura_url,
        precioTotalVenta: parseFloat(venta.preciototal || 0).toFixed(2),
        isFirstInSale: true,
        clientRowspan: 1,
      });
    }
  });

  return Object.values(grouped).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const sortedVentas = computed(() => {
  let sorted = [...processedVentasGrouped.value];
  if (sortKey.value === 'fecha') {
    sorted.sort((a, b) => {
      return sortOrder.value === 'asc' ? String(a.fecha).localeCompare(String(b.fecha)) : String(b.fecha).localeCompare(String(a.fecha));
    });
  }
  if (agruparPorSemana.value) return groupByWeek(sorted, 'ventas', 'totalIngreso')
  return sorted;
});

const processedPedidosGrouped = computed(() => {
  const grouped = {};
  const data = pedidos.value?.pedidos || (Array.isArray(pedidos.value) ? pedidos.value : []);
  if (!data || !Array.isArray(data)) return [];

  data.forEach(pedido => {
    const fecha = pedido.fecharegistro ? pedido.fecharegistro.split('T')[0] : 'N/A';
    if (!grouped[fecha]) {
      grouped[fecha] = {
        fecha,
        pedidos: [],
        totalPedidos: 0
      };
    }
    grouped[fecha].totalPedidos++;

    // Aplanar todos los ítems y sus presentaciones, manteniendo jerarquía para agrupamiento
    const flattenedDetalles = [];
    if (pedido.detalles && Array.isArray(pedido.detalles)) {
      pedido.detalles.forEach(item => {
        if (item.presentaciones && Array.isArray(item.presentaciones)) {
          const itemRowspan = item.presentaciones.length || 1;
          item.presentaciones.forEach((pres, presIdx) => {
            flattenedDetalles.push({
              item_nombre: item.item_nombre,
              item_imagen: item.item_imagen,
              isFirstInItem: presIdx === 0,
              itemRowspan: itemRowspan,
              ...pres
            });
          });
        }
      });
    }

    const totalRows = flattenedDetalles.length || 1;

    if (flattenedDetalles.length > 0) {
      flattenedDetalles.forEach((det, idx) => {
        grouped[fecha].pedidos.push({
          id: `${pedido.idpedido}-${idx}`,
          isFirstInPedido: idx === 0,
          pedidoRowspan: totalRows,
          idpedido: pedido.idpedido,
          hora: pedido.hora,
          cliente: pedido.cliente || 'N/A',
          cliente_telefono: pedido.cliente_telefono || 'S/D',
          estado_nombre: pedido.estado_nombre || 'N/A',
          tipo_pedido: pedido.tipo_pedido || 'N/A',
          sucursal: pedido.sucursal || 'N/A',
          total: parseFloat(pedido.total || 0),
          adelanto: parseFloat(pedido.adelanto || 0),
          saldo: parseFloat(pedido.saldo || 0),
          
          // Detalles del Ítem (Ya aplanados y marcados para agrupamiento)
          isFirstInItem: det.isFirstInItem,
          itemRowspan: det.itemRowspan,
          productoNombre: det.item_nombre,
          productoImagen: det.item_imagen,
          presentacion: det.presentacion,
          productoCantidad: det.cantidad,
          productoPrecio: parseFloat(det.precio || 0),
          subtotal: parseFloat(det.subtotal || 0),
          productos_de_promocion: det.productos_de_promocion
        });
      });
    } else {
      grouped[fecha].pedidos.push({
        id: pedido.idpedido,
        isFirstInPedido: true,
        pedidoRowspan: 1,
        idpedido: pedido.idpedido,
        hora: pedido.hora,
        cliente: pedido.cliente || 'N/A',
        estado_nombre: pedido.estado_nombre || 'N/A',
        tipo_pedido: pedido.tipo_pedido || 'N/A',
        sucursal: pedido.sucursal || 'N/A',
        total: parseFloat(pedido.total || 0),
        adelanto: 0,
        saldo: 0,
        isFirstInItem: true,
        itemRowspan: 1,
        productoNombre: 'Sin detalles',
        productoCantidad: '-',
        productoPrecio: '-',
        subtotal: '-'
      });
    }
  });

  let result = Object.values(grouped).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  if (agruparPorSemana.value) return groupByWeek(result, 'pedidos', 'totalPedidos')
  return result;
});

// Filtros
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const currentDate = `${year}-${month}-${day}`;
const filtros = ref({ desde: currentDate, hasta: currentDate, tienda: "", vendedor: "", metodoPago: 0, cliente: "", subcategorias:'', TipoCliente:'', IdEstado:0, IdEstadoVenta:0, idtipopedido: 0, estado: "", idsucursalorigen: "", idsucursaldestino: "", idempleado: "", idproveedor: "", idinsumo: "", tipoItem: "", iditem: "" });
const filtroCategoria = ref('');
const categorias = ref([]);
const subcategoriasParaFiltro = ref([]);
const proveedores = ref([]);
const insumosLista = ref([]);
const productosLista = ref([]);
const comprasDetallada = ref([]);
const comprasConsolidada = ref({});
const reporteProduccionDetallada = ref({});
const reporteProduccionConsolidada = ref([]);
const reporteInventario = ref({});
const reporteKardex = ref({});
const comisionDetallada = ref({});
const comisionConsolidada = ref({});
const reporteGastosGenerales = ref({});

const processedTransferencias = computed(() => {
  const data = transferencias.value?.data || transferencias.value?.transferencias || (Array.isArray(transferencias.value) ? transferencias.value : []);
  if (!data || !Array.isArray(data)) return [];
  
  const groups = {};
  data.forEach(t => {
    const fecha = t.fecha ? t.fecha.split('T')[0] : 'N/A';
    if (!groups[fecha]) {
      groups[fecha] = {
        fecha,
        transferencias: []
      };
    }
    
    const detalles = [];
    if (t.Productos) {
      t.Productos.forEach(p => {
        const presInfo = p.presentaciones && p.presentaciones.length > 0 
          ? ` (${p.presentaciones.map(pr => `${pr.cantidad} ${pr.presentacion}`).join(', ')})` 
          : '';
        detalles.push({
          tipo: 'Producto',
          nombre: p.producto_nombre + presInfo,
          cantidad: p.total_cantidad
        });
      });
    }
    if (t.Insumos) {
      t.Insumos.forEach(i => {
        const medInfo = i.medidas && i.medidas.length > 0 
          ? ` (${i.medidas.map(m => `${m.cantidad} ${m.unidad || m.abreviatura}`).join(', ')})` 
          : '';
        detalles.push({
          tipo: 'Insumo',
          nombre: i.insumo_nombre + medInfo,
          cantidad: i.total_cantidad
        });
      });
    }
    
    groups[fecha].transferencias.push({
      idtransferencia: t.idtransferencia,
      hora: t.hora,
      origen: t.SucursalOrigen,
      destino: t.SucursalDestino || t.EmpleadoDestino || 'N/A',
      montoTotal: t.MontoTotalProductos || 0,
      comision: t.TotalComision || 0,
      estado: t.estado,
      detalles: detalles.length > 0 ? detalles : [{ tipo: 'S/D', nombre: 'Sin detalles', cantidad: '-' }]
    });
  });
  
  let result = Object.values(groups).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  if (agruparPorSemana.value) return groupByWeek(result, 'transferencias')
  return result;
});

const indicadores = ref({ totalVentas: 0, productosVendidos: 0, clientes: 0, ventasAnuladas: 0, gananciaNeta: 0, topCliente: null, topVendedor: null });
const sucursales = ref([]);
const empleados = ref([]);
const usuarioVendedor = ref([]);
const metodo = ref([]);
const tiposPedido = ref([]);
const ventas = ref({});
const ventasConsolidada = ref({});
const pedidos = ref([]); 
const pedidosConsolidado = ref({});
const transferencias = ref({});
const transferenciasConsolidada = ref({});
const clientes = ref([]);
const revendedores = ref([]);

const cargarSucursales = async () => { 
  try { 
    const [respSuc, respEmp, respRev] = await Promise.all([Listsucursal(), getEmpleadosVendedores(), getRevendedores()]);
    sucursales.value = respSuc.result || respSuc || []; 
    empleados.value = respEmp.result || respEmp || [];
    revendedores.value = respRev.result || respRev || [];
  } catch (error) { 
    console.error('Error al cargar sucursales, empleados o revendedores:', error); 
  } 
};
const cargarventas = async () => { 
  try { 
    const [ventasResp, consolidadoResp] = await Promise.all([
      ReporteVenta(
        filtros.value.tienda || null, 
        filtros.value.desde, 
        filtros.value.hasta, 
        filtros.value.vendedor || null, 
        filtros.value.cliente || null, 
        filtros.value.metodoPago || null,
        filtros.value.estado || null
      ),
      ReporteVentaConsolidada(
        filtros.value.tienda || null,
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.vendedor || null
      )
    ]);
    ventas.value = ventasResp.result || ventasResp || {};
    ventasConsolidada.value = consolidadoResp.result || consolidadoResp || {};
  } catch (error) { 
    console.error('Error al cargar ventas:', error); 
  } 
};
const cargarTransferencias = async () => {
  try {
    const [respDet, respCons] = await Promise.all([
      ReporteTransferencia(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.idsucursalorigen || null,
        filtros.value.idsucursaldestino || null,
        filtros.value.idempleado || null
      ),
      ReporteTransferenciaConsolidada(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.idsucursalorigen || null,
        filtros.value.idsucursaldestino || null,
        filtros.value.idempleado || null
      )
    ]);
    transferencias.value = respDet.result || respDet || { data: [] };
    transferenciasConsolidada.value = respCons.result || respCons || { data: [] };
  } catch (error) {
    console.error('Error al cargar transferencias:', error);
  }
};
const cargarCompras = async () => {
  try {
    const [respDet, respCons] = await Promise.all([
      ReportePresioHistorico(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.idproveedor || null,
        filtros.value.idinsumo || null
      ),
      ReporteCompraConsolidada(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.idproveedor || null,
        filtros.value.idinsumo || null
      )
    ]);
    comprasDetallada.value = respDet.result || respDet || [];
    comprasConsolidada.value = respCons.result || respCons || {};
  } catch (error) {
    console.error('Error al cargar compras:', error);
  }
};
const cargarProduccion = async () => {
  try {
    const [respDet, respCons] = await Promise.all([
      ReporteProduccion(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.tienda || null,
        filtros.value.iditem || null
      ),
      ReporteProduccionConsolidado(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.tienda || null,
        filtros.value.iditem || null
      )
    ]);
    reporteProduccionDetallada.value = respDet?.result || respDet?.data || respDet || {};
    reporteProduccionConsolidada.value = respCons?.result || respCons?.data || respCons || [];
  } catch (error) {
    console.error('Error al cargar producción:', error);
  }
};
const cargarInventario = async () => {
  try {
    const resp = await ReporteInventario(
      filtros.value.tienda || null,
      filtros.value.tipoItem || null,
      filtros.value.iditem || null
    );
    reporteInventario.value = resp.result || resp || {};
  } catch (error) {
    console.error('Error al cargar inventario:', error);
  }
};
const cargarKardex = async () => {
  try {
    const resp = await ReporteKardex(
      filtros.value.iditem || null,
      filtros.value.tipoItem || null,
      filtros.value.tienda || null,
      filtros.value.desde,
      filtros.value.hasta
    );
    reporteKardex.value = resp.result || resp || {};
  } catch (error) {
    console.error('Error al cargar kardex:', error);
  }
};

const cargarComision = async () => {
  try {
    const [respDet, respCons] = await Promise.all([
      ReporteComisionDetallado(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.idempleado || null,
        filtros.value.tienda || null
      ),
      ReporteComisionConsolidado(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.idempleado || null,
        filtros.value.tienda || null
      )
    ]);
    comisionDetallada.value = respDet?.result || respDet || {};
    comisionConsolidada.value = respCons?.result || respCons || {};
  } catch (error) {
    console.error('Error al cargar comisiones:', error);
  }
};

const cargarGastosGenerales = async () => {
  try {
    const resp = await ReporteGastosGenerales(filtros.value.desde, filtros.value.hasta);
    reporteGastosGenerales.value = resp.result || resp || {};
  } catch (error) {
    console.error('Error al cargar gastos generales:', error);
  }
};

const cargarFinanciero = async () => {
  try {
    const resp = await ReproteFinanciero(
      filtros.value.desde,
      filtros.value.hasta,
      filtros.value.tienda || null
    );
    reporteFinanciero.value = resp.result || resp || {};
  } catch (error) {
    console.error('Error al cargar reporte financiero:', error);
  }
};

const cargarpedidos = async () => { 
  try { 
    const [detalladoResp, consolidadoResp] = await Promise.all([
      ReportePedido(
        filtros.value.desde, 
        filtros.value.hasta, 
        filtros.value.tienda || null, 
        filtros.value.IdEstado || null, 
        filtros.value.idtipopedido || null,
        filtros.value.cliente || null
      ),
      ReportePedidoConsolidado(
        filtros.value.desde,
        filtros.value.hasta,
        filtros.value.tienda || null,
        filtros.value.idtipopedido || null
      )
    ]);
    pedidos.value = detalladoResp.result || detalladoResp || {};
    pedidosConsolidado.value = consolidadoResp.result || consolidadoResp || {};
  } catch (error) { 
    console.error('Error al cargar pedidos:', error); 
  } 
};

const cargarUsuarios = async () => { try { const resp = await listarUsuarioVendedor(); usuarioVendedor.value = Array.isArray(resp) ? resp : (resp.result || resp.data || []); } catch (error) { console.error('Error al cargar usuarios:', error); } };
const cargarClientes = async () => { try { const resp = await listarCliente(); clientes.value = Array.isArray(resp) ? resp : (resp.result || resp.data || []); } catch (error) { console.error('Error al cargar clientes:', error); } };
const cargarMetodo = async () => { try { const resp = await listarPago(); metodo.value = Array.isArray(resp) ? resp : (resp.result || resp.data || []); } catch (error) { console.error('Error al cargar metodos de pago:', error); } };
const cargarProveedores = async () => { try { const resp = await listarProveedores(); proveedores.value = Array.isArray(resp) ? resp : (resp.result || resp.data || []); } catch (error) { console.error('Error al cargar proveedores:', error); } };
const cargarInsumosLista = async () => { try { const resp = await ListInsumo(); insumosLista.value = Array.isArray(resp) ? resp : (resp.result || resp.data || []); } catch (error) { console.error('Error al cargar insumos:', error); } };
const cargarProductosLista = async () => { try { const resp = await listProduct(); productosLista.value = Array.isArray(resp) ? resp : (resp.result || resp.data || []); } catch (error) { console.error('Error al cargar productos:', error); } };
const ListarCategoriasPrincipales = async () => { try { const resp = await listarCategorias(); categorias.value = Array.isArray(resp) ? resp : (resp.result || resp.data || []); } catch (error) { console.error('Error al cargar categorias:', error); } };
const ObtenerSubCategoriasParaFiltro = async (idCategoria) => { try { const resp = await ObtenerSubCategorias(idCategoria); subcategoriasParaFiltro.value = Array.isArray(resp) ? resp : (resp.result || resp.data || []); } catch (error) { console.error('Error al cargar subcategorias:', error); } };

const aplicarFiltroRapido = (rango) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let newDesde = new Date(); let newHasta = new Date();
  const formatDate = (date) => date.toISOString().slice(0, 10);
  switch (rango) {
    case 'today': newDesde = today; newHasta = today; break;
    case 'yesterday': newDesde.setDate(today.getDate() - 1); newHasta.setDate(today.getDate() - 1); break;
    case 'this_week': newDesde.setDate(today.getDate() - today.getDay()); newHasta = today; break;
    case 'this_month': newDesde = new Date(today.getFullYear(), today.getMonth(), 1); newHasta = today; break;
    case 'last_7_days': newDesde.setDate(today.getDate() - 6); newHasta = today; break;
    case 'last_30_days': newDesde.setDate(today.getDate() - 29); newHasta = today; break;
  }
  filtros.value.desde = formatDate(newDesde);
  filtros.value.hasta = formatDate(newHasta);
};

const formatFecha = (fecha) => {
  if (!fecha) return fecha;
  const clean = fecha.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [year, month, day] = clean.split('-');
    return `${day}/${month}/${year}`;
  }
  if (/^\d{2}-\d{2}-\d{2,4}$/.test(clean)) {
    const [day, month, year] = clean.split('-');
    return `${day}/${month}/${year.length === 2 ? '20' + year : year}`;
  }
  return clean;
};

const formatFechaHora = () => {
  const now = new Date();
  const fecha = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${fecha} ${hora}`;
};

const getImageBase64 = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error al cargar la imagen:', error);
    return null;
  }
};

const addPDFHeader = async (doc, titulo) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  let logoWidth = 0;

  try {
    const logoBase64 = await getImageBase64(logoMasasCori);
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);
      logoWidth = 35;
    }
  } catch (error) {
    
    logoWidth = 0;
  }

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(titulo, 14 + logoWidth, 22);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text(`Generado: ${formatFechaHora()}`, 14 + logoWidth, 32);

  doc.setDrawColor(200);
  doc.line(14, 45, pageWidth - 14, 45);

  doc.setTextColor(0);
  return 50;
};

const addChartToPDF = (doc, index, x, y, w) => {
  try {
    const canvas = tabContent.value?.querySelectorAll('canvas');
    if (!canvas || !canvas[index]) return null;
    const img = canvas[index].toDataURL('image/png');
    const aspectRatio = canvas[index].width / canvas[index].height;
    const h = w / aspectRatio;
    if (h > 0) {
      doc.addImage(img, 'PNG', x, y, w, h);
      return h;
    }
    return null;
  } catch (e) {
    console.warn('Chart capture error:', e);
    return null;
  }
};

const captureCanvasById = (doc, elementId, x, y, w) => {
  try {
    const el = document.getElementById(elementId);
    if (!el) return null;
    const img = el.toDataURL('image/png');
    const aspectRatio = el.width / el.height;
    const h = w / aspectRatio;
    if (h > 0) {
      doc.addImage(img, 'PNG', x, y, w, h);
      return h;
    }
    return null;
  } catch (e) {
    console.warn('Canvas by ID capture error:', e);
    return null;
  }
};

const sanitizeId = (str) => str.replace(/[^a-zA-Z0-9]/g, '-');

const addChartDataToWorkbook = (wb, sheetName, labels, datasets) => {
  const ws = XLSX.utils.json_to_sheet([]);
  const ref = XLSX.utils.aoa_to_sheet([['Etiqueta', ...datasets.map(d => d.label)], ...labels.map((l, i) => [l, ...datasets.map(d => d.data[i])])]);
  XLSX.utils.book_append_sheet(wb, ref, sheetName);
};

watch(activeTab, () => {
    filtros.value.vendedor = "";
    filtros.value.cliente = "";
    filtros.value.metodoPago = 0;
    filtros.value.TipoCliente = "";
    filtros.value.IdEstado = 0;
    filtros.value.IdEstadoVenta = 0;
    filtroCategoria.value = "";
    filtros.value.idsucursalorigen = "";
    filtros.value.idsucursaldestino = "";
    filtros.value.idempleado = "";
    filtros.value.idproveedor = "";
    filtros.value.idinsumo = "";
    cargarReporteActivo();
});

watch(filtros, async () => {
  await generarReporte();
}, { deep: true });

watch(filtroCategoria, async (newVal) => {
  filtros.value.subcategorias = '';
  if (newVal && newVal !== '') await ObtenerSubCategoriasParaFiltro(newVal);
  else subcategoriasParaFiltro.value = [];
});

onMounted(async () => {
  await Promise.all([cargarSucursales(), cargarMetodo(), cargarUsuarios(), cargarClientes(), ListarCategoriasPrincipales(), cargarProveedores(), cargarInsumosLista(), cargarProductosLista(), listarTipopedido().then(r => tiposPedido.value = r || [])]);
  await generarReporte();
});

const cargarReporteActivo = async () => {
  const mapa = {
    financiero: cargarFinanciero,
    ventas: cargarventas,
    pedidos: cargarpedidos,
    transferencias: cargarTransferencias,
    compras: cargarCompras,
    produccion: cargarProduccion,
    inventario: cargarInventario,
    kardex: cargarKardex,
    comision: cargarComision,
    'gastos-generales': cargarGastosGenerales
  };
  const fn = mapa[activeTab.value];
  if (fn) await fn();
};

const generarReporte = async () => {
  await cargarReporteActivo();
  const desde = new Date(filtros.value.desde); const hasta = new Date(filtros.value.hasta);
  if (desde > hasta) { alert("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'."); return; }

  // Reiniciar indicadores
  indicadores.value = { 
    totalVentas: 0, 
    productosVendidos: 0, 
    clientes: 0, 
    ventasAnuladas: 0, 
    gananciaNeta: 0, 
    topCliente: null, 
    topVendedor: null 
  };

  if (activeTab.value === 'financiero') {
    const data = reporteFinanciero.value;
    if (data && data.resumenGeneral) {
      indicadores.value.totalVentas = parseFloat(data.resumenGeneral.totalIngresos || 0);
      indicadores.value.gananciaNeta = parseFloat(data.resumenGeneral.gananciaNetaFinal || 0);
      
      // Sucursales activas
      indicadores.value.clientes = data.reportePorSucursal?.length || 0;
      
      // Registros (días con datos)
      indicadores.value.productosVendidos = data.evolucionDiaria?.filter(d => d.utilidadLimpiaDia !== 0).length || 0;
      
      // Días con registros
      indicadores.value.ventasAnuladas = data.evolucionDiaria?.length || 0;
      
      // Top sucursal con más utilidad
      if (data.reportePorSucursal && data.reportePorSucursal.length > 0) {
        const topS = [...data.reportePorSucursal].sort((a, b) => (b.utilidadOperativa || 0) - (a.utilidadOperativa || 0))[0];
        if (topS) {
          indicadores.value.topCliente = { nombre: topS.sucursal, total: topS.utilidadOperativa };
        }
      }
    }
  } else if (activeTab.value === 'ventas') {
    const consolidado = ventasConsolidada.value;
    const detallado = ventas.value;

    if (consolidado && Object.keys(consolidado).length > 0) {
      const totalVendido = consolidado.ventasPorPeriodo?.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 0;
      indicadores.value.totalVentas = totalVendido;

      const totalUnidadesProductos = consolidado.productosTop?.reduce((acc, curr) => acc + parseInt(curr.total_unidades_vendidas || 0), 0) || 0;
      const totalUnidadesPromos = consolidado.promocionesTop?.reduce((acc, curr) => acc + parseInt(curr.cantidad || 0), 0) || 0;
      indicadores.value.productosVendidos = totalUnidadesProductos + totalUnidadesPromos;

      if (detallado.topVendedor) {
        indicadores.value.topVendedor = { nombre: detallado.topVendedor.vendedor, total: detallado.topVendedor.monto_total };
      }

      if (detallado.topCliente) {
        indicadores.value.topCliente = { nombre: detallado.topCliente.cliente, total: detallado.topCliente.monto_total };
      }

      if (detallado.ventas) {
        const clientesUnicos = new Set(detallado.ventas.map(v => v.cliente).filter(c => c !== null && c !== 'S/N'));
        indicadores.value.clientes = clientesUnicos.size;
        indicadores.value.ventasAnuladas = detallado.ventas.filter(v => v.estado === 0).length;
      }
    }
    // Simplificamos la ganancia neta para ventas
    indicadores.value.gananciaNeta = (indicadores.value.totalVentas || 0);
  } else if (activeTab.value === 'pedidos') {
    const consolidado = pedidosConsolidado.value;
    const detallado = pedidos.value;

    if (consolidado && Object.keys(consolidado).length > 0) {
      const totalPedidos = consolidado.pedidosPorPeriodo?.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 0;
      indicadores.value.totalVentas = totalPedidos;

      const totalUnidades = consolidado.productosTop?.reduce((acc, curr) => acc + parseInt(curr.total_unidades_vendidas || 0), 0) || 0;
      indicadores.value.productosVendidos = totalUnidades;

      if (consolidado.clientesTop && consolidado.clientesTop.length > 0) {
        const topC = consolidado.clientesTop[0];
        indicadores.value.topCliente = { nombre: topC.cliente, total: topC.monto_total };
        indicadores.value.clientes = consolidado.clientesTop.length;
      }

      if (detallado && detallado.pedidos) {
        indicadores.value.ventasAnuladas = detallado.pedidos.filter(p => p.estado === 0 || p.estado_nombre === 'ANULADO').length;
        
        // Ganancia neta para pedidos = total ya pagado (adelantos)
        const totalAdelantos = detallado.pedidos.reduce((acc, p) => acc + parseFloat(p.adelanto || 0), 0) || 0;
        indicadores.value.gananciaNeta = totalAdelantos;
      }
    }
  } else if (activeTab.value === 'transferencias') {
    if (transferencias.value && transferencias.value.resumenGlobal) {
      const resumen = transferencias.value.resumenGlobal;
      indicadores.value.totalVentas = parseFloat(resumen.totalMonto || 0);
      indicadores.value.gananciaNeta = parseFloat(resumen.totalPanaderia || 0);
      
      let totalItems = 0;
      if (transferencias.value.data) {
        transferencias.value.data.forEach(t => {
          if (t.Productos) t.Productos.forEach(p => totalItems += p.total_cantidad);
          if (t.Insumos) t.Insumos.forEach(i => totalItems += i.total_cantidad);
        });
      }
      indicadores.value.productosVendidos = totalItems;
    }
  } else if (activeTab.value === 'compras') {
    const consolidado = comprasConsolidada.value;
    if (consolidado && consolidado.detalle && consolidado.detalle.length > 0) {
      const totalInvertido = consolidado.detalle.reduce((acc, p) => acc + parseFloat(p.total_proveedor || 0), 0);
      indicadores.value.totalVentas = totalInvertido;

      const totalUnidades = consolidado.detalle.reduce((acc, p) => {
        return acc + (p.insumos ? p.insumos.reduce((sum, i) => sum + parseFloat(i.cantidad || 0), 0) : 0);
      }, 0);
      indicadores.value.productosVendidos = totalUnidades;

      indicadores.value.clientes = consolidado.detalle.length;
      
      if (consolidado.detalle.length > 0) {
        const topP = [...consolidado.detalle].sort((a, b) => (b.total_proveedor || 0) - (a.total_proveedor || 0))[0];
        indicadores.value.topCliente = { nombre: topP.proveedor, total: topP.total_proveedor };
      }
      
      indicadores.value.gananciaNeta = totalInvertido * -1;
    }
  } else if (activeTab.value === 'comision') {
    const consolidado = comisionConsolidada.value;
    if (consolidado && consolidado.totalesGlobales) {
      indicadores.value.totalVentas = Number(consolidado.totalesGlobales.total_comision_empleados) || 0;
      indicadores.value.gananciaNeta = Number(consolidado.totalesGlobales.total_ganancia_panaderia) || 0;
      if (consolidado.reporte) {
        let totalProductos = 0;
        consolidado.reporte.forEach(g => {
          if (g.empleados) {
            g.empleados.forEach(e => {
              if (e.productos) {
                totalProductos += e.productos.reduce((acc, p) => acc + Number(p.cantidad_total || 0), 0);
              }
            });
          }
        });
        indicadores.value.productosVendidos = totalProductos;
        const totalEmpleados = new Set();
        consolidado.reporte.forEach(g => {
          if (g.empleados) g.empleados.forEach(e => totalEmpleados.add(e.idempleado));
        });
        indicadores.value.clientes = totalEmpleados.size;
      }
    }
  } else if (activeTab.value === 'produccion') {
    const consolidado = reporteProduccionConsolidada.value;
    const detallado = reporteProduccionDetallada.value;
    const sucursales = consolidado?.sucursales || [];

    if (detallado && detallado.producciones) {
      const totalCosto = detallado.producciones.reduce((acc, curr) => acc + parseFloat(curr.COSTO_TOTAL || 0), 0);
      const totalProducido = detallado.producciones.reduce((acc, curr) => acc + parseInt(curr.CANTIDAD_TOTAL_PRODUCIDA || 0), 0);
      
      indicadores.value.totalVentas = totalCosto;
      indicadores.value.productosVendidos = totalProducido;
      indicadores.value.ventasAnuladas = detallado.producciones.length;
      indicadores.value.gananciaNeta = totalCosto * -1;

      if (detallado.RESUMEN_TOTAL_CONSUMO_PERIODO) {
        indicadores.value.clientes = detallado.RESUMEN_TOTAL_CONSUMO_PERIODO.length;
      }
    }

    if (sucursales.length > 0) {
      indicadores.value.clientes = sucursales.length;
      const topS = [...sucursales].sort((a, b) => (b.total_sucursal || 0) - (a.total_sucursal || 0))[0];
      if (topS) {
        const topProd = topS.productos?.length > 0
          ? [...topS.productos].sort((a, b) => (b.total_producto || 0) - (a.total_producto || 0))[0]
          : null;
        indicadores.value.topCliente = {
          nombre: topProd ? `${topS.sucursal} - ${topProd.producto}` : topS.sucursal,
          total: topProd ? topProd.total_producto : topS.total_sucursal
        };
      }
    }
  }
};

const exportarPDF = async () => {
  try {
  const isSemanal = agruparPorSemana.value
  const fmtPeriodo = (g) => isSemanal ? (g.semanaLabel || g.fecha) : formatFecha(g.fecha)
  const groupByWeek = (items, getDate) => {
    if (!isSemanal || !items?.length) return null
    const weeks = {}
    items.forEach(item => {
      const fecha = getDate(item).split('T')[0]
      const monday = getWeekMonday(fecha)
      if (!weeks[monday]) weeks[monday] = { fecha: monday, semanaLabel: getWeekLabel(monday), items: [] }
      weeks[monday].items.push(item)
    })
    return Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }
  // Expandir semanas para capturar gráficas semanales
  const tableRefs = { financiero: financieroTableRef, ventas: ventasTableRef, pedidos: pedidosTableRef, transferencias: transferenciasTableRef, compras: comprasTableRef, produccion: produccionTableRef, comision: comisionTableRef }
  const curRef = tableRefs[activeTab.value]
  if (isSemanal && curRef?.value?.expandAllSemanas) {
    curRef.value.expandAllSemanas()
    await new Promise(r => setTimeout(r, 600))
  }
  const collapseWeeks = () => { if (isSemanal && curRef?.value?.collapseAllSemanas) curRef.value.collapseAllSemanas() }
  if (activeTab.value === 'financiero') {
    const data = reporteFinanciero.value;
    if (!data || !data.resumenGeneral) {
      alert("No hay datos financieros para exportar a PDF.");
      return;
    }
    const doc = new jsPDF();
    let startY = await addPDFHeader(doc, `Reporte Financiero${agruparPorSemana.value ? ' Semanal' : ''}`);
    const pageW = doc.internal.pageSize.getWidth();

    const renderKpiCards = (y, resumen, label) => {
      if (y > 250) { doc.addPage(); y = 50; }
      const cards = [
        { fill: [240,253,244], textC: [22,163,74], valC: [21,128,61], label: 'Total Ingresos', val: Number(resumen.totalIngresos || 0) },
        { fill: [254,242,242], textC: [220,38,38], valC: [185,28,28], label: 'Gastos Operativos', val: Number(resumen.totalEgresosOperativos || 0) },
        { fill: [255,247,237], textC: [234,88,12], valC: [194,65,12], label: 'Gastos Generales', val: Number(resumen.totalGastosGenerales || 0) },
        { fill: [255,247,237], textC: [234,88,12], valC: [194,65,12], label: 'Compras Central', val: Number(resumen.totalComprasCentral || 0) },
      ]
      const ganPos = (resumen.gananciaNetaFinal || 0) >= 0;
      cards.push({
        fill: ganPos ? [239,246,255] : [250,245,255],
        textC: ganPos ? [37,99,235] : [147,51,234],
        valC: ganPos ? [29,78,216] : [126,34,206],
        label: 'Ganancia Neta Final',
        val: Number(resumen.gananciaNetaFinal || 0)
      })
      const cw = Math.floor((pageW - 28) / 5)
      cards.forEach((c, i) => {
        const x = 14 + i * cw
        doc.setFillColor(c.fill[0], c.fill[1], c.fill[2])
        doc.rect(x, y, cw - 2, 16, 'F')
        doc.setFontSize(7)
        doc.setTextColor(c.textC[0], c.textC[1], c.textC[2])
        doc.setFont(undefined, 'bold')
        doc.text(c.label, x + 2, y + 5)
        doc.setFontSize(11)
        doc.setTextColor(c.valC[0], c.valC[1], c.valC[2])
        doc.text(`${c.val.toFixed(2)} Bs.`, x + 2, y + 14)
      })
      return y + 22
    }

    // Expandir semanas para capturar charts
    const chartW = pageW - 28
    if (isSemanal && financieroTableRef.value?.expandAllSemanas) {
      financieroTableRef.value.expandAllSemanas()
      await new Promise(r => setTimeout(r, 600))
    }

    if (!isSemanal) {
      // === VISTA DIARIA ===
      startY = renderKpiCards(startY, data.resumenGeneral)
      startY += 4

      // Gastos Generales
      if (data.gastosGenerales?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Gastos Generales', 14, startY)
        startY += 8
        autoTable(doc, {
          head: [['Nombre', 'Fecha', 'Costo']],
          body: data.gastosGenerales.map(g => [g.nombre, formatFecha(g.fecha?.split('T')[0] || ''), `${Number(g.costo || 0).toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 8 }
        })
        startY = doc.lastAutoTable.finalY + 10
      }

      // Charts
      const ch1 = addChartToPDF(doc, 0, 14, startY + 5, chartW)
      if (ch1 !== null) {
        let chY = startY + 5 + ch1 + 5
        const ch2 = addChartToPDF(doc, 1, 14, chY, chartW) || 0
        startY += Math.max(ch1 + ch2 + 10, 55) + 10
      } else {
        // fallback: tabla de evolución
        if (data.evolucionDiaria?.length) {
          if (startY > 240) { doc.addPage(); startY = 50 }
          doc.setFontSize(10)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text('Evolución Diaria', 14, startY)
          startY += 7
          const evolData = [...data.evolucionDiaria].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 15)
          autoTable(doc, {
            head: [['Fecha', 'Ingresos', 'Egresos', 'Utilidad']],
            body: evolData.map(d => [
              formatFecha(d.fecha),
              `${Number(d.ingresos?.totalIngresosBakery || 0).toFixed(2)} Bs.`,
              `${Number(d.egresos?.totalEgresos || 0).toFixed(2)} Bs.`,
              `${Number(d.utilidadLimpiaDia || 0).toFixed(2)} Bs.`
            ]),
            startY, styles: { fontSize: 7 }
          })
          startY = doc.lastAutoTable.finalY + 10
        }
        // Sucursal chart data
        if (data.reportePorSucursal?.length) {
          if (startY > 240) { doc.addPage(); startY = 50 }
          doc.setFontSize(10)
          doc.setFont(undefined, 'bold')
          doc.text('Distribución por Sucursal', 14, startY)
          startY += 7
          autoTable(doc, {
            head: [['Sucursal', 'Utilidad Operativa']],
            body: data.reportePorSucursal.map(s => [s.sucursal, `${Number(s.utilidadOperativa || 0).toFixed(2)} Bs.`]),
            startY, styles: { fontSize: 7 }
          })
          startY = doc.lastAutoTable.finalY + 10
        }
      }

      // Rendimiento por Sucursal (igual que la UI: cards con detalle)
      const sucs = data.reportePorSucursal || []
      if (sucs.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Rendimiento por Sucursal', 14, startY)
        startY += 10

        sucs.forEach(suc => {
          if (startY > 255) { doc.addPage(); startY = 50 }

          // Header con nombre y resumen
          doc.setFillColor(249, 250, 251)
          doc.rect(14, startY - 5, pageW - 28, 12, 'F')
          doc.setFontSize(11)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(suc.sucursal, 18, startY)

          const xIng = pageW - 150, xEgr = pageW - 90, xUti = pageW - 40
          doc.setFontSize(8)
          doc.setTextColor(22, 163, 74)
          doc.setFont(undefined, 'bold')
          doc.text(`Ingresos: ${Number(suc.ingresos?.totalGananciaBakery || 0).toFixed(2)} Bs.`, xIng, startY)
          doc.setTextColor(220, 38, 38)
          doc.text(`Egresos: ${Number(suc.egresos?.totalGastos || 0).toFixed(2)} Bs.`, xEgr, startY)
          const uColor = (suc.utilidadOperativa || 0) >= 0 ? [37, 99, 235] : [147, 51, 234]
          doc.setTextColor(uColor[0], uColor[1], uColor[2])
          doc.text(`Utilidad: ${Number(suc.utilidadOperativa || 0).toFixed(2)} Bs.`, xUti, startY)

          startY += 12

          // Detalle Ingresos
          const detIng = suc.ingresos?.detalle || {}
          const detEgr = suc.egresos?.detalle || {}

          doc.setFontSize(7)
          doc.setTextColor(100)
          doc.setFont(undefined, 'normal')
          doc.text('Ingresos:', 14, startY)
          doc.text(`Venta Tienda: ${Number(detIng.ingresosVentaTienda || 0).toFixed(2)} Bs.`, 14, startY + 4)
          doc.text(`Venta Ambulante: ${Number(detIng.ventaAmbulanteBruta || 0).toFixed(2)} Bs.`, 14, startY + 8)
          doc.setTextColor(22, 163, 74)
          doc.setFont(undefined, 'bold')
          doc.text(`Ganancia Limpia: ${Number(detIng.gananciaLimpiaPanaderia || 0).toFixed(2)} Bs.`, 14, startY + 12)

          doc.setFont(undefined, 'normal')
          doc.setTextColor(100)
          doc.text('Egresos:', pageW / 2, startY)
          doc.text(`Gastos Op.: ${Number(detEgr.gastosOperativos || 0).toFixed(2)} Bs.`, pageW / 2, startY + 4)
          doc.text(`Salarios: ${Number(detEgr.salarios || 0).toFixed(2)} Bs.`, pageW / 2, startY + 8)

          let subY = startY + 16
          if (detEgr.planilla?.length) {
            if (subY > 255) { doc.addPage(); subY = 50 }
            doc.setFontSize(6)
            doc.setTextColor(100)
            doc.text('Planilla:', 14, subY)
            detEgr.planilla.forEach((emp, i) => {
              doc.text(`${emp.empleado}: ${Number(emp.monto).toFixed(2)} Bs.`, 50, subY + (i * 3))
            })
            subY += (detEgr.planilla.length * 3) + 2
          }
          if (detEgr.listaGastos?.length) {
            doc.setFontSize(6)
            doc.setTextColor(100)
            doc.text('Gastos Variables:', pageW / 2, subY - (detEgr.planilla?.length ? 0 : 16))
            detEgr.listaGastos.forEach((g, i) => {
              doc.text(`${g.servicio}: ${Number(g.monto).toFixed(2)} Bs.`, pageW / 2, subY + (i * 3))
            })
            subY += (detEgr.listaGastos.length * 3)
          }

          startY = subY + 10
        })
      }

      // Evolución Diaria (detallado igual que UI: cada día con desglose)
      const evol = data.evolucionDiaria || []
      if (evol.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Evolución Financiera Diaria', 14, startY)
        startY += 10

        const sortedDays = [...evol].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        sortedDays.forEach(dia => {
          if (startY > 255) { doc.addPage(); startY = 50 }

          // Header del día
          doc.setFillColor(243, 244, 246)
          doc.rect(14, startY - 4, pageW - 28, 8, 'F')
          doc.setFontSize(9)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(formatFecha(dia.fecha), 18, startY)
          doc.setTextColor(22, 163, 74)
          doc.text(`${Number(dia.ingresos?.totalIngresosBakery || 0).toFixed(2)} Bs.`, pageW - 130, startY)
          doc.setTextColor(220, 38, 38)
          doc.text(`${Number(dia.egresos?.totalEgresos || 0).toFixed(2)} Bs.`, pageW - 75, startY)
          const uCol = (dia.utilidadLimpiaDia || 0) >= 0 ? [37, 99, 235] : [147, 51, 234]
          doc.setTextColor(uCol[0], uCol[1], uCol[2])
          doc.text(`${Number(dia.utilidadLimpiaDia || 0).toFixed(2)} Bs.`, pageW - 40, startY)
          startY += 10

          // Desglose Ingresos
          doc.setFontSize(7)
          doc.setTextColor(100)
          doc.setFont(undefined, 'bold')
          doc.text('Desglose de Ingresos', 14, startY)
          doc.setFont(undefined, 'normal')
          doc.text(`Venta Tienda: ${Number(dia.ingresos?.gananciaVentaTienda || 0).toFixed(2)} Bs.`, 14, startY + 4)
          doc.text(`Ambulante: ${Number(dia.ingresos?.gananciaPanaderiaAmbulantes || 0).toFixed(2)} Bs.`, 14, startY + 8)
          doc.setTextColor(220, 38, 38)
          doc.text(`Comisiones: -${Number(dia.ingresos?.comisionesPagadasAEmpleados || 0).toFixed(2)} Bs.`, 14, startY + 12)

          doc.setFont(undefined, 'bold')
          doc.setTextColor(100)
          doc.text('Desglose de Egresos', pageW / 2, startY)
          doc.setFont(undefined, 'normal')
          doc.text(`Compras Insumos: ${Number(dia.egresos?.comprasInsumos || 0).toFixed(2)} Bs.`, pageW / 2, startY + 4)
          doc.text(`Gastos Op.: ${Number(dia.egresos?.gastosOperativos || 0).toFixed(2)} Bs.`, pageW / 2, startY + 8)

          startY += 18
        })
      }
    } else {
      // === VISTA SEMANAL ===
      const chartW = pageW - 28
      const chT1 = addChartToPDF(doc, 0, 14, startY + 5, chartW)
      if (chT1 !== null) {
        let chY = startY + 5 + chT1 + 5
        const chT2 = addChartToPDF(doc, 1, 14, chY, chartW) || 0
        startY += Math.max(chT1 + chT2 + 10, 55) + 10
      }

      const weeks = {}
      ;(data.evolucionDiaria || []).forEach(d => {
        const m = getWeekMonday(d.fecha)
        if (!weeks[m]) weeks[m] = { fecha: m, semanaLabel: getWeekLabel(m), days: [] }
        weeks[m].days.push(d)
      })
      const sortedWeeks = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      sortedWeeks.forEach((sem, si) => {
        if (startY > 250) { doc.addPage(); startY = 50 }

        // Título de semana
        doc.setFillColor(255, 247, 237)
        doc.rect(14, startY - 5, pageW - 28, 10, 'F')
        doc.setFontSize(11)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text(`Semana ${si + 1}: ${sem.semanaLabel}`, 18, startY)
        startY += 8

        // Totales de la semana
        const totalIng = sem.days.reduce((s, d) => s + Number(d.ingresos?.totalIngresosBakery || 0), 0)
        const totalEgr = sem.days.reduce((s, d) => s + Number(d.egresos?.totalEgresos || 0), 0)
        const totalUti = sem.days.reduce((s, d) => s + Number(d.utilidadLimpiaDia || 0), 0)

        doc.setFillColor(240, 253, 244)
        doc.rect(14, startY, 55, 10, 'F')
        doc.setFontSize(6)
        doc.setTextColor(22, 163, 74)
        doc.setFont(undefined, 'bold')
        doc.text('Ingresos', 16, startY + 4)
        doc.setFontSize(9)
        doc.text(`${totalIng.toFixed(2)} Bs.`, 16, startY + 9)

        doc.setFillColor(254, 242, 242)
        doc.rect(72, startY, 55, 10, 'F')
        doc.setFontSize(6)
        doc.setTextColor(220, 38, 38)
        doc.setFont(undefined, 'bold')
        doc.text('Egresos', 74, startY + 4)
        doc.setFontSize(9)
        doc.text(`${totalEgr.toFixed(2)} Bs.`, 74, startY + 9)

        doc.setFillColor(239, 246, 255)
        doc.rect(130, startY, 55, 10, 'F')
        doc.setFontSize(6)
        doc.setTextColor(37, 99, 235)
        doc.setFont(undefined, 'bold')
        doc.text('Utilidad', 132, startY + 4)
        doc.setFontSize(9)
        doc.text(`${totalUti.toFixed(2)} Bs.`, 132, startY + 9)

        startY += 16

        // Per-week KPI cards (5 indicadores como en UI)
        if (startY > 240) { doc.addPage(); startY = 50 }
        const sm = sem.days.reduce((a, d) => {
          a.totalIngresos += Number(d.ingresos?.totalIngresosBakery || 0)
          a.gastosOperativos += Number(d.egresos?.gastosOperativos || 0)
          a.comprasInsumos += Number(d.egresos?.comprasInsumos || 0)
          a.gananciaVentaTienda += Number(d.ingresos?.gananciaVentaTienda || 0)
          a.gananciaPanaderiaAmbulantes += Number(d.ingresos?.gananciaPanaderiaAmbulantes || 0)
          a.comisionesPagadasAEmpleados += Number(d.ingresos?.comisionesPagadasAEmpleados || 0)
          a.utilidadLimpiaDia += Number(d.utilidadLimpiaDia || 0)
          return a
        }, { totalIngresos: 0, gastosOperativos: 0, comprasInsumos: 0, utilidadLimpiaDia: 0, gananciaVentaTienda: 0, gananciaPanaderiaAmbulantes: 0, comisionesPagadasAEmpleados: 0 })
        const cw = Math.floor((pageW - 28) / 5)
        const fkpi = [
          { fill: [240,253,244], tc: [22,163,74], vc: [21,128,61], label: 'Total Ingresos', val: `${sm.totalIngresos.toFixed(2)} Bs.` },
          { fill: [254,242,242], tc: [220,38,38], vc: [185,28,28], label: 'Gastos Operativos', val: `${sm.gastosOperativos.toFixed(2)} Bs.` },
          { fill: [255,247,237], tc: [234,88,12], vc: [194,65,12], label: 'Gastos Generales', val: '0.00 Bs.' },
          { fill: [239,246,255], tc: [37,99,235], vc: [29,78,216], label: 'Compras Insumos', val: `${sm.comprasInsumos.toFixed(2)} Bs.` },
          { fill: sm.utilidadLimpiaDia >= 0 ? [239,246,255] : [250,245,255], tc: sm.utilidadLimpiaDia >= 0 ? [37,99,235] : [147,51,234], vc: sm.utilidadLimpiaDia >= 0 ? [29,78,216] : [126,34,206], label: 'Ganancia Neta', val: `${sm.utilidadLimpiaDia.toFixed(2)} Bs.` },
        ]
        fkpi.forEach((c, i) => {
          const x = 14 + i * cw
          doc.setFillColor(c.fill[0], c.fill[1], c.fill[2])
          doc.rect(x, startY, cw - 2, 14, 'F')
          doc.setFontSize(6)
          doc.setTextColor(c.tc[0], c.tc[1], c.tc[2])
          doc.setFont(undefined, 'bold')
          doc.text(c.label, x + 2, startY + 5)
          doc.setFontSize(8)
          doc.setTextColor(c.vc[0], c.vc[1], c.vc[2])
          doc.text(c.val, x + 2, startY + 13)
        })
        startY += 20

        // Días de la semana
        const sortedDays = sem.days.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        sortedDays.forEach(dia => {
          if (startY > 255) { doc.addPage(); startY = 50 }

          // Header del día
          doc.setFillColor(239, 246, 255)
          doc.rect(14, startY - 3, pageW - 28, 7, 'F')
          doc.setFontSize(8)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(formatFecha(dia.fecha), 18, startY)
          doc.setTextColor(22, 163, 74)
          doc.text(`${Number(dia.ingresos?.totalIngresosBakery || 0).toFixed(2)} Bs.`, pageW - 130, startY)
          doc.setTextColor(220, 38, 38)
          doc.text(`${Number(dia.egresos?.totalEgresos || 0).toFixed(2)} Bs.`, pageW - 75, startY)
          const uc = (dia.utilidadLimpiaDia || 0) >= 0 ? [37, 99, 235] : [147, 51, 234]
          doc.setTextColor(uc[0], uc[1], uc[2])
          doc.text(`${Number(dia.utilidadLimpiaDia || 0).toFixed(2)} Bs.`, pageW - 40, startY)
          startY += 8

          // Desglose
          doc.setFontSize(6)
          doc.setTextColor(100)
          doc.setFont(undefined, 'normal')
          doc.text(`Ingresos: Tienda ${Number(dia.ingresos?.gananciaVentaTienda || 0).toFixed(2)} | Ambulante ${Number(dia.ingresos?.gananciaPanaderiaAmbulantes || 0).toFixed(2)} | Comisiones -${Number(dia.ingresos?.comisionesPagadasAEmpleados || 0).toFixed(2)}`, 18, startY)
          doc.text(`Egresos: Insumos ${Number(dia.egresos?.comprasInsumos || 0).toFixed(2)} | Gastos Op. ${Number(dia.egresos?.gastosOperativos || 0).toFixed(2)}`, 18, startY + 4)
          startY += 10
        })
        startY += 5
      })
    }

    doc.save(`reporte_financiero${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'ventas') {
    if (!sortedVentas.value || sortedVentas.value.length === 0) {
      alert("No hay datos de ventas para exportar a PDF.");
      return;
    }
    const doc = new jsPDF();
    let startY = await addPDFHeader(doc, `Reporte de Ventas${agruparPorSemana.value ? ' Semanal' : ''}`);
    const pageW = doc.internal.pageSize.getWidth();

    if (isSemanal && ventasTableRef.value?.expandAllSemanas) {
      ventasTableRef.value.expandAllSemanas()
      await new Promise(r => setTimeout(r, 600))
    }

    const cons = ventasConsolidada.value;
    const totalVendido = cons?.ventasPorPeriodo?.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 0;

    if (!isSemanal) {
      // === VISTA DIARIA ===
      // KPI cards
      const cards = [
        { fill: [239,246,255], tc: [37,99,235], vc: [29,78,216], label: 'Total Ventas', val: `${totalVendido.toFixed(2)} Bs.` },
        { fill: [240,253,244], tc: [22,163,74], vc: [21,128,61], label: 'Productos Vend.', val: `${indicadores.value.productosVendidos}` },
        { fill: [254,242,242], tc: [220,38,38], vc: [185,28,28], label: 'Anuladas', val: `${indicadores.value.ventasAnuladas}` },
      ]
      const cw = Math.floor((pageW - 28) / 3)
      cards.forEach((c, i) => {
        const x = 14 + i * cw
        doc.setFillColor(c.fill[0], c.fill[1], c.fill[2])
        doc.rect(x, startY, cw - 2, 14, 'F')
        doc.setFontSize(8)
        doc.setTextColor(c.tc[0], c.tc[1], c.tc[2])
        doc.setFont(undefined, 'bold')
        doc.text(c.label, x + 3, startY + 5)
        doc.setFontSize(11)
        doc.setTextColor(c.vc[0], c.vc[1], c.vc[2])
        doc.text(c.val, x + 3, startY + 13)
      })
      startY += 20

      if (indicadores.value.topCliente) {
        doc.setFontSize(8)
        doc.setTextColor(100)
        doc.text(`Top Cliente: ${indicadores.value.topCliente.nombre} (${Number(indicadores.value.topCliente.total).toFixed(2)} Bs.)`, 14, startY)
        startY += 4
      }
      if (indicadores.value.topVendedor) {
        doc.setFontSize(8)
        doc.setTextColor(100)
        doc.text(`Top Vendedor: ${indicadores.value.topVendedor.nombre} (${Number(indicadores.value.topVendedor.total).toFixed(2)} Bs.)`, 14, startY)
        startY += 4
      }

      startY += 4

      // Charts
      const chartW = pageW - 28
      const chV1 = addChartToPDF(doc, 0, 14, startY + 5, chartW)
      if (chV1 !== null) {
        let chY = startY + 5 + chV1 + 5
        const chV2 = addChartToPDF(doc, 1, 14, chY, chartW) || 0
        startY += Math.max(chV1 + chV2 + 10, 55) + 10
      }

      // Ventas por Sucursal
      if (cons?.ventasPorSucursal?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Ventas por Sucursal', 14, startY)
        startY += 8
        autoTable(doc, {
          head: [['Sucursal', 'Ventas', 'Total', 'Part.']],
          body: cons.ventasPorSucursal.map(s => [s.nombre, s.cant_ventas, `${Number(s.total).toFixed(2)} Bs.`, `${Number(s.participacion).toFixed(1)}%`]),
          startY, styles: { fontSize: 8 }
        })
        startY = doc.lastAutoTable.finalY + 10
      }

      // Métodos de Pago
      if (cons?.metodosPago?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Uso de Métodos de Pago', 14, startY)
        startY += 8
        const mpW = Math.floor((pageW - 28) / cons.metodosPago.length)
        cons.metodosPago.forEach((m, i) => {
          const x = 14 + i * mpW
          doc.setFillColor(255, 255, 255)
          doc.rect(x, startY, mpW - 2, 24, 'F')
          doc.setDrawColor(229, 231, 235)
          doc.rect(x, startY, mpW - 2, 24, 'S')
          doc.setFontSize(7)
          doc.setTextColor(100)
          doc.setFont(undefined, 'bold')
          doc.text(m.nombre, x + 3, startY + 5)
          doc.setFontSize(12)
          doc.setTextColor(5, 150, 105)
          doc.text(`${Number(m.total).toFixed(2)} Bs.`, x + 3, startY + 13)
          doc.setFontSize(7)
          doc.setTextColor(100)
          doc.text(`${m.cantidad} trans.`, x + 3, startY + 22)
        })
        startY += 30
      }

      // Productos con Presentaciones
      if (cons?.productosTop?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Análisis de Productos y Presentaciones', 14, startY)
        startY += 8

        cons.productosTop.forEach(prod => {
          if (startY > 255) { doc.addPage(); startY = 50 }

          // Header del producto
          doc.setFillColor(255, 247, 237)
          doc.rect(14, startY - 4, pageW - 28, 10, 'F')
          doc.setFontSize(9)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(prod.nombre, 18, startY)
          doc.setTextColor(234, 88, 12)
          doc.text(`${Number(prod.ingresos_totales).toFixed(2)} Bs.`, pageW - 40, startY)
          doc.setTextColor(100)
          doc.setFontSize(7)
          doc.text(`${prod.total_unidades_vendidas} uds.`, pageW - 90, startY)
          startY += 10

          // Tabla de presentaciones
          const pRows = (prod.presentaciones || []).map(p => [
            p.presentacion,
            `${p.unidades_por_presentacion} und.`,
            p.cantidad_vendida,
            p.cantidad_vendida * p.unidades_por_presentacion,
            `${Number(p.subtotal_ingresos).toFixed(2)} Bs.`
          ])
          if (pRows.length) {
            autoTable(doc, {
              head: [['Variante', 'Contenido', 'Cant. Vendida', 'Total Cant.', 'Subtotal']],
              body: pRows, startY, styles: { fontSize: 7 }
            })
            startY = doc.lastAutoTable.finalY + 5
          }
        })
        startY += 5
      }

      // Promociones
      if (cons?.promocionesTop?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Composición de Promociones', 14, startY)
        startY += 8

        cons.promocionesTop.forEach(promo => {
          if (startY > 255) { doc.addPage(); startY = 50 }

          doc.setFillColor(245, 243, 255)
          doc.rect(14, startY - 4, pageW - 28, 10, 'F')
          doc.setFontSize(9)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(promo.nombre, 18, startY)
          doc.setTextColor(147, 51, 234)
          doc.text(`${Number(promo.total).toFixed(2)} Bs.`, pageW - 40, startY)
          doc.setTextColor(100)
          doc.setFontSize(7)
          doc.text(`${promo.cantidad} vendidas`, pageW - 100, startY)
          startY += 10

          const detRows = (promo.detalle_productos || []).map(d => [d.producto, d.presentacion, `x${d.cantidad_por_promo}`, `${d.total_unidades} uds.`])
          if (detRows.length) {
            autoTable(doc, {
              head: [['Producto', 'Presentación', 'Cant. x Promo', 'Total Unidades']],
              body: detRows, startY, styles: { fontSize: 7 }
            })
            startY = doc.lastAutoTable.finalY + 5
          }
        })
        startY += 5
      }

      // Detalle Cronológico
      if (startY > 240) { doc.addPage(); startY = 50 }
      doc.setFontSize(12)
      doc.setTextColor(0)
      doc.setFont(undefined, 'bold')
      doc.text('Detalle Cronológico de Ventas', 14, startY)
      startY += 8

      sortedVentas.value.forEach(dateGroup => {
        if (startY > 255) { doc.addPage(); startY = 50 }
        // Header del grupo fecha
        doc.setFillColor(220, 220, 220)
        doc.rect(14, startY - 4, pageW - 28, 8, 'F')
        doc.setFontSize(8)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text(`Fecha: ${fmtPeriodo(dateGroup)} - Total: ${dateGroup.totalIngreso.toFixed(2)} Bs.`, 18, startY)
        startY += 8

        const detRows = dateGroup.ventas.map(v => [
          v.isFirstInSale ? v.cliente : '',
          v.producto,
          v.cantidad,
          `${v.precio} Bs.`,
          `${v.subtotal} Bs.`,
          v.estado,
          v.hasFactura ? v.nroFactura : 'S/F',
          v.isFirstInSale ? `${v.precioTotalVenta} Bs.` : ''
        ])
        autoTable(doc, {
          head: [['Cliente', 'Producto', 'Cant.', 'P. Unit.', 'Subtotal', 'Estado', 'Factura', 'Total Venta']],
          body: detRows, startY, styles: { fontSize: 7 }, columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 40 }, 7: { cellWidth: 20 } }
        })
        startY = doc.lastAutoTable.finalY + 3
      })
    } else {
      // === VISTA SEMANAL ===
      const chartW = pageW - 28
      const chW1 = addChartToPDF(doc, 0, 14, startY + 5, chartW)
      if (chW1 !== null) {
        startY += chW1 + 15
      }

      // Agrupar ventas por semana
      const weeks = {}
      sortedVentas.value.forEach(g => {
        const m = getWeekMonday(g.fecha)
        if (!weeks[m]) weeks[m] = { fecha: m, semanaLabel: getWeekLabel(m), groups: [], totalIngreso: 0 }
        weeks[m].groups.push(g)
        weeks[m].totalIngreso += g.totalIngreso
      })
      const sortedWeeks = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      sortedWeeks.forEach((sem, si) => {
        if (startY > 250) { doc.addPage(); startY = 50 }

        // Título de semana
        doc.setFillColor(255, 247, 237)
        doc.rect(14, startY - 5, pageW - 28, 10, 'F')
        doc.setFontSize(11)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text(`Semana ${si + 1}: ${sem.semanaLabel}`, 18, startY)
        doc.setFontSize(9)
        doc.setTextColor(22, 163, 74)
        doc.text(`Total: ${sem.totalIngreso.toFixed(2)} Bs.`, pageW - 60, startY)
        startY += 10

        // Per-week aggregated data for summaries
        const allWeekVentas = []
        sem.groups.forEach(g => { g.ventas.forEach(v => allWeekVentas.push(v)) })
        const ventasCount = allWeekVentas.length
        const prom = ventasCount > 0 ? sem.totalIngreso / ventasCount : 0

        // KPI cards
        if (startY > 240) { doc.addPage(); startY = 50 }
        const cw = Math.floor((pageW - 28) / 3)
        const vkpi = [
          { fill: [239,246,255], tc: [37,99,235], vc: [29,78,216], label: 'Total Ventas', val: `${sem.totalIngreso.toFixed(2)} Bs.` },
          { fill: [240,253,244], tc: [22,163,74], vc: [21,128,61], label: 'Transacciones', val: `${ventasCount}` },
          { fill: [254,242,242], tc: [220,38,38], vc: [185,28,28], label: 'Promedio', val: `${prom.toFixed(2)} Bs.` },
        ]
        vkpi.forEach((c, i) => {
          const x = 14 + i * cw
          doc.setFillColor(c.fill[0], c.fill[1], c.fill[2])
          doc.rect(x, startY, cw - 2, 14, 'F')
          doc.setFontSize(7)
          doc.setTextColor(c.tc[0], c.tc[1], c.tc[2])
          doc.setFont(undefined, 'bold')
          doc.text(c.label, x + 2, startY + 5)
          doc.setFontSize(9)
          doc.setTextColor(c.vc[0], c.vc[1], c.vc[2])
          doc.text(c.val, x + 2, startY + 13)
        })
        startY += 20

        // Ventas por Sucursal
        const sucMap = {}
        allWeekVentas.forEach(v => {
          const s = v.sucursal || 'Sin sucursal'
          if (!sucMap[s]) sucMap[s] = { nombre: s, cant: 0, total: 0 }
          sucMap[s].cant++
          sucMap[s].total += Number(v.precioTotalVenta || 0)
        })
        const sucArr = Object.values(sucMap).sort((a, b) => b.total - a.total)
        if (sucArr.length && startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(9)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Ventas por Sucursal', 14, startY)
        startY += 6
        autoTable(doc, {
          head: [['Sucursal', 'Ventas', 'Total']],
          body: sucArr.map(s => [s.nombre, String(s.cant), `${s.total.toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 7 }
        })
        startY = doc.lastAutoTable.finalY + 5

        // Métodos de Pago
        const metodoMap = {}
        allWeekVentas.forEach(v => {
          const m = v.metodo_pago || 'Efectivo'
          if (!metodoMap[m]) metodoMap[m] = { nombre: m, total: 0, cantidad: 0 }
          metodoMap[m].cantidad++
          metodoMap[m].total += Number(v.precioTotalVenta || 0)
        })
        const metodoArr = Object.values(metodoMap).sort((a, b) => b.total - a.total)
        if (metodoArr.length && startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(9)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Métodos de Pago', 14, startY)
        startY += 6
        const mw = Math.floor((pageW - 28) / Math.min(metodoArr.length, 4))
        metodoArr.slice(0, 8).forEach((m, i) => {
          const x = 14 + (i % 4) * mw
          if (i > 0 && i % 4 === 0) { startY += 18; if (startY > 255) { doc.addPage(); startY = 50 } }
          doc.setFillColor(240, 253, 244)
          doc.rect(x, startY, mw - 2, 14, 'F')
          doc.setFontSize(6)
          doc.setTextColor(22, 163, 74)
          doc.setFont(undefined, 'bold')
          doc.text(m.nombre, x + 2, startY + 5)
          doc.setFontSize(8)
          doc.text(`${m.total.toFixed(2)} Bs.`, x + 2, startY + 10)
          doc.setTextColor(107, 114, 128)
          doc.setFontSize(6)
          doc.text(`${m.cantidad} ventas`, x + 2, startY + 13)
        })
        startY += metodoArr.length <= 4 ? 20 : (Math.ceil(metodoArr.length / 4) * 18 + 5)

        // Días de la semana
        sem.groups.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(g => {
          if (startY > 255) { doc.addPage(); startY = 50 }

          // Header día
          doc.setFillColor(239, 246, 255)
          doc.rect(14, startY - 3, pageW - 28, 7, 'F')
          doc.setFontSize(8)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(`${fmtPeriodo(g)} (${g.ventas.length} transacciones)`, 18, startY)
          doc.setTextColor(37, 99, 235)
          doc.text(`${g.totalIngreso.toFixed(2)} Bs.`, pageW - 40, startY)
          startY += 8

          const detRows = g.ventas.map(v => [
            v.isFirstInSale ? v.cliente : '',
            v.producto, v.cantidad, `${v.precio} Bs.`, `${v.subtotal} Bs.`,
            v.estado, v.hasFactura ? v.nroFactura : 'S/F'
          ])
          autoTable(doc, {
            head: [['Cliente', 'Producto', 'Cant.', 'P. Unit.', 'Subtotal', 'Estado', 'Factura']],
            body: detRows, startY, styles: { fontSize: 6 }, columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 35 } }
          })
          startY = doc.lastAutoTable.finalY + 3
        })
        startY += 5
      })
    }

    doc.save(`reporte_ventas${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'pedidos') {
    if (!processedPedidosGrouped.value || processedPedidosGrouped.value.length === 0) {
      alert("No hay datos de pedidos para exportar a PDF.");
      return;
    }
    const doc = new jsPDF();
    let startY = await addPDFHeader(doc, `Reporte de Pedidos${agruparPorSemana.value ? ' Semanal' : ''}`);
    const pageW = doc.internal.pageSize.getWidth();

    if (isSemanal && pedidosTableRef.value?.expandAllSemanas) {
      pedidosTableRef.value.expandAllSemanas()
      await new Promise(r => setTimeout(r, 600))
    }

    const cons = pedidosConsolidado.value;
    const totalPedidos = cons?.pedidosPorPeriodo?.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 0;

    if (!isSemanal) {
      // === VISTA DIARIA ===
      const cards = [
        { fill: [255,247,237], tc: [234,88,12], vc: [194,65,12], label: 'Total Pedidos', val: `${totalPedidos.toFixed(2)} Bs.` },
        { fill: [239,246,255], tc: [37,99,235], vc: [29,78,216], label: 'Productos Pedidos', val: `${indicadores.value.productosVendidos}` },
        { fill: [240,253,244], tc: [22,163,74], vc: [21,128,61], label: 'Clientes', val: `${indicadores.value.clientes}` },
      ]
      const cw = Math.floor((pageW - 28) / 3)
      cards.forEach((c, i) => {
        const x = 14 + i * cw
        doc.setFillColor(c.fill[0], c.fill[1], c.fill[2])
        doc.rect(x, startY, cw - 2, 14, 'F')
        doc.setFontSize(8)
        doc.setTextColor(c.tc[0], c.tc[1], c.tc[2])
        doc.setFont(undefined, 'bold')
        doc.text(c.label, x + 3, startY + 5)
        doc.setFontSize(11)
        doc.setTextColor(c.vc[0], c.vc[1], c.vc[2])
        doc.text(c.val, x + 3, startY + 13)
      })
      startY += 20

      // Charts
      const chartW = pageW - 28
      const chP1 = addChartToPDF(doc, 0, 14, startY + 5, chartW)
      if (chP1 !== null) {
        let chY = startY + 5 + chP1 + 5
        const chP2 = addChartToPDF(doc, 1, 14, chY, chartW) || 0
        startY += Math.max(chP1 + chP2 + 10, 55) + 10
      }

      // Pedidos por Sucursal
      if (cons?.pedidosPorSucursal?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Pedidos por Sucursal', 14, startY)
        startY += 8
        autoTable(doc, {
          head: [['Sucursal', 'Cantidad', 'Total']],
          body: cons.pedidosPorSucursal.map(s => [s.nombre, s.cant_pedidos, `${Number(s.total).toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 8 }
        })
        startY = doc.lastAutoTable.finalY + 8
      }

      // Estados de Pedido
      if (cons?.pedidosPorEstado?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Estados de Pedido', 14, startY)
        startY += 8
        autoTable(doc, {
          head: [['Estado', 'Cantidad', 'Total']],
          body: cons.pedidosPorEstado.map(s => [s.estado_nombre, s.cant_pedidos, `${Number(s.total).toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 8 }
        })
        startY = doc.lastAutoTable.finalY + 8
      }

      // Tipos de Pedido
      if (cons?.pedidosPorTipo?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Tipos de Pedido', 14, startY)
        startY += 8
        autoTable(doc, {
          head: [['Tipo', 'Cantidad', 'Monto Total']],
          body: cons.pedidosPorTipo.map(s => [s.nombre, s.cant_pedidos, `${Number(s.total).toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 8 }
        })
        startY = doc.lastAutoTable.finalY + 8
      }

      // Productos Más Pedidos
      if (cons?.productosTop?.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Productos Más Pedidos', 14, startY)
        startY += 8
        autoTable(doc, {
          head: [['Producto', 'Unidades', 'Ingresos']],
          body: cons.productosTop.map(p => [p.nombre, p.total_unidades_vendidas, `${Number(p.ingresos_totales).toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 8 }
        })
        startY = doc.lastAutoTable.finalY + 8
      }

      // Detalle Cronológico
      if (startY > 240) { doc.addPage(); startY = 50 }
      doc.setFontSize(12)
      doc.setTextColor(0)
      doc.setFont(undefined, 'bold')
      doc.text('Detalle Cronológico de Pedidos', 14, startY)
      startY += 8

      processedPedidosGrouped.value.forEach(dateGroup => {
        if (startY > 255) { doc.addPage(); startY = 50 }
        // Header del grupo
        doc.setFillColor(220, 220, 220)
        doc.rect(14, startY - 4, pageW - 28, 8, 'F')
        doc.setFontSize(8)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text(`Fecha: ${fmtPeriodo(dateGroup)} - Total Pedidos: ${dateGroup.totalPedidos}`, 18, startY)
        startY += 8

        // Collect all rows for this date group into a single table
        const allRows = dateGroup.pedidos.map(p => [
          p.isFirstInPedido ? `${p.idpedido}\n${p.hora}` : '',
          p.isFirstInPedido ? `${p.cliente}\n${p.sucursal}` : '',
          p.productoNombre,
          p.presentacion || '',
          String(p.productoCantidad),
          `${parseFloat(p.productoPrecio || 0).toFixed(2)} Bs.`,
          `${parseFloat(p.subtotal || 0).toFixed(2)} Bs.`,
          p.isFirstInPedido ? `Tot: ${p.total.toFixed(2)}\nAdel: ${p.adelanto.toFixed(2)}\nSal: ${p.saldo.toFixed(2)}` : '',
          p.isFirstInPedido ? `${p.estado_nombre}\n${p.tipo_pedido}` : ''
        ])
        if (allRows.length) {
          autoTable(doc, {
            head: [['ID / Hora', 'Cliente / Sucursal', 'Ítem', 'Pres.', 'Cant.', 'P. Unit.', 'Subtotal', 'Financiero', 'Estado']],
            body: allRows, startY, styles: { fontSize: 7 },
            columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 22 }, 2: { cellWidth: 22 }, 3: { cellWidth: 14 }, 4: { cellWidth: 10 }, 5: { cellWidth: 16 }, 6: { cellWidth: 16 }, 7: { cellWidth: 28 }, 8: { cellWidth: 18 } }
          })
          startY = doc.lastAutoTable.finalY + 3
        }
      })
    } else {
      // === VISTA SEMANAL ===
      const chartW = pageW - 28
      const chW1 = addChartToPDF(doc, 0, 14, startY + 5, chartW)
      if (chW1 !== null) {
        startY += chW1 + 15
      }

      const weeks = {}
      processedPedidosGrouped.value.forEach(g => {
        const m = getWeekMonday(g.fecha)
        if (!weeks[m]) weeks[m] = { fecha: m, semanaLabel: getWeekLabel(m), groups: [], totalPedidos: 0 }
        weeks[m].groups.push(g)
        weeks[m].totalPedidos += g.totalPedidos
      })
      const sortedWeeks = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      sortedWeeks.forEach((sem, si) => {
        if (startY > 250) { doc.addPage(); startY = 50 }
        doc.setFillColor(255, 247, 237)
        doc.rect(14, startY - 5, pageW - 28, 10, 'F')
        doc.setFontSize(11)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text(`Semana ${si + 1}: ${sem.semanaLabel}`, 18, startY)
        doc.setFontSize(9)
        doc.setTextColor(234, 88, 12)
        doc.text(`Pedidos: ${sem.totalPedidos}`, pageW - 50, startY)
        startY += 10

        // Per-week summary data
        const weekPedidos = {}
        sem.groups.forEach(g => {
          g.pedidos.filter(p => p.isFirstInPedido).forEach(p => {
            if (!weekPedidos[p.idpedido]) weekPedidos[p.idpedido] = p
          })
        })
        const wp = Object.values(weekPedidos)
        const montoSem = wp.reduce((s, p) => s + p.total, 0)

        // KPI cards
        if (startY > 240) { doc.addPage(); startY = 50 }
        const cw = Math.floor((pageW - 28) / 4)
        const wkpi = [
          { fill: [255,247,237], tc: [234,88,12], vc: [194,65,12], label: 'Monto Total', val: `${montoSem.toFixed(2)} Bs.` },
          { fill: [239,246,255], tc: [37,99,235], vc: [29,78,216], label: 'Cant. Pedidos', val: `${wp.length}` },
          { fill: [240,253,244], tc: [22,163,74], vc: [21,128,61], label: 'Promedio', val: `${wp.length > 0 ? (montoSem / wp.length).toFixed(2) : '0.00'} Bs.` },
          { fill: [254,242,242], tc: [220,38,38], vc: [185,28,28], label: 'Adelanto Prom.', val: `${wp.length > 0 ? (wp.reduce((s, p) => s + p.adelanto, 0) / wp.length).toFixed(2) : '0.00'} Bs.` },
        ]
        wkpi.forEach((c, i) => {
          const x = 14 + i * cw
          doc.setFillColor(c.fill[0], c.fill[1], c.fill[2])
          doc.rect(x, startY, cw - 2, 14, 'F')
          doc.setFontSize(7)
          doc.setTextColor(c.tc[0], c.tc[1], c.tc[2])
          doc.setFont(undefined, 'bold')
          doc.text(c.label, x + 2, startY + 5)
          doc.setFontSize(9)
          doc.setTextColor(c.vc[0], c.vc[1], c.vc[2])
          doc.text(c.val, x + 2, startY + 13)
        })
        startY += 20

        // Distribución por Sucursal
        const sucMap = {}
        wp.forEach(p => { if (!sucMap[p.sucursal]) sucMap[p.sucursal] = { nombre: p.sucursal, cant: 0, total: 0 }; sucMap[p.sucursal].cant++; sucMap[p.sucursal].total += p.total })
        const sucArr = Object.values(sucMap).sort((a, b) => b.total - a.total)
        if (sucArr.length && startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(9)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Distribución por Sucursal', 14, startY)
        startY += 6
        autoTable(doc, {
          head: [['Sucursal', 'Cant.', 'Monto Total']],
          body: sucArr.map(s => [s.nombre, String(s.cant), `${s.total.toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 7 }
        })
        startY = doc.lastAutoTable.finalY + 5

        // Estados de Pedido
        const estMap = {}
        wp.forEach(p => { const e = p.estado_nombre || 'N/A'; if (!estMap[e]) estMap[e] = { estado: e, cant: 0, total: 0 }; estMap[e].cant++; estMap[e].total += p.total })
        const estArr = Object.values(estMap).sort((a, b) => b.total - a.total)
        if (estArr.length && startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(9)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Estados de Pedido', 14, startY)
        startY += 6
        autoTable(doc, {
          head: [['Estado', 'Cant.', 'Monto Total']],
          body: estArr.map(e => [e.estado, String(e.cant), `${e.total.toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 7 }
        })
        startY = doc.lastAutoTable.finalY + 5

        // Tipos de Pedido
        const tipoMap = {}
        wp.forEach(p => { const t = p.tipo_pedido || 'N/A'; if (!tipoMap[t]) tipoMap[t] = { tipo: t, cant: 0, total: 0 }; tipoMap[t].cant++; tipoMap[t].total += p.total })
        const tipoArr = Object.values(tipoMap).sort((a, b) => b.total - a.total)
        if (tipoArr.length && startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(9)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Tipos de Pedido', 14, startY)
        startY += 6
        autoTable(doc, {
          head: [['Tipo', 'Cant.', 'Monto Total']],
          body: tipoArr.map(t => [t.tipo, String(t.cant), `${t.total.toFixed(2)} Bs.`]),
          startY, styles: { fontSize: 7 }
        })
        startY = doc.lastAutoTable.finalY + 5

        // Per-day details
        sem.groups.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(g => {
          if (startY > 255) { doc.addPage(); startY = 50 }
          doc.setFillColor(239, 246, 255)
          doc.rect(14, startY - 3, pageW - 28, 7, 'F')
          doc.setFontSize(8)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(`${fmtPeriodo(g)} (${g.pedidos.filter(p => p.isFirstInPedido).length} pedidos)`, 18, startY)
          startY += 8

          const allRows = g.pedidos.map(p => [
            p.isFirstInPedido ? `${p.idpedido}\n${p.hora}` : '',
            p.isFirstInPedido ? p.cliente : '',
            p.productoNombre,
            p.presentacion || '',
            String(p.productoCantidad),
            `${parseFloat(p.productoPrecio || 0).toFixed(2)} Bs.`,
            `${parseFloat(p.subtotal || 0).toFixed(2)} Bs.`,
            p.isFirstInPedido ? p.estado_nombre : ''
          ])
          if (allRows.length) {
            if (startY > 255) { doc.addPage(); startY = 50 }
            autoTable(doc, {
              head: [['ID/Hora', 'Cliente', 'Ítem', 'Pres.', 'Cant.', 'P. Unit.', 'Subtotal', 'Estado']],
              body: allRows, startY, styles: { fontSize: 6 },
              columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 20 }, 2: { cellWidth: 25 } }
            })
            startY = doc.lastAutoTable.finalY + 1
          }
          startY += 3
        })
        startY += 5
      })
    }

    doc.save(`reporte_pedidos${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'transferencias') {
    if (!processedTransferencias.value || processedTransferencias.value.length === 0) {
      alert("No hay datos de transferencias para exportar a PDF.");
      return;
    }
    const doc = new jsPDF();
    let startY = await addPDFHeader(doc, `Reporte de Transferencias${agruparPorSemana.value ? ' Semanal' : ''}`);
    const pageW = doc.internal.pageSize.getWidth();

    if (isSemanal && transferenciasTableRef.value?.expandAllSemanas) {
      transferenciasTableRef.value.expandAllSemanas()
      await new Promise(r => setTimeout(r, 600))
    }

    const consData = transferenciasConsolidada.value?.data || [];
    const totalMonto = consData.reduce((sum, item) => sum + parseFloat(item.monto_total || 0), 0);
    const totalComisiones = consData.reduce((sum, item) => sum + parseFloat(item.comisiones_totales || 0), 0);

    if (!isSemanal) {
      // === VISTA DIARIA ===
      const cards = [
        { fill: [255,247,237], tc: [234,88,12], vc: [194,65,12], label: 'Total Monto', val: `${totalMonto.toFixed(2)} Bs.` },
        { fill: [239,246,255], tc: [37,99,235], vc: [29,78,216], label: 'Comisiones', val: `${totalComisiones.toFixed(2)} Bs.` },
        { fill: [240,253,244], tc: [22,163,74], vc: [21,128,61], label: 'Transferencias', val: `${consData.length}` },
      ]
      const cw = Math.floor((pageW - 28) / 3)
      cards.forEach((c, i) => {
        const x = 14 + i * cw
        doc.setFillColor(c.fill[0], c.fill[1], c.fill[2])
        doc.rect(x, startY, cw - 2, 14, 'F')
        doc.setFontSize(8)
        doc.setTextColor(c.tc[0], c.tc[1], c.tc[2])
        doc.setFont(undefined, 'bold')
        doc.text(c.label, x + 3, startY + 5)
        doc.setFontSize(11)
        doc.setTextColor(c.vc[0], c.vc[1], c.vc[2])
        doc.text(c.val, x + 3, startY + 13)
      })
      startY += 20

      // Charts
      const chartW = pageW - 28
      const chT1 = addChartToPDF(doc, 0, 14, startY + 5, chartW)
      if (chT1 !== null) {
        let chY = startY + 5 + chT1 + 5
        const chT2 = addChartToPDF(doc, 1, 14, chY, chartW) || 0
        startY += Math.max(chT1 + chT2 + 10, 55) + 10
      }

      // Resumen por Origen/Destino (cards estilo UI)
      if (consData.length) {
        if (startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Resumen de Transferencias', 14, startY)
        startY += 10

        consData.forEach((item, idx) => {
          if (startY > 255) { doc.addPage(); startY = 50 }

          // Card
          doc.setFillColor(255, 255, 255)
          doc.setDrawColor(229, 231, 235)
          doc.rect(14, startY, pageW - 28, 38, 'FD')

          doc.setFontSize(7)
          doc.setTextColor(234, 88, 12)
          doc.setFont(undefined, 'bold')
          doc.text(item.tipo || 'SUCURSAL', 18, startY + 5)
          doc.setTextColor(100)
          doc.text(`${item.nro_transferencias} Transf.`, pageW - 50, startY + 5)

          doc.setFontSize(9)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(item.origen, 18, startY + 12)
          doc.setTextColor(234, 88, 12)
          doc.setFontSize(7)
          doc.text('→', 18, startY + 17)
          doc.setFontSize(9)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(item.destino, 22, startY + 17)

          // Totales
          doc.setFontSize(8)
          doc.setTextColor(234, 88, 12)
          doc.setFont(undefined, 'bold')
          doc.text(`Monto: ${Number(item.monto_total || 0).toFixed(2)} Bs.`, pageW - 70, startY + 10)
          if (Number(item.comisiones_totales || 0) > 0) {
            doc.setTextColor(37, 99, 235)
            doc.text(`Comisión: ${Number(item.comisiones_totales || 0).toFixed(2)} Bs.`, pageW - 70, startY + 16)
          }
          if (Number(item.panaderia_total || 0) > 0) {
            doc.setTextColor(5, 150, 105)
            doc.text(`Panadería: ${Number(item.panaderia_total || 0).toFixed(2)} Bs.`, pageW - 70, startY + 22)
          }

          // Items
          if (item.detalle_items?.length) {
            doc.setFontSize(6)
            doc.setTextColor(100)
            doc.setFont(undefined, 'normal')
            item.detalle_items.forEach((d, di) => {
              doc.text(`${d.nombre_producto} x${d.cantidad_total}`, 18, startY + 26 + (di * 4))
            })
          }

          startY += 44
        })
      }

      // Historial Detallado (igual que UI: cada día con accordion)
      if (startY > 240) { doc.addPage(); startY = 50 }
      doc.setFontSize(12)
      doc.setTextColor(0)
      doc.setFont(undefined, 'bold')
      doc.text('Historial Detallado', 14, startY)
      startY += 8

      processedTransferencias.value.forEach(group => {
        if (startY > 255) { doc.addPage(); startY = 50 }
        // Header del grupo fecha
        doc.setFillColor(220, 220, 220)
        doc.rect(14, startY - 4, pageW - 28, 8, 'F')
        doc.setFontSize(8)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text(`Fecha: ${fmtPeriodo(group)} (${group.transferencias.length} transferencias)`, 18, startY)
        startY += 8

        group.transferencias.forEach(trans => {
          if (startY > 255) { doc.addPage(); startY = 50 }

          // Datos de la transferencia
          doc.setFillColor(249, 250, 251)
          doc.rect(14, startY - 3, pageW - 28, 7, 'F')
          doc.setFontSize(7)
          doc.setTextColor(37, 99, 235)
          doc.setFont(undefined, 'bold')
          doc.text(`#${trans.idtransferencia} ${trans.hora}`, 18, startY)
          doc.setTextColor(0)
          doc.text(`${trans.origen} → ${trans.destino}`, pageW / 2, startY)
          doc.setTextColor(trans.estado === 1 ? 22 : 220, trans.estado === 1 ? 163 : 38, trans.estado === 1 ? 74 : 38)
          doc.text(trans.estado === 1 ? 'Activo' : 'Anulado', pageW - 30, startY)
          startY += 8

          // Detalles (una sola tabla con todas las filas)
          const detRows = trans.detalles.map(item => {
            const tipoLabel = item.tipo === 'Producto' ? 'PROD' : 'INS'
            return [
              tipoLabel,
              item.nombre,
              item.presentacion || '-',
              String(item.cantidad),
              item.precio > 0 ? `${Number(item.precio).toFixed(2)} Bs.` : '-',
              item.comision > 0 ? `${Number(item.comision).toFixed(2)} Bs.` : '-',
              item.subtotal > 0 ? `${Number(item.subtotal).toFixed(2)} Bs.` : '-'
            ]
          })
          if (detRows.length) {
            autoTable(doc, {
              head: [['Tipo', 'Nombre', 'Presentación', 'Cantidad', 'Precio', 'Comisión', 'Subtotal']],
              body: detRows, startY, styles: { fontSize: 6 },
              columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 35 }, 4: { cellWidth: 20 }, 5: { cellWidth: 20 }, 6: { cellWidth: 20 } }
            })
            startY = doc.lastAutoTable.finalY + 1
          }

          // Fila totales
          autoTable(doc, {
            body: [[
              { content: `Monto: ${parseFloat(trans.montoTotal).toFixed(2)} Bs.${trans.comision > 0 ? ` | Comisión: ${parseFloat(trans.comision).toFixed(2)} Bs.` : ''}`, colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245], fontSize: 7 } }
            ]],
            startY, styles: { fontSize: 7 }
          })
          startY = doc.lastAutoTable.finalY + 3
        })
        startY += 3
      })
    } else {
      // === VISTA SEMANAL ===
      const chartW = pageW - 28
      const chW1 = addChartToPDF(doc, 0, 14, startY + 5, chartW)
      if (chW1 !== null) {
        startY += chW1 + 15
      }

      const weeks = {}
      processedTransferencias.value.forEach(g => {
        const m = getWeekMonday(g.fecha)
        if (!weeks[m]) weeks[m] = { fecha: m, semanaLabel: getWeekLabel(m), groups: [] }
        weeks[m].groups.push(g)
      })
      const sortedWeeks = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      sortedWeeks.forEach((sem, si) => {
        if (startY > 250) { doc.addPage(); startY = 50 }
        doc.setFillColor(255, 247, 237)
        doc.rect(14, startY - 5, pageW - 28, 10, 'F')
        doc.setFontSize(11)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text(`Semana ${si + 1}: ${sem.semanaLabel}`, 18, startY)
        const totalSem = sem.groups.reduce((s, g) => s + g.transferencias.reduce((st, t) => st + parseFloat(t.montoTotal || 0), 0), 0)
        const totalComSem = sem.groups.reduce((s, g) => s + g.transferencias.reduce((st, t) => st + parseFloat(t.comision || 0), 0), 0)
        doc.setFontSize(9)
        doc.setTextColor(234, 88, 12)
        doc.text(`Total: ${totalSem.toFixed(2)} Bs.`, pageW - 75, startY)
        doc.setTextColor(37, 99, 235)
        doc.text(`Com: ${totalComSem.toFixed(2)} Bs.`, pageW - 35, startY)
        startY += 10

        // Resumen de Transferencias (cards por origen→destino)
        const allWeekTransf = []
        sem.groups.forEach(g => { g.transferencias.forEach(t => allWeekTransf.push(t)) })
        const odMap = {}
        allWeekTransf.forEach(t => {
          const key = `${t.origen}|${t.destino}`
          if (!odMap[key]) odMap[key] = { origen: t.origen, destino: t.destino, tipo: t.tipo_origen || 'SUCURSAL', nro: 0, monto: 0, comision: 0, panaderia: 0, items: {} }
          odMap[key].nro++
          odMap[key].monto += parseFloat(t.montoTotal || 0)
          odMap[key].comision += parseFloat(t.comision || 0)
          ;(t.detalles || []).forEach(d => {
            const n = d.nombre || 'N/A'
            if (!odMap[key].items[n]) odMap[key].items[n] = 0
            odMap[key].items[n] += Number(d.cantidad || 0)
          })
        })
        const odArr = Object.values(odMap)
        if (odArr.length && startY > 240) { doc.addPage(); startY = 50 }
        doc.setFontSize(9)
        doc.setTextColor(0)
        doc.setFont(undefined, 'bold')
        doc.text('Resumen de Transferencias', 14, startY)
        startY += 8

        odArr.forEach((item, idx) => {
          if (startY > 255) { doc.addPage(); startY = 50 }
          doc.setFillColor(255, 255, 255)
          doc.setDrawColor(229, 231, 235)
          doc.rect(14, startY, pageW - 28, 36, 'FD')
          doc.setFontSize(7)
          doc.setTextColor(234, 88, 12)
          doc.setFont(undefined, 'bold')
          doc.text(item.tipo, 18, startY + 5)
          doc.setTextColor(100)
          doc.text(`${item.nro} Transf.`, pageW - 50, startY + 5)
          doc.setFontSize(9)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(item.origen, 18, startY + 12)
          doc.setFontSize(7)
          doc.setTextColor(234, 88, 12)
          doc.text('→', 18, startY + 17)
          doc.setFontSize(9)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(item.destino, 22, startY + 17)
          doc.setFontSize(8)
          doc.setTextColor(234, 88, 12)
          doc.setFont(undefined, 'bold')
          doc.text(`Monto: ${item.monto.toFixed(2)} Bs.`, pageW - 70, startY + 10)
          if (item.comision > 0) {
            doc.setTextColor(37, 99, 235)
            doc.text(`Comisión: ${item.comision.toFixed(2)} Bs.`, pageW - 70, startY + 16)
          }
          const itemKeys = Object.keys(item.items)
          if (itemKeys.length) {
            doc.setFontSize(6)
            doc.setTextColor(100)
            doc.setFont(undefined, 'normal')
            const itemText = itemKeys.slice(0, 4).map(k => `${k} x${item.items[k]}`).join(', ')
            doc.text(itemText, 18, startY + 25)
          }
          startY += 42
        })

        // Per-day details
        sem.groups.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(g => {
          if (startY > 255) { doc.addPage(); startY = 50 }
          doc.setFillColor(239, 246, 255)
          doc.rect(14, startY - 3, pageW - 28, 7, 'F')
          doc.setFontSize(8)
          doc.setTextColor(0)
          doc.setFont(undefined, 'bold')
          doc.text(`${fmtPeriodo(g)} (${g.transferencias.length} transferencias)`, 18, startY)
          startY += 8

          const allRows = g.transferencias.map(trans => [
            `${trans.idtransferencia}\n${trans.hora}`,
            `${trans.origen}→${trans.destino}`,
            trans.detalles.map(d => d.nombre).join(', '),
            String(trans.detalles.reduce((s, d) => s + Number(d.cantidad || 0), 0)),
            `${parseFloat(trans.montoTotal).toFixed(2)} Bs.`,
            trans.estado === 1 ? 'Activo' : 'Anulado'
          ])
          if (allRows.length) {
            if (startY > 255) { doc.addPage(); startY = 50 }
            autoTable(doc, {
              head: [['ID', 'Origen→Destino', 'Producto', 'Cant.', 'Monto', 'Estado']],
              body: allRows, startY, styles: { fontSize: 6 },
              columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 30 }, 2: { cellWidth: 35 }, 5: { cellWidth: 12 } }
            })
            startY = doc.lastAutoTable.finalY + 1
          }
          startY += 3
        })
        startY += 5
      })
    }

    doc.save(`reporte_transferencias${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'compras') {
    if (!comprasDetallada.value || comprasDetallada.value.length === 0) {
      alert("No hay datos de compras para exportar a PDF.");
      return;
    }
    const doc = new jsPDF('l');
    let startY = await addPDFHeader(doc, `Reporte de Compras${isSemanal ? ' Semanal' : ''}`);
    const pageW = doc.internal.pageSize.getWidth();
    startY += 10;

    const cons = comprasConsolidada.value;
    const totalGasto = cons?.total_gastos || cons?.detalle?.reduce((sum, p) => sum + parseFloat(p.total_proveedor || 0), 0) || 0;
    const totalProveedores = cons?.detalle?.length || 0;

    // KPI cards
    const renderKpiCompras = (y) => {
      if (y > 250) { doc.addPage('l'); return 50; }
      doc.setFillColor(255, 247, 237);
      doc.rect(14, y, 65, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(234, 88, 12); doc.setFont(undefined, 'bold');
      doc.text('Total Invertido', 16, y + 5);
      doc.setFontSize(12); doc.text(`${Number(totalGasto).toFixed(2)} Bs.`, 16, y + 12);

      doc.setFillColor(239, 246, 255);
      doc.rect(83, y, 65, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(37, 99, 235);
      doc.text('Proveedores', 85, y + 5);
      doc.setFontSize(12); doc.text(`${totalProveedores}`, 85, y + 12);

      doc.setFillColor(240, 253, 244);
      doc.rect(152, y, 40, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(22, 163, 74);
      doc.text('Compras', 154, y + 5);
      doc.setFontSize(12); doc.text(`${comprasDetallada.value.length}`, 154, y + 12);
      return y + 20;
    }
    startY = renderKpiCompras(startY);

    const chartW = pageW - 28;
    if (!isSemanal) {
      const chC1 = addChartToPDF(doc, 0, 14, startY + 5, Math.floor(chartW / 2.1));
      if (chC1 !== null) {
        let chartY = startY + 5;
        const chC2 = addChartToPDF(doc, 1, 14 + Math.floor(chartW / 2.1) + 5, chartY, Math.floor(chartW / 2.1)) || 0;
        startY += Math.max(chC1, chC2) + 15;

        if (cons?.detalle?.length) {
          autoTable(doc, {
            head: [['Proveedor', 'Total Invertido']],
            body: cons.detalle.map(p => [p.proveedor, `${Number(p.total_proveedor || 0).toFixed(2)} Bs.`]),
            startY, styles: { fontSize: 7 }, columnStyles: { 0: { cellWidth: 50 } }
          });
          startY = doc.lastAutoTable.finalY + 5;
        }
        if (cons?.detalle?.length) {
          const insumoTotals = {};
          cons.detalle.forEach(prov => (prov.insumos || []).forEach(i => { insumoTotals[i.insumo] = (insumoTotals[i.insumo] || 0) + Number(i.cantidad || 0); }));
          const insumoRows = Object.entries(insumoTotals);
          if (insumoRows.length) {
            autoTable(doc, {
              head: [['Insumo', 'Cantidad Total']],
              body: insumoRows,
              startY, styles: { fontSize: 7 }, columnStyles: { 0: { cellWidth: 50 } }
            });
            startY = doc.lastAutoTable.finalY + 5;
          }
        }
      }

      if (cons?.detalle?.length > 0) {
        if (startY > 240) { doc.addPage('l'); startY = 50; }
        doc.setFontSize(12); doc.setTextColor(0); doc.setFont(undefined, 'bold');
        doc.text('Resumen de Compras por Proveedor', 14, startY);
        startY += 8;
        const insumosUnicos = [];
        const insumoSet = new Set();
        cons.detalle.forEach(prov => {
          if (prov.insumos) prov.insumos.forEach(i => { if (!insumoSet.has(i.insumo)) { insumoSet.add(i.insumo); insumosUnicos.push(i.insumo); } });
        });
        const col = ["Proveedor", ...insumosUnicos, "Total Invertido"];
        const rows = cons.detalle.map(prov => {
          const insumoMap = {};
          (prov.insumos || []).forEach(i => { insumoMap[i.insumo] = i.cantidad; });
          return [prov.proveedor, ...insumosUnicos.map(ins => insumoMap[ins] || '-'), `${Number(prov.total_proveedor).toFixed(2)} Bs.`];
        });
        autoTable(doc, { head: [col], body: rows, startY, styles: { fontSize: 7 } });
        startY = doc.lastAutoTable.finalY + 10;
      }

      if (startY > 240) { doc.addPage('l'); startY = 50; }
      doc.setFontSize(12); doc.setTextColor(0); doc.setFont(undefined, 'bold');
      doc.text('Historial Detallado de Compras', 14, startY);
      startY += 8;
      const tableColumn = ["Fecha", "ID Compra", "Proveedor", "Insumo", "Cantidad", "Unidad", "P. Unit.", "Total"];
      const tableRows = [];
      comprasDetallada.value.forEach(compra => {
        compra.detalles.forEach((det, idx) => {
          tableRows.push([
            idx === 0 ? formatFecha(compra.fecha.split('T')[0]) : '',
            idx === 0 ? compra.idcompra : '',
            idx === 0 ? compra.proveedor : '',
            det.insumo,
            det.cantidad,
            det.medida,
            `${parseFloat(det.precio_unitario).toFixed(2)} Bs.`,
            `${parseFloat(det.precio_total).toFixed(2)} Bs.`
          ]);
        });
        tableRows.push([{
          content: `Total Compra: ${parseFloat(compra.total_compra).toFixed(2)} Bs.`,
          colSpan: 8,
          styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] }
        }]);
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY, styles: { fontSize: 8 } });
    } else {
      // Weekly chart (canvas[0] = generalWeekChartRef)
      const chWeek = addChartToPDF(doc, 0, 14, startY + 5, chartW);
      if (chWeek !== null) startY += chWeek + 15;

      const weeks = {}
      comprasDetallada.value.forEach(c => {
        const fecha = c.fecha ? c.fecha.split('T')[0] : null
        if (!fecha) return
        const monday = getWeekMonday(fecha)
        if (!weeks[monday]) weeks[monday] = { fecha: monday, semanaLabel: getWeekLabel(monday), compras: [], totalInvertido: 0 }
        weeks[monday].compras.push(c)
        weeks[monday].totalInvertido += Number(c.total_compra || 0)
      })
      const sortedWeeks = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      sortedWeeks.forEach((sem, si) => {
        if (startY > 240) { doc.addPage('l'); startY = 50; }
        doc.setFillColor(255, 247, 237)
        doc.rect(14, startY - 5, pageW - 28, 10, 'F')
        doc.setFontSize(11); doc.setTextColor(0); doc.setFont(undefined, 'bold')
        doc.text(`Semana ${si + 1}: ${sem.semanaLabel}`, 18, startY)
        doc.setFontSize(9); doc.setTextColor(79, 70, 229)
        doc.text(`Total: ${sem.totalInvertido.toFixed(2)} Bs. | ${sem.compras.length} compras`, pageW - 80, startY)
        startY += 14

        // Weekly chart por semana (doughnut by proveedor)
        const wChartId = 'wchart-' + sanitizeId(sem.fecha)
        const chH = captureCanvasById(doc, wChartId, 14, startY, Math.min(chartW, 120))
        if (chH !== null) startY += chH + 10

        // Resumen de Compras por Proveedor
        const provMap = {}
        const insSet = {}
        sem.compras.forEach(c => {
          const prov = c.proveedor || 'Sin proveedor'
          if (!provMap[prov]) provMap[prov] = { proveedor: prov, total_proveedor: 0, insumoMap: {} }
          provMap[prov].total_proveedor += Number(c.total_compra || 0)
          ;(c.detalles || []).forEach(d => {
            const insName = d.insumo || d.nombre || ''
            const cant = Number(d.cantidad || 0)
            insSet[insName] = true
            provMap[prov].insumoMap[insName] = (provMap[prov].insumoMap[insName] || 0) + cant
          })
        })
        const insumosUnicosSem = Object.keys(insSet)
        const proveedores = Object.values(provMap)
        if (proveedores.length && insumosUnicosSem.length) {
          if (startY > 240) { doc.addPage('l'); startY = 50 }
          doc.setFontSize(10); doc.setTextColor(0); doc.setFont(undefined, 'bold')
          doc.text('Resumen de Compras por Proveedor', 14, startY)
          startY += 7
          const col = ["Proveedor", ...insumosUnicosSem, "Total Invertido"]
          const rows = proveedores.map(p => [p.proveedor, ...insumosUnicosSem.map(ins => p.insumoMap[ins] ?? '-'), `${p.total_proveedor.toFixed(2)} Bs.`])
          autoTable(doc, { head: [col], body: rows, startY, styles: { fontSize: 7 }, theme: 'striped' })
          startY = doc.lastAutoTable.finalY + 8
        }

        // Detallado por Día
        if (startY > 240) { doc.addPage('l'); startY = 50 }
        doc.setFontSize(10); doc.setTextColor(0); doc.setFont(undefined, 'bold')
        doc.text('Detallado por Día', 14, startY)
        startY += 6

        const dayGroups = {}
        sem.compras.forEach(c => {
          const fecha = c.fecha ? c.fecha.split('T')[0] : 'N/A'
          if (!dayGroups[fecha]) dayGroups[fecha] = { fecha, compras: [] }
          dayGroups[fecha].compras.push(c)
        })
        const sortedDays = Object.values(dayGroups).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

        sortedDays.forEach(day => {
          if (startY > 255) { doc.addPage('l'); startY = 50 }
          doc.setFillColor(239, 246, 255)
          doc.rect(14, startY - 3, pageW - 28, 7, 'F')
          doc.setFontSize(8); doc.setTextColor(0); doc.setFont(undefined, 'bold')
          doc.text(`${formatFecha(day.fecha)} (${day.compras.length} compras)`, 18, startY)
          startY += 8

          const rows = []
          day.compras.forEach(compra => {
            compra.detalles.forEach((det, idx) => {
              rows.push([
                idx === 0 ? compra.proveedor : '',
                det.insumo, det.cantidad, det.medida,
                `${parseFloat(det.precio_unitario).toFixed(2)} Bs.`,
                `${parseFloat(det.precio_total).toFixed(2)} Bs.`
              ])
            })
            rows.push([{
              content: `Total Compra: ${parseFloat(compra.total_compra).toFixed(2)} Bs.`,
              colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245], fontSize: 7 }
            }])
          })
          autoTable(doc, { head: [['Proveedor', 'Insumo', 'Cantidad', 'Unidad', 'P. Unitario', 'Subtotal']], body: rows, startY, styles: { fontSize: 7 } })
          startY = doc.lastAutoTable.finalY + 3
        })
        startY += 5
      })
    }
    doc.save(`reporte_compras${isSemanal ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'produccion') {
    if (!reporteProduccionConsolidada.value || reporteProduccionConsolidada.value.length === 0) {
      alert("No hay datos de producción para exportar a PDF.");
      return;
    }
    const doc = new jsPDF('l');
    let startY = await addPDFHeader(doc, `Reporte de Producción${isSemanal ? ' Semanal' : ''}`);
    const pageW = doc.internal.pageSize.getWidth();
    startY += 10;

    const getTotalProducido = (data) => data.reduce((sum, p) => sum + Number(p.total_sucursal || 0), 0);
    const getTotalCosto = () => {
      if (reporteProduccionDetallada.value?.producciones) {
        return reporteProduccionDetallada.value.producciones.reduce((acc, p) => acc + parseFloat(p.COSTO_TOTAL || 0), 0);
      }
      return 0;
    };

    const cons = reporteProduccionConsolidada.value;
    const sucursalesRaw = cons?.sucursales || [];
    const totalProd = getTotalProducido(sucursalesRaw);
    const totalCosto = getTotalCosto();

    // KPI cards
    const renderKpiProd = (y) => {
      if (y > 250) { doc.addPage('l'); return 50; }
      doc.setFillColor(240, 253, 244);
      doc.rect(14, y, 65, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(22, 163, 74); doc.setFont(undefined, 'bold');
      doc.text('Total Producido', 16, y + 5);
      doc.setFontSize(12); doc.text(`${totalProd} uds.`, 16, y + 12);

      doc.setFillColor(255, 247, 237);
      doc.rect(83, y, 65, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(234, 88, 12);
      doc.text('Costo Total', 85, y + 5);
      doc.setFontSize(12); doc.text(`${totalCosto.toFixed(2)} Bs.`, 85, y + 12);

      doc.setFillColor(239, 246, 255);
      doc.rect(152, y, 40, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(37, 99, 235);
      doc.text('Sucursales', 154, y + 5);
      doc.setFontSize(12); doc.text(`${sucursalesRaw.length}`, 154, y + 12);
      return y + 20;
    }
    startY = renderKpiProd(startY);

    const chartW = pageW - 28;
    if (!isSemanal) {
      // Small delay to ensure Chart.js finishes rendering on canvas
      await new Promise(r => setTimeout(r, 300));
      const chPr1 = addChartToPDF(doc, 0, 14, startY + 5, Math.floor(chartW / 2.1));
      if (chPr1 !== null) {
        let chartY = startY + 5;
        const chPr2 = addChartToPDF(doc, 1, 14 + Math.floor(chartW / 2.1) + 5, chartY, Math.floor(chartW / 2.1)) || 0;
        startY += Math.max(chPr1, chPr2) + 15;

        if (sucursalesRaw.length) {
          autoTable(doc, {
            head: [['Sucursal', 'Total Producido']],
            body: sucursalesRaw.map(s => [s.sucursal, `${Number(s.total_sucursal || 0).toFixed(0)} uds.`]),
            startY, styles: { fontSize: 7 }, columnStyles: { 0: { cellWidth: 50 } }
          });
          startY = doc.lastAutoTable.finalY + 5;
        }
        const prodTotals = {};
        sucursalesRaw.forEach(suc => (suc.productos || []).forEach(p => { prodTotals[p.producto] = (prodTotals[p.producto] || 0) + Number(p.total_producto || 0); }));
        const prodRows = Object.entries(prodTotals);
        if (prodRows.length) {
          autoTable(doc, {
            head: [['Producto', 'Total']],
            body: prodRows,
            startY, styles: { fontSize: 7 }, columnStyles: { 0: { cellWidth: 50 } }
          });
          startY = doc.lastAutoTable.finalY + 5;
        }
      }

      if (sucursalesRaw.length > 0) {
        if (startY > 240) { doc.addPage('l'); startY = 50; }
        doc.setFontSize(12); doc.setTextColor(0); doc.setFont(undefined, 'bold');
        doc.text('Resumen de Producción por Sucursal', 14, startY);
        startY += 8;
        const productosUnicos = [];
        const prodSet = new Set();
        sucursalesRaw.forEach(suc => {
          if (suc.productos) suc.productos.forEach(p => { if (!prodSet.has(p.producto)) { prodSet.add(p.producto); productosUnicos.push(p.producto); } });
        });
        const col = ["Sucursal / Empleado", ...productosUnicos, "Total"];
        const rows = [];
        sucursalesRaw.forEach(suc => {
          const prodMap = {};
          const empMap = {};
          (suc.productos || []).forEach(p => {
            prodMap[p.producto] = p.total_producto;
            (p.empleados || []).forEach(e => {
              if (!empMap[e.empleado]) empMap[e.empleado] = { nombre: e.empleado, prodMap: {}, total: 0 };
              empMap[e.empleado].prodMap[p.producto] = (empMap[e.empleado].prodMap[p.producto] || 0) + Number(e.cantidad || 0);
              empMap[e.empleado].total += Number(e.cantidad || 0);
            });
          });
          rows.push([{ content: suc.sucursal, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
            ...productosUnicos.map(prod => ({ content: prodMap[prod] || '-', styles: { halign: 'center', fontStyle: 'bold' } })),
            { content: Number(suc.total_sucursal).toFixed(0), styles: { halign: 'right', fontStyle: 'bold' } }
          ]);
          Object.values(empMap).forEach(emp => {
            rows.push([`  ${emp.nombre}`, ...productosUnicos.map(prod => emp.prodMap[prod] || '-'), emp.total.toFixed(0)]);
          });
        });
        autoTable(doc, { head: [col], body: rows, startY, styles: { fontSize: 7 } });
        startY = doc.lastAutoTable.finalY + 10;
      }

      if (sucursalesRaw.length > 0) {
        const insumosUnicos = [];
        const insumoSet = new Set();
        sucursalesRaw.forEach(suc => {
          if (suc.insumos) suc.insumos.forEach(i => { if (!insumoSet.has(i.insumo_nombre)) { insumoSet.add(i.insumo_nombre); insumosUnicos.push({ insumo: i.insumo_nombre, unidad: i.unidad }); } });
        });
        if (insumosUnicos.length > 0) {
          if (startY > 240) { doc.addPage('l'); startY = 50; }
          doc.setFontSize(12); doc.setTextColor(0); doc.setFont(undefined, 'bold');
          doc.text('Insumos Consumidos por Sucursal', 14, startY);
          startY += 8;
          const insCol = ["Sucursal", ...insumosUnicos.map(i => i.insumo)];
          const insRows = sucursalesRaw.map(suc => {
            const insMap = {};
            (suc.insumos || []).forEach(i => { insMap[i.insumo_nombre] = `${i.cantidad_total} ${i.unidad || ''}`; });
            return [suc.sucursal, ...insumosUnicos.map(i => insMap[i.insumo] || '-')];
          });
          autoTable(doc, { head: [insCol], body: insRows, startY, styles: { fontSize: 7 } });
          startY = doc.lastAutoTable.finalY + 10;
        }
      }

      if (reporteProduccionDetallada.value?.producciones?.length > 0) {
        if (startY > 240) { doc.addPage('l'); startY = 50; }
        doc.setFontSize(12); doc.setTextColor(0); doc.setFont(undefined, 'bold');
        doc.text('Detalle de Producciones', 14, startY);
        startY += 8;
        const detColumn = ["Fecha/Sucursal", "Empleado", "Producto", "Cant.", "Mala", "Motivo", "Hora", "Horno", "C. Unit.", "Subtotal"];
        const detRows = [];
        reporteProduccionDetallada.value.producciones.forEach(prod => {
          prod.DetalleLotes.forEach((lote, idx) => {
            detRows.push([
              idx === 0 ? `${formatFecha(prod.fechaproduccion.split('T')[0])} - ${prod.sucursal_nombre}` : '',
              lote.empleado_completo, lote.producto_nombre, lote.cantidad, lote.cantidad_mala || 0,
              lote.motivo_mala || '-', lote.hora || '-', lote.horno_nombre || '-',
              `${parseFloat(lote.costo_unitario || 0).toFixed(2)} Bs.`,
              `${(lote.cantidad * (lote.costo_unitario || 0)).toFixed(2)} Bs.`
            ]);
          });
          detRows.push([{
            content: `Costo total: Insumos ${parseFloat(prod.COSTO_INSUMOS).toFixed(2)} | M.O. ${parseFloat(prod.COSTO_MANO_OBRA).toFixed(2)} | Ind. ${parseFloat(prod.COSTO_INDIRECTO).toFixed(2)} = ${parseFloat(prod.COSTO_TOTAL).toFixed(2)} Bs.`,
            colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] }
          }]);
        });
        autoTable(doc, { head: [detColumn], body: detRows, startY, styles: { fontSize: 8 } });
      }
    } else {
      const chWeek = addChartToPDF(doc, 0, 14, startY + 5, chartW);
      if (chWeek !== null) startY += chWeek + 15;

      const weeks = {}
      const producciones = reporteProduccionDetallada.value?.producciones || []
      producciones.forEach(p => {
        const fecha = p.fechaproduccion ? p.fechaproduccion.split('T')[0] : null
        if (!fecha) return
        const monday = getWeekMonday(fecha)
        if (!weeks[monday]) weeks[monday] = { fecha: monday, semanaLabel: getWeekLabel(monday), producciones: [] }
        weeks[monday].producciones.push(p)
      })
      const sortedWeeks = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      sortedWeeks.forEach((sem, si) => {
        if (startY > 240) { doc.addPage('l'); startY = 50 }
        doc.setFillColor(255, 247, 237)
        doc.rect(14, startY - 5, pageW - 28, 10, 'F')
        doc.setFontSize(11); doc.setTextColor(0); doc.setFont(undefined, 'bold')
        doc.text(`Semana ${si + 1}: ${sem.semanaLabel}`, 18, startY)
        const totalCant = sem.producciones.reduce((s, p) => s + Number(p.total_producido || p.CANTIDAD_TOTAL_PRODUCIDA || 0), 0)
        const totalCostoSem = sem.producciones.reduce((s, p) => s + parseFloat(p.COSTO_TOTAL || 0), 0)
        doc.setFontSize(9); doc.setTextColor(5, 150, 105)
        doc.text(`Prod.: ${totalCant} uds.`, pageW - 130, startY)
        doc.setTextColor(234, 88, 12)
        doc.text(`Costo: ${totalCostoSem.toFixed(2)} Bs.`, pageW - 70, startY)
        startY += 14

        // Weekly chart
        const wChartId = 'wchart-' + sanitizeId(sem.fecha)
        const chH = captureCanvasById(doc, wChartId, 14, startY, Math.min(chartW, 120))
        if (chH !== null) startY += chH + 10

        const sucMap = {}
        const prodSet = {}
        sem.producciones.forEach(prod => {
          const nom = prod.sucursal_nombre || 'Sin sucursal'
          if (!sucMap[nom]) sucMap[nom] = { nombre: nom, total_sucursal: 0, productoTotalMap: {}, empleados: {} }
          const cantSesion = Number(prod.CANTIDAD_TOTAL_PRODUCIDA || prod.total_producido || 0)
          sucMap[nom].total_sucursal += cantSesion
          ;(prod.DetalleLotes || []).forEach(lote => {
            const pid = lote.idproducto || lote.producto_nombre
            const pname = lote.producto_nombre || ''
            if (pid && pname) prodSet[pid] = { idproducto: pid, producto: pname }
            const key = `${pid || lote.producto_nombre}`
            sucMap[nom].productoTotalMap[key] = (sucMap[nom].productoTotalMap[key] || 0) + Number(lote.cantidad || 0)
            const empName = lote.empleado_completo || 'Sin empleado'
            if (!sucMap[nom].empleados[empName]) sucMap[nom].empleados[empName] = { nombre: empName, productoMap: {}, total_empleado: 0 }
            sucMap[nom].empleados[empName].productoMap[key] = (sucMap[nom].empleados[empName].productoMap[key] || 0) + Number(lote.cantidad || 0)
            sucMap[nom].empleados[empName].total_empleado += Number(lote.cantidad || 0)
          })
        })
        const productosUnicos = Object.values(prodSet)
        const sucursalesSem = Object.values(sucMap).map(s => ({ ...s, empleados: Object.values(s.empleados) }))

        if (sucursalesSem.length && productosUnicos.length) {
          if (startY > 240) { doc.addPage('l'); startY = 50 }
          doc.setFontSize(10); doc.setTextColor(0); doc.setFont(undefined, 'bold')
          doc.text('Resumen de Producción por Sucursal', 14, startY)
          startY += 7
          const col = ["Sucursal / Empleado", ...productosUnicos.map(p => p.producto), "Total"]
          const rows = []
          sucursalesSem.forEach(suc => {
            rows.push([{ content: suc.nombre, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
              ...productosUnicos.map(p => ({ content: String(suc.productoTotalMap[p.idproducto] ?? '-'), styles: { halign: 'center', fontStyle: 'bold' } })),
              { content: suc.total_sucursal.toFixed(0), styles: { halign: 'right', fontStyle: 'bold' } }
            ])
            suc.empleados.forEach(emp => {
              rows.push([`  ${emp.nombre}`, ...productosUnicos.map(p => emp.productoMap[p.idproducto] ?? '-'), emp.total_empleado.toFixed(0)])
            })
          })
          autoTable(doc, { head: [col], body: rows, startY, styles: { fontSize: 7 }, theme: 'striped' })
          startY = doc.lastAutoTable.finalY + 8
        }

        if (startY > 240) { doc.addPage('l'); startY = 50 }
        doc.setFontSize(10); doc.setTextColor(0); doc.setFont(undefined, 'bold')
        doc.text('Detallado por Día', 14, startY)
        startY += 6

        const dayGroups = {}
        sem.producciones.forEach(p => {
          const fecha = p.fechaproduccion ? p.fechaproduccion.split('T')[0] : 'N/A'
          if (!dayGroups[fecha]) dayGroups[fecha] = { fecha, producciones: [] }
          dayGroups[fecha].producciones.push(p)
        })
        const sortedDays = Object.values(dayGroups).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

        sortedDays.forEach(day => {
          if (startY > 255) { doc.addPage('l'); startY = 50 }
          doc.setFillColor(239, 246, 255)
          doc.rect(14, startY - 3, pageW - 28, 7, 'F')
          doc.setFontSize(8); doc.setTextColor(0); doc.setFont(undefined, 'bold')
          doc.text(`${formatFecha(day.fecha)} (${day.producciones.length} sesiones)`, 18, startY)
          startY += 8

          const detRows = []
          day.producciones.forEach(prod => {
            prod.DetalleLotes.forEach((lote, idx) => {
              detRows.push([
                idx === 0 ? `${prod.sucursal_nombre}` : '',
                lote.empleado_completo, lote.producto_nombre, lote.cantidad, lote.cantidad_mala || 0,
                lote.motivo_mala || '-', lote.hora || '-', lote.horno_nombre || '-',
                `${parseFloat(lote.costo_unitario || 0).toFixed(2)} Bs.`,
                `${(lote.cantidad * (lote.costo_unitario || 0)).toFixed(2)} Bs.`
              ])
            })
            detRows.push([{
              content: `Resumen: Insumos: ${parseFloat(prod.COSTO_INSUMOS).toFixed(2)} | M.O.: ${parseFloat(prod.COSTO_MANO_OBRA).toFixed(2)} | Ind.: ${parseFloat(prod.COSTO_INDIRECTO).toFixed(2)} | TOTAL: ${parseFloat(prod.COSTO_TOTAL).toFixed(2)} Bs.`,
              colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] }
            }])
          })
          autoTable(doc, { head: [["Sucursal", "Empleado", "Producto", "Cant.", "Mala", "Motivo", "Hora", "Horno", "C. Unit.", "Subtotal"]], body: detRows, startY, styles: { fontSize: 7 } })
          startY = doc.lastAutoTable.finalY + 3
        })
        startY += 5
      })
    }
    doc.save(`reporte_produccion${isSemanal ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'comision') {
    try {
    if (!comisionDetallada.value?.reporte?.length && !comisionConsolidada.value?.reporte?.length) {
      alert("No hay datos de comisiones para exportar a PDF.");
      return;
    }
    const doc = new jsPDF('l');
    let startY = await addPDFHeader(doc, `Reporte de Comisiones${isSemanal ? ' Semanal' : ''}`);
    const pageW = doc.internal.pageSize.getWidth();
    startY += 10;

    const totals = comisionConsolidada.value?.totalesGlobales || {};
    const totalCom = Number(totals.total_comision_empleados || 0);
    const totalPan = Number(totals.total_ganancia_panaderia || 0);

    const renderKpiCom = (y) => {
      if (y > 250) { doc.addPage('l'); return 50; }
      doc.setFillColor(239, 246, 255);
      doc.rect(14, y, 65, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(37, 99, 235); doc.setFont(undefined, 'bold');
      doc.text('Comisión Empleados', 16, y + 5);
      doc.setFontSize(12); doc.text(`${totalCom.toFixed(2)} Bs.`, 16, y + 12);

      doc.setFillColor(240, 253, 244);
      doc.rect(83, y, 65, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(22, 163, 74); doc.setFont(undefined, 'bold');
      doc.text('Ganancia Panadería', 85, y + 5);
      doc.setFontSize(12); doc.text(`${totalPan.toFixed(2)} Bs.`, 85, y + 12);

      doc.setFillColor(255, 247, 237);
      doc.rect(152, y, 55, 14, 'F');
      doc.setFontSize(8); doc.setTextColor(234, 88, 12);
      doc.text('Total Controles', 154, y + 5);
      const totalControles = (comisionDetallada.value?.reporte || []).reduce((s, g) => s + (g.controles || []).length, 0);
      doc.setFontSize(12); doc.text(`${totalControles}`, 154, y + 12);
      return y + 20;
    }
    startY = renderKpiCom(startY);

    const chartW = pageW - 28;
    if (!isSemanal) {
      const chCo1 = addChartToPDF(doc, 0, 14, startY + 5, Math.floor(chartW / 2.1));
      if (chCo1 !== null) {
        let chartY = startY + 5;
        const chCo2 = addChartToPDF(doc, 1, 14 + Math.floor(chartW / 2.1) + 5, chartY, Math.floor(chartW / 2.1)) || 0;
        startY += Math.max(chCo1, chCo2) + 15;

        const empRows = [];
        (comisionConsolidada.value?.reporte || []).forEach(g => { if (Array.isArray(g.empleados)) g.empleados.forEach(emp => { empRows.push([emp.empleado, `${Number(emp.total_comision || 0).toFixed(2)} Bs.`, `${Number(emp.total_liquido_panaderia || 0).toFixed(2)} Bs.`]); }) });
        if (empRows.length) {
          autoTable(doc, {
            head: [['Empleado', 'Comisión', 'Líq. Panadería']],
            body: empRows,
            startY, styles: { fontSize: 7 }, columnStyles: { 0: { cellWidth: 50 } }
          });
          startY = doc.lastAutoTable.finalY + 5;
        }
      }

      if (comisionDetallada.value?.reporte?.length) {
        const empMap = {}
        const prodSet = new Set()
        comisionDetallada.value.reporte.forEach(g => {
          if (Array.isArray(g.controles)) g.controles.forEach(c => {
            if (!empMap[c.empleado]) empMap[c.empleado] = { empleado: c.empleado, total_comision: 0, total_liquido: 0, productoMap: {} }
            if (Array.isArray(c.detalles)) c.detalles.forEach(d => {
              prodSet.add(d.producto)
              empMap[c.empleado].productoMap[d.producto] = (empMap[c.empleado].productoMap[d.producto] || 0) + Number(d.cantidad_vendida || 0)
              empMap[c.empleado].total_comision += Number(d.comision_total || 0)
              empMap[c.empleado].total_liquido += Number(d.liquido_panaderia || 0)
            })
          })
        })
        const prodUnicos = [...prodSet]
        const empleados = Object.values(empMap)
        if (empleados.length) {
          if (startY > 240) { doc.addPage('l'); startY = 50 }
          doc.setFontSize(12); doc.setTextColor(0); doc.setFont(undefined, 'bold');
          doc.text('Resumen de Comisiones', 14, startY);
          startY += 8;
          const col = ["Empleado", ...prodUnicos, "Comisión", "Líq. Panadería"];
          const rows = empleados.map(e => [e.empleado, ...prodUnicos.map(p => e.productoMap[p] ?? '-'), `${e.total_comision.toFixed(2)} Bs.`, `${e.total_liquido.toFixed(2)} Bs.`]);
          autoTable(doc, { head: [col], body: rows, startY, styles: { fontSize: 7 }, theme: 'striped' });
          startY = doc.lastAutoTable.finalY + 10;
        }
      }

      if (comisionDetallada.value?.reporte?.length) {
        if (startY > 240) { doc.addPage('l'); startY = 50; }
        doc.setFontSize(12); doc.setTextColor(0); doc.setFont(undefined, 'bold');
        doc.text('Detalle de Comisiones', 14, startY);
        startY += 8;
        const tableColumn = ["Fecha", "Empleado", "Sucursal", "Producto", "Presentación", "Entregado", "Devuelto", "Ajustado", "Vendido", "Precio Vta.", "Comisión Unit.", "Comisión Total", "Líq. Panadería"];
        const tableRows = [];
        comisionDetallada.value.reporte.forEach(group => {
          if (Array.isArray(group.controles)) group.controles.forEach(control => {
            if (Array.isArray(control.detalles)) control.detalles.forEach(det => {
              tableRows.push([
                formatFecha(group.fecha),
                control.empleado,
                control.sucursal,
                det.producto,
                det.presentacion,
                Number(det.cantidad_entregada || 0),
                Number(det.cantidad_devuelta || 0),
                Number(det.cantidadajustada ?? det.cantidad_ajustada ?? 0),
                Number(det.cantidad_vendida || 0),
                `${Number(det.precio_venta || 0).toFixed(2)} Bs.`,
                `${Number(det.comision_unitaria || 0).toFixed(2)} Bs.`,
                `${Number(det.comision_total || 0).toFixed(2)} Bs.`,
                `${Number(det.liquido_panaderia || 0).toFixed(2)} Bs.`
              ]);
            });
          });
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY, styles: { fontSize: 8 } });
      }
    } else if (comisionDetallada.value?.reporte?.length) {
      const chWeek = addChartToPDF(doc, 0, 14, startY + 5, chartW);
      if (chWeek !== null) startY += chWeek + 15;

      const weeks = {}
      comisionDetallada.value.reporte.forEach(g => {
        const fecha = g.fecha ? g.fecha.split('T')[0] : null
        if (!fecha) return
        const monday = getWeekMonday(fecha)
        if (!weeks[monday]) weeks[monday] = { fecha: monday, semanaLabel: getWeekLabel(monday), groups: [], totalComision: 0, totalLiquido: 0, totalControles: 0 }
        weeks[monday].groups.push(g)
        if (Array.isArray(g.controles)) g.controles.forEach(c => { weeks[monday].totalControles++; if (Array.isArray(c.detalles)) c.detalles.forEach(d => { weeks[monday].totalComision += Number(d.comision_total || 0); weeks[monday].totalLiquido += Number(d.liquido_panaderia || 0) }) })
      })
      const sortedWeeks = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      sortedWeeks.forEach((sem, si) => {
        if (startY > 240) { doc.addPage('l'); startY = 50 }
        doc.setFillColor(255, 247, 237)
        doc.rect(14, startY - 5, pageW - 28, 10, 'F')
        doc.setFontSize(11); doc.setTextColor(0); doc.setFont(undefined, 'bold')
        doc.text(`Semana ${si + 1}: ${sem.semanaLabel}`, 18, startY)
        doc.setFontSize(9); doc.setTextColor(37, 99, 235)
        doc.text(`Com: ${sem.totalComision.toFixed(2)} Bs.`, pageW - 120, startY)
        doc.setTextColor(22, 163, 74)
        doc.text(`Liq: ${sem.totalLiquido.toFixed(2)} Bs.`, pageW - 60, startY)
        startY += 14

        // Weekly charts (doughnut + comparison)
        const wChartId = 'wchart-' + sanitizeId(sem.fecha)
        const chH1 = captureCanvasById(doc, wChartId, 14, startY, Math.min(chartW / 2.3, 100))
        const wChart2Id = 'wchart2-' + sanitizeId(sem.fecha)
        const chH2 = captureCanvasById(doc, wChart2Id, 14 + Math.min(chartW / 2.3, 100) + 5, startY, Math.min(chartW / 2.3, 100))
        if (chH1 !== null || chH2 !== null) startY += Math.max(chH1 || 0, chH2 || 0) + 10

        const empMap = {}
        const prodSet = new Set()
        sem.groups.forEach(group => {
          if (Array.isArray(group.controles)) group.controles.forEach(control => {
            if (!empMap[control.empleado]) empMap[control.empleado] = { empleado: control.empleado, total_comision: 0, total_liquido: 0, productoMap: {} }
            if (Array.isArray(control.detalles)) control.detalles.forEach(det => {
              prodSet.add(det.producto)
              const pname = det.producto
              empMap[control.empleado].productoMap[pname] = (empMap[control.empleado].productoMap[pname] || 0) + Number(det.cantidad_vendida || 0)
              empMap[control.empleado].total_comision += Number(det.comision_total || 0)
              empMap[control.empleado].total_liquido += Number(det.liquido_panaderia || 0)
            })
          })
        })
        const prodUnicos = [...prodSet]
        const empleados = Object.values(empMap)
        if (empleados.length && prodUnicos.length) {
          if (startY > 240) { doc.addPage('l'); startY = 50 }
          doc.setFontSize(10); doc.setTextColor(0); doc.setFont(undefined, 'bold')
          doc.text('Resumen de Comisiones', 14, startY)
          startY += 7
          const col = ["Empleado", ...prodUnicos, "Comisión", "Líq. Panadería"]
          const rows = empleados.map(e => [e.empleado, ...prodUnicos.map(p => e.productoMap[p] ?? '-'), `${e.total_comision.toFixed(2)} Bs.`, `${e.total_liquido.toFixed(2)} Bs.`])
          autoTable(doc, { head: [col], body: rows, startY, styles: { fontSize: 7 }, theme: 'striped' })
          startY = doc.lastAutoTable.finalY + 8
        }

        if (startY > 240) { doc.addPage('l'); startY = 50 }
        doc.setFontSize(10); doc.setTextColor(0); doc.setFont(undefined, 'bold')
        doc.text('Detallado por Día', 14, startY)
        startY += 6

        const dayGroups = {}
        sem.groups.forEach(g => {
          const fecha = g.fecha ? g.fecha.split('T')[0] : 'N/A'
          if (!dayGroups[fecha]) dayGroups[fecha] = { fecha, controles: [] }
          if (Array.isArray(g.controles)) g.controles.forEach(c => dayGroups[fecha].controles.push(c))
        })
        const sortedDays = Object.values(dayGroups).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

        sortedDays.forEach(day => {
          if (startY > 255) { doc.addPage('l'); startY = 50 }
          doc.setFillColor(239, 246, 255)
          doc.rect(14, startY - 3, pageW - 28, 7, 'F')
          doc.setFontSize(8); doc.setTextColor(0); doc.setFont(undefined, 'bold')
          doc.text(`${formatFecha(day.fecha)} (${(day.controles||[]).length} controles)`, 18, startY)
          startY += 8

          const rows = []
          if (Array.isArray(day.controles)) day.controles.forEach(control => {
            if (Array.isArray(control.detalles)) control.detalles.forEach(det => {
              rows.push([
                control.empleado, control.sucursal, det.producto, det.presentacion,
                Number(det.cantidad_entregada || 0), Number(det.cantidad_devuelta || 0),
                Number(det.cantidadajustada ?? det.cantidad_ajustada ?? 0), Number(det.cantidad_vendida || 0),
                `${Number(det.precio_venta || 0).toFixed(2)} Bs.`,
                `${Number(det.comision_unitaria || 0).toFixed(2)} Bs.`,
                `${Number(det.comision_total || 0).toFixed(2)} Bs.`,
                `${Number(det.liquido_panaderia || 0).toFixed(2)} Bs.`
              ])
            })
          })
          autoTable(doc, { head: [["Empleado", "Sucursal", "Producto", "Presentación", "Entregado", "Devuelto", "Ajustado", "Vendido", "Precio Vta.", "Comisión Unit.", "Comisión Total", "Líq. Panadería"]], body: rows, startY, styles: { fontSize: 7 } })
          startY = doc.lastAutoTable.finalY + 3
        })
        startY += 5
      })
    }
    doc.save(`reporte_comisiones${isSemanal ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e_com) {
      console.error('Error en bloque comisiones PDF:', e_com);
      console.error('Stack:', e_com.stack);
      alert('Error en comisiones: ' + e_com.message + '\n\nRevise la consola (F12) para más detalles.');
      throw e_com;
    }
  } else if (activeTab.value === 'inventario') {
    const data = reporteInventario.value;
    if (!data || !data.sucursales) {
      alert("No hay datos de inventario para exportar a PDF.");
      return;
    }
    const doc = new jsPDF('l');
    let startY = await addPDFHeader(doc, `Reporte de Inventario${agruparPorSemana.value ? ' Semanal' : ''}`);
    startY += 10;

    const tg = data.totalesGlobales || data.resumen || {};

    doc.setFillColor(239, 246, 255);
    doc.rect(14, startY, 55, 14, 'F');
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.setFont(undefined, 'bold');
    doc.text('Total Items', 16, startY + 5);
    doc.setFontSize(14);
    doc.text(`${tg.totalItems || 0}`, 16, startY + 12);

    doc.setFillColor(254, 242, 242);
    doc.rect(73, startY, 55, 14, 'F');
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38);
    doc.setFont(undefined, 'bold');
    doc.text('Agotados', 75, startY + 5);
    doc.setFontSize(14);
    doc.text(`${tg.itemsAgotados || 0}`, 75, startY + 12);

    doc.setFillColor(254, 243, 199);
    doc.rect(132, startY, 55, 14, 'F');
    doc.setFontSize(9);
    doc.setTextColor(217, 119, 6);
    doc.setFont(undefined, 'bold');
    doc.text('Stock Bajo', 134, startY + 5);
    doc.setFontSize(14);
    doc.text(`${tg.itemsStockBajo || 0}`, 134, startY + 12);

    startY += 20;

    // Gráficas
    const chartW = 170;
    const chI1 = addChartToPDF(doc, 0, 14, startY + 5, chartW);
    if (chI1 !== null) {
      let chartY = startY + 5 + chI1 + 5;
      const chI2 = addChartToPDF(doc, 1, 14, chartY, chartW) || 0;
      startY += Math.max(chI1 + chI2 + 10, 55) + 10;
      const itemsPerSuc = (data.sucursales || []).map(s => [s.sucursal, `${((s.insumos || []).length + (s.productos || []).length)} items`]);
      if (itemsPerSuc.length) {
        autoTable(doc, {
          head: [['Sucursal', 'Items']],
          body: itemsPerSuc,
          startY, styles: { fontSize: 6 }, columnStyles: { 0: { cellWidth: 35 } }
        });
        startY = doc.lastAutoTable.finalY + 3;
      }
      const tg = data.totalesGlobales || data.resumen || {};
      const stockRows = [['Normal', tg.totalItems - (tg.itemsAgotados || 0) - (tg.itemsStockBajo || 0)], ['Stock Bajo', tg.itemsStockBajo || 0], ['Agotados', tg.itemsAgotados || 0]];
      autoTable(doc, {
        head: [['Estado', 'Cantidad']],
        body: stockRows,
        startY, styles: { fontSize: 6 }
      });
      startY = doc.lastAutoTable.finalY + 10;
    }

    const col = ["Sucursal", "Item", "Tipo", "Stock", "Costo Unit.", "Estado"];
    const rows = [];
    (data.sucursales || []).forEach(suc => {
      const items = [];
      (suc.insumos || []).forEach(i => items.push({ nombre: i.nombre, tipo: i.tipo_item, unidades: i.unidades, costo: i.costo_promedio, estado: i.estado }));
      (suc.productos || []).forEach(p => items.push({ nombre: p.nombre, tipo: p.tipo_item, unidades: p.unidades, costo: p.costo_promedio, estado: p.estado }));
      items.forEach(item => {
        const stock = item.unidades?.map(u => `${u.unidad}: ${u.stock}`).join(', ') || '0';
        rows.push([suc.sucursal, item.nombre, item.tipo, stock, `${Number(item.costo).toFixed(2)} Bs.`, item.estado === 0 ? 'Agotado' : item.estado === 1 ? 'Normal' : 'Stock Bajo']);
      });
    });
    autoTable(doc, { head: [col], body: rows, startY, styles: { fontSize: 8 } });
    doc.save(`reporte_inventario${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'kardex') {
    const data = reporteKardex.value;
    if (!data || !data.metadatos) {
      alert("No hay datos de kardex para exportar a PDF.");
      return;
    }
    const doc = new jsPDF('l');
    let startY = await addPDFHeader(doc, `Reporte Kardex${agruparPorSemana.value ? ' Semanal' : ''}`);
    startY += 10;

    const meta = data.metadatos;

    doc.setFillColor(238, 242, 255);
    doc.rect(14, startY, 70, 14, 'F');
    doc.setFontSize(9);
    doc.setTextColor(99, 102, 241);
    doc.setFont(undefined, 'bold');
    doc.text('Total Movimientos', 16, startY + 5);
    doc.setFontSize(14);
    doc.text(`${meta.totalMovimientos || 0}`, 16, startY + 12);

    doc.setFillColor(249, 250, 251);
    doc.rect(88, startY, 100, 14, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont(undefined, 'normal');
    doc.text(`Reporte: ${meta.reporte || ''}`, 90, startY + 5);
    doc.text(`Periodo: ${formatFecha(meta.filtros?.fechadesde)} - ${formatFecha(meta.filtros?.fechahasta)}`, 90, startY + 11);

    startY += 20;

    // Gráfica
    const chK1 = addChartToPDF(doc, 0, 14, startY + 5, 260);
    if (chK1 !== null) {
      startY += Math.max(chK1, 55) + 10;
      const movsAll = [];
      if (data.insumos) movsAll.push(...data.insumos);
      if (data.productos) movsAll.push(...data.productos);
      if (movsAll.length) {
        const grouped = {};
        movsAll.forEach(m => { const f = m.fecha.split('T')[0]; grouped[f] = (grouped[f] || 0) + 1; });
        const movRows = Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 10).map(([f, c]) => [formatFecha(f), `${c} movimientos`]);
        autoTable(doc, {
          head: [['Fecha', 'Movimientos']],
          body: movRows,
          startY, styles: { fontSize: 6 }
        });
        startY = doc.lastAutoTable.finalY + 10;
      }
    }

    const movs = [];
    if (data.insumos) movs.push(...data.insumos);
    if (data.productos) movs.push(...data.productos);

    if (movs.length > 0) {
      const sorted = movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      const grouped = {};
      sorted.forEach(m => {
        const fecha = m.fecha.split('T')[0];
        if (!grouped[fecha]) grouped[fecha] = [];
        grouped[fecha].push(m);
      });

      const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
      dates.forEach(fecha => {
        if (startY > 260) { doc.addPage('l'); startY = 50; }
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text(`Fecha: ${formatFecha(fecha)} (${grouped[fecha].length} movimientos)`, 14, startY);
        startY += 6;
        const col = ["Hora", "Item", "Tipo", "Mov.", "Sucursal", "Entrada", "Salida", "Saldo", "C. Unit.", "C. Total"];
        const rows = grouped[fecha].map(m => [
          new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          m.item_nombre || m.nombre,
          m.tipo_item || 'N/A',
          m.entrada > 0 ? 'Entrada' : m.salida > 0 ? 'Salida' : 'Ajuste',
          m.sucursal || '-',
          m.entrada > 0 ? m.entrada : '-',
          m.salida > 0 ? m.salida : '-',
          m.saldo || '-',
          `${Number(m.costo_unitario || 0).toFixed(4)} Bs.`,
          `${Number(m.costo_total || 0).toFixed(2)} Bs.`
        ]);
        autoTable(doc, { head: [col], body: rows, startY, styles: { fontSize: 7 } });
        startY = doc.lastAutoTable.finalY + 8;
      });
    }
    doc.save(`reporte_kardex${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'gastos-generales') {
    const gastos = reporteGastosGenerales.value?.gastos || [];
    if (!gastos.length) {
      alert("No hay datos de gastos generales para exportar a PDF.");
      return;
    }
    const doc = new jsPDF();
    let startY = await addPDFHeader(doc, `Reporte de Gastos Generales${agruparPorSemana.value ? ' Semanal' : ''}`);
    startY += 10;

    const total = Number(reporteGastosGenerales.value?.totalGastos || 0);
    const cantidad = reporteGastosGenerales.value?.cantidad || 0;
    const promedio = cantidad > 0 ? total / cantidad : 0;

    doc.setFillColor(255, 247, 237);
    doc.rect(14, startY, 55, 14, 'F');
    doc.setFontSize(9);
    doc.setTextColor(234, 88, 12);
    doc.setFont(undefined, 'bold');
    doc.text('Total Gastos', 16, startY + 5);
    doc.setFontSize(11);
    doc.text(`${total.toFixed(2)} Bs.`, 16, startY + 12);

    doc.setFillColor(239, 246, 255);
    doc.rect(73, startY, 55, 14, 'F');
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.setFont(undefined, 'bold');
    doc.text('Cantidad', 75, startY + 5);
    doc.setFontSize(11);
    doc.text(`${cantidad}`, 75, startY + 12);

    doc.setFillColor(250, 245, 255);
    doc.rect(132, startY, 55, 14, 'F');
    doc.setFontSize(9);
    doc.setTextColor(147, 51, 234);
    doc.setFont(undefined, 'bold');
    doc.text('Promedio', 134, startY + 5);
    doc.setFontSize(11);
    doc.text(`${promedio.toFixed(2)} Bs.`, 134, startY + 12);

    startY += 20;

    // Gráfica
    const chG1 = addChartToPDF(doc, 0, 14, startY + 5, 175);
    if (chG1 !== null) {
      startY += Math.max(chG1, 55) + 10;
      const gastosByDate = {};
      gastos.forEach(g => { const f = g.fecha ? g.fecha.split('T')[0] : ''; gastosByDate[f] = (gastosByDate[f] || 0) + Number(g.costo || 0); });
      const gastosRows = Object.entries(gastosByDate).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 10).map(([f, c]) => [f ? formatFecha(f) : '--', `${c.toFixed(2)} Bs.`]);
      if (gastosRows.length) {
        autoTable(doc, {
          head: [['Fecha', 'Total Gastos']],
          body: gastosRows,
          startY, styles: { fontSize: 6 }
        });
        startY = doc.lastAutoTable.finalY + 10;
      }
    }

    if (isSemanal) {
      const gastosWeeks = groupByWeek(gastos, g => g.fecha)
      if (gastosWeeks) {
        gastosWeeks.forEach((sem, i) => {
          if (startY > 250) { doc.addPage(); startY = 50; }
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.setFont(undefined, 'bold');
          doc.text(`Semana ${i + 1}: ${sem.semanaLabel}`, 14, startY);
          startY += 6;
          const totalSem = sem.items.reduce((s, g) => s + Number(g.costo || 0), 0)
          doc.setFontSize(9); doc.setFont(undefined, 'normal');
          doc.setTextColor(234, 88, 12);
          doc.text(`Total Gastos Semanal: ${totalSem.toFixed(2)} Bs.`, 14, startY);
          startY += 10;
          const tableRows = sem.items.map(g => [
            g.nombre, formatFecha(g.fecha ? g.fecha.split('T')[0] : ''), `${Number(g.costo || 0).toFixed(2)}`
          ])
          autoTable(doc, { head: [["Nombre", "Fecha", "Costo (Bs.)"]], body: tableRows, startY, styles: { fontSize: 7 } })
          startY = doc.lastAutoTable.finalY + 5
        })
      }
    } else {
      const tableColumn = ["Nombre", "Fecha", "Costo (Bs.)"];
      const tableRows = gastos.map(g => [
        g.nombre,
        formatFecha(g.fecha ? g.fecha.split('T')[0] : ''),
        `${Number(g.costo || 0).toFixed(2)}`
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY });
    }
    doc.save(`reporte_gastos_generales${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'resumen-semanal') {
    await generarResumenSemanalPDF(filtros.value.fechadesde, filtros.value.fechahasta, filtros.value.idsucursal);
  }
  } catch (error) {
    console.error('Error en exportarPDF:', error);
    alert('Error al exportar PDF: ' + error.message);
  } finally {
    if (typeof collapseWeeks === 'function') collapseWeeks();
  }
};

const generarResumenSemanalPDF = async (fechadesde, fechahasta, idsucursal) => {
  if (!fechadesde || !fechahasta) { alert("Seleccione rango de fechas."); return; }
  try {
    const resp = await ReporteSemanalGeneral(fechadesde, fechahasta, idsucursal);
    if (!resp || !resp.result || resp.result.length === 0) { alert("No hay datos semanales."); return; }
    const doc = new jsPDF('l'); const pageW = doc.internal.pageSize.getWidth();
    let y = await addPDFHeader(doc, 'Resumen Semanal');
    y += 10;

    const sortedWeeks = [...resp.result].sort((a, b) => b.semana.localeCompare(a.semana));
    const totalIngresos = sortedWeeks.reduce((a, w) => a + (w.ingresos?.totalIngresos || 0), 0);
    const totalEgresos = sortedWeeks.reduce((a, w) => a + (w.egresos?.totalEgresos || 0), 0);
    const utilidadTotal = totalIngresos - totalEgresos;

    // KPI cards
    const kpiW = Math.floor((pageW - 28) / 4);
    const kpis = [
      { l: 'Total Ingresos', v: `${totalIngresos.toFixed(2)} Bs.`, f: [240,253,244], tc: [22,163,74], vc: [21,128,61] },
      { l: 'Total Egresos', v: `${totalEgresos.toFixed(2)} Bs.`, f: [254,242,242], tc: [220,38,38], vc: [185,28,28] },
      { l: 'Semanas', v: `${sortedWeeks.length}`, f: [255,247,237], tc: [234,88,12], vc: [194,65,12] },
      { l: 'Utilidad Neta', v: `${utilidadTotal.toFixed(2)} Bs.`, f: utilidadTotal>=0?[239,246,255]:[250,245,255], tc: utilidadTotal>=0?[37,99,235]:[147,51,234], vc: utilidadTotal>=0?[29,78,216]:[126,34,206] }
    ];
    kpis.forEach((k, i) => {
      const x = 14 + i * kpiW;
      doc.setFillColor(k.f[0],k.f[1],k.f[2]); doc.rect(x, y, kpiW-2, 16, 'F');
      doc.setFontSize(7); doc.setTextColor(k.tc[0],k.tc[1],k.tc[2]); doc.setFont(undefined,'bold');
      doc.text(k.l, x+2, y+5);
      doc.setFontSize(11); doc.setTextColor(k.vc[0],k.vc[1],k.vc[2]);
      doc.text(k.v, x+2, y+14);
    });
    y += 22;

    sortedWeeks.forEach((week, i) => {
      if (y > 250) { doc.addPage('l'); y = 50; }
      doc.setFillColor(255,247,237); doc.rect(14, y-5, pageW-28, 10, 'F');
      doc.setFontSize(11); doc.setTextColor(0); doc.setFont(undefined,'bold');
      doc.text(`Semana ${i+1}: ${week.semanaLabel}`, 18, y);
      const util = (week.ingresos?.totalIngresos||0) - (week.egresos?.totalEgresos||0);
      doc.setFontSize(9); doc.setTextColor(util>=0?37:147, util>=0?99:51, util>=0?235:234);
      doc.text(`Utilidad: ${util.toFixed(2)} Bs.`, pageW-60, y);
      y += 12;

      if (y > 250) { doc.addPage('l'); y = 50; }
      // Ingresos
      doc.setFontSize(8); doc.setTextColor(22,163,74); doc.setFont(undefined,'bold');
      doc.text('Ingresos', 14, y);
      doc.setFontSize(7); doc.setTextColor(100); doc.setFont(undefined,'normal');
      doc.text(`Venta Tienda: ${(week.ingresos?.ventaTienda||0).toFixed(2)} Bs.`, 14, y+4);
      doc.text(`Revendedores Neto: ${(week.ingresos?.revendedoresNeto||0).toFixed(2)} Bs.`, 14, y+8);
      doc.setFont(undefined,'bold'); doc.setTextColor(22,163,74);
      doc.text(`Total: ${(week.ingresos?.totalIngresos||0).toFixed(2)} Bs.`, 14, y+12);

      // Egresos
      doc.setFont(undefined,'bold'); doc.setTextColor(220,38,38);
      doc.text('Egresos', pageW/2-20, y);
      doc.setFont(undefined,'normal'); doc.setTextColor(100);
      doc.text(`Compras: ${(week.egresos?.compras||0).toFixed(2)} Bs.`, pageW/2-20, y+4);
      doc.text(`Gastos Op.: ${(week.egresos?.gastosOperativos||0).toFixed(2)} Bs.`, pageW/2-20, y+8);
      if (week.egresos?.gastosGenerales !== undefined) {
        doc.text(`Gastos Grales.: ${(week.egresos.gastosGenerales||0).toFixed(2)} Bs.`, pageW/2-20, y+12);
      }

      // Resumen
      doc.setFont(undefined,'bold'); doc.setTextColor(0);
      doc.text('Resumen', pageW-80, y);
      doc.setFont(undefined,'normal'); doc.setTextColor(100);
      doc.text(`Ventas: ${week.resumen?.cantVentas||0}`, pageW-80, y+4);
      doc.text(`Compras: ${week.resumen?.cantCompras||0}`, pageW-80, y+8);
      doc.setFont(undefined,'bold'); doc.setTextColor(util>=0?37:147, util>=0?99:51, util>=0?235:234);
      doc.text(`Utilidad: ${util.toFixed(2)} Bs.`, pageW-80, y+12);
      y += 20;
    });

    doc.save(`resumen_semanal_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (e) {
    console.error('Error en generarResumenSemanalPDF:', e);
    alert('Error al exportar Resumen Semanal: ' + e.message);
  }
};

const exportarExcel = () => {
  try {
  const isSemanal = agruparPorSemana.value
  const fmtPeriodo = (g) => isSemanal ? (g.semanaLabel || g.fecha) : formatFecha(g.fecha)
  const groupByWeek = (items, getDate) => {
    if (!isSemanal || !items?.length) return null
    const weeks = {}
    items.forEach(item => {
      const fecha = getDate(item).split('T')[0]
      const monday = getWeekMonday(fecha)
      if (!weeks[monday]) weeks[monday] = { fecha: monday, semanaLabel: getWeekLabel(monday), items: [] }
      weeks[monday].items.push(item)
    })
    return Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }
  if (activeTab.value === 'financiero') {
    const data = reporteFinanciero.value;
    if (!data || !data.resumenGeneral) {
      alert("No hay datos financieros para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen General
    const wsResumen = {}; let rIdx = 0;
    const greenFill = { patternType: "solid", fgColor: { rgb: "FFF0FDF4" } };
    const redFill = { patternType: "solid", fgColor: { rgb: "FFFEF2F2" } };
    const orangeFill = { patternType: "solid", fgColor: { rgb: "FFFFF7ED" } };
    const blueFill = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };

    const rg = data.resumenGeneral;
    const summaryRows = [
      { label: "Total Ingresos", value: `${Number(rg.totalIngresos || 0).toFixed(2)} Bs.`, fill: greenFill },
      { label: "Gastos Operativos", value: `${Number(rg.totalEgresosOperativos || 0).toFixed(2)} Bs.`, fill: redFill },
      { label: "Gastos Generales", value: `${Number(rg.totalGastosGenerales || 0).toFixed(2)} Bs.`, fill: orangeFill },
      { label: "Compras Central", value: `${Number(rg.totalComprasCentral || 0).toFixed(2)} Bs.`, fill: orangeFill },
      { label: "Ganancia Neta Final", value: `${Number(rg.gananciaNetaFinal || 0).toFixed(2)} Bs.`, fill: blueFill },
    ];

    wsResumen[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN GENERAL', s: { font: { bold: true, sz: 14 } } };
    XLSX.utils.sheet_add_aoa(wsResumen, [['', '']], { origin: { r: rIdx, c: 0 } });
    const mergesResumen = [{ s: { r: rIdx, c: 0 }, e: { r: rIdx, c: 1 } }];
    rIdx++;
    summaryRows.forEach(row => {
      wsResumen[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: row.label, s: { font: { bold: true }, fill: row.fill } };
      wsResumen[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = { t: 's', v: row.value, s: { font: { bold: true, sz: 12 }, fill: row.fill } };
      rIdx++;
    });
    rIdx++;
    wsResumen['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsResumen['!merges'] = mergesResumen;
    XLSX.utils.book_append_sheet(workbook, wsResumen, "Resumen");

    // Hoja 2: Sucursales
    const wsSuc = {}; rIdx = 0;
    const sucHeader = ["Sucursal", "Ingresos", "Egresos", "Utilidad"];
    sucHeader.forEach((h, c) => {
      wsSuc[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFF3F4F6" } } } };
    });
    rIdx++;
    (data.reportePorSucursal || []).forEach(suc => {
      const row = [
        suc.sucursal,
        Number(suc.ingresos?.totalGananciaBakery || 0),
        Number(suc.egresos?.totalGastos || 0),
        Number(suc.utilidadOperativa || 0)
      ];
      row.forEach((val, c) => {
        const cellRef = XLSX.utils.encode_cell({ r: rIdx, c });
        const cell = { v: val };
        if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; }
        else { cell.t = 's'; }
        wsSuc[cellRef] = cell;
      });
      rIdx++;
    });
    wsSuc['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 3 } });
    wsSuc['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, wsSuc, "Sucursales");

    // Hoja 3: Gastos Generales
    if (data.gastosGenerales && data.gastosGenerales.length > 0) {
      const wsGG = {}; rIdx = 0;
      const ggHeader = ["Nombre", "Fecha", "Costo (Bs.)"];
      ggHeader.forEach((h, c) => {
        wsGG[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFFFF7ED" } } } };
      });
      rIdx++;
      data.gastosGenerales.forEach(g => {
        const row = [g.nombre, formatFecha(g.fecha ? g.fecha.split('T')[0] : ''), Number(g.costo || 0)];
        row.forEach((val, c) => {
          const cellRef = XLSX.utils.encode_cell({ r: rIdx, c });
          const cell = { v: val };
          if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; }
          else { cell.t = 's'; }
          wsGG[cellRef] = cell;
        });
        rIdx++;
      });
      wsGG['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: ggHeader.length - 1 } });
      wsGG['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, wsGG, "Gastos Generales");
    }

    // Hoja 4: Evolución Diaria / Semanal
    if (data.evolucionDiaria && data.evolucionDiaria.length > 0) {
      if (isSemanal) {
        const weeks = groupByWeek(data.evolucionDiaria, d => d.fecha)
        if (weeks) {
          const wsEvol = {}; rIdx = 0;
          const evolHeader = ["Semana", "Ingresos", "Egresos", "Utilidad", "Venta Tienda", "Ganancia Panadería", "Comisiones", "Compras Insumos", "Gastos Op."];
          evolHeader.forEach((h, c) => {
            wsEvol[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFF3F4F6" } } } };
          });
          rIdx++;
          weeks.forEach(sem => {
            const totalIng = sem.items.reduce((s, d) => s + Number(d.ingresos?.totalIngresosBakery || 0), 0)
            const totalEgr = sem.items.reduce((s, d) => s + Number(d.egresos?.totalEgresos || 0), 0)
            const totalUti = sem.items.reduce((s, d) => s + Number(d.utilidadLimpiaDia || 0), 0)
            const totalTienda = sem.items.reduce((s, d) => s + Number(d.ingresos?.gananciaVentaTienda || 0), 0)
            const totalPan = sem.items.reduce((s, d) => s + Number(d.ingresos?.gananciaPanaderiaAmbulantes || 0), 0)
            const totalCom = sem.items.reduce((s, d) => s + Number(d.ingresos?.comisionesPagadasAEmpleados || 0), 0)
            const totalIns = sem.items.reduce((s, d) => s + Number(d.egresos?.comprasInsumos || 0), 0)
            const totalGast = sem.items.reduce((s, d) => s + Number(d.egresos?.gastosOperativos || 0), 0)
            const row = [sem.semanaLabel, totalIng, totalEgr, totalUti, totalTienda, totalPan, totalCom, totalIns, totalGast]
            row.forEach((val, c) => {
              const cellRef = XLSX.utils.encode_cell({ r: rIdx, c });
              const cell = { v: val };
              if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; }
              else { cell.t = 's'; }
              wsEvol[cellRef] = cell;
            });
            rIdx++;
          });
          wsEvol['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: evolHeader.length - 1 } });
          wsEvol['!cols'] = [{ wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(workbook, wsEvol, "Evolución Semanal");
        }
      } else {
        const wsEvol = {}; rIdx = 0;
        const evolHeader = ["Fecha", "Ingresos", "Egresos", "Utilidad", "Venta Tienda", "Ganancia Panadería", "Comisiones", "Compras Insumos", "Gastos Op."];
        evolHeader.forEach((h, c) => {
          wsEvol[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFF3F4F6" } } } };
        });
        rIdx++;
        [...data.evolucionDiaria].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).forEach(dia => {
          const row = [
            formatFecha(dia.fecha),
            Number(dia.ingresos?.totalIngresosBakery || 0),
            Number(dia.egresos?.totalEgresos || 0),
            Number(dia.utilidadLimpiaDia || 0),
            Number(dia.ingresos?.gananciaVentaTienda || 0),
            Number(dia.ingresos?.gananciaPanaderiaAmbulantes || 0),
            Number(dia.ingresos?.comisionesPagadasAEmpleados || 0),
            Number(dia.egresos?.comprasInsumos || 0),
            Number(dia.egresos?.gastosOperativos || 0)
          ];
          row.forEach((val, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rIdx, c });
            const cell = { v: val };
            if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; }
            else { cell.t = 's'; }
            wsEvol[cellRef] = cell;
          });
          rIdx++;
        });
        wsEvol['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: evolHeader.length - 1 } });
        wsEvol['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, wsEvol, "Evolución Diaria");
      }
    }

    // Hoja: Datos de Gráficas
    if (data.evolucionDiaria?.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Evolución', data.evolucionDiaria.map(d => formatFecha(d.fecha)), [
        { label: 'Ingresos (Bs.)', data: data.evolucionDiaria.map(d => Number(d.ingresos?.totalIngresosBakery || 0)) },
        { label: 'Egresos (Bs.)', data: data.evolucionDiaria.map(d => Number(d.egresos?.totalEgresos || 0)) },
        { label: 'Utilidad (Bs.)', data: data.evolucionDiaria.map(d => Number(d.utilidadLimpiaDia || 0)) }
      ]);
    }
    if (data.reportePorSucursal?.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Sucursales', data.reportePorSucursal.map(s => s.sucursal), [
        { label: 'Utilidad Operativa (Bs.)', data: data.reportePorSucursal.map(s => Number(s.utilidadOperativa || 0)) }
      ]);
    }

    XLSX.writeFile(workbook, `reporte_financiero${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'ventas') {
    if (!sortedVentas.value || sortedVentas.value.length === 0) {
      alert("No hay datos de ventas para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const cons = ventasConsolidada.value;

    // Sheet 1: Resumen
    const wsRes = {}; let rIdx = 0;
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };
    wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN DE VENTAS', s: { font: { bold: true, sz: 14 } } };
    rIdx++;
    const totalVendido = cons?.ventasPorPeriodo?.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 0;
    [
      ['Total Ventas', totalVendido],
      ['Productos Vendidos', indicadores.value.productosVendidos],
      ['Clientes Atendidos', indicadores.value.clientes],
      ['Ventas Anuladas', indicadores.value.ventasAnuladas],
    ].forEach(row => {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: String(row[0]), s: { font: { bold: true } } };
      const cell = { v: row[1] };
      if (typeof row[1] === 'number') cell.t = 'n';
      else cell.t = 's';
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = cell;
      rIdx++;
    });
    if (indicadores.value.topCliente) {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'Top Cliente', s: { font: { bold: true } } };
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = { t: 's', v: `${indicadores.value.topCliente.nombre} - ${Number(indicadores.value.topCliente.total).toFixed(2)} Bs.` };
      rIdx++;
    }
    if (indicadores.value.topVendedor) {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'Top Vendedor', s: { font: { bold: true } } };
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = { t: 's', v: `${indicadores.value.topVendedor.nombre} - ${Number(indicadores.value.topVendedor.total).toFixed(2)} Bs.` };
      rIdx++;
    }
    wsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsRes['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, wsRes, "Resumen");

    // Sheet 2: Ventas por Sucursal
    if (cons?.ventasPorSucursal?.length > 0) {
      const wsSuc = {}; rIdx = 0;
      ['Sucursal', 'Cant. Ventas', 'Total (Bs.)', 'Participación'].forEach((h, c) => {
        wsSuc[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      cons.ventasPorSucursal.forEach(s => {
        [s.nombre, s.cant_ventas, Number(s.total), Number(s.participacion)].forEach((val, c) => {
          const cell = { v: val };
          if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
          wsSuc[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
        });
        rIdx++;
      });
      wsSuc['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 3 } });
      wsSuc['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, wsSuc, "Sucursales");
    }

    // Sheet 3: Métodos de Pago
    if (cons?.metodosPago?.length > 0) {
      const wsMP = {}; rIdx = 0;
      ['Método', 'Transacciones', 'Total (Bs.)'].forEach((h, c) => {
        wsMP[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      cons.metodosPago.forEach(m => {
        [m.nombre, m.cantidad, Number(m.total)].forEach((val, c) => {
          const cell = { v: val };
          if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
          wsMP[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
        });
        rIdx++;
      });
      wsMP['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 2 } });
      wsMP['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(workbook, wsMP, "Métodos Pago");
    }

    // Sheet 4: Productos con Variantes
    if (cons?.productosTop?.length > 0) {
      const wsProd = {}; rIdx = 0;
      const prodHeader = ['Producto', 'Variante', 'Contenido', 'Cant. Vendida', 'Total Cant.', 'Subtotal Ingresos'];
      prodHeader.forEach((h, c) => {
        wsProd[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      cons.productosTop.forEach(p => {
        (p.presentaciones || []).forEach(pres => {
          const row = [p.nombre, pres.presentacion, `${pres.unidades_por_presentacion} und.`, pres.cantidad_vendida, pres.cantidad_vendida * pres.unidades_por_presentacion, Number(pres.subtotal_ingresos)];
          row.forEach((val, c) => {
            const cell = { v: val };
            if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
            wsProd[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
          });
          rIdx++;
        });
        if (!p.presentaciones || p.presentaciones.length === 0) {
          const row = [p.nombre, '-', '-', p.total_unidades_vendidas, p.total_unidades_vendidas, Number(p.ingresos_totales)];
          row.forEach((val, c) => {
            const cell = { v: val };
            if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
            wsProd[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
          });
          rIdx++;
        }
      });
      wsProd['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: prodHeader.length - 1 } });
      wsProd['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(workbook, wsProd, "Productos");
    }

    // Sheet 5: Promociones
    if (cons?.promocionesTop?.length > 0) {
      const wsPromo = {}; rIdx = 0;
      const promoHeader = ['Promoción', 'Vendidas', 'Total (Bs.)', 'Producto', 'Presentación', 'Cant. x Promo', 'Total Unidades'];
      promoHeader.forEach((h, c) => {
        wsPromo[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      cons.promocionesTop.forEach(promo => {
        (promo.detalle_productos || []).forEach((det, idx) => {
          const row = [
            idx === 0 ? promo.nombre : '',
            idx === 0 ? promo.cantidad : '',
            idx === 0 ? Number(promo.total) : '',
            det.producto,
            det.presentacion,
            det.cantidad_por_promo,
            det.total_unidades
          ];
          row.forEach((val, c) => {
            const cell = { v: val };
            if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
            wsPromo[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
          });
          rIdx++;
        });
      });
      wsPromo['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: promoHeader.length - 1 } });
      wsPromo['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, wsPromo, "Promociones");
    }

    // Sheet 6: Detalle
    const ws = {};
    const merges = [];
    let rowIndex = 0;
    const header = ["Cliente", "Producto", "Cantidad", "Precio Unitario (Bs.)", "Subtotal (Bs.)", "Estado", "Factura"];
    header.forEach((h, c) => { const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c }); ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } }; });
    rowIndex++;
    sortedVentas.value.forEach(dateGroup => {
      if (dateGroup.ventas.length > 0) {
        const dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[dateHeaderCellRef] = { t: 's', v: `${isSemanal ? 'Semana' : 'Fecha'}: ${fmtPeriodo(dateGroup)} - ${isSemanal ? 'Total de la Semana' : 'Total del Día'}: ${dateGroup.totalIngreso.toFixed(2)} Bs.`, s: { fill: { patternType: "solid", fgColor: { rgb: "FFE5E7EB" } }, font: { bold: true }, alignment: { horizontal: "center" } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;
        dateGroup.ventas.forEach(venta => {
          const row = [ venta.cliente, venta.producto, venta.cantidad, parseFloat(venta.precio), parseFloat(venta.subtotal), venta.estado, venta.hasFactura ? venta.nroFactura : 'S/F' ];
          if (venta.isFirstInSale && venta.clientRowspan > 1) { merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex + venta.clientRowspan - 1, c: 0 } }); }
          row.forEach((val, c) => { const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c }); const cell = { v: val }; if (typeof val === 'number') { cell.t = 'n'; } else { cell.t = 's'; } ws[cellRef] = cell; });
          rowIndex++;
        });
      }
    });
    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex - 1, c: header.length - 1 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!merges'] = merges;
    ws['!cols'] = [ { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 } ];
    XLSX.utils.book_append_sheet(workbook, ws, "Detalle");

    // Hoja: Datos de Gráficas
    const consV = ventasConsolidada.value;
    if (sortedVentas.value?.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Ventas', sortedVentas.value.map(g => agruparPorSemana.value ? g.semanaLabel || g.fecha : formatFecha(g.fecha)), [
        { label: 'Total Ingreso (Bs.)', data: sortedVentas.value.map(g => Number(g.totalIngreso || 0)) }
      ]);
    }
    if (consV?.ventasPorSucursal?.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Sucursales', consV.ventasPorSucursal.map(s => s.nombre), [
        { label: 'Total Ventas (Bs.)', data: consV.ventasPorSucursal.map(s => Number(s.total || 0)) }
      ]);
    }

    XLSX.writeFile(workbook, `reporte_ventas${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'pedidos') {
    if (!processedPedidosGrouped.value || processedPedidosGrouped.value.length === 0) {
      alert("No hay datos de pedidos para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const cons = pedidosConsolidado.value;
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };

    // Sheet 1: Resumen
    const wsRes = {}; let rIdx = 0;
    wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN DE PEDIDOS', s: { font: { bold: true, sz: 14 } } };
    rIdx++;
    const totalPedidos = cons?.pedidosPorPeriodo?.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 0;
    [
      ['Total Pedidos (Bs.)', totalPedidos],
      ['Productos Pedidos', indicadores.value.productosVendidos],
      ['Clientes', indicadores.value.clientes],
      ['Anulados', indicadores.value.ventasAnuladas],
    ].forEach(row => {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: String(row[0]), s: { font: { bold: true } } };
      const cell = { v: row[1] };
      if (typeof row[1] === 'number') cell.t = 'n';
      else cell.t = 's';
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = cell;
      rIdx++;
    });
    wsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsRes['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, wsRes, "Resumen");

    // Sheet 2: Por Sucursal
    if (cons?.pedidosPorSucursal?.length > 0) {
      const wsSuc = {}; rIdx = 0;
      ['Sucursal', 'Cantidad', 'Total (Bs.)'].forEach((h, c) => {
        wsSuc[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      cons.pedidosPorSucursal.forEach(s => {
        [s.nombre, s.cant_pedidos, Number(s.total)].forEach((val, c) => {
          const cell = { v: val }; if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
          wsSuc[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
        });
        rIdx++;
      });
      wsSuc['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 2 } });
      wsSuc['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, wsSuc, "Sucursales");
    }

    // Sheet 3: Tipos de Pedido
    if (cons?.pedidosPorTipo?.length > 0) {
      const wsTipo = {}; rIdx = 0;
      ['Tipo', 'Cantidad', 'Monto Total'].forEach((h, c) => {
        wsTipo[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      cons.pedidosPorTipo.forEach(s => {
        [s.nombre, s.cant_pedidos, Number(s.total)].forEach((val, c) => {
          const cell = { v: val }; if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
          wsTipo[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
        });
        rIdx++;
      });
      wsTipo['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 2 } });
      wsTipo['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, wsTipo, "Tipos");
    }

    // Sheet 4: Productos Top
    if (cons?.productosTop?.length > 0) {
      const wsProd = {}; rIdx = 0;
      ['Producto', 'Unidades', 'Ingresos'].forEach((h, c) => {
        wsProd[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      cons.productosTop.forEach(p => {
        [p.nombre, Number(p.total_unidades_vendidas), Number(p.ingresos_totales)].forEach((val, c) => {
          const cell = { v: val }; if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
          wsProd[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
        });
        rIdx++;
      });
      wsProd['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 2 } });
      wsProd['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, wsProd, "Productos");
    }

    // Sheet 5: Detalle
    const ws = {};
    const merges = [];
    let rowIndex = 0;
    const header = ["ID", "Hora", "Cliente", "Sucursal", "Ítem", "Presentación", "Cantidad", "Precio Unit. (Bs.)", "Subtotal (Bs.)", "Total (Bs.)", "Adelanto (Bs.)", "Saldo (Bs.)", "Estado"];
    header.forEach((h, c) => { const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c }); ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } }; });
    rowIndex++;
    processedPedidosGrouped.value.forEach(dateGroup => {
      if (dateGroup.pedidos.length > 0) {
        const dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[dateHeaderCellRef] = { t: 's', v: `${isSemanal ? 'Semana' : 'Fecha'}: ${fmtPeriodo(dateGroup)} - Total Pedidos: ${dateGroup.totalPedidos}`, s: { fill: { patternType: "solid", fgColor: { rgb: "FFE5E7EB" } }, font: { bold: true }, alignment: { horizontal: "center" } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;
        dateGroup.pedidos.forEach(p => {
          const row = [ p.idpedido, p.hora, p.cliente, p.sucursal, p.productoNombre, p.presentacion, p.productoCantidad, p.precio, p.subtotal, p.total, p.adelanto, p.saldo, p.estado_nombre ];
          if (p.isFirstInPedido && p.pedidoRowspan > 1) {
            [0, 1, 2, 3, 9, 10, 11, 12].forEach(colIdx => {
               merges.push({ s: { r: rowIndex, c: colIdx }, e: { r: rowIndex + p.pedidoRowspan - 1, c: colIdx } });
            });
          }
          row.forEach((val, c) => { const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c }); const cell = { v: val }; if (typeof val === 'number') { cell.t = 'n'; } else { cell.t = 's'; } ws[cellRef] = cell; });
          rowIndex++;
        });
      }
    });
    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex - 1, c: header.length - 1 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!merges'] = merges;
    ws['!cols'] = [ { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 } ];
    XLSX.utils.book_append_sheet(workbook, ws, "Detalle");

    // Hoja: Datos de Gráficas
    const consP = pedidosConsolidado.value;
    if (processedPedidosGrouped.value?.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Pedidos', processedPedidosGrouped.value.map(g => agruparPorSemana.value ? g.semanaLabel || g.fecha : formatFecha(g.fecha)), [
        { label: 'Total Pedidos (Bs.)', data: processedPedidosGrouped.value.map(g => Number(g.totalPedidos || 0)) }
      ]);
    }
    if (consP?.pedidosPorSucursal?.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Sucursales', consP.pedidosPorSucursal.map(s => s.nombre), [
        { label: 'Total (Bs.)', data: consP.pedidosPorSucursal.map(s => Number(s.total || 0)) }
      ]);
    }

    XLSX.writeFile(workbook, `reporte_pedidos${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'transferencias') {
    if (!processedTransferencias.value || processedTransferencias.value.length === 0) {
      alert("No hay datos de transferencias para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };
    const consData = transferenciasConsolidada.value?.data || [];

    // Sheet 1: Resumen
    const wsRes = {}; let rIdx = 0;
    wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN DE TRANSFERENCIAS', s: { font: { bold: true, sz: 14 } } };
    rIdx++;
    const totalMonto = consData.reduce((sum, item) => sum + parseFloat(item.monto_total || 0), 0);
    const totalComisiones = consData.reduce((sum, item) => sum + parseFloat(item.comisiones_totales || 0), 0);
    [
      ['Total Monto Transferido', totalMonto],
      ['Total Comisiones', totalComisiones],
      ['Cantidad de Transferencias', consData.length],
    ].forEach(row => {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: String(row[0]), s: { font: { bold: true } } };
      const cell = { v: row[1] }; if (typeof row[1] === 'number') cell.t = 'n'; else cell.t = 's';
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = cell;
      rIdx++;
    });
    wsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsRes['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, wsRes, "Resumen");

    // Sheet 2: Consolidado
    if (consData.length > 0) {
      const wsCons = {}; rIdx = 0;
      ['Origen', 'Destino', 'Tipo', 'Nro Transf.', 'Monto Total', 'Comisiones'].forEach((h, c) => {
        wsCons[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      consData.forEach(item => {
        [item.origen, item.destino, item.tipo, item.nro_transferencias || 0, Number(item.monto_total || 0), Number(item.comisiones_totales || 0)].forEach((val, c) => {
          const cell = { v: val }; if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
          wsCons[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
        });
        rIdx++;
      });
      wsCons['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 5 } });
      wsCons['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(workbook, wsCons, "Consolidado");
    }

    // Sheet 3: Detalle
    const ws = {};
    const merges = [];
    let rowIndex = 0;
    const header = ["Fecha", "ID", "Hora", "Origen", "Destino", "Item", "Tipo", "Presentación", "Cantidad Transferida", "Estado"];
    header.forEach((h, c) => { const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c }); ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } }; });
    rowIndex++;
    processedTransferencias.value.forEach(group => {
      const groupStartRow = rowIndex;
      group.transferencias.forEach(trans => {
        trans.detalles.forEach((item, idx) => {
          const row = [
            idx === 0 ? fmtPeriodo(group) : '',
            idx === 0 ? trans.idtransferencia : '',
            idx === 0 ? trans.hora : '',
            idx === 0 ? trans.origen : '',
            idx === 0 ? trans.destino : '',
            item.nombre,
            item.tipo,
            item.presentacion || '-',
            item.cantidad,
            idx === 0 ? (trans.estado === 1 ? 'Activo' : 'Anulado') : ''
          ];
          row.forEach((val, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            const cell = { v: val };
            if (typeof val === 'number') cell.t = 'n';
            else cell.t = 's';
            ws[cellRef] = cell;
          });
          rowIndex++;
        });
      });
    });
    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex - 1, c: header.length - 1 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!cols'] = [ { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 } ];
    XLSX.utils.book_append_sheet(workbook, ws, "Detalle");

    // Sheet 4: Sucursales
    const sucMap = {};
    processedTransferencias.value.forEach(group => {
      group.transferencias.forEach(trans => {
        if (!sucMap[trans.origen]) sucMap[trans.origen] = 0;
        trans.detalles.forEach(item => { sucMap[trans.origen] += Number(item.cantidad) || 0; });
      });
    });
    const sucRows = Object.entries(sucMap).sort((a, b) => b[1] - a[1]);
    if (sucRows.length > 0) {
      const wsSuc = {}; let sr = 0;
      ['Sucursal', 'Cantidad Transferida'].forEach((h, c) => {
        wsSuc[XLSX.utils.encode_cell({ r: sr, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
      });
      sr++;
      sucRows.forEach(([suc, qty]) => {
        wsSuc[XLSX.utils.encode_cell({ r: sr, c: 0 })] = { t: 's', v: suc };
        wsSuc[XLSX.utils.encode_cell({ r: sr, c: 1 })] = { t: 'n', v: qty };
        sr++;
      });
      wsSuc['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sr - 1, c: 1 } });
      wsSuc['!cols'] = [{ wch: 30 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(workbook, wsSuc, "Sucursales");
    }

    // Hoja: Datos de Gráficas
    const consT = transferenciasConsolidada.value?.data || [];
    if (consT.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Transferencias', consT.map(i => `${i.origen} → ${i.destino}`), [
        { label: 'Monto Total (Bs.)', data: consT.map(i => Number(i.monto_total || 0)) }
      ]);
    }

    XLSX.writeFile(workbook, `reporte_transferencias${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'compras') {
    if (!comprasDetallada.value || comprasDetallada.value.length === 0) {
      alert("No hay datos de compras para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };
    const cons = comprasConsolidada.value;

    // Sheet 1: Resumen
    const wsRes = {}; let rIdx = 0;
    wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN DE COMPRAS', s: { font: { bold: true, sz: 14 } } };
    rIdx++;
    const totalGasto = cons?.total_gastos || cons?.detalle?.reduce((sum, p) => sum + parseFloat(p.total_proveedor || 0), 0) || 0;
    [
      ['Total Invertido', Number(totalGasto)],
      ['Proveedores', cons?.detalle?.length || 0],
      ['Compras Realizadas', comprasDetallada.value.length],
    ].forEach(row => {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: String(row[0]), s: { font: { bold: true } } };
      const cell = { v: row[1] }; if (typeof row[1] === 'number') cell.t = 'n'; else cell.t = 's';
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = cell;
      rIdx++;
    });
    wsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsRes['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, wsRes, "Resumen");

    // Sheet 2: Consolidado por Proveedor
    if (cons?.detalle?.length > 0) {
      const insumosUnicos = [];
      const insumoSet = new Set();
      cons.detalle.forEach(prov => {
        if (prov.insumos) prov.insumos.forEach(i => { if (!insumoSet.has(i.insumo)) { insumoSet.add(i.insumo); insumosUnicos.push(i.insumo); } });
      });
      const wsCons = {}; rIdx = 0;
      const consHeader = ['Proveedor', ...insumosUnicos, 'Total Invertido'];
      consHeader.forEach((h, c) => {
        wsCons[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: String(h), s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      cons.detalle.forEach(prov => {
        const insumoMap = {};
        (prov.insumos || []).forEach(i => { insumoMap[i.insumo] = Number(i.cantidad || 0); });
        const row = [prov.proveedor, ...insumosUnicos.map(ins => insumoMap[ins] || ''), Number(prov.total_proveedor)];
        row.forEach((val, c) => {
          const cell = { v: val }; if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
          wsCons[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
        });
        rIdx++;
      });
      wsCons['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: consHeader.length - 1 } });
      wsCons['!cols'] = consHeader.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(workbook, wsCons, "Consolidado");
    }

    // Sheet 3: Detalle
    const ws = {};
    const merges = [];
    let rowIndex = 0;
    const header = ["Fecha", "ID Compra", "Proveedor", "Insumo", "Cantidad", "Unidad", "Precio Unit. (Bs.)", "Subtotal (Bs.)", "Total Compra (Bs.)"];
    header.forEach((h, c) => { 
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c }); 
      ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } }; 
    });
    rowIndex++;
    comprasDetallada.value.forEach(compra => {
      const rowCount = compra.detalles.length;
      compra.detalles.forEach((det, idx) => {
        const row = [
          idx === 0 ? formatFecha(compra.fecha.split('T')[0]) : '',
          idx === 0 ? compra.idcompra : '',
          idx === 0 ? compra.proveedor : '',
          det.insumo,
          det.cantidad,
          det.medida,
          parseFloat(det.precio_unitario),
          parseFloat(det.precio_total),
          idx === 0 ? parseFloat(compra.total_compra) : ''
        ];
        if (idx === 0 && rowCount > 1) {
          [0, 1, 2, 8].forEach(colIdx => {
            merges.push({ s: { r: rowIndex, c: colIdx }, e: { r: rowIndex + rowCount - 1, c: colIdx } });
          });
        }
        row.forEach((val, c) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
          const cell = { v: val };
          if (typeof val === 'number') cell.t = 'n';
          else cell.t = 's';
          ws[cellRef] = cell;
        });
        rowIndex++;
      });
    });
    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex - 1, c: header.length - 1 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!merges'] = merges;
    ws['!cols'] = [ { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 } ];
    XLSX.utils.book_append_sheet(workbook, ws, "Detalle");

    // Hoja: Datos de Gráficas
    const consC = comprasConsolidada.value;
    if (consC?.detalle?.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Proveedores', consC.detalle.map(p => p.proveedor), [
        { label: 'Total Invertido (Bs.)', data: consC.detalle.map(p => Number(p.total_proveedor || 0)) }
      ]);
      const insumoTotals = {};
      consC.detalle.forEach(prov => (prov.insumos || []).forEach(i => { insumoTotals[i.insumo] = (insumoTotals[i.insumo] || 0) + Number(i.cantidad || 0); }));
      const insumoData = Object.entries(insumoTotals);
      if (insumoData.length) {
        addChartDataToWorkbook(workbook, 'Gráfica Insumos', insumoData.map(([k]) => k), [
          { label: 'Cantidad Total', data: insumoData.map(([, v]) => v) }
        ]);
      }
    }

    XLSX.writeFile(workbook, `reporte_compras${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'produccion') {
    if (!reporteProduccionConsolidada.value || reporteProduccionConsolidada.value.length === 0) {
      alert("No hay datos de producción para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };
    const cons = reporteProduccionConsolidada.value;
    const sucursalesRaw = cons?.sucursales || [];

    // Sheet 1: Consolidado por Sucursal
    if (sucursalesRaw.length > 0) {
      const productosUnicos = [];
      const prodSet = new Set();
      sucursalesRaw.forEach(suc => {
        if (suc.productos) suc.productos.forEach(p => { if (!prodSet.has(p.producto)) { prodSet.add(p.producto); productosUnicos.push({ id: p.idproducto, nombre: p.producto }); } });
      });

      const wsConsRes = {}; let rIdx = 0;
      const consHeader = ['Sucursal', ...productosUnicos.map(p => p.nombre), 'Total'];
      consHeader.forEach((h, c) => {
        wsConsRes[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: String(h), s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      sucursalesRaw.forEach(suc => {
        const prodMap = {};
        (suc.productos || []).forEach(p => { prodMap[p.producto] = Number(p.total_producto || 0); });
        const row = [suc.sucursal, ...productosUnicos.map(p => prodMap[p.nombre] || ''), Number(suc.total_sucursal)];
        row.forEach((val, c) => {
          const cell = { v: val }; if (typeof val === 'number') cell.t = 'n'; else cell.t = 's';
          wsConsRes[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
        });
        rIdx++;
      });
      wsConsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: consHeader.length - 1 } });
      wsConsRes['!cols'] = consHeader.map(() => ({ wch: 18 }));
      XLSX.utils.book_append_sheet(workbook, wsConsRes, "Consolidado");
    }

    // Sheet 2: Insumos Consumidos por Sucursal
    if (sucursalesRaw.length > 0) {
      const insumosUnicos = [];
      const insumoSet = new Set();
      sucursalesRaw.forEach(suc => {
        if (suc.insumos) suc.insumos.forEach(i => { if (!insumoSet.has(i.insumo_nombre)) { insumoSet.add(i.insumo_nombre); insumosUnicos.push(i.insumo_nombre); } });
      });
      if (insumosUnicos.length > 0) {
        const wsIns = {}; rIdx = 0;
        const insHeader = ['Sucursal', ...insumosUnicos];
        insHeader.forEach((h, c) => {
          wsIns[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: String(h), s: { font: { bold: true }, fill: blueBg } };
        });
        rIdx++;
        sucursalesRaw.forEach(suc => {
          const insMap = {};
          (suc.insumos || []).forEach(i => { insMap[i.insumo_nombre] = `${i.cantidad_total} ${i.unidad || ''}`; });
          const row = [suc.sucursal, ...insumosUnicos.map(ins => insMap[ins] || '')];
          row.forEach((val, c) => {
            const cell = { v: val }; if (typeof val === 'number') cell.t = 'n'; else cell.t = 's';
            wsIns[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
          });
          rIdx++;
        });
        wsIns['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: insHeader.length - 1 } });
        wsIns['!cols'] = insHeader.map(() => ({ wch: 20 }));
        XLSX.utils.book_append_sheet(workbook, wsIns, "Insumos");
      }
    }

    // Sheet 3: Detalle
    if (reporteProduccionDetallada.value?.producciones?.length > 0) {
      const detailedData = [];
      reporteProduccionDetallada.value.producciones.forEach(prod => {
        prod.DetalleLotes.forEach(lote => {
          detailedData.push({
            Fecha: formatFecha(prod.fechaproduccion.split('T')[0]),
            ID: prod.idproduccion,
            Sucursal: prod.sucursal_nombre,
            Empleado: lote.empleado_completo,
            Producto: lote.producto_nombre,
            Cantidad: lote.cantidad,
            'Cant. Mala': lote.cantidad_mala || 0,
            Motivo: lote.motivo_mala || '-',
            'Hora Prod.': lote.hora || '-',
            Horno: lote.horno_nombre || '-',
            'Costo Unit. (Bs.)': parseFloat(lote.costo_unitario || 0),
            'Subtotal (Bs.)': (lote.cantidad * (lote.costo_unitario || 0)),
            'Costo Insumos (Bs.)': parseFloat(prod.COSTO_INSUMOS || 0),
            'Costo M.O. (Bs.)': parseFloat(prod.COSTO_MANO_OBRA || 0),
            'Costo Indirecto (Bs.)': parseFloat(prod.COSTO_INDIRECTO || 0),
            'Costo TOTAL (Bs.)': parseFloat(prod.COSTO_TOTAL || 0),
            'Consumo Insumos': prod.CONSUMO_TOTAL_PRODUCCION?.map(c => `${c.insumo_unidad}: ${c.cantidad}`).join(', ') || ''
          });
        });
      });
      const wsDet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(workbook, wsDet, "Detalle");
    }

    // Hoja: Datos de Gráficas
    const consPr = reporteProduccionConsolidada.value;
    const sucursalesRawPr = consPr?.sucursales || [];
    if (sucursalesRawPr.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Sucursales', sucursalesRawPr.map(s => s.sucursal), [
        { label: 'Total Producido', data: sucursalesRawPr.map(s => Number(s.total_sucursal || 0)) }
      ]);
      const prodTotalsPr = {};
      sucursalesRawPr.forEach(suc => (suc.productos || []).forEach(p => { prodTotalsPr[p.producto] = (prodTotalsPr[p.producto] || 0) + Number(p.total_producto || 0); }));
      const prodDataPr = Object.entries(prodTotalsPr);
      if (prodDataPr.length) {
        addChartDataToWorkbook(workbook, 'Gráfica Productos', prodDataPr.map(([k]) => k), [
          { label: 'Total Producido', data: prodDataPr.map(([, v]) => v) }
        ]);
      }
    }

    XLSX.writeFile(workbook, `reporte_produccion${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'comision') {
    if (!comisionDetallada.value?.reporte?.length && !comisionConsolidada.value?.reporte?.length) {
      alert("No hay datos de comisiones para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };

    // Sheet 1: Resumen
    const wsRes = {}; let rIdx = 0;
    wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN COMISIONES', s: { font: { bold: true, sz: 14 } } };
    rIdx++;
    const totals = comisionConsolidada.value?.totalesGlobales || {};
    [
      ['Comisión Empleados', Number(totals.total_comision_empleados || 0)],
      ['Ganancia Panadería', Number(totals.total_ganancia_panaderia || 0)],
    ].forEach(row => {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: String(row[0]), s: { font: { bold: true } } };
      const cell = { v: row[1] }; if (typeof row[1] === 'number') cell.t = 'n'; else cell.t = 's';
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = cell;
      rIdx++;
    });
    wsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsRes['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, wsRes, "Resumen");

    // Sheet 2: Consolidado
    if (comisionConsolidada.value?.reporte?.length) {
      const consolidado = comisionConsolidada.value;
      const productosUnicos = [];
      const prodSet = new Set();
      consolidado.reporte.forEach(group => {
        group.empleados?.forEach(emp => {
          emp.productos?.forEach(p => {
            if (!prodSet.has(p.producto)) { prodSet.add(p.producto); productosUnicos.push(p.producto); }
          });
        });
      });

      const wsCons = {}; rIdx = 0;
      const consHeader = ['Empleado', ...productosUnicos, 'Total Comisión', 'Líq. Panadería'];
      consHeader.forEach((h, c) => {
        wsCons[XLSX.utils.encode_cell({ r: rIdx, c })] = { t: 's', v: String(h), s: { font: { bold: true }, fill: blueBg } };
      });
      rIdx++;
      consolidado.reporte.forEach(group => {
        group.empleados?.forEach(emp => {
          const prodMap = {};
          emp.productos?.forEach(p => { prodMap[p.producto] = Number(p.cantidad_total || 0); });
          const row = [emp.empleado, ...productosUnicos.map(p => prodMap[p] || ''), Number(emp.total_comision), Number(emp.total_liquido_panaderia)];
          row.forEach((val, c) => {
            const cell = { v: val }; if (typeof val === 'number') { cell.t = 'n'; cell.z = '#,##0.00'; } else cell.t = 's';
            wsCons[XLSX.utils.encode_cell({ r: rIdx, c })] = cell;
          });
          rIdx++;
        });
      });
      wsCons['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: consHeader.length - 1 } });
      wsCons['!cols'] = consHeader.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(workbook, wsCons, "Consolidado");
    }

    // Sheet 3: Detalle
    if (comisionDetallada.value?.reporte?.length) {
      const detailedData = [];
      comisionDetallada.value.reporte.forEach(group => {
        group.controles.forEach(control => {
          control.detalles.forEach(det => {
            detailedData.push({
              Fecha: formatFecha(group.fecha),
              Empleado: control.empleado,
              Sucursal: control.sucursal,
              Producto: det.producto,
              Presentación: det.presentacion,
              Entregado: Number(det.cantidad_entregada || 0),
              Devuelto: Number(det.cantidad_devuelta || 0),
              Ajustado: Number(det.cantidadajustada ?? det.cantidad_ajustada ?? 0),
              Vendido: Number(det.cantidad_vendida || 0),
              'Precio Venta (Bs.)': Number(det.precio_venta || 0),
              'Comisión Unitaria (Bs.)': Number(det.comision_unitaria || 0),
              'Comisión Total (Bs.)': Number(det.comision_total || 0),
              'Líquido Panadería (Bs.)': Number(det.liquido_panaderia || 0)
            });
          });
        });
      });
      const wsDet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(workbook, wsDet, "Detalle");
    }

    // Hoja: Datos de Gráficas
    const consCo = comisionConsolidada.value;
    if (consCo?.reporte?.length) {
      const empRows = [];
      consCo.reporte.forEach(g => (g.empleados || []).forEach(emp => { empRows.push({ empleado: emp.empleado, comision: Number(emp.total_comision || 0), liquido: Number(emp.total_liquido_panaderia || 0) }); }));
      if (empRows.length) {
        addChartDataToWorkbook(workbook, 'Gráfica Comisiones', empRows.map(e => e.empleado), [
          { label: 'Comisión (Bs.)', data: empRows.map(e => e.comision) },
          { label: 'Líq. Panadería (Bs.)', data: empRows.map(e => e.liquido) }
        ]);
      }
    }

    XLSX.writeFile(workbook, `reporte_comisiones${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'inventario') {
    const data = reporteInventario.value;
    if (!data || !data.sucursales) {
      alert("No hay datos de inventario para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };
    const tg = data.totalesGlobales || data.resumen || {};

    // Sheet 1: Resumen
    const wsRes = {}; let rIdx = 0;
    wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN INVENTARIO', s: { font: { bold: true, sz: 14 } } };
    rIdx++;
    [
      ['Total Items', tg.totalItems || 0],
      ['Agotados', tg.itemsAgotados || 0],
      ['Stock Bajo', tg.itemsStockBajo || 0],
    ].forEach(row => {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: String(row[0]), s: { font: { bold: true } } };
      const cell = { v: row[1] }; if (typeof row[1] === 'number') cell.t = 'n'; else cell.t = 's';
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = cell;
      rIdx++;
    });
    wsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsRes['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, wsRes, "Resumen");

    // Sheet 2: Detalle por Sucursal
    const ws = {}; let rowIndex = 0;
    const header = ["Sucursal", "Item", "Tipo", "Unidad", "Stock", "Costo Unit. (Bs.)", "Estado"];
    header.forEach((h, c) => { ws[XLSX.utils.encode_cell({ r: rowIndex, c })] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } }; });
    rowIndex++;
    (data.sucursales || []).forEach(suc => {
      const items = [];
      (suc.insumos || []).forEach(i => items.push({ nombre: i.nombre, tipo: i.tipo_item, unidades: i.unidades, costo: i.costo_promedio, estado: i.estado }));
      (suc.productos || []).forEach(p => items.push({ nombre: p.nombre, tipo: p.tipo_item, unidades: p.unidades, costo: p.costo_promedio, estado: p.estado }));
      items.forEach(item => {
        (item.unidades || [{ unidad: 'Unidad', stock: 0 }]).forEach(u => {
          const row = [suc.sucursal, item.nombre, item.tipo, u.unidad, u.stock || 0, Number(item.costo || 0), item.estado === 0 ? 'Agotado' : item.estado === 1 ? 'Normal' : 'Stock Bajo'];
          row.forEach((val, c) => { const cell = { v: val }; if (typeof val === 'number') cell.t = 'n'; else cell.t = 's'; ws[XLSX.utils.encode_cell({ r: rowIndex, c })] = cell; });
          rowIndex++;
        });
      });
    });
    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex - 1, c: 6 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, ws, "Inventario");

    // Hoja: Datos de Gráficas
    if (data.sucursales?.length) {
      addChartDataToWorkbook(workbook, 'Gráfica Items x Sucursal', data.sucursales.map(s => s.sucursal), [
        { label: 'Total Items', data: data.sucursales.map(s => (s.insumos || []).length + (s.productos || []).length) }
      ]);
    }
    const tgInv = data.totalesGlobales || data.resumen || {};
    if (tgInv.totalItems) {
      const normal = tgInv.totalItems - (tgInv.itemsAgotados || 0) - (tgInv.itemsStockBajo || 0);
      addChartDataToWorkbook(workbook, 'Gráfica Estado Stock', ['Normal', 'Stock Bajo', 'Agotados'], [
        { label: 'Cantidad', data: [normal, tgInv.itemsStockBajo || 0, tgInv.itemsAgotados || 0] }
      ]);
    }

    XLSX.writeFile(workbook, `reporte_inventario${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'kardex') {
    const data = reporteKardex.value;
    if (!data || !data.metadatos) {
      alert("No hay datos de kardex para exportar a Excel.");
      return;
    }
    const movs = [];
    if (data.insumos) movs.push(...data.insumos);
    if (data.productos) movs.push(...data.productos);
    if (!movs.length) {
      alert("No hay movimientos de kardex para exportar.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };

    // Sheet 1: Resumen
    const wsRes = {}; let rIdx = 0;
    wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN KARDEX', s: { font: { bold: true, sz: 14 } } };
    rIdx++;
    const meta = data.metadatos;
    [
      ['Total Movimientos', meta.totalMovimientos || 0],
      ['Reporte', meta.reporte || ''],
      ['Periodo Desde', formatFecha(meta.filtros?.fechadesde)],
      ['Periodo Hasta', formatFecha(meta.filtros?.fechahasta)],
    ].forEach(row => {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: String(row[0]), s: { font: { bold: true } } };
      const cell = { v: row[1] }; if (typeof row[1] === 'number') cell.t = 'n'; else cell.t = 's';
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = cell;
      rIdx++;
    });
    wsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsRes['!cols'] = [{ wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, wsRes, "Resumen");

    // Sheet 2: Detalle
    const sorted = movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const detailedData = sorted.map(m => ({
      Fecha: formatFecha(m.fecha.split('T')[0]),
      Hora: new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      Item: m.item_nombre || m.nombre || '-',
      'Tipo Item': m.tipo_item || m.tipo || 'N/A',
      'Tipo Mov.': m.entrada > 0 ? 'Entrada' : m.salida > 0 ? 'Salida' : 'Ajuste',
      Sucursal: m.sucursal || '-',
      Entrada: m.entrada > 0 ? m.entrada : 0,
      Salida: m.salida > 0 ? m.salida : 0,
      Saldo: m.saldo || 0,
      'Costo Unit.': Number(m.costo_unitario || 0),
      'Costo Total': Number(m.costo_total || 0),
      Detalle: m.descripcion || m.detalle || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, ws, "Detalle");

    // Hoja: Datos de Gráficas
    if (movs.length) {
      const groupedK = {};
      movs.forEach(m => { const f = m.fecha.split('T')[0]; groupedK[f] = (groupedK[f] || 0) + 1; });
      const kRows = Object.entries(groupedK).sort((a, b) => new Date(a[0]) - new Date(b[0]));
      addChartDataToWorkbook(workbook, 'Gráfica Movimientos', kRows.map(([f]) => formatFecha(f)), [
        { label: 'Cant. Movimientos', data: kRows.map(([, c]) => c) }
      ]);
    }

    XLSX.writeFile(workbook, `reporte_kardex${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'gastos-generales') {
    const gastos = reporteGastosGenerales.value?.gastos || [];
    if (!gastos.length) {
      alert("No hay datos de gastos generales para exportar a Excel.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const blueBg = { patternType: "solid", fgColor: { rgb: "FFEFF6FF" } };

    // Sheet 1: Resumen
    const wsRes = {}; let rIdx = 0;
    wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: 'RESUMEN GASTOS GENERALES', s: { font: { bold: true, sz: 14 } } };
    rIdx++;
    const total = Number(reporteGastosGenerales.value?.totalGastos || 0);
    const cantidad = reporteGastosGenerales.value?.cantidad || 0;
    const promedio = cantidad > 0 ? total / cantidad : 0;
    [
      ['Total Gastos (Bs.)', total],
      ['Cantidad de Gastos', cantidad],
      ['Promedio por Gasto (Bs.)', promedio],
    ].forEach(row => {
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { t: 's', v: String(row[0]), s: { font: { bold: true } } };
      const cell = { v: row[1] }; if (typeof row[1] === 'number') cell.t = 'n'; else cell.t = 's';
      wsRes[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = cell;
      rIdx++;
    });
    wsRes['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 1 } });
    wsRes['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, wsRes, "Resumen");

    // Sheet 2: Detalle
    const ws = {}; let rowIndex = 0;
    const header = ["Nombre", "Fecha", "Costo (Bs.)"];
    header.forEach((h, c) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
      ws[cellRef] = { t: 's', v: h, s: { font: { bold: true }, fill: blueBg } };
    });
    rowIndex++;

    gastos.forEach(g => {
      const row = [g.nombre, formatFecha(g.fecha ? g.fecha.split('T')[0] : ''), Number(g.costo || 0)];
      row.forEach((val, c) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
        const cell = { v: val };
        if (typeof val === 'number') cell.t = 'n';
        else cell.t = 's';
        ws[cellRef] = cell;
      });
      rowIndex++;
    });

    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex - 1, c: 2 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, ws, "Detalle");

    // Hoja: Datos de Gráficas
    if (gastos.length) {
      const gastosByDate = {};
      gastos.forEach(g => { const f = g.fecha ? g.fecha.split('T')[0] : ''; gastosByDate[f] = (gastosByDate[f] || 0) + Number(g.costo || 0); });
      const gRows = Object.entries(gastosByDate).sort((a, b) => new Date(a[0]) - new Date(b[0]));
      addChartDataToWorkbook(workbook, 'Gráfica Gastos', gRows.map(([f]) => f ? formatFecha(f) : '--'), [
        { label: 'Total Gastos (Bs.)', data: gRows.map(([, c]) => c) }
      ]);
    }

    XLSX.writeFile(workbook, `reporte_gastos_generales${agruparPorSemana.value ? '_semanal' : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
  } catch (error) {
    console.error('Error en exportarExcel:', error);
    alert('Error al exportar Excel: ' + error.message);
  }
};
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out forwards;
}

.cursor-pointer { cursor: pointer; }
</style>
