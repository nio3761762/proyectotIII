"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdmDatos_controllers_1 = require("../controllers/AdmDatos.controllers");
const router = (0, express_1.Router)();
//router.use(authMiddleware)
router.get("/Datos", AdmDatos_controllers_1.getDatos);
router.put("/AdmDatos/:id", AdmDatos_controllers_1.updateDatos);
router.put("/AdmDatosPhoto/:id", AdmDatos_controllers_1.updateDatosPhoto);
exports.default = router;
