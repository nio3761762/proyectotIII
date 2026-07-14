"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const Tipopromocion_controllers_1 = require("../controllers/Tipopromocion.controllers");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
router.get("/tipopromocion", Tipopromocion_controllers_1.getTipopromocions);
exports.default = router;
