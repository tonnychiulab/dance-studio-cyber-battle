import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, Share2, Check, ShieldCheck, Flame } from 'lucide-react';

export default function VictoryModal({ winner, playerSide, rounds, onRestart }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // 勝利彩帶特效
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const isPlayerWinner = winner === playerSide;
  const isRed = winner === 'red';

  const shareText = `【要打去練舞室打之紅藍對抗篇】\n我扮演了 ${playerSide === 'red' ? '🔴紅隊' : '🔵藍隊'}，在第 ${rounds} 回合終局對決中${isPlayerWinner ? '贏得勝利' : '完成演練'}！\n紫隊成熟度鑑定：S-Rank 卓越！\n快來開瀏覽器挑戰：https://dance-studio-battle.pages.dev`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // 靜默降級處理沙箱或非 HTTPS 環境限制
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 font-mono">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-2xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        {/* 發光飾圈 */}
        <div className="size-20 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20">
          <Trophy className="size-10 text-amber-400" />
        </div>

        {/* 獲勝者宣告 */}
        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest ${
          isRed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
        }`}>
          {isRed ? '🔴 紅隊奪取金絲雀勝利！' : '🔵 藍隊成功堅守防禦線！'}
        </span>

        <h2 className="text-2xl font-black text-slate-100 mt-2 mb-4">
          {isPlayerWinner ? '🎉 恭喜獲勝！戰情室演練大捷！' : '🤝 演練平手收官！雙方皆具極高韌性！'}
        </h2>

        {/* 紫隊成熟度鑑定證書 */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 text-left space-y-3 mb-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Award className="size-4" /> 紫隊協同成熟度評定證書
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              S-RANK 卓越
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">平均偵測時間 (MTTD)</span>
              <span className="text-slate-200 font-bold">12.4 秒 (極致敏捷)</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">平均處置時間 (MTTR)</span>
              <span className="text-slate-200 font-bold">28.5 秒 (自動隔離)</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">總交鋒回合</span>
              <span className="text-slate-200 font-bold">{rounds} 回合</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">練舞室尬舞認證</span>
              <span className="text-purple-300 font-bold">資安舞王勳章 💃</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic bg-purple-950/20 p-2 rounded border border-purple-900/30">
            白隊裁判開示：「不管是滲透還是防禦，只要能打去練舞室解決的，就是一場成功的攻防演練！」
          </p>
        </div>

        {/* 按鈕組 */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            {copied ? <Check className="size-4 text-emerald-400" /> : <Share2 className="size-4" />}
            {copied ? '已複製戰績！' : '分享戰績'}
          </button>

          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
          >
            <RefreshCw className="size-4" /> 再來一局練舞室！
          </button>
        </div>
      </div>
    </div>
  );
}
