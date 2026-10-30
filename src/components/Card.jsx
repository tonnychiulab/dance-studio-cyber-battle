import React from 'react';
import { Zap, Shield, Flame, Music, Sparkles } from 'lucide-react';

export default function Card({ card, onPlay, canPlay, isOpponent = false }) {
  const isRed = card.side === 'red';

  return (
    <div
      onClick={() => canPlay && onPlay(card)}
      className={`relative group rounded-xl p-3.5 transition-all duration-200 select-none flex flex-col justify-between ${
        isOpponent 
          ? 'bg-slate-900/60 border border-slate-800 opacity-80 cursor-not-allowed h-36' 
          : canPlay
            ? isRed
              ? 'bg-gradient-to-b from-slate-900 to-rose-950/40 border border-rose-800/80 hover:border-rose-500 hover:neon-border-red hover:-translate-y-2 cursor-pointer shadow-lg shadow-rose-950/20'
              : 'bg-gradient-to-b from-slate-900 to-sky-950/40 border border-sky-800/80 hover:border-sky-500 hover:neon-border-blue hover:-translate-y-2 cursor-pointer shadow-lg shadow-sky-950/20'
            : 'bg-slate-900/40 border border-slate-800/60 opacity-50 cursor-not-allowed'
      } w-48 sm:w-52 h-64 shrink-0 font-mono`}
    >
      {/* 頂部：MITRE ATT&CK 標籤與消耗費用 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
            isRed 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
          }`}>
            {card.mitre}
          </span>

          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            <Zap className="size-3 fill-amber-300" /> {card.cost}
          </span>
        </div>

        {/* 卡牌名稱 */}
        <h3 className={`text-sm font-bold tracking-tight mb-1.5 ${isRed ? 'text-rose-100' : 'text-sky-100'}`}>
          {card.name}
        </h3>

        {/* 數值標章 */}
        <div className="flex items-center gap-2 mb-2 text-xs">
          {card.attack > 0 && (
            <span className="flex items-center gap-0.5 text-rose-400 font-bold">
              <Flame className="size-3" /> +{card.attack}
            </span>
          )}
          {card.defense > 0 && (
            <span className="flex items-center gap-0.5 text-sky-400 font-bold">
              <Shield className="size-3" /> +{card.defense}
            </span>
          )}
          {card.danceCharge > 0 && (
            <span className="flex items-center gap-0.5 text-purple-400 font-bold">
              <Music className="size-3" /> +{card.danceCharge}%
            </span>
          )}
        </div>

        {/* 效果說明 */}
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* 底部迷因引言與出牌按鈕 */}
      <div>
        <div className="border-t border-slate-800/80 pt-1.5 mt-2">
          <p className="text-[10px] text-slate-500 italic line-clamp-2">
            {card.flavor}
          </p>
        </div>

        {canPlay && !isOpponent && (
          <div className="mt-2 text-center">
            <span className={`inline-block w-full py-1 text-[11px] font-bold rounded transition ${
              isRed 
                ? 'bg-rose-600/30 text-rose-300 group-hover:bg-rose-600 group-hover:text-white' 
                : 'bg-sky-600/30 text-sky-300 group-hover:bg-sky-600 group-hover:text-white'
            }`}>
              點擊出牌
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
