import { Router } from "express";
import { getTransferencias, registrarTransferencia, anularTransferencia, updateTransferencia, actualizarHoraTransferencia } from "../controllers/Transferencia.controllers";

const router = Router();

router.post("/transferencia", registrarTransferencia);
router.get("/gettransferencia", getTransferencias);
router.put("/anulartransferencia/:id", anularTransferencia);
router.put("/actualizartransferencia/:id", updateTransferencia);
router.put("/actualizarhoratransferencia/:id", actualizarHoraTransferencia);

export default router;