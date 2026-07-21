import { Router } from "express";

import { authMiddleware } from "../middleware/verifyToken";
import { getInventario, listarBajas, registrarBajaInventario } from "../controllers/Inventario.controllers";

const router = Router();


router.use(authMiddleware)
router.get("/getInventario",getInventario);
router.get("/inventario/baja", listarBajas);
router.post("/inventario/baja", registrarBajaInventario);


export default router;