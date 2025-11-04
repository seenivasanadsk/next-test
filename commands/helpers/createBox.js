// commands\helpers\createBox.js
import formatText from "./formatText.js";

export default function createBox(text, options = {}) {
  const {
    borderColor = "cyan",
    borderStyle = "single",
    padding = 1,
    margin = 0,
    align = "left",
    textColor = "white",
  } = options;

  const borders = {
    single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
    double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
    rounded: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
  };

  const border = borders[borderStyle] || borders.single;
  const lines = text.split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length));
  const width = maxLen + padding * 2;

  let result = "";

  if (margin > 0) result += "\n".repeat(margin);

  // Top border
  result +=
    formatText(border.tl + border.h.repeat(width) + border.tr, {
      color: borderColor,
    }) + "\n";

  // Padding top
  for (let i = 0; i < padding; i++)
    result +=
      formatText(border.v + " ".repeat(width) + border.v, {
        color: borderColor,
      }) + "\n";

  // Content lines
  lines.forEach((line) => {
    let aligned = line;
    const spaces = width - line.length;
    if (align === "center") {
      const left = Math.floor(spaces / 2);
      aligned = " ".repeat(left) + line + " ".repeat(spaces - left);
    } else if (align === "right") {
      aligned = " ".repeat(spaces) + line;
    } else {
      aligned = line + " ".repeat(spaces);
    }

    result += formatText(border.v, { color: borderColor });
    result += formatText(aligned, { color: textColor });
    result += formatText(border.v, { color: borderColor }) + "\n";
  });

  // Padding bottom
  for (let i = 0; i < padding; i++)
    result +=
      formatText(border.v + " ".repeat(width) + border.v, {
        color: borderColor,
      }) + "\n";

  // Bottom border
  result += formatText(border.bl + border.h.repeat(width) + border.br, {
    color: borderColor,
  });

  if (margin > 0) result += "\n".repeat(margin);

  return result;
}
