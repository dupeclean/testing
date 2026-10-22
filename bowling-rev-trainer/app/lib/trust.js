'use strict';
// Is this URL the app's own page? Compared as file paths rather than URL text, so install folders
// with spaces, brackets, "~" or accents, and Windows drive-letter case, all still match.
const path = require('path');
const { fileURLToPath } = require('url');

function isRendererUrl(url, rendererPath, platform = process.platform) {
  if (typeof url !== 'string') return false;
  const win = platform === 'win32';
  const P = win ? path.win32 : path.posix;   // the rules of the platform asked about, whatever this machine is
  try {
    const u = new URL(url);
    if (u.protocol !== 'file:') return false;
    const a = P.resolve(fileURLToPath(u, { windows: win }));
    const b = P.resolve(rendererPath);
    return win ? a.toLowerCase() === b.toLowerCase() : a === b;
  } catch (_) { return false; }
}

module.exports = { isRendererUrl };
