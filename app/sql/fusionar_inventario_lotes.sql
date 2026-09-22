-- ============================================================================
-- MIGRACIÓN: INVENTARIO A "UN REGISTRO POR (PRODUCTO|INSUMO, SUCURSAL)"
-- Fusiona los lotes existentes de la tabla `inventario` en un solo registro
-- por producto+ sucursal y por insumo + sucursal.
--   - stock       = suma de los stocks de los lotes (SÍEMPRE en unidad base)
--   - costounitario = promedio ponderado por stock (costo * stock) / stock
--   - estado      = 1 si la suma de stock > 0
--   - Se conserva el registro con la fecha de ingreso más reciente
--     (se quedan con su fechai ngreso, referencias, precio, unidad, etc.)
--   - Los movimientos de `movimiento_inventario` se reapuntan al registro
--     conservado para no perder el histórico (kárdex).
-- ============================================================================
BEGIN;

-- 1. Identificar el registro a conservar por grupo y las sumas del grupo
CREATE TEMP TABLE grupos AS
SELECT
  COALESCE(idproducto, '') AS _prod,
  COALESCE(idinsumo, '') AS _insumo,
  idsucursal,
  idinventario,
  stock,
  costounitario,
  ROW_NUMBER() OVER (
    PARTITION BY COALESCE(idproducto, ''), COALESCE(idinsumo, ''), idsucursal
    ORDER BY fechaingreso DESC NULLS LAST, estado DESC, idinventario
  ) AS rn,
  SUM(COALESCE(stock, 0)) OVER (
    PARTITION BY COALESCE(idproducto, ''), COALESCE(idinsumo, ''), idsucursal
  ) AS stock_total,
  SUM(COALESCE(stock, 0) * COALESCE(costounitario, 0)) OVER (
    PARTITION BY COALESCE(idproducto, ''), COALESCE(idinsumo, ''), idsucursal
  ) AS costo_total
FROM inventario;

-- 2. Actualizar el registro conservado (rn = 1) con las sumas del grupo
UPDATE inventario inv
SET
  stock = g.stock_total,
  estado = CASE WHEN g.stock_total > 0 THEN 1 ELSE inv.estado END,
  costounitario = CASE
    WHEN COALESCE(g.stock_total, 0) > 0 THEN g.costo_total / g.stock_total
    ELSE inv.costounitario
  END
FROM grupos g
WHERE inv.idinventario = g.idinventario AND g.rn = 1;

-- 3. Reapuntar los movimientos de inventario al registro conservado
UPDATE movimiento_inventario m
SET idinventario = g1.idinventario
FROM grupos g_old
JOIN grupos g1
  ON g1._prod = g_old._prod
 AND g1._insumo = g_old._insumo
 AND g1.idsucursal = g_old.idsucursal
 AND g1.rn = 1
WHERE m.idinventario = g_old.idinventario AND g_old.rn <> 1;

-- 4. Eliminar los lotes sobrantes
DELETE FROM inventario inv
USING grupos g
WHERE inv.idinventario = g.idinventario AND g.rn <> 1;

DROP TABLE grupos;

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (opcional)
-- ============================================================================
-- Debe dar 0 filas si todo quedó bien (un solo registro por grupo):
-- SELECT
--   COALESCE(idproducto, idinsumo) AS item,
--   idsucursal,
--   COUNT(*) AS registros_por_grupo
-- FROM inventario
-- GROUP BY COALESCE(idproducto, idinsumo), idsucursal
-- HAVING COUNT(*) > 1;