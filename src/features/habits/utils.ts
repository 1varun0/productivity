import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, isFuture, isPast } from 'date-fns';

export function getCurrentMonthDays(baseDate: Date = new Date()) {
  const start = startOfMonth(baseDate);
  const end = endOfMonth(baseDate);
  
  return eachDayOfInterval({ start, end }).map(date => {
    return {
      date,
      dateString: format(date, 'yyyy-MM-dd'),
      dayLetter: format(date, 'EEEEE'), // e.g., 'M', 'T', 'W'
      dayNumber: format(date, 'd'), // e.g., '1', '12'
      isToday: isToday(date),
      isFuture: isFuture(date) && !isToday(date), // prevent today from being marked as future
      isPast: isPast(date) && !isToday(date),
    };
  });
}
