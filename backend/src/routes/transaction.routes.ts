import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('manager'), transactionController.getAllTransactions);
router.get('/my', authenticateJWT, authorizeRoles('customer'), transactionController.getMyTransactions);
router.post('/', authenticateJWT, authorizeRoles('customer'), transactionController.createTransaction);
router.patch('/:id/status', authenticateJWT, authorizeRoles('manager'), transactionController.updateTransactionStatus);

export default router;
