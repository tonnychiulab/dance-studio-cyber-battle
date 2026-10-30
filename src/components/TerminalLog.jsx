import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check, Trash2 } from 'lucide-react';

export default function TerminalLog({ logs }) {
  const endRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.time}] [${l.tag}] ${l.message}`).join('\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside 
      aria-label="即時資安營運中心日誌終端機"
      className="bg-slate-950/95 border-2 border-emerald-950/80 rounded-2xl p-4 font-mono text-xs flex flex-col h-full min-h-[320px] lg:min-h-[580px] shadow-2xl relative overflow-hidden backdrop-blur-md"
    >
      {/* 終端機頂部狀態列 */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-950/90 text-emerald-500">
        <span className="flex items-center gap-2 font-black tracking-wider">
          <Terminal className="size-4 text-emerald-400" /> SOC_LIVE_LOGS
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            aria-label="複製終端機所有日誌"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-800 transition-all cursor-pointer active:scale-90"
            title="複製日誌"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/60 font-bold">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> STREAMING
          </span>
        </div>
      </div>

      {/* 日誌串流輸出區域 */}
      <div 
        aria-live="polite" 
        className="flex-1 overflow-y-auto space-y-2 pr-1.5 select-text text-[11px]"
      >
        {logs.map((log, index) => {
          let badgeColor = 'text-slate-400 bg-slate-900 border-slate-800';
          if (log.type === 'attack') badgeColor = 'text-rose-400 bg-rose-950/50 border-rose-900/60 shadow-[0_0_8px_rgba(244,63,94,0.15)]';
          if (log.type === 'defense') badgeColor = 'text-sky-400 bg-sky-950/50 border-sky-900/60 shadow-[0_0_8px_rgba(56,189,248,0.15)]';
          if (log.type === 'dance') badgeColor = 'text-purple-300 bg-purple-950/70 border-purple-800 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.3)]';
          if (log.type === 'system') badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-900/50';

          return (
            <div key={index} className="leading-relaxed flex items-start gap-2 animate-in fade-in duration-200">
              <span className="text-slate-600 text-[10px] shrink-0 font-mono mt-0.5">
                [{log.time}]
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold border ${badgeColor}`}>
                {log.tag}
              </span>
              <span className="text-slate-300 break-words flex-1 font-mono">
                {log.message}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* 底部輸入游標提示 */}
      <div className="pt-2 mt-2 border-t border-emerald-950/60 flex items-center gap-1 text-[11px] text-slate-500 font-mono">
        <span className="text-emerald-500 font-bold">&gt;</span>
        <span>Awaiting network events...</span>
        <span className="w-2 h-3.5 bg-emerald-500 animate-pulse ml-0.5" />
      </div>
    </aside>
  );
}
