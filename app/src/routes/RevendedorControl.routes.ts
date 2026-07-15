import { Router } from 'express';
import { 
  registrarRevendedorControl, 
  getRevendedorControls, 
  actualizarAjusteDetalle,
  actualizarControlCompleto,
  getRevendedores
} from '../controllers/RevendedorControl.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();
router.use(authMiddleware);

router.post('/revendedorControl', registrarRevendedorControl);
router.get('/revendedorControl', getRevendedorControls);
router.put('/revendedorControlDetalle/:idDetalle', actualizarAjusteDetalle);
router.put('/revendedorControl/:idControl', actualizarControlCompleto);
router.get('/revendedores', getRevendedores);

export default router;
