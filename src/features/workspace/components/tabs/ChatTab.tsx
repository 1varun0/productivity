import { useState, useRef, useEffect, memo } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowUp, Edit2, Trash2, Paperclip, File, Download, Loader2 } from 'lucide-react';
import { useProjectChat } from '../../hooks/useProjectChat';
import { useProjectRole } from '../../hooks/useProjectRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { ProjectMessage } from '../../types';

interface ChatTabProps {
  projectId: string;
}

// Format time: 10:42 AM
const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format date for divider: Today, Yesterday, or Aug 12, 2024
const formatDateDivider = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

// Generate a deterministic color from string
const getColorForUser = (userId: string) => {
  const colors = ['#534AB7', '#185FA5', '#0F6E56', '#BA7517', '#993556', '#D85A30'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AttachmentRenderer = ({ attachment }: { attachment: NonNullable<ProjectMessage['attachments']>[0] }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUrl = async () => {
      const { data, error } = await supabase.storage
        .from('project-files')
        .createSignedUrl(attachment.path, 3600); // 1 hour
      if (data && isMounted) {
        setUrl(data.signedUrl);
      } else if (error) {
        console.error('Failed to get signed URL for attachment:', error);
      }
    };
    fetchUrl();
    return () => { isMounted = false; };
  }, [attachment.path]);

  if (attachment.type.startsWith('image/')) {
    return (
      <div className="mt-2 relative max-w-sm rounded-md overflow-hidden border border-[#1E1E1E]">
        {url ? (
          <img src={url} alt={attachment.name} className="w-full h-auto object-cover" />
        ) : (
          <div className="w-full h-32 bg-[#1A1A1A] flex items-center justify-center animate-pulse">
            <Loader2 size={24} className="text-[#555] animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center p-3 rounded-md bg-[#1A1A1A] border border-[#1E1E1E] max-w-sm group">
      <File size={20} className="text-[#555] mr-3 shrink-0" />
      <div className="flex-1 min-w-0 mr-4">
        <div className="text-[13px] text-[#e5e2e1] truncate">{attachment.name}</div>
        <div className="text-[11px] text-[#888]">{Math.round(attachment.size / 1024)} KB</div>
      </div>
      {url && (
        <a 
          href={url} 
          download={attachment.name} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#888] hover:text-[#c5c0ff] transition-colors p-2"
        >
          <Download size={16} />
        </a>
      )}
    </div>
  );
};

const MessageRow = memo(({ 
  msg, 
  isConsecutive, 
  isOwn, 
  onEdit, 
  onDelete 
}: { 
  msg: ProjectMessage; 
  isConsecutive: boolean; 
  isOwn: boolean;
  onEdit: (msg: ProjectMessage) => void;
  onDelete: (id: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const initial = (msg.sender?.name || 'U').charAt(0).toUpperCase();
  const color = getColorForUser(msg.user_id);

  if (isConsecutive) {
    return (
      <div 
        className="flex items-start space-x-3 mt-[-16px] group relative"
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div className="w-[28px] flex-shrink-0" />
        <div className="flex flex-col space-y-1 w-full relative">
          <div className="flex items-start relative">
            <span 
              className="text-[10px] font-body-mono w-[40px] opacity-0 group-hover:opacity-100 transition-opacity pt-1 absolute -ml-[48px] text-right"
              style={{ color: '#555555' }}
            >
              {formatTime(msg.created_at)}
            </span>
            <div className="flex flex-col w-full">
              {msg.content && (
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: '#cccccc' }}>
                  {msg.content}
                  {msg.edited_at && <span className="text-[10px] ml-2" style={{ color: '#555555' }}>(edited)</span>}
                </p>
              )}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  {msg.attachments.map((att, i) => (
                    <AttachmentRenderer key={i} attachment={att} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {isOwn && showMenu && (
          <div className="absolute right-0 top-0 flex space-x-1 bg-[#131313] p-1 rounded-sm border border-[#1E1E1E] z-10">
            <button onClick={() => onEdit(msg)} className="p-1 hover:text-[#c5c0ff] text-[#928f9e] transition-colors"><Edit2 size={12} /></button>
            <button onClick={() => onDelete(msg.id)} className="p-1 hover:text-[#ffb4ab] text-[#928f9e] transition-colors"><Trash2 size={12} /></button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="flex items-start space-x-3 group relative"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div 
        className="w-[28px] h-[28px] rounded-full flex flex-shrink-0 items-center justify-center text-[10px] font-bold text-white border border-[#1E1E1E]"
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>
      <div className="flex flex-col space-y-1 w-full relative">
        <div className="flex items-baseline space-x-2">
          <span className="text-[12px] font-medium" style={{ color: '#888888' }}>{msg.sender?.name || 'Unknown'}</span>
          <span className="text-[10px] font-body-mono" style={{ color: '#555555' }}>{formatTime(msg.created_at)}</span>
        </div>
        <div className="flex flex-col w-full">
          {msg.content && (
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: '#cccccc' }}>
              {msg.content}
              {msg.edited_at && <span className="text-[10px] ml-2" style={{ color: '#555555' }}>(edited)</span>}
            </p>
          )}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              {msg.attachments.map((att, i) => (
                <AttachmentRenderer key={i} attachment={att} />
              ))}
            </div>
          )}
        </div>
      </div>
      {isOwn && showMenu && (
        <div className="absolute right-0 top-0 flex space-x-1 bg-[#131313] p-1 rounded-sm border border-[#1E1E1E] z-10">
          <button onClick={() => onEdit(msg)} className="p-1 hover:text-[#c5c0ff] text-[#928f9e] transition-colors"><Edit2 size={12} /></button>
          <button onClick={() => onDelete(msg.id)} className="p-1 hover:text-[#ffb4ab] text-[#928f9e] transition-colors"><Trash2 size={12} /></button>
        </div>
      )}
    </div>
  );
});

export function ChatTab({ projectId }: ChatTabProps) {
  const { messages, isLoading, sendMessage, editMessage, deleteMessage } = useProjectChat(projectId);
  const role = useProjectRole(projectId);
  const { user } = useAuth();
  
  const [input, setInput] = useState('');
  const [editingMsg, setEditingMsg] = useState<ProjectMessage | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showNewMsgPill, setShowNewMsgPill] = useState(false);

  const [pendingAttachments, setPendingAttachments] = useState<ProjectMessage['attachments']>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = role === 'owner' || role === 'member';

  // Auto-scroll logic
  const scrollToBottom = (force = false) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (force || isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      setShowNewMsgPill(false);
    } else if (!force && !isNearBottom) {
      setShowNewMsgPill(true);
    }
  };

  useEffect(() => {
    scrollToBottom(isLoading); // Force scroll on initial load
  }, [messages.length, isLoading]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    if (isNearBottom) {
      setShowNewMsgPill(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !canEdit || !user) return;
    
    setIsUploading(true);
    const newAttachments: NonNullable<ProjectMessage['attachments']> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const randomId = crypto.randomUUID();
      const path = `${projectId}/chat/${randomId}_${file.name}`;
      
      const { error } = await supabase.storage
        .from('project-files')
        .upload(path, file);

      if (!error) {
        newAttachments.push({
          name: file.name,
          path,
          type: file.type,
          size: file.size
        });

        // Add to project_files table so it appears in the Files tab
        await supabase.from('project_files').insert({
          id: crypto.randomUUID(),
          project_id: projectId,
          folder_id: null, // Root folder
          uploaded_by: user.id,
          name: file.name,
          size: file.size,
          mime_type: file.type,
          storage_path: path
        });
      } else {
        console.error('Failed to upload attachment:', error);
      }
    }

    setPendingAttachments(prev => [...(prev || []), ...newAttachments]);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!canEdit) return;
    const trimmedInput = input.trim();
    if (!trimmedInput && (!pendingAttachments || pendingAttachments.length === 0)) return;

    if (editingMsg) {
      await editMessage(editingMsg.id, trimmedInput);
      setEditingMsg(null);
    } else {
      await sendMessage(trimmedInput, pendingAttachments);
      setPendingAttachments([]);
    }
    setInput('');
    scrollToBottom(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape' && editingMsg) {
      setEditingMsg(null);
      setInput('');
    }
  };

  const handleEditClick = (msg: ProjectMessage) => {
    setEditingMsg(msg);
    setInput(msg.content);
  };

  return (
    <div className="h-full flex flex-col relative w-full" style={{ backgroundColor: '#131313' }}>
      {/* Messages Area */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 flex flex-col space-y-6 pb-32"
      >
        {isLoading ? (
          <div className="flex flex-col space-y-4 opacity-50">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3 items-start animate-pulse">
                <div className="w-7 h-7 rounded-full bg-[#2a2a2a]" />
                <div className="flex flex-col space-y-2 w-full">
                  <div className="w-24 h-3 bg-[#2a2a2a] rounded-sm" />
                  <div className="w-3/4 h-4 bg-[#2a2a2a] rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p style={{ color: '#555', fontSize: '13px', fontFamily: 'Inter' }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            
            let showDivider = false;
            let isConsecutive = false;
            
            if (!prevMsg) {
              showDivider = true;
            } else {
              const d1 = new Date(msg.created_at).toDateString();
              const d2 = new Date(prevMsg.created_at).toDateString();
              if (d1 !== d2) {
                showDivider = true;
              } else if (prevMsg.user_id === msg.user_id) {
                const t1 = new Date(msg.created_at).getTime();
                const t2 = new Date(prevMsg.created_at).getTime();
                // Consider consecutive if within 10 minutes
                if (t1 - t2 < 10 * 60 * 1000) {
                  isConsecutive = true;
                }
              }
            }

            return (
              <div key={msg.id} className="flex flex-col space-y-6">
                {showDivider && (
                  <div className="flex items-center py-4">
                    <div className="flex-grow h-px bg-[#1E1E1E]"></div>
                    <span className="px-4 text-[10px] font-bold tracking-widest uppercase" style={{ color: '#555555' }}>
                      {formatDateDivider(msg.created_at)}
                    </span>
                    <div className="flex-grow h-px bg-[#1E1E1E]"></div>
                  </div>
                )}
                <MessageRow 
                  msg={msg} 
                  isConsecutive={isConsecutive} 
                  isOwn={msg.user_id === user?.id}
                  onEdit={handleEditClick}
                  onDelete={deleteMessage}
                />
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {showNewMsgPill && (
        <div className="absolute bottom-[90px] left-1/2 transform -translate-x-1/2 z-20">
          <button 
            onClick={() => scrollToBottom(true)}
            className="flex items-center space-x-1 bg-[#2a2a2a] border border-[#474553] rounded-full px-3 py-1 hover:border-[#c5c0ff] transition-colors shadow-lg"
          >
            <span style={{ color: '#e5e2e1', fontSize: '11px', fontWeight: 500 }}>↓ New message</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full border-t border-[#1E1E1E] px-6 py-4 z-10" style={{ backgroundColor: '#131313' }}>
        {editingMsg && (
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-medium" style={{ color: '#c5c0ff' }}>Editing message</span>
            <button onClick={() => { setEditingMsg(null); setInput(''); }} className="text-[10px]" style={{ color: '#928f9e' }}>ESC to cancel</button>
          </div>
        )}
        
        {pendingAttachments && pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 px-1">
            {pendingAttachments.map((att, i) => (
              <div key={i} className="flex items-center space-x-2 bg-[#1A1A1A] border border-[#2a2a2a] rounded p-2 max-w-xs group">
                <File size={14} className="text-[#888] shrink-0" />
                <span className="text-[11px] text-[#ccc] truncate flex-1">{att.name}</span>
                <button 
                  onClick={() => setPendingAttachments(prev => prev?.filter((_, idx) => idx !== i))}
                  className="text-[#888] hover:text-[#ffb4ab]"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-end border border-[#1E1E1E] rounded-sm focus-within:border-[#534AB7] transition-colors bg-[#131313]">
          {!editingMsg && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                multiple 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canEdit || isUploading}
                className="p-3 text-[#555] hover:text-[#c5c0ff] transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
              </button>
            </>
          )}
          
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canEdit || isUploading}
            placeholder={canEdit ? "Message project..." : "You have view-only access"}
            minRows={1}
            maxRows={6}
            className={`flex-1 bg-transparent border-none focus:ring-0 py-3 pr-12 text-[13px] resize-none ${editingMsg ? 'pl-4' : 'pl-1'}`}
            style={{ color: '#e5e2e1', fontFamily: 'Inter, sans-serif' }}
          />
          {(input.trim() || (pendingAttachments && pendingAttachments.length > 0)) && canEdit && !isUploading && (
            <div className="absolute right-2 bottom-2">
              <button 
                onClick={handleSubmit}
                className="w-[24px] h-[24px] rounded-sm flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#534AB7' }}
              >
                <ArrowUp size={14} color="white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
