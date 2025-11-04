function formatText(text, options = {}) {
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

  // RGB functions
  function rgb(r, g, b) {
    return `\x1b[38;2;${r};${g};${b}m`;
  }

  function bgRgb(r, g, b) {
    return `\x1b[48;2;${r};${g};${b}m`;
  }

  let result = "";

  // Handle color (text color)
  if (options.color) {
    if (Array.isArray(options.color) && options.color.length === 3) {
      result += rgb(...options.color);
    } else if (
      typeof options.color === "object" &&
      options.color.r !== undefined
    ) {
      result += rgb(options.color.r, options.color.g, options.color.b);
    } else if (typeof options.color === "string") {
      result += styles[options.color.toLowerCase()] || "";
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
      const key = `bg${
        options.bgColor.charAt(0).toUpperCase() +
        options.bgColor.slice(1).toLowerCase()
      }`;
      result += styles[key] || "";
    }
  }

  // Handle text styles
  if (options.styles) {
    const styleArray = Array.isArray(options.styles)
      ? options.styles
      : [options.styles];
    styleArray.forEach((style) => {
      if (styles[style]) {
        result += styles[style];
      }
    });
  }

  return `${result}${text}${styles.reset}`;
}

// Table formatting function
function createTable(data, options = {}) {
  const {
    headers = [],
    borderColor = "white",
    headerColor = "brightCyan",
    cellColor = "white",
    borderStyle = "double",
    padding = 1,
  } = options;

  const borders = {
    single: {
      topLeft: "┌",
      topRight: "┐",
      bottomLeft: "└",
      bottomRight: "┘",
      horizontal: "─",
      vertical: "│",
      topT: "┬",
      bottomT: "┴",
      leftT: "├",
      rightT: "┤",
      cross: "┼",
    },
    double: {
      topLeft: "╔",
      topRight: "╗",
      bottomLeft: "╚",
      bottomRight: "╝",
      horizontal: "═",
      vertical: "║",
      topT: "╦",
      bottomT: "╩",
      leftT: "╠",
      rightT: "╣",
      cross: "╬",
    },
    rounded: {
      topLeft: "╭",
      topRight: "╮",
      bottomLeft: "╰",
      bottomRight: "╯",
      horizontal: "─",
      vertical: "│",
      topT: "┬",
      bottomT: "┴",
      leftT: "├",
      rightT: "┤",
      cross: "┼",
    },
  };

  const border = borders[borderStyle] || borders.double;

  // Calculate column widths
  const colWidths = headers.map((header, index) => {
    const headerLen = String(header).length;
    const maxDataLen = Math.max(
      ...data.map((row) => String(row[index] || "").length)
    );
    return Math.max(headerLen, maxDataLen) + padding * 2;
  });

  // Create top border
  let table = formatText(border.topLeft, { color: borderColor });
  colWidths.forEach((width, i) => {
    table += formatText(border.horizontal.repeat(width), {
      color: borderColor,
    });
    table += formatText(
      i === colWidths.length - 1 ? border.topRight : border.topT,
      { color: borderColor }
    );
  });
  table += "\n";

  // Create header row
  if (headers.length > 0) {
    table += formatText(border.vertical, { color: borderColor });
    headers.forEach((header, i) => {
      const paddedHeader = ` ${String(header).padEnd(colWidths[i] - 1)}`;
      table += formatText(paddedHeader, {
        color: headerColor,
        styles: ["bold"],
      });
      table += formatText(border.vertical, { color: borderColor });
    });
    table += "\n";

    // Create header separator
    table += formatText(border.leftT, { color: borderColor });
    colWidths.forEach((width, i) => {
      table += formatText(border.horizontal.repeat(width), {
        color: borderColor,
      });
      table += formatText(
        i === colWidths.length - 1 ? border.rightT : border.cross,
        { color: borderColor }
      );
    });
    table += "\n";
  }

  // Create data rows
  data.forEach((row) => {
    table += formatText(border.vertical, { color: borderColor });
    row.forEach((cell, i) => {
      const paddedCell = ` ${String(cell).padEnd(colWidths[i] - 1)}`;
      table += formatText(paddedCell, { color: cellColor });
      table += formatText(border.vertical, { color: borderColor });
    });
    table += "\n";
  });

  // Create bottom border
  table += formatText(border.bottomLeft, { color: borderColor });
  colWidths.forEach((width, i) => {
    table += formatText(border.horizontal.repeat(width), {
      color: borderColor,
    });
    table += formatText(
      i === colWidths.length - 1 ? border.bottomRight : border.bottomT,
      { color: borderColor }
    );
  });

  return table;
}

// Progress bar function
function createProgressBar(percentage, options = {}) {
  const {
    width = 20,
    filledChar = "█",
    emptyChar = "░",
    filledColor = "green",
    emptyColor = "gray",
    showPercentage = true,
    percentageColor = "white",
  } = options;

  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;

  const filledBar = formatText(filledChar.repeat(filledWidth), {
    color: filledColor,
  });
  const emptyBar = formatText(emptyChar.repeat(emptyWidth), {
    color: emptyColor,
  });

  let bar = `${filledBar}${emptyBar}`;

  if (showPercentage) {
    bar += formatText(` ${percentage}%`, { color: percentageColor });
  }

  return bar;
}

