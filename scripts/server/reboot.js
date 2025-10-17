// scripts/server/reboot.js
import { spawnSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

const projectPath = path.resolve();
const pidFile = path.join(projectPath, "server.pid");
const logFile = path.join(projectPath, "server.log");
const SAVE_LOGS = false;

// ================= STEP 0: Parse port from arguments =================
let PORT = 3000; // default port
const portIndex = process.argv.findIndex(arg => arg === "-p" || arg === "--port");
if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const parsedPort = parseInt(process.argv[portIndex + 1], 10);
    if (!isNaN(parsedPort)) PORT = parsedPort;
}
console.log(`Using PORT: ${PORT}`);

// ================= STEP 1: Stop old server =================
if (fs.existsSync(pidFile)) {
    const pid = parseInt(fs.readFileSync(pidFile, "utf-8"), 10);
    if (!isNaN(pid)) {
        try {
            if (process.platform === "win32") {
                spawnSync("taskkill", ["/PID", pid, "/F", "/T"], { stdio: "ignore" });
            } else {
                process.kill(pid, "SIGKILL");
            }
            console.log(`Stopped previous server with PID: ${pid}`);
        } catch (e) {
            console.log("Failed to stop previous server:", e.message);
        }
    }
    fs.unlinkSync(pidFile);
}

// ================= STEP 2: Build Clean project =================
console.log("Building project...");
spawnSync("npm", ["run", "build:clean"], { cwd: projectPath, stdio: "inherit", shell: true });

// ================= STEP 3: Prepare stdio =================
let stdioOption;
if (SAVE_LOGS) {
    const out = fs.openSync(logFile, "w"); // overwrite logs
    const err = fs.openSync(logFile, "w");
    stdioOption = ["ignore", out, err];
} else {
    stdioOption = "ignore";
}

// ================= STEP 4: Start Next.js server =================
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
child.unref();

console.log(`Next.js production server started on port ${PORT} with PID: ${child.pid}`);
if (SAVE_LOGS) console.log(`Logs redirected to: ${logFile}`);
