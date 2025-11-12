import { Router } from "express";
import {
    getBarrio,
 getBarrios,
 getCiudad,
 getDepartamento,
 getDistrito
} from "../controllers/Barrio.controllers"
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();


 router.use(authMiddleware)
router.get("/Barrio",getBarrios);
router.get("/getDepartamento",getDepartamento);
router.get("/getDistrito/:id",getDistrito);
router.get("/getBarrio/:id",getBarrio);
router.get("/getCiudad/:id",getCiudad);

export default router;