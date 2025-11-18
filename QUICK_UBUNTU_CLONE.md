# ⚡ Быстрое клонирование на Ubuntu (5 команд)

## 🚀 Команды для копирования

Скопируйте эти команды **одну за одной** на Ubuntu сервере:

```bash
# 1. Перейдите в нужную директорию
cd /var/www
# Или cd /home/user или cd /opt

# 2. Удалите старую папку (если есть) или переименуйте
sudo mv linkkotmatiz linkkotmatiz-backup-old
# Или sudo rm -rf linkkotmatiz  (ОСТОРОЖНО! Удалит все данные)

# 3. Склонируйте репозиторий с GitHub
git clone https://github.com/rhtyhyhtyh-cloud/linkkotmatiz.git

# 4. Перейдите в папку
cd linkkotmatiz

# 5. Настройте .env файл
nano .env
```

В `.env` вставьте:
```env
TELEGRAM_BOT_TOKEN=8555264615:AAFHfstEGaW6W_PQBdFN4sbR273qbIYoSxM
TELEGRAM_ADMIN_IDS=5695013277,8095865618
ADMIN_KEY=change-this-to-a-secure-random-key
API_BASE_URL=http://localhost:8080
PING_MESSAGE=pong
```

Сохраните: `Ctrl+X` → `Y` → `Enter`

```bash
# 6. Установите зависимости
npm install

# 7. Соберите проект
npm run build

# 8. Перезапустите сервер

# Если PM2:
pm2 restart all
# Или
pm2 delete linkzone && pm2 start npm --name "linkzone" -- start

# Если systemd:
sudo systemctl restart linkzone

# Если вручную:
pkill -9 -f "node.*server"
nohup npm start > output.log 2>&1 &

# 9. Проверьте что работает
pm2 logs linkzone --lines 20
# Или
tail -f output.log
```

---

## ✅ Проверка

```bash
# Проверьте API
curl http://localhost:8080/api/ping
# Должно вернуть: {"message":"pong"}

# Проверьте PM2
pm2 status

# Откройте бота в Telegram
# Напишите /start - должно показать меню
```

---

## 🆘 Если что-то не работает

### Ошибка: Permission denied
```bash
sudo chown -R $USER:$USER /var/www/linkkotmatiz
```

### Ошибка: Port in use
```bash
sudo lsof -i :8080
sudo kill -9 PID
```

### Ошибка: Git clone failed
```bash
# Используйте токен:
git clone https://YOUR_TOKEN@github.com/rhtyhyhtyh-cloud/linkkotmatiz.git
```

---

## 📝 Важно

Если у вас были **старые данные** (platform-links.json), скопируйте их:

```bash
# Из backup
cp ~/linkkotmatiz-backup-old/data/platform-links.json ./data/

# Или из старой папки
cp /path/to/old/project/data/platform-links.json ./data/
```

---

## 🎯 Одна команда для обновления в будущем

```bash
cd /var/www/linkkotmatiz && git pull && npm install && npm run build && pm2 restart all
```

---

Готово! 🎉
