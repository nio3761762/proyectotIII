"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Cliente_controllers_1 = require("../controllers/Cliente.controllers");
const router = (0, express_1.Router)();
// Definir las rutas
router.post("/addCli", Cliente_controllers_1.createCliente); // Crear un nuevo cliente
router.post("/addCliUser", Cliente_controllers_1.registerUserAndClient); // Crear un nuevo cliente
router.get("/getsCli", Cliente_controllers_1.getClientes); // Obtener todos los clientes
router.get("/getCli/:id", Cliente_controllers_1.getClienteById); // Obtener un cliente por ID
router.put("/updCli/:id", Cliente_controllers_1.updateCliente); // Actualizar un cliente
router.delete("/delCli/:id", Cliente_controllers_1.deleteCliente); // Eliminar (desactivar) un cliente
exports.default = router;
