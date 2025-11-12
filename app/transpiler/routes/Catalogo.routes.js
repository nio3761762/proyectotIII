"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Catalogo_controllers_1 = require("../controllers/Catalogo.controllers");
const router = (0, express_1.Router)();
// Rutas para Catálogo
router.post("/addcat", Catalogo_controllers_1.createCatalogo); // Crear un nuevo catálogo
router.get("/getscat", Catalogo_controllers_1.getCatalogos); // Obtener todos los catálogos
router.get("/getcat/:id", Catalogo_controllers_1.getCatalogoById); // Obtener un catálogo por ID
router.put("/updcat/:id", Catalogo_controllers_1.updateCatalogo); // Actualizar un catálogo
router.delete("/delcat/:id", Catalogo_controllers_1.deleteCatalogo); // Eliminar (desactivar) un catálogo
exports.default = router;
