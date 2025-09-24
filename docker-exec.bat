@echo off
set BASEDIR=%~dp0
set CMD=%1

if "%CMD%"=="up" (
  docker-compose up -d
  goto :eof
)

if "%CMD%"=="down" (
  docker-compose down
  goto :eof
)

if "%CMD%"=="logs" (
  docker-compose logs -f
  goto :eof
)

if "%CMD%"=="logs-app" (
  docker-compose logs -f app
  goto :eof
)

if "%CMD%"=="psql" (
  docker-compose exec db psql -U postgres -d knowledge_base
  goto :eof
)

if "%CMD%"=="db-studio" (
  docker-compose exec app npx prisma studio
  goto :eof
)

if "%CMD%"=="db-migrate" (
  docker-compose exec app npx prisma migrate dev
  goto :eof
)

if "%CMD%"=="db-deploy" (
  docker-compose exec app npx prisma migrate deploy
  goto :eof
)

if "%CMD%"=="db-generate" (
  docker-compose exec app npx prisma generate
  goto :eof
)

if "%CMD%"=="db-reset" (
  docker-compose exec app npx prisma migrate reset --force
  goto :eof
)

if "%CMD%"=="db-seed" (
  docker-compose exec app npx prisma db seed
  goto :eof
)

if "%CMD%"=="exec-app" (
  docker-compose exec app bash
  goto :eof
)

if "%CMD%"=="exec-db" (
  docker-compose exec db bash
  goto :eof
)

if "%CMD%"=="test-api" (
  curl -s http://localhost:3000/health
  goto :eof
)

if "%CMD%"=="help" (
  echo Another Knowledge Base - Management Script
  echo.
  echo Usage: %0 ^<command^>
  echo.
  echo Application:
  echo   %0 up                   -  start application
  echo   %0 down                 -  stop application
  echo   %0 logs                 -  show all logs
  echo.
  echo Database:
  echo   %0 psql              -  connect to PostgreSQL CLI
  echo   %0 db-studio            -  open Prisma Studio ^(GUI^)
  echo   %0 db-migrate           -  run database migrations ^(dev^)
  echo   %0 db-deploy            -  apply database migrations ^(prod^)
  echo   %0 db-generate          -  generate Prisma client
  echo   %0 db-reset             -  reset database
  echo   %0 db-seed              -  seed database with test data
  echo.
  echo Development:
  echo   %0 exec-app             -  open bash in app container
  echo   %0 exec-db               -  open bash in database container
  echo   %0 test-api             -  test API endpoints
  echo.
  echo Examples:
  echo   %0 up                   -  start the application
  echo   %0 db-studio            -  open database GUI
  echo   %0 logs-app             -  watch application logs
  echo.
  goto :eof
)

echo Unknown command: %CMD%
echo Run '%0 help' for available commands
exit /b 1
