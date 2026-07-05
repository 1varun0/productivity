import { useEffect } from 'react';
import type { FocusMode } from '@/store/useStore';

interface OrbitalSystemProps {
  onPlanetClick: (mode: FocusMode) => void;
  isReflecting?: boolean;
}

export function OrbitalSystem({ onPlanetClick, isReflecting }: OrbitalSystemProps) {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const planets = document.querySelectorAll('.planet');
      planets.forEach(p => {
        const planet = p as HTMLElement;
        const rect = planet.getBoundingClientRect();
        const pCenterX = rect.left + rect.width / 2;
        const pCenterY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - pCenterX, e.clientY - pCenterY);
        
        if (dist < 150) {
            const pullX = (e.clientX - pCenterX) * 0.12;
            const pullY = (e.clientY - pCenterY) * 0.12;
            planet.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.15)`;
        } else {
            planet.style.transform = '';
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <style>
        {`
          .celestial-system {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 5;
              display: flex;
              align-items: center;
              justify-content: center;
          }
          .orbit {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              border: none;
              border-radius: 50%;
              pointer-events: none;
          }
          .orbit-1 { width: 380px; height: 380px; }
          .orbit-2 { width: 520px; height: 520px; }
          .orbit-3 { width: 680px; height: 680px; }
          .orbit-4 { width: 840px; height: 840px; }
          .orbit-5 { width: 1000px; height: 1000px; }

          .planet-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
          }
          .planet {
              position: absolute;
              border-radius: 50%;
              pointer-events: auto;
              cursor: pointer;
              transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
          }
          .planet-p1 {
              width: 14px; height: 14px; top: -7px; left: calc(50% - 7px);
              background: radial-gradient(circle at 30% 30%, #8a7a6c, #4a3f35, #1a1613);
              box-shadow: inset -2px -2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(138, 122, 108, 0.2);
          }
          .planet-p2 {
              width: 22px; height: 22px; top: calc(50% - 11px); right: -11px;
              background: radial-gradient(circle at 40% 40%, #e3bb76 0%, #a37c5b 50%, #5c3a21 100%);
              box-shadow: inset -4px -4px 8px rgba(0,0,0,0.8), 0 0 15px rgba(227, 187, 118, 0.2);
          }
          .planet-p3 {
              width: 18px; height: 18px; bottom: -9px; left: calc(50% - 9px);
              background: radial-gradient(circle at 35% 35%, #7dd3fc 0%, #0284c7 60%, #082f49 100%);
              box-shadow: inset -3px -3px 6px rgba(0,0,0,0.8), 0 0 12px rgba(125, 211, 252, 0.2);
          }
          .planet-p4 {
              width: 28px; height: 28px; top: calc(50% - 14px); left: -14px;
              background: radial-gradient(circle at 40% 40%, #d4d4d8 0%, #71717a 50%, #27272a 100%);
              box-shadow: inset -5px -5px 10px rgba(0,0,0,0.8), 0 0 15px rgba(212, 212, 216, 0.2);
          }
          .planet-p5 {
              width: 20px; height: 20px; top: -10px; left: calc(50% - 10px);
              background: radial-gradient(circle at 30% 30%, #fca5a5 0%, #dc2626 60%, #450a0a 100%);
              box-shadow: inset -4px -4px 8px rgba(0,0,0,0.8), 0 0 12px rgba(252, 165, 165, 0.2);
          }
          .planet:hover { transform: scale(1.4); }

          @keyframes rawOrbit {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
          }
          .animate-orbit-1 { animation: rawOrbit ${isReflecting ? '180s' : '60s'} linear infinite; }
          .animate-orbit-2 { animation: rawOrbit ${isReflecting ? '300s' : '105s'} linear infinite; }
          .animate-orbit-3 { animation: rawOrbit ${isReflecting ? '450s' : '150s'} linear infinite; }
          .animate-orbit-4 { animation: rawOrbit ${isReflecting ? '600s' : '210s'} linear infinite; }
          .animate-orbit-5 { animation: rawOrbit ${isReflecting ? '900s' : '300s'} linear infinite; }
        `}
      </style>
      <div className="celestial-system pointer-events-none">
        <div className="orbit orbit-5">
          <div className="planet-container animate-orbit-5">
            <div className="planet planet-p5" title="Deep Focus" onClick={() => onPlanetClick('reflection')} />
          </div>
        </div>
        <div className="orbit orbit-4">
          <div className="planet-container animate-orbit-4">
            <div className="planet planet-p4" title="Expansion" onClick={() => onPlanetClick('expansion')} />
          </div>
        </div>
        <div className="orbit orbit-3">
          <div className="planet-container animate-orbit-3">
            <div className="planet planet-p3" title="Deep Work" onClick={() => onPlanetClick('deep-work')} />
          </div>
        </div>
        <div className="orbit orbit-2">
          <div className="planet-container animate-orbit-2">
            <div className="planet planet-p2" title="Creative Flow" onClick={() => onPlanetClick('creative-flow')} />
          </div>
        </div>
        <div className="orbit orbit-1">
          <div className="planet-container animate-orbit-1">
            <div className="planet planet-p1" title="Quick Task" onClick={() => onPlanetClick('quick-task')} />
          </div>
        </div>
      </div>
    </>
  );
}
