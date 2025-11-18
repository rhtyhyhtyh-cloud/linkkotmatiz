# 🐧 Инструкция для Ubuntu сервера

## Проблема: Git репозиторий не виден

Если Ubuntu не видит git репозиторий, нужно заново склонировать проект с GitHub.

---

## 📋 Шаг 1: Сначала загрузите изменения на GitHub

На вашем компьютере (Windows):

```bash
cd "C:\Users\REPOBLIC OF GAMERS\Desktop\Новая папка (10)"
git push -u origin main --force
```

Если не получается, используйте GitHub Desktop или Personal Access Token (см. PUSH_TO_GITHUB.md)

---

## 📋 Шаг 2: Подключитесь к Ubuntu серверу

```bash
ssh user@your-server-ip
```

---

## 📋 Шаг 3: Создайте backup старого проекта (если нужно)

```bash
# Найдите папку проекта
cd ~
ls -la

# Если старая папка есть, сделайте backup
sudo cp -r /path/to/old/project ~/project-backup-$(date +%Y%m%d)

# Или переместите
sudo mv /path/to/old/project ~/project-backup-$(date +%Y%m%d)
```

---

## 📋 Шаг 4: Склонируйте репозиторий с GitHub

### Вариант A: Через HTTPS (проще)

```bash
# Перейдите в нужную директорию
cd /var/www  # или /home/user или /opt

# Склонируйте репозиторий
git clone https://github.com/rhtyhyhtyh-cloud/linkkotmatiz.git

# Или если нужна авторизация
git clone https://YOUR_TOKEN@github.com/rhtyhyhtyh-cloud/linkkotmatiz.git

# Перейдите в папку проекта
cd linkkotmatiz
```

### Вариант B: Через SSH (если настроен SSH ключ)

```bash
git clone git@github.com:rhtyhyhtyh-cloud/linkkotmatiz.git
cd linkkotmatiz
```

---

## 📋 Шаг 5: Настройте окружение

### 1. Скопируйте .env файл из backup (если есть)

```bash
# Если у вас был старый проект с настройками
cp ~/project-backup-*/. env .env

# Или создайте новый
cp .env.example .env
nano .env
```

В .env должно быть:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_ADMIN_IDS=123456789,987654321
ADMIN_KEY=your-secure-key
```

### 2. Скопируйте данные платформ (если есть)

```bash
# Если у вас был старый проект с данными
mkdir -p data
cp ~/project-backup-*/data/platform-links.json data/
```

---

## 📋 Шаг 6: Установите зависимости

```bash
# Установите Node.js если нет
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt-get install -y nodejs

# Установите зависимости проекта
npm install

# Или если используете pnpm/yarn
# pnpm install
# yarn install
```

---

## 📋 Шаг 7: Соберите проект

```bash
npm run build
```

Должно появиться:
```
✓ building client environment for production...
✓ building server environment for production...
✓ built in XXXms
```

---

## 📋 Шаг 8: Запустите сервер

### Вариант A: Через PM2 (рекомендуется)

```bash
# Установите PM2 если нет
sudo npm install -g pm2

# Запустите приложение
pm2 start npm --name "linkzone" -- start

# Или напрямую
pm2 start "npm start" --name linkzone

# Настройте автозапуск
pm2 startup
pm2 save

# Проверьте статус
pm2 status
pm2 logs linkzone
```

### Вариант B: Через systemd

Создайте файл `/etc/systemd/system/linkzone.service`:

```bash
sudo nano /etc/systemd/system/linkzone.service
```

Вставьте:
```ini
[Unit]
Description=LinkZone Web Application
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/var/www/linkkotmatiz
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Запустите:
```bash
sudo systemctl daemon-reload
sudo systemctl enable linkzone
sudo systemctl start linkzone
sudo systemctl status linkzone
```

### Вариант C: Через screen/nohup

```bash
# Screen
screen -S linkzone
npm start
# Нажмите Ctrl+A затем D для отключения

# Nohup
nohup npm start > output.log 2>&1 &
```

---

## 📋 Шаг 9: Проверьте что работает

```bash
# Проверьте процесс
ps aux | grep node

# Проверьте порт (замените 8080 на ваш)
sudo netstat -tlnp | grep 8080

# Проверьте API
curl http://localhost:8080/api/ping
# Должно вернуть: {"message":"pong"}
```

---

## 📋 Шаг 10: Настройте Nginx (если используется)

```bash
sudo nano /etc/nginx/sites-available/linkzone
```

Вставьте:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Активируйте:
```bash
sudo ln -s /etc/nginx/sites-available/linkzone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 Полезные команды для управления

### PM2 команды:
```bash
pm2 list                    # Список процессов
pm2 logs linkzone          # Логи
pm2 restart linkzone       # Перезапуск
pm2 stop linkzone          # Остановка
pm2 delete linkzone        # Удаление
pm2 monit                  # Мониторинг
```

### Git команды для обновления:
```bash
cd /var/www/linkkotmatiz
git pull origin main       # Получить обновления
npm install                # Установить зависимости
npm run build              # Собрать проект
pm2 restart linkzone       # Перезапустить
```

---

## ⚠️ Решение проблем

### Проблема: Permission denied

```bash
# Дайте права на папку
sudo chown -R $USER:$USER /var/www/linkkotmatiz
chmod -R 755 /var/www/linkkotmatiz
```

### Проблема: Port already in use

```bash
# Найдите процесс на порту 8080
sudo lsof -i :8080

# Убейте процесс
sudo kill -9 PID
```

### Проблема: Cannot find module

```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Проблема: Git authentication failed

```bash
# Используйте Personal Access Token
git clone https://YOUR_TOKEN@github.com/rhtyhyhtyh-cloud/linkkotmatiz.git

# Или настройте SSH ключ
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Добавьте ключ на GitHub: Settings → SSH keys
```

---

## ✅ Чеклист полной установки

- [ ] Подключился к Ubuntu серверу
- [ ] Создал backup старого проекта (если был)
- [ ] Склонировал репозиторий с GitHub
- [ ] Настроил .env файл
- [ ] Скопировал данные из backup (если были)
- [ ] Установил зависимости (npm install)
- [ ] Собрал проект (npm run build)
- [ ] Запустил сервер (PM2/systemd/screen)
- [ ] Проверил что API работает
- [ ] Настроил Nginx (если используется)
- [ ] Проверил что сайт доступен
- [ ] Проверил что бот отвечает в Telegram

---

## 🎉 Готово!

Теперь ваш сайт работает с всеми исправлениями:
- ✅ Несколько админов могут работать одновременно
- ✅ APK всегда скачиваются свежие
- ✅ Ссылки открываются на всех платформах
- ✅ Код оптимизирован

---

## 📞 Быстрая помощь

Если что-то не работает, пришлите вывод этих команд:

```bash
# На сервере:
pwd
ls -la
cat .env | grep -v "TOKEN"
pm2 list
pm2 logs linkzone --lines 50
curl http://localhost:8080/api/ping
```
