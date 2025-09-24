import { Request, Response, NextFunction } from 'express';
import { ResponseUtils } from '@/utils';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '@/constants/errors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Validation errors
  if (error.message.startsWith('Validation error:')) {
    return res.status(400).json(
      ResponseUtils.error(error.message, 400)
    );
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    if (prismaError.code === 'P2002') {
      return res.status(409).json(
        ResponseUtils.error(ERROR_MESSAGES.RESOURCE_ALREADY_EXISTS, HTTP_STATUS_CODES.CONFLICT)
      );
    }
    
    if (prismaError.code === 'P2025') {
      return res.status(404).json(
        ResponseUtils.error(ERROR_MESSAGES.RESOURCE_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND)
      );
    }
  }

  // Default error
  return res.status(500).json(
    ResponseUtils.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
  );
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json(
    ResponseUtils.error(`${ERROR_MESSAGES.ROUTE_NOT_FOUND}: ${req.originalUrl}`, HTTP_STATUS_CODES.NOT_FOUND)
  );
};

