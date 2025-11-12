import { Router } from "express";
import { registrarCompra, getCompras, getCompra, updateCompra, anularCompra } from "../controllers/Compra.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware)
router.post("/registrarCompra", registrarCompra);
router.get("/getCompras/:fecha", getCompras);
router.get("/getCompra/:id", getCompra);
router.put("/updateCompra/:id", updateCompra);
router.put("/anularCompra/:id", anularCompra);

export default router;
