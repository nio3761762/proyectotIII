"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Inventario_controllers_1 = require("../controllers/Inventario.controllers");
const router = (0, express_1.Router)();
// Definir las rutas
router.post("/addInv", Inventario_controllers_1.createInventario); // Crear un registro en inventario
router.get("/getsInv", Inventario_controllers_1.getInventarios); // Obtener todos los registros de inventario
router.get("/getInv/:id", Inventario_controllers_1.getInventarioById); // Obtener un registro de inventario por ID
router.put("/updInv/:id", Inventario_controllers_1.updateInventario); // Actualizar un registro de inventario
router.delete("/delInv/:id", Inventario_controllers_1.deleteInventario); // Desactivar un registro de inventario
exports.default = router;
