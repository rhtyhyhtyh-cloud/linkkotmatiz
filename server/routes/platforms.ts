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

// ИСПРАВЛЕНИЕ #5: Redirect proxy для обхода блокировок Telegram/провайдера
// Перенаправляет через наш сервер для обхода блокировок реферальных ссылок
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

  // Редирект через HTML meta refresh для обхода блокировок
  // Это работает даже когда Telegram блокирует прямые редиректы
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="refresh" content="0;url=${targetUrl}">
      <meta name="robots" content="noindex, nofollow">
      <title>Redirecting...</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0A0F1C;
          color: #00d9ff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          text-align: center;
        }
        .loader {
          display: inline-block;
          width: 50px;
          height: 50px;
          border: 3px solid rgba(0, 217, 255, 0.3);
          border-radius: 50%;
          border-top-color: #00d9ff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        h1 {
          margin-top: 20px;
          font-size: 24px;
          font-weight: 600;
        }
        p {
          margin-top: 10px;
          color: #8899aa;
          font-size: 14px;
        }
      </style>
      <script>
        // Множественные методы редиректа для максимальной совместимости
        setTimeout(function() {
          // Метод 1: window.location
          try {
            window.location.href = "${targetUrl}";
          } catch (e) {
            console.log("Method 1 failed");
          }

          // Метод 2: window.location.replace (не добавляет в историю)
          setTimeout(function() {
            try {
              window.location.replace("${targetUrl}");
            } catch (e) {
              console.log("Method 2 failed");
            }
          }, 100);

          // Метод 3: Создаем и кликаем по ссылке
          setTimeout(function() {
            try {
              var a = document.createElement('a');
              a.href = "${targetUrl}";
              a.target = '_self';
              document.body.appendChild(a);
              a.click();
            } catch (e) {
              console.log("Method 3 failed");
            }
          }, 200);
        }, 100);
      </script>
    </head>
    <body>
      <div>
        <div class="loader"></div>
        <h1>Перенаправление...</h1>
        <p>Если не перенаправило автоматически, <a href="${targetUrl}" style="color: #00d9ff;">нажмите здесь</a></p>
      </div>
    </body>
    </html>
  `);
});

export default router;
