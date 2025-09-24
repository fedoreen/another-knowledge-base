import { User, Prisma } from '@prisma/client';

export type CreateUserInput = Omit<User, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt'> & {
  password: string;
};

export type UpdateUserInput = Prisma.UserUpdateInput;

export type UserResponse = Omit<User, 'passwordHash'>;
