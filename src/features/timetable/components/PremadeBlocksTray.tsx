import { memo, useEffect, useState } from 'react';
import { useTasks } from '../../tasks/hooks/useTasks';
import { useHabits } from '../../habits/store/useHabits';

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const PremadeBlocksTray = memo(function PremadeBlocksTray() {
  const { tasks } = useTasks();
  const { habits, fetchHabits } = useHabits();
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Determine if there are any items at all (before filtering)
  const hasAnyItems = 
    (tasks || []).some(t => !t.completed) || 
    (habits || []).some(h => !h.archived);

  if (!hasAnyItems) {
    return null; // Hide tray if completely empty
  }

  const filterLower = filterText.toLowerCase();

  const incompleteTasks = (tasks || [])
    .filter(t => !t.completed && t.title.toLowerCase().includes(filterLower));
  const activeHabits = (habits || [])
    .filter(h => !h.archived && h.name.toLowerCase().includes(filterLower));

  const handleDragStart = (e: React.DragEvent, item: any, type: 'task' | 'habit') => {
    let title = '';
    let category = '';
    let color = '';

    if (type === 'task') {
      title = item.title;
      category = 'Tasks';
      color = '#7F77DD'; // Default task color
    } else if (type === 'habit') {
      title = item.name;
      category = 'Habits';
      color = item.color || '#185FA5';
    }

    const payload = JSON.stringify({ title, category, color });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const renderSection = (title: string, items: any[], type: 'task' | 'habit', defaultColor: string) => {
    if (items.length === 0) return null;

    return (
      <div className="flex flex-col gap-2 shrink-0">
        <span 
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#c8c4d5',
            opacity: 0.5,
            textTransform: 'uppercase',
            marginLeft: '2px'
          }}
        >
          {title}
        </span>
        <div className="flex gap-2">
          {items.map(item => {
            const itemName = type === 'task' ? item.title : item.name;
            const itemColor = type === 'habit' ? (item.color || defaultColor) : defaultColor;
            
            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, type)}
                className="cursor-grab active:cursor-grabbing hover:brightness-110 transition-all select-none"
                style={{ 
                  backgroundColor: hexToRgba(itemColor, 0.1),
                  borderLeft: `2px solid ${itemColor}`,
                  color: itemColor,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px',
                  fontWeight: 500,
                  lineHeight: '14px',
                  padding: '4px 8px',
                  borderRadius: '2px', // Match block radius
                  whiteSpace: 'nowrap',
                }}
              >
                {itemName}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="flex shrink-0 p-4 items-end gap-6"
      style={{ 
        backgroundColor: '#0f0f0f', 
        borderTop: '1px solid #1e1e1e',
        zIndex: 40 
      }}
    >
      <div className="shrink-0 pb-1">
        <input
          type="text"
          placeholder="filter..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="outline-none transition-colors"
          style={{
            backgroundColor: '#1e1e1e',
            border: '1px solid #2a2a2a',
            fontSize: '11px',
            color: '#e0e0e0',
            padding: '4px 8px',
            borderRadius: '2px',
            fontFamily: "'Inter', sans-serif",
            width: '100px',
          }}
        />
      </div>

      <div className="flex gap-6 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e1e #0f0f0f' }}>
        {renderSection('Tasks', incompleteTasks, 'task', '#7F77DD')}
        {renderSection('Habits', activeHabits, 'habit', '#185FA5')}
      </div>
    </div>
  );
});
