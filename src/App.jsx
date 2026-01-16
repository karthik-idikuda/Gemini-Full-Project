import React from 'react';
import Experience from './components/Experience';
import WebcamOverlay from './components/WebcamOverlay';
import HUD from './components/HUD';

function App() {
  return (
    <div className="relative w-full h-screen bg-[#00050a] overflow-hidden">
      <Experience />
      
      {/* UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <HUD />
        
        {/* Top Right: System Label & Video Feed */}
        <div className="absolute top-8 right-8 flex flex-col items-end gap-4 pointer-events-auto">
             <WebcamOverlay />
             <div className="text-right">
                <div className="text-[10px] font-mono text-cyan-500/50 mb-1 tracking-[0.3em]">HOLOGRAPHIC_PROJECTION_V3</div>
                <div className="text-[10px] font-mono text-cyan-500/30">ENCRYPTION: AES-256</div>
            </div>
        </div>

        {/* Top Left: Gemini Brand */}
        <div className="absolute top-8 left-8 pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 border-l-2 border-cyan-500 rounded-r-lg">
                <h1 className="text-2xl font-mono font-black text-cyan-400 tracking-tighter glow-text">GEMINI_OS</h1>
                <div className="text-[8px] text-cyan-200/50 uppercase tracking-[0.5em]">Neural Link Status: Stable</div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
