"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Ingredientes_controllers_1 = require("../controllers/Ingredientes.controllers");
const router = (0, express_1.Router)();
// Ruta para obtener la receta (ingredientes) de un producto específico
router.get('/getProductoIngrediente/:id', Ingredientes_controllers_1.getProductoIngrediente);
// Ruta para registrar la producción de un producto, actualizar su receta y ajustar el stock
router.post('/registrarProduccionDeProducto', Ingredientes_controllers_1.registrarProduccionDeProducto);
// Ruta para actualizar la receta de un producto (múltiples ingredientes: insertar/actualizar/eliminar)
router.put('/actualizarIngredienteReceta/:id', Ingredientes_controllers_1.actualizarIngredienteReceta);
// Ruta para eliminar un ingrediente específico de una receta (sin ajustar stock)
router.delete('/eliminarIngredienteReceta/:id', Ingredientes_controllers_1.eliminarIngredienteReceta);
exports.default = router;
