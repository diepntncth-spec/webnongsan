import { Router } from 'express';
import * as staffController from '../controllers/staff.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('manager'), staffController.getAllStaff);
router.get('/my-garden', authenticateJWT, authorizeRoles('staff'), staffController.getMyGarden);
router.get('/garden/:gardenId', authenticateJWT, staffController.getStaffByGarden);
router.post('/', authenticateJWT, authorizeRoles('manager'), staffController.createStaff);
router.patch('/:id', authenticateJWT, authorizeRoles('manager'), staffController.updateStaff);
router.delete('/:id', authenticateJWT, authorizeRoles('manager'), staffController.deleteStaff);

export default router;
