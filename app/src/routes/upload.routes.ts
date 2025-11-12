import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from "../middleware/verifyToken"; 

const router = Router();

router.use(authMiddleware);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // carpeta donde se guardan las imágenes
  },
  filename: (req, File, cb) => {
    cb(null, Date.now() + path.extname(File.originalname)); // nombre único
  },
});

const upload = multer({ storage });

// Ruta para subir imagen
router.post('/upload',upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });

  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
