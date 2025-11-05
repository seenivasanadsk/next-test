import { autoCast } from "../utils/normalizeData.js";
import format from "./helpers/formatText.js";

function listCommand(commands) {
  console.log(format("Available commands:\n", { color: "cyan" }));
  // Sort commands alphabetically by name
  const entries = Object.entries(commands).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  // Find longest command name for alignment
  const longestNameLength = Math.max(...entries.map(([name]) => name.length));
  const padding = 4;
  for (const [name, { desc }] of entries) {
    const spaces = " ".repeat(longestNameLength - name.length + padding);
    console.log(format(`${name}${spaces}- ${desc}`, { color: "yellow" }));
  }
  console.log();
  process.exit(0);
}

function commandNotFound(command) {
  console.log(
    format(`The command "${command}" does not exist.`, { color: "red" })
  );
  console.log();
  console.log(format("To see available commands, run:", { color: "white" }));
  console.log(format("\tnode command list", { color: "yellow" }));
  process.exit(1);
}

function parseCommand() {
  const [, , rawCommand, ...rest] = process.argv;
  if (!rawCommand) return { command: undefined };
  const parts = rawCommand.split(":");
  const [command, ...sub] = parts;
  const flags = {};
  const args = [];
  for (const arg of rest) {
    if (arg.startsWith("--")) {
      const [k, v] = arg.slice(2).split("=");
      flags[k] = autoCast(v) || true;
    } else if (arg.startsWith("-")) {
      flags[arg.slice(1)] = true;
    } else {
      args.push(arg);
    }
  }
  return { command, sub, flags, args };
}

// Run the dynamically imported command file
async function runCommand({ commandFile, command, sub, flags, args }) {
  try {
    const module = await import(`./${commandFile}`);
    module.default?.({ command, sub, flags, args }); // Assuming the command file has a default export function
  } catch (error) {
    console.error(
      format(`Failed to run command file: ${commandFile}`, { color: "red" })
    );
    console.error(error);
    process.exit(1);
  }
}

export default function bootCommand(commands) {
  const { command, sub, flags, args } = parseCommand();
  console.log(); // add an empty line for spacing
  if (command === "list" || !command) {
    listCommand(commands);
  }
  const commandFile = commands[command]?.file;
  if (!commandFile) {
    commandNotFound(command); // Pass command name to show error
  } else {
    runCommand({ commandFile, command, sub, flags, args });
  }
}
