import React from 'react';
import Card from './Card.jsx';
import { Zap, Play, RotateCcw, Swords, Cpu, Radio, Eye, ShieldAlert, Sparkles } from 'lucide-react';
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
    <div className="flex-1 min-h-0 flex flex-col justify-between max-w-7xl mx-auto w-full gap-2 font-mono select-none overflow-hidden">
      {/* 頂部手牌區：PvE 為對手加密牌庫；觀戰模式為藍隊 SOC 牌庫 */}
      <section 
        aria-label="頂部戰術節點區域" 
        className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2.5 backdrop-blur-sm shadow-md shrink-0"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-2 font-bold tracking-wide">
            <span className="size-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            {isSpectator 
              ? '🔵 藍隊 SOC 邊緣 Agent 牌庫 (AI-BLUE)' 
              : `對手戰術節點庫 (${isRed ? '藍隊守備方 AI' : '紅隊滲透方 AI'})`}
          </span>
          <span className="px-2 py-0.2 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400">
            手牌存量：{opponentHand.length} 張
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 items-center">
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

      {/* 中央：Wazuh 戰情室攻防對撞中樞 (Wazuh Center Stage) */}
      <section 
        aria-label="戰情室交鋒中央競技場" 
        className="py-2.5 px-4 rounded-2xl bg-cyber-grid bg-slate-950/90 border border-emerald-950/80 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shrink-0 relative overflow-hidden"
      >
        {/* 背景微光 */}
        <div className="absolute -top-12 -left-12 size-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 size-36 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* 左側：最新戰術行動展示 */}
        <div className="flex items-center gap-3 z-10">
          <div className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
            {lastPlayedCard ? (
              lastPlayedCard.side === 'red' ? (
                <ShieldAlert className="size-5 text-rose-400 animate-pulse" />
              ) : (
                <Zap className="size-5 text-sky-400" />
              )
            ) : (
              <Radio className="size-5 text-emerald-400 animate-pulse" />
            )}
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>最新戰術動態 (LATEST ACTION)</span>
              {lastPlayedCard && (
                <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {lastPlayedCard.mitre}
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-200 mt-0.5">
              {lastPlayedCard ? (
                <span className={lastPlayedCard.side === 'red' ? 'text-rose-300' : 'text-sky-300'}>
                  {lastPlayedCard.side === 'red' ? '🔴 攻擊：' : '🔵 防守：'}{lastPlayedCard.name}
                </span>
              ) : (
                <span className="text-slate-400">
                  {isSpectator ? '白隊裁判已就位，AI 即將開戰...' : '戰情室待命中... 請出牌發動攻防！'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 中間：戰場標章與狀態 */}
        <div className="text-center z-10 hidden lg:block">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 font-bold tracking-widest uppercase">
            {isSpectator ? '👁️ ARBITER SPECTATOR ARENA' : '⚡ SOC THREAT INTERCEPTOR'}
          </span>
          <p className="text-[11px] text-slate-400 mt-1 font-bold">
            {isSpectator ? 'Cloudflare Workers AI 邊緣神經雙 Agent 全自動推論' : 'MITRE ATT&CK 實時對抗架構'}
          </p>
        </div>

        {/* 右側：回合與行動點數與結束回合控制 */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          {/* 回合資訊 */}
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">回合 (TURN)</span>
            <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              第 {rounds} 回合
            </span>
          </div>

          {/* 能量點數 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <Zap className="size-3.5 fill-amber-300 text-amber-300" />
            <div className="flex gap-1 items-center">
              {Array.from({ length: maxEnergy }).map((_, i) => (
                <span
                  key={i}
                  aria-label={`能量 ${i + 1}`}
                  className={`size-2.5 rounded-full transition-all ${
                    i < playerEnergy
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] scale-105'
                      : 'bg-slate-950 border border-slate-700 opacity-40'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-black text-amber-300 ml-1">
              {playerEnergy}/{maxEnergy}
            </span>
          </div>

          {/* 結束回合 / 觀戰模式指示按鈕 */}
          {isSpectator ? (
            <div className="px-3.5 py-2 rounded-xl bg-purple-950/50 border border-purple-500/60 text-xs font-black text-purple-200 flex items-center gap-1.5 shadow-sm">
              <Eye className="size-3.5 text-purple-400 animate-pulse" />
              <span>{currentTurnSide === 'red' ? '🔴 紅隊 AI 決策中' : '🔵 藍隊 AI 守備中'}</span>
            </div>
          ) : (
            <button
              onClick={handleEndTurnClick}
              disabled={!isPlayerTurn}
              aria-label={isPlayerTurn ? '結束目前回合並輪到對手行動' : '對手行動中，請稍候'}
              className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider flex items-center gap-1.5 transition-all duration-150 shadow-md ${
                isPlayerTurn
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 cursor-pointer active:scale-95 shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-70'
              }`}
            >
              <RotateCcw className={`size-3.5 ${isPlayerTurn ? 'animate-spin-slow' : ''}`} />
              {isPlayerTurn ? '結束本回合' : '對手決策中...'}
            </button>
          )}
        </div>
      </section>

      {/* 底部手牌區：PvE 為玩家手牌；觀戰模式為紅隊 APT 牌庫 */}
      <section 
        aria-label="底部戰術手牌區域" 
        className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-2.5 backdrop-blur-sm shadow-lg shrink-0"
      >
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-2 font-black text-slate-200 tracking-wide">
            <span className="size-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            {isSpectator 
              ? '🔴 紅隊 APT 邊緣 Agent 牌庫 (AI-RED)' 
              : `您的戰術手牌庫 (${isRed ? '🔴 紅隊滲透酬載' : '🔵 藍隊守備防護'})`}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            {isSpectator ? '白隊裁判全明牌俯瞰監控中' : '點選卡牌或按鍵盤 1-4 / Space 結束回合'}
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 items-center">
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
