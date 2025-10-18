/**
 * Advanced stringCase utility (safe version)
 * Only converts when input is a string.
 * Non-strings are returned unchanged.
 */
export default {
    // UPPERCASE
    upper: (str) =>
        typeof str === "string" ? str.toUpperCase() : str,

    // lowercase
    lower: (str) =>
        typeof str === "string" ? str.toLowerCase() : str,

    // Simple Title Case (Every Word Capitalized)
    title: (str) =>
        typeof str === "string"
            ? str
                .toLowerCase()
                .split(/\s+/)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
            : str,

    // Paragraph style (capitalize first letter only)
    para: (str) =>
        typeof str === "string"
            ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
            : str,

    // Smart Title Case
    smartTitle: (str) => {
        if (typeof str !== "string") return str;
        if (!str) return "";

        const lowerWords = new Set([
            "a", "an", "the",
            "and", "but", "or", "nor", "for", "so", "yet",
            "at", "by", "in", "of", "on", "to", "up", "off", "out", "over", "per",
            "from", "with", "about", "as", "into", "like", "onto", "than", "via",
        ]);

        const words = str
            .replace(/[_-]+/g, " ") // normalize separators
            .split(/\s+/);

        return words
            .map((word, i) => {
                if (!word) return "";
                if (/^[A-Z0-9]+$/.test(word)) return word; // acronyms
                if (i === 0 || i === words.length - 1) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
                if (lowerWords.has(word.toLowerCase())) return word.toLowerCase();
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(" ");
    },

    // camelCase
    camel: (str) =>
        typeof str === "string"
            ? str
                .toLowerCase()
                .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
            : str,

    // PascalCase
    pascal: (str) => {
        if (typeof str !== "string") return str;
        const camel = stringCase.camel(str);
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    },

    // kebab-case
    kebab: (str) =>
        typeof str === "string"
            ? str
                .replace(/([a-z])([A-Z])/g, "$1-$2")
                .replace(/[\s_]+/g, "-")
                .toLowerCase()
            : str,

    // snake_case
    snake: (str) =>
        typeof str === "string"
            ? str
                .replace(/([a-z])([A-Z])/g, "$1_$2")
                .replace(/[\s-]+/g, "_")
                .toLowerCase()
            : str,
};
