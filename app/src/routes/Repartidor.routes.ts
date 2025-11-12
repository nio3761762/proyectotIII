import { Router } from "express";
import { createRepartidor, getRepartidores, getRepartidor, updateRepartidor, deleteRepartidor, getRepartidorActivos } from "../controllers/Repartidor.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware);
router.post("/repartidor", createRepartidor);
router.get("/repartidor", getRepartidores);
router.get("/repartidoractivo", getRepartidorActivos);
router.get("/repartidor/:id", getRepartidor);
router.put("/repartidor/:id", updateRepartidor);
router.delete("/repartidor/:id", deleteRepartidor);

export default router;
