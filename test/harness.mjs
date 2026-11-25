// Test harness: serves a built html (three.js CDN urls rewritten to the local copy) and drives it with headless Chrome.
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
export const NM = path.resolve(here, '../../tools/node_modules');
const { default: puppeteer } = await import(path.join(NM, 'puppeteer-core/lib/esm/puppeteer/puppeteer-core.js'));
export async function open(htmlPath, { mobile = false, width = 1100, height = 700, port = 8200 + Math.floor(Math.random() * 500), dpr = 1 } = {}) {
  let html = fs.readFileSync(htmlPath, 'utf8')
    .replace('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js', '/nm/three/build/three.module.js')
    .replace('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/', '/nm/three/examples/jsm/')
    .replace(/<link[^>]*fonts\.(googleapis|gstatic)[^>]*>/g, '');
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]);
    if (u === '/' || u === '/index.html') { r.setHeader('content-type', 'text/html; charset=utf-8'); return r.end(html); }
    if (u.startsWith('/nm/')) { const f = path.join(NM, u.slice(4)); if (fs.existsSync(f)) { r.setHeader('content-type', 'text/javascript'); return fs.createReadStream(f).pipe(r); } }
    r.statusCode = 404; r.end();
  }).listen(port);
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  if (mobile) await page.emulate({ viewport: { width, height, deviceScaleFactor: dpr, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' });
  else await page.setViewport({ width, height, deviceScaleFactor: dpr });
  const errors = []; page.on('pageerror', (e) => errors.push('PAGEERR ' + e.message.slice(0, 300))); page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error ' + m.text().slice(0, 300)); });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
  await page.waitForFunction('window.__seoul', { timeout: 180000 });
  return { page, errors, sleep: (ms) => new Promise((r) => setTimeout(r, ms)), close: async () => { await browser.close(); srv.close(); } };
}
