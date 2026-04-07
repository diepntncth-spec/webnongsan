import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as batchService from '../services/batch.service';

export const getAllBatches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const batches = await batchService.getAllBatches();
    res.json(batches);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get batches';
    res.status(500).json({ error: msg });
  }
};

export const getBatchesByProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product_id = parseInt(req.params.productId as string, 10);
    const batches = await batchService.getBatchesByProduct(product_id);
    res.json(batches);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get batches';
    res.status(500).json({ error: msg });
  }
};

export const createBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_id, batch_no, harvest_date, expiry_date, initial_quantity, current_quantity, status } = req.body;

    if (!product_id || !batch_no) {
      res.status(400).json({ error: 'product_id and batch_no are required' });
      return;
    }

    const batch = await batchService.createBatch({
      product_id: Number(product_id),
      batch_no,
      harvest_date,
      expiry_date,
      initial_quantity: initial_quantity !== undefined ? Number(initial_quantity) : undefined,
      current_quantity: current_quantity !== undefined ? Number(current_quantity) : undefined,
      status,
    });

    res.status(201).json(batch);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create batch';
    res.status(400).json({ error: msg });
  }
};

export const updateBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const batch_id = parseInt(req.params.id as string, 10);
    const { batch_no, harvest_date, expiry_date, initial_quantity, current_quantity, status } = req.body;

    const batch = await batchService.updateBatch(batch_id, {
      batch_no,
      harvest_date,
      expiry_date,
      initial_quantity: initial_quantity !== undefined ? Number(initial_quantity) : undefined,
      current_quantity: current_quantity !== undefined ? Number(current_quantity) : undefined,
      status,
    });

    res.json(batch);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update batch';
    res.status(400).json({ error: msg });
  }
};

export const lookupBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { batch_no } = req.query;
    if (!batch_no || typeof batch_no !== 'string') {
      res.status(400).json({ error: 'batch_no is required' });
      return;
    }
    const batch = await batchService.lookupBatch(batch_no);
    if (!batch) {
      res.status(404).json({ error: 'Batch not found' });
      return;
    }

    // Flatten nested structure for frontend
    const { product, ...batchFields } = batch as any;
    const { garden, ...productFields } = product || {};
    const { certifications, manager, ...gardenFields } = garden || {};

    res.json({
      ...batchFields,
      product: productFields,
      garden: { ...gardenFields, manager },
      certifications: certifications || [],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to lookup batch';
    res.status(500).json({ error: msg });
  }
};

export const deleteBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const batch_id = parseInt(req.params.id as string, 10);
    await batchService.deleteBatch(batch_id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete batch';
    res.status(400).json({ error: msg });
  }
};
