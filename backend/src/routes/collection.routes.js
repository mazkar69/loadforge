import { Router } from 'express';
import * as collectionController from '../controllers/collection.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createCollectionSchema, addRequestSchema, addFolderSchema } from '../validators/collection.validator.js';

const router = Router();
router.use(requireAuth);

router.post('/', validateBody(createCollectionSchema), collectionController.createCollection);
router.get('/', collectionController.getCollections);
router.post('/import', collectionController.importCollection);
router.get('/:id', collectionController.getCollectionById);
router.put('/:id', validateBody(createCollectionSchema), collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);
router.post('/:id/duplicate', collectionController.duplicateCollection);
router.get('/:id/export', collectionController.exportCollection);
router.post('/:id/requests', validateBody(addRequestSchema), collectionController.addRequest);
router.delete('/:id/requests/:requestId', collectionController.deleteRequest);
router.post('/:id/folders', validateBody(addFolderSchema), collectionController.addFolder);

export default router;
