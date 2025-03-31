import { format, parseISO, isValid, isToday, isYesterday, subDays, addDays, differenceInDays } from 'date-fns';

/**
 * Format a date string or Date object to a human-readable format
 */
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  
  return format(dateObj, formatStr);
};

/**
 * Format a date to a relative format (Today, Yesterday, or date)
 */
export const formatRelativeDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  
  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';
  
  return format(dateObj, 'MMM dd, yyyy');
};

/**
 * Get the week range as a string (e.g., "May 1 - May 7")
 */
export const getWeekRangeString = (date: Date = new Date()): string => {
  const startOfWeek = subDays(date, date.getDay());
  const endOfWeek = addDays(startOfWeek, 6);
  
  return `${format(startOfWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
};

/**
 * Parse a date string safely
 */
export const safeParseDate = (dateString: string): Date | null => {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Format a date for input[type="date"]
 */
export const formatDateForInput = (date: Date | null): string => {
  if (!date || !isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
};

/**
 * Calculate the difference in days between two dates
 */
export const daysBetween = (startDate: Date, endDate: Date): number => {
  return differenceInDays(endDate, startDate);
};

/**
 * Get an array of dates between start and end date
 */
export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};
