#!/bin/bash
# Полный деплой на сервер с портом 8080

echo "🚀 Starting deployment..."

# Переходим в проект
cd /home/ubuntu/linkkotmatiz || exit 1

# Останавливаем сервер
echo "⏸️  Stopping server..."
pm2 stop linkzone 2>/dev/null

# Обновляем код
echo "📥 Pulling latest code..."
git fetch origin
git reset --hard origin/main
git pull origin main

# Показываем текущий коммит
echo "📌 Current commit:"
git log -1 --oneline

# Устанавливаем зависимости
echo "📦 Installing dependencies..."
npm install

# Удаляем старую сборку
echo "🗑️  Removing old build..."
rm -rf dist

# Настраиваем порт 8080
echo "⚙️  Setting PORT=8080..."
if grep -q "^PORT=" .env 2>/dev/null; then
    sed -i 's/^PORT=.*/PORT=8080/' .env
else
    echo "PORT=8080" >> .env
fi

# Собираем проект
echo "🔨 Building project..."
npm run build

# Запускаем сервер
echo "▶️  Starting server..."
pm2 start linkzone 2>/dev/null || pm2 start npm --name "linkzone" -- start

# Сохраняем состояние PM2
pm2 save

# Ждем запуска
sleep 3

# Показываем статус
echo ""
echo "✅ Deployment complete!"
echo ""
pm2 list
echo ""
echo "📊 Logs:"
pm2 logs linkzone --lines 10 --nostream

echo ""
echo "🌐 Website: http://linkzona.org"
echo "📋 View logs: pm2 logs linkzone"
