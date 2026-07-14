"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const Inventario_controllers_1 = require("../controllers/Inventario.controllers");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
router.get("/getInventario", Inventario_controllers_1.getInventario);
exports.default = router;
