import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as staffService from '../services/staff.service';

export const getStaffByGarden = async (req: Request, res: Response): Promise<void> => {
  try {
    const garden_id = parseInt(req.params.gardenId as string, 10);
    const staff = await staffService.getStaffByGarden(garden_id);
    res.json(staff);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get staff';
    res.status(500).json({ error: msg });
  }
};

export const createStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { garden_id, full_name, phone, position } = req.body;

    if (!garden_id || !full_name) {
      res.status(400).json({ error: 'garden_id and full_name are required' });
      return;
    }

    const staff = await staffService.createStaff({
      garden_id: Number(garden_id),
      full_name,
      phone,
      position,
    });

    res.status(201).json(staff);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create staff';
    res.status(400).json({ error: msg });
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff_id = parseInt(req.params.id as string, 10);
    await staffService.deleteStaff(staff_id);
    res.json({ message: 'Staff deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete staff';
    res.status(400).json({ error: msg });
  }
};

export const getAllStaff = async (_req: Request, res: Response): Promise<void> => {
  try {
    const staff = await staffService.getAllStaff();
    res.json(staff);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get staff';
    res.status(500).json({ error: msg });
  }
};

export const updateStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff_id = parseInt(req.params.id as string, 10);
    const { full_name, phone, position, garden_id } = req.body;
    const staff = await staffService.updateStaff(staff_id, { full_name, phone, position, garden_id });
    res.json(staff);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update staff';
    res.status(400).json({ error: msg });
  }
};

export const getMyGarden = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const staff = await staffService.getStaffByAccountId(req.user.account_id);
    if (!staff) { res.status(404).json({ error: 'Staff profile not found' }); return; }
    res.json(staff);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get staff info';
    res.status(500).json({ error: msg });
  }
};
