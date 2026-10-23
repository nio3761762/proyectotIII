import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoMasasCori from '@/views/assets/LogoMasasCorir.png'

const MODO_TITULO = { diario: 'Por día', semanal: 'Por semana', mensual: 'Por mes' }

// Estilos de cada bloque: fondo (fondo) y color del texto (texto)
const COLOR_MES = { fondo: [229, 231, 235], texto: [31, 41, 55] }     // gris claro: general del mes
const COLOR_SEMANA = { fondo: [224, 242, 254], texto: [31, 41, 55] }  // celeste claro: semanas
const COLOR_RESUMEN = { fondo: [51, 65, 85], texto: [255, 255, 255] } // resumenes generales
const COLOR_DIA = { fondo: [100, 116, 139], texto: [255, 255, 255] }  // dias
const COLOR_RESUMEN_SEMANAS = { fondo: [243, 244, 246], texto: [55, 65, 81] } // resumen por semanas (mas suave que el mes)

const estiloCabecera = (estilo) => ({ fillColor: estilo.fondo, textColor: estilo.texto, fontStyle: 'bold' })

const dinero = (v) => Number(v || 0).toFixed(2)

const fechaCorta = (f) => {
  const limpia = String(f || '').split('T')[0]
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(limpia)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : limpia
}

const getImageBase64 = async (src) => {
  try {
    const response = await fetch(src)
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    return null
  }
}

const dibujarEncabezado = async (doc, titulo, subtitulo) => {
  const pageW = doc.internal.pageSize.getWidth()
  let x = 14
  const logo = await getImageBase64(logoMasasCori)
  if (logo) {
    doc.addImage(logo, 'PNG', 14, 8, 22, 22)
    x = 40
  }
  doc.setFont(undefined, 'bold')
  doc.setFontSize(16)
  doc.setTextColor(30)
  doc.text(titulo, x, 15)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(subtitulo, x, 21)
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, x, 26)
  doc.setDrawColor(200)
  doc.line(14, 32, pageW - 14, 32)
  doc.setTextColor(0)
  return 38
}

const asegurarEspacio = (doc, y, alto) => {
  if (y + alto > doc.internal.pageSize.getHeight() - 12) {
    doc.addPage()
    return 14
  }
  return y
}

// Banda de color con el titulo de la seccion (texto blanco)
const tituloSeccion = (doc, y, texto, estilo = COLOR_RESUMEN) => {
  const yy = asegurarEspacio(doc, y, 14)
  const pageW = doc.internal.pageSize.getWidth()
  doc.setFillColor(...estilo.fondo)
  doc.rect(14, yy - 4.5, pageW - 28, 6.5, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...estilo.texto)
  doc.text(texto, 17, yy)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(0)
  return yy + 4
}

const ESTILO_BASE = {
  fontSize: 6.5,
  cellPadding: 1.2,
  lineColor: [200, 200, 200],
  lineWidth: 0.1,
  halign: 'center',
  valign: 'middle',
  textColor: [31, 41, 55]
}

const celdaTotal = (contenido) => ({ content: contenido, styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } })

// Tabla de una fila por origen/tipo, con columnas por producto y presentacion
const tablaBloque = (doc, y, { columnas, grupos, filas, totales, totalesPorColumna }, color = COLOR_DIA) => {
  const head = [
    [
      { content: 'Origen', rowSpan: 2 },
      { content: 'Tipo', rowSpan: 2 },
      ...grupos.map((g) => ({ content: g.producto, colSpan: g.presentaciones.length })),
      { content: 'Total', colSpan: 3 }
    ],
    [
      ...columnas.map((c) => c.etiqueta || c.presentacion),
      'Ingreso',
      'Gasto Extra',
      'Neto'
    ]
  ]

  const body = (filas || []).map((f) => [
    f.origen,
    f.tipo,
    ...columnas.map((c) => f.cantidades?.[c.key] || 0),
    `${dinero(f.ingreso)} bs`,
    `${dinero(f.gastoExtra)} bs`,
    `${dinero(f.neto)} bs`
  ])

  if (!filas || !filas.length) {
    body.push([{ content: 'Sin movimientos', colSpan: columnas.length + 5, styles: { textColor: [150, 150, 150] } }])
  }

  body.push([
    celdaTotal('TOTAL'),
    celdaTotal(''),
    ...columnas.map((c) => celdaTotal(totalesPorColumna?.[c.key] || 0)),
    celdaTotal(`${dinero(totales?.ingreso)} bs`),
    celdaTotal(`${dinero(totales?.gastoExtra)} bs`),
    celdaTotal(`${dinero(totales?.neto)} bs`)
  ])

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: 'grid',
    styles: ESTILO_BASE,
    headStyles: { ...estiloCabecera(color), halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' }, 1: { halign: 'left' } },
    margin: { left: 14, right: 14 }
  })

  return doc.lastAutoTable.finalY + 6
}

