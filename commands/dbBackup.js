// commands/dbBackup.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import formatText from "./helpers/formatText.js";
import commandConfig from "../config/command.js";
import { getCurrentDateTime } from "../utils/dateTime.js";

/**
 * Construct the backup file name dynamically based on format string.
 * Supported placeholders:
 *   - [APP_NAME]
 *   - [DB_NAME]
 *   - [FORMAT_yyyy-mm-dd-hh-ii-ss-aa]
 */
function constructFileName(format, appName, dbName) {
  const formatMatch = format.match(/\[FORMAT_([^\]]+)\]/);
  const dateFormat = formatMatch ? formatMatch[1] : "yyyy-mm-dd-hh-ii-ss-aa";

  const { formatted: formattedDate } = getCurrentDateTime(dateFormat);

  return format
    .replace("[APP_NAME]", appName)
    .replace("[DB_NAME]", dbName)
    .replace(/\[FORMAT_[^\]]+\]/, formattedDate);
}

/**
 * Display an error message and exit the process.
 */
function exitWithError(message, example = "") {
  console.log(formatText(`❌ ${message}`, { color: "red" }));
  if (example) {
    console.log(formatText(`Example: ${example}`, { color: "yellow" }));
  }
  process.exit(1);
}

/**
 * Confirm action from the user.
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
 * Delete old backups beyond retention period.
 */
function cleanupOldBackups(outputDir, retentionDays) {
  if (!retentionDays) return;
  const now = Date.now();
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
  const entries = fs.readdirSync(outputDir, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(outputDir, entry.name);
    if (entry.isDirectory() || !entry.name.endsWith(".gz")) continue;

    const stats = fs.statSync(filePath);
    const ageMs = now - stats.mtimeMs;
    if (ageMs > retentionMs) {
      fs.rmSync(filePath, { force: true });
      console.log(formatText(`🧹 Deleted old backup: ${entry.name}`, { color: "gray" }));
    }
  }
}

/**
 * List all backup files.
 */
function listBackups(outputDir) {
  if (!fs.existsSync(outputDir)) {
    console.log(formatText("📁 No backup directory found.", { color: "yellow" }));
    return;
  }

  const entries = fs.readdirSync(outputDir).filter((f) => f.endsWith(".gz"));
  if (entries.length === 0) {
    console.log(formatText("📭 No backups found.", { color: "yellow" }));
    return;
  }

  let totalSize = 0;
  console.log(formatText(`📋 Listing all backups in: ${outputDir}\n`, { color: "cyan" }));

  entries.forEach((file, index) => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    totalSize += stats.size;

    console.log(
      formatText(
        `${index + 1}. ${file}  |  ${fileSizeMB} MB  |  Created: ${stats.mtime.toLocaleString()}`,
        { color: "dim" }
      )
    );
  });

  console.log(
    formatText(
      `\n📦 Total Backups: ${entries.length} | Total Size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
      { color: "yellow" }
    )
  );
}

/**
 * Clear all backup files (with confirmation).
 */
async function clearBackups(outputDir, force = false) {
  if (!fs.existsSync(outputDir)) {
    console.log(formatText("📁 Backup directory not found.", { color: "yellow" }));
    return;
  }

  const entries = fs.readdirSync(outputDir).filter((f) => f.endsWith(".gz"));
  if (entries.length === 0) {
    console.log(formatText("📭 No backups to clear.", { color: "yellow" }));
    return;
  }

  if (!force) {
    const confirmed = await confirmAction("⚠️  Are you sure you want to delete ALL backups?");
    if (!confirmed) {
      console.log(formatText("❌ Operation cancelled.", { color: "red" }));
      return;
    }
  }

  for (const file of entries) {
    const filePath = path.join(outputDir, file);
    fs.rmSync(filePath, { force: true });
    console.log(formatText(`🗑️  Deleted: ${file}`, { color: "gray" }));
  }

  console.log(formatText("✅ All backups cleared.", { color: "green" }));
}

/**
 * Main database backup command.
 */
export default async function dbBackup({ command, sub, flags }) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pkgPath = path.resolve(__dirname, "../package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  const projectRoot = process.cwd();
  const config = commandConfig?.[command] || {};

  // Config priority: flags > config > defaults
  const appName = pkg?.name || config?.appNameOrPrefix || "NextApp";
  const dbName = flags?.db || config?.dbName || "";
  const fileFormat =
    config?.fileFormat ||
    "backup-[APP_NAME]-[DB_NAME]-[FORMAT_yyyy-mm-dd-hh-ii-ss-aa]";
  const dbURI = flags?.uri || config?.dbURI || "mongodb://localhost:27017";
  const backupRetentionDays = config?.backupRetentionDays || 7;
  let outputPath = flags?.output || config?.backupPath || "./backups";

  if (outputPath.startsWith("./")) {
    outputPath = path.join(projectRoot, outputPath.slice(2));
  }
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

  // --- Handle sub-commands ---
  if (sub.length > 0 && sub[0] !== "create") {
    switch (sub[0]) {
      case "prune":
        console.log(formatText("🧹 Running prune (retention cleanup)...", { color: "cyan" }));
        cleanupOldBackups(outputPath, backupRetentionDays);
        break;

      case "clear":
        await clearBackups(outputPath, flags?.force || flags?.f);
        break;

      case "list":
        listBackups(outputPath);
        break;

      default:
        console.log(formatText(`❌ Unknown sub-command: ${sub[0]}`, { color: "red" }));
        break;
    }
    process.exit(0);
  }

  // --- Normal backup flow ---
  if (!dbName) {
    exitWithError("Please specify a database name using --db= or in config.");
  }

  const fileName = constructFileName(fileFormat, appName, dbName);
  const fullOutputPath = path.join(outputPath, fileName);

  const dumpParts = [
    "mongodump",
    `--db=${dbName}`,
    `--archive=\"${fullOutputPath}.gz\"`,
    "--gzip",
  ];

  if (dbURI) dumpParts.push(`--uri=\"${dbURI}\"`);

  const dumpCmd = dumpParts.join(" ");

  console.log(formatText(`🗄️  Starting MongoDB backup...`, { color: "cyan" }));
  console.log(formatText(`Database      : ${dbName}`, { color: "yellow" }));
  console.log(formatText(`Output file   : ${fullOutputPath}.gz`, { color: "yellow" }));
  console.log(formatText(`Command       : ${dumpCmd}`, { color: "dim" }));

  try {
    execSync(dumpCmd, { stdio: "inherit" });
    console.log(formatText(`✅ Backup completed successfully!`, { color: "green" }));
    console.log(formatText(`📦 Saved to: ${fullOutputPath}.gz`, { color: "cyan" }));

    cleanupOldBackups(outputPath, backupRetentionDays);
  } catch (err) {
    console.log(formatText(`❌ Backup failed: ${err.message}`, { color: "red" }));
  }
}
