import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/my', authenticateJWT, authorizeRoles('customer'), reportController.getMyReports);
router.get('/', authenticateJWT, authorizeRoles('manager'), reportController.getAllReports);
router.post('/', authenticateJWT, authorizeRoles('customer'), reportController.createReport);
router.put('/:id/approve', authenticateJWT, authorizeRoles('manager'), reportController.approveReport);
router.put('/:id/reject', authenticateJWT, authorizeRoles('manager'), reportController.rejectReport);

export default router;
