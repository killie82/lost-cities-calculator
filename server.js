// A dependency-free local preview. GitHub Pages serves the files directly.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const types = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'], '/scoring.js': ['scoring.js', 'text/javascript'] };
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  // Allow only this project's named art assets; never expose arbitrary files.
  const artwork = /^\/assets\/cards\/(yellow|white|blue|green|red|purple)\.webp$/.test(pathname);
  const entry = types[pathname] || (artwork ? [pathname.slice(1), 'image/webp'] : undefined);
  if (!entry) { response.writeHead(404); response.end('Not found'); return; }
  try {
    const content = await readFile(new URL(entry[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8` });
    response.end(content);
  } catch { response.writeHead(500); response.end('Unable to load preview'); }
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`));
