import { Router } from 'express';
import * as certController from '../controllers/certification.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('manager'), certController.getAllCertifications);
router.get('/garden/:gardenId', authenticateJWT, certController.getCertificationsByGarden);
router.post('/', authenticateJWT, authorizeRoles('manager'), certController.createCertification);
router.patch('/:id', authenticateJWT, authorizeRoles('manager'), certController.updateCertification);
router.delete('/:id', authenticateJWT, authorizeRoles('manager'), certController.deleteCertification);

export default router;
