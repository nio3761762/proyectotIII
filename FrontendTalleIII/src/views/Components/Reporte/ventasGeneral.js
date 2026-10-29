// Cálculos compartidos para la "Tabla General" del reporte de ventas.
// Filas = origen de la venta (Revendedor / Tienda Central / Cocina)
// Columnas = producto > presentación (igual que la matriz de venta unificada)

const ORIGENES = ['Revendedor', 'Tienda Central', 'Cocina']
const TIPO_ORIGEN = { 'Revendedor': 'Revendedor', 'Tienda Central': 'Venta', 'Cocina': 'Pedido' }

const dividirProducto = (producto) => {
  const prod = String(producto || 'Sin producto')
  const base = prod.split('(')[0].trim() || 'Sin producto'
  const pres = prod.match(/\(([^)]+)\)/)?.[1] || 'Und'
  return { base, pres }
}

const origenDeVenta = (v) => {
  const suc = String(v.sucursal || '').toLowerCase()
  if (suc.includes('cocina') || suc.includes('pedido')) return 'Cocina'
  if (v.cliente && String(v.cliente).toLowerCase() !== 'consumidor final') return 'Revendedor'
  return 'Tienda Central'
}

// Productos y presentaciones presentes en las ventas (en orden de aparición)
export const extraerGrupos = (ventas = []) => {
  const grupos = new Map()
  ventas.forEach(v => {
    const { base, pres } = dividirProducto(v.producto)
    if (!grupos.has(base)) grupos.set(base, [])
    if (!grupos.get(base).includes(pres)) grupos.get(base).push(pres)
  })
  return Array.from(grupos, ([producto, presentaciones]) => ({ producto, presentaciones }))
}

// Tabla general: filas por origen, columnas por producto/presentación y totales de dinero.
// Las filas de detalle de una misma venta comparten precioTotalVenta/gastoextra,
// por eso el dinero solo se suma en la primera fila de cada venta (isFirstInSale).
export const construirTablaGeneral = (ventas = [], grupos = []) => {
  const columnas = []
  grupos.forEach(g => g.presentaciones.forEach(p => {
    columnas.push({ key: g.producto + '||' + p, producto: g.producto, presentacion: p })
  }))

  const porOrigen = {}
  ORIGENES.forEach(o => { porOrigen[o] = { origen: o, tipo: TIPO_ORIGEN[o], cantidades: {}, ingreso: 0, gastoExtra: 0, neto: 0 } })

  ventas.forEach(v => {
    const fila = porOrigen[origenDeVenta(v)]
    const { base, pres } = dividirProducto(v.producto)
    const ckey = base + '||' + pres
    fila.cantidades[ckey] = (fila.cantidades[ckey] || 0) + Number(v.cantidad || 0)
    if (v.isFirstInSale !== false) {
      fila.ingreso += Number(v.precioTotalVenta || 0)
      fila.gastoExtra += Number(v.gastoextra || 0)
    }
  })

  const filas = ORIGENES.map(o => porOrigen[o])
    .filter(f => f.ingreso > 0 || Object.values(f.cantidades).some(x => x > 0))
  filas.forEach(f => { f.neto = f.ingreso - f.gastoExtra })

  const totalesPorColumna = {}
  columnas.forEach(c => {
    totalesPorColumna[c.key] = filas.reduce((s, f) => s + Number(f.cantidades[c.key] || 0), 0)
  })

  const totales = {
    ingreso: filas.reduce((s, f) => s + f.ingreso, 0),
    gastoExtra: filas.reduce((s, f) => s + f.gastoExtra, 0),
    neto: filas.reduce((s, f) => s + f.neto, 0)
  }

  return { columnas, filas, totalesPorColumna, totales }
}

// Meses "YYYY-MM" desde el mes de "desde" hasta el mes de "hasta" (ambos incluidos)
export const mesesEnRango = (desde, hasta) => {
  if (!desde || !hasta) return []
  const [y1, m1] = String(desde).split('-').map(Number)
  const [y2, m2] = String(hasta).split('-').map(Number)
  if ([y1, m1, y2, m2].some(n => Number.isNaN(n))) return []
  const meses = []
  let y = y1
  let m = m1
  while (y < y2 || (y === y2 && m <= m2)) {
    meses.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return meses
}
