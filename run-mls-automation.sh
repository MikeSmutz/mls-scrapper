#!/bin/bash

# MLS Automation Runner Script

echo "🏠 MLS Matrix Automation Tool"
echo "============================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env file from template..."
    
    cat > .env << EOL
# MLS Login Credentials
MLS_USERNAME=your_username_here
MLS_PASSWORD=your_password_here

# Optional: Additional Configuration
MLS_BASE_URL=https://matrix.lvar-mls.com/matrix/?f=
DOWNLOAD_WAIT_TIMEOUT=30000
HEADLESS_MODE=false
SLOW_MODE_DELAY=1000
EOL
    
    echo "✅ .env file created. Please edit it with your MLS credentials."
    echo "   Run this script again after updating your credentials."
    exit 1
fi

# Check if credentials are set
source .env
if [ "$MLS_USERNAME" = "your_username_here" ] || [ "$MLS_PASSWORD" = "your_password_here" ]; then
    echo "⚠️  Please update your MLS credentials in the .env file"
    echo "   Current username: $MLS_USERNAME"
    exit 1
fi

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p data/exports data/screenshots data/temp

# Show menu
echo ""
echo "Select an option:"
echo "1) Run main MLS automation (search & download CSV)"
echo "2) Run simple search example"
echo "3) Run batch search example"
echo "4) Run price monitoring example"
echo "5) Run all examples"
echo "6) Run in headed mode (visible browser)"
echo "7) Run with debug mode"
echo ""

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo "🚀 Running main MLS automation..."
        npm run test automation/mls/mls-matrix-automation.spec.ts
        ;;
    2)
        echo "🔍 Running simple search example..."
        npm run test automation/mls/example-mls-automation.spec.ts -g "Example 1"
        ;;
    3)
        echo "📊 Running batch search example..."
        npm run test automation/mls/example-mls-automation.spec.ts -g "Example 3"
        ;;
    4)
        echo "💰 Running price monitoring example..."
        npm run test automation/mls/example-mls-automation.spec.ts -g "Example 4"
        ;;
    5)
        echo "🎯 Running all examples..."
        npm run test automation/mls/example-mls-automation.spec.ts
        ;;
    6)
        echo "👀 Running in headed mode..."
        npm run test:headed automation/mls/mls-matrix-automation.spec.ts
        ;;
    7)
        echo "🐛 Running in debug mode..."
        npm run test:debug automation/mls/mls-matrix-automation.spec.ts
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Automation complete! Check the data/ directory for results."
