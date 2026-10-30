import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

export default function TerminalLog({ logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-emerald-950/80 rounded-xl p-3 font-mono text-xs flex flex-col h-56 shadow-xl">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-950 text-emerald-500">
        <span className="flex items-center gap-1.5 font-bold tracking-wider">
          <Terminal className="size-3.5" /> SOC_OPERATIONS_TERMINAL
        </span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE STREAM
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 select-text">
        {logs.map((log, index) => {
          let badgeColor = 'text-slate-400';
          if (log.type === 'attack') badgeColor = 'text-rose-400 bg-rose-950/40 border border-rose-900/50';
          if (log.type === 'defense') badgeColor = 'text-sky-400 bg-sky-950/40 border border-sky-900/50';
          if (log.type === 'dance') badgeColor = 'text-purple-300 bg-purple-950/60 border border-purple-800 animate-pulse';
          if (log.type === 'system') badgeColor = 'text-amber-400 bg-amber-950/30';

          return (
            <div key={index} className="leading-relaxed flex items-start gap-2">
              <span className="text-slate-600 text-[10px] shrink-0 mt-0.5">[{log.time}]</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded shrink-0 font-bold ${badgeColor}`}>
                {log.tag}
              </span>
              <span className="text-slate-300 break-words flex-1">
                {log.message}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
