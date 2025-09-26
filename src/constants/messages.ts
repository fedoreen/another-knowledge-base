export const SUCCESS_MESSAGES = {
  // User messages
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully', 
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  
  // Article messages
  ARTICLE_CREATED: 'Article created successfully',
  ARTICLE_UPDATED: 'Article updated successfully',
  ARTICLE_DELETED: 'Article deleted successfully',
  
  // Database messages
  DATABASE_CONNECTED: 'Database connected successfully',
} as const;

export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];
