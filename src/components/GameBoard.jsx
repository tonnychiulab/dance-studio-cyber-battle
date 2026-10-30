import React from 'react';
import Card from './Card.jsx';
import { Zap, Play, RotateCcw } from 'lucide-react';

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
  rounds
}) {
  const isRed = playerSide === 'red';

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-7xl mx-auto w-full gap-4 font-mono">
      {/* 頂部：對手手牌區（背面展示） */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-bold">
            <span className={`size-2 rounded-full ${isRed ? 'bg-sky-500' : 'bg-rose-500'}`} />
            對手手牌 ({isRed ? '藍隊守備方 AI' : '紅隊滲透方 AI'})
          </span>
          <span>手牌數：{opponentHand.length} 張</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {opponentHand.map((_, idx) => (
            <div
              key={idx}
              className="w-24 h-32 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-2 text-center shrink-0 shadow-md"
            >
              <div className="text-xl mb-1">🔒</div>
              <span className="text-[10px] text-slate-600">ENCRYPTED</span>
            </div>
          ))}
        </div>
      </div>

      {/* 中央：戰情室交鋒競技場 (Battle Arena) */}
      <div className="my-auto py-6 px-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-950/60 flex flex-col md:flex-row items-center justify-around gap-6 relative overflow-hidden shadow-inner">
        {/* 背景水印 */}
        <div className="absolute inset-0 flex items-center justify-center text-7xl font-black text-slate-900/60 select-none pointer-events-none">
          WAR ROOM ARENA
        </div>

        {/* 最近打出的卡牌展示 */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-[11px] text-slate-400 mb-2 uppercase tracking-wider">
            {lastPlayedCard ? `最新打出：${lastPlayedCard.name}` : '戰情室待命中... 隨時出牌發動攻防！'}
          </span>

          {lastPlayedCard ? (
            <div className="scale-95 animate-in zoom-in-95 duration-200">
              <Card card={lastPlayedCard} canPlay={false} />
            </div>
          ) : (
            <div className="w-52 h-64 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 text-xs p-4 text-center">
              <span className="text-3xl mb-2">⚔️</span>
              等待雙方發動 MITRE 攻擊或 SOC 防禦動作
            </div>
          )}
        </div>

        {/* 當前回合資訊與回合結束按鈕 */}
        <div className="relative z-10 flex flex-col items-center md:items-end gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">對決回合 (Turn)</span>
            <span className="text-2xl font-black text-slate-200">第 {rounds} 回合</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Zap className="size-4 fill-amber-300" /> 行動點數：
            </div>
            <div className="flex gap-1">
              {Array.from({ length: maxEnergy }).map((_, i) => (
                <span
                  key={i}
                  className={`size-3 rounded-full transition-all duration-300 ${
                    i < playerEnergy ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 ml-1">({playerEnergy}/{maxEnergy})</span>
          </div>

          <button
            onClick={onEndTurn}
            disabled={!isPlayerTurn}
            className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
              isPlayerTurn
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <RotateCcw className="size-4" /> 結束回合 (換對手行動)
          </button>
        </div>
      </div>

      {/* 底部：玩家手牌區 */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="flex items-center gap-2 font-bold text-slate-300">
            <span className={`size-2 rounded-full ${isRed ? 'bg-rose-500' : 'bg-sky-500'}`} />
            您的手牌 ({isRed ? '🔴 紅隊滲透手牌' : '🔵 藍隊防禦手牌'})
          </span>
          <span className="text-slate-500">點選即可出牌發動效果</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {playerHand.map((card, idx) => (
            <Card
              key={`${card.id}-${idx}`}
              card={card}
              canPlay={isPlayerTurn && playerEnergy >= card.cost}
              onPlay={onPlayCard}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
