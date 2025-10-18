import { getCurrentDateTime } from '../utils/dateTime.js';
import fs from 'fs/promises';
import path from 'path';
import { loadEnvs } from './envConfig.js';

// Detect CLI (running outside Next.js)
const isCLI = !process.env.NEXT_RUNTIME;
if (isCLI) {
    // Check if user passed --prod as a CLI flag
    const isProduction = process.argv.includes("--prod");
    loadEnvs({ isProduction });
}

const logDir = process.env.LOG_DIR;
const MAX_LOG_DAYS = parseInt(process.env.MAX_LOG_DAYS) || 30; // Keep logs for 30 days

// Ensure log directory exists
async function ensureLogDir() {
    const fullPath = path.isAbsolute(logDir) ? logDir : path.resolve(process.cwd(), logDir);
    try {
        await fs.access(fullPath);
    } catch {
        await fs.mkdir(fullPath, { recursive: true });
    }
    return fullPath;
}

// Initialize log directory (run once)
const resolvedLogDir = await ensureLogDir();

async function log(level, message, data = {}) {
    const { timeStamp, dateString } = getCurrentDateTime();
    const formattedLevel = level.toUpperCase().padEnd(5);

    // Console output with colors (synchronous - fast)
    const colors = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m', debug: '\x1b[90m', http: '\x1b[35m' };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[${formattedLevel}]${reset} ${message}`, Object.keys(data).length ? data : '');

    // File output (asynchronous - doesn't block)
    let logLine = `${timeStamp} | [${formattedLevel}] | ${message}`;
    if (Object.keys(data).length > 0) {
        logLine += ` | ${JSON.stringify(data)}`;
    }
    logLine += '\n';

    const filename = path.join(resolvedLogDir, `${dateString}.log`);

    // Fire and forget - don't await to avoid blocking
    fs.appendFile(filename, logLine).catch(error => {
        // Only log file errors to console, don't throw
        console.error('Log write error:', error.message);
    });
}

// Clean old log files for DD-MM-YYYY format
export async function cleanOldLogs() {
    try {
        const files = await fs.readdir(resolvedLogDir);
        const now = new Date();
        const cutoffDate = new Date(now.setDate(now.getDate() - MAX_LOG_DAYS));

        for (const file of files) {
            if (file.endsWith('.log')) {
                // Extract date from filename (format: DD-MM-YYYY.log)
                const dateMatch = file.match(/(\d{2}-\d{2}-\d{4})\.log$/);
                if (dateMatch) {
                    const [day, month, year] = dateMatch[1].split('-');
                    const fileDate = new Date(`${year}-${month}-${day}`);
                    if (fileDate < cutoffDate) {
                        await fs.unlink(path.join(resolvedLogDir, file));
                        console.log(`Cleaned old log file: ${file}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Log cleanup error:', error.message);
    }
}

export default {
    error: (msg, data) => log('error', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    info: (msg, data) => log('info', msg, data),
    debug: (msg, data) => log('debug', msg, data),
    http: (msg, data) => log('http', msg, data)
};