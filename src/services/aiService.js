/**
 * AI 對手戰術決策服務 (AIDecisionService)
 * 
 * 優先請求 Cloudflare Workers AI 邊緣神經網路（Llama 3.1 8B），
 * 支援「經典手牌對決」與「自由搏鬥 (AI 出題、現場見招拆招)」雙模式，
 * 具備超時保護與「程序化資安組合矩陣」零失敗本地降級能力。
 */

// 紅隊幽默駭客垃圾話庫 (離線/降級使用)
const RED_BANTER_POOL = [
  '大至急！PHP2Shell (CVE-2026-109618) 已經炸鍋，連高市早苗都在 X 發推叫大家關站啦！',
  '免驗證 Use-After-Free 直接遠端 RCE，這波你防得住嗎？',
  '這招 AI 即時出題連我自己都怕，防禦策略準備崩潰吧！',
  '連 IMDSv1 都沒關也敢上線？看我直接拉 Token！',
  '這組 IAM 權限竟然開 s3:*，感謝工程師無私贊助！',
  '你的 WAF 規則慢了 30 毫秒，封包早就打進練舞室了。',
  'npm install 不看相依樹的下場，就是成為我的肉雞。',
  '住手！你們不要再防禦了，要守去練舞室守！'
];

// 藍隊 SOC 資安工程師守備話庫 (離線/降級使用)
const BLUE_BANTER_POOL = [
  '想用這招？抱歉，我邊緣防禦系統現場動態產生虛擬補丁！',
  '響應高市早苗緊急呼籲！修不好我就預防性關站，拔線才是資安最高境界！',
  '連高市早苗的官網都拔線了，我們的伺服器已經安全離線！',
  'WAF 虛擬補丁已於邊緣生效，你的 Payload 已經被丟棄！',
  '偵測到異常流量，該節點已即刻執行網路微隔離。',
  '想要 SSRF？抱歉我們全站強制開啟 IMDSv2 Session！',
  '監控日誌 MTTD 僅 12 秒，資安演練我們是認真的。',
  '不要再打了！白隊裁判準備進場強制尬舞了！'
];

// 自由搏鬥資安程序化生成詞庫 (Procedural Generation Matrix)
const PROCEDURAL_RED_TOPICS = [
  { prefix: '深偽語音欺騙', suffix: '繞過 Helpdesk 客服認證', mitre: 'T1566.004', desc: '利用即時語音克隆偽造主管授權，直接向維運人員重設帳號密碼。' },
  { prefix: 'MCP 提示注入', suffix: '遠端越權劫持 Docker 沙箱', mitre: 'T1059.AI', desc: '在模型傳入參數嵌入特殊指令，誘使邊緣 Agent 執行未授權系統呼叫。' },
  { prefix: 'eBPF 核心 Rootkit', suffix: '繞過 EDR 靜默取得 Ring0 權限', mitre: 'T1547.006', desc: '掛載自訂 eBPF 程式篡改內核探針，達成完全隱匿的常駐後門。' },
  { prefix: 'BGP 邊界路由劫持', suffix: '強制引流中間人監聽 TLS 流量', mitre: 'T1584.004', desc: '宣告虛假 AS 路由使流量途經惡意節點，發動大規模 DNS 與流量劫持。' },
  { prefix: 'WASM 記憶體越界', suffix: '觸發邊緣 Worker 崩潰逃逸', mitre: 'T1190.WASM', desc: '針對 WebAssembly 執行環境的邊界保護瑕疵，穿透宿主進程保護。' }
];

