import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthUtils, ResponseUtils } from '@/utils';
import { AuthRequest } from '@/types';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '@/constants/errors';

const prisma = new PrismaClient();

export const authMiddleware = (required: boolean = true) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        if (required) {
          return res.status(401).json(
            ResponseUtils.error(ERROR_MESSAGES.ACCESS_TOKEN_REQUIRED, HTTP_STATUS_CODES.UNAUTHORIZED)
          );
        } else {
          req.user = undefined;
          return next();
        }
      }

      const { id: userId } = AuthUtils.verifyToken(token) as any;
      
      if (!userId) {
        if (required) {
          return res.status(401).json(
            ResponseUtils.error(ERROR_MESSAGES.INVALID_TOKEN_FORMAT, HTTP_STATUS_CODES.UNAUTHORIZED)
          );
        } else {
          req.user = undefined;
          return next();
        }
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        },
      });

      if (!user) {
        if (required) {
          return res.status(401).json(
            ResponseUtils.error(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS_CODES.UNAUTHORIZED)
          );
        } else {
          req.user = undefined;
          return next();
        }
      }
      req.user = user;
      return next();
    } catch (error) {
      if (required) {
        return res.status(401).json(
          ResponseUtils.error(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS_CODES.UNAUTHORIZED)
        );
      } else {
        req.user = undefined;
        return next();
      }
    }
  };
};

export const requiredAuthMiddleware: RequestHandler = authMiddleware(true);
export const optionalAuthMiddleware: RequestHandler = authMiddleware(false);

export const adminMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  authMiddleware(true)(req, res, (err) => {
    if (err) return next(err);
    
    if ((req as any).user && (req as any).user.role !== UserRole.ADMIN) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json(
        ResponseUtils.error(ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED, HTTP_STATUS_CODES.FORBIDDEN)
      );
    }
    
    return next();
  });
};
