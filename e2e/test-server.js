import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../dist');

export function startTestServer(port = 5173) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // 模擬 /api/ai-turn 邊緣端點
      if (req.url === '/api/ai-turn' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const side = data.actingSide || (data.playerSide === 'red' ? 'blue' : 'red');
            const hand = data.actingHand || data.opponentHand || [];
            const chosen = hand[0] || null;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              cardId: chosen ? chosen.id : null,
              tacticalReason: side === 'red' ? 'E2E 滲透決策：鎖定防線弱點' : 'E2E 守備決策：加固安全邊界',
              banter: side === 'red' ? '準備好去練舞室了嗎？' : '你的封包已經被 EDR 攔截！'
            }));
          } catch (e) {
            res.writeHead(500);
            res.end();
          }
        });
        return;
      }

      // 靜態資產處理
      let reqPath = req.url.split('?')[0];
      let filePath = path.join(dist, reqPath === '/' ? 'index.html' : reqPath);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(dist, 'index.html');
      }

      const ext = path.extname(filePath);
      const mimes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png'
      };

      res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`[E2E Server] Running at http://127.0.0.1:${port}`);
      resolve(server);
    });

    server.on('error', reject);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startTestServer(5173);
}
