import React from 'react';
import { Shield, Flame, Music, Volume2, VolumeX, RotateCcw, Cpu } from 'lucide-react';

export default function Header({ 
  corpHP, 
  breachProgress, 
  danceGauge, 
  muted, 
  onToggleMute, 
  playerSide, 
  onResetGame,
  aiEngine = '⚡ Cloudflare Workers AI'
}) {
  const isRed = playerSide === 'red';
  const isDanceCritical = danceGauge >= 80;
  const isHPCritical = corpHP <= 25;

  return (
    <header className="border-b border-emerald-950/70 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo 與主視覺標題 */}
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0 select-none">
            💃
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold tracking-wider">
                SOC-BATTLE v1.1
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest hidden sm:inline">
                Cloudflare Edge Edition
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
              「要打去練舞室打」
              <span className="text-xs font-bold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900/40">
                之紅藍對抗篇
              </span>
            </h1>
          </div>
        </div>

        {/* 中央戰況即時狀態條 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-2xl text-xs font-mono">
          {/* 企業防禦 HP */}
          <div className={`bg-slate-900/90 border rounded-xl p-2.5 flex flex-col justify-between transition-all duration-300 ${
            isHPCritical ? 'border-rose-600 neon-border-red animate-pulse' : 'border-sky-900/60 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-sky-400 mb-1.5 font-bold">
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-sky-400 shrink-0" /> 企業防禦 HP
              </span>
              <span className={isHPCritical ? 'text-rose-400 font-black' : 'text-sky-300'}>
                {corpHP} / 100
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-sky-950 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isHPCritical
                    ? 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                    : 'bg-gradient-to-r from-sky-600 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, corpHP))}%` }}
              />
            </div>
          </div>

          {/* 紅隊滲透進度 */}
          <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-rose-400 mb-1.5 font-bold">
              <span className="flex items-center gap-1.5">
                <Flame className="size-3.5 text-rose-400 shrink-0" /> 滲透突破進度
              </span>
              <span className="text-rose-300 font-black">{breachProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-rose-950 p-0.5">
              <div 
                className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                style={{ width: `${Math.max(0, Math.min(100, breachProgress))}%` }}
              />
            </div>
          </div>

          {/* 練舞室尷尬值 / 尬舞條 */}
          <div className={`bg-slate-900/90 border rounded-xl p-2.5 flex flex-col justify-between transition-all duration-300 ${
            isDanceCritical 
              ? 'border-purple-500 neon-border-purple animate-pulse' 
              : 'border-purple-900/60 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-purple-400 mb-1.5 font-bold">
              <span className="flex items-center gap-1.5">
                <Music className="size-3.5 text-purple-400 shrink-0" /> 尬舞能量滿載
              </span>
              <span className={`font-black ${isDanceCritical ? 'text-pink-300 animate-bounce' : 'text-purple-300'}`}>
                {danceGauge}%
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-purple-950 p-0.5">
              <div 
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                style={{ width: `${Math.max(0, Math.min(100, danceGauge))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 右側操作面板 */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-xs font-mono font-bold text-purple-300 shadow-sm">
            <Cpu className="size-3.5 text-purple-400" />
            <span className="truncate max-w-[180px]">{aiEngine}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono font-bold flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${isRed ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]'}`} />
            <span className={isRed ? 'text-rose-300' : 'text-sky-300'}>
              {isRed ? '🔴 紅隊滲透' : '🔵 藍隊守備'}
            </span>
          </div>

          {/* 音效切換按鈕 (Emil 觸覺按鈕微反饋) */}
          <button
            onClick={onToggleMute}
            aria-label={muted ? '開啟遊戲音效' : '靜音遊戲音效'}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
            title={muted ? '開啟音效' : '靜音'}
          >
            {muted ? <VolumeX className="size-4 text-slate-500" /> : <Volume2 className="size-4 text-emerald-400" />}
          </button>

          {/* 重啟戰局按鈕 */}
          <button
            onClick={onResetGame}
            aria-label="重設遊戲並返回陣營選擇"
            className="text-xs px-3.5 py-2 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 hover:bg-rose-900/80 hover:text-white transition-all active:scale-[0.95] flex items-center gap-1.5 font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <RotateCcw className="size-3.5" /> 重設
          </button>
        </div>
      </div>
    </header>
  );
}
