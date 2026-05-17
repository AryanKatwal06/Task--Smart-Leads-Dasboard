import { Router } from 'express';
import { protect } from '../../middlewares/auth';
import {
  createSavedFilter,
  getSavedFilters,
  getSavedFilterById,
  updateSavedFilter,
  deleteSavedFilter
} from '../../controllers/savedFilter.controller';

const router = Router();

router.use(protect);

router.get('/', getSavedFilters);
router.post('/', createSavedFilter);
router.get('/:id', getSavedFilterById);
router.patch('/:id', updateSavedFilter);
router.delete('/:id', deleteSavedFilter);

export default router;
