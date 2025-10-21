/**
 * Utility functions for date formatting
 */

/**
 * Format a date string to Polish locale with date and time
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in Polish locale
 */
export const formatDateTime = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Nieznana data';
  }
};

/**
 * Format a date string to Polish locale (date only)
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in Polish locale
 */
export const formatDate = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Nieznana data';
  }
};

/**
 * Format a date string to relative time (e.g., "2 dni temu")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string in Polish
 */
export const formatRelativeTime = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Przed chwilą';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minut temu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} godzin temu`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} dni temu`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} miesięcy temu`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} lat temu`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Nieznana data';
  }
};

