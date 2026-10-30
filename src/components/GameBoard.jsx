import React from 'react';
import Card from './Card.jsx';
import { Zap, Play, RotateCcw, Swords, Cpu, Radio, Eye } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function GameBoard({
  playerSide,
  playerHand,
  opponentHand,
  playerEnergy,
  maxEnergy,
  onPlayCard,
  onEndTurn,
  isPlayerTurn,
  lastPlayedCard,
  rounds,
  gameMode = 'pve',
  currentTurnSide = 'red'
}) {
  const isRed = playerSide === 'red';
  const isSpectator = gameMode === 'spectator';

  const handleEndTurnClick = () => {
    if (!isPlayerTurn) {
      sound.playBuzz();
      return;
    }
    sound.playCard();
    onEndTurn();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-7xl mx-auto w-full gap-4 font-mono select-none">
      {/* 頂部手牌區：PvE 為對手加密牌庫；觀戰模式為藍隊 SOC 牌庫 */}
      <section 
        aria-label="頂部戰術節點區域" 
        className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-sm shadow-lg"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <span className="flex items-center gap-2 font-bold tracking-wide">
            <span className="size-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            {isSpectator 
              ? '🔵 藍隊 SOC 邊緣 Agent 牌庫 (AI-BLUE)' 
              : `對手戰術節點庫 (${isRed ? '藍隊守備方 AI' : '紅隊滲透方 AI'})`}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-400">
            手牌存量：{opponentHand.length} 張
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {opponentHand.map((card, idx) => (
            <Card
              key={`opp-${card.id || idx}-${idx}`}
              card={card}
              isOpponent={!isSpectator}
              canPlay={false}
              statusText={isSpectator ? (currentTurnSide === 'blue' ? '⚡ 思考出牌中' : '守備待命中') : undefined}
            />
          ))}
        </div>
      </section>

      {/* 中央：戰情室交鋒競技場 (Battle Arena) */}
      <section 
        aria-label="戰情室交鋒中央競技場" 
        className="my-auto py-8 px-6 rounded-3xl bg-cyber-grid bg-slate-950/90 border-2 border-emerald-950/80 flex flex-col md:flex-row items-center justify-around gap-8 relative overflow-hidden shadow-2xl"
      >
        {/* 背景光暈與浮水印裝飾 */}
        <div className="absolute -top-24 -left-24 size-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="absolute inset-0 flex items-center justify-center text-6xl md:text-8xl font-black text-slate-900/40 select-none pointer-events-none tracking-widest font-mono">
          {isSpectator ? 'ARBITER ARENA' : 'CYBER ARENA'}
        </div>

        {/* 最近打出的卡牌展示區 */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold">
            <Radio className="size-3.5 text-emerald-400 animate-pulse" />
            {lastPlayedCard ? `最新戰術行動：${lastPlayedCard.name}` : (isSpectator ? '白隊裁判已就位，AI 即將開戰...' : '戰情室待命中... 請出牌發動攻防！')}
          </div>

          {lastPlayedCard ? (
            <div className="scale-100 transition-all duration-300 animate-in zoom-in-95">
              <Card card={lastPlayedCard} canPlay={false} statusText="發動中" />
            </div>
          ) : (
            <div className="w-52 sm:w-56 h-72 rounded-2xl border-2 border-dashed border-slate-800/90 bg-slate-950/60 flex flex-col items-center justify-center text-slate-500 text-xs p-5 text-center shadow-inner">
              <Swords className="size-8 mb-3 text-slate-600 stroke-[1.5]" />
              <p className="font-bold text-slate-400 mb-1">
                {isSpectator ? '紅藍雙 Agent 對弈場' : '戰場靜默中'}
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {isSpectator ? 'Cloudflare Workers AI 邊緣神經網路全自動推論中' : '打出卡牌以施展 MITRE 攻擊或 SOC 防禦動作'}
              </p>
            </div>
          )}
        </div>

        {/* 當前回合資訊與控制按鈕 */}
        <div className="relative z-10 flex flex-col items-center md:items-end gap-4">
          <div className="text-center md:text-right">
            <span className="text-xs text-slate-400 font-bold tracking-wider block mb-0.5 uppercase">
              對決回合 (Turn)
            </span>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-teal-200 tracking-tight">
              第 {rounds} 回合
            </div>
          </div>

          {/* 行動點數能量槽 */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-lg">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
              <Zap className="size-4 fill-amber-300" /> 行動點數：
            </div>
            <div className="flex gap-1.5 items-center">
              {Array.from({ length: maxEnergy }).map((_, i) => {
                const isActive = i < playerEnergy;
                return (
                  <span
                    key={i}
                    aria-label={`能量 ${i + 1}`}
                    className={`size-3.5 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-110' 
                        : 'bg-slate-900 border border-slate-700/60 scale-95 opacity-50'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-black text-amber-300 ml-1">
              ({playerEnergy}/{maxEnergy})
            </span>
          </div>

          {/* 狀態切換：觀戰模式提示 vs 玩家出牌按鈕 */}
          {isSpectator ? (
            <div className="px-5 py-3 rounded-2xl bg-purple-950/50 border border-purple-500/60 text-xs font-black text-purple-200 flex items-center gap-2 shadow-lg shadow-purple-950/30">
              <Eye className="size-4 text-purple-400 animate-pulse" />
              <span>
                {currentTurnSide === 'red' ? '🔴 紅隊 AI 決策行動中...' : '🔵 藍隊 AI 守備部署中...'}
              </span>
            </div>
          ) : (
            <button
              onClick={handleEndTurnClick}
              disabled={!isPlayerTurn}
              aria-label={isPlayerTurn ? '結束目前回合並輪到對手行動' : '對手行動中，請稍候'}
              className={`px-7 py-3.5 rounded-2xl font-black text-sm tracking-wider flex items-center gap-2.5 transition-all duration-150 shadow-xl focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                isPlayerTurn
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/25 cursor-pointer active:scale-[0.95]'
                  : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-70'
              }`}
            >
              <RotateCcw className={`size-4 ${isPlayerTurn ? 'animate-spin-slow' : ''}`} /> 
              {isPlayerTurn ? '結束回合 (交替行動)' : '對手決策中...'}
            </button>
          )}
        </div>
      </section>

      {/* 底部手牌區：PvE 為玩家手牌；觀戰模式為紅隊 APT 牌庫 */}
      <section 
        aria-label="底部戰術手牌區域" 
        className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="flex items-center gap-2 font-black text-slate-200 tracking-wide">
            <span className="size-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            {isSpectator 
              ? '🔴 紅隊 APT 邊緣 Agent 牌庫 (AI-RED)' 
              : `您的戰術手牌庫 (${isRed ? '🔴 紅隊滲透酬載' : '🔵 藍隊守備防護'})`}
          </span>
          <span className="text-[11px] text-slate-400 font-bold">
            {isSpectator ? '白隊裁判全明牌俯瞰監控中' : '點選卡牌或使用鍵盤 [Enter] 出牌'}
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 pt-1 px-1">
          {playerHand.map((card, idx) => (
            <Card
              key={`player-${card.id || idx}-${idx}`}
              card={card}
              canPlay={!isSpectator && isPlayerTurn && playerEnergy >= card.cost}
              onPlay={onPlayCard}
              statusText={isSpectator ? (currentTurnSide === 'red' ? '⚡ 思考出牌中' : '滲透待命中') : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
