import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/auth/jwt.service.ts';
import { UnauthorizedError } from '../utils/errors.ts';
import { prisma } from '../config/database.ts';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        privyUserId: string | null;
        verificationLevel: number;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JWTService.verifyToken(token);

    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        privyUserId: true,
        verificationLevel: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      privyUserId: user.privyUserId,
      verificationLevel: user.verificationLevel,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message,
        },
      });
    }
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Verify token
        const payload = JWTService.verifyToken(token);

        // Fetch user from database
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            privyUserId: true,
            verificationLevel: true,
          },
        });

        if (user) {
          // Attach user to request if valid
          req.user = {
            userId: user.id,
            privyUserId: user.privyUserId,
            verificationLevel: user.verificationLevel,
          };
        }
      } catch (error) {
        // Token is invalid, but that's okay for optional auth
        // Just continue without user
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, any error just means no user
    next();
  }
};
