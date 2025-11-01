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
    } else if (typeof dateInput === "string" || typeof dateInput === "number") {
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
      throw new Error("Invalid date");
    }

    // If any input was provided, return Date object
    if (dateInput !== null || timeInput !== null) {
      return dateObj;
    }

    // If no inputs provided, return formatted object (for current date-time)
    return formatDateTime(dateObj);
  } catch (error) {
    console.error("DateTime parsing error:", error.message);
    return new Date(); // Fallback to current date
  }
}

/**
 * Parse various date input formats and return Date object
 */
function parseDateInput(input) {
  if (!input) return new Date();

  const cleanInput = input
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "-");
  const parts = cleanInput.split("-").filter((part) => part !== "");

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
      throw new Error("Invalid date format");
  }

  // Validate numeric values
  if ([day, month, year].some(isNaN)) {
    throw new Error("Invalid date values");
  }

  return new Date(year, month - 1, day);
}

/**
 * Apply time to a date object
 */
function applyTimeToDate(dateObj, timeInput) {
  const cleanInput = timeInput.toString().trim().toLowerCase();

  // Handle AM/PM
  let isPM = cleanInput.includes("pm") || cleanInput.includes("p");
  const cleanedTime = cleanInput.replace(/[apm]/g, "").replace(/[^0-9]/g, ":");

  const parts = cleanedTime.split(":").filter((part) => part !== "");
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
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  // Convert to 12-hour format
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hoursFormatted = String(hours).padStart(2, "0");

  return {
    dateString: `${day}-${month}-${year}`,
    timeString: `${hoursFormatted}:${minutes} ${period}`,
    timeStamp: `${day}-${month}-${year} ${hoursFormatted}:${minutes} ${period}`,
    dateObject: dateObj,
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

/**
 * Format a date into "dd-mm-yyyy hh:mm:ss AM/PM" format,
 * or human-friendly text like "just now", "yesterday at 3:00 PM", etc.
 *
 * @param {Date | string | number} input - The date to format.
 * @param {"date" | "time" | "datetime"} [type="datetime"] - Output format type.
 * @param {object} [options] - Additional options.
 * @param {boolean} [options.relative=false] - Return human-friendly relative time ("2 hours ago").
 * @param {boolean} [options.smart=false] - Return extra-smart format ("Today at 3:00 PM").
 * @param {Array<Function>} [options.customRules=[]] - Custom smart formatters.
 * @returns {string} Formatted or smart date/time string.
 */
export function humanizeDateTime(input, type = "datetime", options = {}) {
  if (!input) return "";

  const { relative = false, smart = false, customRules = [] } = options;
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date)) return "";

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  // 🧩 Allow user-defined custom rules
  for (const rule of customRules) {
    const result = rule(date, { now, diffSec, diffMin, diffHr, diffDay });
    if (result) return result;
  }

  // 🧠 Extra-smart mode
  if (smart) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hourStr = String(hours).padStart(2, "0");

    const timeStr = `${hourStr}:${minutes}:${seconds} ${ampm}`;
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (diffSec < 10) return "Just now";
    if (diffMin < 1) return `${diffSec} seconds ago`;
    if (isToday && diffHr < 1)
      return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
    if (isToday) return `Today at ${timeStr}`;
    if (isYesterday) return `Yesterday at ${timeStr}`;
    if (diffDay < 7) return `${diffDay} days ago at ${timeStr}`;
    return `${day}-${month}-${year} ${timeStr}`;
  }

  // 🕒 Relative mode (simpler) with threshold
  // Common threshold for "seconds ago"
  const SECONDS_THRESHOLD = 10; // change this value as needed

  if (relative) {
    if (diffSec < SECONDS_THRESHOLD) return "Just now"; // anything less than threshold
    if (diffSec < 60) {
      // Round down to nearest threshold seconds
      const roundedSec =
        Math.floor(diffSec / SECONDS_THRESHOLD) * SECONDS_THRESHOLD;
      return `${roundedSec} sec${roundedSec > 1 ? "s" : ""} ago`;
    }
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay} days ago`;
  }

  // 🗓 Default format
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hourStr = String(hours).padStart(2, "0");

  const dateStr = `${day}-${month}-${year}`;
  const timeStr = `${hourStr}:${minutes}:${seconds} ${ampm}`;

  if (type === "date") return dateStr;
  if (type === "time") return timeStr;
  return `${dateStr} ${timeStr}`;
}

// Default export for backward compatibility
export default {
  parseDateTime,
  getCurrentDateTime,
  convertToDate,
  convertToTime,
  formatDateObject,
  humanizeDateTime,
};
