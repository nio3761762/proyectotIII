"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const Marca_controllers_1 = require("../controllers/Marca.controllers");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
router.get('/marcas', Marca_controllers_1.getMarcas);
exports.default = router;
