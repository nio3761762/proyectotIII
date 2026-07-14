import { Router } from "express";

import { authMiddleware } from "../middleware/verifyToken";
import { getInventario } from "../controllers/Inventario.controllers";

const router = Router();


router.use(authMiddleware)
router.get("/getInventario",getInventario);


export default router;