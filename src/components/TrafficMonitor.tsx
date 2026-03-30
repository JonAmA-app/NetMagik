import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface TrafficMonitorProps {
  isActive: boolean;
  t: any;
}

export const TrafficMonitor: React.FC<TrafficMonitorProps> = ({ isActive, t }) => {
  const [dataPoints, setDataPoints] = useState<number[]>(new Array(40).fill(5));
  const [currentSpeed, setCurrentSpeed] = useState({ down: 0, up: 0 });
  
  // Simulation loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setDataPoints(prev => {
        const newData = [...prev.slice(1)];
        // Generate random traffic spike
        const randomVal = Math.random() > 0.8 
          ? Math.floor(Math.random() * 80) + 20 
          : Math.floor(Math.random() * 30) + 5;
        newData.push(randomVal);
        return newData;
      });

      setCurrentSpeed({
        down: Math.floor(Math.random() * 150) + 20,
        up: Math.floor(Math.random() * 50) + 5
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isActive]);

  const normalizeGraph = (points: number[]) => {
    const max = 100;
    const width = 100 / (points.length - 1);
    
    let path = `M 0 ${max - points[0]}`;
    
    points.forEach((point, i) => {
      if (i === 0) return;
      
      // Bezier curve for smoothness
      const x = i * width;
      const prevX = (i - 1) * width;
      const y = max - point;
      const prevY = max - points[i - 1];
      
      const controlX1 = prevX + (width / 2);
      const controlY1 = prevY;
      const controlX2 = x - (width / 2);
      const controlY2 = y;
      
      path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x} ${y}`;
    });

    return path;
  };

  const areaPath = `${normalizeGraph(dataPoints)} L 100 100 L 0 100 Z`;
  const strokePath = normalizeGraph(dataPoints);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t.traffic}</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-xs font-mono font-medium">
            <ArrowDown size={14} />
            {currentSpeed.down} Mbps
          </div>
          <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded text-xs font-mono font-medium">
            <ArrowUp size={14} />
            {currentSpeed.up} Mbps
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="absolute inset-0 w-full h-full transition-all duration-700 ease-linear"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.5" strokeDasharray="2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.5" strokeDasharray="2" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.5" strokeDasharray="2" />

          {/* Graph Area */}
          <path d={areaPath} fill="url(#trafficGradient)" />
          
          {/* Graph Line */}
          <path 
            d={strokePath} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Status Overlay if inactive */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
             <span className="text-slate-400 text-sm">{t.monitoringPaused || "Monitoring Paused"}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
        <span>{t.ago?.replace('$time', '60s') || "60s ago"}</span>
        <span>{t.ago?.replace('$time', '30s') || "30s ago"}</span>
        <span>{t.now || "Now"}</span>
      </div>
    </div>
  );
};
