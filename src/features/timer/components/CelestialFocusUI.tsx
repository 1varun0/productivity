import { useEffect, useRef, useState, useMemo } from 'react';

interface CelestialFocusUIProps {
  timeLeft: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export function CelestialFocusUI({
  timeLeft, isPaused, onPause, onResume
}: CelestialFocusUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const isReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Starfield Canvas Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2,
      alpha: Math.random() * 0.5,
      speed: Math.random() * 0.01 + 0.002
    }));

    const drawStars = () => {
      ctx.clearRect(0, 0, width, height);
      
      const offsetX = isReducedMotion ? 0 : ((mousePos.x || width / 2) - width / 2) * 0.01;
      const offsetY = isReducedMotion ? 0 : ((mousePos.y || height / 2) - height / 2) * 0.01;

      stars.forEach(star => {
        if (!isReducedMotion) {
          star.alpha += star.speed;
          if (star.alpha > 0.5 || star.alpha < 0.05) star.speed = -star.speed;
        }

        ctx.beginPath();
        let sx = star.x - offsetX * (star.radius * 2);
        let sy = star.y - offsetY * (star.radius * 2);
        
        if (sx < 0) sx += width;
        if (sx > width) sx -= width;
        if (sy < 0) sy += height;
        if (sy > height) sy -= height;

        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawStars);
    };
    
    drawStars();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos, isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isReducedMotion]);

  const staticStars = useMemo(() => {
    return Array.from({ length: 200 }).map((_, i) => {
      const size = Math.random() * 1.2 + 0.5;
      const willTwinkle = Math.random() > 0.8;
      return (
        <div
          key={`star-${i}`}
          className={`absolute rounded-full bg-white ${willTwinkle && !isReducedMotion ? 'animate-twinkle' : ''}`}
          style={{
            width: size, height: size,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.3 + 0.1,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 4 + 3}s`
          }}
        />
      );
    });
  }, [isReducedMotion]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;
  const dist = Math.sqrt(Math.pow(mousePos.x - cx, 2) + Math.pow(mousePos.y - cy, 2));
  const maxDist = Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2));
  const proximity = isReducedMotion ? 0 : Math.max(0, 1 - (dist / maxDist));

  const baseGlow = `inset 0 0 10px rgba(0, 229, 255, 0.02), 0 0 20px rgba(0, 229, 255, 0.03)`;
  const dynamicGlow = `0 0 ${20 + proximity * 20}px rgba(0, 229, 255, ${0.01 + proximity * 0.02})`;

  return (
    <div className="absolute inset-0 z-0 bg-transparent text-white overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-60" />
      <div className="absolute inset-0 pointer-events-none z-0">{staticStars}</div>

      {/* Central Sun Timer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-20 pointer-events-auto">
        <div 
          className={`w-[220px] h-[220px] rounded-full flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-[1.02] ${!isPaused && !isReducedMotion ? 'animate-sun-pulse' : ''}`}
          style={{
            background: 'radial-gradient(circle at 50% 50%, #030303 40%, rgba(0, 229, 255, 0.02) 80%, rgba(0, 229, 255, 0.08) 100%)',
            boxShadow: `${baseGlow}, ${dynamicGlow}`,
            border: '1px solid rgba(0, 229, 255, 0.05)'
          }}
          onClick={isPaused ? onResume : onPause}
        >
          <span className={`font-sans font-extralight tracking-tight text-[56px] text-white/90 ${!isPaused && !isReducedMotion ? 'animate-text-breathe' : ''}`} style={{ textShadow: '0 0 8px rgba(0, 229, 255, 0.1)' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}
