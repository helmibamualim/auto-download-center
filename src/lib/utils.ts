export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function isValidDownloadUrl(url: string): boolean {
  const validExtensions = ['.apk', '.exe', '.msi', '.dmg', '.zip', '.tar.gz', '.AppImage', '.deb', '.rpm'];
  return validExtensions.some(ext => url.toLowerCase().includes(ext));
}

export function isLegalSoftware(title: string, description: string): boolean {
  const illegalKeywords = ['mod', 'cracked', 'crack', 'keygen', 'patch', 'piracy', 'hack', 'cheat'];
  const text = `${title} ${description}`.toLowerCase();
  return !illegalKeywords.some(keyword => text.includes(keyword));
}

export function extractFileType(url: string): string {
  const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return match ? match[1].toLowerCase() : 'unknown';
}

export function getPlatformFromFileType(fileType: string): string {
  const platformMap: Record<string, string> = {
    'apk': 'Android',
    'exe': 'Windows',
    'msi': 'Windows',
    'dmg': 'macOS',
    'app': 'macOS',
    'deb': 'Linux',
    'rpm': 'Linux',
    'appimage': 'Linux',
    'zip': 'Cross-platform',
    'tar.gz': 'Cross-platform'
  };
  return platformMap[fileType.toLowerCase()] || 'Cross-platform';
}