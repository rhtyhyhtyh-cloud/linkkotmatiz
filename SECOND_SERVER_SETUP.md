# Установка на второй сервер (81.162.55.90)

## Быстрая установка - выполните по порядку:

### 1. Подключение к серверу
```bash
ssh ubuntu@81.162.55.90
```
Пароль: `oifhbxGizkwt4&pjomyu`

### 2. Клонирование проекта
```bash
cd ~
git clone https://github.com/rhtyhyhtyh-cloud/linkkotmatiz.git
cd linkkotmatiz
git checkout main
```

### 3. Установка зависимостей
```bash
npm install
```

### 4. Создать .env файл
```bash
nano .env
```

Вставьте туда (замените YOUR_BOT_TOKEN на токен бота):
```
BOT_TOKEN=YOUR_BOT_TOKEN
PORT=3000
```

Сохранить: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5. Сборка проекта
```bash
npm run build
```

### 6. Запуск с PM2
```bash
# Если PM2 не установлен:
sudo npm install -g pm2

# Запуск приложения:
pm2 start npm --name "linkzone" -- start

# Автозапуск при перезагрузке:
pm2 startup
pm2 save

# Проверка:
pm2 list
pm2 logs linkzone --lines 30
```

### 7. Настройка Nginx

Создать конфиг:
```bash
sudo nano /etc/nginx/sites-available/linkzone
```

Вставить:
```nginx
server {
    listen 80;
    server_name 81.162.55.90 linkzona.org www.linkzona.org;

    # Логи
    access_log /var/log/nginx/linkzone-access.log;
    error_log /var/log/nginx/linkzone-error.log;

    # Проксирование на Node.js приложение
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Заголовки
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Сохранить: `Ctrl+O`, `Enter`, `Ctrl+X`

Активировать конфиг:
```bash
sudo ln -s /etc/nginx/sites-available/linkzone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Проверка

Откройте в браузере:
- http://81.162.55.90
- http://linkzona.org (если домен настроен)

Проверьте логи:
```bash
pm2 logs linkzone --lines 50
```

## Одна команда для всего (после клонирования):

```bash
cd ~/linkkotmatiz && \
npm install && \
npm run build && \
pm2 start npm --name "linkzone" -- start && \
pm2 save && \
echo "✅ Сервер запущен на порту 3000"
```

## Обновление кода (в будущем):

```bash
cd ~/linkkotmatiz && \
git pull origin main && \
npm install && \
npm run build && \
pm2 restart linkzone && \
echo "✅ Обновлено!"
```

## Что установлено:

✅ Telegram WebApp SDK для открытия ссылок в Chrome
✅ Android Intent URL для принудительного открытия в Chrome
✅ iOS Safari redirect
✅ Множественные fallback методы
✅ Proxy redirect endpoint для обхода блокировок

Коммит: `181d637 Force open links in Chrome browser, not Telegram WebView`
