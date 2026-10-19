'use strict';
// Is this URL the app's own page? Compared as file paths rather than URL text, so install folders
// with spaces, brackets, "~" or accents, and Windows drive-letter case, all still match.
const path = require('path');
const { fileURLToPath } = require('url');

function isRendererUrl(url, rendererPath, platform = process.platform) {
  if (typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'file:') return false;
    const a = path.resolve(fileURLToPath(u, { windows: platform === 'win32' }));
    const b = path.resolve(rendererPath);
    return platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
  } catch (_) { return false; }
}

module.exports = { isRendererUrl };
