import logger from '../../lib/logger.js';
import { loadEnvs } from '../../lib/envConfig.js';
import fs from 'fs/promises';
import path from 'path';

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
        logger.info('Starting log cleanup...');
        logger.info(`Keeping logs from last ${MAX_LOG_DAYS} days`);
        if (forceDelete) logger.warn('💥 FORCE MODE: Deleting ALL log files');

        const resolvedLogDir = path.isAbsolute(logDir) ? logDir : path.resolve(process.cwd(), logDir);

        // Check if log directory exists
        try {
            await fs.access(resolvedLogDir);
        } catch {
            logger.warn('Log directory does not exist, nothing to clean.');
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
                const yyyyMatch = file.match(/(\d{4}-\d{2}-\d{2})\.log$/);
                if (yyyyMatch) fileDate = new Date(yyyyMatch[1]);

                const ddmmyyyyMatch = file.match(/(\d{2}-\d{2}-\d{4})\.log$/);
                if (ddmmyyyyMatch && !fileDate) {
                    const [day, month, year] = ddmmyyyyMatch[1].split('-');
                    fileDate = new Date(`${year}-${month}-${day}`);
                }

                const shouldDelete = forceDelete || (fileDate && fileDate < cutoffDate);

                if (shouldDelete) {
                    try {
                        await fs.unlink(path.join(resolvedLogDir, file));
                        logger.info(`Deleted: ${file}`);
                        deletedCount++;
                    } catch (error) {
                        logger.error(`Failed to delete: ${file}`, { error: error.message });
                        errorCount++;
                    }
                } else {
                    keptCount++;
                }
            }
        }

        logger.info(`Cleanup completed: Deleted ${deletedCount}, Kept ${keptCount}, Errors ${errorCount}`);
    } catch (error) {
        logger.error('Cleanup failed', { error: error.message });
    }
}

// Run the cleanup
clearOldLogs();
