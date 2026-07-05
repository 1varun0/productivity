import { useState } from 'react';
import { Play, Video, SplitSquareHorizontal } from 'lucide-react';
import { EmbedCard } from './EmbedCard';
import { useNexusStore } from '../../store/useNexusStore';
import { useWorkspaceStore } from '../../workspace/useWorkspaceStore';

interface VideoEmbedProps {
  url: string;
  type: 'loom' | 'video';
  videoId?: string;
  attachmentUrls?: Record<string, string>;
  isWorkspaceMode?: boolean;
}

export function VideoEmbed({ url, type, videoId, attachmentUrls: publicAttachmentUrls, isWorkspaceMode }: VideoEmbedProps) {
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
      <EmbedCard>
        <div className="h-20 w-full flex items-center justify-center text-white/30 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin mr-3" />
          Resolving secure video...
        </div>
      </EmbedCard>
    );
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
          className="w-full max-h-[65vh] mx-auto aspect-video md:aspect-[21/9] relative flex flex-col items-center justify-center cursor-pointer group bg-[#0e0e0e] overflow-hidden"
          style={{ width: 'auto', maxWidth: '100%' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#c5c0ff]/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-[#c5c0ff]/20 group-hover:border-[#c5c0ff]/50 group-hover:scale-110 transition-all duration-300 shadow-2xl">
              <Play className="text-white ml-1 w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" />
            </div>
          </div>
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
            <Video className="text-[#c5c0ff]" size={14} />
            <span className="text-xs font-medium text-white/80">{type === 'loom' ? 'Loom' : 'Video'}</span>
          </div>

          {!isWorkspaceMode && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openPane({ type: 'video', entityId: url }, undefined, 'horizontal');
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
          {type === 'loom' && videoId ? (
            <iframe
              src={`https://www.loom.com/embed/${videoId}?autoplay=1`}
              title="Loom video player"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
            />
          ) : (
            <video 
              src={finalUrl} 
              controls 
              className="w-full h-full object-contain"
              preload="metadata"
              autoPlay={true}
            />
          )}
        </div>
      )}
    </EmbedCard>
  );
}
