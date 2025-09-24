import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import { 
  CreateArticleInput, 
  UpdateArticleInput, 
  ArticleResponse,
  ArticleFilters,
  PaginationParams,
  JWTPayload
} from '@/types';
import { ERROR_MESSAGES } from '../constants/errors';

const prisma = new PrismaClient();

export class ArticleService {
  static async createArticle(
    articleData: CreateArticleInput,
    authorId: string
  ): Promise<ArticleResponse> {
    return await prisma.article.create({
      data: {
        ...articleData,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  static async getArticleById(id: string, userId?: string): Promise<ArticleResponse | null> {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!article) {
      return null;
    }

    if (!article.isPublic && !userId) {
      throw new Error(ERROR_MESSAGES.ACCESS_DENIED);
    }

    return article;
  }

  static async getArticles(
    filters: ArticleFilters & PaginationParams,
    userId?: string
  ): Promise<{
    articles: ArticleResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...filterParams } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ArticleWhereInput = {};

    // Public articles filter
    if (!userId) {
      // Unauthorized user - only public articles
      where.isPublic = true;
    } else if (filterParams.isPublic !== undefined) {
      // Authorized user with explicit filter
      where.isPublic = filterParams.isPublic;
    }

    // Tags filter
    if (filterParams.tags) {
      const tagsArray = [filterParams.tags];
      where.tags = {
        hasSome: tagsArray,
      };
    }

    // Author filter
    if (filterParams.authorId) {
      where.authorId = filterParams.authorId;
    }

    // Search filter
    if (filterParams.search) {
      where.OR = [
        { title: { contains: filterParams.search, mode: 'insensitive' } },
        { content: { contains: filterParams.search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles,
      total,
      page,
      limit,
    };
  }

  static async updateArticle(
    id: string, 
    updateData: UpdateArticleInput, 
    userId: string,
    userRole: string
  ): Promise<ArticleResponse> {
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw new Error('Article not found');
    }

    if (userRole !== UserRole.ADMIN && existingArticle.authorId !== userId) {
      throw new Error(ERROR_MESSAGES.ACCESS_DENIED);
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return article;
  }

  static async deleteArticle(id: string, user: JWTPayload): Promise<void> {
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw new Error('Article not found');
    }

    if (user.role !== UserRole.ADMIN && existingArticle.authorId !== user.id) {
      throw new Error('Access denied');
    }

    await prisma.article.delete({
      where: { id },
    });
  }

}
