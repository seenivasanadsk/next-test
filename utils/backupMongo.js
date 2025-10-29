// utils/backupMongo.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { getCurrentDateTime } from "./dateTime.js";
import process from "process";
import { loadEnvs } from "../lib/envConfig.js";
import stringCase from "./stringCase.js";

// Detect CLI (running outside Next.js)
const isCLI = !process.env.NEXT_RUNTIME;
if (isCLI) {
    // Check if user passed --prod as a CLI flag
    const isProduction = process.argv.includes("--prod");
    loadEnvs({ isProduction });
}

/**
 * Backup MongoDB to a compressed archive
 */
export async function backupMongo() {
    const appName = process.env.APP_NAME || process.env.npm_package_name || "app";
    const dbName = process.env.MONGODB_DB;
    const uri = process.env.MONGODB_URI;
    const backupPath = process.env.BACKUP_PATH || "backups";
    const env = process.env.NODE_ENV || "development";
    const timezone = process.env.TIMEZONE || "UTC";

    if (!uri || !dbName) throw new Error("MONGODB_URI or MONGODB_DB is not defined");

    // Ensure backup folder exists
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }

    // Generate filename
    const { dateString, timeString } = getCurrentDateTime(timezone);
    const safeTime = timeString.replace(":", "-").replace(" ", "_"); // hh-mm_AM
    const fileName = `mongo-backup-app-${stringCase.kebab(appName)}-db-${dbName}-env-${env}-date-${dateString}-time-${safeTime}.gz`;

    const fullPath = path.join(backupPath, fileName);

    // Construct mongodump command
    const command = `mongodump --uri="${uri}/${dbName}" --archive="${fullPath}" --gzip`;

    console.log("Backing up MongoDB...");
    console.log("Command:", command);

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Error during backup:", stderr);
                return reject(error);
            }
            console.log("✅ Backup completed:", fullPath);
            resolve(fullPath);
        });
    });
}
