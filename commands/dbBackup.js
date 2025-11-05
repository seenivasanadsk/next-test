// commands/dbBackup.js
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import formatText from "./helpers/formatText.js";

export default function dbBackup(command, opts) {
  console.log(command, opts);

  const dbName = opts.db || process.env.MONGO_DB || "";
  if (!dbName) {
    console.log(
      formatText("❌ Please specify a database name using --db=", {
        color: "red",
      })
    );
    console.log(
      formatText("Example: node command backup --db=mydatabase", {
        color: "yellow",
      })
    );
    process.exit(1);
  }

  // default output dir = ./backups/YYYY-MM-DD_HH-MM/
  const timestamp = getTimestamp();
  const defaultOutput = path.join(process.cwd(), "backups", timestamp);

  const outputDir = opts.output ? path.resolve(opts.output) : defaultOutput;
  const fileFormat = opts.fileformat || "bson"; // bson | gz

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const dumpCmdParts = ["mongodump"];
  dumpCmdParts.push(`--db=${dbName}`);
  dumpCmdParts.push(`--out="${outputDir}"`);

  // Add compression if requested
  if (fileFormat === "gz") dumpCmdParts.push("--gzip");

  // Optional URI if env set
  if (process.env.MONGO_URI) {
    dumpCmdParts.push(`--uri="${process.env.MONGO_URI}"`);
  }

  const dumpCmd = dumpCmdParts.join(" ");

  console.log(formatText(`🗄️  Starting MongoDB backup...`, { color: "cyan" }));
  console.log(formatText(`Database      : ${dbName}`, { color: "yellow" }));
  console.log(formatText(`Output folder : ${outputDir}`, { color: "yellow" }));
  console.log(formatText(`Format        : ${fileFormat}`, { color: "yellow" }));

  try {
    execSync(dumpCmd, { stdio: "inherit" });
    console.log(
      formatText(`✅ Backup completed successfully!`, { color: "green" })
    );
    console.log(formatText(`📦 Saved to: ${outputDir}`, { color: "cyan" }));
  } catch (err) {
    console.log(
      formatText(`❌ Backup failed: ${err.message}`, { color: "red" })
    );
  }
}
