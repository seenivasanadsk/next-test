import fs from 'fs/promises';
import path from 'path';
import { loadEnvs } from "../../lib/envConfig.js";

// Read CLI arguments
const args = process.argv.slice(2);
const forceDelete = args.includes("--force");
const isProduction = args.includes("--prod");

// Load environment
loadEnvs({ isProduction });

const logDir = process.env.LOG_DIR;
const MAX_LOG_DAYS = forceDelete ? 0 : parseInt(process.env.MAX_LOG_DAYS) || 30;

async function clearOldLogs() {
    try {
        console.log('🔄 Starting log cleanup...');
        console.log(`📅 Keeping logs from last ${MAX_LOG_DAYS} days`);
        if (forceDelete) console.log('💥 FORCE MODE: Deleting ALL log files');

        const resolvedLogDir = path.isAbsolute(logDir) ? logDir : path.resolve(process.cwd(), logDir);

        // Check if log directory exists
        try {
            await fs.access(resolvedLogDir);
        } catch {
            console.log('📁 Log directory does not exist, nothing to clean.');
            return;
        }

        const files = await fs.readdir(resolvedLogDir);
        const now = new Date();
        const cutoffDate = new Date(now.setDate(now.getDate() - MAX_LOG_DAYS));

        let deletedCount = 0;
        let errorCount = 0;
        let keptCount = 0;

        for (const file of files) {
            if (file.endsWith('.log')) {
                let fileDate = null;

                // Format: YYYY-MM-DD.log
                const yyyyMatch = file.match(/(\d{4}-\d{2}-\d{2})\.log$/);
                if (yyyyMatch) {
                    fileDate = new Date(yyyyMatch[1]);
                }

                // Format: DD-MM-YYYY.log
                const ddmmyyyyMatch = file.match(/(\d{2}-\d{2}-\d{4})\.log$/);
                if (ddmmyyyyMatch && !fileDate) {
                    const [day, month, year] = ddmmyyyyMatch[1].split('-');
                    fileDate = new Date(`${year}-${month}-${day}`);
                }

                // Delete condition: force mode OR file is older than cutoff
                const shouldDelete = forceDelete || (fileDate && fileDate < cutoffDate);

                if (shouldDelete) {
                    try {
                        await fs.unlink(path.join(resolvedLogDir, file));
                        console.log(`✅ Deleted: ${file}`);
                        deletedCount++;
                    } catch (error) {
                        console.log(`❌ Failed to delete: ${file} - ${error.message}`);
                        errorCount++;
                    }
                } else {
                    keptCount++;
                }
            }
        }

        console.log(`\n📊 Cleanup completed:`);
        console.log(`   ✅ Deleted files: ${deletedCount}`);
        console.log(`   📁 Kept files: ${keptCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

        if (!forceDelete) {
            console.log(`   📅 Retention: ${MAX_LOG_DAYS} days`);
        }

    } catch (error) {
        console.error('💥 Cleanup failed:', error.message);
        process.exit(1);
    }
}

// Run cleanup
clearOldLogs();