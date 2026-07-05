import { useState } from 'react';
import { Play, ExternalLink, Smartphone, Video, SplitSquareHorizontal } from 'lucide-react';
import { EmbedCard } from './EmbedCard';
import { useNexusStore } from '../../store/useNexusStore';
import { useWorkspaceStore } from '../../workspace/useWorkspaceStore';

interface ReelEmbedProps {
  url: string;
  videoId?: string;
  provider?: 'youtube' | 'instagram' | 'tiktok' | 'uploaded';
  attachmentUrls?: Record<string, string>;
  isWorkspaceMode?: boolean;
}

export function ReelEmbed({ url, videoId, provider = 'uploaded', attachmentUrls: publicAttachmentUrls, isWorkspaceMode }: ReelEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const openPane = useWorkspaceStore(state => state.openPane);
  const storeAttachmentUrls = useNexusStore(state => state.attachmentUrls);
  const attachmentUrls = publicAttachmentUrls || storeAttachmentUrls;

  let finalUrl = url;
  let isAttachment = false;

  if (url.startsWith('attachment:')) {
    isAttachment = true;
    const id = url.replace('attachment:', '');
    finalUrl = attachmentUrls[id] || '';
  }

  if (isAttachment && !finalUrl) {
    return (
      <div className="w-full max-w-[280px] mx-auto">
        <EmbedCard>
          <div className="aspect-[9/16] w-full flex flex-col items-center justify-center text-white/30 text-sm bg-[#0e0e0e]">
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin mb-4" />
            <span className="text-xs">Resolving vertical video...</span>
          </div>
        </EmbedCard>
      </div>
    );
  }

  // Determine colors and branding based on provider
  const ProviderIcon = Smartphone;
  let providerName = 'Video';
  let brandColor = '#c5c0ff';
  
  if (provider === 'youtube') {
    providerName = 'Shorts';
    brandColor = '#ff0000';
  } else if (provider === 'instagram') {
    providerName = 'Reel';
    brandColor = '#e1306c';
  } else if (provider === 'tiktok') {
    providerName = 'TikTok';
    brandColor = '#00f2fe';
  }

  const renderThumbnail = () => {
    if (provider === 'youtube' && videoId) {
      return (
        <img 
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
          alt="Shorts thumbnail"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('hqdefault')) {
              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700 blur-[2px] group-hover:blur-0 scale-105"
        />
      );
    }
    
    // Generic abstract backgrounds for others
    const gradientClass = provider === 'instagram' 
      ? 'from-[#f58529]/20 via-[#dd2a7b]/20 to-[#8134af]/20'
      : provider === 'tiktok'
      ? 'from-[#25f4ee]/20 to-[#fe2c55]/20'
      : 'from-[#c5c0ff]/10 to-transparent';

    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
    );
  };

  const renderExpandedContent = () => {
    if (provider === 'youtube' && videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`}
          title="YouTube Shorts player"
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (provider === 'uploaded') {
      return (
        <video 
          src={finalUrl} 
          controls 
          className="w-full h-full object-contain bg-black"
          preload="metadata"
          autoPlay={true}
        />
      );
    }

    // Graceful Fallback for TikTok/Instagram (due to unpredictable iframes)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0e0e0e] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Video className="text-white/50 w-8 h-8" />
        </div>
        <h3 className="text-white font-medium mb-2 text-sm">Cannot Embed Directly</h3>
        <p className="text-white/40 text-xs mb-8 max-w-[200px]">
          {providerName} restricts inline playback. Open the link externally to view this content.
        </p>
        <a 
          href={finalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium transition-colors"
        >
          <ExternalLink size={14} />
          Open in {providerName}
        </a>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[280px] mx-auto my-6">
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
            className="w-full aspect-[9/16] relative flex flex-col items-center justify-center cursor-pointer group bg-[#0e0e0e] overflow-hidden"
          >
            {renderThumbnail()}
            
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div 
                className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-all duration-300 shadow-2xl"
                style={{ borderColor: `color-mix(in srgb, ${brandColor} 50%, transparent)` }}
              >
                <Play className="text-white ml-1 w-6 h-6 opacity-90 group-hover:opacity-100 transition-opacity" fill="currentColor" />
              </div>
            </div>
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 z-10">
              <ProviderIcon className="opacity-80" size={14} style={{ color: brandColor }} />
              <span className="text-[11px] font-medium text-white/80 tracking-wide uppercase">{providerName}</span>
            </div>

            {!isWorkspaceMode && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openPane({ type: 'reel', entityId: url }, undefined, 'horizontal');
                }}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white text-white/70 transition-all z-10"
                title="Open in Split Right"
              >
                <SplitSquareHorizontal size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full aspect-[9/16] relative bg-black overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {renderExpandedContent()}
          </div>
        )}
      </EmbedCard>
    </div>
  );
}
