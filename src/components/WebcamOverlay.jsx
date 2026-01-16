import React, { useEffect, useRef, useState } from 'react';
import HandManager from '../utils/HandManager';

const WebcamOverlay = () => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const checkVideo = setInterval(() => {
            if (HandManager.video && HandManager.video.readyState >= 2) {
                videoRef.current.srcObject = HandManager.video.srcObject;
                setIsActive(true);
                clearInterval(checkVideo);
            }
        }, 500);

        return () => clearInterval(checkVideo);
    }, []);

    return (
        <div 
            ref={containerRef}
            className={`relative overflow-hidden rounded-xl border-2 border-cyan-500/30 bg-black/40 backdrop-blur-md transition-all duration-700 shadow-[0_0_20px_rgba(6,182,212,0.15)] ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ width: '180px', height: '135px' }}
        >
            <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover scale-x-[-1] opacity-70"
            />
            
            {/* HUD Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            {/* Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-400" />
            
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-mono text-cyan-400 tracking-tighter uppercase">LINK: ACTIVE</span>
            </div>
            
            <div className="absolute top-2 right-2 flex flex-col items-end">
                <span className="text-[8px] font-mono text-cyan-500/60 uppercase">CAM_FEED_01</span>
                <span className="text-[8px] font-mono text-cyan-500/60 uppercase">RES: 720p</span>
            </div>
        </div>
    );
};

export default WebcamOverlay;
