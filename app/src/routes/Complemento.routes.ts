import { Router } from "express";
import { getComplemento, getDocumento } from "../controllers/Complemento.controllers";
import { authMiddleware } from "../middleware/verifyToken";
import { getEmail } from "../controllers/Email.controllers";
import { getCelular } from "../controllers/Celular.controllers";

const router = Router();


router.use(authMiddleware)
router.get("/Complemento",getComplemento);
router.get("/getDocumento",getDocumento);
router.get("/getEmail",getEmail);
router.get("/getCelular",getCelular);
export default router;