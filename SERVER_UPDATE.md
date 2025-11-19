# Инструкция по обновлению на сервере

## Подключение к серверу
```bash
ssh ubuntu@81.162.55.117
```
Пароль: `dz9sdsds)sQuuaamxxdt`

## Шаг 1: Найти директорию проекта

Проект может быть в одной из этих директорий:
```bash
# Проверяем возможные места
ls -la ~/
ls -la /var/www/
ls -la /home/ubuntu/

# Или ищем по всему серверу
find /home -name "linkkotmatiz" 2>/dev/null
find /var -name "linkkotmatiz" 2>/dev/null
```

## Шаг 2: Проверить текущую версию

После того как нашли директорию проекта:
```bash
cd <директория_проекта>
git log -1 --oneline
```

Должно быть: `181d637 Force open links in Chrome browser, not Telegram WebView`

Если это старая версия, обновляем:

## Шаг 3: Обновление проекта

```bash
# Переходим в директорию проекта
cd <директория_проекта>

# Сохраняем текущие изменения (если есть)
git stash

# Получаем последние обновления с GitHub
git pull origin main

# Проверяем что получили последний коммит
git log -1 --oneline

# Должно быть: 181d637 Force open links in Chrome browser, not Telegram WebView
```

## Шаг 4: Установить зависимости и собрать проект

```bash
# Устанавливаем зависимости
npm install

# Собираем проект
npm run build
```

## Шаг 5: Перезапустить сервер

```bash
# Смотрим какие процессы запущены
pm2 list

# Перезапускаем все процессы
pm2 restart all

# Или перезапускаем конкретный процесс (например linkzone)
pm2 restart linkzone

# Проверяем логи
pm2 logs --lines 50
```

## Шаг 6: Проверка

1. Открываем сайт в браузере
2. Проверяем что изменения применились
3. Проверяем в консоли браузера (F12) нет ли ошибок

## Если что-то пошло не так

### Проблема: git pull не работает
```bash
# Удаляем локальные изменения
git reset --hard HEAD
git pull origin main
```

### Проблема: npm install выдает ошибки
```bash
# Удаляем node_modules и package-lock.json
rm -rf node_modules package-lock.json
npm install
```

### Проблема: pm2 не запускается
```bash
# Останавливаем все процессы
pm2 stop all
pm2 delete all

# Запускаем заново
npm run start

# Или
pm2 start npm --name "linkzone" -- start
```

## Быстрая команда (если проект в ~/linkkotmatiz)

```bash
cd ~/linkkotmatiz && \
git pull origin main && \
npm install && \
npm run build && \
pm2 restart all && \
pm2 logs --lines 20
```

## Быстрая команда (если проект в /var/www/linkkotmatiz)

```bash
cd /var/www/linkkotmatiz && \
git pull origin main && \
npm install && \
npm run build && \
pm2 restart all && \
pm2 logs --lines 20
```

## Последний коммит который должен быть на сервере

```
commit 181d637
Force open links in Chrome browser, not Telegram WebView
```

Этот коммит содержит:
- Принудительное открытие ссылок в Chrome через Telegram WebApp API
- Android Intent URL для прямого открытия в Chrome
- iOS redirect для Safari
- 5 fallback методов
