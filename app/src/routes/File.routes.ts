import { Router } from 'express';
import { uploadFile as uploadFileController } from '../controllers/File.controllers';
import { uploadFile } from '../config/file-multer';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.post('/upload-Archivo', uploadFile.single('archivo'), uploadFileController);

export default router;
