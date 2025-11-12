"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Persona_controllers_1 = require("../controllers/Persona.controllers");
const router = (0, express_1.Router)();
//router.use(authMiddleware)
router.put("/Usuariofoto/:id", Persona_controllers_1.SubirPhoto);
router.post('/Personas', Persona_controllers_1.CreatePersona);
router.put('/putPersona/:id', Persona_controllers_1.UpdatePersona);
router.get('/getPersonas', Persona_controllers_1.getPersonas);
router.delete('/deletePersona/:id', Persona_controllers_1.deletePersona);
router.get('/Persona/:id', Persona_controllers_1.getPersona);
router.get('/Clientes', Persona_controllers_1.getClientes);
exports.default = router;
