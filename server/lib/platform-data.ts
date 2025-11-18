import fs from 'fs';
import path from 'path';

// Path to store platform links data
const DATA_FILE = path.join(process.cwd(), 'data', 'platform-links.json');

export type PlatformData = {
  web: string;
  ios: string;
  android: string;
  androidFileName?: string;
  lastUpdated?: number;
};

export type PlatformLinks = Record<string, PlatformData>;

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read platform links from file
export function readPlatformLinks(): PlatformLinks {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading platform links:', error);
  }
  return {};
}

// Write platform links to file
export function writePlatformLinks(data: PlatformLinks): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing platform links:', error);
    return false;
  }
}

// Update a single platform's link
export function updatePlatformLink(
  platformId: string,
  linkType: 'web' | 'ios' | 'android',
  url: string,
  fileName?: string
): boolean {
  const links = readPlatformLinks();

  if (!links[platformId]) {
    links[platformId] = { web: '', ios: '', android: '' };
  }

  links[platformId][linkType] = url;
  links[platformId].lastUpdated = Date.now();

  if (linkType === 'android' && fileName) {
    links[platformId].androidFileName = fileName;
  }

  return writePlatformLinks(links);
}

// Delete a platform
export function deletePlatform(platformId: string): boolean {
  const links = readPlatformLinks();

  if (links[platformId]) {
    delete links[platformId];
    return writePlatformLinks(links);
  }

  return false;
}
