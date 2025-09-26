import { Response } from 'express';
import { ArticleService } from '@/services/articleService';
import { ResponseUtils } from '@/utils';
import { validateData } from '@/utils/validation';
import { 
  createArticleSchema, 
  updateArticleSchema
} from '@/utils/validation';
import { AuthRequest, RequiredAuthRequest } from '@/types';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '@/constants/errors';
import { SUCCESS_MESSAGES } from '@/constants/messages';

export class ArticleController {
  static async createArticle(req: RequiredAuthRequest, res: Response) {
    try {
      const articleData = validateData(createArticleSchema, req.body);
      const article = await ArticleService.createArticle({ ...articleData, authorId: req.user.id }, req.user.id);
      
      return res.status(201).json(ResponseUtils.success(article, SUCCESS_MESSAGES.ARTICLE_CREATED));
    } catch (error: any) {
      return res.status(400).json(ResponseUtils.error(error.message));
    }
  }

  static async getArticleById(req: AuthRequest, res: Response) {
    try {
      const { params, user } = req;

      const article = await ArticleService.getArticleById(params.id, user?.id);
      
      if (!article) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json(ResponseUtils.error(ERROR_MESSAGES.ARTICLE_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND));
      }
      
      return res.json(ResponseUtils.success(article));
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.ACCESS_DENIED) {
        return res.status(HTTP_STATUS_CODES.FORBIDDEN).json(ResponseUtils.error(ERROR_MESSAGES.ACCESS_DENIED, HTTP_STATUS_CODES.FORBIDDEN));
      }
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(ResponseUtils.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
  }

  static async getArticles(req: AuthRequest, res: Response) {
    const { tags, isPublic, authorId, search, page, limit } = req.query;
    try {
      const filters = {
        tags: tags as string,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        authorId: authorId as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      };
      
      const result = await ArticleService.getArticles(filters, req.user?.id);
      
      return res.json(ResponseUtils.success(result));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(ResponseUtils.error(error.message));
    }
  }

  static async updateArticle(req: RequiredAuthRequest, res: Response) {
    try {
      const updateData = validateData(updateArticleSchema, req.body);
      
      const article = await ArticleService.updateArticle(
        req.params.id, 
        updateData, 
        req.user.id, 
        req.user.role
      );
      
      return res.json(ResponseUtils.success(article, SUCCESS_MESSAGES.ARTICLE_UPDATED));
    } catch (error: any) {
      switch (error.message) {
        case ERROR_MESSAGES.ACCESS_DENIED:
          return res.status(HTTP_STATUS_CODES.FORBIDDEN).json(ResponseUtils.error(ERROR_MESSAGES.ACCESS_DENIED, HTTP_STATUS_CODES.FORBIDDEN));
        case ERROR_MESSAGES.ARTICLE_NOT_FOUND:
          return res.status(HTTP_STATUS_CODES.NOT_FOUND).json(ResponseUtils.error(ERROR_MESSAGES.ARTICLE_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND));
        default:
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(ResponseUtils.error(error.message));
      }
    }
  }

  static async deleteArticle(req: RequiredAuthRequest, res: Response) {
    try {
      const { user, params } = req;
      
      await ArticleService.deleteArticle(params.id, user);
      
      return res.json(ResponseUtils.success(null, SUCCESS_MESSAGES.ARTICLE_DELETED));
    } catch (error: any) {
      switch (error.message) {
        case ERROR_MESSAGES.ACCESS_DENIED:
          return res.status(HTTP_STATUS_CODES.FORBIDDEN).json(ResponseUtils.error(ERROR_MESSAGES.ACCESS_DENIED, HTTP_STATUS_CODES.FORBIDDEN));
        case ERROR_MESSAGES.ARTICLE_NOT_FOUND:
          return res.status(HTTP_STATUS_CODES.NOT_FOUND).json(ResponseUtils.error(ERROR_MESSAGES.ARTICLE_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND));
        default:
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(ResponseUtils.error(error.message));
      }
    }
  }
}
