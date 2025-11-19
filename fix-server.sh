#!/bin/bash
# Скрипт для быстрого исправления сервера

echo "🔧 Fixing LinkZone server..."

# Переходим в директорию проекта
cd /home/ubuntu/linkkotmatiz || exit

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart linkzone 2>/dev/null || pm2 start npm --name "linkzone" -- start

echo "💾 Saving PM2 state..."
pm2 save

echo "📊 Server status:"
pm2 list

echo ""
echo "✅ Done! Check the website:"
echo "   http://linkzona.org"
echo "   http://81.162.55.117"
echo ""
echo "📋 View logs with: pm2 logs linkzone"
