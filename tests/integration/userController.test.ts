import { Request, Response } from 'express';
import { UserController } from '@/controllers/userController';
import { UserService } from '@/services/userService';
import { mockUser, mockUserInput, mockAdmin } from '../utils/testData';
import { AuthRequest } from '@/types';
import { createMockRequest, createMockResponse } from '../utils/testHelpers';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '../../src/constants/errors';
import { SUCCESS_MESSAGES } from '../../src/constants/messages';

// Mock UserService
jest.mock('@/services/userService');
const mockUserService = UserService as jest.Mocked<typeof UserService>;

// Mock validation
jest.mock('@/utils/validation', () => ({
  validateData: jest.fn().mockImplementation((_, data) => data),
  createUserSchema: {},
  updateUserSchema: {},
  loginSchema: {},
}));

// Mock ResponseUtils
jest.mock('@/utils', () => ({
  ResponseUtils: {
    success: jest.fn().mockImplementation((data, message) => ({ success: true, data, message })),
    error: jest.fn().mockImplementation((message, statusCode = 400) => ({ success: false, message, statusCode }))
  },
}));

describe('UserController', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    
    // Reset mock implementation for validateData
    const { validateData } = require('@/utils/validation');
    validateData.mockImplementation((_: any, data: any) => data);
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      // Arrange
      mockReq.body = mockUserInput;
      mockUserService.createUser.mockResolvedValue(mockUser);

      // Act
      await UserController.register(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockUserInput);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: SUCCESS_MESSAGES.USER_CREATED
      });
    });

    it('should handle registration error', async () => {
      // Arrange
      mockReq.body = mockUserInput;
      mockUserService.createUser.mockRejectedValue(new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS));

      // Act
      await UserController.register(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.USER_ALREADY_EXISTS,
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      const { validateData } = require('@/utils/validation');
      validateData.mockImplementation(() => {
        throw new Error('Validation failed');
      });
      mockReq.body = mockUserInput;

      // Act
      await UserController.register(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const loginData = { email: 'test@example.com', password: 'password123' };
      mockReq.body = loginData;
      mockUserService.login.mockResolvedValue({
        user: mockUser,
        token: 'mock-jwt-token',
      });

      // Act
      await UserController.login(mockReq as any, mockRes as Response);

      // Assert
      expect(mockUserService.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser, token: 'mock-jwt-token' },
        message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL
      });
    });

    it('should handle login error', async () => {
      // Arrange
      const loginData = { email: 'test@example.com', password: 'wrong-password' };
      mockReq.body = loginData;
      mockUserService.login.mockRejectedValue(new Error(ERROR_MESSAGES.INVALID_CREDENTIALS));

      // Act
      await UserController.login(mockReq as any, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.UNAUTHORIZED);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        statusCode: HTTP_STATUS_CODES.UNAUTHORIZED
      });
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      // Arrange
      mockReq.query = { page: '1', limit: '10' };
      const usersData = {
        users: [mockUser, mockAdmin],
        total: 2,
        page: 1,
        limit: 10,
      };
      mockUserService.getAllUsers.mockResolvedValue(usersData);

      // Act
      await UserController.getAllUsers(mockReq as any, mockRes as Response);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith(1, 10);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: usersData,
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by id for admin', async () => {
      // Arrange
      mockReq.params = { id: mockUser.id };
      mockReq.user = mockAdmin;
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Act
      await UserController.getUserById(mockReq as any, mockRes as Response);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should get own user data', async () => {
      // Arrange
      mockReq.params = { id: mockUser.id };
      mockReq.user = mockUser;
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Act
      await UserController.getUserById(mockReq as any, mockRes as Response);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should deny access for other users', async () => {
      // Arrange
      mockReq.params = { id: 'other-user-123' };
      mockReq.user = mockUser;

      // Act
      await UserController.getUserById(mockReq as any, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.FORBIDDEN);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.ACCESS_DENIED,
        statusCode: HTTP_STATUS_CODES.FORBIDDEN
      });
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      mockReq.params = { id: 'non-existent' };
      mockReq.user = mockAdmin;
      mockUserService.getUserById.mockResolvedValue(null);

      // Act
      await UserController.getUserById(mockReq as any, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        statusCode: HTTP_STATUS_CODES.NOT_FOUND
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      mockReq.params = { id: mockUser.id };
      mockReq.body = { name: 'Updated Name' };
      mockReq.user = mockUser;
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      // Act
      await UserController.updateUser(mockReq as any, mockRes as Response);

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(mockUser.id, { name: 'Updated Name' });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      });
    });

    it('should deny update for other users', async () => {
      // Arrange
      mockReq.params = { id: 'other-user-123' };
      mockReq.body = { name: 'Updated Name' };
      mockReq.user = mockUser;

      // Act
      await UserController.updateUser(mockReq as any, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.FORBIDDEN);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.ACCESS_DENIED,
        statusCode: HTTP_STATUS_CODES.FORBIDDEN
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user for admin', async () => {
      // Arrange
      mockReq.params = { id: mockUser.id };
      mockReq.user = mockAdmin;
      mockUserService.deleteUser.mockResolvedValue();

      // Act
      await UserController.deleteUser(mockReq as any, mockRes as Response);

      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(mockUser.id);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'User deleted successfully',
      });
    });

    it('should deny delete for non-admin', async () => {
      // Arrange
      mockReq.params = { id: mockUser.id };
      mockReq.user = mockUser;

      // Act
      await UserController.deleteUser(mockReq as any, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.FORBIDDEN);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.ACCESS_DENIED,
        statusCode: HTTP_STATUS_CODES.FORBIDDEN
      });
    });
  });
});
