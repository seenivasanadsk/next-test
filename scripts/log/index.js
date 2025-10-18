import fs from 'fs/promises';
import path from 'path';
import { parseDateTime } from '../../utils/dateTime.js';
import { loadEnvs } from '../../lib/envConfig.js'; // Added missing import

// Read CLI arguments
const args = process.argv.slice(2);
const isProduction = args.includes("--prod");
const linesArg = args.find(arg => arg.startsWith('--lines='));
const lines = linesArg ? parseInt(linesArg.split('=')[1]) : 10;

// Load environment
loadEnvs({ isProduction });

const logDir = process.env.LOG_DIR;

async function showLastLogs(lines = 10) {
    try {
        // Get today's date for the log file name
        const { dateString } = parseDateTime();
        const logFileName = `${dateString}.log`;
        const logFilePath = path.join(logDir, logFileName);

        // Check if log file exists
        try {
            await fs.access(logFilePath);
        } catch {
            console.log(`❌ Log file not found: ${logFileName}`);
            console.log(`📁 Log directory: ${logDir}`);
            return;
        }

        // Read the entire file
        const content = await fs.readFile(logFilePath, 'utf8');
        const allLines = content.split('\n').filter(line => line.trim() !== '');

        // Get the last N lines
        const lastLines = allLines.slice(-lines);

        console.log(`📄 Last ${lastLines.length} lines from: ${logFileName}\n`);
        console.log('─'.repeat(80));

        if (lastLines.length === 0) {
            console.log('No log entries found.');
        } else {
            lastLines.forEach((line, index) => {
                console.log(`${line}`);
            });
        }

        console.log('─'.repeat(80));
        console.log(`📊 Total entries: ${allLines.length}`);

    } catch (error) {
        console.error('❌ Error reading log file:', error.message);
    }
}

// Run the function
showLastLogs(lines);