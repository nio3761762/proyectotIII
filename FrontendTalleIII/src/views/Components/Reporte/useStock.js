// Regla de stock/restante compartida: mismo criterio que la vista diaria
// (TurnoBloque.vue → restante por fila). Cuando una presentación compuesta
// consume unidades de otra (p.ej. bolsa x5 galletas), esas cantidades se restan
// del stock base aunque este no alcanzara, y si el backend ya entregó `restante`
// para la fila/turno, se usa ese valor (ya incluye absorciones).
export const keyOfProducto = (p) => String(p.idproducto) + '::' + (p.presentacion || 'Unidad')

export const restanteItem = (p, stockInicioPorProducto, keyOf = keyOfProducto) => {
  if (!p) return 0
  if (p.consumida) return 0
  if (p.restante != null) return Number(p.restante) || 0
  const inicio = p.inicio != null
    ? (Number(p.inicio) || 0)
    : (Number((stockInicioPorProducto || {})[keyOf(p)]) || 0)
  const factor = Math.max(1, Number(p.presentacion_factor) || 1)
  return inicio
    + (Number(p.cantidad_producida) || 0)
    - (Number(p.cantidad_mala) || 0)
    - (Number(p.cantidad_vendida_total) || 0)
    - ((Number(p.consumo_eq_unidades) || 0) / factor)
}