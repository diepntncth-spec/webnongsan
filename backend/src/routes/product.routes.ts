import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateJWT, authorizeRoles('manager'), productController.createProduct);
router.put('/:id', authenticateJWT, authorizeRoles('manager'), productController.updateProduct);
router.delete('/:id', authenticateJWT, authorizeRoles('manager'), productController.deleteProduct);

export default router;
