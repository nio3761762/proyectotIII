const SIN_PRODUCTO = 'Sin Producto'
const SIN_PRESENTACION = 'S/D'

const texto = (valor) => {
  if (valor === null || valor === undefined) return ''
  return String(valor).trim()
}

const colacion = (a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })

const nombreProducto = (item) =>
  texto(item?.producto) || texto(item?.idproducto) || SIN_PRODUCTO

const nombrePresentacion = (item) =>
  texto(item?.presentacion) || texto(item?.idpresentacion) || SIN_PRESENTACION

export const etiquetaPresentacion = (item) =>
  texto(item?.presentacion_abreviatura) || nombrePresentacion(item)

/**
 * La clave de columna se construye con el nombre real de la presentacion, nunca
 * con la abreviatura. Si se usara la abreviatura, dos registros de presentacion
 * distintos (por ejemplo "Budineria" con abreviatura "Bd" y otra sin abreviatura)
 * generarian columnas duplicadas con el mismo producto, desalineando el resumen.
 */
export const claveColumna = (item) =>
  `${nombreProducto(item)}||${nombrePresentacion(item)}`

/**
 * Devuelve las columnas ordenadas de forma determinista y los grupos de producto
 * derivados de esa misma lista, de modo que la suma de los `colspan` de los grupos
 * siempre coincide exactamente con el numero de columnas de datos.
 */
export const construirColumnas = (items) => {
  const mapa = new Map()

  for (const item of Array.isArray(items) ? items : []) {
    const producto = nombreProducto(item)
    const presentacion = nombrePresentacion(item)
    const key = `${producto}||${presentacion}`
    if (mapa.has(key)) continue
    mapa.set(key, {
      key,
      producto,
      idproducto: texto(item?.idproducto),
      presentacion,
      idpresentacion: texto(item?.idpresentacion),
      etiqueta: etiquetaPresentacion(item)
    })
  }

  const columnas = [...mapa.values()].sort(
    (a, b) => colacion(a.producto, b.producto) || colacion(a.presentacion, b.presentacion)
  )

  const porProducto = new Map()
  const grupos = []
  for (const columna of columnas) {
    let grupo = porProducto.get(columna.producto)
    if (!grupo) {
      grupo = { producto: columna.producto, idproducto: columna.idproducto, presentaciones: [] }
      porProducto.set(columna.producto, grupo)
      grupos.push(grupo)
    }
    grupo.presentaciones.push(columna)
  }

  return { grupos, columnas }
}

export const construirCeldas = (items, columnas, campoCantidad) => {
  const celdas = Object.create(null)
  columnas.forEach((columna) => { celdas[columna.key] = 0 })
  for (const item of Array.isArray(items) ? items : []) {
    const key = claveColumna(item)
    if (key in celdas) celdas[key] += Number(item?.[campoCantidad] || 0)
  }
  return celdas
}

export const sumarColumnas = (empleados, columnas) => {
  const totalPorColumna = Object.create(null)
  columnas.forEach((columna) => {
    totalPorColumna[columna.key] = empleados.reduce(
      (suma, emp) => suma + (emp.celdas[columna.key] || 0), 0
    )
  })
  return totalPorColumna
}