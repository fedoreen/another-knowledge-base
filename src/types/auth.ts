import { Request } from 'express';
import { UserRole } from '@prisma/client';

export type JWTPayload = {
  id: string;
  email: string;
  role: UserRole;
};

export type LoginData = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: JWTPayload;
  token: string;
};

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface RequiredAuthRequest extends Request {
  user: JWTPayload;
}
