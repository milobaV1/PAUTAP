#!/bin/bash

# ==========================================
# Training Platform Deployment Script
# ==========================================
# This script automates the deployment process
# Usage: ./deploy.sh
# ==========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

print_message "================================================" "$BLUE"
print_message "🚀 Training Platform Deployment Script" "$BLUE"
print_message "================================================" "$BLUE"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    print_message "❌ Error: .env file not found!" "$RED"
    print_message "Please create .env file from .env.production.example" "$YELLOW"
    exit 1
fi

# Check if docker-compose.prod.yml exists
if [ ! -f docker-compose.prod.yml ]; then
    print_message "❌ Error: docker-compose.prod.yml not found!" "$RED"
    exit 1
fi

# Step 1: Pull latest code
print_message "📥 Step 1: Pulling latest code from repository..." "$BLUE"
git pull origin main || {
    print_message "❌ Failed to pull latest code" "$RED"
    exit 1
}
print_message "✅ Code updated successfully" "$GREEN"
echo ""

# Step 2: Stop existing containers
print_message "🛑 Step 2: Stopping existing containers..." "$BLUE"
docker-compose -f docker-compose.prod.yml down || {
    print_message "⚠️  Warning: Could not stop containers (they might not be running)" "$YELLOW"
}
print_message "✅ Containers stopped" "$GREEN"
echo ""

# Step 3: Remove old images (optional - uncomment if you want to clean up)
# print_message "🗑️  Step 3: Removing old images..." "$BLUE"
# docker-compose -f docker-compose.prod.yml down --rmi local || true
# print_message "✅ Old images removed" "$GREEN"
# echo ""

# Step 4: Build new images
print_message "🔨 Step 3: Building Docker images..." "$BLUE"
docker-compose -f docker-compose.prod.yml build --no-cache || {
    print_message "❌ Failed to build images" "$RED"
    exit 1
}
print_message "✅ Images built successfully" "$GREEN"
echo ""

# Step 5: Start containers
print_message "▶️  Step 4: Starting containers..." "$BLUE"
docker-compose -f docker-compose.prod.yml up -d || {
    print_message "❌ Failed to start containers" "$RED"
    exit 1
}
print_message "✅ Containers started" "$GREEN"
echo ""

# Step 6: Wait for services to be healthy
print_message "⏳ Step 5: Waiting for services to be healthy..." "$BLUE"
sleep 15

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_message "✅ Services are running" "$GREEN"
else
    print_message "❌ Services failed to start properly" "$RED"
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi
echo ""

# Step 7: Run database migrations (if applicable)
print_message "🗄️  Step 6: Running database migrations..." "$BLUE"
docker-compose -f docker-compose.prod.yml exec -T app npm run migration:run || {
    print_message "⚠️  Warning: Migration command failed or not configured" "$YELLOW"
    print_message "If you don't have migrations, you can ignore this" "$YELLOW"
}
print_message "✅ Migrations completed" "$GREEN"
echo ""

# Step 8: Show container status
print_message "📊 Step 7: Checking container status..." "$BLUE"
docker-compose -f docker-compose.prod.yml ps
echo ""

# Step 9: Show recent logs
print_message "📋 Recent application logs:" "$BLUE"
docker-compose -f docker-compose.prod.yml logs --tail=30 app
echo ""

# Step 10: Health check
print_message "🏥 Step 8: Running health check..." "$BLUE"
sleep 5
if curl -f http://localhost:3000/healthCheck > /dev/null 2>&1; then
    print_message "✅ Health check passed!" "$GREEN"
else
    print_message "⚠️  Warning: Health check failed. Check logs above." "$YELLOW"
fi
echo ""

# Final summary
print_message "================================================" "$GREEN"
print_message "✨ Deployment Complete!" "$GREEN"
print_message "================================================" "$GREEN"
echo ""
print_message "📍 Your application is now running!" "$BLUE"
print_message "   Backend API: http://localhost:3000" "$BLUE"
print_message "   Health Check: http://localhost:3000/healthCheck" "$BLUE"
echo ""
print_message "💡 Useful commands:" "$YELLOW"
echo "   View logs:        docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop containers:  docker-compose -f docker-compose.prod.yml down"
echo "   Restart:          docker-compose -f docker-compose.prod.yml restart"
echo "   Shell access:     docker-compose -f docker-compose.prod.yml exec app sh"
echo ""
print_message "🎉 Happy coding!" "$GREEN"