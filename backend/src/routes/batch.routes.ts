import { Router } from 'express';
import * as batchController from '../controllers/batch.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/lookup', batchController.lookupBatch);
router.get('/', authenticateJWT, authorizeRoles('manager', 'staff'), batchController.getAllBatches);
router.get('/product/:productId', batchController.getBatchesByProduct);
router.post('/', authenticateJWT, authorizeRoles('manager', 'staff'), batchController.createBatch);
router.put('/:id', authenticateJWT, authorizeRoles('manager', 'staff'), batchController.updateBatch);
router.delete('/:id', authenticateJWT, authorizeRoles('manager', 'staff'), batchController.deleteBatch);

export default router;
