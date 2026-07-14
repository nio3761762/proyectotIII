"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const Comprobante_controllers_1 = require("../controllers/Comprobante.controllers");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
router.get("/Comprobante", Comprobante_controllers_1.getComprobante);
exports.default = router;
