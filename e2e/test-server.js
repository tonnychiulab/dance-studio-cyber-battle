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

            if (data.isFreeform) {
              const genCard = side === 'red' ? {
                id: `ai_gen_test_${Date.now()}`,
                name: 'E2E 現場出題：MCP 提示注入穿透',
                side: 'red',
                mitre: 'T1059.AI',
                cost: 2,
                type: 'attack',
                attack: 26,
                defense: 0,
                reduceBreach: 0,
                danceCharge: 20,
                description: 'E2E 測試：AI 現場即時自創之尖端滲透攻擊！',
                flavor: '「大至急！這招你防得住嗎？」',
                isAIGenerated: true
              } : {
                id: `ai_gen_test_${Date.now()}`,
                name: 'E2E 見招拆招：高市流全域關站隔離',
                side: 'blue',
                mitre: 'Def-Shutdown',
                cost: 2,
                type: 'defense',
                attack: 0,
                defense: 25,
                reduceBreach: 22,
                danceCharge: 20,
                description: 'E2E 測試：AI 現場即時見招拆招之防禦卡牌！',
                flavor: '「全域拔線，立於不敗之地！」',
                isAIGenerated: true
              };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                isFreeform: true,
                decision: {
                  card: genCard,
                  tacticalReason: side === 'red' ? 'E2E 自由出題：突破防線' : 'E2E 自由出題：見招拆招',
                  banter: '自由搏鬥全面啟動！'
                }
              }));
              return;
            }

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
