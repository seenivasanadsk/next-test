/**
 * Log Manager Command
 * ---------------------------------------------------
 * Subcommands:
 *   log list   → Show latest N log lines
 *   log clean  → Delete old logs or all with --force
 *   log stats  → Show total log files and sizes
 *
 * Flags & Config priority:
 *   Flags > commandConfig > Defaults
 * ---------------------------------------------------
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import commandConfig from "../config/command.js";
import formatText from "./helpers/formatText.js";
import { parseDateTime } from "../utils/dateTime.js";

/**
 * Get flag/config/default priority
 */
function getConfigValue(flags, config, key, def) {
    if (flags[key] !== undefined) return flags[key];
    if (config[key] !== undefined) return config[key];
    return def;
}

/**
 * Exit with error message
 */
function exitWithError(message, example = "") {
    console.log(formatText(`❌ ${message}`, { color: "red" }));
    if (example) {
        console.log(formatText(`Example: ${example}`, { color: "yellow" }));
    }
    process.exit(1);
}

/**
 * Confirm action
 */
async function confirmAction(message) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(formatText(`${message} (y/N): `, { color: "yellow" }), (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "y");
        });
    });
}

/**
 * Format bytes
 */
function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * MAIN COMMAND ENTRY
 */
export default async function makeLogManager({ command = "log", sub = [], flags = {} }) {
    const subCommand = sub[0] || "help";
    const config = commandConfig?.[command] || {};

    // Resolve logDir (required)
    const logDirValue = getConfigValue(flags, config, "logDir");
    if (!logDirValue) {
        exitWithError("Missing required logDir in config or flags.", "node command log list --logDir=./logs");
    }

    const logDir = path.isAbsolute(logDirValue)
        ? logDirValue
        : path.resolve(process.cwd(), logDirValue);

    const maxLogDays = parseInt(getConfigValue(flags, config, "maxLogDays") || "30", 10);
    const force = !!getConfigValue(flags, config, "force");
    const lines = parseInt(getConfigValue(flags, config, "lines") || "20", 10);

    ensureDir(logDir);

    switch (subCommand) {
        // ======================================================
        // 🧹 CLEAN OLD LOGS
        // ======================================================
        case "clean": {
            const files = fs.readdirSync(logDir);
            const now = new Date();
            const cutoff = new Date(now.setDate(now.getDate() - maxLogDays));

            let deleted = 0,
                kept = 0,
                errors = 0;

            for (const file of files) {
                if (!file.endsWith(".log")) continue;

                const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})\.log$/);
                const fileDate = dateMatch ? new Date(dateMatch[1]) : null;
                const shouldDelete = force || (fileDate && fileDate < cutoff);

                if (shouldDelete) {
                    try {
                        fs.rmSync(path.join(logDir, file));
                        console.log(formatText(`🗑️ Deleted: ${file}`, { color: "gray" }));
                        deleted++;
                    } catch (err) {
                        errors++;
                    }
                } else kept++;
            }

            console.log(formatText(`✅ Cleanup complete — Deleted: ${deleted}, Kept: ${kept}, Errors: ${errors}`, { color: "green" }));
            break;
        }

        // ======================================================
        // 📜 LIST LOG ENTRIES
        // ======================================================
        case "list": {
            const { dateString } = parseDateTime();
            const logFile = path.join(logDir, `${dateString}.log`);

            if (!fs.existsSync(logFile)) {
                exitWithError(`No logs found for today: ${logFile}`, "node command log list --logDir=./logs");
            }

            const content = fs.readFileSync(logFile, "utf-8");
            const allLines = content.split("\n").filter(Boolean);
            const lastLines = allLines.slice(-lines);

            console.log(formatText(`📄 Showing last ${lastLines.length} lines from ${path.basename(logFile)}\n`, { color: "cyan" }));
            console.log("─".repeat(80));
            lastLines.forEach((line) => console.log(line));
            console.log("─".repeat(80));
            console.log(formatText(`📊 Total Entries: ${allLines.length}`, { color: "yellow" }));
            break;
        }

        // ======================================================
        // 📊 STATS OVERVIEW
        // ======================================================
        case "stats": {
            const files = fs.readdirSync(logDir).filter((f) => f.endsWith(".log"));
            if (files.length === 0) {
                console.log(formatText("📂 No log files found.", { color: "yellow" }));
                return;
            }

            let totalSize = 0;
            const details = [];

            for (const file of files) {
                const filePath = path.join(logDir, file);
                const stats = fs.statSync(filePath);
                totalSize += stats.size;
                details.push({ file, size: stats.size, modified: stats.mtime });
            }

            console.log(formatText(`📊 Log Directory: ${logDir}`, { color: "cyan" }));
            console.log(formatText(`🗂️ Total Files: ${files.length}`, { color: "yellow" }));
            console.log(formatText(`💾 Total Size: ${formatBytes(totalSize)}\n`, { color: "yellow" }));

            details
                .sort((a, b) => b.modified - a.modified)
                .forEach((f, i) => {
                    console.log(formatText(`${i + 1}. ${f.file}  (${formatBytes(f.size)})  -  ${f.modified.toLocaleString()}`, { color: "dim" }));
                });
            break;
        }

        // ======================================================
        // ❓ HELP / UNKNOWN
        // ======================================================
        default: {
            console.log(formatText(`
📘 Log Manager Commands

Usage:
  node command log <subcommand> [options]

Subcommands:
  list                Show latest log entries
  clean               Delete old log files
  stats               Show log directory stats

Options:
  --lines=<n>         Number of lines to show (default 20)
  --force             Force delete all logs
  --logDir=<path>     Custom log directory (REQUIRED)
  --maxLogDays=<n>    Retention days (default 30)

Examples:
  node command log list --lines=50
  node command log clean --force
  node command log stats
`, { color: "cyan" }));
        }
    }
}
