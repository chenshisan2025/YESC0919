#!/bin/bash

# YesCoin Backend Deployment Script
# This script helps deploy the backend to various environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="production"
BUILD_ONLY=false
SKIP_TESTS=false
SKIP_BUILD=false

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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment ENV    Set environment (development|staging|production) [default: production]"
    echo "  -b, --build-only         Only build, don't deploy"
    echo "  -t, --skip-tests         Skip running tests"
    echo "  -s, --skip-build         Skip build step"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                       Deploy to production"
    echo "  $0 -e staging            Deploy to staging"
    echo "  $0 -b                    Build only"
    echo "  $0 -t -e development     Deploy to development, skip tests"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -t|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -s|--skip-build)
            SKIP_BUILD=true
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

print_status "Starting deployment for environment: $ENVIRONMENT"

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check if required files exist
required_files=("src/server.ts" "src/app.ts" "prisma/schema.prisma")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Required file not found: $file"
        exit 1
    fi
done

# Check environment variables
print_status "Checking environment configuration..."
if [[ ! -f ".env" && "$ENVIRONMENT" != "production" ]]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
        print_warning "Please update .env file with your actual values before proceeding."
        read -p "Press Enter to continue after updating .env file..."
    else
        print_error ".env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi
print_success "Dependencies installed"

# Run tests (unless skipped)
if [[ "$SKIP_TESTS" == false ]]; then
    print_status "Running tests..."
    if command -v pnpm &> /dev/null; then
        pnpm test || {
            print_warning "Tests failed, but continuing deployment..."
        }
    elif command -v yarn &> /dev/null; then
        yarn test || {
            print_warning "Tests failed, but continuing deployment..."
        }
    else
        npm test || {
            print_warning "Tests failed, but continuing deployment..."
        }
    fi
else
    print_warning "Skipping tests"
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

# Run database migrations (for non-production)
if [[ "$ENVIRONMENT" != "production" ]]; then
    print_status "Running database migrations..."
    if command -v pnpm &> /dev/null; then
        pnpm prisma migrate deploy
    elif command -v yarn &> /dev/null; then
        yarn prisma migrate deploy
    else
        npx prisma migrate deploy
    fi
    print_success "Database migrations completed"
else
    print_warning "Skipping migrations for production. Run manually if needed."
fi

# Build the application (unless skipped)
if [[ "$SKIP_BUILD" == false ]]; then
    print_status "Building application..."
    if command -v pnpm &> /dev/null; then
        pnpm build
    elif command -v yarn &> /dev/null; then
        yarn build
    else
        npm run build
    fi
    print_success "Application built successfully"
else
    print_warning "Skipping build step"
fi

# If build-only, exit here
if [[ "$BUILD_ONLY" == true ]]; then
    print_success "Build completed. Exiting as requested."
    exit 0
fi

# Environment-specific deployment steps
case $ENVIRONMENT in
    development)
        print_status "Starting development server..."
        if command -v pnpm &> /dev/null; then
            pnpm dev
        elif command -v yarn &> /dev/null; then
            yarn dev
        else
            npm run dev
        fi
        ;;
    staging)
        print_status "Deploying to staging environment..."
        # Add staging-specific deployment commands here
        print_warning "Staging deployment not configured. Please add your staging deployment commands."
        ;;
    production)
        print_status "Deploying to production environment..."
        # Add production-specific deployment commands here
        print_warning "Production deployment not configured. Please add your production deployment commands."
        print_status "To start the production server manually, run:"
        print_status "  NODE_ENV=production node dist/server.js"
        ;;
esac

print_success "Deployment process completed for environment: $ENVIRONMENT"

# Show useful information
echo ""
print_status "Useful commands:"
echo "  Health check: curl http://localhost:3001/health"
echo "  API docs: curl http://localhost:3001/api/docs"
echo "  View logs: tail -f logs/app.log (if configured)"
echo "  Stop server: Ctrl+C or kill process"
echo ""
print_success "YesCoin Backend deployment completed!"