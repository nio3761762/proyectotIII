"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProveedorProducto_controllers_1 = require("../controllers/ProveedorProducto.controllers");
const router = (0, express_1.Router)();
// Definir las rutas
router.post("/addpp", ProveedorProducto_controllers_1.createProveedorProducto); // Crear una relación entre proveedor y producto
router.get("/getspp", ProveedorProducto_controllers_1.getProveedorProductos); // Obtener todas las relaciones
router.get("/getpp/:Proveedor_Id/:Producto_Id", ProveedorProducto_controllers_1.getProveedorProductoByIds); // Obtener una relación específica
router.put("/updpp/:Proveedor_Id/:Producto_Id", ProveedorProducto_controllers_1.updateProveedorProducto); // Actualizar una relación
router.delete("/delpp/:Proveedor_Id/:Producto_Id", ProveedorProducto_controllers_1.deleteProveedorProducto); // Eliminar una relación
exports.default = router;
