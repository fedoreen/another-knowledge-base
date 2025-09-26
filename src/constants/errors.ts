export const ERROR_MESSAGES = {
  // Authentication & Authorization
  AUTHENTICATION_REQUIRED: 'Authentication required',
  ACCESS_TOKEN_REQUIRED: 'Access token required',
  INVALID_TOKEN: 'Invalid token',
  INVALID_TOKEN_FORMAT: 'Invalid token format',
  ADMIN_ACCESS_REQUIRED: 'Admin access required',
  ACCESS_DENIED: 'Access denied',
  
  // User related
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  
  // Article related
  ARTICLE_NOT_FOUND: 'Article not found',
  
  // General
  INTERNAL_SERVER_ERROR: 'Internal server error',
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',
  ROUTE_NOT_FOUND: 'Route not found',
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
