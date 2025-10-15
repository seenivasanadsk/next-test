// utils/pruneBackups.js
import fs from "fs";
import path from "path";
import { loadEnvs } from "../lib/envConfig.js";

// Load env dynamically
const isCLI = !process.env.NEXT_RUNTIME;
if (isCLI) {
    const isProduction = process.argv.includes("--prod");
    loadEnvs({ isProduction });
}

const backupDir = process.env.BACKUP_PATH || "backups";
const daysToKeep = parseInt(process.env.RETENTION_DAYS || "7", 10);

export function pruneBackups() {
    if (!fs.existsSync(backupDir)) return;

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".gz"));

    if (!files.length) return;

    const fileInfos = files
        .map(f => {
            const match = f.match(/date-(\d{2}-\d{2}-\d{4})/); // dd-mm-yyyy
            if (!match) return null;
            const [day, month, year] = match[1].split("-");
            const timestamp = new Date(`${year}-${month}-${day}`).getTime();
            return { file: f, timestamp };
        })
        .filter(Boolean);

    // Sort newest first
    fileInfos.sort((a, b) => b.timestamp - a.timestamp);

    const keepFiles = [];
    const pruneFiles = [];

    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;

    for (const info of fileInfos) {
        const ageInDays = (now - info.timestamp) / msInDay;

        // Keep files within retention or latest N files
        if (keepFiles.length < daysToKeep || ageInDays <= daysToKeep) {
            keepFiles.push(info.file);
        } else {
            pruneFiles.push(info.file);
        }
    }

    for (const f of pruneFiles) {
        try {
            fs.unlinkSync(path.join(backupDir, f));
            console.log(`🗑️  Pruned old backup: ${f}`);
        } catch (err) {
            console.error(`❌ Failed to delete ${f}:`, err);
        }
    }

    console.log(`✅ Prune completed. Kept ${keepFiles.length} backup(s).`);
}
