import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export const mockPrisma = mockDeep<PrismaClient>();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  UserRole: {
    USER: 'USER',
    ADMIN: 'ADMIN',
  },
}));

export type MockPrismaClient = DeepMockProxy<PrismaClient>;
