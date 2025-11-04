// commands\helpers\formatText.js
export default function formatText(text, options = {}) {
  const styles = {
    // Reset
    reset: "\x1b[0m",

    // Text colors
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",

    // Bright colors
    brightRed: "\x1b[91m",
    brightGreen: "\x1b[92m",
    brightYellow: "\x1b[93m",
    brightBlue: "\x1b[94m",
    brightMagenta: "\x1b[95m",
    brightCyan: "\x1b[96m",
    brightWhite: "\x1b[97m",

    // Background colors
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
    bgGray: "\x1b[100m",

    // Bright background colors
    bgBrightRed: "\x1b[101m",
    bgBrightGreen: "\x1b[102m",
    bgBrightYellow: "\x1b[103m",
    bgBrightBlue: "\x1b[104m",
    bgBrightMagenta: "\x1b[105m",
    bgBrightCyan: "\x1b[106m",
    bgBrightWhite: "\x1b[107m",

    // Text styles
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
    blink: "\x1b[5m",
    inverse: "\x1b[7m",
    hidden: "\x1b[8m",
    strikethrough: "\x1b[9m",
  };

  // Helpers for RGB
  const rgb = (r, g, b) => `\x1b[38;2;${r};${g};${b}m`;
  const bgRgb = (r, g, b) => `\x1b[48;2;${r};${g};${b}m`;

  // Find a styles key by case-insensitive match (returns matched key or undefined)
  function findStyleKeyInsensitive(name) {
    if (!name || typeof name !== "string") return undefined;
    if (styles[name]) return name; // exact match (handles camelCase)
    const lower = name.toLowerCase();
    return Object.keys(styles).find((k) => k.toLowerCase() === lower);
  }

  let result = "";

  // Handle text color
  if (options.color) {
    if (Array.isArray(options.color) && options.color.length === 3) {
      result += rgb(...options.color);
    } else if (
      typeof options.color === "object" &&
      options.color.r !== undefined
    ) {
      result += rgb(options.color.r, options.color.g, options.color.b);
    } else if (typeof options.color === "string") {
      const key = findStyleKeyInsensitive(options.color);
      if (key) result += styles[key];
      // else leave it (no color)
    }
  }

  // Handle background color
  if (options.bgColor) {
    if (Array.isArray(options.bgColor) && options.bgColor.length === 3) {
      result += bgRgb(...options.bgColor);
    } else if (
      typeof options.bgColor === "object" &&
      options.bgColor.r !== undefined
    ) {
      result += bgRgb(options.bgColor.r, options.bgColor.g, options.bgColor.b);
    } else if (typeof options.bgColor === "string") {
      // accept "bgBrightGreen", "brightGreen" or "BrightGreen" — normalize
      const candidate1 = options.bgColor.startsWith("bg")
        ? options.bgColor
        : `bg${
            options.bgColor.charAt(0).toUpperCase() + options.bgColor.slice(1)
          }`;
      const key =
        findStyleKeyInsensitive(candidate1) ||
        findStyleKeyInsensitive(options.bgColor);
      if (key) result += styles[key];
    }
  }

  // Handle text styles (bold, underline, etc.)
  if (options.styles) {
    const styleArray = Array.isArray(options.styles)
      ? options.styles
      : [options.styles];
    styleArray.forEach((style) => {
      const key = findStyleKeyInsensitive(style);
      if (key) result += styles[key];
    });
  }

  return `${result}${text}${styles.reset}`;
}
