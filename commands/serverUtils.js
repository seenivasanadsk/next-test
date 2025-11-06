// commands/serverUtils.js
import fs from "fs";
import path from "path";
import { spawn, spawnSync, execSync } from "child_process";
import commandConfig from "../config/command.js";
import formatText from "./helpers/formatText.js";

function log(msg, color = "white") {
    console.log(formatText(msg, { color }));
}

// Constants
const projectRoot = process.cwd();
const pidFile = path.join(projectRoot, "server.pid");
const logFile = path.join(projectRoot, "server.log");

// Cross-platform folder delete
function removeDirSafe(targetPath) {
    try {
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
            log(`🧹 Removed: ${targetPath}`, "gray");
        }
    } catch (err) {
        log(`⚠️ Failed to remove ${targetPath}: ${err.message}`, "yellow");
    }
}

// Stop server if running
function stopServerIfRunning(silent = false) {
    if (!fs.existsSync(pidFile)) {
        if (!silent) log("ℹ️ No server.pid file found.", "dim");
        return false;
    }

    const pid = parseInt(fs.readFileSync(pidFile, "utf-8"), 10);
    if (isNaN(pid)) {
        if (!silent) log("⚠️ Invalid PID in server.pid file.", "yellow");
        return false;
    }

    try {
        if (process.platform === "win32") {
            execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });
        } else {
            process.kill(pid, "SIGKILL");
        }
        fs.unlinkSync(pidFile);
        log(`🛑 Server with PID ${pid} stopped successfully.`, "green");

        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
            log("🧹 Cleared server log file.", "dim");
        }
        return true;
    } catch (err) {
        log(`⚠️ Failed to stop server: ${err.message}`, "yellow");
        return false;
    }
}

// Start server in background
function startServer(port = 3000, saveLogs = false) {
    if (fs.existsSync(pidFile)) {
        const pid = parseInt(fs.readFileSync(pidFile, "utf-8"), 10);
        if (!isNaN(pid)) {
            try {
                process.kill(pid, 0);
                log(`⚠️ Server already running (PID: ${pid}).`, "yellow");
                return;
            } catch {
                fs.unlinkSync(pidFile); // stale PID file
            }
        }
    }

    log(`🚀 Starting Next.js server on port ${port}...`, "cyan");

    let stdioOption;
    if (saveLogs) {
        const out = fs.openSync(logFile, "w");
        const err = fs.openSync(logFile, "w");
        stdioOption = ["ignore", out, err];
    } else {
        stdioOption = "ignore";
    }

    const child = spawn(
        "node",
        ["node_modules/next/dist/bin/next", "start", "-p", port],
        {
            cwd: projectRoot,
            detached: true,
            stdio: stdioOption,
            windowsHide: true,
        }
    );

    fs.writeFileSync(pidFile, String(child.pid), "utf-8");
    child.unref();
    log(`✅ Server started on port ${port} (PID: ${child.pid})`, "green");
    if (saveLogs) log(`📜 Logs saved to ${logFile}`, "dim");
}

// Clean and rebuild server
function cleanAndRebuild() {
    log("🧹 Cleaning project directories...", "cyan");
    removeDirSafe(path.join(projectRoot, ".next"));
    removeDirSafe(path.join(projectRoot, "node_modules"));

    log("📦 Reinstalling dependencies...", "cyan");
    spawnSync("npm", ["install"], { cwd: projectRoot, stdio: "inherit", shell: true });

    log("🏗️ Building project...", "cyan");
    spawnSync("npm", ["run", "build"], { cwd: projectRoot, stdio: "inherit", shell: true });

    log("✅ Clean build completed successfully!", "green");
}

/**
 * Entry command
 * Supports:
 *   - server:start [--port=3000]
 *   - server:build
 *   - server:clean
 *   - server:stop
 */
export default async function serverUtils({ command = "server", sub = [], flags = {} }) {
    const config = commandConfig?.[command] || {};
    let subCommand = "start";

    // Detect subcommand
    if (Array.isArray(sub) && sub.length > 0) {
        subCommand = sub[0];
    } else if (command.includes(":")) {
        const parts = command.split(":");
        if (parts[1]) subCommand = parts[1];
    }

    // Merge flags and config (flags take priority)
    const port = parseInt(flags.port || config.port || "3000", 10);
    const saveLogs = flags.saveLogs ?? config.saveLogs ?? false;

    switch (subCommand) {
        case "start":
            startServer(port, saveLogs);
            break;

        case "build":
            log("🏗️ Building Next.js project...", "cyan");
            spawnSync("npm", ["run", "build"], { cwd: projectRoot, stdio: "inherit", shell: true });
            log("✅ Build completed successfully!", "green");
            break;

        case "clean":
            stopServerIfRunning(true);
            cleanAndRebuild();
            break;

        case "stop":
            stopServerIfRunning(false);
            break;

        default:
            log(`❌ Unknown server subcommand: ${subCommand}`, "red");
            log("Available: server:start, server:build, server:clean, server:stop", "yellow");
            process.exit(1);
    }
}
