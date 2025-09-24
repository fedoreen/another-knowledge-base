# Another Knowledge Base

Backend service for knowledge base management with user authentication and article management.

## Features

- **User Management**: Registration, login, user CRUD operations
- **Article Management**: Create, read, update, delete articles
- **Access Control**: Public/private articles, role-based permissions
- **Tag System**: Filter articles by tags
- **REST API**: Clean RESTful API design
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Containerization**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Development Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/fedoreen/another-knowledge-base.git
   cd another-knowledge-base
   ```

2. **Set up environment variables** (optional):
   ```bash
   cp env.example .env
   # Edit .env file with your JWT_SECRET
   ```

3. **Start application**:
   ```bash
   docker-compose up -d
   ```

4. **Apply database migrations**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

5. **Seed database with test data**:
   ```bash
   docker-compose exec app npx prisma db seed
   ```

The API will be available at `http://localhost:3000`

### Available Commands

Use management script for common operations:

**Linux/macOS:**
```bash
./docker-exec.sh up          # Start application
./docker-exec.sh down        # Stop application
./docker-exec.sh logs        # Show logs
./docker-exec.sh db-studio   # Open Prisma Studio
./docker-exec.sh db-deploy   # Apply migrations
./docker-exec.sh db-seed     # Seed database
./docker-exec.sh psql        # Connect to PostgreSQL CLI
```

**Windows:**
```cmd
docker-exec.bat up           # Start application
docker-exec.bat down         # Stop application
docker-exec.bat logs         # Show logs
docker-exec.bat db-studio    # Open Prisma Studio
docker-exec.bat db-deploy    # Apply migrations
docker-exec.bat db-seed      # Seed database
docker-exec.bat psql         # Connect to PostgreSQL CLI
```

**Or use Docker Compose directly:**
```bash
docker-compose up -d                               # Start application
docker-compose exec app npx prisma migrate deploy  # Apply migrations
docker-compose exec app npx prisma db seed         # Seed database
```

## Database Schema

### Users Table
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password_hash`: String
- `name`: String (Optional)
- `role`: Enum (USER, ADMIN)
- `created_at`: DateTime
- `updated_at`: DateTime

### Articles Table
- `id`: UUID (Primary Key)
- `title`: String
- `content`: Text
- `tags`: String Array
- `is_public`: Boolean
- `author_id`: UUID (Foreign Key)
- `created_at`: DateTime
- `updated_at`: DateTime

## Access Control

### Public Access
- Register/Login endpoints
- Get public articles
- Get single article (if public)

### Authenticated Access
- Create/Update/Delete own articles
- Update own profile
- Get all articles (including private ones)

### Admin Access
- Manage all users
- Manage all articles
- Access admin endpoints

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5433/knowledge_base?schema=public
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

## Health Check

```http
GET /health
```

Returns server status and environment information.

## License

MIT
