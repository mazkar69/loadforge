import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/:testId/json', reportController.downloadJSON);
router.get('/:testId/csv', reportController.downloadCSV);
router.get('/:testId/pdf', reportController.downloadPDF);

export default router;
