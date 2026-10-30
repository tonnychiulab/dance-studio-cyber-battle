import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import GameBoard from './components/GameBoard.jsx';
import TerminalLog from './components/TerminalLog.jsx';
import DanceStudioModal from './components/DanceStudioModal.jsx';
import VictoryModal from './components/VictoryModal.jsx';
import { RED_CARDS, BLUE_CARDS } from './data/cards.js';
import { DANCE_STUDIO_EVENTS } from './data/memeEvents.js';
import { sound } from './utils/sound.js';
import { Shield, Flame, Users, Play, Sparkles } from 'lucide-react';

export default function App() {
  // 遊戲啟動狀態
  const [gameStarted, setGameStarted] = useState(false);
  const [playerSide, setPlayerSide] = useState('blue'); // 'red' | 'blue'
  const [gameMode, setGameMode] = useState('pve'); // 'pve' | 'pvp'
  const [muted, setMuted] = useState(false);

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
        message: `戰情室啟動！玩家加入【${side === 'red' ? '🔴 紅隊滲透方' : '🔵 藍隊守備方'}】，對手為 AI 自動防護引擎。`,
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
      addLog(card.mitre, `${isPlayer ? '玩家' : '對手'}打出 [${card.name}]！造成 +${card.attack}% 滲透進度！`, 'attack');
    } else {
      sound.playDefense();
      // 藍隊防禦：恢復企業防禦，降低滲透進度
      setCorpHP((prev) => Math.min(100, prev + card.defense));
      if (card.reduceBreach) {
        setBreachProgress((prev) => Math.max(0, prev - card.reduceBreach));
      }
      addLog(card.mitre, `${isPlayer ? '玩家' : '對手'}部署 [${card.name}]！恢復 +${card.defense} 企業防禦值！`, 'defense');
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
      addLog('DANCE-STUDIO', `⚠️ 尬舞值滿載！白隊裁判登場：「不要再打了！要打去練舞室打！」`, 'dance');
    }
  };

  // 玩家出牌
  const handlePlayCard = (card) => {
    if (!isPlayerTurn || playerEnergy < card.cost) return;

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
    addLog('TURN', `第 ${rounds} 回合結束，輪到對手行動...`, 'system');

    // 對手 AI 決策（延遲 1 秒模擬思考）
    setTimeout(() => {
      runAITurn();
    }, 900);
  };

  // AI 對手出牌行動
  const runAITurn = () => {
    const oDeck = playerSide === 'red' ? BLUE_CARDS : RED_CARDS;
    
    // AI 隨機打出一張手牌
    if (opponentHand.length > 0) {
      const aiCard = opponentHand[Math.floor(Math.random() * opponentHand.length)];
      executeCardEffect(aiCard, false);
      setOpponentHand((prev) => prev.filter((c) => c !== aiCard));
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

      addLog('ROUND', `第 ${rounds + 1} 回合開始！行動點數已重置為 ${maxEnergy}。`, 'system');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono relative overflow-hidden crt-overlay">
      {/* 遊戲未啟動：歡迎與陣營選擇畫面 */}
      {!gameStarted ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
            <div className="size-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
              💃
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-widest">
              MITRE ATT&CK × 紫禁之巔經典迷因
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-rose-400 mt-3 mb-2 tracking-tight">
              「要打去練舞室打」
            </h1>
            <p className="text-base text-rose-400 font-bold mb-6">
              之紅藍對抗篇 (Dance Studio Cyber Battle)
            </p>

            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed mb-8">
              結合真實 APT 滲透路徑、Cloudflare 藍隊防禦與經典台劇迷因！攻防過熱時白隊裁判隨時介入強制尬舞。純前端 SPA 架構，開瀏覽器就能玩。
            </p>

            {/* 陣營選擇 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              <div
                onClick={() => setPlayerSide('red')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  playerSide === 'red'
                    ? 'bg-rose-950/40 border-rose-500 neon-border-red shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
                  <Flame className="size-4" /> 🔴 扮演紅隊 (滲透方)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  運用 SSRF、CI/CD 依賴毒化與 IAM Wildcard 提權，目標突破邊界取得 Canary Flag！
                </p>
              </div>

              <div
                onClick={() => setPlayerSide('blue')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  playerSide === 'blue'
                    ? 'bg-sky-950/40 border-sky-500 neon-border-blue shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-1">
                  <Shield className="size-4" /> 🔵 扮演藍隊 (守備方)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  部署 WAF 規則、強制 IMDSv2 與 EDR 節點隔離，目標在 10 回合內壓低 MTTD 守護資安！
                </p>
              </div>
            </div>

            <button
              onClick={() => startNewGame(playerSide)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base tracking-wider shadow-lg shadow-emerald-500/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="size-5 fill-slate-950" /> 開始戰情室對抗 (進入對決)
            </button>
          </div>
        </div>
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
            gameMode={gameMode}
            onResetGame={() => setGameStarted(false)}
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

            <div className="w-full lg:w-80 shrink-0">
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
