import { formatDistanceToNow } from 'date-fns';

interface SaveBarProps {
  blockCount: number;
  isDirty: boolean;
  lastSaved: Date | null;
  onSave: () => void;
}

export function SaveBar({ blockCount, isDirty, lastSaved, onSave }: SaveBarProps) {
  const savedText = lastSaved
    ? `last saved ${formatDistanceToNow(lastSaved, { addSuffix: false })} ago`
    : 'not saved yet';

  return (
    <div className="h-10 flex justify-between items-center px-6 bg-[#131313] shrink-0">
      <span className="font-mono text-[#c8c4d5] opacity-70 text-[11px]">
        {blockCount} blocks · {savedText}
      </span>

      <button
        onClick={onSave}
        className={`px-4 py-1.5 rounded uppercase font-bold text-[10px] tracking-widest transition-opacity ${
          isDirty 
            ? 'bg-[#534AB7] text-white hover:bg-opacity-90' 
            : 'bg-[#2a2a2a] text-[#666666]'
        }`}
      >
        {isDirty ? 'SAVE' : 'SAVED'}
      </button>
    </div>
  );
}
