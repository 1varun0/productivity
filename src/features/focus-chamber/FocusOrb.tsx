import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

interface FocusOrbProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  isReflecting?: boolean;
  onEndEarly?: () => void;
  isConfirmingExit?: boolean;
}

export function FocusOrb({ 
  timeLeft, 
  formatTime, 
  isPaused, 
  onPause, 
  onResume,
  isReflecting,
  onEndEarly,
  isConfirmingExit
}: FocusOrbProps) {
  const sunContainerRef = useRef<HTMLDivElement>(null);
  const sunGlowRef = useRef<HTMLDivElement>(null);
  const { extendFocusSession } = useStore();

  // Refs for distance-based luminosity
  const dockRef = useRef<HTMLDivElement>(null);
  const mAnchorRef = useRef<HTMLButtonElement>(null);
  const pAnchorRef = useRef<HTMLButtonElement>(null);

  // States for interactions
  const [activeTemporalAnchor, setActiveTemporalAnchor] = useState<'-' | '+' | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [kbFeedback, setKbFeedback] = useState<'pause' | 'end' | null>(null);
  
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHoldingExit, setIsHoldingExit] = useState(false);
  const [hasCollapsed, setHasCollapsed] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sunContainerRef.current) return;
      
      const sunRect = sunContainerRef.current.getBoundingClientRect();
      const sunCenterX = sunRect.left + sunRect.width / 2;
      const sunCenterY = sunRect.top + sunRect.height / 2;
      
      let mDistVal = Infinity;
      let pDistVal = Infinity;
      
      if (mAnchorRef.current) {
        const rect = mAnchorRef.current.getBoundingClientRect();
        mDistVal = Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2));
      }
      if (pAnchorRef.current) {
        const rect = pAnchorRef.current.getBoundingClientRect();
        pDistVal = Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2));
      }
      
      if (sunGlowRef.current && !hasCollapsed) {
        const dx = (e.clientX - sunCenterX) * 0.15;
        const dy = (e.clientY - sunCenterY) * 0.15;
        
        // Calculate localized pull for dynamic glow shift
        const leftPull = Math.max(0, 1 - (mDistVal / 180));
        const rightPull = Math.max(0, 1 - (pDistVal / 180));
        
        const glowX = 50 - (leftPull * 12) + (rightPull * 12);
        const glowY = 50 + (leftPull * 8) + (rightPull * 8);
        const baseIntensity = 0.45 + (leftPull * 0.1) + (rightPull * 0.2); // + gets brighter pull
        
        sunGlowRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(${1 + leftPull*0.03 + rightPull*0.05})`;
        sunGlowRef.current.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(6, 182, 212, ${baseIntensity}) 0%, transparent 70%)`;
      }

      if (isReflecting || isConfirmingExit) {
        [dockRef, mAnchorRef, pAnchorRef].forEach(ref => {
          if (ref.current) ref.current.style.opacity = '0';
        });
        return;
      }

      const updateLuminosity = (ref: React.RefObject<HTMLElement | null>, maxDist: number, baseOpacity: number, maxOpacity: number, precalculatedDist?: number) => {
        if (!ref.current) return;
        const dist = precalculatedDist !== undefined ? precalculatedDist : (() => {
          const rect = ref.current.getBoundingClientRect();
          return Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2));
        })();
        
        const normalized = Math.max(0, 1 - (dist / maxDist));
        const eased = normalized * normalized; 
        
        const opacity = baseOpacity + eased * (maxOpacity - baseOpacity);
        ref.current.style.opacity = opacity.toString();
      };

      updateLuminosity(dockRef, 350, 0.15, 1.0);
      
      // If a temporal anchor is open, keep it highly visible, else calculate normally
      if (activeTemporalAnchor === '-') {
        if (mAnchorRef.current) mAnchorRef.current.style.opacity = '0.9';
      } else {
        updateLuminosity(mAnchorRef, 280, 0.15, 0.85, mDistVal);
      }
      
      if (activeTemporalAnchor === '+') {
        if (pAnchorRef.current) pAnchorRef.current.style.opacity = '0.9';
      } else {
        updateLuminosity(pAnchorRef, 280, 0.15, 0.85, pDistVal);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isReflecting, isConfirmingExit, activeTemporalAnchor, hasCollapsed]);

  // Global Key Listener for Temporal Custom Mode
  useEffect(() => {
    if (!isCustomMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCustomMode(false);
        setCustomInputText('');
        return;
      }
      if (e.key === 'Enter') {
        const val = parseInt(customInputText);
        if (!isNaN(val)) {
          const sign = activeTemporalAnchor === '-' ? -1 : 1;
          extendFocusSession(val * sign);
        }
        setIsCustomMode(false);
        setCustomInputText('');
        setActiveTemporalAnchor(null);
        return;
      }
      if (e.key === 'Backspace') {
        setCustomInputText(prev => prev.slice(0, -1));
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        setCustomInputText(prev => prev + e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCustomMode, customInputText, activeTemporalAnchor, extendFocusSession]);

  // Global Key Listener for Session Controls
  useEffect(() => {
    if (isCustomMode) return; 
    if (isConfirmingExit) return;

    const handleSessionKeys = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault(); 
        isPaused ? onResume() : onPause();
        setKbFeedback('pause');
        setTimeout(() => setKbFeedback(null), 350);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onEndEarly?.();
        setKbFeedback('end');
        setTimeout(() => setKbFeedback(null), 350);
      }
    };
    window.addEventListener('keydown', handleSessionKeys);
    return () => window.removeEventListener('keydown', handleSessionKeys);
  }, [isCustomMode, isPaused, onResume, onPause, onEndEarly, isConfirmingExit]);

  // Hold to End Ritual Logic
  const startHold = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsHoldingExit(true);
    holdTimeoutRef.current = setTimeout(() => {
      setHasCollapsed(true);
      setTimeout(() => {
        onEndEarly?.();
        setHasCollapsed(false);
        setIsHoldingExit(false);
      }, 500); // Wait for collapse animation before opening panel
    }, 1500);
  };

  const cancelHold = () => {
    if (hasCollapsed) return; 
    setIsHoldingExit(false);
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
  };

  const handleTemporalClick = (type: '-' | '+') => {
    if (activeTemporalAnchor === type) {
      setActiveTemporalAnchor(null);
      setIsCustomMode(false);
    } else {
      setActiveTemporalAnchor(type);
      setIsCustomMode(false);
      setCustomInputText('');
    }
  };

  const handlePresetClick = (val: number, multiplier = 1) => {
    const sign = activeTemporalAnchor === '-' ? -1 : 1;
    extendFocusSession(val * multiplier * sign);
    setActiveTemporalAnchor(null);
  };

  const isOrbDimmed = isHoldingExit || hasCollapsed;

  return (
    <>
      <style>
        {`
          .sun-container {
              position: relative;
              width: 240px;
              height: 240px;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10;
              transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
              transform: ${hasCollapsed ? 'scale(0.8)' : isHoldingExit ? 'scale(0.95)' : 'scale(1)'};
          }
          .sun-glow-layer {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.45) 0%, transparent 70%);
              filter: blur(20px);
              pointer-events: none;
              transition: opacity 1s ease, transform 0.1s ease-out;
              opacity: ${hasCollapsed ? 0 : isHoldingExit ? 0.2 : isReflecting ? 0.1 : 0.6};
          }
          .sun {
              width: 240px;
              height: 240px;
              border-radius: 50%;
              background: #0f0f0f;
              box-shadow: ${isReflecting ? 'inset 0 0 10px rgba(6, 182, 212, 0.05), 0 0 5px rgba(6, 182, 212, 0.02)' : 'inset 0 0 40px rgba(6, 182, 212, 0.12), 0 0 20px rgba(6, 182, 212, 0.06)'};
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              z-index: 11;
              transition: box-shadow 1.5s ease, border-color 1.5s ease;
              cursor: pointer;
              border: 1px solid rgba(6, 182, 212, 0.15);
          }
          .timer-text {
              font-family: 'Inter', sans-serif;
              font-size: 56px;
              font-weight: 300;
              letter-spacing: -1px;
              color: #ffffff;
              text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
              z-index: 12;
              opacity: ${isReflecting ? 0 : 1};
              transition: opacity 2s ease, filter 0.8s ease;
              filter: ${isOrbDimmed ? 'blur(6px)' : 'blur(0px)'};
          }
          
          @keyframes drift1 {
              0%, 100% { transform: translate(0px, 0px); }
              50% { transform: translate(1px, -3px); }
          }
          @keyframes drift2 {
              0%, 100% { transform: translate(0px, 0px); }
              50% { transform: translate(-2px, 2px); }
          }
          @keyframes drift3 {
              0%, 100% { transform: translate(0px, 0px); }
              50% { transform: translate(2px, 1.5px); }
          }
          @keyframes sunPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
          }
          .animate-sun-pulse { 
              animation: sunPulse 6s ease-in-out infinite; 
          }
          
          .orb-control {
              position: absolute;
              z-index: 20;
              opacity: 0; 
              transition: color 0.5s ease, opacity 0.5s ease-out, background 0.5s ease, box-shadow 0.5s ease, transform 0.3s ease;
          }

          /* Ritual Square Animation */
          @keyframes plasmaFill {
            0% { box-shadow: inset 0 0 0 rgba(255, 60, 0, 0); border-color: rgba(255,255,255,0.3); }
            100% { box-shadow: inset 0 0 20px rgba(255, 60, 0, 0.6), 0 0 15px rgba(255, 60, 0, 0.4); border-color: rgba(255, 60, 0, 0.8); }
          }
          @keyframes destabilize {
            0%, 100% { transform: translate(0,0) rotate(0deg); }
            25% { transform: translate(0.5px, -0.5px) rotate(0.5deg); }
            50% { transform: translate(-0.5px, 0.5px) rotate(-0.5deg); }
            75% { transform: translate(-0.5px, -0.5px) rotate(0deg); }
          }
          .ritual-holding {
            animation: plasmaFill 1.5s ease-in forwards, destabilize 0.1s linear infinite;
          }
        `}
      </style>
      <div className="sun-container" ref={sunContainerRef}>
        <div className="sun-glow-layer" ref={sunGlowRef} />
        <div 
          className={`sun ${!isPaused ? 'animate-sun-pulse' : ''}`} 
          onClick={isPaused ? onResume : onPause}
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
        >
          <div className="timer-text">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Bottom Control Dock */}
        <div 
          ref={dockRef}
          className={`orb-control flex items-center justify-between px-2 py-1 rounded-full backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:bg-black/60 hover:backdrop-blur-2xl hover:border-white/10 ${
            kbFeedback === 'pause' ? 'shadow-[0_0_25px_rgba(6,182,212,0.4)] border-cyan-500/30 bg-black/60 !opacity-100 scale-105 -translate-y-1.5' : 
            kbFeedback === 'end' ? 'shadow-[0_0_25px_rgba(248,113,113,0.4)] border-red-500/30 bg-black/60 !opacity-100 scale-105 -translate-y-1.5' : 
            'bg-black/30 border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.3),inset_0_0_15px_rgba(255,255,255,0.01)]'
          }`}
          style={{ bottom: '-130px', margin: '0 auto', left: 0, right: 0, width: '135px' }}
        >
          {/* Play/Pause Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); isPaused ? onResume() : onPause(); }}
            className={`flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all duration-300 active:scale-95 group ${
              !isPaused || kbFeedback === 'pause'
                ? 'text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/40 hover:text-cyan-100 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
                : 'text-white/60 hover:text-cyan-300 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            } ${kbFeedback === 'pause' ? 'bg-cyan-900/40 text-cyan-100' : ''}`}
          >
            <div className="flex items-center justify-center h-6 mt-0.5">
              {isPaused ? <Play size={18} fill="currentColor" strokeWidth={1} className="ml-0.5" /> : <Pause size={18} fill="currentColor" strokeWidth={1} />}
            </div>
            <span className="text-[7.5px] font-mono tracking-widest text-cyan-400/40 uppercase group-hover:text-cyan-400/70 transition-colors mb-0.5">
              space
            </span>
          </button>
          
          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          
          {/* End Session Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onEndEarly?.(); }}
            className={`flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all duration-300 active:scale-95 group hover:text-red-400 hover:bg-red-950/30 hover:shadow-[0_0_20px_rgba(248,113,113,0.4)] ${
              kbFeedback === 'end' ? 'text-red-400 bg-red-950/30 shadow-[0_0_20px_rgba(248,113,113,0.4)]' : 'text-white/50'
            }`}
          >
            <div className="flex items-center justify-center h-6 mt-0.5">
              <Square size={13} fill="currentColor" strokeWidth={1} />
            </div>
            <span className="text-[7.5px] font-mono tracking-widest text-red-400/40 uppercase group-hover:text-red-400/70 transition-colors mb-0.5">
              esc
            </span>
          </button>
        </div>

        {/* Temporal Anchor: Plus (Lower-Right Edge) */}
        <button 
          ref={pAnchorRef}
          onClick={(e) => { e.stopPropagation(); handleTemporalClick('+'); }} 
          style={{ animation: 'drift1 8.5s ease-in-out infinite reverse', right: '-60px', top: '130px' }}
          className="orb-control flex items-center justify-center w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-950/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-110 active:scale-95 text-[22px] font-mono font-light"
        >
          +
        </button>

        {/* Temporal Anchor: Minus (Directly below Plus) */}
        <button 
          ref={mAnchorRef}
          onClick={(e) => { e.stopPropagation(); handleTemporalClick('-'); }} 
          style={{ animation: 'drift2 9s ease-in-out infinite', right: '-60px', top: '190px' }}
          className="orb-control flex items-center justify-center w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-950/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-110 active:scale-95 text-[22px] font-mono font-light"
        >
          −
        </button>

        {/* Constellation for Minus */}
        <AnimatePresence>
          {activeTemporalAnchor === '-' && !isCustomMode && (
            <>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); handlePresetClick(1); }} className="absolute z-20 text-[9px] font-mono text-white hover:text-cyan-400 hover:scale-110 transition-all duration-300" style={{ right: '-100px', top: '250px', animation: 'drift3 6s infinite reverse' }}>1m</motion.button>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); handlePresetClick(5); }} className="absolute z-20 text-[9px] font-mono text-white hover:text-cyan-400 hover:scale-110 transition-all duration-300" style={{ right: '-120px', top: '220px', animation: 'drift1 7s infinite' }}>5m</motion.button>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); handlePresetClick(10); }} className="absolute z-20 text-[9px] font-mono text-white hover:text-cyan-400 hover:scale-110 transition-all duration-300" style={{ right: '-130px', top: '185px', animation: 'drift2 8s infinite' }}>10m</motion.button>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); setIsCustomMode(true); }} className="absolute z-20 text-[9px] font-mono text-white/70 hover:text-cyan-400 hover:scale-110 transition-all duration-300" style={{ right: '-110px', top: '150px', animation: 'drift3 9s infinite' }}>custom</motion.button>
            </>
          )}
          {activeTemporalAnchor === '-' && isCustomMode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: -10 }} 
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0, 
                borderColor: 'rgba(6, 182, 212, 0.5)',
                boxShadow: '0 0 20px rgba(6,182,212,0.3), inset 0 0 8px rgba(6,182,212,0.15)'
              }} 
              exit={{ opacity: 0, scale: 0.9, x: -10 }} 
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute z-30 flex items-center px-4 py-2.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/10"
              style={{ right: '-200px', top: '190px' }}
            >
              <span className="text-[16px] font-mono text-cyan-400 mr-2 font-light">−</span>
              <div className="flex items-center min-w-[50px]">
                {customInputText ? (
                  <div className="flex items-baseline">
                    <span className="text-[16px] font-mono text-white font-semibold tracking-wider">
                      {customInputText}
                    </span>
                    <span className="text-[13px] font-sans text-cyan-400/80 italic ml-1 font-light tracking-wide">min</span>
                  </div>
                ) : (
                  <span className="text-[14px] font-sans text-cyan-400/50 italic font-light tracking-wide">
                    min
                  </span>
                )}
                <span className="w-[2px] h-4 bg-cyan-400 ml-1.5 animate-pulse rounded-full shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
              </div>
              <div className="absolute -bottom-6 left-0 right-0 text-center text-[9px] text-white/40 font-sans tracking-widest uppercase">
                press enter
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Constellation for Plus */}
        <AnimatePresence>
          {activeTemporalAnchor === '+' && !isCustomMode && (
            <>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); handlePresetClick(1); }} className="absolute z-20 text-[9px] font-mono text-white hover:text-cyan-400 hover:scale-110 transition-all duration-300" style={{ right: '-100px', top: '70px', animation: 'drift2 8s infinite reverse' }}>1m</motion.button>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); handlePresetClick(5); }} className="absolute z-20 text-[9px] font-mono text-white hover:text-cyan-400 hover:scale-110 transition-all duration-300" style={{ right: '-120px', top: '100px', animation: 'drift3 7s infinite' }}>5m</motion.button>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); handlePresetClick(10); }} className="absolute z-20 text-[9px] font-mono text-white hover:text-cyan-400 hover:scale-110 transition-all duration-300" style={{ right: '-130px', top: '135px', animation: 'drift1 6s infinite' }}>10m</motion.button>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); setIsCustomMode(true); }} className="absolute z-20 text-[9px] font-mono text-white/70 hover:text-cyan-400 hover:scale-110 transition-all duration-300" style={{ right: '-110px', top: '170px', animation: 'drift2 9s infinite' }}>custom</motion.button>
            </>
          )}
          {activeTemporalAnchor === '+' && isCustomMode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: -10 }} 
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0, 
                borderColor: 'rgba(6, 182, 212, 0.5)',
                boxShadow: '0 0 20px rgba(6,182,212,0.3), inset 0 0 8px rgba(6,182,212,0.15)'
              }} 
              exit={{ opacity: 0, scale: 0.9, x: -10 }} 
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute z-30 flex items-center px-4 py-2.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/10"
              style={{ right: '-200px', top: '130px' }}
            >
              <span className="text-[16px] font-mono text-cyan-400 mr-2 font-light">+</span>
              <div className="flex items-center min-w-[50px]">
                {customInputText ? (
                  <div className="flex items-baseline">
                    <span className="text-[16px] font-mono text-white font-semibold tracking-wider">
                      {customInputText}
                    </span>
                    <span className="text-[13px] font-sans text-cyan-400/80 italic ml-1 font-light tracking-wide">min</span>
                  </div>
                ) : (
                  <span className="text-[14px] font-sans text-cyan-400/50 italic font-light tracking-wide">
                    min
                  </span>
                )}
                <span className="w-[2px] h-4 bg-cyan-400 ml-1.5 animate-pulse rounded-full shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
              </div>
              <div className="absolute -bottom-6 left-0 right-0 text-center text-[9px] text-white/40 font-sans tracking-widest uppercase">
                press enter
              </div>
            </motion.div>
          )}
        </AnimatePresence>



      </div>
    </>
  );
}
