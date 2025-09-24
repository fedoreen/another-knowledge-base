import { Router } from 'express';
import { UserController } from '@/controllers/userController';
import { ArticleController } from '@/controllers/articleController';
import { requiredAuthMiddleware, optionalAuthMiddleware, adminMiddleware } from '@/middleware/auth';

const router = Router();

// Auth routes (public)
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);

// User routes
router.get('/users', adminMiddleware, UserController.getAllUsers);
router.get('/users/:id', requiredAuthMiddleware, UserController.getUserById as any);
router.put('/users/:id', requiredAuthMiddleware, UserController.updateUser as any);
router.delete('/users/:id', adminMiddleware, UserController.deleteUser);

// Article routes
router.post('/articles', requiredAuthMiddleware, ArticleController.createArticle as any);
router.get('/articles', optionalAuthMiddleware, ArticleController.getArticles as any);
router.get('/articles/:id', optionalAuthMiddleware, ArticleController.getArticleById as any);
router.put('/articles/:id', requiredAuthMiddleware, ArticleController.updateArticle as any);
router.delete('/articles/:id', requiredAuthMiddleware, ArticleController.deleteArticle as any);

export default router;
