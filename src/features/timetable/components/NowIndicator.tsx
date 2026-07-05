import { memo, useState, useEffect } from 'react';

interface NowIndicatorProps {
  /** Width of the day label column. When provided, renders the weekly grid style. */
  dayColumnWidth?: number;
  /** Width of each hour cell. Required for weekly grid mode. */
  cellWidth?: number;
}

/**
 * NowIndicator supports two rendering modes:
 * 1. Weekly grid mode (dayColumnWidth + cellWidth provided): vertical line positioned by hour
 * 2. Legacy planner mode (no props): horizontal line positioned by time-of-day slot
 */
export const NowIndicator = memo(function NowIndicator({ dayColumnWidth, cellWidth }: NowIndicatorProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Weekly grid mode
  if (dayColumnWidth !== undefined && cellWidth !== undefined) {
    const fractional = now.getHours() + now.getMinutes() / 60;
    const left = dayColumnWidth + fractional * cellWidth;

    return (
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left, width: 1, backgroundColor: '#534AB7', zIndex: 20 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: 0,
            left: -2.5,
            width: 6,
            height: 6,
            backgroundColor: '#534AB7',
          }}
        />
      </div>
    );
  }

  // Legacy planner mode (horizontal)
  const GRID_START_HOUR = 7;
  const ROW_HEIGHT = 52;
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  if (currentHours < GRID_START_HOUR || currentHours >= 22) return null;
  const offset = (currentHours - GRID_START_HOUR) * ROW_HEIGHT + (currentMinutes / 60) * ROW_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 z-30 pointer-events-none"
      style={{ top: `${offset}px` }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-[#534AB7]" />
        <div className="flex-1 h-[1px] bg-[#534AB7]" />
      </div>
    </div>
  );
});
