import { memo, useMemo } from 'react';

interface Star {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  initialOpacity: number;
}

const Starfield = () => {
  const stars = useMemo<Star[]>(() => {
    const generated: Star[] = [];
    const starCount = 700; // Decreased count for a cleaner look
    for (let i = 0; i < starCount; i++) {
      generated.push({
        id: i,
        size: Math.random() * 1.5 + 0.6, // Reduced size
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 2 + Math.random() * 4,
        delay: Math.random() * 5,
        initialOpacity: 0.2 + Math.random() * 0.4, // Reduced base opacity
      });
    }
    return generated;
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes rawTwinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.9); box-shadow: none; }
            50% { opacity: 0.7; transform: scale(1.1); box-shadow: 0 0 2px rgba(255,255,255,0.3); }
          }
        `}
      </style>
      <div 
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden" 
        style={{ backgroundColor: '#0f0f0f' }}
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full pointer-events-none"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.x}%`,
              top: `${star.y}%`,
              opacity: star.initialOpacity,
              animation: `rawTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite alternate`
            }}
          />
        ))}
      </div>
    </>
  );
};

export const SpaceBackground = memo(Starfield);
