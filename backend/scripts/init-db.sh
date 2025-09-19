#!/bin/bash

# YesCoin Database Initialization Script
# This script sets up the database and runs initial migrations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
ENVIRONMENT="development"
RESET_DB=false
SEED_DATA=false

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment ENV    Set environment (development|staging|production) [default: development]"
    echo "  -r, --reset             Reset database (WARNING: This will delete all data)"
    echo "  -s, --seed              Seed database with initial data"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                       Initialize database for development"
    echo "  $0 -r -s                Reset database and seed with initial data"
    echo "  $0 -e production         Initialize production database"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--reset)
            RESET_DB=true
            shift
            ;;
        -s|--seed)
            SEED_DATA=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Valid environments: development, staging, production"
    exit 1
fi

print_status "Initializing database for environment: $ENVIRONMENT"

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check if Prisma schema exists
if [[ ! -f "prisma/schema.prisma" ]]; then
    print_error "Prisma schema not found at prisma/schema.prisma"
    exit 1
fi

# Check environment variables
print_status "Checking environment configuration..."
if [[ ! -f ".env" ]]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
        print_warning "Please update .env file with your actual database URL before proceeding."
        read -p "Press Enter to continue after updating .env file..."
    else
        print_error ".env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Load environment variables
source .env

# Check if DATABASE_URL is set
if [[ -z "$DATABASE_URL" ]]; then
    print_error "DATABASE_URL not set in .env file"
    exit 1
fi

print_success "Environment configuration loaded"

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    print_status "Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi
    print_success "Dependencies installed"
fi

# Reset database if requested
if [[ "$RESET_DB" == true ]]; then
    if [[ "$ENVIRONMENT" == "production" ]]; then
        print_error "Cannot reset production database. This is a safety measure."
        exit 1
    fi
    
    print_warning "Resetting database... This will delete all data!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Database reset cancelled"
        exit 0
    fi
    
    print_status "Resetting database..."
    if command -v pnpm &> /dev/null; then
        pnpm prisma migrate reset --force
    elif command -v yarn &> /dev/null; then
        yarn prisma migrate reset --force
    else
        npx prisma migrate reset --force
    fi
    print_success "Database reset completed"
else
    # Run migrations
    print_status "Running database migrations..."
    if command -v pnpm &> /dev/null; then
        pnpm prisma migrate deploy
    elif command -v yarn &> /dev/null; then
        yarn prisma migrate deploy
    else
        npx prisma migrate deploy
    fi
    print_success "Database migrations completed"
fi

# Generate Prisma client
print_status "Generating Prisma client..."
if command -v pnpm &> /dev/null; then
    pnpm prisma generate
elif command -v yarn &> /dev/null; then
    yarn prisma generate
else
    npx prisma generate
fi
print_success "Prisma client generated"

# Seed database if requested
if [[ "$SEED_DATA" == true ]]; then
    print_status "Seeding database with initial data..."
    
    # Check if seed script exists
    if [[ -f "prisma/seed.ts" || -f "prisma/seed.js" ]]; then
        if command -v pnpm &> /dev/null; then
            pnpm prisma db seed
        elif command -v yarn &> /dev/null; then
            yarn prisma db seed
        else
            npx prisma db seed
        fi
        print_success "Database seeded successfully"
    else
        print_warning "No seed script found. Skipping database seeding."
        print_status "To create a seed script, create prisma/seed.ts or prisma/seed.js"
    fi
fi

# Verify database connection
print_status "Verifying database connection..."
if command -v pnpm &> /dev/null; then
    pnpm prisma db pull --print || print_warning "Could not verify database connection"
elif command -v yarn &> /dev/null; then
    yarn prisma db pull --print || print_warning "Could not verify database connection"
else
    npx prisma db pull --print || print_warning "Could not verify database connection"
fi

# Show database status
print_status "Database status:"
echo "  Environment: $ENVIRONMENT"
echo "  Database URL: ${DATABASE_URL%/*}/*** (credentials hidden)"
echo "  Schema file: prisma/schema.prisma"
echo "  Migrations: prisma/migrations/"

print_success "Database initialization completed!"

# Show next steps
echo ""
print_status "Next steps:"
echo "  1. Start the server: npm run dev (or pnpm dev / yarn dev)"
echo "  2. Check health: curl http://localhost:3001/health"
echo "  3. View API docs: curl http://localhost:3001/api/docs"
echo "  4. Access Prisma Studio: npx prisma studio"
echo ""
print_status "Useful Prisma commands:"
echo "  - View database: npx prisma studio"
echo "  - Create migration: npx prisma migrate dev --name <name>"
echo "  - Reset database: npx prisma migrate reset"
echo "  - Seed database: npx prisma db seed"
echo ""
print_success "YesCoin database is ready!"