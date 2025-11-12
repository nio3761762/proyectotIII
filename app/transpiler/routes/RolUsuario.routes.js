"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RolUsuario_controller_1 = require("../controllers/RolUsuario.controller");
const router = (0, express_1.Router)();
router.post('/Rolusuario', RolUsuario_controller_1.AsignarRol);
router.put('/Rolusuario/:id', RolUsuario_controller_1.AsignarupdateRol);
exports.default = router;
