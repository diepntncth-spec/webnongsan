import { Router } from 'express';
import * as gardenController from '../controllers/garden.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', gardenController.getAllGardens);
router.get('/:id', gardenController.getGardenById);
router.post('/', authenticateJWT, authorizeRoles('manager'), gardenController.createGarden);
router.put('/:id', authenticateJWT, authorizeRoles('manager'), gardenController.updateGarden);
router.delete('/:id', authenticateJWT, authorizeRoles('manager'), gardenController.deleteGarden);

export default router;
