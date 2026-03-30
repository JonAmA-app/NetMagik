import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Play, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface PingToolProps {
  isOpen: boolean;
  onClose: () => void;
  targetIp: string;
  language: Language;
}

export const PingTool: React.FC<PingToolProps> = ({ isOpen, onClose, targetIp, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setOutput([t.pingingWithBytes.replace('$target', targetIp)]);
      setIsRunning(true);
    } else {
      setOutput([]);
      setIsRunning(false);
    }
  }, [isOpen, targetIp, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (!isRunning) return;

    let count = 0;
    const maxPings = 4;

    const interval = setInterval(() => {
      count++;
      const time = Math.floor(Math.random() * 20) + 10; // Random ms between 10-30
      const ttl = 118;

      setOutput(prev => [...prev, t.replyFrom.replace('$target', targetIp).replace('$time', `${time}ms`).replace('$ttl', ttl.toString())]);

      if (count >= maxPings) {
        clearInterval(interval);
        setIsRunning(false);
        setOutput(prev => [
          ...prev,
          '',
          t.pingStatsFor.replace('$target', targetIp),
          '    ' + t.packetsSentReceivedLost
            .replace('$sent', maxPings.toString())
            .replace('$received', maxPings.toString())
            .replace('$lost', '0')
            .replace('$loss', '0'),
          t.approximateRoundTrip,
          '    ' + t.minMaxAvg
            .replace('$min', '10ms')
            .replace('$max', '30ms')
            .replace('$avg', '20ms'),
          '',
          t.traceComplete
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, targetIp]);

  if (!isOpen) return null;

  const restart = () => {
    setOutput([t.pingingWithBytes.replace('$target', targetIp)]);
    setIsRunning(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1e1e1e] text-slate-300 rounded-xl shadow-2xl overflow-hidden border border-slate-700 font-mono text-sm animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-black">
          <div className="flex items-center gap-2 text-slate-100">
            <Terminal size={14} className="text-emerald-500" />
            <span className="text-xs font-semibold">{t.commandPromptPing}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Terminal Content */}
        <div
          ref={scrollRef}
          className="h-64 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
        >
          {output.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {line.includes('Reply from') ? (
                <span><span className="text-slate-500">{new Date().toLocaleTimeString()}</span> {line}</span>
              ) : line.includes('Trace complete') ? (
                <span className="text-emerald-400 font-bold">{line}</span>
              ) : (
                line
              )}
            </div>
          ))}
          {isRunning && (
            <div className="animate-pulse text-emerald-500">_</div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 bg-[#252526] border-t border-black flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {isRunning ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                {t.loading.replace('...', '')}
              </>
            ) : (
              <>
                <CheckCircle2 size={12} className="text-emerald-500" />
                {t.traceComplete.replace('.', '')}
              </>
            )}
          </div>
          <button
            onClick={restart}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
          >
            <Play size={12} fill="currentColor" />
            {t.rerunTest}
          </button>
        </div>
      </div>
    </div>
  );
};
