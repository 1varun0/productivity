import { useState } from 'react';
import { FileText, Expand, Shrink, ExternalLink, SplitSquareHorizontal } from 'lucide-react';
import { EmbedCard } from './EmbedCard';
import { useNexusStore } from '../../store/useNexusStore';
import { useWorkspaceStore } from '../../workspace/useWorkspaceStore';

interface PDFEmbedProps {
  url: string;
  attachmentUrls?: Record<string, string>;
  isWorkspaceMode?: boolean;
}

export function PDFEmbed({ url, attachmentUrls: publicAttachmentUrls, isWorkspaceMode }: PDFEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const storeAttachmentUrls = useNexusStore(state => state.attachmentUrls);
  const attachmentUrls = publicAttachmentUrls || storeAttachmentUrls;
  const openPane = useWorkspaceStore(state => state.openPane);

  let finalUrl = url;
  let filename = 'Document.pdf';
  let isAttachment = false;

  if (url.startsWith('attachment:')) {
    isAttachment = true;
    const id = url.replace('attachment:', '');
    finalUrl = attachmentUrls[id] || '';
    filename = `Secure Attachment (${id.slice(0, 6)})`;
  } else {
    try {
      const u = new URL(url);
      filename = u.pathname.split('/').pop() || filename;
    } catch { }
  }

  if (isAttachment && !finalUrl) {
    return (
      <EmbedCard>
        <div className="h-20 w-full flex items-center justify-center text-white/30 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin mr-3" />
          Resolving secure link...
        </div>
      </EmbedCard>
    );
  }

  return (
    <EmbedCard>
      <div 
        className={`w-full flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.04] transition-colors cursor-pointer group ${isExpanded ? 'border-b border-white/10' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#ff4d4d]/10 flex items-center justify-center text-[#ff4d4d] border border-[#ff4d4d]/20 group-hover:scale-105 transition-transform duration-300">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{decodeURIComponent(filename)}</h4>
            <p className="text-xs text-white/40 mt-0.5">PDF Document • Click to {isExpanded ? 'collapse' : 'preview'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isWorkspaceMode && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openPane({ type: 'pdf', entityId: url }, undefined, 'horizontal');
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Open in Split Right"
            >
              <SplitSquareHorizontal size={16} />
            </button>
          )}
          <a 
            href={finalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Open externally"
          >
            <ExternalLink size={16} />
          </a>
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            {isExpanded ? <Shrink size={16} /> : <Expand size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="w-full h-[600px] bg-[#0e0e0e] relative overflow-hidden">
          <iframe 
            src={`${finalUrl}#view=FitH&toolbar=0`} 
            className="w-full h-full border-0 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
            title={filename}
            onLoad={(e) => {
              (e.target as HTMLIFrameElement).style.opacity = '1';
            }}
          />
        </div>
      )}
    </EmbedCard>
  );
}
