import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Simple stub - just pass through for now
  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Simple stub - just pass through for now
  next();
};