// scripts\server\startup.js
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const SAVE_LOGS = false; // Set true to save logs, false to ignore
const projectPath = path.resolve();
const pidFile = path.join(projectPath, "server.pid");
const logFile = path.join(projectPath, "server.log");

// ================= STEP 0: Parse port from arguments =================
let PORT = 3000; // default port
const portIndex = process.argv.findIndex(arg => arg === "-p" || arg === "--port");
if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const parsedPort = parseInt(process.argv[portIndex + 1], 10);
    if (!isNaN(parsedPort)) PORT = parsedPort;
}

console.log(`Using PORT: ${PORT}`);

// ================= STEP 1: Check if server already running =================
let serverRunning = false;
if (fs.existsSync(pidFile)) {
    const pid = parseInt(fs.readFileSync(pidFile, "utf-8"), 10);
    if (!isNaN(pid)) {
        try {
            process.kill(pid, 0); // 0 signal just checks if process exists
            serverRunning = true;
            console.log(`Server is already running with PID: ${pid}. Skipping startup.`);
        } catch (e) {
            // Process not found, safe to start new server
            serverRunning = false;
            fs.unlinkSync(pidFile); // remove stale PID file
        }
    }
}

if (!serverRunning) {
    // ================= STEP 2: Prepare stdio =================
    let stdioOption;
    if (SAVE_LOGS) {
        const out = fs.openSync(logFile, "w"); // overwrite each time
        const err = fs.openSync(logFile, "w");
        stdioOption = ["ignore", out, err];
    } else {
        stdioOption = "ignore";
    }

    // ================= STEP 3: Start Next.js server =================
    const child = spawn(
        "node",
        ["node_modules/next/dist/bin/next", "start", "-p", PORT],
        {
            cwd: projectPath,
            detached: true,
            stdio: stdioOption,
            windowsHide: true,
        }
    );

    // Save PID
    fs.writeFileSync(pidFile, String(child.pid), "utf-8");

    // Detach parent
    child.unref();

    console.log(`Next.js production server started on port ${PORT} with PID: ${child.pid}`);
    if (SAVE_LOGS) console.log(`Logs redirected to: ${logFile}`);
}