// Resumen general por meses: una fila por mes con su ingreso, ganancia y % del total
const tablaResumenMeses = (doc, y, resumenMeses, totalesGlobales) => {
  const lista = resumenMeses || []
  const body = lista.map((m) => [
    m.label,
    `${dinero(m.ingreso)} bs`,
    `${dinero(m.gastoExtra)} bs`,
    `${dinero(m.neto)} bs`,
    `${m.porcentajeIngreso} %`,
    `${m.porcentajeNeto} %`
  ])
  const sumaIngreso = lista.reduce((s, m) => s + Number(m.porcentajeIngreso || 0), 0).toFixed(2)
  const sumaNeto = lista.reduce((s, m) => s + Number(m.porcentajeNeto || 0), 0).toFixed(2)
  body.push([
    celdaTotal('Total'),
    celdaTotal(`${dinero(totalesGlobales?.ingreso)} bs`),
    celdaTotal(`${dinero(totalesGlobales?.gastoExtra)} bs`),
    celdaTotal(`${dinero(totalesGlobales?.neto)} bs`),
    celdaTotal(`${sumaIngreso} %`),
    celdaTotal(`${sumaNeto} %`)
  ])

  autoTable(doc, {
    startY: y,
    head: [['Mes', 'Ingreso', 'Gasto extra', 'Neto (ganancia)', '% del ingreso', '% de la ganancia']],
    body,
    theme: 'grid',
    styles: ESTILO_BASE,
    headStyles: { ...estiloCabecera(COLOR_RESUMEN), halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
    tableWidth: 220
  })

  return doc.lastAutoTable.finalY + 6
}

// Resumen por semanas del mes: una fila por semana y total del mes
const tablaResumenSemanas = (doc, y, mes) => {
  // Porcentaje de una semana sobre el total del mes (ingreso y ganancia)
  const pct = (valor, total) => (Number(total) > 0 ? ((Number(valor) / Number(total)) * 100).toFixed(2) : '0.00')
  const totIng = mes.totales?.ingreso
  const totNeto = mes.totales?.neto

  const body = (mes.semanas || []).map((s) => [
    s.label,
    `${dinero(s.totales?.ingreso)} bs`,
    `${dinero(s.totales?.gastoExtra)} bs`,
    `${dinero(s.totales?.neto)} bs`,
    `${pct(s.totales?.ingreso, totIng)} %`,
    `${pct(s.totales?.neto, totNeto)} %`
  ])
  const sumaIng = (mes.semanas || []).reduce((acc, s) => acc + Number(pct(s.totales?.ingreso, totIng)), 0).toFixed(2)
  const sumaNeto = (mes.semanas || []).reduce((acc, s) => acc + Number(pct(s.totales?.neto, totNeto)), 0).toFixed(2)
  body.push([
    celdaTotal('Total del mes'),
    celdaTotal(`${dinero(totIng)} bs`),
    celdaTotal(`${dinero(mes.totales?.gastoExtra)} bs`),
    celdaTotal(`${dinero(totNeto)} bs`),
    celdaTotal(`${sumaIng} %`),
    celdaTotal(`${sumaNeto} %`)
  ])

  autoTable(doc, {
    startY: y,
    head: [['Semana', 'Ingreso', 'Gasto extra', 'Neto', '% del ingreso del mes', '% de la ganancia del mes']],
    body,
    theme: 'grid',
    styles: ESTILO_BASE,
    headStyles: { ...estiloCabecera(COLOR_RESUMEN_SEMANAS), halign: 'center' },
    columnStyles: { 0: { halign: 'left' } },
    margin: { left: 14, right: 14 },
    tableWidth: 220
  })

  return doc.lastAutoTable.finalY + 6
}

// Leyenda de colores: un cuadro de color + su significado, en una sola linea
const dibujarLeyenda = (doc, y, items) => {
  let x = 14
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  items.forEach(({ estilo, texto }) => {
    doc.setFillColor(...estilo.fondo)
    doc.setDrawColor(150)
    doc.rect(x, y - 3, 5, 4, 'FD')
    doc.setTextColor(55, 65, 81)
    doc.text(texto, x + 7, y)
    x += 7 + doc.getTextWidth(texto) + 10
  })
  doc.setTextColor(0)
  doc.setDrawColor(0)
  return y + 7
}

const tablaPorcentajes = (doc, y, porcentajes) => {
  const body = (porcentajes || []).map((p) => [
    p.origen,
    p.tipo === 'Revendedor' ? `${p.cantidad} revendedor(es)` : p.tipo,
    `${p.porcentaje} %`,
    `${p.porcentajeNeto} %`,
    `${dinero(p.monto)} bs`,
    `${dinero(p.neto)} bs`,
    `${dinero(p.comision)} bs`
  ])
  if (!body.length) body.push([{ content: 'Sin datos', colSpan: 7, styles: { textColor: [150, 150, 150] } }])

  autoTable(doc, {
    startY: y,
    head: [['Origen', 'Tipo', '% Ingreso', '% Neto', 'Ingreso', 'Neto', 'Comisión']],
    body,
    theme: 'grid',
    styles: ESTILO_BASE,
    headStyles: { ...estiloCabecera(COLOR_RESUMEN), halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' }, 1: { halign: 'left' } },
    margin: { left: 14, right: 14 },
    tableWidth: 180
  })

  return doc.lastAutoTable.finalY + 6
}

/**
 * Exporta el reporte de venta segun el modo:
 * - mensual: resumen por meses + general de cada mes (color propio) + resumen por semanas + semanas
 * - semanal: general de cada semana (color propio) + sus dias
 * - diario: solo dias
 */
export const exportarVentaUnificadaPDF = async ({ reporte, modo, desde, hasta, tienda }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const columnas = reporte?.columnas || []
  const grupos = reporte?.grupos || []
  const opciones = { columnas, grupos }
  const diasPorFecha = Object.fromEntries((reporte?.dias || []).map((d) => [d.fecha, d]))

  let y = await dibujarEncabezado(
    doc,
    `Reporte de Venta - ${MODO_TITULO[modo] || ''}`,
    `Periodo: ${fechaCorta(desde)} al ${fechaCorta(hasta)}   |   Tienda: ${tienda || 'Todas'}`
  )

  const leyenda = {
    mensual: [
      { estilo: COLOR_MES, texto: 'General del mes' },
      { estilo: COLOR_SEMANA, texto: 'Semana del mes' },
      { estilo: COLOR_RESUMEN, texto: 'Resumen (meses, semanas, porcentajes y ganancias)' }
    ],
    semanal: [
      { estilo: COLOR_SEMANA, texto: 'General de la semana' },
      { estilo: COLOR_DIA, texto: 'Día' },
      { estilo: COLOR_RESUMEN, texto: 'Resumen (porcentajes y ganancias)' }
    ],
    diario: [
      { estilo: COLOR_DIA, texto: 'Día' },
      { estilo: COLOR_RESUMEN, texto: 'Resumen (porcentajes y ganancias)' }
    ]
  }[modo] || []
  y = dibujarLeyenda(doc, y + 4, leyenda)

  y = tituloSeccion(doc, y, 'Porcentajes sobre ventas (general)')
  y = tablaPorcentajes(doc, y, reporte?.porcentajes)

  const t = reporte?.totalesGlobales || {}
  y = tituloSeccion(doc, y, 'Ganancias generales')
  autoTable(doc, {
    startY: y,
    head: [['Ingreso total', 'Gasto extra', 'Neto (ganancia)', 'Comisión']],
    body: [[`${dinero(t.ingreso)} bs`, `${dinero(t.gastoExtra)} bs`, `${dinero(t.neto)} bs`, `${dinero(t.comision)} bs`]],
    theme: 'grid',
    styles: { ...ESTILO_BASE, fontSize: 8, halign: 'center' },
    headStyles: { ...estiloCabecera(COLOR_RESUMEN), halign: 'center' },
    margin: { left: 14, right: 14 },
    tableWidth: 180
  })
  y = doc.lastAutoTable.finalY + 6

  if (modo === 'mensual') {
    y = tituloSeccion(doc, y, `Resumen general por meses (cantidad de meses: ${(reporte?.resumenMeses || []).length})`)
    y = tablaResumenMeses(doc, y, reporte?.resumenMeses, t)
    for (const mes of reporte?.meses || []) {
      y = tituloSeccion(doc, y, `General del mes - ${mes.label}`, COLOR_MES)
      y = tablaBloque(doc, y, { ...opciones, ...mes }, COLOR_MES)
      y = tituloSeccion(doc, y, `Resumen por semanas - ${mes.label}`, COLOR_RESUMEN_SEMANAS)
      y = tablaResumenSemanas(doc, y, mes)
      for (const semana of mes.semanas || []) {
        y = tituloSeccion(doc, y, `Semana ${semana.label}`, COLOR_SEMANA)
        y = tablaBloque(doc, y, { ...opciones, ...semana }, COLOR_SEMANA)
      }
    }
  } else if (modo === 'semanal') {
    for (const semana of reporte?.semanas || []) {
      y = tituloSeccion(doc, y, `General de la semana (${semana.label})`, COLOR_SEMANA)
      y = tablaBloque(doc, y, { ...opciones, ...semana }, COLOR_SEMANA)
      for (const fecha of semana.fechas || []) {
        const dia = diasPorFecha[fecha]
        if (!dia) continue
        y = tituloSeccion(doc, y, fechaCorta(dia.fecha), COLOR_DIA)
        y = tablaBloque(doc, y, { ...opciones, ...dia }, COLOR_DIA)
      }
    }
  } else {
    for (const dia of reporte?.dias || []) {
      y = tituloSeccion(doc, y, fechaCorta(dia.fecha), COLOR_DIA)
      y = tablaBloque(doc, y, { ...opciones, ...dia }, COLOR_DIA)
    }
  }

  doc.save(`reporte-venta-${modo}-${desde}_${hasta}.pdf`)
}
