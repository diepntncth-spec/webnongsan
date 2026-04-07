import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile/me', authenticateJWT, authController.getMyProfile);
router.get('/profile/:id', authController.getProfileById);
router.put('/profile', authenticateJWT, authController.updateProfile);
router.post('/change-password', authenticateJWT, authController.changePassword);
router.post('/register-staff', authenticateJWT, authorizeRoles('manager'), authController.registerStaff);

export default router;
