import { Router } from 'express';
import https from 'https';
import { readPlatformLinks, writePlatformLinks, type PlatformLinks } from '../lib/platform-data';

const router = Router();

// GET all platform links
router.get('/api/platform-links', (req, res) => {
  const links = readPlatformLinks();
  res.json(links);
});

// GET specific platform links
router.get('/api/platform-links/:platformId', (req, res) => {
  const links = readPlatformLinks();
  const platformLinks = links[req.params.platformId];

  if (platformLinks) {
    res.json(platformLinks);
  } else {
    res.status(404).json({ error: 'Platform not found' });
  }
});

// POST/PUT update platform links (requires admin authentication)
router.post('/api/platform-links/:platformId', (req, res) => {
  const { platformId } = req.params;
  const { web, ios, android, adminKey } = req.body;

  // Simple admin key check (you should use proper authentication)
  const ADMIN_KEY = process.env.ADMIN_KEY || 'change-this-in-production';

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const links = readPlatformLinks();
  links[platformId] = { web, ios, android };

  if (writePlatformLinks(links)) {
    res.json({ success: true, platformId, links: links[platformId] });
  } else {
    res.status(500).json({ error: 'Failed to update platform links' });
  }
});

// DELETE platform links (requires admin authentication)
router.delete('/api/platform-links/:platformId', (req, res) => {
  const { platformId } = req.params;
  const { adminKey } = req.body;

  const ADMIN_KEY = process.env.ADMIN_KEY || 'change-this-in-production';

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const links = readPlatformLinks();

  if (links[platformId]) {
    delete links[platformId];

    if (writePlatformLinks(links)) {
      res.json({ success: true, platformId });
    } else {
      res.status(500).json({ error: 'Failed to delete platform links' });
    }
  } else {
    res.status(404).json({ error: 'Platform not found' });
  }
});

// ИСПРАВЛЕНИЕ #2: Proxy endpoint для скачивания APK с cache-busting
// Добавляем timestamp для предотвращения кеширования старых версий APK
router.get('/api/download-apk/:platformId', (req, res) => {
  const { platformId } = req.params;
  const links = readPlatformLinks();
  const platformData = links[platformId];

  if (!platformData || !platformData.android) {
    return res.status(404).json({ error: 'APK not found' });
  }

  const apkUrl = platformData.android;
  const fileName = platformData.androidFileName || `${platformId}.apk`;
  const timestamp = platformData.lastUpdated || Date.now();

  // Set headers for file download with cache control
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-File-Version', timestamp.toString());

  // Proxy the file from Telegram
  https.get(apkUrl, (fileStream) => {
    fileStream.pipe(res);
  }).on('error', (error) => {
    console.error('Error downloading APK:', error);
    res.status(500).json({ error: 'Failed to download APK' });
  });
});

// ИСПРАВЛЕНИЕ #5: Двухэтапный редирект для полного обхода блокировки
// Сначала переходим на промежуточную страницу на нашем домене, потом на целевую
router.get('/api/redirect/:platformId/:linkType', (req, res) => {
  const { platformId, linkType } = req.params;
  const links = readPlatformLinks();
  const platformData = links[platformId];

  if (!platformData) {
    return res.status(404).send('Platform not found');
  }

  const targetUrl = platformData[linkType as 'web' | 'ios' | 'android'];

  if (!targetUrl) {
    return res.status(404).send('Link not found');
  }

  // Кодируем URL в base64
  const encodedUrl = Buffer.from(targetUrl).toString('base64');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Redirecting...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0A0F1C;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .container {
      text-align: center;
      padding: 20px;
    }
    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(0, 217, 255, 0.2);
      border-radius: 50%;
      border-top-color: #00d9ff;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .text {
      color: #00d9ff;
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 10px;
    }
    .subtext {
      color: #6B8299;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <div class="text">Подключение...</div>
    <div class="subtext">Пожалуйста, подождите</div>
  </div>
  <script>
    (function() {
      // Декодируем URL
      var b64 = "${encodedUrl}";
      var url = atob(b64);

      // Определяем платформу
      var isAndroid = /Android/i.test(navigator.userAgent);
      var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      var isTelegram = navigator.userAgent.includes('Telegram');

      // Функция редиректа
      function redirect() {
        try {
          // Метод 1: Для Telegram WebApp используем специальный API
          if (isTelegram && window.Telegram && window.Telegram.WebApp) {
            try {
              window.Telegram.WebApp.openLink(url);
              return;
            } catch(e) {}
          }

          // Метод 2: Стандартный редирект через location
          window.location.href = url;

          // Метод 3: Fallback через replace
          setTimeout(function() {
            window.location.replace(url);
          }, 100);

          // Метод 4: Fallback через assign
          setTimeout(function() {
            window.location.assign(url);
          }, 200);

        } catch(e) {
          // Последняя попытка - показываем ссылку
          document.body.innerHTML = '<div style="text-align:center;padding:40px;color:#00d9ff;font-family:sans-serif;"><p style="margin-bottom:20px;">Нажмите на ссылку для продолжения:</p><a href="' + url + '" style="color:#00d9ff;font-size:18px;text-decoration:underline;">Перейти на сайт</a></div>';
        }
      }

      // Задержка перед редиректом для загрузки страницы
      setTimeout(redirect, 500);
    })();
  </script>
</body>
</html>`);
});

export default router;
