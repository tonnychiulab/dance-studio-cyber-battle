import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import GameBoard from './components/GameBoard.jsx';
import TerminalLog from './components/TerminalLog.jsx';
import DanceStudioModal from './components/DanceStudioModal.jsx';
import VictoryModal from './components/VictoryModal.jsx';
import { RED_CARDS, BLUE_CARDS } from './data/cards.js';
import { DANCE_STUDIO_EVENTS } from './data/memeEvents.js';
import { sound } from './utils/sound.js';
import { getAIDecision } from './services/aiService.js';
import { Shield, Flame, Play, Sparkles, Keyboard, Command } from 'lucide-react';

export default function App() {
  // 遊戲啟動狀態
  const [gameStarted, setGameStarted] = useState(false);
  const [playerSide, setPlayerSide] = useState('blue'); // 'red' | 'blue'
  const [gameMode, setGameMode] = useState('pve'); // 'pve' | 'pvp'
  const [muted, setMuted] = useState(false);
  const [aiEngineName, setAiEngineName] = useState('⚡ Cloudflare Workers AI');

  // 戰況數值
  const [corpHP, setCorpHP] = useState(100);
  const [breachProgress, setBreachProgress] = useState(0);
  const [danceGauge, setDanceGauge] = useState(0);
  const [rounds, setRounds] = useState(1);

  // 回合與能量
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [maxEnergy, setMaxEnergy] = useState(3);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  // 手牌與卡池
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [lastPlayedCard, setLastPlayedCard] = useState(null);

  // 事件與彈窗
  const [logs, setLogs] = useState([]);
  const [activeDanceEvent, setActiveDanceEvent] = useState(null);
  const [winner, setWinner] = useState(null); // 'red' | 'blue' | null

  // 抽取隨機卡片輔助函式
  const getRandomCards = (deck, count = 4) => {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const addLog = (tag, message, type = 'system') => {
    const time = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    setLogs((prev) => [...prev, { time, tag, message, type }]);
  };

  // 開始新遊戲
  const startNewGame = (side = playerSide) => {
    sound.playDefense();
    setCorpHP(100);
    setBreachProgress(0);
    setDanceGauge(0);
    setRounds(1);
    setPlayerEnergy(3);
    setMaxEnergy(3);
    setIsPlayerTurn(true);
    setWinner(null);
    setActiveDanceEvent(null);
    setLastPlayedCard(null);

    const pDeck = side === 'red' ? RED_CARDS : BLUE_CARDS;
    const oDeck = side === 'red' ? BLUE_CARDS : RED_CARDS;

    setPlayerHand(getRandomCards(pDeck, 4));
    setOpponentHand(getRandomCards(oDeck, 4));

    setLogs([
      {
        time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        tag: 'SYSTEM',
        message: `戰情室全域防禦系統連線！玩家加入【${side === 'red' ? '🔴 紅隊滲透方' : '🔵 藍隊守備方'}】，對抗自動化攻防引擎。`,
        type: 'system'
      }
    ]);

    setGameStarted(true);
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
  };

  // 執行出牌效果
  const executeCardEffect = (card, isPlayer = true) => {
    sound.playCard();
    setLastPlayedCard(card);

    if (card.side === 'red') {
      sound.playAttack();
      // 紅隊攻擊：增加滲透進度，削減企業防禦
      setBreachProgress((prev) => Math.min(100, prev + card.attack));
      setCorpHP((prev) => Math.max(0, prev - Math.floor(card.attack * 0.8)));
      addLog(card.mitre, `${isPlayer ? '玩家' : '對手'}發動 [${card.name}]！滲透進度 +${card.attack}%！`, 'attack');
    } else {
      sound.playDefense();
      // 藍隊防禦：恢復企業防禦，降低滲透進度
      setCorpHP((prev) => Math.min(100, prev + card.defense));
      if (card.reduceBreach) {
        setBreachProgress((prev) => Math.max(0, prev - card.reduceBreach));
      }
      addLog(card.mitre, `${isPlayer ? '玩家' : '對手'}部署 [${card.name}]！修復防禦 +${card.defense} 點！`, 'defense');
    }

    // 累積尷尬值 / 尬舞條
    const nextDance = Math.min(100, danceGauge + (card.danceCharge || 15));
    setDanceGauge(nextDance);

    // 檢查是否觸發練舞室大招
    if (nextDance >= 100) {
      sound.playAlarm();
      sound.playDanceBeat();
      const randomEvent = DANCE_STUDIO_EVENTS[Math.floor(Math.random() * DANCE_STUDIO_EVENTS.length)];
      setActiveDanceEvent(randomEvent);
      addLog('DANCE-STUDIO', `⚠️ 尬舞能量爆表！白隊裁判登場：「不要再打了！要打去練舞室打！」`, 'dance');
    }
  };

  // 玩家出牌
  const handlePlayCard = (card) => {
    if (!isPlayerTurn || playerEnergy < card.cost) {
      sound.playBuzz();
      return;
    }

    setPlayerEnergy((prev) => prev - card.cost);
    setPlayerHand((prev) => prev.filter((c) => c !== card));

    executeCardEffect(card, true);

    // 抽牌補牌
    if (card.draw) {
      const pDeck = playerSide === 'red' ? RED_CARDS : BLUE_CARDS;
      const extraCards = getRandomCards(pDeck, card.draw);
      setPlayerHand((prev) => [...prev, ...extraCards]);
      addLog('DRAW', `抽得 ${card.draw} 張額外手牌！`, 'system');
    }
  };

  // 結束玩家回合，輪到對手
  const handleEndTurn = () => {
    if (!isPlayerTurn) return;
    setIsPlayerTurn(false);
    addLog('TURN', `第 ${rounds} 回合結束，戰術主動權轉移至對手...`, 'system');

    // 對手 AI 決策（延遲 900ms 模擬計算思考）
    setTimeout(() => {
      runAITurn();
    }, 900);
  };

  // AI 對手出牌行動（調用 Workers AI 邊緣神經網路）
  const runAITurn = async () => {
    const oDeck = playerSide === 'red' ? BLUE_CARDS : RED_CARDS;
    
    if (opponentHand.length > 0) {
      const decision = await getAIDecision({
        playerSide,
        corpHP,
        breachProgress,
        danceGauge,
        rounds,
        opponentHand,
        playerEnergy
      });

      if (decision && decision.card) {
        setAiEngineName(decision.engine);
        const opponentTag = playerSide === 'red' ? 'AI-BLUE' : 'AI-RED';
        addLog(opponentTag, `[${decision.engine}] ${decision.tacticalReason}`, 'system');
        addLog('TRASH-TALK', `💬 對手嗆聲：「${decision.banter}」`, playerSide === 'red' ? 'defense' : 'attack');

        executeCardEffect(decision.card, false);
        setOpponentHand((prev) => prev.filter((c) => c !== decision.card));
      } else {
        const aiCard = opponentHand[0];
        executeCardEffect(aiCard, false);
        setOpponentHand((prev) => prev.filter((c) => c !== aiCard));
      }
    }

    // 回合重整：輪回玩家
    setTimeout(() => {
      setRounds((prev) => prev + 1);
      setPlayerEnergy(maxEnergy);
      setIsPlayerTurn(true);

      // 雙方各抽 1 張牌
      const pDeck = playerSide === 'red' ? RED_CARDS : BLUE_CARDS;
      setPlayerHand((prev) => [...prev, ...getRandomCards(pDeck, 1)]);
      setOpponentHand((prev) => [...prev, ...getRandomCards(oDeck, 1)]);

      addLog('ROUND', `第 ${rounds + 1} 回合開始！行動能量已重置至滿格 ${maxEnergy}。`, 'system');
    }, 700);
  };

  // 檢查勝負判定
  useEffect(() => {
    if (breachProgress >= 100 || corpHP <= 0) {
      sound.playVictory();
      setWinner('red');
      addLog('VICTORY', '🏆 紅隊成功突破邊界並取得金絲雀 Flag，奪得終局勝利！', 'attack');
    } else if (rounds >= 10 && breachProgress < 50) {
      sound.playVictory();
      setWinner('blue');
      addLog('VICTORY', '🛡️ 藍隊於 10 回合內嚴格壓制滲透，成功維護企業資安！', 'defense');
    }
  }, [breachProgress, corpHP, rounds]);

  // 鍵盤極致體驗快捷鍵 (Emil Kowalski 鍵盤友善交互)
  useEffect(() => {
    if (!gameStarted || winner || activeDanceEvent) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlayerTurn) {
          handleEndTurn();
        }
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= playerHand.length) {
          const targetCard = playerHand[num - 1];
          if (isPlayerTurn && playerEnergy >= targetCard.cost) {
            handlePlayCard(targetCard);
          } else {
            sound.playBuzz();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isPlayerTurn, playerHand, playerEnergy, winner, activeDanceEvent]);

  // 關閉練舞室事件彈窗並套用效果
  const handleDismissDanceModal = () => {
    if (!activeDanceEvent) return;

    if (activeDanceEvent.effectType === 'REFRESH_ALL') {
      const pDeck = playerSide === 'red' ? RED_CARDS : BLUE_CARDS;
      const oDeck = playerSide === 'red' ? BLUE_CARDS : RED_CARDS;
      setPlayerHand(getRandomCards(pDeck, 4));
      setOpponentHand(getRandomCards(oDeck, 4));
    } else if (activeDanceEvent.effectType === 'SHIELD_AND_ENERGY') {
      setCorpHP((prev) => Math.min(100, prev + 20));
      setPlayerEnergy((prev) => Math.min(maxEnergy + 2, prev + 2));
    } else if (activeDanceEvent.effectType === 'ENERGY_DRAIN') {
      setMaxEnergy(4);
      setPlayerEnergy(4);
    }

    setDanceGauge(0); // 尬舞完歸零
    setActiveDanceEvent(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono relative overflow-hidden crt-overlay bg-cyber-grid">
      {/* 遊戲未啟動：歡迎與陣營選擇畫面 (Frontend Design 典範設計) */}
      {!gameStarted ? (
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gradient-to-b from-slate-900/95 via-slate-950 to-black border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden backdrop-blur-md">
            {/* 裝飾背景柔光 */}
            <div className="absolute -top-32 -left-32 size-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 size-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 頂部動態 Emoji 徽章 */}
            <div className="size-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl mb-4 shadow-[0_0_35px_rgba(16,185,129,0.3)] animate-pulse select-none">
              💃
            </div>

            <span className="text-[11px] px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-widest shadow-sm">
              MITRE ATT&CK × 紫禁之巔經典迷因
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-rose-400 mt-4 mb-2 tracking-tight">
              「要打去練舞室打」
            </h1>
            <p className="text-base sm:text-lg text-rose-400 font-black mb-5 tracking-wide">
              之紅藍對抗篇 (Dance Studio Cyber Battle)
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed mb-7">
              實時 APT 滲透與 Cloudflare 邊緣防禦的世紀對決！攻防過熱時白隊裁判隨時介入強制尬舞。純前端 SPA，零後端相依，全球 CDN 即開即戰。
            </p>

            {/* 陣營選擇卡片 (Emil 物理點擊反饋) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={playerSide === 'red'}
                onClick={() => setPlayerSide('red')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlayerSide('red'); } }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  playerSide === 'red'
                    ? 'bg-rose-950/50 border-rose-500 neon-border-red shadow-xl'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-rose-400 font-black text-sm mb-1.5">
                  <Flame className="size-4" /> 🔴 扮演紅隊 (滲透方)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  運用 SSRF、CI/CD 依賴毒化與 IAM Wildcard 提權，目標突破邊界取得 Canary Flag！
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-pressed={playerSide === 'blue'}
                onClick={() => setPlayerSide('blue')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlayerSide('blue'); } }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  playerSide === 'blue'
                    ? 'bg-sky-950/50 border-sky-500 neon-border-blue shadow-xl'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-sky-400 font-black text-sm mb-1.5">
                  <Shield className="size-4" /> 🔵 扮演藍隊 (守備方)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  部署 WAF 規則、強制 IMDSv2 與 EDR 節點隔離，目標在 10 回合內壓低 MTTD 守護資安！
                </p>
              </div>
            </div>

            {/* 鍵盤快捷鍵指示提示 */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mb-6 font-mono">
              <span className="flex items-center gap-1">
                <Keyboard className="size-3.5" /> 支援鍵盤熱鍵：
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">1-4 出牌</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">Space 結束回合</span>
            </div>

            {/* 開始戰鬥按鈕 */}
            <button
              onClick={() => startNewGame(playerSide)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base tracking-wider shadow-xl shadow-emerald-500/30 transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 mb-3"
            >
              <Play className="size-5 fill-slate-950" /> 開始戰情室對抗 (進入對決)
            </button>

            {/* Cloudflare 正式節點連結按鈕 */}
            <a
              href="https://dance-studio-cyber-battle.tw365ai.workers.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-950/30 hover:bg-orange-950/50 border border-orange-500/40 text-orange-300 hover:text-orange-200 text-xs font-bold font-mono transition-all duration-150 active:scale-[0.98]"
            >
              ☁️ 連線至 Cloudflare 邊緣主節點 (Workers AI 支援) ↗
            </a>
          </div>
        </main>
      ) : (
        /* 遊戲進行中：主對戰介面 */
        <>
          <Header
            corpHP={corpHP}
            breachProgress={breachProgress}
            danceGauge={danceGauge}
            muted={muted}
            onToggleMute={handleToggleMute}
            playerSide={playerSide}
            onResetGame={() => setGameStarted(false)}
            aiEngine={aiEngineName}
          />

          <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
            <GameBoard
              playerSide={playerSide}
              playerHand={playerHand}
              opponentHand={opponentHand}
              playerEnergy={playerEnergy}
              maxEnergy={maxEnergy}
              onPlayCard={handlePlayCard}
              onEndTurn={handleEndTurn}
              isPlayerTurn={isPlayerTurn}
              lastPlayedCard={lastPlayedCard}
              rounds={rounds}
            />

            <div className="w-full lg:w-88 shrink-0">
              <TerminalLog logs={logs} />
            </div>
          </main>
        </>
      )}

      {/* 練舞室大招彈窗 */}
      <DanceStudioModal
        event={activeDanceEvent}
        onDismiss={handleDismissDanceModal}
      />

      {/* 勝利結算證書彈窗 */}
      {winner && (
        <VictoryModal
          winner={winner}
          playerSide={playerSide}
          rounds={rounds}
          onRestart={() => startNewGame(playerSide)}
        />
      )}
    </div>
  );
}
