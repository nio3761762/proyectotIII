-- Índices para acelerar el reporte Producción vs Venta (y otros reportes por rango de fechas).
-- Ejecutar en la base de datos de producción (PostgreSQL). Uso:
--   psql -U postgres -d TallerIII -f indices_reportes.sql
--   (o pege el archivo en pgAdmin / DBeaver y ejecútelo)

CREATE INDEX IF NOT EXISTS idx_venta_fecha_estado ON venta (fechaventa, estado, idsucursal);
CREATE INDEX IF NOT EXISTS idx_venta_idsucursal ON venta (idsucursal);
CREATE INDEX IF NOT EXISTS idx_detalleventa_idventa ON detalleventa (idventa);

CREATE INDEX IF NOT EXISTS idx_produccion_fecha_estado ON produccion (fechaproduccion, estado, idsucursal);
CREATE INDEX IF NOT EXISTS idx_produccion_idsucursal ON produccion (idsucursal);
CREATE INDEX IF NOT EXISTS idx_detalleproduccion_idproduccion ON detalle_produccion (idproduccion);

CREATE INDEX IF NOT EXISTS idx_revendedorcontrol_fecha ON revendedorcontrol (fecha, estado, idsucursal);
CREATE INDEX IF NOT EXISTS idx_revendedorcontrol_idsucursal ON revendedorcontrol (idsucursal);
CREATE INDEX IF NOT EXISTS idx_revcontroldetalle_idcontrol ON revendedorcontroldetalle (idrevendedorcontrol);