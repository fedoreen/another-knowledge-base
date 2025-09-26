import { Request, Response } from 'express';
import { UserService } from '@/services/userService';
import { ResponseUtils } from '@/utils';
import { validateData } from '@/utils/validation';
import { createUserSchema, updateUserSchema, loginSchema } from '@/utils/validation';
import { AuthRequest, User, UserRole } from '@/types';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '@/constants/errors';
import { SUCCESS_MESSAGES } from '@/constants/messages';

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const userData = validateData(createUserSchema, req.body);
      const user = await UserService.createUser(userData);
      
      return res.status(HTTP_STATUS_CODES.CREATED).json(ResponseUtils.success(user, SUCCESS_MESSAGES.USER_CREATED));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(ResponseUtils.error(error.message));
    }
  }

  static async login(req: AuthRequest, res: Response) {
    try {
      const loginData = validateData(loginSchema, req.body);
      const authResponse = await UserService.login(loginData);
      
      return res.status(HTTP_STATUS_CODES.OK).json(ResponseUtils.success(authResponse, SUCCESS_MESSAGES.LOGIN_SUCCESSFUL));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json(ResponseUtils.error(error.message, HTTP_STATUS_CODES.UNAUTHORIZED));
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await UserService.getAllUsers(page, limit);
      
      return res.status(HTTP_STATUS_CODES.OK).json(ResponseUtils.success(result));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(ResponseUtils.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
  }

  static async getUserById(req: AuthRequest & User, res: Response) {
    try {
      const { id } = req.params;

      if (req.user?.role !== UserRole.ADMIN && req.user?.id !== id) {
        return res.status(HTTP_STATUS_CODES.FORBIDDEN).json(ResponseUtils.error(ERROR_MESSAGES.ACCESS_DENIED, HTTP_STATUS_CODES.FORBIDDEN));
      }

      const user = await UserService.getUserById(id);
      
      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json(ResponseUtils.error(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND));
      }

      return res.json(ResponseUtils.success(user));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(ResponseUtils.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
  }

  static async updateUser(req: AuthRequest & User, res: Response) {
    try {
      const { id } = req.params;
      const updateData = validateData(updateUserSchema, req.body);
      
      if (req.user?.role !== UserRole.ADMIN && req.user?.id !== id) {
        return res.status(HTTP_STATUS_CODES.FORBIDDEN).json(ResponseUtils.error(ERROR_MESSAGES.ACCESS_DENIED, HTTP_STATUS_CODES.FORBIDDEN));
      }
      
      const user = await UserService.updateUser(id, updateData);
      
      return res.json(ResponseUtils.success(user, SUCCESS_MESSAGES.USER_UPDATED));
    } catch (error: any) {
      return res.status(400).json(ResponseUtils.error(error.message));
    }
  }

  static async deleteUser(req: Request & AuthRequest, res: Response) {
    try {
      if (req.user?.role !== UserRole.ADMIN) {
        return res.status(HTTP_STATUS_CODES.FORBIDDEN).json(ResponseUtils.error(ERROR_MESSAGES.ACCESS_DENIED, HTTP_STATUS_CODES.FORBIDDEN));
      }
      
      await UserService.deleteUser(req.params.id);
      
      return res.json(ResponseUtils.success(null, SUCCESS_MESSAGES.USER_DELETED));
    } catch (error: any) {
      return res.status(400).json(ResponseUtils.error(error.message));
    }
  }
}
