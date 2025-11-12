"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Medida_controllers_1 = require("../controllers/Medida.controllers");
const router = (0, express_1.Router)();
//router.use(authMiddleware)
router.post("/UnidadMedida", Medida_controllers_1.createUnidadMedida);
router.put('/UnidadMedida/:id', Medida_controllers_1.updateUnidadMedida);
router.get('/UnidadMedidas', Medida_controllers_1.getUnidadMedidas);
router.delete('/UnidadMedidas/:id', Medida_controllers_1.deleteUnidadMedida);
router.get('/UnidadMedida/:id', Medida_controllers_1.getUnidadMedida);
exports.default = router;
