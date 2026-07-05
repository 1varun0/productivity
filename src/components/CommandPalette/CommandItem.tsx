import { type ReactNode } from 'react';

interface CommandItemProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  shortcut?: string[];
}

export function CommandItem({ icon, title, subtitle, isActive, onMouseEnter, onClick, shortcut }: CommandItemProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
        isActive 
          ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
          : 'text-[#928f9e] hover:bg-white/5 hover:text-[#c8c4d5]'
      }`}
    >
      <div className={`flex items-center justify-center shrink-0 w-6 h-6 rounded-md transition-colors ${
        isActive ? 'text-white' : 'text-[#928f9e] group-hover:text-[#c8c4d5]'
      }`}>
        {icon}
      </div>
      
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium truncate">{title}</span>
        {subtitle && (
          <span className={`text-[10px] truncate transition-colors ${
            isActive ? 'text-white/60' : 'text-[#928f9e]/60'
          }`}>
            {subtitle}
          </span>
        )}
      </div>

      {shortcut && (
        <div className="flex items-center gap-1 shrink-0">
          {shortcut.map((key, i) => (
            <kbd key={i} className={`font-mono text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
              isActive 
                ? 'bg-white/10 border-white/20 text-white/80' 
                : 'bg-[#1a1a1a] border-white/10 text-[#928f9e]/80'
            }`}>
              {key}
            </kbd>
          ))}
        </div>
      )}
    </div>
  );
}
