import React, { useState, useEffect } from 'react';
import HandManager from '../utils/HandManager';

const HUD = () => {
    const [handState, setHandState] = useState('SEARCHING...');
    const [coords, setCoords] = useState({ x: 0, y: 0, z: 0 });
    const [stats, setStats] = useState({ cpu: 12, mem: 42 });

    useEffect(() => {
        const interval = setInterval(() => {
            const data = HandManager.getHandData();
            if (data) {
                if (data.isPinching) setHandState('PINCH ACTIVE');
                else setHandState('TRACKING');
                
                setCoords({
                    x: (data.x - 0.5).toFixed(3),
                    y: (data.y - 0.5).toFixed(3),
                    z: (data.pinchDist * 10).toFixed(3)
                });
            } else {
                setHandState('SEARCHING...');
            }
            
            // Dummy jitter for sci-fi feel
            setStats({
                cpu: 10 + Math.floor(Math.random() * 5),
                mem: 40 + Math.floor(Math.random() * 3)
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none font-mono text-cyan-400 p-8 select-none">
            {/* Top Right: System Status */}
            <div className="absolute top-8 right-8 text-right flex flex-col gap-1">
                <div className="text-[10px] opacity-60">SYSTEM_DIAGNOSTICS</div>
                <div className="text-sm tracking-wider">CPU_LOAD: {stats.cpu}%</div>
                <div className="text-sm tracking-wider">MEM_USAGE: {stats.mem}%</div>
                <div className="w-24 h-1 bg-cyan-900 mt-1 self-end">
                    <div className="h-full bg-cyan-500 animate-[pulse_2s_infinite]" style={{ width: stats.cpu + '%' }} />
                </div>
            </div>

            {/* Bottom Left: Tracking Telemetry */}
            <div className="absolute bottom-8 left-8 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${handState === 'SEARCHING...' ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`} />
                    <span className="text-lg tracking-[0.2em] font-bold">{handState}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-80 border-l border-cyan-500/30 pl-3">
                    <span>X_AXIS:</span> <span className="text-cyan-200">{coords.x}</span>
                    <span>Y_AXIS:</span> <span className="text-cyan-200">{coords.y}</span>
                    <span>Z_DEPTH:</span> <span className="text-cyan-200">{coords.z}</span>
                    <span>PARALLAX:</span> <span className="text-cyan-200">ACTIVE</span>
                </div>
            </div>

            {/* Center Reticle Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-500/10 rounded-full scale-150 opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-px bg-cyan-500/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-px bg-cyan-500/40" />

            {/* Scanning Bar Animation */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-[scan_4s_linear_infinite]" />

            <style jsx>{`
                @keyframes scan {
                    from { top: 0%; opacity: 0; }
                    50% { opacity: 0.5; }
                    to { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default HUD;
