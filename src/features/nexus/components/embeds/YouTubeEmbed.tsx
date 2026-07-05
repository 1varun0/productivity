import { useState } from 'react';
import { Play, MonitorPlay, SplitSquareHorizontal } from 'lucide-react';
import { EmbedCard } from './EmbedCard';
import { useWorkspaceStore } from '../../workspace/useWorkspaceStore';

interface YouTubeEmbedProps {
  url: string;
  videoId: string;
  isWorkspaceMode?: boolean;
}

export function YouTubeEmbed({ url, videoId, isWorkspaceMode }: YouTubeEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const openPane = useWorkspaceStore(state => state.openPane);

  if (!videoId) {
    return <EmbedCard hasError fallbackText="Invalid YouTube URL" />;
  }

  return (
    <EmbedCard>
      {!isExpanded ? (
        <div 
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="w-full max-h-[65vh] mx-auto aspect-video relative flex flex-col items-center justify-center cursor-pointer group bg-[#0e0e0e]"
          style={{ width: 'auto', maxWidth: '100%' }}
        >
          <img 
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
            alt="YouTube video thumbnail"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('hqdefault')) {
                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }
            }}
            className="absolute inset-0 w-full h-full object-contain opacity-60 group-hover:opacity-80 transition-opacity duration-700"
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-[#ff0000]/80 group-hover:border-[#ff0000] group-hover:scale-110 transition-all duration-300 shadow-2xl">
              <Play className="text-white ml-1 w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" />
            </div>
          </div>
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
            <MonitorPlay className="text-[#ff0000]" size={14} />
            <span className="text-xs font-medium text-white/80">YouTube</span>
          </div>

          {!isWorkspaceMode && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openPane({ type: 'youtube', entityId: url }, undefined, 'horizontal');
              }}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white text-white/70 transition-all z-10"
              title="Open in Split Right"
            >
              <SplitSquareHorizontal size={16} />
            </button>
          )}
        </div>
      ) : (
        <div 
          className="w-full max-h-[65vh] mx-auto aspect-video relative bg-black"
          style={{ width: 'auto', maxWidth: '100%' }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`}
            title="YouTube video player"
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
    </EmbedCard>
  );
}
