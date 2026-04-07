import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    // Format: simple_token_{account_id}_{timestamp}
    const parts = token.split('_');
    if (parts.length < 4 || parts[0] !== 'simple' || parts[1] !== 'token') {
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    const account_id = parseInt(parts[2], 10);
    if (isNaN(account_id)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const account = await prisma.account.findUnique({
      where: { account_id },
    });

    if (!account) {
      res.status(401).json({ error: 'Account not found' });
      return;
    }

    if (account.status !== 'active') {
      res.status(403).json({ error: 'Account is not active' });
      return;
    }

    req.user = {
      account_id: account.account_id,
      type: account.type as 'manager' | 'customer' | 'staff',
      username: account.username,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.type)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
