import { Request, Response } from 'express';
import { prisma } from '../config/database.ts';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors.ts';
import { logger } from '../utils/logger.ts';

// Helper to map user to frontend format
function mapUserToResponse(user: any) {
  return {
    id: user.id,
    email: user.email || '',
    name: user.name || undefined,
    level: user.verificationLevel,
    score: user.trustScore,
    verifiedL1: user.verificationLevel >= 1,
    verifiedL2: user.verificationLevel >= 2,
    verifiedL3: user.verificationLevel >= 3,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    // User is attached by auth middleware
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    // Fetch full user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return user data
    return res.json(mapUserToResponse(user));
  } catch (error: any) {
    logger.error('Get profile error:', error);
    
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get profile',
      },
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // User is attached by auth middleware
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { name, email } = req.body;

    // Validate input
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== req.user.userId) {
        throw new ValidationError('Email is already taken');
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    // Update user
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
    });

    // Return updated user data
    return res.json(mapUserToResponse(user));
  } catch (error: any) {
    logger.error('Update profile error:', error);
    
    if (error instanceof ValidationError || error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile',
      },
    });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    // User is attached by auth middleware
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    // Get user with reviews count
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        reviews: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate achievements based on reviews and level
    const achievements: string[] = [];
    const totalReviews = user.reviews.length;

    if (totalReviews >= 1) achievements.push('First Review');
    if (totalReviews >= 10) achievements.push('Reviewer');
    if (totalReviews >= 50) achievements.push('Expert Reviewer');
    if (totalReviews >= 100) achievements.push('Master Reviewer');
    if (user.verificationLevel >= 2) achievements.push('Verified User');
    if (user.verificationLevel >= 3) achievements.push('Trusted Reviewer');
    if (user.trustScore >= 100) achievements.push('High Trust Score');

    // Return stats
    return res.json({
      totalReviews,
      level: user.verificationLevel,
      score: user.trustScore,
      achievements,
    });
  } catch (error: any) {
    logger.error('Get stats error:', error);
    
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get stats',
      },
    });
  }
};
