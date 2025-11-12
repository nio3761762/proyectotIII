<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
      <div id="invoice-content" class="p-8 max-h-[80vh] overflow-y-auto">
        <!-- Invoice Header -->
        <div class="flex justify-between items-center pb-6 border-b-2 border-gray-200">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Comprobante</h1>
            <p class="text-gray-500">Nro: {{ venta.NroFactura }}</p>
          </div>
          <div class="text-right">
            <img src="/src/views/assets/LogoMasasCori.png" alt="Logo" class="h-16 mb-2">
            <p class="text-sm font-semibold">Masas Cori</p>
            <p class="text-xs text-gray-500">Calle Falsa 123, Ciudad</p>
            <p class="text-xs text-gray-500">Tel: 123-456-7890</p>
          </div>
        </div>

        <!--  Invoice Details -->
        <div class="flex justify-between items-center py-6">
          <div>
            <p class="text-sm font-semibold text-gray-700 mb-1">Comprobante para:</p>
            <p class="font-bold text-gray-800">{{ venta.Persona?.Nombre || 'Sin Cliente' }} {{ venta.Persona?.ApellidoPaterno }}</p>
            <p class="text-xs text-gray-500">{{ venta.Persona?.CI || '' }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-700 mb-1">Fecha de Emisión:</p>
            <p class="font-medium text-gray-800">{{ new Date(venta.FechaVenta + 'T00:00:00').toLocaleDateString() }}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div class="overflow-x-auto mb-8">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-100 border-b border-gray-200">
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Ítem</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                <th class="text-right py-3 px-4 font-semibold text-gray-700">Precio </th>
                <th class="text-right py-3 px-4 font-semibold text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in venta.Detalleventa" :key="item.IdDetalleVenta" class="border-b border-gray-100">
                <td class="py-3 px-4 font-medium text-gray-800">{{ item.Producto?.Nombre || item.Promocion?.Nombre || item.Paquete?.Nombre }}</td>
                <td class="py-3 px-4 text-center font-medium">{{ item.Cantidad }}</td>
                <td class="py-3 px-4 text-right font-medium">Bs. {{ item.Precio }}</td>
                <td class="py-3 px-4 text-right font-bold">Bs. {{ redondearPrecio(item.Cantidad * item.Precio) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Invoice Total -->
        <div class="flex justify-end mb-8">
          <div class="w-full md:w-1/3">
            <div class="flex justify-between py-2 border-b">
              <span class="font-medium text-gray-600">Subtotal:</span>
              <span class="font-bold text-gray-800">Bs. {{ totalCalculado }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="font-medium text-gray-600">Descuento:</span>
              <span class="font-bold text-gray-800">Bs. 0.00</span>
            </div>
            <div class="flex justify-between py-3 bg-gray-100 rounded-lg px-4 mt-2">
              <span class="text-xl font-bold text-gray-800">Total:</span>
              <span class="text-xl font-bold text-green-600">Bs. {{ totalCalculado }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div v-if="pagoInfo" class="flex justify-end mb-8">
          <div class="w-full md:w-1/3">
            <div class="flex justify-between py-2 border-b">
              <span class="font-medium text-gray-600">Método de Pago:</span>
              <span class="font-bold text-gray-800">{{ pagoInfo.Nombre || 'N/A' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="font-medium text-gray-600">Monto Pagado:</span>
              <span class="font-bold text-gray-800">Bs. {{ Number(pagoInfo.Monto).toFixed(2) || '0.00' }}</span>
            </div>
            <div v-if="pagoInfo.Nombre === 'Efectivo'" class="flex justify-between py-2 border-b">
              <span class="font-medium text-gray-600">Cambio:</span>
              <span class="font-bold text-gray-800">Bs. {{ redondearPrecio(pagoInfo.Cambio) || '0.00' }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-xs text-gray-500 pt-6 border-t">
          <p>Gracias por su compra.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex justify-end gap-4 no-print">
        <button @click="$emit('close')" class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-lg font-semibold">
          Cerrar
        </button>
        <button @click="imprimirFactura" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg font-semibold">
          Imprimir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, computed } from 'vue'
import { listarPagoVenta } from '@/Server/Pago.js'
import { createFactura, updatefactura } from '@/Server/Factura.js'
import { SubirArchivo } from '@/Server/Foto';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


const props = defineProps({
  venta: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const pagoInfo = ref(null)

const totalCalculado = computed(() => {
  if (!props.venta || !props.venta.Detalleventa) {
    return 0;
  }

  const calculatedTotal = props.venta.Detalleventa.reduce((total, item) => {
    const cantidad = Number(item.Cantidad) || 0;
    const precio = Number(item.Precio) || 0;

    const subtotal = redondearPrecio(cantidad * precio);
    console.log(Number(total) + Number(subtotal));

    return  Number(total) +  Number(subtotal);
  }, 0);

  return (calculatedTotal); // ✅ suma redondeada
});

const redondearPrecio = (precio) => {
  const base = Math.floor(precio * 10) / 10; // redondea hacia abajo a la décima
  const diff = precio - base;

  if (diff < 0.05) {
    return base.toFixed(2); // baja
  } else {
    return (base + 0.1).toFixed(2); // sube
  }
};

onMounted(async () => {
  if (props.venta && props.venta.IdVenta) {
    try {
      const pagos = await listarPagoVenta(props.venta.IdVenta);
      if (pagos && pagos.length > 0) {
        pagoInfo.value = pagos[0];
      }
    } catch (error) {
      console.error("Error al cargar la información de pago:", error);
    }
  }
});

const asignarEnlace = async (factura) => {

  try {
 
     const response = await updatefactura(factura); 
     console.log(response)
  }   catch (error) {
    console.error('Error al guardar la compra:', error);
 //   showToastMessage('Error al guardar la compra', 'error');
  }
};


function limpiarColoresOKLCH(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const styles = getComputedStyle(node);

    for (let prop of styles) {
      const value = styles[prop];
      if (typeof value === "string" && value.includes("oklch")) {

        // Si es color de fondo, ponemos blanco
        if (prop === "background" || prop === "background-color") {
          node.style[prop] = "#fff"; // fondo blanco
        } else {
          // Para el texto y bordes podemos usar gris aproximado
          const match = value.match(/oklch\(([\d.]+)%?\s+[\d.]+\s+[\d.]+\)/);
          if (match) {
            let L = parseFloat(match[1]);
            let gray = Math.round(L * 2.55);
            node.style[prop] = `rgb(${gray},${gray},${gray})`;
          } else {
            node.style[prop] = "#000"; // fallback
          }
        }
      }
    }
  }
}


const imprimirFactura = async () => {
  const invoiceContent = document.getElementById("invoice-content");
  if (!invoiceContent) return;

  // 👉 Abrir ventana emergente con los estilos y el contenido
  const printWindow = window.open("", "", "height=800,width=800");
  printWindow.document.write("<html><head><title>Factura</title>");

  Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .forEach(node => {
      printWindow.document.write(node.outerHTML);
    });

  printWindow.document.write("</head><body>");
  printWindow.document.write(invoiceContent.innerHTML);
  printWindow.document.write("</body></html>");
  printWindow.document.close();

  printWindow.onload = async () => {
    try {
      const content = printWindow.document.body;

      // 👇 Paso importante: limpiar colores problemáticos
      limpiarColoresOKLCH(content);

      // Capturamos el contenido como imagen
      const canvas = await html2canvas(content, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      // Crear PDF en formato A4
     
     
      const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // ✅ Generar el PDF como Blob y abrirlo
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const pdfFile = new File([pdfBlob], `factura_${Date.now()}.pdf`, {
        type: "application/pdf",
      });

      // 🔹 Subir al backend
      const url = await SubirArchivo(pdfFile);
      console.log("✅ PDF subido. URL en backend:", url);
   

      const factura ={
       IdFactura: props.venta.IdFactura,
       archivo:url
      }
     await asignarEnlace(factura);
      // 🔹 Abrir el PDF generado en nueva pestaña
     // window.open(pdfUrl, "_blank");

    } catch (err) {
      console.error("❌ Error al generar o enviar PDF:", err);
    } finally {
      // Cierra la ventana auxiliar
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };
};


const generarpdf = () => {
  const invoiceContent = document.getElementById("invoice-content");
  if (!invoiceContent) return;

  try {
    const pdf = new jsPDF('p', 'mm', 'a4'); // PDF tamaño A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Extraer texto de manera simple
    const lines = invoiceContent.innerText.split('\n');

    let y = 10; // margen superior
    lines.forEach(line => {
      pdf.text(line, 10, y);
      y += 7;
      if (y > pdfHeight - 10) {
        pdf.addPage();
        y = 10;
      }
    });

    // 🔹 Abrir PDF en nueva pestaña
    pdf.output('dataurlnewwindow');

    console.log("PDF abierto en nueva pestaña");

  } catch (err) {
    console.error("Error al generar PDF:", err);
  }
};

</script>

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
