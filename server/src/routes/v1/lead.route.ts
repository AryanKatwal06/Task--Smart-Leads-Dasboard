import { Router } from 'express';
import { protect } from '../../middlewares/auth';
import { authorize } from '../../middlewares/role';
import { validateBody } from '../../validators/zod';
import { createLeadSchema, updateLeadSchema } from '../../validators/lead.validator';
import { createLead, getLeads, getLead, updateLead, deleteLead, getAnalytics, exportLeads, listExportsController, downloadExportController } from '../../controllers/lead.controller';

const router = Router();

router.use(protect);
router.use(authorize(['admin', 'sales']));

router.get('/analytics', getAnalytics);
router.get('/export', exportLeads);
router.get('/exports', listExportsController);
router.get('/exports/download/:filename', downloadExportController);
router.get('/', getLeads);
router.post('/', validateBody(createLeadSchema), createLead);
router.get('/:id', getLead);
router.patch('/:id', validateBody(updateLeadSchema), updateLead);
router.delete('/:id', deleteLead);

export default router;
