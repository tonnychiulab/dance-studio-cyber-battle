import React from 'react';
import { Zap, Shield, Flame, Music, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function Card({ card, onPlay, canPlay, isOpponent = false, statusText }) {
  const isRed = card.side === 'red';
  const isMeme = card.type === 'meme' || card.mitre?.startsWith('Meme');

  const handleClick = () => {
    if (isOpponent) return;
    if (canPlay) {
      onPlay(card);
    } else {
      sound.playBuzz();
    }
  };

  const handleKeyDown = (e) => {
    if (isOpponent) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleMouseEnter = () => {
    if (!isOpponent && canPlay) {
      sound.playHover();
    }
  };

  if (isOpponent) {
    return (
      <div 
        className="relative group rounded-xl p-3 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 w-44 sm:w-48 h-56 shrink-0 font-mono select-none flex flex-col items-center justify-center text-center opacity-75 shadow-lg"
        aria-hidden="true"
      >
        <div className="size-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl mb-2 shadow-inner">
          🔒
        </div>
        <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">
          ENCRYPTED
        </span>
        <span className="text-[9px] text-slate-600 mt-1">
          {isRed ? '藍隊防禦節點' : '紅隊滲透酬載'}
        </span>
      </div>
    );
  }

  // 決定卡牌邊框與發光樣式
  let borderStyle = 'border-slate-800/80 bg-slate-900/50 opacity-60 cursor-not-allowed';
  let badgeStyle = 'bg-slate-800/50 text-slate-400 border-slate-700/50';

  if (canPlay) {
    if (isMeme) {
      borderStyle = 'bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-950 border-purple-500/80 hover:border-purple-400 hover:neon-border-purple hover:-translate-y-2.5 hover:scale-[1.02] cursor-pointer shadow-lg shadow-purple-950/30';
      badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    } else if (isRed) {
      borderStyle = 'bg-gradient-to-b from-slate-900 via-rose-950/30 to-slate-950 border-rose-800/80 hover:border-rose-500 hover:neon-border-red hover:-translate-y-2.5 hover:scale-[1.02] cursor-pointer shadow-lg shadow-rose-950/30';
      badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    } else {
      borderStyle = 'bg-gradient-to-b from-slate-900 via-sky-950/30 to-slate-950 border-sky-800/80 hover:border-sky-500 hover:neon-border-blue hover:-translate-y-2.5 hover:scale-[1.02] cursor-pointer shadow-lg shadow-sky-950/30';
      badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    }
  }

  return (
    <div
      role="button"
      tabIndex={canPlay ? 0 : -1}
      aria-label={`${card.name}，消耗行動點數 ${card.cost}，${card.description}`}
      aria-disabled={!canPlay}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      className={`card-foil relative rounded-2xl p-4 transition-all duration-200 ease-out select-none flex flex-col justify-between w-52 sm:w-56 h-72 shrink-0 font-mono active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        isRed ? 'focus-visible:ring-rose-500' : 'focus-visible:ring-sky-500'
      } ${borderStyle}`}
    >
      {/* 頂部：MITRE ATT&CK 標籤與消耗費用 */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border shadow-sm ${badgeStyle}`}>
            {card.mitre}
          </span>

          <span className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold border transition-colors ${
            canPlay
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
              : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
          }`}>
            <Zap className="size-3 fill-current" /> {card.cost}
          </span>
        </div>

        {/* 卡牌名稱 */}
        <h3 className={`text-sm font-bold tracking-tight mb-2 leading-snug ${
          isMeme ? 'text-purple-200' : isRed ? 'text-rose-100' : 'text-sky-100'
        }`}>
          {card.name}
        </h3>

        {/* 數值標章 */}
        <div className="flex items-center gap-2.5 mb-2.5 text-xs">
          {card.attack > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/60 font-bold">
              <Flame className="size-3" /> +{card.attack}
            </span>
          )}
          {card.defense > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-900/60 font-bold">
              <Shield className="size-3" /> +{card.defense}
            </span>
          )}
          {card.danceCharge > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-900/60 font-bold">
              <Music className="size-3" /> +{card.danceCharge}%
            </span>
          )}
        </div>

        {/* 效果說明 */}
        <p className="text-[11px] text-slate-300/90 leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* 底部迷因引言與出牌按鈕 */}
      <div>
        <div className="border-t border-slate-800/80 pt-2 mt-2">
          <p className="text-[10px] text-slate-400 italic line-clamp-2 leading-normal">
            {card.flavor}
          </p>
        </div>

        <div className="mt-2.5 text-center">
          <span className={`inline-flex items-center justify-center w-full py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
            canPlay
              ? isMeme
                ? 'bg-purple-600/30 text-purple-200 hover:bg-purple-600 hover:text-white border border-purple-500/50 shadow-md shadow-purple-950/40'
                : isRed 
                  ? 'bg-rose-600/30 text-rose-200 hover:bg-rose-600 hover:text-white border border-rose-500/50 shadow-md shadow-rose-950/40' 
                  : 'bg-sky-600/30 text-sky-200 hover:bg-sky-600 hover:text-white border border-sky-500/50 shadow-md shadow-sky-950/40'
              : 'bg-slate-800/40 text-slate-500 border border-slate-800'
          }`}>
            {canPlay ? '⚡ 點擊出牌' : (statusText || '待命')}
          </span>
        </div>
      </div>
    </div>
  );
}
