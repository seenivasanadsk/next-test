/**
 * 🔹 Convert string values to proper JS types.
 * Also safely detects and parses JSON strings.
 */
function autoCast(value) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  // Try simple primitive conversions
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (trimmed === "undefined") return undefined;

  // Try number conversion
  if (!isNaN(trimmed) && trimmed !== "") return Number(trimmed);

  // Try JSON object/array parsing
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // if invalid JSON, keep original string
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * 🔹 Deeply normalize any kind of data (object, array, primitives).
 * Converts strings, nested JSON strings, and mixed values recursively.
 */
export default function normalizeData(input) {
  const casted = autoCast(input);

  // Recurse into arrays
  if (Array.isArray(casted)) {
    return casted.map((item) => normalizeData(item));
  }

  // Recurse into objects
  if (casted && typeof casted === "object" && !Array.isArray(casted)) {
    const normalizedObj = {};
    for (const [key, value] of Object.entries(casted)) {
      normalizedObj[key] = normalizeData(value);
    }
    return normalizedObj;
  }

  return casted;
}
