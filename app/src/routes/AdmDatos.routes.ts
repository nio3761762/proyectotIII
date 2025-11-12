import { Router } from "express";
import {
  getDatos,
  updateDatos,
  updateDatosPhoto,
} from "../controllers/AdmDatos.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();


router.use(authMiddleware)
router.get("/Datos",getDatos);
router.put("/AdmDatos/:id", updateDatos);
router.put("/AdmDatosPhoto/:id", updateDatosPhoto);

export default router;