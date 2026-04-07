import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import gardenRoutes from './routes/garden.routes';
import staffRoutes from './routes/staff.routes';
import certificationRoutes from './routes/certification.routes';
import productRoutes from './routes/product.routes';
import batchRoutes from './routes/batch.routes';
import transactionRoutes from './routes/transaction.routes';
import reportRoutes from './routes/report.routes';
import categoryRoutes from './routes/category.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gardens', gardenRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
