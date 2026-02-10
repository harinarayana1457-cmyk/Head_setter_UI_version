
import React, { useMemo } from 'react';

interface RadarMapProps {
  distance: number;
  radius: number;
  isAlert: boolean;
}

const RadarMap: React.FC<RadarMapProps> = ({ distance, radius, isAlert }) => {
  const normalizedDistance = Math.min((distance / radius) * 100, 120); // cap visualization
  
  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
      {/* Outer Ring */}
      <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>
      
      {/* Fence Ring */}
      <div className={`absolute border-2 rounded-full transition-all duration-500 ease-in-out ${isAlert ? 'border-red-500 bg-red-500/10' : 'border-cyan-500 bg-cyan-500/5'}`}
           style={{ width: '80%', height: '80%' }}>
      </div>

      {/* Target (Headphones) */}
      <div 
        className={`absolute w-4 h-4 rounded-full transition-all duration-1000 ease-in-out ${isAlert ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]'}`}
        style={{
          transform: `translate(${(distance / radius) * 40}%, 0)`,
          opacity: 1
        }}
      >
        <div className="absolute inset-[-8px] border border-white/20 rounded-full animate-ping"></div>
      </div>

      {/* Origin (Base Station) */}
      <div className="absolute w-3 h-3 bg-white rounded-full z-10 shadow-lg"></div>

      {/* Labels */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-mono text-slate-500">
        GEOPROXIMITY RADAR
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
        <div className={`text-2xl font-bold font-mono ${isAlert ? 'text-red-500' : 'text-white'}`}>
          {distance.toFixed(1)}m
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">
          Current Separation
        </div>
      </div>
    </div>
  );
};

export default RadarMap;
