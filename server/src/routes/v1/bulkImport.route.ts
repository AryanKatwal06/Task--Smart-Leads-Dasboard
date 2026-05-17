import { Router } from 'express';
import multer from 'multer';
import { protect } from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { bulkImportLeads } from '../../controllers/bulkImport.controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.use(protect);
router.use(roleMiddleware.authorize(['admin', 'sales']));

router.post('/import', upload.single('file'), bulkImportLeads);

export default router;
