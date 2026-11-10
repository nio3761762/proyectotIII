// Modelo compartido de la tabla semanal por revendedor / tienda / pedido.
// Lo usan la pantalla (VentaSemanalOrigenTabla.vue) y el PDF (VentaUnificadaPdf.js),
// asi ambos muestran exactamente los mismos numeros.
//
// Columnas: Lunes..Domingo con C (cantidad entregada) y P (monto a precio normal, sin comision),
// Total de la semana, Comision, Gasto y Neto = Total - Comision - Gasto.

const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const num = (valor) => Number(valor || 0)

export const dinero = (valor) => num(valor).toFixed(2)

export const etiquetaTipoOrigen = (tipo) => {
  if (tipo === 'Revendedor') return 'Revendedor'
  if (tipo === 'Pedido') return 'Pedido'
  return 'Tienda'
}

// Todas las fechas YYYY-MM-DD entre inicio y fin (incluidos)
export const rangoFechasSemana = (inicio, fin) => {
  if (!inicio || !fin) return []
  const pad = (n) => String(n).padStart(2, '0')
  const fechas = []
  const cursor = new Date(`${inicio}T12:00:00`)
  const limite = new Date(`${fin}T12:00:00`)
  while (cursor <= limite) {
    fechas.push(`${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`)
    cursor.setDate(cursor.getDate() + 1)
  }
  return fechas
}

export const construirSemanalOrigen = ({ origen, tipo, fechas = [], diasPorFecha = {}, columnas = [] }) => {
  const dias = fechas.map((fecha) => {
    const dia = diasPorFecha[fecha] || null
    const fila = dia?.filas?.find((f) => f.origen === origen && f.tipo === tipo) || null
    return {
      fecha,
      nombre: NOMBRES_DIA[new Date(`${fecha}T12:00:00`).getDay()],
      fila
    }
  })

  // Filas por producto/presentacion: solo las que tienen movimiento en la semana
  const filas = []
  columnas.forEach((col) => {
    const celdas = dias.map((d) => ({
      cantidad: num(d.fila?.cantidades?.[col.key]),
      monto: num(d.fila?.montos?.[col.key])
    }))
    const totalC = celdas.reduce((s, c) => s + c.cantidad, 0)
    const totalP = celdas.reduce((s, c) => s + c.monto, 0)
    if (totalC === 0 && totalP === 0) return
    filas.push({
      key: col.key,
      producto: col.producto,
      etiqueta: col.etiqueta || col.presentacion,
      celdas,
      totalC,
      totalP
    })
  })

  // Rowspan del nombre de producto: se muestra solo en la primera fila de cada grupo
  filas.forEach((fila, i) => {
    fila.inicioProducto = i === 0 || filas[i - 1].producto !== fila.producto
    if (fila.inicioProducto) {
      let n = 1
      while (i + n < filas.length && filas[i + n].producto === fila.producto) n++
      fila.rowspanProducto = n
    }
  })

  // Resumen por dia
  const resumenDias = dias.map((d, i) => {
    const cantidad = filas.reduce((s, f) => s + f.celdas[i].cantidad, 0)
    const monto = filas.reduce((s, f) => s + f.celdas[i].monto, 0)
    const comision = num(d.fila?.comision)
    const gasto = num(d.fila?.gastoExtra)
    return { cantidad, monto, comision, gasto, neto: monto - comision - gasto }
  })

  const suma = (clave) => resumenDias.reduce((s, r) => s + r[clave], 0)
  const totalGeneral = {
    cantidad: suma('cantidad'),
    monto: suma('monto'),
    comision: suma('comision'),
    gasto: suma('gasto'),
    neto: suma('neto')
  }

  return { dias, filas, resumenDias, totalGeneral }
}
