// scripts/backup/index.js
import { backupMongo } from "../../utils/backupMongo.js";
import { pruneBackups } from "../../utils/pruneBackups.js";
import { loadEnvs } from "../../lib/envConfig.js";

// Detect CLI arguments
const args = process.argv.slice(2);
const isProduction = args.includes("--prod");

// Load environment before doing anything else
loadEnvs({ isProduction });

async function runBackup() {
    try {
        // 1️⃣ Perform MongoDB backup
        await backupMongo();
        console.log("✅ Backup completed");

        // 2️⃣ Prune old backups according to retention policy
        pruneBackups();
        console.log("✅ Old backups pruned successfully");
    } catch (err) {
        console.error("❌ Backup or pruning failed:", err);
        process.exit(1);
    }
}

runBackup();
