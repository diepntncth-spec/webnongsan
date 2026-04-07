import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    account_id: number;
    type: 'manager' | 'customer' | 'staff';
    username: string;
  };
}
