import React from 'react';
import { Play, Pause, StepForward, Zap, Sparkles, AlertOctagon, Eye } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function SpectatorControls({
  isPlaying,
  onTogglePlay,
  onStepNext,
  speed,
  onToggleSpeed,
  onForceDanceStudio,
  currentTurnSide
}) {
  const handlePlayToggle = () => {
    sound.playCard();
    onTogglePlay();
  };

  const handleStep = () => {
    sound.playCard();
    onStepNext();
  };

  const handleSpeedToggle = () => {
    sound.playHover();
    onToggleSpeed();
  };

  const handleIntervene = () => {
    sound.playAlarm();
    onForceDanceStudio();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-1 px-2 select-none font-mono shrink-0">
      <div className="bg-slate-900/90 border border-purple-500/70 neon-border-purple rounded-xl p-2 sm:p-2.5 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-2">
        {/* 裁判狀態指示器 */}
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Eye className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/50 font-bold uppercase tracking-wider">
                WHITE ARBITER
              </span>
              <span className="text-xs text-slate-400 font-bold">
                輪到：{currentTurnSide === 'red' ? '🔴 紅隊 AI 決策中' : '🔵 藍隊 AI 守備中'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-bold">
              白隊裁判觀戰模式 (Cloudflare 雙 Agent 邊緣對抗)
            </p>
          </div>
        </div>

        {/* 控制按鈕組 (Emil Kowalski 物理按鈕微反饋) */}
        <div className="flex items-center gap-2">
          {/* 播放 / 暫停按鈕 */}
          <button
            onClick={handlePlayToggle}
            aria-label={isPlaying ? '暫停自動對戰' : '繼續自動對戰'}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-150 active:scale-[0.95] cursor-pointer shadow-md focus-visible:ring-2 focus-visible:ring-purple-400 ${
              isPlaying
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5 fill-current" /> 暫停對弈
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" /> 自動戰鬥
              </>
            )}
          </button>

          {/* 單步執行下一動 */}
          <button
            onClick={handleStep}
            disabled={isPlaying}
            aria-label="單步推進下一回合"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-150 active:scale-[0.95] border ${
              isPlaying
                ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer shadow'
            }`}
            title={isPlaying ? '請先暫停後再單步推進' : '推進下一個 AI 行動'}
          >
            <StepForward className="size-3.5" /> 單步推進
          </button>

          {/* 倍速切換 (1x / 2x) */}
          <button
            onClick={handleSpeedToggle}
            aria-label="切換對戰速度"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-[0.95] cursor-pointer"
            title="調整對戰速度"
          >
            <Zap className="size-3.5 fill-current" /> {speed}x 速度
          </button>

          {/* 裁判特權：強制尬舞介入大招 */}
          <button
            onClick={handleIntervene}
            aria-label="白隊裁判強制介入：要打去練舞室打！"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all duration-150 active:scale-[0.95] cursor-pointer animate-pulse"
            title="強行介入！不需滿格立即移駕練舞室！"
          >
            <AlertOctagon className="size-3.5" /> 🚨 住手！去練舞室打！
          </button>
        </div>
      </div>
    </div>
  );
}
