import { User, Prisma } from '@prisma/client';

export type CreateUserInput = Omit<User, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt' | 'role'> & {
  password: string;
};

export type UpdateUserInput = Prisma.UserUpdateInput;

export type UserResponse = Omit<User, 'passwordHash'>;
