import { UserService } from '@/services/userService';
import { mockPrisma } from '../mocks/prisma';
import { mockUser, mockUserInput, mockAdmin } from '../utils/testData';
import { UserRole } from '@prisma/client';
import { ERROR_MESSAGES } from '../../src/constants/errors';

// Mock AuthUtils
jest.mock('@/utils', () => ({
  AuthUtils: {
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    comparePassword: jest.fn().mockResolvedValue(true),
    generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
  },
  ResponseUtils: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.createUser(mockUserInput);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUserInput.email },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockUserInput.email,
          passwordHash: 'hashed-password',
          name: mockUserInput.name,
          role: UserRole.USER,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(UserService.createUser(mockUserInput)).rejects.toThrow(
        ERROR_MESSAGES.USER_ALREADY_EXISTS
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const loginData = { email: 'test@example.com', password: 'password123' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.login(loginData);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(result).toEqual({
        user: mockUser,
        token: 'mock-jwt-token',
      });
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const loginData = { email: 'invalid@example.com', password: 'password123' };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(UserService.login(loginData)).rejects.toThrow(
        ERROR_MESSAGES.INVALID_CREDENTIALS
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.getUserById(mockUser.id);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const userId = 'non-existent';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await UserService.getUserById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const users = [mockUser, mockAdmin];
      mockPrisma.user.findMany.mockResolvedValue(users);
      mockPrisma.user.count.mockResolvedValue(2);

      // Act
      const result = await UserService.getAllUsers(1, 10);

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        users,
        total: 2,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await UserService.updateUser(mockUser.id, updateData);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      // Act
      await UserService.deleteUser(mockUser.id);

      // Assert
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });
});
