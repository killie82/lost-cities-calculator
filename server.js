// A dependency-free local preview. GitHub Pages serves the files directly.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const types = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'], '/scoring.js': ['scoring.js', 'text/javascript'] };
createServer(async (request, response) => {
  const entry = types[new URL(request.url, 'http://localhost').pathname];
  if (!entry) { response.writeHead(404); response.end('Not found'); return; }
  try {
    const content = await readFile(new URL(entry[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8` });
    response.end(content);
  } catch { response.writeHead(500); response.end('Unable to load preview'); }
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173'));
