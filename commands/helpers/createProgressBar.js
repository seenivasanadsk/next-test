// commands\helpers\createProgressBar.js
import formatText from "./formatText.js";

export default function createProgress(options = {}) {
  const {
    total = 100, // total units of work
    width = 30, // bar length
    filledChar = "█",
    emptyChar = "░",
    filledColor = "brightGreen",
    emptyColor = "gray",
    percentageColor = "white",
    showPercentage = true,
    label = "",
  } = options;

  let current = 0;
  let stopped = false;

  function render() {
    const percentage = Math.min((current / total) * 100, 100);
    const filledWidth = Math.round((percentage / 100) * width);
    const emptyWidth = width - filledWidth;

    const filled = formatText(filledChar.repeat(filledWidth), {
      color: filledColor,
    });
    const empty = formatText(emptyChar.repeat(emptyWidth), {
      color: emptyColor,
    });

    let bar = `${filled}${empty}`;
    if (showPercentage) {
      bar += ` ${formatText(`${percentage.toFixed(0)}%`, {
        color: percentageColor,
      })}`;
    }

    if (label) bar = `${label} ${bar}`;

    process.stdout.write(`\r${bar}`);
  }

  return {
    update(progress) {
      if (stopped) return;
      current = Math.min(progress, total);
      render();
      if (current >= total) this.stop();
    },
    increment(step = 1) {
      this.update(current + step);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      process.stdout.write("\n");
    },
  };
}
