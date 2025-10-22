// lib/windowsTasks.js
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Get current task prefix from environment
 */
function getTaskPrefix() {
    return process.env.TASK_PREFIX || "NEXT_APP_";
}

/**
 * Get project root path from env or default
 */
function getProjectRoot() {
    return process.env.PROJECT_ROOT || process.cwd();
}

/**
 * Ensure log directory exists and return absolute path
 */
function getLogFile(name) {
    const projectRoot = getProjectRoot();
    const logDir = path.resolve(projectRoot, process.env.LOG_DIR || "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    return path.join(logDir, `${name}.log`);
}

/**
 * Create or update a Windows Task Scheduler task
 */
export async function createOrUpdateTask(config) {
    const {
        name,
        schedule,
        interval = 1,
        script,
        days,
        dayOfMonth,
        time,
        extraArgs = "",
        isProduction = false,
    } = config;

    if (!script) return console.error(`❌ No script/function provided for task ${name}`);

    const TASK_PREFIX = getTaskPrefix();
    const taskNameBase = `${TASK_PREFIX}${name}`;
    const projectRoot = getProjectRoot();
    let scriptPath;

    // Handle function script
    if (typeof script === "function") {
        const tmpDir = path.join(projectRoot, ".tmp_tasks");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const tmpFile = path.join(tmpDir, `${name}.js`);
        const fnCode = script.toString();
        const wrapperCode = `
            (async () => {
                const fn = ${fnCode};
                try { 
                    await fn({ isProduction: ${isProduction}, extraArgs: "${extraArgs}" }); 
                } catch(e){ 
                    console.error(e); 
                    process.exit(1); 
                }
            })();
        `;
        fs.writeFileSync(tmpFile, wrapperCode, "utf-8");
        scriptPath = tmpFile;
    } else if (typeof script === "string") {
        scriptPath = path.resolve(projectRoot, script);
    } else {
        return console.error(`❌ Invalid script for task ${name}`);
    }

    const logEnabled = process.env.TASK_LOG === "true"; // or a config flag in your app
    const logFile = getLogFile(name);

    let tr;
    if (logEnabled) {
        tr = `"cmd.exe /c cd /d \\"${projectRoot}\\" && node \\"${scriptPath}\\" ${extraArgs} >> \\"${logFile}\\" 2>&1"`;
    } else {
        tr = `"cmd.exe /c cd /d \\"${projectRoot}\\" && node \\"${scriptPath}\\" ${extraArgs}"`;
    }

    // Delete existing tasks
    try {
        const { stdout } = await execAsync(`schtasks /query /fo LIST /v`);
        const existing = stdout
            .split("\n")
            .filter(line => line.includes(taskNameBase))
            .map(line => line.split(":")[1]?.trim())
            .filter(Boolean);

        for (const t of existing) {
            await execAsync(`schtasks /delete /tn "${t}" /f`).catch(() => { });
            console.log(`🗑️ Deleted old task: ${t}`);
        }
    } catch (err) {
        console.warn("Warning checking existing tasks:", err.message);
    }

    // Build schedule
    let scheduleCmd = `/sc ${schedule.toUpperCase()}`;

    // Only add /mo for interval-based schedules
    if (["MINUTE", "HOURLY", "DAILY", "WEEKLY", "MONTHLY"].includes(schedule.toUpperCase()) && interval) {
        scheduleCmd += ` /mo ${interval}`;
    }

    if (time && !["MINUTE"].includes(schedule.toUpperCase())) scheduleCmd += ` /st ${time}`;
    if (schedule.toUpperCase() === "WEEKLY" && days?.length) scheduleCmd += ` /d ${days.join(",")}`;
    if (schedule.toUpperCase() === "MONTHLY" && dayOfMonth) scheduleCmd += ` /d ${dayOfMonth}`;

    const createCmd = `schtasks /create /tn "${taskNameBase}" /tr ${tr} ${scheduleCmd} /ru %USERNAME% /f`;

    try {
        await execAsync(createCmd);
        console.log(`✅ Created/Updated task: ${taskNameBase}`);
    } catch (err) {
        console.error(`❌ Failed to create task: ${taskNameBase}`, err.message);
    }
}

/**
 * Sync tasks: delete tasks not in current configs
 */
export async function syncTasks(configs) {
    const TASK_PREFIX = getTaskPrefix();
    const taskNames = configs.map(c => `${TASK_PREFIX}${c.name}`);

    try {
        const { stdout } = await execAsync(`schtasks /query /fo LIST /v`);
        const taskBlocks = stdout.split(/\r?\n(?=HostName:)/).map(b => b.trim()).filter(Boolean);

        const existingTasks = taskBlocks
            .map(block => {
                const lines = block.split(/\r?\n/).map(l => l.trim());
                const taskLine = lines.find(l => l.startsWith("TaskName:"));
                if (!taskLine) return null;
                return taskLine.split(":")[1]?.trim();
            })
            .filter(Boolean)
            .filter(name => name.startsWith(`\\${TASK_PREFIX}`));

        for (const t of existingTasks) {
            const cleanName = t.replace(/^\\/, "");
            if (!taskNames.includes(cleanName)) {
                await execAsync(`schtasks /delete /tn "${t}" /f`).catch(() => { });
                console.log(`🗑️ Deleted removed task: ${t}`);
            }
        }
    } catch (err) {
        console.warn("Warning syncing tasks:", err.message);
    }
}

/**
 * List all tasks created by this system
 */
export async function listTasks() {
    const TASK_PREFIX = getTaskPrefix();

    try {
        const { stdout } = await execAsync(`schtasks /query /fo LIST /v`);
        const taskBlocks = stdout.split(/\r?\n(?=HostName:)/).map(b => b.trim()).filter(Boolean);

        const tasks = taskBlocks.map(block => {
            const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            const task = {};
            let currentKey = null;
            lines.forEach(line => {
                if (!line.includes(":") && currentKey) {
                    task[currentKey] += " " + line;
                    return;
                }
                const [key, ...rest] = line.split(":");
                if (!key || rest.length === 0) return;
                currentKey = key.trim();
                task[currentKey] = rest.join(":").trim();
            });
            return task;
        });

        const filtered = tasks.filter(t => t.TaskName && t.TaskName.startsWith(`\\${TASK_PREFIX}`));
        if (!filtered.length) return console.log("No scheduled tasks found.");

        const TASK_RESULTS = {
            "0": "Success",
            "267011": "Cannot start task (permission/logon issue)",
            "267009": "Cannot start task (environment/script issue)",
            "1": "General error",
            "0x41301": "Task is currently running",
            "0x41300": "Task ready / not yet run",
            "0x41306": "Task is disabled",
            "0xC000013A": "Task manually terminated",
        };

        console.log("Scheduled Tasks:\n");
        filtered.forEach(t => {
            console.log(`Name       : ${t.TaskName}`);
            console.log(`Status     : ${t.Status || "N/A"}`);
            console.log(`Next Run   : ${t["Next Run Time"] || "N/A"}`);
            console.log(`Schedule   : ${t.Schedule || "N/A"}`);
            console.log(`Last Result: ${t["Last Result"]} — ${TASK_RESULTS[t["Last Result"]] || "Unknown"}`);
            console.log("--------------------------------------------------");
        });
    } catch (err) {
        console.error("Failed to list tasks:", err.message);
    }
}

/**
 * Delete all tasks created by this system
 */
export async function deleteAllTasks() {
    const TASK_PREFIX = getTaskPrefix();

    try {
        const { stdout } = await execAsync(`schtasks /query /fo LIST /v`);
        const taskBlocks = stdout.split(/\r?\n(?=HostName:)/).map(b => b.trim()).filter(Boolean);

        const tasksToDelete = taskBlocks
            .map(block => {
                const lines = block.split(/\r?\n/).map(l => l.trim());
                const taskLine = lines.find(l => l.startsWith("TaskName:"));
                if (!taskLine) return null;
                return taskLine.split(":")[1]?.trim();
            })
            .filter(Boolean)
            .filter(name => name.startsWith(`\\${TASK_PREFIX}`));

        if (!tasksToDelete.length) {
            console.log("No tasks to delete.");
            return;
        }

        for (const t of tasksToDelete) {
            await execAsync(`schtasks /delete /tn "${t}" /f`).catch(() => { });
            console.log(`🗑️ Deleted task: ${t}`);
        }

        console.log(`✅ All ${tasksToDelete.length} tasks deleted.`);
    } catch (err) {
        console.error("Failed to delete tasks:", err.message);
    }
}
