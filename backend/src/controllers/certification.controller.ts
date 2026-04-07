import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as certService from '../services/certification.service';

export const getCertificationsByGarden = async (req: Request, res: Response): Promise<void> => {
  try {
    const garden_id = parseInt(req.params.gardenId as string, 10);
    const certs = await certService.getCertificationsByGarden(garden_id);
    res.json(certs);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get certifications';
    res.status(500).json({ error: msg });
  }
};

export const createCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { garden_id, name, issue_date, expiry_date, issuing_authority } = req.body;

    if (!garden_id || !name) {
      res.status(400).json({ error: 'garden_id and name are required' });
      return;
    }

    const cert = await certService.createCertification({
      garden_id: Number(garden_id),
      name,
      issue_date,
      expiry_date,
      issuing_authority,
    });

    res.status(201).json(cert);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create certification';
    res.status(400).json({ error: msg });
  }
};

export const getAllCertifications = async (_req: Request, res: Response): Promise<void> => {
  try {
    const certs = await certService.getAllCertifications();
    res.json(certs);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get certifications';
    res.status(500).json({ error: msg });
  }
};

export const updateCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const certification_id = parseInt(req.params.id as string, 10);
    const { name, issue_date, expiry_date, issuing_authority, garden_id } = req.body;
    const cert = await certService.updateCertification(certification_id, { name, issue_date, expiry_date, issuing_authority, garden_id });
    res.json(cert);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update certification';
    res.status(400).json({ error: msg });
  }
};

export const deleteCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const certification_id = parseInt(req.params.id as string, 10);
    await certService.deleteCertification(certification_id);
    res.json({ message: 'Certification deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete certification';
    res.status(400).json({ error: msg });
  }
};
