import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface JWTPayload {
  userId: string;
  privyUserId: string;
  verificationLevel: number;
}

export class JWTService {
  /**
   * Generate JWT token
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Refresh JWT token
   */
  static refreshToken(oldToken: string): string {
    try {
      const decoded = this.verifyToken(oldToken);
      // Generate new token with same payload
      return this.generateToken({
        userId: decoded.userId,
        privyUserId: decoded.privyUserId,
        verificationLevel: decoded.verificationLevel,
      });
    } catch (error) {
      throw new UnauthorizedError('Cannot refresh invalid token');
    }
  }
}

export default JWTService;
