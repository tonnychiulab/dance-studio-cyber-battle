/**
 * AI 對手戰術決策服務 (AIDecisionService)
 * 
 * 優先請求 Cloudflare Workers AI 邊緣神經網路（Llama 3.1 8B），
 * 具備 2.5 秒超時保護與「零失敗」無縫降級本機啟發式演算法機制。
 */

// 紅隊幽默駭客垃圾話庫 (離線/降級使用)
const RED_BANTER_POOL = [
  '大至急！PHP2Shell (CVE-2026-109618) 已經炸鍋，連高市早苗都在 X 發推叫大家關站啦！',
  '免驗證 Use-After-Free 直接遠端 RCE，這波你防得住嗎？',
  '連 IMDSv1 都沒關也敢上線？看我直接拉 Token！',
  '這組 IAM 權限竟然開 s3:*，感謝工程師無私贊助！',
  '你的 WAF 規則慢了 30 毫秒，封包早就打進練舞室了。',
  'npm install 不看相依樹的下場，就是成為我的肉雞。',
  '住手！你們不要再防禦了，要守去練舞室守！',
  '測試環境密鑰直接 Hardcode 上 GitHub，真香。'
];

// 藍隊 SOC 資安工程師守備話庫 (離線/降級使用)
const BLUE_BANTER_POOL = [
  '響應高市早苗緊急呼籲！修不好我就預防性關站，拔線才是資安最高境界！',
  '連高市早苗的官網都拔線了，我們的伺服器已經安全離線！',
  'WAF 虛擬補丁已於邊緣生效，你的 Payload 已經被丟棄！',
  '偵測到異常流量，該節點已即刻執行網路微隔離。',
  '想要 SSRF？抱歉我們全站強制開啟 IMDSv2 Session！',
  '監控日誌 MTTD 僅 12 秒，資安演練我們是認真的。',
  '不要再打了！白隊裁判準備進場強制尬舞了！',
  '這點小流量連 Cloudflare 防火牆的外皮都磨不破。'
];

/**
 * 本地啟發式智慧決策引擎 (Heuristic Tactical Engine)
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
    // === 紅隊 AI 戰術思維 ===
    // 1. 致命一擊檢查：若能直接使滲透率滿 100% 或使企業 HP 歸零，立刻發動最強終局卡！
    const lethalCards = hand.filter(
      c => breachProgress + c.attack >= 100 || corpHP - Math.floor(c.attack * 0.35) <= 0
    );

    if (lethalCards.length > 0) {
      selectedCard = lethalCards.sort((a, b) => b.attack - a.attack)[0];
      tacticalReason = `鎖定致命弱點，發動終局漏洞穿透【${selectedCard.name}】！`;
    }

    // 2. 尬舞爆表誘導：若尷尬值超過 70%，優先發動高尬舞值迷因卡，強行召喚白隊裁判！
    if (!selectedCard && danceGauge >= 70) {
      const memeCard = hand.find(c => c.danceCharge >= 25);
      if (memeCard) {
        selectedCard = memeCard;
        tacticalReason = `尬舞能量逼近臨界點，引爆練舞室迷因大招【${memeCard.name}】！`;
      }
    }

    // 3. 常態輸出：打出當前手牌最高攻擊力者
    if (!selectedCard) {
      const sorted = [...hand].sort((a, b) => b.attack - a.attack);
      selectedCard = sorted[0];
      tacticalReason = `評估權限鏈條，打出最高攻擊力酬載【${selectedCard.name}】`;
    }
  } else {
    // === 藍隊 AI 戰術思維 (強化版) ===
    // 1. 滲透威脅壓制：若滲透進度高於 30%，全力打出能降低滲透的防禦牌！
    if (breachProgress >= 30) {
      const reducers = hand.filter(c => (c.reduceBreach || 0) > 0).sort((a, b) => (b.reduceBreach || 0) - (a.reduceBreach || 0));
      if (reducers.length > 0) {
        selectedCard = reducers[0];
        tacticalReason = `滲透進度達警告線，部署【${selectedCard.name}】強力壓低滲透 ${selectedCard.reduceBreach}%！`;
      }
    }

    // 2. 血量急救：若 HP 低於 45%，全力加固防禦
    if (!selectedCard && corpHP <= 45) {
      const maxDefense = [...hand].sort((a, b) => b.defense - a.defense)[0];
      selectedCard = maxDefense;
      tacticalReason = `企業防禦告急，上線【${maxDefense.name}】修補邊界防護！`;
    }

    // 3. 常態防禦：綜合考慮防禦點數與壓制滲透收益
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
 * 取得 AI 決策（優先 Cloudflare Workers AI，失敗自動降級）
 */
export async function getAIDecision(gameState) {
  const hand = gameState.actingHand || gameState.opponentHand || [];
  if (!hand || hand.length === 0) return null;

  try {
    // 2.5 秒超時機制 (AbortSignal.timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

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
      if (data.success && data.decision && data.decision.cardId) {
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
  } catch (err) {
    // 網絡故障、超時或離線，靜默平滑降級至本地啟發式引擎
  }

  return getLocalHeuristicDecision(gameState);
}
