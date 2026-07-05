import { useMemo } from 'react';
import type { TimetableBlock, Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface WeekSummaryFooterProps {
  blocks: TimetableBlock[];
}

export function WeekSummaryFooter({ blocks }: WeekSummaryFooterProps) {
  // Calculate total hours per category
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const block of blocks) {
      if (!block.archived) {
        totals[block.category] = (totals[block.category] || 0) + block.duration;
      }
    }
    
    // Sort by hours descending
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([category, hours]) => ({ category: category as Category, hours }));
  }, [blocks]);

  // Total scheduled hours
  const totalHours = useMemo(() => {
    return categoryTotals.reduce((sum, item) => sum + item.hours, 0);
  }, [categoryTotals]);

  return (
    <div className="w-full flex items-center gap-4 px-6 h-8 border-t border-[#1e1e1e] bg-[#0f0f0f] overflow-x-auto timetable-scrollbar shrink-0">
      <div className="flex items-center pr-4 border-r border-[#222] shrink-0">
        <span className="text-[10px] font-bold text-[#666] tracking-widest uppercase">
          {totalHours} HRS
        </span>
      </div>

      <div className="flex items-center gap-4 whitespace-nowrap">
        {categoryTotals.length === 0 ? (
          <span className="text-[10px] text-[#444] italic">No blocks scheduled</span>
        ) : (
          categoryTotals.map(({ category, hours }) => {
            const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.free;
            const label = CATEGORY_LABELS[category] ?? category;
            
            return (
              <div key={category} className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: colors.border }} 
                />
                <span className="text-[10px] font-medium text-[#aaa]">{label}</span>
                <span className="text-[10px] font-bold text-[#555] ml-0.5">{hours}h</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
