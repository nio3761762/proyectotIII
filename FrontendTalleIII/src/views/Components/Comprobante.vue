<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div :class="['bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in transition-all duration-300', isThermalMode ? 'w-full max-w-[320px]' : 'w-full max-w-2xl']">
      
      <!-- Options Bar -->
      <div class="bg-gray-100 p-4 border-b flex justify-between items-center no-print" data-html2canvas-ignore="true">
        <h2 class="font-bold text-gray-700">Opciones de Impresión</h2>
        <div class="flex gap-2">
          <button 
            @click="isThermalMode = !isThermalMode"
            :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all', isThermalMode ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200']"
          >
            {{ isThermalMode ? 'Modo Ticket (ON)' : 'Modo Hoja (A4)' }}
          </button>
        </div>
      </div>

      <div id="invoice-content" :class="['p-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible classic-colors', isThermalMode ? 'thermal-ticket' : '']">

        <!-- Invoice Header -->
        <div class="flex flex-col items-center text-center pb-4 border-b-2 border-dashed border-gray-300">
          <img :src="obtenerLogo" alt="Logo" class="h-16 mb-2 grayscale object-contain">
          <h1 class="text-xl font-black uppercase">{{ obtenerNombreEmpresa }}</h1>
          <p class="text-sm font-bold uppercase">{{ obtenerNombreSucursal }}</p>
          <p class="text-xs">{{ obtenerDireccionCompleta }}</p>
          <p class="text-xs">Tel: {{ obtenerTelefono }}</p>
          <div class="mt-4 pt-2 border-t border-gray-100 w-full">
            <p class="text-sm font-bold">COMPROBANTE DE VENTA</p>
            <p class="text-xs">Nro: {{ venta.Factura?.NroFactura || venta.idventa || venta.IdVenta }}</p>
            <p class="text-xs">{{ obtenerFechaHoraDocumento }}</p>
          </div>
          </div>

        <!--  Invoice Details -->
        <div class="py-4 border-b border-dashed border-gray-300 space-y-1 text-left">
          <p class="text-xs uppercase font-bold text-gray-500">Cliente:</p>
          <p class="text-sm font-bold">
            {{ obtenerNombreFacturacion }}
          </p>
          <p class="text-xs">CI/NIT: {{ obtenerDocumentoFacturacion }}</p>
        </div>


        <!-- Items Table -->
        <div class="my-4">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b-2 border-gray-800">
                <th class="text-left py-2">DESCRIPCIÓN</th>
                <th class="text-center py-2">CANT</th>
                <th class="text-right py-2">P.UNIT</th>
                <th class="text-right py-2">TOTAL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <template v-for="item in (venta.Detalleventa || venta.Detalle)" :key="item.IdDetalleVenta">
                <tr>
                  <td class="py-2 pr-2">
                    <span class="font-bold uppercase block">{{ item.Productomedida?.Producto?.Nombre || item.Producto?.Nombre || item.Promocion?.Nombre }}</span>
                    <span v-if="item.Productomedida?.Presentacion" class="text-[10px] text-gray-600 block">
                      {{ item.Productomedida.Presentacion.Nombre }} (x{{ item.Productomedida.Cantidad || item.Productomedida.cantidad || 1 }})
                    </span>
                  </td>
                  <td class="py-2 text-center align-top">{{ item.Cantidad }}</td>
                  <td class="py-2 text-right align-top"> {{ redondearPrecio(item.Precio) }}</td>
                  <td class="py-2 text-right align-top font-bold"> {{ redondearPrecio(item.Cantidad * item.Precio) }}</td>
                </tr>
                <!-- Sub-items if promo -->
                <tr v-if="item.Promocion?.Productos?.length > 0">
                  <td colspan="4" class="pb-2">
                    <div class="text-[9px] text-gray-500 pl-2 border-l border-gray-200">
                      <div v-for="p in item.Promocion.Productos" :key="p.IdPromocionProducto">
                        • {{ p.Cantidad }} x {{ p.Productomedida?.Producto?.Nombre }} ({{ p.Productomedida?.Presentacion?.Nombre }})
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="border-t-2 border-double border-gray-800 pt-3 space-y-1">
          <div class="flex justify-between text-sm font-black">
            <span>TOTAL A PAGAR:</span>
            <span>Bs. {{ totalCalculado }}</span>
          </div>
          
          <div v-if="pagoInfo" class="pt-2 text-xs space-y-1">
            <div class="flex justify-between">
              <span>MÉTODO:</span>
              <span class="uppercase">{{ pagoInfo.Metodopago?.Nombre || pagoInfo.Nombre }}</span>
            </div>
            <div class="flex justify-between">
              <span>RECIBIDO:</span>
              <span>Bs. {{ Number(Number(pagoInfo.Monto) + Number(pagoInfo.Cambio)).toFixed(2) }}</span>
            </div>
            <div v-if="pagoInfo.Cambio > 0" class="flex justify-between font-bold">
              <span>CAMBIO:</span>
              <span>Bs. {{ Number(pagoInfo.Cambio).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center pt-6 mt-6 border-t border-dashed border-gray-300">
          <p class="text-xs italic font-bold">¡GRACIAS POR SU PREFERENCIA!</p>
          <p class="text-[10px] mt-1">Visite nuestra web: masascori.com</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-gray-50 p-6 flex justify-end gap-3 no-print" data-html2canvas-ignore="true">
        <button @click="$emit('close')" class="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl font-bold">
          Cerrar
        </button>
        <button @click="imprimirTicket" class="flex-1 px-4 py-3 bg-linear-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
          <Printer class="h-5 w-5" />
          Imprimir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, computed } from 'vue'
import { Printer, FileText } from 'lucide-vue-next'
import { listarPagoVenta } from '@/Server/Pago.js'
import { getSucursalDireccion } from '@/Server/Sucural.js'
import { SubirFoto } from '@/Server/api.js'
import { insertarEnlaceFactura } from '@/Server/Factura.js'
import html2pdf from 'html2pdf.js'

const props = defineProps({
  venta: { type: Object, required: true }
})
defineEmits(['close'])

const pagoInfo = ref(null)
const isThermalMode = ref(true); // Default to thermal for quick sales
const sucursalDetalle = ref(null);

const totalCalculado = computed(() => {
  const detalle = props.venta.Detalleventa || props.venta.Detalle || [];
  return detalle.reduce((acc, item) => acc + (Number(item.Cantidad) * Number(item.Precio)), 0).toFixed(2);
});

const obtenerNombreSucursal = computed(() => sucursalDetalle.value?.nombre || props.venta?.Sucursal?.Nombre || 'Masas Cori');
const obtenerNombreEmpresa = computed(() => sucursalDetalle.value?.nombreempresa || 'Masas Cori');
const obtenerLogo = computed(() => sucursalDetalle.value?.foto || '/src/views/assets/LogoMasasCori.png');
const obtenerDireccionCompleta = computed(() => {
  if (!sucursalDetalle.value) return props.venta?.Sucursal?.Direccion || 'Santa Cruz, Bolivia';
  const { direccion, nombrebarrio, nombreciudad, nombredepartamento, nombrepais } = sucursalDetalle.value;
  return `${direccion}, ${nombrebarrio} - ${nombreciudad}, ${nombredepartamento} - ${nombrepais || ''}`.replace(/, $/, '');
});
const obtenerTelefono = computed(() => sucursalDetalle.value?.celular || props.venta?.Sucursal?.Telefono || '70000000');

const obtenerNombreFacturacion = computed(() => {
  if (props.venta.Factura?.NombreFacturacion) return props.venta.Factura.NombreFacturacion;
  const p = props.venta.Persona || props.venta.persona;
  if (!p) return 'Consumidor Final';
  const nombre = p.Nombre || p.nombre || '';
  const paterno = p.ApellidoPaterno || p.apellidopaterno || '';
  const materno = p.ApellidoMaterno || p.apellidomaterno || '';
  return `${nombre} ${paterno} ${materno}`.trim() || 'Consumidor Final';
});

const obtenerDocumentoFacturacion = computed(() => {
  if (props.venta.Factura?.NitCiFacturacion) return props.venta.Factura.NitCiFacturacion;
  const p = props.venta.Persona || props.venta.persona;
  if (!p) return '0000000000';
  // Try to find a document (CI/NIT)
  if (p.Documento && p.Documento.length > 0) {
    return p.Documento[0].Documento || p.Documento[0].documento || '0000000000';
  }
  return p.CI || p.ci || '0000000000';
});

const obtenerFechaHoraDocumento = computed(() => {
  let fechaRaw = props.venta.fechaventa || props.venta.FechaVenta;
  let horaRaw = props.venta.horaventa || props.venta.HoraVenta || '';

  if (props.venta.Factura) {
    fechaRaw = props.venta.Factura.FechaEmicion || props.venta.Factura.fechaemicion;
    horaRaw = props.venta.Factura.HoraEmicion || props.venta.Factura.horaemicion || '';
  }

  if (!fechaRaw) return 'N/A';

  try {
    // Parsear la fecha asegurando que sea local si es YYYY-MM-DD
    let d;
    if (typeof fechaRaw === 'string' && fechaRaw.includes('-') && !fechaRaw.includes('T')) {
      const [year, month, day] = fechaRaw.split('-').map(Number);
      d = new Date(year, month - 1, day);
    } else {
      d = new Date(fechaRaw);
    }

    if (isNaN(d.getTime())) return `${fechaRaw} ${horaRaw}`;

    // Formato DD/MM/YYYY
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    
    // Formatear Hora a AM/PM
    let horaFinal = '';
    if (horaRaw) {
      // Intentar parsear horaRaw (formato HH:mm:ss)
      const partes = horaRaw.split(':');
      if (partes.length >= 2) {
        let h = parseInt(partes[0]);
        const m = partes[1];
        const s = partes[2] ? partes[2].substring(0, 2) : '00';
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // la hora 0 debe ser 12
        horaFinal = `${String(h).padStart(2, '0')}:${m}:${s} ${ampm}`;
      } else {
        horaFinal = horaRaw;
      }
    } else if (!isNaN(d.getHours()) && fechaRaw.toString().includes('T')) {
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      horaFinal = `${String(h).padStart(2, '0')}:${m}:${s} ${ampm}`;
    }

    return `${dia}/${mes}/${anio} ${horaFinal}`.trim();
  } catch (e) {
    return `${fechaRaw} ${horaRaw}`;
  }
});

const redondearPrecio = (p) => parseFloat(p).toFixed(2);

const generarYGuardarFactura = async () => {
  const element = document.getElementById('invoice-content');
  if (!element || !props.venta.Factura) return;

  const idFactura = props.venta.Factura.IdFactura || props.venta.Factura.idfactura;
  if (!idFactura) {
    console.error('No se pudo encontrar el ID de la factura para guardar el enlace');
    return;
  }

  // Calculamos una altura estimada o usamos una suficientemente larga para ticket
  const opt = {
    margin: 2,
    filename: `Factura_${props.venta.Factura.NroFactura || props.venta.Factura.nrofactura || idFactura}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 3, 
      useCORS: true, 
      logging: false,
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * { 
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #000000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
            font-family: 'Courier New', Courier, monospace !important;
          }
          #invoice-content {
            background-color: #ffffff !important;
            width: 80mm !important;
            padding: 4mm !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .divide-y > * + * {
            border-top-width: 1px !important;
            border-style: dashed !important;
          }
          img {
            filter: grayscale(1) !important;
            max-width: 40mm !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    },
    jsPDF: { unit: 'mm', format: [80, 250], orientation: 'portrait' }
  };

  try {
    const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
    const pdfFile = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
    
    // Subir el archivo al servidor
    const url = await SubirFoto(pdfFile);
   
    
    // Guardar el enlace en la factura
    await insertarEnlaceFactura({
      IdFactura: idFactura,
      archivo: url
    });
    
    // Actualizar localmente para evitar re-procesar
    if (props.venta.Factura) {
      props.venta.Factura.IdEnlace = url;
      props.venta.Factura.Enlace = url;
    }
   
  } catch (e) {
    console.error('Error al generar o guardar la factura:', e);
  }
};

onMounted(async () => {
  const idVenta = props.venta.idventa || props.venta.IdVenta;
  const idSucursal = props.venta.Sucursal?.IdSucursal || props.venta.Sucursal?.idsucursal;

  const promesas = [];
  if (idVenta) promesas.push(listarPagoVenta(idVenta).then(pagos => { if (pagos?.length > 0) pagoInfo.value = pagos[0]; }));
  if (idSucursal) promesas.push(getSucursalDireccion(idSucursal).then(detalle => { if (detalle) sucursalDetalle.value = detalle; }));

  await Promise.all(promesas);

  // Si tiene factura pero no tiene enlace guardado, generamos y guardamos el PDF
  if (props.venta.Factura && !props.venta.Factura.IdEnlace) {
    // Esperar un momento a que el DOM se actualice con los datos cargados
    setTimeout(() => {
      generarYGuardarFactura();
    }, 1000);
  }
});

const imprimirTicket = () => {
  window.print();
};
</script>
 
<style scoped>
/* Thermal Printer (POS) Specific Styles */
.thermal-ticket {
  font-family: 'Courier New', Courier, monospace;
  color: black !important;
  background: white !important;
}

@media print {
  @page {
    margin: 0;
    size: auto; /* Browser handles paper width automatically based on content */
  }
  
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  .no-print {
    display: none !important;
  }

  #invoice-content {
    width: 100%;
    max-width: 80mm; /* Standard width for thermal rolls */
    padding: 10px;
    margin: 0 auto;
  }

  /* Force black text for thermal heat transfer */
  * {
    color: black !important;
    text-shadow: none !important;
    box-shadow: none !important;
  }

  .thermal-ticket .grayscale {
    filter: grayscale(1) contrast(1.5);
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } 
}

/* Fix for html2pdf/html2canvas with modern CSS functions */
.classic-colors {
  background-color: #ffffff !important;
  color: #000000 !important;
}
.classic-colors * {
  border-color: #d1d5db !important; /* gray-300 */
}
</style>


<style scoped>

@media print {
  body * {
    visibility: hidden;
  }
  #invoice-content, #invoice-content * {
    visibility: visible;
  }
  #invoice-content {
    position: absolute;
    left: 0;
    top: 0;
  }
}


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

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
