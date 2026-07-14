"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const Direccion_controllers_1 = require("../controllers/Direccion.controllers");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
router.get('/obtenerDIreccion/:id', Direccion_controllers_1.obtenerDIreccion);
exports.default = router;
