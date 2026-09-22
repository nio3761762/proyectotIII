import { Router } from "express";
import { authMiddleware } from "../middleware/verifyToken";
import { generarStockDiario, listarStockDiario } from "../controllers/StockDiario.controllers";

const router = Router();

router.use(authMiddleware);
router.post("/stock-diario/generar", generarStockDiario);
router.get("/stock-diario", listarStockDiario);

export default router;