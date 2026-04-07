import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as reportService from '../services/report.service';

export const getAllReports = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reports = await reportService.getAllReports();
    res.json(reports);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get reports';
    res.status(500).json({ error: msg });
  }
};

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const customer_id = await reportService.getCustomerIdByAccountId(req.user.account_id);
    if (!customer_id) {
      res.status(404).json({ error: 'Customer profile not found' });
      return;
    }

    const { product_id, location, detected_date, fake_method, evidence_url } = req.body;

    if (!product_id) {
      res.status(400).json({ error: 'product_id is required' });
      return;
    }

    const report = await reportService.createReport(customer_id, {
      product_id: Number(product_id),
      location,
      detected_date,
      fake_method,
      evidence_url,
    });

    res.status(201).json(report);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create report';
    res.status(400).json({ error: msg });
  }
};

export const approveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const report_id = parseInt(req.params.id as string, 10);
    const manager_id = await reportService.getManagerIdByAccountId(req.user.account_id);

    if (!manager_id) {
      res.status(404).json({ error: 'Manager profile not found' });
      return;
    }

    const { conclusion } = req.body;
    const report = await reportService.approveReport(report_id, manager_id, conclusion);
    res.json(report);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to approve report';
    res.status(400).json({ error: msg });
  }
};

export const getMyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const customer_id = await reportService.getCustomerIdByAccountId(req.user.account_id);
    if (!customer_id) { res.status(404).json({ error: 'Customer profile not found' }); return; }
    const reports = await reportService.getMyReports(customer_id);
    res.json(reports);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get reports';
    res.status(500).json({ error: msg });
  }
};

export const rejectReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const report_id = parseInt(req.params.id as string, 10);
    const manager_id = await reportService.getManagerIdByAccountId(req.user.account_id);

    if (!manager_id) {
      res.status(404).json({ error: 'Manager profile not found' });
      return;
    }

    const { conclusion } = req.body;
    const report = await reportService.rejectReport(report_id, manager_id, conclusion);
    res.json(report);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to reject report';
    res.status(400).json({ error: msg });
  }
};
