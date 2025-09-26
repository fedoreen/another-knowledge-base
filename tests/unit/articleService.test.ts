import { ArticleService } from '@/services/articleService';
import { mockPrisma } from '../mocks/prisma';
import { mockArticle, mockArticleInput, mockUser } from '../utils/testData';
import { UserRole } from '@prisma/client';
import { ERROR_MESSAGES } from '../../src/constants/errors';

describe('ArticleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createArticle', () => {
    it('should create a new article successfully', async () => {
      // Arrange
      const authorId = mockUser.id;
      const articleWithAuthor = {
        ...mockArticle,
        author: mockUser,
      };
      mockPrisma.article.create.mockResolvedValue(articleWithAuthor);

      // Act
      const result = await ArticleService.createArticle(mockArticleInput, authorId);

      // Assert
      expect(mockPrisma.article.create).toHaveBeenCalledWith({
        data: {
          ...mockArticleInput,
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
      expect(result).toEqual(articleWithAuthor);
    });
  });

  describe('getArticleById', () => {
    it('should return article by id for public article', async () => {
      // Arrange
      const articleId = mockArticle.id;
      const articleWithAuthor = {
        ...mockArticle,
        author: mockUser,
      };
      mockPrisma.article.findUnique.mockResolvedValue(articleWithAuthor);

      // Act
      const result = await ArticleService.getArticleById(articleId);

      // Assert
      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith({
        where: { id: articleId },
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
      expect(result).toEqual(articleWithAuthor);
    });

    it('should return article by id for author', async () => {
      // Arrange
      const articleId = mockArticle.id;
      const articleWithAuthor = {
        ...mockArticle,
        author: mockUser,
        isPublic: false,
      };
      mockPrisma.article.findUnique.mockResolvedValue(articleWithAuthor);

      // Act
      const result = await ArticleService.getArticleById(articleId, mockUser.id);

      // Assert
      expect(result).toEqual(articleWithAuthor);
    });

    it('should return null if article not found', async () => {
      // Arrange
      const articleId = 'non-existent';
      mockPrisma.article.findUnique.mockResolvedValue(null);

      // Act
      const result = await ArticleService.getArticleById(articleId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getArticles', () => {
    it('should return paginated articles', async () => {
      // Arrange
      const filters = {
        page: 1,
        limit: 10,
      };
      const articles = [mockArticle];
      const articleWithAuthor = {
        ...mockArticle,
        author: mockUser,
      };
      mockPrisma.article.findMany.mockResolvedValue([articleWithAuthor]);
      mockPrisma.article.count.mockResolvedValue(1);

      // Act
      const result = await ArticleService.getArticles(filters);

      // Assert
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { isPublic: true }, // Unauthorized user sees only public articles
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
      });
      expect(result).toEqual({
        articles: [articleWithAuthor],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should filter articles by tags', async () => {
      // Arrange
      const filters = {
        tags: 'test',
        page: 1,
        limit: 10,
      };
      mockPrisma.article.findMany.mockResolvedValue([]);
      mockPrisma.article.count.mockResolvedValue(0);

      // Act
      await ArticleService.getArticles(filters);

      // Assert
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          isPublic: true,
          tags: {
            hasSome: ['test'],
          },
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
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter articles by isPublic', async () => {
      // Arrange
      const filters = {
        isPublic: true,
        page: 1,
        limit: 10,
      };
      mockPrisma.article.findMany.mockResolvedValue([]);
      mockPrisma.article.count.mockResolvedValue(0);

      // Act
      await ArticleService.getArticles(filters, mockUser.id);

      // Assert
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          isPublic: true,
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
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateArticle', () => {
    it('should update article successfully', async () => {
      // Arrange
      const articleId = mockArticle.id;
      const updateData = { title: 'Updated Title' };
      const updatedArticle = {
        ...mockArticle,
        ...updateData,
        author: mockUser,
      };
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle);
      mockPrisma.article.update.mockResolvedValue(updatedArticle);

      // Act
      const result = await ArticleService.updateArticle(
        articleId,
        updateData,
        mockUser.id,
        UserRole.USER
      );

      // Assert
      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith({
        where: { id: articleId },
      });
      expect(mockPrisma.article.update).toHaveBeenCalledWith({
        where: { id: articleId },
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
      expect(result).toEqual(updatedArticle);
    });

    it('should throw error if article not found', async () => {
      // Arrange
      const articleId = 'non-existent';
      const updateData = { title: 'Updated Title' };
      mockPrisma.article.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        ArticleService.updateArticle(articleId, updateData, mockUser.id, UserRole.USER)
      ).rejects.toThrow('Article not found');
    });

    it('should throw error if user is not author and not admin', async () => {
      // Arrange
      const articleId = mockArticle.id;
      const updateData = { title: 'Updated Title' };
      const otherUser = { ...mockUser, id: 'other-user-id' };
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle);

      // Act & Assert
      await expect(
        ArticleService.updateArticle(articleId, updateData, otherUser.id, UserRole.USER)
      ).rejects.toThrow(ERROR_MESSAGES.ACCESS_DENIED);
    });
  });

  describe('deleteArticle', () => {
    it('should delete article successfully', async () => {
      // Arrange
      const articleId = mockArticle.id;
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle);
      mockPrisma.article.delete.mockResolvedValue(mockArticle);

      // Act
      await ArticleService.deleteArticle(articleId, mockUser);

      // Assert
      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith({
        where: { id: articleId },
      });
      expect(mockPrisma.article.delete).toHaveBeenCalledWith({
        where: { id: articleId },
      });
    });

    it('should throw error if article not found', async () => {
      // Arrange
      const articleId = 'non-existent';
      mockPrisma.article.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(ArticleService.deleteArticle(articleId, mockUser)).rejects.toThrow(
        ERROR_MESSAGES.ARTICLE_NOT_FOUND
      );
    });

    it('should throw error if user is not author and not admin', async () => {
      // Arrange
      const articleId = mockArticle.id;
      const otherUser = { ...mockUser, id: 'other-user-id' };
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle);

      // Act & Assert
      await expect(ArticleService.deleteArticle(articleId, otherUser)).rejects.toThrow(
        ERROR_MESSAGES.ACCESS_DENIED
      );
    });
  });
});
