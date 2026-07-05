import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import TextareaAutosize from 'react-textarea-autosize';
import { useProjectDocs } from '../../hooks/useProjectDocs';
import { useProjectRole } from '../../hooks/useProjectRole';
import type { ProjectDoc } from '../../types';

// Reuse Nexus components as requested
import { MarkdownRenderer } from '@/features/nexus/components/MarkdownRenderer';
import { MarkdownFormatBar } from '@/features/nexus/components/MarkdownFormatBar';
import { SlashCommandMenu } from '@/features/nexus/components/SlashCommandMenu';
import { useSlashCommands } from '@/features/nexus/hooks/useSlashCommands';
import { useMarkdownShortcuts } from '@/features/nexus/hooks/useMarkdownShortcuts';

interface DocsTabProps {
  projectId: string;
}

export function DocsTab({ projectId }: DocsTabProps) {
  const { docs, activeDoc, setActiveDocId, createDoc, updateDoc, deleteDoc } = useProjectDocs(projectId);
  const role = useProjectRole(projectId);
  
  const isEditorRole = role === 'owner' || role === 'member';

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Left Panel: Document List */}
      <aside className="w-[220px] bg-surface-container-lowest border-r border-outline-variant flex flex-col flex-shrink-0 h-full">
        {/* Panel Header */}
        <div className="flex justify-between items-center px-4 h-12 border-b border-outline-variant flex-shrink-0">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-outline-variant">DOCS</span>
          {isEditorRole && (
            <button 
              onClick={createDoc}
              className="w-6 h-6 flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant rounded-sm group"
            >
              <span className="material-symbols-outlined text-[14px] group-hover:text-primary">add</span>
            </button>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-[2px]">
          {docs.length === 0 ? (
            <div className="px-4 py-8 text-center text-on-surface-variant opacity-70 font-label-sm">
              <p>No documents yet</p>
              {isEditorRole && (
                <button onClick={createDoc} className="mt-2 text-primary hover:underline">
                  Create one
                </button>
              )}
            </div>
          ) : (
            docs.map(doc => {
              const isActive = activeDoc?.id === doc.id;
              return (
                <div 
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`group flex items-center justify-between px-4 py-2 cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-surface-container border-l-[1.5px] border-primary pl-4' 
                      : 'pl-[17.5px] hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`material-symbols-outlined text-[14px] flex-shrink-0 ${isActive ? 'text-on-surface-variant opacity-70' : 'text-on-surface-variant opacity-50'}`}>
                      description
                    </span>
                    <div className="flex flex-col overflow-hidden">
                      <span className={`font-body-main text-body-main truncate transition-colors ${isActive ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                        {doc.title || 'Untitled'}
                      </span>
                      <span className="font-label-caps text-[9px] text-outline-variant truncate max-h-0 opacity-0 group-hover:max-h-4 group-hover:opacity-100 group-hover:mt-[2px] transition-all duration-300 overflow-hidden">
                        Last edited {formatDistanceToNow(new Date(doc.updated_at))} ago
                      </span>
                    </div>
                  </div>
                  {isEditorRole && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                          deleteDoc(doc.id); 
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-on-surface-variant hover:text-error transition-all flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Panel: Editor Area */}
      <main className="flex-1 bg-surface h-full overflow-y-auto relative flex justify-center pb-24">
        {activeDoc ? (
          <DocEditor 
            key={activeDoc.id} // Ensures full remount on doc switch
            doc={activeDoc} 
            onUpdate={(updates) => updateDoc(activeDoc.id, updates)} 
            isReadOnly={!isEditorRole} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50 select-none">
            <span className="material-symbols-outlined text-4xl mb-4">description</span>
            <p className="font-body-main">Select a document or create a new one</p>
          </div>
        )}
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Internal Editor Component
// Composes Nexus sub-components exactly as NoteEditorPane does
// ----------------------------------------------------------------------------
interface DocEditorProps {
  doc: ProjectDoc;
  onUpdate: (u: Partial<ProjectDoc>) => void;
  isReadOnly: boolean;
}

function DocEditor({ doc, onUpdate, isReadOnly }: DocEditorProps) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [isEditing, setIsEditing] = useState(!isReadOnly);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdate({ title: e.target.value });
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    onUpdate({ content: val });
  };

  // Nexus Editor Hooks
  const {
    isOpen: isSlashOpen,
    menuPosition: slashPosition,
    filteredCommands,
    selectedIndex: slashIndex,
    handleChange: onSlashChange,
    handleKeyDown: onSlashKeyDown,
    handleCommandInsert: insertCommand
  } = useSlashCommands(textareaRef, content, handleContentChange);

  const {
    selectionActive,
    barPosition: formatBarPosition,
    applyFormat,
    handleShortcutKeyDown
  } = useMarkdownShortcuts(textareaRef, content, handleContentChange);

  // Auto-focus title on new untitled docs
  useEffect(() => {
    if (doc.title === 'Untitled' && isEditing) {
      // Focus could be handled via a ref to the title input, but standard click is fine too
    }
  }, []);

  return (
    <div className="w-full max-w-[800px] px-margin-lg pt-16 flex flex-col relative group/container">
      {/* Editor Header */}
      <div className="relative z-50 group/header">
        <input 
          className="w-full bg-transparent border-none text-[28px] leading-[36px] font-headline-lg font-semibold text-on-surface p-0 focus:ring-0 mb-1 placeholder:text-outline-variant" 
          placeholder="Document Title" 
          type="text" 
          value={title}
          onChange={handleTitleChange}
          readOnly={isReadOnly}
          autoFocus={doc.title === 'Untitled'}
        />
        <div className="flex items-center gap-3 text-outline-variant mb-2 flex-wrap opacity-0 transition-opacity duration-300 group-hover/header:opacity-100 group-focus-within/header:opacity-100">
          <span className="flex items-center gap-1.5 opacity-60">
            <span className="material-symbols-outlined text-[6px] opacity-80">edit</span>
            <span className="text-[10px] font-normal tracking-wide">
              Last edited by {doc.editor?.name || 'Unknown User'} · {formatDistanceToNow(new Date(doc.updated_at))} ago
            </span>
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-outline-variant opacity-50"></span>
          <span className="px-2 py-0.5 border border-outline-variant rounded-sm font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant">
            {isReadOnly ? 'READ ONLY' : 'AUTO-SAVED'}
          </span>
          
          {!isReadOnly && (
            <div className="flex items-center gap-0.5 bg-surface-container-lowest rounded-lg border border-outline-variant p-1 ml-auto pointer-events-auto">
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(false); }} 
                className={`px-3 py-1 rounded text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all select-none ${!isEditing ? 'bg-primary/20 text-primary shadow-sm' : 'text-outline-variant hover:text-on-surface hover:bg-white/5'}`}
              >
                View
              </button>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }} 
                className={`px-3 py-1 rounded text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all select-none ${isEditing ? 'bg-primary/20 text-primary shadow-sm' : 'text-outline-variant hover:text-on-surface hover:bg-white/5'}`}
              >
                Edit
              </button>
            </div>
          )}
        </div>
        <div className="w-full h-[1px] bg-outline-variant opacity-50 transition-opacity duration-300 group-hover/header:opacity-100 group-focus-within/header:opacity-100 opacity-0"></div>
      </div>

      {/* Editor Body */}
      <div className="w-full flex-1 relative min-h-[300px]">
        {isEditing && !isReadOnly ? (
          <div className="w-full relative group/editor">
            <TextareaAutosize
              ref={textareaRef}
              minRows={15}
              placeholder="Start writing in markdown... type '/' for commands"
              value={content}
              onChange={onSlashChange}
              onKeyDown={(e) => {
                onSlashKeyDown(e);
                handleShortcutKeyDown(e);
              }}
              className="w-full bg-transparent border-none text-[14px] leading-[24px] text-on-surface-variant resize-none focus:outline-none placeholder:text-outline-variant/50 font-sans relative z-10 block"
            />
            
            <SlashCommandMenu
              isOpen={isSlashOpen}
              position={slashPosition}
              commands={filteredCommands}
              selectedIndex={slashIndex}
              onSelect={insertCommand}
            />
            
            <MarkdownFormatBar
              isActive={selectionActive}
              position={formatBarPosition}
              onFormat={applyFormat}
            />
          </div>
        ) : (
          <div className="w-full text-[14px] leading-[24px] text-on-surface-variant font-sans">
            <MarkdownRenderer 
              content={content || '*No content yet.*'} 
              readOnly={isReadOnly}
              isWorkspaceMode={true}
            />
          </div>
        )}
      </div>
      <div className="h-32 w-full"></div>
    </div>
  );
}