const PROCEDURAL_BLUE_TOPICS = [
  { prefix: '全域強制 FIDO2 Passkey', suffix: '實體硬體綁定完全阻斷憑證竊取', mitre: 'Def-FIDO2', desc: '以實體安全晶片與公開金鑰架構取代傳統密碼，深偽與釣魚全數失效。' },
  { prefix: 'eBPF 系統呼叫微沙箱', suffix: '零延遲攔截未知內核提權行為', mitre: 'Def-eBPF', desc: '在 Linux 核心層即時監視並阻斷非法 sys_execve，保證邊緣安全。' },
  { prefix: 'LLM 語意邊界護欄', suffix: '邊緣閘道即時清洗 Prompt Injection', mitre: 'Def-Guardrails', desc: '在推論引擎前置專屬過濾模型，自動識別並攔截對抗性提示攻擊。' },
  { prefix: '高市流・預防性全域關站', suffix: '拔除外部路由切斷所有攻擊通道', mitre: 'Def-Shutdown', desc: '大至急！響應高市早苗緊急呼籲，預防性拔線讓紅隊無從下手！' },
  { prefix: '零信任微隔離動態重構', suffix: '即時撤銷涉案 IAM Token 與連線', mitre: 'Def-ZeroTrust', desc: '偵測到異常活動秒級限縮憑證權限，將爆炸半徑控制在單一容器內。' }
];

/**
 * 本地程序化自由搏鬥卡牌生成器 (Procedural Card Synthesizer)
 */
