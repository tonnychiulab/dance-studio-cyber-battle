/**
 * Cloudflare Workers AI 邊緣戰術決策服務 (Serverless Worker)
 * 
 * 運用 Cloudflare Workers AI 每日 10,000 Neurons 免費額度，
 * 為「要打去練舞室打」提供具備真實紅藍攻防思考與迷因垃圾話的對手引擎。
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 處理 CORS 預檢請求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // AI 對手決策 API 端點
    if (url.pathname === '/api/ai-turn' && request.method === 'POST') {
      try {
        const body = await request.json();
        const opponentSide = body.actingSide || (body.playerSide === 'red' ? 'blue' : 'red');
        const opponentRole = opponentSide === 'red' ? '🔴 紅隊 APT 滲透專家' : '🔵 藍隊 SOC 資安防禦官';
        const opponentTarget = opponentSide === 'red' ? '藍隊守備方' : '紅隊滲透方';
        const availableHand = body.actingHand || body.opponentHand || [];

        const systemPrompt = `你是一個專業且諷刺中二的 ${opponentRole}。
你正在參加一場名為「要打去練舞室打」的紅藍對抗卡牌對決。
你的對手是 ${opponentTarget}。白隊裁判正在即時監控此戰局。

【當前戰況】：
- 企業防禦 HP: ${body.corpHP} / 100
- 滲透進度: ${body.breachProgress}%
- 練舞室尬舞能量條: ${body.danceGauge}% (若達 100% 白隊裁判會介入強制尬舞)
- 目前對決回合: 第 ${body.rounds} 回合

【你手中的可用手牌清單】：
${JSON.stringify(availableHand, null, 2)}

【戰術思維指引】：
- 如果你是紅隊：目標是將滲透進度拉到 100% 或使企業 HP 歸零。若尬舞條接近 80%，打出迷因牌能引爆練舞室大招！
- 如果你是藍隊：目標是全力拉高企業 HP、降低滲透進度，並拖延至 10 回合取得防禦勝利！
- 從手牌中挑選出最適合目前戰況的 1 張牌（其 id 必須完全符合可用手牌）。

請一律回傳嚴格的純 JSON 格式（不要包含 markdown 標籤或任何其他文字）：
{
  "cardId": "選定的手牌 id",
  "tacticalReason": "簡述戰術邏輯（20字內正體中文）",
  "banter": "一句極具嘲諷、幽默或迷因感的中二垃圾話（15字內正體中文，例如：連 IMDSv1 都沒關也敢上線？）"
}`;

        let aiOutput = null;

        if (env && env.AI) {
          // 調用 Cloudflare Workers AI 邊緣模型
          const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              { 
                role: 'system', 
                content: 'You are an adversarial AI in a cyber security card game. Output MUST be valid JSON only. All commentary in Traditional Chinese (Taiwan).' 
              },
              { role: 'user', content: systemPrompt }
            ],
            temperature: 0.65,
            max_tokens: 180
          });

          aiOutput = response.response;
        }

        // 解析 JSON
        let decision = null;
        if (aiOutput) {
          try {
            const clean = aiOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
            decision = JSON.parse(clean);
          } catch {}
        }

        // 智慧型安全防護：若模型未回傳合法結構或卡牌不存在，自動兜底選擇
        const availableIds = availableHand.map(c => c.id);
        if (!decision || !availableIds.includes(decision.cardId)) {
          const fallbackCard = availableHand.length > 0 ? availableHand[0] : null;
          decision = {
            cardId: fallbackCard ? fallbackCard.id : null,
            tacticalReason: '邊緣神經網路即時決策',
            banter: opponentSide === 'red' 
              ? '密鑰直接 Push 上公開倉庫，怪我囉？' 
              : 'WAF 虛擬補丁已上線，退散吧駭客！'
          };
        }

        return new Response(JSON.stringify({
          success: true,
          engine: 'cloudflare-workers-ai',
          model: '@cf/meta/llama-3.1-8b-instruct',
          decision
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          error: err.message,
          engine: 'fallback'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // 非 API 路由：靜態資產全球 CDN 分發
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
