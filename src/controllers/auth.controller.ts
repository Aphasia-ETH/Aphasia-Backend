import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database.ts';
import { JWTService } from '../services/auth/jwt.service.ts';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors.ts';
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
  };
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user has a password (email/password auth)
    if (!user.password) {
      throw new UnauthorizedError('Invalid authentication method. Please use wallet login.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const token = JWTService.generateToken({
      userId: user.id,
      privyUserId: user.privyUserId || user.id, // Use id as fallback
      verificationLevel: user.verificationLevel,
    });

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Return token and user data
    return res.json({
      token,
      user: mapUserToResponse(user),
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    
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
        message: 'Login failed',
      },
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique identifiers
    const privyUserId = `email_${email}_${Date.now()}`;
    const hederaDID = `did:hedera:testnet:${privyUserId}`;

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        privyUserId,
        privyWallet: '',
        hederaDID,
        emailVerified: false,
        verificationLevel: 1, // Start at level 1 for email verification
        trustScore: 0,
      },
    });

    // Generate JWT token
    const token = JWTService.generateToken({
      userId: user.id,
      privyUserId: user.privyUserId || user.id,
      verificationLevel: user.verificationLevel,
    });

    // Return token and user data
    return res.status(201).json({
      token,
      user: mapUserToResponse(user),
    });
  } catch (error: any) {
    logger.error('Register error:', error);
    
    if (error instanceof ValidationError || error instanceof ConflictError) {
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
        message: 'Registration failed',
      },
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
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
      throw new UnauthorizedError('User not found');
    }

    // Return user data
    return res.json({
      success: true,
      data: {
        user: mapUserToResponse(user),
      },
    });
  } catch (error: any) {
    logger.error('Get current user error:', error);
    
    if (error instanceof UnauthorizedError) {
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
        message: 'Failed to get user',
      },
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    // User is attached by auth middleware
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    // Generate new token
    const token = JWTService.refreshToken(req.headers.authorization?.substring(7) || '');

    return res.json({
      token,
    });
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    
    if (error instanceof UnauthorizedError) {
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
        message: 'Failed to refresh token',
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  // For stateless JWT, logout is handled client-side
  // Optionally, we could add token blacklisting here
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
