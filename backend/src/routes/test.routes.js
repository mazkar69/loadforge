import { Router } from 'express';
import * as testController from '../controllers/test.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createTestSchema } from '../validators/test.validator.js';

const router = Router();

router.use(requireAuth);

router.post('/run', validateBody(createTestSchema), testController.startTest);
router.delete('/:id/cancel', testController.cancelTest);
router.get('/', testController.getTests);
router.get('/:id', testController.getTestById);
router.delete('/:id', testController.deleteTest);

export default router;
