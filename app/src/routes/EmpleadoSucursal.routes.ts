import { Router } from "express";
import { asignarEmpleadosSucursal, getEmpleadosSinSucursal } from "../controllers/EmpleadoSucursal.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware);
router.post("/empleado-sucursal/assign", asignarEmpleadosSucursal);
router.get("/empleados-sin-sucursal", getEmpleadosSinSucursal);

export default router;
