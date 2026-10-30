import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import GameBoard from './components/GameBoard.jsx';
import TerminalLog from './components/TerminalLog.jsx';
import DanceStudioModal from './components/DanceStudioModal.jsx';
import VictoryModal from './components/VictoryModal.jsx';
import SpectatorControls from './components/SpectatorControls.jsx';
import { RED_CARDS, BLUE_CARDS } from './data/cards.js';
import { DANCE_STUDIO_EVENTS } from './data/memeEvents.js';
import { sound } from './utils/sound.js';
import { getAIDecision } from './services/aiService.js';
import { Shield, Flame, Play, Sparkles, Keyboard, Command, Eye } from 'lucide-react';

export default function App() {
  // 遊戲啟動狀態
  const [gameStarted, setGameStarted] = useState(false);
  const [playerSide, setPlayerSide] = useState('blue'); // 'red' | 'blue' | 'spectator'
  const [gameMode, setGameMode] = useState('pve'); // 'pve' | 'spectator'
  const [muted, setMuted] = useState(false);
  const [aiEngineName, setAiEngineName] = useState('⚡ Cloudflare Workers AI');

  // Wazuh SOC 底部事件抽屜展開/收合狀態 (預設展開)
  const [isLogCollapsed, setIsLogCollapsed] = useState(false);

  // 自由搏鬥模式 (Cloudflare Workers AI 現場出題、見招拆招)
  const [isFreeformMode, setIsFreeformMode] = useState(true);

  // 觀戰模式控制狀態 (AI vs AI 白隊裁判)
  const [currentTurnSide, setCurrentTurnSide] = useState('red'); // 'red' | 'blue'
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [spectatorSpeed, setSpectatorSpeed] = useState(1); // 1: 1x (2000ms), 2: 2x (1000ms)
  const isExecutingTurnRef = useRef(false);

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
  const startNewGame = (side = playerSide, mode = 'pve') => {
    sound.playDefense();
    setCorpHP(100);
    setBreachProgress(0);
    setDanceGauge(0);
    setRounds(1);
    setPlayerEnergy(3);
    setMaxEnergy(3);
    setWinner(null);
    setActiveDanceEvent(null);
    setLastPlayedCard(null);

    if (side === 'spectator' || mode === 'spectator') {
      setGameMode('spectator');
      setPlayerSide('spectator');
      setIsPlayerTurn(false);
      setCurrentTurnSide('red');
      setIsAutoPlaying(true);
      setSpectatorSpeed(1);

      // 裁判觀戰模式：紅隊為 playerHand (下方)，藍隊為 opponentHand (上方)
      setPlayerHand(getRandomCards(RED_CARDS, 4));
      setOpponentHand(getRandomCards(BLUE_CARDS, 4));

      setLogs([
        {
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
          tag: 'REFEREE',
          message: `👁️ 白隊總裁判長進駐戰情室！Cloudflare Workers AI 雙 Agent 【${isFreeformMode ? '⚡ AI 自由出題搏鬥模式' : '🃏 經典卡牌庫模式'}】開戰！`,
          type: 'dance'
        }
      ]);
    } else {
      setGameMode('pve');
      setPlayerSide(side);
      setIsPlayerTurn(true);

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
    }

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
      // 紅隊攻擊：增加滲透進度，削減企業防禦 (平衡修正：降低連帶 HP 扣除至 35%，避免無腦雙殺)
      setBreachProgress((prev) => Math.min(100, prev + card.attack));
      setCorpHP((prev) => Math.max(0, prev - Math.floor(card.attack * 0.35)));
      addLog(card.mitre, `${isPlayer ? (gameMode === 'spectator' ? '紅隊 AI' : '玩家') : '對手'}發動 [${card.name}]！滲透進度 +${card.attack}%！`, 'attack');
    } else {
      sound.playDefense();
      // 藍隊防禦：恢復企業防禦，降低滲透進度 (平衡修正：全面具備壓低滲透進度能力)
      setCorpHP((prev) => Math.min(100, prev + card.defense));
      if (card.reduceBreach) {
        setBreachProgress((prev) => Math.max(0, prev - card.reduceBreach));
      }
      const reduceText = card.reduceBreach ? `，壓退滲透 -${card.reduceBreach}%` : '';
      addLog(card.mitre, `${isPlayer ? (gameMode === 'spectator' ? '紅隊 AI' : '玩家') : (gameMode === 'spectator' ? '藍隊 AI' : '對手')}部署 [${card.name}]！修復防禦 +${card.defense} 點${reduceText}！`, 'defense');
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

  // 玩家出牌 (PvE 模式)
  const handlePlayCard = (card) => {
    if (gameMode === 'spectator') return;
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

  // 結束玩家回合，輪到對手 (PvE 模式)
  const handleEndTurn = () => {
    if (gameMode === 'spectator') return;
    if (!isPlayerTurn) return;
    setIsPlayerTurn(false);
    addLog('TURN', `第 ${rounds} 回合結束，戰術主動權轉移至對手...`, 'system');

    // 對手 AI 決策（延遲 900ms 模擬計算思考）
    setTimeout(() => {
      runAITurn();
    }, 900);
  };

  // AI 對手出牌行動（調用 Workers AI 邊緣神經網路 - PvE 模式）
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

  // 觀戰模式核心：執行單一步驟回合 (AI vs AI Spectator Turn - 支援自由搏鬥出題)
  const executeSpectatorTurn = async () => {
    if (isExecutingTurnRef.current || winner || activeDanceEvent || !gameStarted || gameMode !== 'spectator') {
      return;
    }
    isExecutingTurnRef.current = true;

    try {
      if (currentTurnSide === 'red') {
        // 紅隊回合：現場出題或手牌出牌
        let currentHand = playerHand;
        if (!isFreeformMode && currentHand.length === 0) {
          const drawn = getRandomCards(RED_CARDS, 1);
          currentHand = drawn;
          setPlayerHand(drawn);
        }

        const decision = await getAIDecision({
          playerSide: 'spectator',
          actingSide: 'red',
          isFreeform: isFreeformMode,
          lastAction: lastPlayedCard,
          actingHand: currentHand,
          corpHP,
          breachProgress,
          danceGauge,
          rounds,
          opponentHand: currentHand,
          playerEnergy
        });

        const cardToPlay = (decision && decision.card) ? decision.card : currentHand[0];
        if (decision && decision.engine) setAiEngineName(decision.engine);

        if (isFreeformMode && cardToPlay?.isAIGenerated) {
          addLog('AI-RED', `[✨ AI 現場出題] ${cardToPlay.name} - ${decision?.tacticalReason || cardToPlay.description}`, 'attack');
        } else {
          addLog('AI-RED', `[${decision?.engine || 'Cloudflare AI'}] ${decision?.tacticalReason || '執行滲透攻擊'}`, 'attack');
        }

        if (decision?.banter) {
          addLog('TRASH-TALK', `💬 紅隊嗆聲：「${decision.banter}」`, 'attack');
        }

        executeCardEffect(cardToPlay, true);

        if (isFreeformMode) {
          setPlayerHand([cardToPlay]);
        } else {
          setPlayerHand((prev) => prev.filter((c) => c !== cardToPlay));
        }

        setCurrentTurnSide('blue');
      } else {
        // 藍隊回合：現場見招拆招或手牌防禦
        let currentHand = opponentHand;
        if (!isFreeformMode && currentHand.length === 0) {
          const drawn = getRandomCards(BLUE_CARDS, 1);
          currentHand = drawn;
          setOpponentHand(drawn);
        }

        const decision = await getAIDecision({
          playerSide: 'spectator',
          actingSide: 'blue',
          isFreeform: isFreeformMode,
          lastAction: lastPlayedCard,
          actingHand: currentHand,
          corpHP,
          breachProgress,
          danceGauge,
          rounds,
          opponentHand: currentHand,
          playerEnergy
        });

        const cardToPlay = (decision && decision.card) ? decision.card : currentHand[0];
        if (decision && decision.engine) setAiEngineName(decision.engine);

        if (isFreeformMode && cardToPlay?.isAIGenerated) {
          addLog('AI-BLUE', `[✨ AI 見招拆招] ${cardToPlay.name} - ${decision?.tacticalReason || cardToPlay.description}`, 'defense');
        } else {
          addLog('AI-BLUE', `[${decision?.engine || 'Cloudflare AI'}] ${decision?.tacticalReason || '部署防線加固'}`, 'defense');
        }

        if (decision?.banter) {
          addLog('TRASH-TALK', `💬 藍隊回敬：「${decision.banter}」`, 'defense');
        }

        executeCardEffect(cardToPlay, false);

        if (isFreeformMode) {
          setOpponentHand([cardToPlay]);
        } else {
          setOpponentHand((prev) => prev.filter((c) => c !== cardToPlay));
        }

        // 回合推進
        setRounds((prev) => prev + 1);
        if (!isFreeformMode) {
          setPlayerHand((prev) => [...prev, ...getRandomCards(RED_CARDS, 1)]);
          setOpponentHand((prev) => [...prev, ...getRandomCards(BLUE_CARDS, 1)]);
        }
        setCurrentTurnSide('red');
      }
    } catch (err) {
      console.error('Spectator turn execution error:', err);
    } finally {
      isExecutingTurnRef.current = false;
    }
  };

  // 觀戰模式自動定時器
  useEffect(() => {
    if (gameMode !== 'spectator' || !gameStarted || !isAutoPlaying || winner || activeDanceEvent) {
      return;
    }

    const delay = spectatorSpeed === 2 ? 1000 : 2000;
    const timer = setTimeout(() => {
      executeSpectatorTurn();
    }, delay);

    return () => clearTimeout(timer);
  }, [
    gameMode,
    gameStarted,
    isAutoPlaying,
    currentTurnSide,
    winner,
    activeDanceEvent,
    spectatorSpeed,
    playerHand,
    opponentHand,
    corpHP,
    breachProgress,
    danceGauge,
    rounds
  ]);

  // 白隊裁判強制干預大招
  const handleForceDanceStudio = () => {
    sound.playAlarm();
    sound.playDanceBeat();
    const randomEvent = DANCE_STUDIO_EVENTS[Math.floor(Math.random() * DANCE_STUDIO_EVENTS.length)];
    setActiveDanceEvent(randomEvent);
    addLog('REFEREE', `🚨 白隊總裁判長動用最高裁決權：「不要再打了！要打去練舞室打！」強制開啟尬舞事件！`, 'dance');
  };

  // 檢查勝負判定 (藍隊大反攻平衡補丁)
  useEffect(() => {
    if (breachProgress >= 100 || corpHP <= 0) {
      sound.playVictory();
      setWinner('red');
      addLog('VICTORY', '🏆 紅隊成功突破邊界並取得金絲雀 Flag，奪得終局勝利！', 'attack');
    } else if ((rounds >= 6 && breachProgress < 45) || (rounds >= 3 && breachProgress <= 0 && corpHP >= 85)) {
      sound.playVictory();
      setWinner('blue');
      if (breachProgress <= 0) {
        addLog('VICTORY', '🛡️ 藍隊達成【SOC 絕對封網大勝】！徹底肅清所有 APT 滲透，守護企業核心資產！', 'defense');
      } else {
        addLog('VICTORY', '🛡️ 藍隊於第 6 回合內強力壓制紅隊威脅，縱深防禦成功瓦解 APT 攻勢！', 'defense');
      }
    }
  }, [breachProgress, corpHP, rounds]);

  // 鍵盤極致體驗快捷鍵 (Emil Kowalski 鍵盤友善交互)
  useEffect(() => {
    if (!gameStarted || winner || activeDanceEvent) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsLogCollapsed((prev) => !prev);
        return;
      }

      if (gameMode === 'spectator') {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsAutoPlaying((prev) => !prev);
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setIsAutoPlaying(false);
          executeSpectatorTurn();
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          handleForceDanceStudio();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          setIsFreeformMode((prev) => !prev);
        }
        return;
      }

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
  }, [gameStarted, gameMode, isPlayerTurn, playerHand, playerEnergy, winner, activeDanceEvent, isAutoPlaying]);

  // 關閉練舞室事件彈窗並套用效果
  const handleDismissDanceModal = () => {
    if (!activeDanceEvent) return;

    if (activeDanceEvent.effectType === 'REFRESH_ALL') {
      if (gameMode === 'spectator') {
        setPlayerHand(getRandomCards(RED_CARDS, 4));
        setOpponentHand(getRandomCards(BLUE_CARDS, 4));
      } else {
        const pDeck = playerSide === 'red' ? RED_CARDS : BLUE_CARDS;
        const oDeck = playerSide === 'red' ? BLUE_CARDS : RED_CARDS;
        setPlayerHand(getRandomCards(pDeck, 4));
        setOpponentHand(getRandomCards(oDeck, 4));
      }
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
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-mono relative crt-overlay bg-cyber-grid">
      {/* 遊戲未啟動：歡迎與模式選擇畫面 (可捲動以適應各類視窗) */}
      {!gameStarted ? (
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-gradient-to-b from-slate-900/95 via-slate-950 to-black border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden backdrop-blur-md my-auto">
            {/* 裝飾背景柔光 */}
            <div className="absolute -top-32 -left-32 size-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 size-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 頂部動態 Emoji 徽章 */}
            <div className="size-16 sm:size-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl sm:text-4xl mb-3 shadow-[0_0_35px_rgba(16,185,129,0.3)] animate-pulse select-none">
              💃
            </div>

            <span className="text-[10px] sm:text-[11px] px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-widest shadow-sm">
              MITRE ATT&CK × 紫禁之巔經典迷因
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-rose-400 mt-3 mb-1 tracking-tight">
              「要打去練舞室打」
            </h1>
            <p className="text-sm sm:text-base text-rose-400 font-black mb-4 tracking-wide">
              之紅藍對抗篇 (Dance Studio Cyber Battle)
            </p>

            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed mb-5">
              實時 APT 滲透與 Cloudflare 邊緣防禦的世紀對決！搭載 Cloudflare Workers AI 邊緣神經網路。支援紅藍攻防與全自動觀戰模式。
            </p>

            {/* 三種對戰模式卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 text-left">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={playerSide === 'red'}
                onClick={() => setPlayerSide('red')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlayerSide('red'); } }}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  playerSide === 'red'
                    ? 'bg-rose-950/50 border-rose-500 neon-border-red shadow-xl'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-rose-400 font-black text-xs mb-1">
                  <Flame className="size-3.5" /> 🔴 扮演紅隊 (滲透方)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  手握 PHP2Shell (CVE-2026-109618)、SSRF 與提權，突破邊界奪取 Flag！
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-pressed={playerSide === 'blue'}
                onClick={() => setPlayerSide('blue')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlayerSide('blue'); } }}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  playerSide === 'blue'
                    ? 'bg-sky-950/50 border-sky-500 neon-border-blue shadow-xl'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sky-400 font-black text-xs mb-1">
                  <Shield className="size-3.5" /> 🔵 扮演藍隊 (守備方)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  施展高市流預防性關站、WAF 虛擬補丁與 EDR 隔離，守護資產！
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-pressed={playerSide === 'spectator'}
                onClick={() => setPlayerSide('spectator')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlayerSide('spectator'); } }}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-purple-500 ${
                  playerSide === 'spectator'
                    ? 'bg-purple-950/50 border-purple-400 neon-border-purple shadow-xl'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-purple-300 font-black text-xs mb-1">
                  <Eye className="size-3.5" /> 👁️ 白隊總裁判 (全自動)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  雙 AI 邊緣神經自主攻防！裁判掌控暫停與「強制練舞室」特權。
                </p>
              </div>
            </div>

            {/* 鍵盤快捷鍵指示提示 */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-slate-500 mb-5 font-mono">
              <span className="flex items-center gap-1">
                <Keyboard className="size-3.5" /> 熱鍵提示：
              </span>
              {playerSide === 'spectator' ? (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-bold">Space 播放/暫停</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-bold">N 單步推進</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-bold">F 自由搏鬥</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-bold">D 強制尬舞</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-bold">L 收合日誌</span>
                </>
              ) : (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">1-4 出牌</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">Space 結束回合</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">L 收合日誌</span>
                </>
              )}
            </div>

            {/* 開始戰鬥按鈕 */}
            <button
              onClick={() => startNewGame(playerSide, playerSide === 'spectator' ? 'spectator' : 'pve')}
              className={`w-full py-3.5 rounded-2xl font-black text-sm sm:text-base tracking-wider shadow-xl transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 mb-2.5 ${
                playerSide === 'spectator'
                  ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/30 focus-visible:ring-purple-400'
                  : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 focus-visible:ring-emerald-400'
              }`}
            >
              {playerSide === 'spectator' ? (
                <>
                  <Eye className="size-5" /> 開啟白隊總裁判觀戰席 (雙 AI 自動對決)
                </>
              ) : (
                <>
                  <Play className="size-5 fill-current" /> 開始戰情室對抗 (進入對決)
                </>
              )}
            </button>

            {/* Cloudflare 正式節點連結按鈕 */}
            <a
              href="https://dance-studio-cyber-battle.tw365ai.workers.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-orange-950/30 hover:bg-orange-950/50 border border-orange-500/40 text-orange-300 hover:text-orange-200 text-xs font-bold font-mono transition-all duration-150 active:scale-[0.98]"
            >
              ☁️ 連線至 Cloudflare 邊緣主節點 (Workers AI 支援) ↗
            </a>
          </div>
        </main>
      ) : (
        /* 遊戲進行中：Wazuh 一屏全覽戰情中心 (100vh Viewport-Locked, 零垂直捲動) */
        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          {/* Wazuh 頂部全域遙測列 */}
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

          {/* 觀戰模式專屬：白隊總裁判控制台 */}
          {gameMode === 'spectator' && (
            <div className="px-2 pt-1">
              <SpectatorControls
                isPlaying={isAutoPlaying}
                onTogglePlay={() => setIsAutoPlaying((prev) => !prev)}
                onStepNext={() => {
                  setIsAutoPlaying(false);
                  executeSpectatorTurn();
                }}
                speed={spectatorSpeed}
                onToggleSpeed={() => setSpectatorSpeed((prev) => (prev === 1 ? 2 : 1))}
                onForceDanceStudio={handleForceDanceStudio}
                currentTurnSide={currentTurnSide}
                isFreeform={isFreeformMode}
                onToggleFreeform={() => setIsFreeformMode((prev) => !prev)}
              />
            </div>
          )}

          {/* 中央主要對戰大廳 (Center Stage) */}
          <main className="flex-1 min-h-0 overflow-hidden flex flex-col px-3 py-1">
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
              gameMode={gameMode}
              currentTurnSide={currentTurnSide}
            />
          </main>

          {/* 底部 Wazuh SOC 資安事件抽屜 (可收合/展開) */}
          <TerminalLog
            logs={logs}
            isCollapsed={isLogCollapsed}
            onToggleCollapse={() => setIsLogCollapsed((prev) => !prev)}
          />
        </div>
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
          onRestart={() => startNewGame(playerSide, gameMode)}
        />
      )}
    </div>
  );
}