export function generateProceduralCard(side, lastAction) {
  const isRed = side === 'red';
  const pool = isRed ? PROCEDURAL_RED_TOPICS : PROCEDURAL_BLUE_TOPICS;
  const item = pool[Math.floor(Math.random() * pool.length)];

  const cardId = `ai_gen_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const banters = isRed ? RED_BANTER_POOL : BLUE_BANTER_POOL;
  const banter = banters[Math.floor(Math.random() * banters.length)];

  if (isRed) {
    const attack = Math.floor(22 + Math.random() * 8); // 22 ~ 29
    return {
      card: {
        id: cardId,
        name: `AI 現場出題：${item.prefix} ${item.suffix}`,
        side: 'red',
        mitre: item.mitre,
        cost: 2,
        type: 'attack',
        attack,
        defense: 0,
        reduceBreach: 0,
        danceCharge: 20,
        description: item.desc,
        flavor: banter,
        isAIGenerated: true
      },
      tacticalReason: `邊緣 AI 現場原創突襲【${item.prefix}】，直擊對手未防備破口！`,
      banter,
      engine: '本地神經程序化生成 (Procedural AI)'
    };
  } else {
    const defense = Math.floor(20 + Math.random() * 8); // 20 ~ 27
    const reduceBreach = Math.floor(16 + Math.random() * 8); // 16 ~ 23
    const targetedReason = lastAction 
      ? `針對紅隊方才發動之【${lastAction.name}】，立即現場架構【${item.prefix}】見招拆招！`
      : `邊緣 SOC 即時自創【${item.prefix}】，強化全域縱深防禦！`;

    return {
      card: {
        id: cardId,
        name: `AI 見招拆招：${item.prefix}`,
        side: 'blue',
        mitre: item.mitre,
        cost: 2,
        type: 'defense',
        attack: 0,
        defense,
        reduceBreach,
        danceCharge: 20,
        description: item.desc,
        flavor: banter,
        isAIGenerated: true
      },
      tacticalReason: targetedReason,
      banter,
      engine: '本地神經程序化生成 (Procedural AI)'
    };
  }
}

/**
 * 本地啟發式智慧決策引擎 (Heuristic Tactical Engine) - 經典模式使用
 */
export function getLocalHeuristicDecision(gameState) {
  const { playerSide, corpHP, breachProgress, danceGauge, rounds } = gameState;
  const isActingRed = gameState.actingSide ? gameState.actingSide === 'red' : (playerSide === 'blue');
  const hand = gameState.actingHand || gameState.opponentHand || [];

  if (!hand || hand.length === 0) return null;

  let selectedCard = null;
  let tacticalReason = '';
  const banters = isActingRed ? RED_BANTER_POOL : BLUE_BANTER_POOL;
  const randomBanter = banters[Math.floor(Math.random() * banters.length)];

  if (isActingRed) {
    // 1. 致命一擊檢查
    const lethalCards = hand.filter(
      c => breachProgress + c.attack >= 100 || corpHP - Math.floor(c.attack * 0.35) <= 0
    );

    if (lethalCards.length > 0) {
      selectedCard = lethalCards.sort((a, b) => b.attack - a.attack)[0];
      tacticalReason = `鎖定致命弱點，發動終局漏洞穿透【${selectedCard.name}】！`;
    }

    // 2. 尬舞爆表誘導
    if (!selectedCard && danceGauge >= 70) {
      const memeCard = hand.find(c => c.danceCharge >= 25);
      if (memeCard) {
        selectedCard = memeCard;
        tacticalReason = `尬舞能量逼近臨界點，引爆練舞室迷因大招【${memeCard.name}】！`;
      }
    }

    // 3. 常態輸出
    if (!selectedCard) {
      const sorted = [...hand].sort((a, b) => b.attack - a.attack);
      selectedCard = sorted[0];
      tacticalReason = `評估權限鏈條，打出最高攻擊力酬載【${selectedCard.name}】`;
    }
  } else {
    // 1. 滲透威脅壓制：若滲透進度高於 30%，全力打出能降低滲透的防禦牌
    if (breachProgress >= 30) {
      const reducers = hand.filter(c => (c.reduceBreach || 0) > 0).sort((a, b) => (b.reduceBreach || 0) - (a.reduceBreach || 0));
      if (reducers.length > 0) {
        selectedCard = reducers[0];
        tacticalReason = `滲透進度達警告線，部署【${selectedCard.name}】強力壓低滲透 ${selectedCard.reduceBreach}%！`;
      }
    }

    // 2. 血量急救
    if (!selectedCard && corpHP <= 45) {
      const maxDefense = [...hand].sort((a, b) => b.defense - a.defense)[0];
      selectedCard = maxDefense;
      tacticalReason = `企業防禦告急，上線【${maxDefense.name}】修補邊界防護！`;
    }

    // 3. 常態防禦
    if (!selectedCard) {
      const sorted = [...hand].sort((a, b) => (b.defense + (b.reduceBreach || 0) * 1.5) - (a.defense + (a.reduceBreach || 0) * 1.5));
      selectedCard = sorted[0];
      tacticalReason = `維持縱深防禦，打出最佳綜合防禦卡【${selectedCard.name}】`;
    }
  }

  return {
    card: selectedCard,
    tacticalReason,
    banter: randomBanter,
    engine: '本地啟發式戰術引擎 (Smart Heuristic)'
  };
}

/**
 * 取得 AI 決策（支援 Workers AI 自由搏鬥與經典手牌模式）
 */
export async function getAIDecision(gameState) {
  const isFreeform = !!gameState.isFreeform;
  const hand = gameState.actingHand || gameState.opponentHand || [];
  const actingSide = gameState.actingSide || (gameState.playerSide === 'red' ? 'blue' : 'red');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);

    const response = await fetch('/api/ai-turn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameState),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.decision) {
        if (data.isFreeform && data.decision.card) {
          // 自由搏鬥 AI 現場即時自創卡牌
          return {
            card: data.decision.card,
            tacticalReason: data.decision.tacticalReason || '邊緣 AI 現場自由出題',
            banter: data.decision.banter || '（駭客保持戰術沉默）',
            engine: '⚡ Cloudflare Workers AI 實時自創 (Llama 3.1 8B)'
          };
        } else if (data.decision.cardId) {
          // 經典手牌模式
          const foundCard = hand.find(c => c.id === data.decision.cardId);
          if (foundCard) {
            return {
              card: foundCard,
              tacticalReason: data.decision.tacticalReason || '邊緣神經網路戰略推論',
              banter: data.decision.banter || '（駭客保持戰術沉默）',
              engine: '⚡ Cloudflare Workers AI (Llama 3.1 8B)'
            };
          }
        }
      }
    }
  } catch (err) {
    // 網路異常或超時，自動降級
  }

  // 降級處理
  if (isFreeform) {
    return generateProceduralCard(actingSide, gameState.lastAction);
  }

  return getLocalHeuristicDecision(gameState);
}
