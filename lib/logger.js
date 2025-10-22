// lib\logger.js

import { getCurrentDateTime } from '../utils/dateTime.js';
import fs from 'fs/promises';
import path from 'path';
import { loadEnvs } from './envConfig.js';


// Load envs (CLI detection)
const isCLI = !process.env.NEXT_RUNTIME;
if (isCLI) {
    const isProduction = process.argv.includes("--prod");
    loadEnvs({ isProduction });
}

// Project root detection
const projectRoot = process.env.PROJECT_ROOT || path.resolve('./');

const logDir = process.env.LOG_DIR || path.join(projectRoot, 'logs');
const MAX_LOG_DAYS = parseInt(process.env.MAX_LOG_DAYS) || 30;

async function ensureLogDir() {
    try {
        await fs.access(logDir);
    } catch {
        await fs.mkdir(logDir, { recursive: true });
    }
    return logDir;
}

const resolvedLogDir = await ensureLogDir();

async function log(level, message, data = {}) {
    const { timeStamp, dateString } = getCurrentDateTime();
    const formattedLevel = level.toUpperCase().padEnd(5);

    const colors = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m', debug: '\x1b[90m', http: '\x1b[35m' };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[${formattedLevel}]${reset} ${message}`, Object.keys(data).length ? data : '');

    const filename = path.join(resolvedLogDir, `${dateString}.log`);
    let logLine = `${timeStamp} | [${formattedLevel}] | ${message}`;
    if (Object.keys(data).length > 0) logLine += ` | ${JSON.stringify(data)}`;
    logLine += '\n';

    fs.appendFile(filename, logLine).catch(err => console.error('Log write error:', err.message));
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