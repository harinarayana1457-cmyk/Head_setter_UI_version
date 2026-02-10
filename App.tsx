
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SecurityState, SecurityInsight, Location } from './types';
import { getSecurityInsight } from './services/geminiService';
import RadarMap from './components/RadarMap';
import SecurityOverlay from './components/SecurityOverlay';

const App: React.FC = () => {
  const [state, setState] = useState<SecurityState>({
    isLocked: false,
    pin: '1234', // Default for demo
    baseLocation: null,
    currentLocation: null,
    fenceRadius: 50, // Meters
    alertTriggered: false,
  });

  const [insight, setInsight] = useState<SecurityInsight | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);

  // Initialize Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setState(prev => ({ ...prev, baseLocation: loc, currentLocation: loc }));
          setLoading(false);
        },
        (err) => {
          console.error("Location error", err);
          alert("AuraLock requires Geolocation to function. Please enable it.");
        }
      );
    }
  }, []);

  // Track Location and Trigger Alert
  useEffect(() => {
    if (state.baseLocation && !watchIdRef.current) {
      watchIdRef.current = navigator.geolocation.watchPosition((pos) => {
        const currentLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setState(prev => {
          const distance = calculateDistance(prev.baseLocation, currentLoc);
          const alert = distance > prev.fenceRadius;
          return { ...prev, currentLocation: currentLoc, alertTriggered: alert };
        });
      }, (err) => console.error(err), { enableHighAccuracy: true });
    }
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [state.baseLocation]);

  // AI Security Analysis
  useEffect(() => {
    const fetchInsight = async () => {
      if (state.currentLocation) {
        const res = await getSecurityInsight(state);
        setInsight(res);
      }
    };
    const timer = setInterval(fetchInsight, 10000); // Check every 10s
    fetchInsight();
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.alertTriggered, state.isLocked]);

  const calculateDistance = (loc1: Location | null, loc2: Location | null): number => {
    if (!loc1 || !loc2) return 0;
    const R = 6371e3;
    const φ1 = loc1.latitude * Math.PI/180;
    const φ2 = loc2.latitude * Math.PI/180;
    const Δφ = (loc2.latitude-loc1.latitude) * Math.PI/180;
    const Δλ = (loc2.longitude-loc1.longitude) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleUnlock = (enteredPin: string) => {
    if (enteredPin === state.pin) {
      setIsAuthorizing(false);
      setState(prev => ({ ...prev, alertTriggered: false, isLocked: false }));
    } else {
      alert("Invalid PIN. Access Denied.");
    }
  };

  const setBaseStation = () => {
    setState(prev => ({ ...prev, baseLocation: prev.currentLocation }));
  };

  const toggleLock = () => {
    if (!state.isLocked) {
      setState(prev => ({ ...prev, isLocked: true }));
    } else {
      setIsAuthorizing(true);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-500 font-mono tracking-widest uppercase">Initializing Secure Link...</p>
        </div>
      </div>
    );
  }

  const currentDistance = calculateDistance(state.baseLocation, state.currentLocation);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Authorization Layer */}
      {(isAuthorizing || state.alertTriggered) && (
        <SecurityOverlay onUnlock={handleUnlock} isAlert={state.alertTriggered} />
      )}

      {/* Header */}
      <header className="p-6 flex justify-between items-center glass sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-950" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AuraLock</h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${state.alertTriggered ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                {state.alertTriggered ? 'Theft Detected' : 'Monitoring Active'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={toggleLock}
          className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all ${state.isLocked ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-cyan-500 text-slate-950'}`}
        >
          {state.isLocked ? 'SYSTEM ARMED' : 'ARM SYSTEM'}
        </button>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
        
        {/* Proximity Radar */}
        <section className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <button 
               onClick={setBaseStation}
               className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-md text-slate-300 font-mono border border-slate-700 transition-colors"
             >
               RESET ORIGIN
             </button>
          </div>
          <RadarMap distance={currentDistance} radius={state.fenceRadius} isAlert={state.alertTriggered} />
        </section>

        {/* Security Info & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AI Insights */}
          <section className="glass rounded-3xl p-6 flex flex-col justify-between min-h-[200px] border-l-4 border-l-purple-500">
            <div>
              <h3 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-4">Aura Intelligence</h3>
              <p className="text-xl font-medium leading-relaxed">
                {insight?.message || "Analyzing environment safety..."}
              </p>
            </div>
            {insight?.advice && (
              <div className="mt-4 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <p className="text-xs text-purple-200">
                  <span className="font-bold">PRO TIP:</span> {insight.advice}
                </p>
              </div>
            )}
          </section>

          {/* Settings Section */}
          <section className="glass rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Fence Configuration</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>GEOFENCE RADIUS</span>
                <span className="text-cyan-400 font-mono">{state.fenceRadius}m</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="500" 
                step="5"
                value={state.fenceRadius} 
                onChange={(e) => setState(prev => ({ ...prev, fenceRadius: parseInt(e.target.value) }))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                 <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Status</div>
                 <div className="text-sm font-bold">{state.isLocked ? 'Locked' : 'Open'}</div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                 <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">PIN Type</div>
                 <div className="text-sm font-bold">4-Digit Auth</div>
              </div>
            </div>
          </section>
        </div>

        {/* Device Info */}
        <section className="p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold">Active Device: Wireless Audio Node</h4>
              <p className="text-xs text-slate-500">Tracking via High-Precision Differential GPS</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer / Branding */}
      <footer className="p-8 text-center text-slate-600 text-[10px] font-mono tracking-widest uppercase">
        Protected by AuraLock Quantum Security v4.2.1
      </footer>
    </div>
  );
};

export default App;
