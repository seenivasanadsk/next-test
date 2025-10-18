// scripts/server/stop.js
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import logger from "../../lib/logger.js";

const projectPath = path.resolve();
const pidFile = path.join(projectPath, "server.pid");
const logFile = path.join(projectPath, "server.log");
const CLEAR_LOGS = true; // set true to delete logs when stopping

if (!fs.existsSync(pidFile)) {
    console.log("No server.pid file found. Server may not be running.");
    process.exit(0);
}

// Read PID from file
const pid = parseInt(fs.readFileSync(pidFile, "utf-8"), 10);
if (isNaN(pid)) {
    console.log("Invalid PID in server.pid file.");
    process.exit(1);
}

try {
    if (process.platform === "win32") {
        // Windows: kill process by PID
        execSync(`taskkill /PID ${pid} /F /T`);
    } else {
        // macOS/Linux: kill process by PID
        process.kill(pid, "SIGKILL");
    }

    // Delete PID file
    fs.unlinkSync(pidFile);

    // Optionally delete logs
    if (CLEAR_LOGS && fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
        console.log("Server log cleared.");
    }

    logger.info(`Server with PID ${pid} stopped successfully.`);
} catch (err) {
    console.error("Failed to stop server:", err.message);
}
