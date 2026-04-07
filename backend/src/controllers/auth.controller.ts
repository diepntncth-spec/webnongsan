import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as authService from '../services/auth.service';
import prisma from '../lib/prisma';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email, full_name, phone_number, type, organization_name } = req.body;

    if (!username || !password || !email || !full_name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const account = await authService.registerUser({
      username,
      password,
      email,
      full_name,
      phone_number,
      type: type || 'customer',
      organization_name,
    });

    res.status(201).json({ message: 'Registration successful', account_id: account.account_id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ error: msg });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    const { token, account } = await authService.loginUser(username, password);

    res.json({
      token,
      user: {
        account_id: account.account_id,
        username: account.username,
        email: account.email,
        type: account.type,
        status: account.status,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ error: msg });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const profile = await authService.getProfileByAccountId(req.user.account_id);
    res.json(profile);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get profile';
    res.status(500).json({ error: msg });
  }
};

export const getProfileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const account_id = parseInt(req.params.id as string, 10);
    const profile = await authService.getProfileByAccountId(account_id);
    res.json(profile);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get profile';
    res.status(404).json({ error: msg });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { full_name, phone_number } = req.body;
    const updated = await authService.updateCustomerProfile(req.user.account_id, {
      full_name,
      phone_number,
    });

    res.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update profile';
    res.status(400).json({ error: msg });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      res.status(400).json({ error: 'Old and new password required' });
      return;
    }

    await authService.changePassword(req.user.account_id, old_password, new_password);
    res.json({ message: 'Password changed successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to change password';
    res.status(400).json({ error: msg });
  }
};

export const registerStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Manager creates a login account for an existing staff member
    const { staff_id, username, password, email } = req.body;
    if (!staff_id || !username || !password || !email) {
      res.status(400).json({ error: 'staff_id, username, password, email are required' });
      return;
    }

    const existing = await prisma.account.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    const account = await prisma.account.create({
      data: { username, password, email, type: 'staff', status: 'active' },
    });

    // Link account to staff
    await prisma.staff.update({
      where: { staff_id: Number(staff_id) },
      data: { account_id: account.account_id },
    });

    res.status(201).json({ message: 'Staff account created', account_id: account.account_id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create staff account';
    res.status(400).json({ error: msg });
  }
};
