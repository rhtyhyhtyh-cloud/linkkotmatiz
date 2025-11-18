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

// ИСПРАВЛЕНИЕ #5: Продвинутый редирект для обхода блокировок
// Использует base64 кодирование и множественные методы обхода
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

  // Кодируем URL в base64 для обхода простых фильтров
  const encodedUrl = Buffer.from(targetUrl).toString('base64');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="robots" content="noindex, nofollow">
      <title>Loading...</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #0A0F1C;
          overflow: hidden;
        }
        #loader {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #00d9ff;
          font-family: sans-serif;
          text-align: center;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(0, 217, 255, 0.3);
          border-radius: 50%;
          border-top-color: #00d9ff;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div id="loader">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>
      <script>
        (function() {
          // Декодируем URL из base64
          var encoded = "${encodedUrl}";
          var url = atob(encoded);

          // Метод 1: Создаем невидимый iframe который загружает целевую страницу
          // Затем перенаправляем основное окно
          var iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = 'about:blank';
          document.body.appendChild(iframe);

          // Небольшая задержка для загрузки iframe
          setTimeout(function() {
            try {
              // Перенаправляем через несколько методов одновременно

              // Способ 1: Прямое присвоение
              window.location = url;

              // Способ 2: Через replace (не добавляет в историю)
              setTimeout(function() {
                window.location.replace(url);
              }, 50);

              // Способ 3: Через href
              setTimeout(function() {
                window.location.href = url;
              }, 100);

              // Способ 4: Через assign
              setTimeout(function() {
                window.location.assign(url);
              }, 150);

              // Способ 5: Создаем ссылку и кликаем
              setTimeout(function() {
                var a = document.createElement('a');
                a.href = url;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
              }, 200);

            } catch (e) {
              // Если всё не сработало - показываем ссылку
              document.getElementById('loader').innerHTML =
                '<p>Нажмите <a href="' + url + '" style="color: #00d9ff;">здесь</a> для продолжения</p>';
            }
          }, 100);
        })();
      </script>
    </body>
    </html>
  `);
});

export default router;
