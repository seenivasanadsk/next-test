// commands\helpers\createTable.js
import formatText from "./formatText.js";

export default function createTable(data, options = {}) {
  const {
    headers = [],
    borderColor = "white",
    headerColor = "brightCyan",
    cellColor = "white",
    borderStyle = "double",
    padding = 1,
  } = options;

  const borders = {
    double: {
      tl: "╔",
      tr: "╗",
      bl: "╚",
      br: "╝",
      h: "═",
      v: "║",
      topT: "╦",
      bottomT: "╩",
      leftT: "╠",
      rightT: "╣",
      cross: "╬",
    },
    single: {
      tl: "┌",
      tr: "┐",
      bl: "└",
      br: "┘",
      h: "─",
      v: "│",
      topT: "┬",
      bottomT: "┴",
      leftT: "├",
      rightT: "┤",
      cross: "┼",
    },
  };

  const border = borders[borderStyle] || borders.double;
  const colWidths = headers.map((header, i) => {
    const maxData = Math.max(...data.map((r) => String(r[i] || "").length));
    return Math.max(String(header).length, maxData) + padding * 2;
  });

  const repeat = (char, count) => char.repeat(count);

  // Top border
  let table = formatText(border.tl, { color: borderColor });
  colWidths.forEach((w, i) => {
    table += formatText(repeat(border.h, w), { color: borderColor });
    table += formatText(i === colWidths.length - 1 ? border.tr : border.topT, {
      color: borderColor,
    });
  });
  table += "\n";

  // Headers
  if (headers.length) {
    table += formatText(border.v, { color: borderColor });
    headers.forEach((h, i) => {
      const padded = ` ${String(h).padEnd(colWidths[i] - 1)}`;
      table += formatText(padded, { color: headerColor, styles: "bold" });
      table += formatText(border.v, { color: borderColor });
    });
    table += "\n";

    // Header divider
    table += formatText(border.leftT, { color: borderColor });
    colWidths.forEach((w, i) => {
      table += formatText(repeat(border.h, w), { color: borderColor });
      table += formatText(
        i === colWidths.length - 1 ? border.rightT : border.cross,
        { color: borderColor }
      );
    });
    table += "\n";
  }

  // Rows
  data.forEach((row) => {
    table += formatText(border.v, { color: borderColor });
    row.forEach((cell, i) => {
      const padded = ` ${String(cell).padEnd(colWidths[i] - 1)}`;
      table += formatText(padded, { color: cellColor });
      table += formatText(border.v, { color: borderColor });
    });
    table += "\n";
  });

  // Bottom border
  table += formatText(border.bl, { color: borderColor });
  colWidths.forEach((w, i) => {
    table += formatText(repeat(border.h, w), { color: borderColor });
    table += formatText(
      i === colWidths.length - 1 ? border.br : border.bottomT,
      { color: borderColor }
    );
  });

  return table;
}
