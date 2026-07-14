import {Router} from 'express'
import { createCategoria, createSubCategoria, deleteCategoria, deleteSubCategoria, getCategoria, getCategorias, getSubCategoria, getSubCategorias, ListCategoria, updateCategoria, updateSubCategoria } from '../controllers/Categoria.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware)
router.post("/Categoria", createCategoria)
router.put('/Categoria/:id', updateCategoria)
router.get('/Categorias', getCategorias)
router.get('/ObtenerSubCategorias/:id', getCategoria)
router.get('/listacategoria',ListCategoria)
router.get('/ObtenerCategoria/:id', getSubCategoria)
router.delete('/Categorias/:id', deleteCategoria)
router.get('/SubCategorias/', getSubCategorias)
router.post("/SubCategoria", createSubCategoria)
router.put('/SubCategoria/:id', updateSubCategoria)
router.delete('/SubCategorias/:id', deleteSubCategoria)

export default router;