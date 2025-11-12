"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MetodoPago_controllers_1 = require("../controllers/MetodoPago.controllers");
const router = (0, express_1.Router)();
// Ruta para crear un Método de Pago
router.post("/addMet", MetodoPago_controllers_1.createMetodoPago);
router.get("/Met", MetodoPago_controllers_1.getMetodosPago);
exports.default = router;
