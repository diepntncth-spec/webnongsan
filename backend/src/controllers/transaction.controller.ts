import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as transactionService from '../services/transaction.service';

export const getAllTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await transactionService.getAllTransactions();
    res.json(transactions);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get transactions';
    res.status(500).json({ error: msg });
  }
};

export const getMyTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const customer_id = await transactionService.getCustomerIdByAccountId(req.user.account_id);
    if (!customer_id) {
      res.status(404).json({ error: 'Customer profile not found' });
      return;
    }

    const transactions = await transactionService.getMyTransactions(customer_id);
    res.json(transactions);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get transactions';
    res.status(500).json({ error: msg });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const customer_id = await transactionService.getCustomerIdByAccountId(req.user.account_id);
    if (!customer_id) {
      res.status(404).json({ error: 'Customer profile not found' });
      return;
    }

    const { street, city, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items are required' });
      return;
    }

    const transaction = await transactionService.createTransaction(customer_id, {
      street,
      city,
      notes,
      items,
    });

    res.status(201).json(transaction);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create transaction';
    res.status(400).json({ error: msg });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction_id = parseInt(req.params.id as string, 10);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const transaction = await transactionService.updateTransactionStatus(transaction_id, status);
    res.json(transaction);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update transaction status';
    res.status(400).json({ error: msg });
  }
};
