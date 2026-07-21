import { Router } from "express";
import { getTransferencias, registrarTransferencia, anularTransferencia, updateTransferencia } from "../controllers/Transferencia.controllers";

const router = Router();

router.post("/transferencia", registrarTransferencia);
router.get("/gettransferencia", getTransferencias);
router.put("/anulartransferencia/:id", anularTransferencia);
router.put("/actualizartransferencia/:id", updateTransferencia);

export default router;