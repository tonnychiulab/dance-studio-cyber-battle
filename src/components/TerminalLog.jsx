import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check, ChevronUp, ChevronDown, ShieldAlert, Activity, Radio } from 'lucide-react';

export default function TerminalLog({ logs = [], isCollapsed = false, onToggleCollapse }) {
  const endRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isCollapsed) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isCollapsed]);

  const handleCopyLogs = (e) => {
    e.stopPropagation();
    const text = logs.map(l => `[${l.time}] [${l.tag}] ${l.message}`).join('\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  // 統計各類事件數量 (Wazuh 遙測計數器)
  const attackCount = logs.filter(l => l.type === 'attack').length;
  const defenseCount = logs.filter(l => l.type === 'defense').length;
  const danceCount = logs.filter(l => l.type === 'dance').length;

  return (
    <aside 
      aria-label="即時資安營運中心日誌終端機"
      className={`border-t-2 border-emerald-950/90 bg-slate-950/95 backdrop-blur-md font-mono text-xs shadow-2xl transition-all duration-300 ease-out z-20 shrink-0 w-full flex flex-col ${
        isCollapsed ? 'h-11 overflow-hidden' : 'h-48 sm:h-56'
      }`}
    >
      {/* 頂部 Wazuh 遙測控制列 (點擊整列可快速收合/展開) */}
      <div 
        onClick={onToggleCollapse}
        className="h-11 px-4 flex items-center justify-between border-b border-emerald-950/80 bg-slate-900/60 select-none cursor-pointer hover:bg-slate-900/90 transition-colors shrink-0"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-2 font-black tracking-wider text-emerald-400 shrink-0 text-xs">
            <Terminal className="size-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">WAZUH</span> SOC_TELEMETRY
          </span>

          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60 font-bold shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </span>

          {/* Wazuh 嚴重等級指標標籤 */}
          <div className="hidden md:flex items-center gap-2 shrink-0 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/60 font-bold">
              APT: {attackCount}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-900/60 font-bold">
              SOC: {defenseCount}
            </span>
            {danceCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-900/60 font-bold animate-pulse">
                DANCE: {danceCount}
              </span>
            )}
          </div>

          {/* 折疊狀態時：跑馬燈顯示最新事件摘要 */}
          {isCollapsed && latestLog && (
            <div className="flex items-center gap-2 text-slate-400 text-[11px] truncate ml-2">
              <span className="text-slate-600 font-mono text-[10px]">[{latestLog.time}]</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800 font-bold">
                {latestLog.tag}
              </span>
              <span className="truncate text-slate-300">{latestLog.message}</span>
            </div>
          )}
        </div>

        {/* 右側操作按鈕 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLogs}
            aria-label="複製終端機所有日誌"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-700 transition-all cursor-pointer active:scale-90"
            title="複製全部日誌"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            aria-label={isCollapsed ? '展開資安日誌面板' : '收合資安日誌面板'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="size-3.5" />
                <span className="hidden sm:inline">展開日誌 ({logs.length})</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" />
                <span className="hidden sm:inline">收合面板</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 展開狀態：即時串流輸出區域 */}
      {!isCollapsed && (
        <div 
          aria-live="polite" 
          className="flex-1 overflow-y-auto space-y-1.5 p-3 select-text text-[11px] bg-slate-950/90"
        >
          {logs.map((log, index) => {
            let badgeColor = 'text-slate-400 bg-slate-900 border-slate-800';
            if (log.type === 'attack') badgeColor = 'text-rose-400 bg-rose-950/50 border-rose-900/60 shadow-[0_0_8px_rgba(244,63,94,0.15)]';
            if (log.type === 'defense') badgeColor = 'text-sky-400 bg-sky-950/50 border-sky-900/60 shadow-[0_0_8px_rgba(56,189,248,0.15)]';
            if (log.type === 'dance') badgeColor = 'text-purple-300 bg-purple-950/70 border-purple-800 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.3)]';
            if (log.type === 'system') badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-900/50';

            return (
              <div key={index} className="leading-relaxed flex items-start gap-2 animate-in fade-in duration-150">
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
      )}
    </aside>
  );
}
