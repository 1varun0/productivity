import { useState, useRef, useEffect, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmbedCardProps {
  children?: ReactNode;
  fallbackText?: string;
  hasError?: boolean;
}

export function EmbedCard({ children, fallbackText = "Embed could not be loaded", hasError = false }: EmbedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      { rootMargin: '600px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (hasError) {
    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className="my-6 w-full rounded-2xl border border-[#ffb4ab]/20 bg-[#ffb4ab]/5 p-4 flex items-center gap-3 text-[#ffb4ab]/80 text-sm"
      >
        <AlertTriangle size={16} />
        {fallbackText}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className="my-6 w-full min-h-[100px] rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-2xl transition-all duration-500 hover:bg-white/[0.03] hover:border-white/20 group relative"
    >
      {isVisible ? children : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
