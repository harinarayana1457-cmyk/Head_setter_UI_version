
import React, { useState } from 'react';

interface SecurityOverlayProps {
  onUnlock: (pin: string) => void;
  isAlert: boolean;
}

const SecurityOverlay: React.FC<SecurityOverlayProps> = ({ onUnlock, isAlert }) => {
  const [pinInput, setPinInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlock(pinInput);
    setPinInput('');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${isAlert ? 'bg-red-950/90 backdrop-blur-xl' : 'bg-slate-950/90 backdrop-blur-md'}`}>
      <div className="max-w-md w-full p-8 glass rounded-3xl text-center space-y-8 border-t-4 border-t-cyan-500">
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isAlert ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{isAlert ? 'THREAT DETECTED' : 'SYSTEM LOCKED'}</h2>
          <p className="text-slate-400">Enter your 4-digit PIN to manage security settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-4">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="bg-slate-900/50 border border-slate-700 text-white text-4xl tracking-[1em] text-center w-48 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              autoFocus
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            AUTHORIZE ACCESS
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityOverlay;
