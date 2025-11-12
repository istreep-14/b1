

import { Shift } from '../types';

/**
 * Parses various time input strings into HH:MM format.
 * Examples: "5p" -> "17:00", "130" -> "01:30", "1.5" -> "01:30", "1730" -> "17:30"
 * @param input The user's time string.
 * @param context 'start' or 'end' to help with AM/PM assumptions.
 * @param pairedTime The corresponding start time, used when context is 'end'.
 * @returns A time string in HH:MM format, or an empty string if invalid.
 */
export const parseTimeInput = (input: string, context: 'start' | 'end' = 'start', pairedTime?: string): string => {
  if (!input) return '';

  const cleaned = input.toLowerCase().trim().replace(/ /g, '');
  if (!cleaned) return '';

  const hasAM = cleaned.includes('a');
  const hasPM = cleaned.includes('p');
  let numericPart = cleaned.replace(/[amp.]/g, '');
  let hour = 0;
  let minute = 0;

  try {
    if (cleaned.includes('.')) {
      const parts = cleaned.replace(/[amp]/g, '').split('.');
      hour = parseInt(parts[0], 10);
      minute = Math.round(parseFloat(`0.${parts[1]}`) * 60);
    } else if (numericPart.length >= 3) { // Military time or shorthand like 130
      hour = parseInt(numericPart.slice(0, -2), 10);
      minute = parseInt(numericPart.slice(-2), 10);
    } else { // 1-2 digits, e.g., "5", "10"
      hour = parseInt(numericPart, 10);
      minute = 0;
    }
    
    if (isNaN(hour) || isNaN(minute)) return '';

    if (hasPM && hour < 12) {
      hour += 12;
    } else if (hasAM && hour === 12) { // Midnight case (12am)
      hour = 0;
    } else if (!hasAM && !hasPM) {
      // Apply assumptions if no AM/PM is specified
      if (context === 'start') {
        // Assume 1-8 are PM, 9-12 are AM for start times
        if (hour >= 1 && hour <= 8) hour += 12;
      } else if (context === 'end' && pairedTime) {
        const startHour = parseInt(pairedTime.split(':')[0], 10);
        // If hour is <= startHour, it could be PM or next day.
        if (hour <= startHour) {
            // e.g., start at 10:00 (10), end input "5". 5+12=17. 17 > 10, so 5 PM is logical.
            if (hour < 12 && (hour + 12) > startHour) {
                hour += 12;
            }
            // e.g., start at 17:00 (5pm), end input "1". 1+12=13. 13 is not > 17. So it must be 1 AM.
            // In this case, we do nothing and let it be 1.
        }
        // Handle the tricky "12" for overnight shifts
        if (hour === 12 && startHour >= 12) {
          hour = 0; // It's midnight
        }
      }
    }

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      const hourStr = String(hour).padStart(2, '0');
      const minStr = String(minute).padStart(2, '0');
      return `${hourStr}:${minStr}`;
    }

    return ''; // Invalid time
  } catch {
    return ''; // Parsing failed
  }
};


/**
 * Calculates the duration of a shift in hours.
 * Handles overnight shifts where the end time is on the next day.
 * @param date - The date of the shift start (YYYY-MM-DD).
 * @param startTime - The start time (HH:MM).
 * @param endTime - The end time (HH:MM).
 * @returns The total duration in hours, or 0 if times are invalid.
 */
export const calculateDurationHours = (date: string, startTime: string, endTime: string): number => {
  if (!date || !startTime || !endTime) return 0;

  try {
    const startDateTime = new Date(`${date}T${startTime}`);
    let endDateTime = new Date(`${date}T${endTime}`);

    // If end time is on the next day
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    if (isNaN(durationMs) || durationMs < 0) return 0;

    const durationHours = durationMs / (1000 * 60 * 60);
    return parseFloat(durationHours.toFixed(2));
  } catch (error) {
    console.error("Error calculating duration:", error);
    return 0;
  }
};

/**
 * Calculates tips earned per hour.
 * @param tips - Total tips for the shift.
 * @param durationHours - The duration of the shift in hours.
 * @returns The tips per hour, or 0 if duration is zero or invalid.
 */
export const calculateTipsPerHour = (tips: number | undefined, durationHours: number): number => {
  if (durationHours <= 0 || tips == null) return 0;
  const tipsPerHour = tips / durationHours;
  return parseFloat(tipsPerHour.toFixed(2));
};

/**
 * Formats a number as a currency string.
 * @param amount - The numerical amount.
 * @returns A string formatted as US currency (e.g., "$123.45").
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Formats a date string for display.
 * @param dateString - A date in 'YYYY-MM-DD' format.
 * @returns An object with the day of the week and a formatted date (e.g., 'Nov 7').
 */
export const formatDateForDisplay = (dateString: string): { dayOfWeek: string; formattedDate: string } => {
  if (!dateString) return { dayOfWeek: '', formattedDate: '' };
  try {
    // Adding T00:00:00 avoids timezone issues where new Date() might interpret the date in UTC
    // and shift it to the previous day depending on the user's local timezone.
    const date = new Date(`${dateString}T00:00:00`);
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dayOfWeek, formattedDate };
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return { dayOfWeek: 'Invalid Date', formattedDate: dateString };
  }
};

/**
 * Formats a date string for the main header display.
 * @param dateString - A date in 'YYYY-MM-DD' format.
 * @returns An object with the full day of week and a long-form date (e.g., 'July 24, 2024').
 */
export const formatDateForHeader = (dateString: string): { dayOfWeek: string; formattedDate: string } => {
  if (!dateString) return { dayOfWeek: '', formattedDate: '' };
  try {
    const date = new Date(`${dateString}T00:00:00`);
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return { dayOfWeek, formattedDate };
  } catch (error) {
    console.error("Error formatting date for header:", dateString, error);
    return { dayOfWeek: 'Invalid Date', formattedDate: dateString };
  }
};

/**
 * Formats a time string for display.
 * @param timeString - A time in 'HH:MM' (24-hour) format.
 * @returns A string formatted as 12-hour time with AM/PM (e.g., "5:00 PM").
 */
export const formatTimeForDisplay = (timeString: string): string => {
  if (!timeString || !timeString.includes(':')) return '';
  try {
    // Create a date object with a dummy date to parse the time.
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (error) {
    console.error("Error formatting time:", timeString, error);
    return timeString;
  }
};