"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Barrio_controllers_1 = require("../controllers/Barrio.controllers");
const router = (0, express_1.Router)();
// router.use(authMiddleware)
router.get("/Barrio", Barrio_controllers_1.getBarrios);
router.get("/getDepartamento", Barrio_controllers_1.getDepartamento);
router.get("/getDistrito/:id", Barrio_controllers_1.getDistrito);
router.get("/getBarrio/:id", Barrio_controllers_1.getBarrio);
router.get("/getCiudad/:id", Barrio_controllers_1.getCiudad);
exports.default = router;
