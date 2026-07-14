import { Router } from "express";
import {
  createSucursal,
  getSucursales,
  getSucursalById,
  updateSucursal,
  deleteSucursal,
  Listsucursal,
  CreateGastos,
  ListGasto,
  getSucursalDireccion
} from "../controllers/Sucursal.controllers";
import { authMiddleware } from "../middleware/verifyToken";
import { getHornos, UpdateORPostHorno } from "../controllers/Horno.controllers";

const router = Router();

router.use(authMiddleware);
router.get("/gethornos/:id", getHornos);
router.put("/UpdateORPostHorno", UpdateORPostHorno);
router.post("/CreateGastos",CreateGastos);
router.get('/ListGasto',ListGasto);
router.post("/Sucursal", createSucursal);
router.get("/Sucursales", getSucursales);
router.get("/BuscarSucursal/:id", getSucursalById);
router.get("/getSucursalDireccion/:id", getSucursalDireccion);
router.put("/UpdSucursal/:id", updateSucursal);
router.delete("/DelSucursal/:id", deleteSucursal);
router.get('/Listsucursal',Listsucursal)

export default router;
