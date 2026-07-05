import { memo } from 'react';
import { Pin, Link2, Trash2, Edit2 } from 'lucide-react';
import type { Note } from '../types';
import { useNexusStore } from '../store/useNexusStore';
import '../styles/nexus.css';

interface NeuralCardProps {
  note: Note;
  index: number;
  onClick: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export const NeuralCard = memo(function NeuralCard({ note, index, onClick, onEdit, onDelete }: NeuralCardProps) {
  const { togglePin } = useNexusStore();
  const isMemory = note.type === 'memory';
  
  // Assign a delay class (1-4) based on index so they float out of sync
  const delayClass = `nexus-card-delay-${(index % 4) + 1}`;
  
  const baseCardClass = isMemory ? 'nexus-memory-card' : 'nexus-glass-card';

  return (
    <article 
      onClick={() => onClick(note)}
      className={`p-6 rounded-xl break-inside-avoid relative group mb-6 cursor-pointer animate-nexus-float ${baseCardClass} ${delayClass}`}
    >
      <div className="absolute top-4 right-4 nexus-action-icons flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          className="text-[#928f9e] hover:text-[#e5e2e1] p-1 transition-colors"
          onClick={(e) => { 
            e.stopPropagation(); 
            onEdit(note);
          }}
        >
          <Edit2 size={14} />
        </button>
        <button 
          className={`p-1 transition-colors ${note.is_pinned ? 'text-[#c5c0ff]' : 'text-[#928f9e] hover:text-[#e5e2e1]'}`}
          onClick={(e) => { 
            e.stopPropagation(); 
            togglePin(note.id, !note.is_pinned);
          }}
        >
          <Pin size={14} className={note.is_pinned ? 'fill-current' : ''} />
        </button>
        <button 
          className="text-[#928f9e] hover:text-[#ffb4ab] p-1 transition-colors"
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(note);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mb-4">
        <span className="inline-block border border-white/10 text-white/50 font-bold text-[10px] tracking-[0.08em] px-2 py-0.5 mb-2 rounded uppercase">
          {note.type === 'daily' ? 'JOURNAL' : note.type}
        </span>
        
        <h3 className="font-semibold text-lg text-[#e5e2e1] mb-2 leading-tight">
          {note.title}
        </h3>
        
        {note.content && (
          <p className="text-[13px] text-[#c8c4d5] leading-relaxed line-clamp-3">
            {note.content}
          </p>
        )}

        {note.type === 'checklist' && (
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-3 h-3 flex items-center justify-center rounded-sm border border-[#474553]" />
              <span className="text-[13px] text-[#e5e2e1]">Open note to view checklist</span>
            </li>
          </ul>
        )}
      </div>

      {(note.tags && note.tags.length > 0) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {note.tags.map(tag => (
            <span key={tag} className="border border-[#474553]/50 rounded text-[#c8c4d5] text-[11px] px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-[#2a2a2a] flex justify-between items-center">
        <span className="font-mono text-[10px] text-[#928f9e] tracking-wider uppercase">
          {new Date(note.created_at).toLocaleDateString()}
        </span>
        {note.linked_session_id && (
          <div className="flex items-center gap-1 text-[#a4c9ff]/70">
            <Link2 size={12} />
            <span className="font-bold text-[9px] tracking-widest uppercase">SESSION</span>
          </div>
        )}
      </div>
    </article>
  );
});
