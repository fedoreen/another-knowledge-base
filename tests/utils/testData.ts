import { UserRole } from '@prisma/client';
import { CreateUserInput, CreateArticleInput } from '@/types';

const date = new Date('2025-09-24');

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.USER,
  passwordHash: 'hashed-password',
  createdAt: date,
  updatedAt: date,
};

export const mockAdmin = {
  id: 'admin-123',
  email: 'admin@example.com',
  name: 'Admin User',
  role: UserRole.ADMIN,
  passwordHash: 'hashed-admin-password',
  createdAt: date,
  updatedAt: date,
};

export const mockUserInput: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123',
};

export const mockArticleInput: CreateArticleInput = {
  title: 'Test Article',
  content: 'This is a test article content',
  tags: ['test', 'example'],
  isPublic: true,
  authorId: 'user-123',
};

export const mockArticle = {
  id: 'article-123',
  title: 'Test Article',
  content: 'This is a test article content',
  tags: ['test', 'example'],
  isPublic: true,
  authorId: 'user-123',
  createdAt: date,
  updatedAt: date,
};

export const mockJWTToken = 'mock-jwt-token';
export const mockJWTSecret = 'test-secret-key';
