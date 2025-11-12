import { Router } from "express";
import {
  createSucursal,
  getSucursales,
  getSucursalById,
  updateSucursal,
  deleteSucursal
} from "../controllers/Sucursal.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware);
router.post("/Sucursal", createSucursal);
router.get("/Sucursales", getSucursales);
router.get("/BuscarSucursal/:id", getSucursalById);
router.put("/UpdSucursal/:id", updateSucursal);
router.delete("/DelSucursal/:id", deleteSucursal);

export default router;
