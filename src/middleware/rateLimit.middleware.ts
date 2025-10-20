import { Request, Response, NextFunction } from 'express';

export const reviewLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Simple stub - just pass through for now
  next();
};

export const authLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Simple stub - just pass through for now
  next();
};