// Box formatting function
function createBox(text, options = {}) {
  const {
    borderColor = "cyan",
    textColor = "white",
    borderStyle = "single",
    padding = 1,
    margin = 0,
    align = "left",
  } = options;

  const borders = {
    single: {
      tl: "┌",
      tr: "┐",
      bl: "└",
      br: "┘",
      h: "─",
      v: "│",
    },
    double: {
      tl: "╔",
      tr: "╗",
      bl: "╚",
      br: "╝",
      h: "═",
      v: "║",
    },
    rounded: {
      tl: "╭",
      tr: "╮",
      bl: "╰",
      br: "╯",
      h: "─",
      v: "│",
    },
  };

  const border = borders[borderStyle] || borders.single;
  const lines = text.split("\n");
  const maxLength = Math.max(...lines.map((line) => line.length));
  const boxWidth = maxLength + padding * 2;

  let result = "";

  // Top margin
  if (margin > 0) {
    result += "\n".repeat(margin);
  }

  // Top border
  result +=
    formatText(border.tl + border.h.repeat(boxWidth) + border.tr, {
      color: borderColor,
    }) + "\n";

  // Padding top
  for (let i = 0; i < padding; i++) {
    result +=
      formatText(border.v + " ".repeat(boxWidth) + border.v, {
        color: borderColor,
      }) + "\n";
  }

  // Content
  lines.forEach((line) => {
    const spaces = boxWidth - line.length;
    let alignedLine = line;

    if (align === "center") {
      const leftSpaces = Math.floor(spaces / 2);
      const rightSpaces = spaces - leftSpaces;
      alignedLine = " ".repeat(leftSpaces) + line + " ".repeat(rightSpaces);
    } else if (align === "right") {
      alignedLine = " ".repeat(spaces) + line;
    } else {
      alignedLine = line + " ".repeat(spaces);
    }

    result +=
      formatText(border.v + alignedLine + border.v, { color: borderColor }) +
      "\n";
  });

  // Padding bottom
  for (let i = 0; i < padding; i++) {
    result +=
      formatText(border.v + " ".repeat(boxWidth) + border.v, {
        color: borderColor,
      }) + "\n";
  }

  // Bottom border
  result += formatText(border.bl + border.h.repeat(boxWidth) + border.br, {
    color: borderColor,
  });

  // Bottom margin
  if (margin > 0) {
    result += "\n".repeat(margin);
  }

  return result;
}

// Export all functions
module.exports = {
  formatText,
  createTable,
  createProgressBar,
  createBox,
};

// Example usage:
console.log("\n" + "=".repeat(50));
console.log("TEXT FORMATTING EXAMPLES");
console.log("=".repeat(50));

// Basic text formatting
console.log(formatText("Bold red text", { color: "red", styles: "bold" }));
console.log(
  formatText("Underlined green text", { color: "green", styles: "underline" })
);
console.log(
  formatText("Italic blue on yellow background", {
    color: "blue",
    bgColor: "yellow",
    styles: ["italic", "bold"],
  })
);
console.log(
  formatText("Custom RGB text", { color: [255, 128, 0], styles: "bold" })
);
console.log(
  formatText("Multiple styles", {
    color: "brightMagenta",
    styles: ["bold", "underline", "italic"],
  })
);

// Table example
console.log("\n" + "=".repeat(50));
console.log("TABLE EXAMPLE");
console.log("=".repeat(50));

const tableData = [
  ["John", "25", "Engineer"],
  ["Alice", "30", "Designer"],
  ["Bob", "28", "Developer"],
  ["Carol", "35", "Manager"],
];

const tableHeaders = ["Name", "Age", "Occupation"];

console.log(
  createTable(tableData, {
    headers: tableHeaders,
    borderColor: "blue",
    headerColor: "brightYellow",
    cellColor: "white",
    borderStyle: "rounded",
  })
);

// Progress bar example
console.log("\n" + "=".repeat(50));
console.log("PROGRESS BAR EXAMPLES");
console.log("=".repeat(50));

for (let i = 0; i <= 100; i += 25) {
  console.log(
    createProgressBar(i, {
      width: 30,
      filledColor: i < 50 ? "red" : i < 75 ? "yellow" : "green",
    })
  );
}

// Box example
console.log("\n" + "=".repeat(50));
console.log("TEXT BOX EXAMPLES");
console.log("=".repeat(50));

console.log(
  createBox(
    "Important Notice!\nThis is a message in a box.\nIt can contain multiple lines.",
    {
      borderColor: "brightRed",
      textColor: "white",
      borderStyle: "double",
      padding: 1,
      align: "center",
    }
  )
);

console.log(
  createBox("Success!", {
    borderColor: "green",
    textColor: "brightGreen",
    borderStyle: "rounded",
    padding: 2,
    align: "center",
  })
);
