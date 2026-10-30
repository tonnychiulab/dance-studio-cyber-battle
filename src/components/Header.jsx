import React from 'react';
import { Shield, Flame, Music, Volume2, VolumeX, MonitorPlay, Users } from 'lucide-react';

export default function Header({ 
  corpHP, 
  breachProgress, 
  danceGauge, 
  muted, 
  onToggleMute, 
  playerSide,
  gameMode,
  onResetGame
}) {
  return (
    <header className="border-b border-emerald-950/80 bg-slate-950/90 backdrop-blur sticky top-0 z-30 px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo 與標題 */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            💃
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono tracking-wider">
                SOC-BATTLE v1.0
              </span>
              <span className="text-xs text-slate-500">Cloudflare Pages Edition</span>
            </div>
            <h1 className="text-lg font-bold text-slate-100 tracking-wide flex items-center gap-2">
              「要打去練舞室打」
              <span className="text-xs font-normal text-rose-400">之紅藍對抗篇</span>
            </h1>
          </div>
        </div>

        {/* 中央戰況即時狀態條 */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-2xl text-xs font-mono">
          {/* 企業防禦 HP */}
          <div className="bg-slate-900/80 border border-sky-900/50 rounded-lg p-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-sky-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Shield className="size-3.5" /> 藍隊防禦值
              </span>
              <span>{corpHP} / 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-sky-950">
              <div 
                className="bg-gradient-to-r from-sky-600 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, corpHP))}%` }}
              />
            </div>
          </div>

          {/* 紅隊滲透進度 */}
          <div className="bg-slate-900/80 border border-rose-900/50 rounded-lg p-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Flame className="size-3.5" /> 紅隊滲透進度
              </span>
              <span>{breachProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-rose-950">
              <div 
                className="bg-gradient-to-r from-orange-500 to-rose-500 h-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, breachProgress))}%` }}
              />
            </div>
          </div>

          {/* 練舞室尷尬值 / 尬舞條 */}
          <div className={`bg-slate-900/80 border rounded-lg p-2 flex flex-col justify-between transition-all duration-300 ${
            danceGauge >= 80 
              ? 'border-purple-500 neon-border-purple animate-pulse' 
              : 'border-purple-900/50'
          }`}>
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Music className="size-3.5" /> 尬舞能量條
              </span>
              <span className="font-bold">{danceGauge}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-purple-950">
              <div 
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 h-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, danceGauge))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 右側操作按鈕 */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${playerSide === 'red' ? 'bg-rose-500' : 'bg-sky-500'}`} />
            {playerSide === 'red' ? '扮演：紅隊' : '扮演：藍隊'}
          </div>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition"
            title={muted ? '開啟音效' : '靜音'}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 text-emerald-400" />}
          </button>

          <button
            onClick={onResetGame}
            className="text-xs px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 hover:bg-rose-900 hover:text-white transition font-mono"
          >
            重啟戰局
          </button>
        </div>
      </div>
    </header>
  );
}
