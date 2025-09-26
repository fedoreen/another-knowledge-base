import { Request, Response } from 'express';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export const mockPrisma = mockDeep<PrismaClient>();

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
