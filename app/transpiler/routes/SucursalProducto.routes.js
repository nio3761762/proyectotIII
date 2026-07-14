"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SucursalProducto_controllers_1 = require("../controllers/SucursalProducto.controllers");
const verifyToken_1 = require("../middleware/verifyToken"); // Descomentar si se necesita autenticación
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
router.get("/sucursalproductos", SucursalProducto_controllers_1.getProductosBySucursal);
router.get("/ObtenerSucursalproducto/:id", SucursalProducto_controllers_1.ObtenerSucursalproducto);
router.get("/sucursal-productos-summed/:categoriaId/:subcategoriaId", SucursalProducto_controllers_1.getAllProductsWithSummedQuantities);
router.get("/getAllPaquetsWithSummedQuantities/:id", SucursalProducto_controllers_1.getAllPaquetsWithSummedQuantities);
router.get("/unique-packages-summed", SucursalProducto_controllers_1.getUniquePackagesWithSummedQuantities); // New route
router.put("/IncrementProducto/:id", SucursalProducto_controllers_1.IncrementProductosucursal);
router.put("/IncrementProductoCantidad/:id", SucursalProducto_controllers_1.IncrementProductoCantidad);
router.get("/getProductoPromocion/:id", SucursalProducto_controllers_1.getProductoPromocion);
exports.default = router;
