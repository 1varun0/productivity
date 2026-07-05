import { memo } from 'react';
import { Bell, Search } from 'lucide-react';

interface FluxTopbarProps {
  activeTab: 'day' | 'template';
  onTabChange: (tab: 'day' | 'template') => void;
}

const TABS = [
  { id: 'day' as const, label: 'DAY' },
  { id: 'week' as const, label: 'WEEK' },
  { id: 'agenda' as const, label: 'AGENDA' },
  { id: 'timeline' as const, label: 'TIMELINE' },
  { id: 'template' as const, label: 'TEMPLATE' },
] as const;

export const FluxTopbar = memo(function FluxTopbar({ activeTab, onTabChange }: FluxTopbarProps) {
  return (
    <header className="flex justify-between items-center h-12 px-6 shrink-0"
      style={{ backgroundColor: '#131313', borderBottom: '1px solid #474553' }}>
      <div className="flex items-center gap-6 h-full">
        <span style={{
          fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px',
          letterSpacing: '0.08em', fontWeight: 700, color: '#e5e2e1',
        }} className="uppercase mr-4">FLUX</span>
        <nav className="flex h-full gap-6">
          {TABS.map(tab => {
            const isActive = tab.id === activeTab;
            const isDisabled = tab.id !== 'day' && tab.id !== 'template';
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id as 'day' | 'template')}
                className="h-full flex items-center uppercase transition-all duration-200"
                style={{
                  fontFamily: 'Inter', fontSize: '13px', lineHeight: '20px',
                  fontWeight: 400, letterSpacing: '0em',
                  color: isActive ? '#e5e2e1' : '#c8c4d5',
                  borderBottom: isActive ? '1.5px solid #e5e2e1' : '1.5px solid transparent',
                  paddingTop: isActive ? '1.5px' : '0',
                  opacity: isDisabled ? 0.4 : 1,
                  cursor: isDisabled ? 'default' : 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button style={{
          fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px',
          letterSpacing: '0.08em', fontWeight: 700, color: '#c5c0ff',
        }} className="uppercase hover:opacity-80 transition-opacity">
          ENTER FOCUS
        </button>
        <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid #474553' }}>
          <button className="text-[#555] hover:text-[#aaa] transition-colors">
            <Bell size={16} />
          </button>
          <button className="text-[#555] hover:text-[#aaa] transition-colors">
            <Search size={16} />
          </button>
        </div>
      </div>
    </header>
  );
});
