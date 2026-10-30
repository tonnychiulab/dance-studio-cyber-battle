/**
 * Cloudflare Workers AI 邊緣戰術決策服務 (Serverless Worker)
 * 
 * 運用 Cloudflare Workers AI 每日 10,000 Neurons 免費額度，
 * 支援「經典手牌對決」與「自由搏鬥 (AI 出題、現場見招拆招)」雙模式。
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

    // AI 對手決策與自由出題 API 端點
    if (url.pathname === '/api/ai-turn' && request.method === 'POST') {
      try {
        const body = await request.json();
        const opponentSide = body.actingSide || (body.playerSide === 'red' ? 'blue' : 'red');
        const opponentRole = opponentSide === 'red' ? '🔴 紅隊 APT 滲透專家' : '🔵 藍隊 SOC 資安防禦官';
        const opponentTarget = opponentSide === 'red' ? '藍隊守備方' : '紅隊滲透方';
        const availableHand = body.actingHand || body.opponentHand || [];
        const isFreeform = !!body.isFreeform;

        let systemPrompt = '';

        if (isFreeform) {
          // === 自由搏鬥模式：由 AI 現場創作全新卡牌與出題 ===
          const lastActionDesc = body.lastAction 
            ? `【對手上一回合發動的行動】：【${body.lastAction.name}】(${body.lastAction.description || ''})。` 
            : '【開局首回合】：雙方尚未有先前出牌紀錄。';

          systemPrompt = `你是一個頂級的 ${opponentRole}。
現在進入「自由搏鬥模式 (Free-Form AI Battle)」！
不要受限於死板的既有手牌，請你發揮專業資安知識與時事迷因，根據當前戰況「現場自創出題」一張全新的資安卡牌！

【當前即時戰況】：
- 企業防禦 HP: ${body.corpHP} / 100
- 滲透進度: ${body.breachProgress}%
- 練舞室尬舞能量: ${body.danceGauge}%
- 對決回合: 第 ${body.rounds} 回合
${lastActionDesc}

【數值平衡設計規範】：
${opponentSide === 'red' ? `
- 紅隊駭客規則：發明一招尖端滲透攻擊（如：LLM Prompt Injection 劫持 Docker、BGP 路由毒化、深偽語音釣魚、eBPF Rootkit 逃逸、PHP2Shell RCE、量子解密等）！
- attack: 22 到 30 之間的整數
- defense: 0
- reduceBreach: 0
- danceCharge: 15 到 30 之間的整數
` : `
- 藍隊 SOC 規則：針對對手上一動（見招拆招），發明一招針對性的防禦或主動反制大招（如：強制 FIDO2 Passkey、eBPF 核心監控、LLM 語意邊界護欄、高市流預防性關站、API 微隔離等）！
- attack: 0
- defense: 20 到 30 之間的整數
- reduceBreach: 15 到 25 之間的整數（必須大幅壓低紅隊滲透進度！）
- danceCharge: 15 到 25 之間的整數
`}

請一律回傳嚴格的純 JSON 格式（絕不要包含 markdown 標籤或任何其他文字）：
{
  "card": {
    "name": "自創卡片名稱（例如：深偽語音釣魚繞過 MFA）",
    "mitre": "自創或經典代號（例如：T1566.004 或 Def-FIDO2）",
    "cost": 2,
    "type": "${opponentSide === 'red' ? 'attack' : 'defense'}",
    "attack": ${opponentSide === 'red' ? '26' : '0'},
    "defense": ${opponentSide === 'red' ? '0' : '25'},
    "reduceBreach": ${opponentSide === 'red' ? '0' : '20'},
    "danceCharge": 20,
    "description": "精準的手法原理或見招拆招說明（35字內正體中文）",
    "flavor": "一句極具嘲諷、中二或時事迷因的垃圾話（20字內正體中文）"
  },
  "tacticalReason": "簡述為什麼現場發動這招（20字內正體中文）",
  "banter": "一句嗆辣的對手嗆聲（15字內正體中文）"
}`;
        } else {
          // === 經典卡牌庫模式：從手牌中精準挑選 ===
          systemPrompt = `你是一個專業且諷刺中二的 ${opponentRole}。
你正在參加一場名為「要打去練舞室打」的紅藍對抗卡牌對決。
你的對手是 ${opponentTarget}。白隊裁判正在即時監控此戰局。

【當前戰況】：
- 企業防禦 HP: ${body.corpHP} / 100
- 滲透進度: ${body.breachProgress}%
- 練舞室尬舞能量條: ${body.danceGauge}%
- 目前對決回合: 第 ${body.rounds} 回合

【可用手牌清單】：
${JSON.stringify(availableHand, null, 2)}

【戰術思維指引】：
- 如果你是紅隊：目標是將滲透進度拉到 100% 或使企業 HP 歸零。遇到 PHP2Shell (CVE-2026-109618) 要果斷出擊嘲諷日本高市早苗關站潮！
- 如果你是藍隊：全力拉高 HP，並用 reduceBreach 牌降低滲透進度，守過第 6 回合或壓回 0% 奪冠！
- 從手牌中挑選出最適合目前戰況的 1 張牌（其 id 必須完全符合可用手牌）。

請一律回傳嚴格的純 JSON 格式（不要包含 markdown 標籤或任何其他文字）：
{
  "cardId": "選定的手牌 id",
  "tacticalReason": "簡述戰術邏輯（20字內正體中文）",
  "banter": "一句極具嘲諷、幽默或迷因感的中二垃圾話（15字內正體中文）"
}`;
        }

        let aiOutput = null;

        if (env && env.AI) {
          const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              { 
                role: 'system', 
                content: 'You are an adversarial AI in a cyber security card game. Output MUST be valid JSON only. All commentary in Traditional Chinese (Taiwan).' 
              },
              { role: 'user', content: systemPrompt }
            ],
            temperature: 0.75,
            max_tokens: isFreeform ? 320 : 180
          });

          aiOutput = response.response;
        }

        // 解析 JSON
        let parsed = null;
        if (aiOutput) {
          try {
            const clean = aiOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
            parsed = JSON.parse(clean);
          } catch {}
        }

        if (isFreeform) {
          // 自由搏鬥返回處理
          let generatedCard = parsed?.card;
          if (!generatedCard || !generatedCard.name) {
            // 後端降級程序化自創卡牌
            generatedCard = opponentSide === 'red' ? {
              name: 'AI 現場自創：MCP 提示注入穿透',
              mitre: 'T1059.AI',
              cost: 2,
              type: 'attack',
              attack: 26,
              defense: 0,
              reduceBreach: 0,
              danceCharge: 20,
              description: '利用模型提示詞邊界模糊性，注入越權指令接管後台 Docker 環境。',
              flavor: '「只要給 Prompt 加點催眠，AI 也會乖乖開門。」'
            } : {
              name: 'AI 現場自創：eBPF 核心動態沙箱隔離',
              mitre: 'Def-eBPF',
              cost: 2,
              type: 'defense',
              attack: 0,
              defense: 25,
              reduceBreach: 22,
              danceCharge: 20,
              description: '在 Linux 核心層即時攔截非法 syscall，修復 25 點防禦並擊退 22% 滲透！',
              flavor: '「你還在應用層打轉？我已經在 Kernel 恭候多時了。」'
            };
          }

          generatedCard.id = `ai_gen_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
          generatedCard.side = opponentSide;
          generatedCard.isAIGenerated = true;

          return new Response(JSON.stringify({
            success: true,
            isFreeform: true,
            engine: 'cloudflare-workers-ai',
            model: '@cf/meta/llama-3.1-8b-instruct',
            decision: {
              card: generatedCard,
              tacticalReason: parsed?.tacticalReason || '邊緣神經網路自由出題決策',
              banter: parsed?.banter || (opponentSide === 'red' ? '這招你沒見過吧？' : '精準反制，全域安全！')
            }
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } else {
          // 經典手牌模式返回處理
          const availableIds = availableHand.map(c => c.id);
          let decision = parsed;
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
            isFreeform: false,
            engine: 'cloudflare-workers-ai',
            model: '@cf/meta/llama-3.1-8b-instruct',
            decision
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

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
