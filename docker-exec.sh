#!/bin/bash

BASEDIR=$(cd $(dirname $0); pwd)
CMD=$1

case $CMD in
        up)
          docker-compose up
          ;;
        down)
          docker-compose down
          ;;
        logs)
          docker-compose logs -f
          ;;
        exec-app)
          docker-compose exec app bash
          ;;
        exec-db)
          docker-compose exec postgres bash
          ;;
        psql)
          docker-compose exec postgres psql -U postgres -d knowledge_base
          ;;
        db-studio)
          echo "Opening Prisma Studio..."
          echo "URL: http://localhost:5555"
          docker-compose exec app npx prisma studio
          ;;
        db-migrate)
          docker-compose exec app npx prisma migrate dev
          ;;
        db-deploy)
          docker-compose exec app npx prisma migrate deploy
          ;;
        db-generate)
          docker-compose exec app npx prisma generate
          ;;
        db-reset)
          docker-compose exec app npx prisma migrate reset
          ;;
        db-seed)
          docker-compose exec app npm run db:seed
          ;;
        test-api)
          echo "Testing API endpoints..."
          echo "Health check:"
          curl -s http://localhost:3000/health | jq .
          echo -e "\nRegister user:"
          curl -s -X POST http://localhost:3000/api/user/register \
            -H "Content-Type: application/json" \
            -d '{"email":"test@example.com","password":"password123","name":"Test User"}' | jq .
          echo -e "\nLogin:"
          curl -s -X POST http://localhost:3000/api/user/login \
            -H "Content-Type: application/json" \
            -d '{"email":"test@example.com","password":"password123"}' | jq .
          ;;
        help|--help|-h|"")
          echo "Another Knowledge Base - Management Script"
          echo
          echo "Usage: $0 <command>"
          echo
          echo "Application:"
          echo "  $0 up                   -  start application"
          echo "  $0 down                 -  stop application"
          echo "  $0 logs                 -  show all logs"
          echo
          echo "Database:"
          echo "  $0 psql              -  connect to PostgreSQL CLI"
          echo "  $0 db-studio            -  open Prisma Studio (GUI)"
          echo "  $0 db-migrate           -  run database migrations (dev)"
          echo "  $0 db-deploy            -  apply database migrations (prod)"
          echo "  $0 db-generate          -  generate Prisma client"
          echo "  $0 db-reset             -  reset database"
          echo "  $0 db-seed              -  seed database with test data"
          echo
          echo "Development:"
          echo "  $0 exec-app             -  open bash in app container"
          echo "  $0 exec-db              -  open bash in database container"
          echo "  $0 test-api             -  test API endpoints"
          echo
          echo "Examples:"
          echo "  $0 up                   -  start the application"
          echo "  $0 db-studio            -  open database GUI"
          echo "  $0 logs-app             -  watch application logs"
          echo
          exit 0
          ;;
        *)
          echo "Unknown command: $CMD"
          echo "Run '$0 help' for available commands"
          exit 1
          ;;
esac
