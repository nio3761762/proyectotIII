import { Router } from "express";
import {  SubirPhoto, CreatePersona, deletePersona, getClientes, getPersona, getPersonas, UpdatePersona  } from "../controllers/Persona.controllers";
import { } from '../controllers/Persona.controllers';
import { authMiddleware } from "../middleware/verifyToken";


const router = Router();

router.use(authMiddleware)
router.put("/Usuariofoto/:id",SubirPhoto);
router.post('/Personas', CreatePersona);
router.put('/putPersona/:id', UpdatePersona);
router.get('/getPersonas', getPersonas);
router.delete('/deletePersona/:id', deletePersona);
router.get('/Persona/:id', getPersona);
router.get('/Clientes', getClientes);

export default router;
