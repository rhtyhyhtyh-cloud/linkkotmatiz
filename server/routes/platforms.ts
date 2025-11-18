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

export default router;
