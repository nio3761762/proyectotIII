"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Empleado_controllers_1 = require("../controllers/Empleado.controllers");
const router = (0, express_1.Router)();
// Rutas para empleados
router.post("/addEmp", Empleado_controllers_1.createEmpleado); // Crear un nuevo empleado
router.post("/addUserEmpl", Empleado_controllers_1.registerUserAndEmpl); // Crear un nuevo empleado
router.get("/getsEmp", Empleado_controllers_1.getEmpleados); // Obtener todos los empleados
router.get("/getEmp/:id", Empleado_controllers_1.getEmpleadoById); // Obtener un empleado por ID
router.put("/updEmp/:id", Empleado_controllers_1.updateEmpleado); // Actualizar un empleado
router.delete("/delEmp/:id", Empleado_controllers_1.deleteEmpleado); // Eliminar (desactivar) un empleado
exports.default = router;
