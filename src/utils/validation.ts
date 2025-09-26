import { z } from 'zod';
import { UserRole } from '@/types';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  role: z.nativeEnum(UserRole).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Article validation schemas
export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().optional().default(false)
});

export const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional()
});

export const articleFiltersSchema = z.object({
  tags: z.string().optional(),
  isPublic: z.string().transform(value => value === 'true').optional(),
  authorId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.string().transform(value => parseInt(value)).optional().default('1'),
  limit: z.string().transform(value => parseInt(value)).optional().default('10')
});

// Validation helper
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessage = result.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Validation error: ${errorMessage}`);
  }
  return result.data;
}
