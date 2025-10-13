import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/auth/jwt.service';
import { UnauthorizedError } from '../utils/errors';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JWTService.verifyToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = JWTService.verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

export default requireAuth;
