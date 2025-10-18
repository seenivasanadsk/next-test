/**
 * Consolidated Date-Time Utilities
 * Handles all date/time conversions and formatting
 */

// Default configuration
const DEFAULT_TIMEZONE = process.env.TIMEZONE || "UTC";

/**
 * Main date-time parser - returns Date object when inputs are provided
 */
export function parseDateTime(dateInput = null, timeInput = null) {
    try {
        let dateObj;

        // Handle different input types for date
        if (dateInput instanceof Date) {
            dateObj = new Date(dateInput);
        } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
            dateObj = parseDateInput(dateInput);
        } else {
            dateObj = new Date(); // Default to current date
        }

        // Apply time if provided
        if (timeInput) {
            applyTimeToDate(dateObj, timeInput);
        }

        // Validate the date
        if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
        }

        // If any input was provided, return Date object
        if (dateInput !== null || timeInput !== null) {
            return dateObj;
        }

        // If no inputs provided, return formatted object (for current date-time)
        return formatDateTime(dateObj);

    } catch (error) {
        console.error('DateTime parsing error:', error.message);
        return new Date(); // Fallback to current date
    }
}

/**
 * Parse various date input formats and return Date object
 */
function parseDateInput(input) {
    if (!input) return new Date();

    const cleanInput = input.toString().trim().replace(/[^a-zA-Z0-9]/g, '-');
    const parts = cleanInput.split('-').filter(part => part !== '');

    const now = new Date();
    let day, month, year;

    switch (parts.length) {
        case 1: // Day only
            day = parseInt(parts[0]);
            month = now.getMonth() + 1;
            year = now.getFullYear();
            break;
        case 2: // Day and month
            day = parseInt(parts[0]);
            month = parseInt(parts[1]);
            year = now.getFullYear();
            break;
        case 3: // Day, month, year
            day = parseInt(parts[0]);
            month = parseInt(parts[1]);
            year = parseInt(parts[2]);
            // Handle 2-digit years
            if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;
            break;
        default:
            throw new Error('Invalid date format');
    }

    // Validate numeric values
    if ([day, month, year].some(isNaN)) {
        throw new Error('Invalid date values');
    }

    return new Date(year, month - 1, day);
}

/**
 * Apply time to a date object
 */
function applyTimeToDate(dateObj, timeInput) {
    const cleanInput = timeInput.toString().trim().toLowerCase();

    // Handle AM/PM
    let isPM = cleanInput.includes('pm') || cleanInput.includes('p');
    const cleanedTime = cleanInput.replace(/[apm]/g, '').replace(/[^0-9]/g, ':');

    const parts = cleanedTime.split(':').filter(part => part !== '');
    let hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;

    // Convert to 24-hour format
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    dateObj.setHours(hours, minutes, seconds, 0);
}

/**
 * Format date object to standard strings
 */
function formatDateTime(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hoursFormatted = String(hours).padStart(2, '0');

    return {
        dateString: `${day}-${month}-${year}`,
        timeString: `${hoursFormatted}:${minutes} ${period}`,
        timeStamp: `${day}-${month}-${year} ${hoursFormatted}:${minutes} ${period}`,
        dateObject: dateObj
    };
}

/**
 * Get current date-time (always returns formatted object)
 */
export function getCurrentDateTime(timezone = DEFAULT_TIMEZONE) {
    return formatDateTime(new Date());
}

/**
 * Convert any input to date string
 */
export function convertToDate(input) {
    if (!input) return getCurrentDateTime().dateString;

    const result = parseDateTime(input);
    if (result instanceof Date) {
        return formatDateTime(result).dateString;
    }
    return result.dateString;
}

/**
 * Convert any input to time string
 */
export function convertToTime(input) {
    if (!input) return getCurrentDateTime().timeString;

    // Create a date with current date but specified time
    const dateWithTime = parseDateTime(new Date(), input);
    return formatDateTime(dateWithTime).timeString;
}

/**
 * Parse existing Date object to formatted strings (replaces old parseDateTime)
 */
export function formatDateObject(dateObject = new Date()) {
    if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
        return getCurrentDateTime();
    }
    return formatDateTime(dateObject);
}

// Default export for backward compatibility
export default {
    parseDateTime,
    getCurrentDateTime,
    convertToDate,
    convertToTime,
    formatDateObject
};