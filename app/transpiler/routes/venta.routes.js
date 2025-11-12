"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Venta_controllers_1 = require("../controllers/Venta.controllers");
const Presentacionproducto_controllers_1 = require("../controllers/Presentacionproducto.controllers");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: Endpoints para gestionar las ventas
 */
/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Registra una nueva venta con sus detalles
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ventas:
 *                 type: object
 *                 description: Datos generales de la venta.
 *                 example:
 *                   idCliente: "PER-00000001"
 *                   idUsuario: "USU-00000001"
 *                   idTipoVenta: "TV-00000001"
 *                   Monto: 550.00
 *                   Cambio: 0
 *                   IdMetodoPago: "MP-00000001"
 *               detalles:
 *                 type: object
 *                 description: Arrays de artículos vendidos.
 *                 example:
 *                   Producto:
 *                     - IdProducto: "PROD-000001"
 *                       Cantidad: 2
 *                       Precio: 150.00
 *                       IdSucursal: "SUC-0000001"
 *                   Promocion:
 *                     - IdPromocion: "PROM-00001"
 *                       Cantidad: 1
 *                       Precio: 250.00
 *                       IdSucursal: "SUC-0000001"
 *     responses:
 *       201:
 *         description: Venta registrada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       500:
 *         description: Error interno del servidor.
 */
/**
 * @swagger
 * /ventas/{id}/anular:
 *   put:
 *     summary: Anula una venta existente y restaura el stock
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la venta a anular (ej. V-00000001)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ventas:
 *                 type: object
 *                 properties:
 *                   IdSucursal:
 *                      type: string
 *                      description: El ID de la sucursal donde se debe restaurar el stock.
 *                      example: "SUC-0000001"
 *     responses:
 *       200:
 *         description: Venta anulada correctamente y stock restaurado.
 *       404:
 *         description: Venta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/ventas', Venta_controllers_1.registrarVenta);
router.get('/ventas', Venta_controllers_1.getVentas);
router.get('/ventasSucursal/:id/:fecha/:pago', Venta_controllers_1.getVentasSucursal);
router.get('/getVentasTodasSucursal', Venta_controllers_1.getVentasTodasSucursal);
router.get('/productosPorSucursal/:id', Presentacionproducto_controllers_1.getProductoSucursal);
router.get('/ventasUsuario/:id', Venta_controllers_1.getVentasUsuario);
router.put('/Anularventas/:id', Venta_controllers_1.anularVenta);
router.put('/updVenta/:id', Venta_controllers_1.updateVenta);
router.put('/agregarClienteVenta/:id', Venta_controllers_1.agregarClienteVenta);
exports.default = router;
