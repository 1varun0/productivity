import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

interface CustomDatePickerProps {
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export function CustomDatePicker({ selectedDate, onSelect }: CustomDatePickerProps) {
  const [viewDate, setViewDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDay.getDay();
    const totalDaysInMonth = lastDay.getDate();
    
    const previousMonthLastDay = new Date(year, month, 0).getDate();
    
    const daysArray = [];
    
    // Previous month filler
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      daysArray.push({
        day: previousMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, previousMonthLastDay - i)
      });
    }
    
    // Current month
    for (let i = 1; i <= totalDaysInMonth; i++) {
      daysArray.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Next month filler
    const remainingSlots = 42 - daysArray.length;
    for (let i = 1; i <= remainingSlots; i++) {
      daysArray.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return daysArray;
  }, [year, month]);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date | null) => {
    if (!d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const today = new Date();

  return (
    <div className="p-3 w-[260px] select-none">
      <div className="flex items-center justify-between mb-4 px-1">
        <button 
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card/40 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="text-[11px] font-semibold tracking-widest uppercase text-foreground/80">
          {viewDate.toLocaleString('default', { month: 'short' })} {year}
        </div>
        <button 
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card/40 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-[9px] font-semibold text-center text-muted-foreground/40 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((item, i) => {
          const isSelected = isSameDay(item.date, selectedDateObj);
          const isToday = isSameDay(item.date, today);
          
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(item.date.toISOString())}
              className={`
                h-8 w-8 flex items-center justify-center rounded-lg text-[11px] font-medium transition-all duration-300
                ${isSelected 
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm' 
                  : item.isCurrentMonth
                    ? 'text-foreground/80 hover:bg-card hover:text-foreground border border-transparent'
                    : 'text-muted-foreground/30 hover:text-muted-foreground/60 border border-transparent'
                }
                ${isToday && !isSelected ? 'underline decoration-primary/40 underline-offset-2' : ''}
              `}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
