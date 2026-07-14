import { Router } from "express";
import { registrarCompra, getCompras, getCompra, anularCompra, updateCompra } from "../controllers/Compra.controllers";
import { registrarGastoGeneral, getGastosGenerales, getGastoGeneral, updateGastoGeneral, anularGastoGeneral } from "../controllers/GastoGeneral.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware)

router.post("/registrarCompra", registrarCompra);
router.get("/getCompras", getCompras);
router.get("/getCompra/:id", getCompra);
router.put("/actualizarCompra/:id", updateCompra);
router.delete("/anularCompra/:id", anularCompra);

router.post("/registrarGastoGeneral", registrarGastoGeneral);
router.get("/getGastosGenerales", getGastosGenerales);
router.get("/getGastoGeneral/:id", getGastoGeneral);
router.put("/actualizarGastoGeneral/:id", updateGastoGeneral);
router.delete("/anularGastoGeneral/:id", anularGastoGeneral);

export default router;
