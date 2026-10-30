import React from 'react';
import { Music, Sparkles, CloudRain, Zap } from 'lucide-react';

export default function DanceStudioModal({ event, onDismiss }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-purple-950/90 via-slate-900 to-slate-950 border-2 border-purple-500 neon-border-purple rounded-2xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden font-mono">
        {/* 背景裝飾光效 */}
        <div className="absolute -top-24 -left-24 size-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-48 bg-pink-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* 頂部動畫圖標 */}
        <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-4xl mb-4 animate-bounce shadow-lg shadow-purple-500/30">
          🕺💃
        </div>

        {/* 警報標題 */}
        <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold tracking-widest uppercase mb-3 animate-pulse">
          ⚠️ 戰情室過熱警報：尬舞能量破表 (100%) ⚠️
        </div>

        {/* 經典台詞大標題 */}
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 tracking-tight leading-snug mb-3">
          {event.quote}
        </h2>

        {/* 事件卡片 */}
        <div className="my-5 p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 text-left">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-1">
            <Sparkles className="size-4" /> {event.title}
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            {event.description}
          </p>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-900 text-xs text-emerald-400 flex items-center gap-2">
            <Zap className="size-4 text-amber-400 shrink-0" />
            <span><strong>實時效應：</strong>{event.effectDesc}</span>
          </div>
        </div>

        {/* 互動確認按鈕 */}
        <button
          onClick={onDismiss}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-sm tracking-wider shadow-lg shadow-purple-600/40 hover:shadow-purple-600/60 transition-all duration-200 active:scale-95"
        >
          🕺 收到！全體移駕練舞室尬舞！ (恢復戰局)
        </button>
      </div>
    </div>
  );
}
