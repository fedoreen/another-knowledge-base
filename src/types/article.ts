import { Article, Prisma } from '@prisma/client';
import { UserResponse } from './user';

export type CreateArticleInput = Prisma.ArticleUncheckedCreateInput;

export type UpdateArticleInput = Prisma.ArticleUncheckedUpdateInput;

export interface ArticleExtended extends Article {
  author?: UserResponse;
}

export type ArticleResponse = ArticleExtended;

export type ArticleFilters = {
  tags?: string;
  isPublic?: boolean;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export { Article };
