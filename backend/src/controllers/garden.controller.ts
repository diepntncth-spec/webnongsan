import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as gardenService from '../services/garden.service';

export const getAllGardens = async (_req: Request, res: Response): Promise<void> => {
  try {
    const gardens = await gardenService.getAllGardens();
    res.json(gardens);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get gardens';
    res.status(500).json({ error: msg });
  }
};

export const getGardenById = async (req: Request, res: Response): Promise<void> => {
  try {
    const garden_id = parseInt(req.params.id as string, 10);
    const garden = await gardenService.getGardenById(garden_id);

    if (!garden) {
      res.status(404).json({ error: 'Garden not found' });
      return;
    }

    res.json(garden);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get garden';
    res.status(500).json({ error: msg });
  }
};

export const createGarden = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const manager_id = await gardenService.getManagerIdByAccountId(req.user.account_id);
    if (!manager_id) {
      res.status(404).json({ error: 'Manager profile not found' });
      return;
    }

    const { name, area, street, city, soil_type } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Garden name is required' });
      return;
    }

    const garden = await gardenService.createGarden({
      manager_id,
      name,
      area: area ? Number(area) : undefined,
      street,
      city,
      soil_type,
    });

    res.status(201).json(garden);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create garden';
    res.status(400).json({ error: msg });
  }
};

export const updateGarden = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const garden_id = parseInt(req.params.id as string, 10);
    const { name, area, street, city, soil_type } = req.body;

    const garden = await gardenService.updateGarden(garden_id, {
      name,
      area: area ? Number(area) : undefined,
      street,
      city,
      soil_type,
    });

    res.json(garden);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update garden';
    res.status(400).json({ error: msg });
  }
};

export const deleteGarden = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const garden_id = parseInt(req.params.id as string, 10);
    await gardenService.deleteGarden(garden_id);
    res.json({ message: 'Garden deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete garden';
    res.status(400).json({ error: msg });
  }
};
