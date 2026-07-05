import React from 'react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNexusStore } from '../store/useNexusStore';
import { parseEmbed, type EmbedData } from '../utils/embedParser';
import { YouTubeEmbed } from './embeds/YouTubeEmbed';
import { PDFEmbed } from './embeds/PDFEmbed';
import { VideoEmbed } from './embeds/VideoEmbed';
import { ReelEmbed } from './embeds/ReelEmbed';

interface MarkdownRendererProps {
  content: string;
  onClick?: () => void;
  onCheck?: (lineIndex: number, checked: boolean) => void;
  readOnly?: boolean;
  publicAttachmentUrls?: Record<string, string>;
  isWorkspaceMode?: boolean;
}

export function MarkdownRenderer({ content, onClick, onCheck, readOnly = false, publicAttachmentUrls, isWorkspaceMode }: MarkdownRendererProps) {
  // Only subscribe to the store if we aren't using provided public urls
  // This allows the public page to be fully decoupled from the auth store
  const storeAttachmentUrls = useNexusStore(state => state.attachmentUrls);
  const attachmentUrls = publicAttachmentUrls || storeAttachmentUrls;

  return (
    <div 
      className="w-full flex-1 overflow-y-auto custom-scrollbar pr-4 text-[#c8c4d5] leading-relaxed cursor-text group"
      onClick={onClick}
    >
      {/* Empty State */}
      {!content && (
        <div className="h-full flex items-center justify-center opacity-30 italic font-medium transition-opacity group-hover:opacity-60">
          Empty note. Click anywhere to start writing.
        </div>
      )}

      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        urlTransform={(value: string) => {
          if (value.startsWith('attachment:')) return value;
          return defaultUrlTransform(value);
        }}
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4 tracking-tight" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-white mt-6 mb-3 tracking-tight" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-medium text-white mt-5 mb-2 tracking-tight" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-lg font-medium text-white mt-4 mb-2" {...props} />,
          p: ({node, ...props}: any) => {
            const reactChildren = React.Children.toArray(props.children);
            const newReactChildren: React.ReactNode[] = [];
            let hasEmbed = false;
            
            let j = 0;
            while (j < reactChildren.length) {
              const child = reactChildren[j];
              const nextChild = reactChildren[j + 1];
              
              if (typeof child === 'string' && child.endsWith('!embed')) {
                if (React.isValidElement(nextChild) && (nextChild.props as any).href) {
                   const href = (nextChild.props as any).href;
                   // In React, the children of the anchor tag might be an array or string.
                   const anchorChildren = (nextChild.props as any).children;
                   const typeLabel = Array.isArray(anchorChildren) ? anchorChildren[0] : anchorChildren;
                   
                   const embed = parseEmbed(`!embed[${typeLabel}](${href})`);
                   if (embed) {
                     const textWithoutEmbed = child.slice(0, -6);
                     if (textWithoutEmbed) {
                       // We must wrap text in a span if we're rendering a div container to be safe
                       newReactChildren.push(<span key={`text-${j}`}>{textWithoutEmbed}</span>);
                     }
                     newReactChildren.push(<div className="w-full my-4" key={`embed-${j}`}>{renderEmbed(embed, attachmentUrls, isWorkspaceMode)}</div>);
                     hasEmbed = true;
                     j += 2;
                     continue;
                   }
                }
              }
              
              // Fallback for single raw URLs parsed as anchor tag
              if (reactChildren.length === 1 && React.isValidElement(child) && (child.props as any).href) {
                const embed = parseEmbed((child.props as any).href);
                if (embed) return renderEmbed(embed, attachmentUrls, isWorkspaceMode);
              }
              
              newReactChildren.push(child);
              j++;
            }

            if (hasEmbed) {
              return <div className="mb-4 leading-relaxed">{newReactChildren}</div>;
            }

            return <p className="mb-4 leading-relaxed">{newReactChildren}</p>;
          },
          a: ({node, ...props}) => <a className="text-[#c5c0ff] hover:text-[#d1ccff] underline underline-offset-4 decoration-white/20 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          ul: ({node, className, ...props}) => {
            // Check if it's a task list
            if (className === 'contains-task-list') {
              return <ul className="list-none ml-2 mb-4 space-y-2" {...props} />;
            }
            return <ul className="list-disc list-outside ml-6 mb-4 space-y-2 marker:text-white/30" {...props} />;
          },
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 marker:text-white/30" {...props} />,
          li: ({node, className, children, ...props}) => {
            if (className === 'task-list-item') {
              return <li className="flex items-start gap-3" {...props}>{children}</li>;
            }
            return <li className="pl-2" {...props}>{children}</li>;
          },
          code: ({node, inline, className, children, ...props}: any) => {
            return !inline ? (
              <pre className="bg-[#0e0e0e]/50 border border-white/5 rounded-xl p-4 my-6 overflow-x-auto custom-scrollbar font-mono text-sm text-[#e5e2e1] shadow-inner">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-white/10 text-[#e5e2e1] rounded px-1.5 py-0.5 text-sm font-mono border border-white/5" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-2 border-[#c5c0ff]/30 pl-5 py-2 my-6 italic text-[#928f9e] bg-gradient-to-r from-[#c5c0ff]/5 to-transparent rounded-r-lg" {...props} />
          ),
          hr: ({node, ...props}) => <hr className="border-white/10 my-8" {...props} />,
          table: ({node, ...props}) => (
            <div className="overflow-x-auto mb-6 border border-white/10 rounded-lg">
              <table className="w-full text-left border-collapse" {...props} />
            </div>
          ),
          th: ({node, ...props}) => <th className="border-b border-white/10 bg-white/5 px-4 py-3 font-semibold text-white text-sm" {...props} />,
          td: ({node, ...props}) => <td className="border-b border-white/5 px-4 py-3 text-sm" {...props} />,
          input: ({node, type, checked, ...props}) => {
            if (type === 'checkbox') {
              return (
                <input 
                  type="checkbox" 
                  checked={checked} 
                  disabled={readOnly}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (readOnly) return;
                    if (onCheck && node?.position?.start?.line) {
                      onCheck(node.position.start.line - 1, e.target.checked);
                    }
                  }}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-[#c5c0ff] focus:ring-0 focus:ring-offset-0 cursor-pointer transition-colors"
                  {...props} 
                />
              );
            }
            return <input type={type} checked={checked} {...props} />;
          },
          img: ({node, src, alt, ...props}) => {
            let finalSrc = src;
            if (src?.startsWith('attachment:')) {
              const id = src.replace('attachment:', '');
              finalSrc = attachmentUrls[id];
            }
            
            if (!finalSrc) {
              return (
                <div className="w-full max-w-2xl h-32 my-6 rounded-xl border border-white/5 bg-[#0e0e0e]/50 flex items-center justify-center">
                  <div className="text-xs text-[#928f9e] flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[#928f9e]/30 border-t-[#928f9e] animate-spin" />
                    Loading image...
                  </div>
                </div>
              );
            }

            return (
              <img 
                src={finalSrc} 
                alt={alt || 'Image attachment'} 
                className="max-w-full lg:max-w-2xl rounded-xl border border-white/10 shadow-2xl shadow-black/40 my-6 object-contain max-h-[600px] transition-opacity duration-300 opacity-0"
                onLoad={(e) => {
                  (e.target as HTMLImageElement).classList.remove('opacity-0');
                  (e.target as HTMLImageElement).classList.add('opacity-100');
                }}
                {...props} 
              />
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function renderEmbed(embed: EmbedData, attachmentUrls?: Record<string, string>, isWorkspaceMode?: boolean) {
  // Try to resolve the signed URL if this is an attachment
  let resolvedUrl = embed.url;
  if (embed.url.startsWith('attachment:') && attachmentUrls) {
    const id = embed.url.replace('attachment:', '');
    if (attachmentUrls[id]) {
      resolvedUrl = attachmentUrls[id];
    }
  }

  switch (embed.type) {
    case 'youtube':
      return <YouTubeEmbed url={resolvedUrl} videoId={embed.videoId!} isWorkspaceMode={isWorkspaceMode} />;
    case 'pdf':
      return <PDFEmbed url={resolvedUrl} isWorkspaceMode={isWorkspaceMode} />;
    case 'video':
    case 'loom':
      return <VideoEmbed url={resolvedUrl} type={embed.type} videoId={embed.videoId} isWorkspaceMode={isWorkspaceMode} />;
    case 'reel':
      return <ReelEmbed url={resolvedUrl} provider={embed.provider} videoId={embed.videoId} isWorkspaceMode={isWorkspaceMode} />;
    default:
      return null;
  }
}
