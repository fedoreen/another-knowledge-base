import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '@/config';
import { JWTPayload } from '@/types';

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '7d',
    });
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

export class ResponseUtils {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, statusCode: number = 400) {
    return {
      success: false,
      message,
      statusCode,
    };
  }

}
