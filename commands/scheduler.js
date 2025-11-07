import { exec } from 'child_process';
import path from 'path';
import commandConfig from "../config/command.js";

const tasksArray = [
    { file: 'serverStartup.js', schedule: { type: 'ONSTART', interval: 1 } },
    { file: 'logClear.js', schedule: { type: 'DAILY', time: "10:00" } },
    { file: 'takeBackup.js', schedule: { type: 'HOURLY', interval: "2" } },
];

export default async function ScheduledTasks({ command, sub, flags }) {
    const projectRoot = process.cwd();
    const config = commandConfig?.[command] || {};

    if (!config?.prefix || !config?.scriptPath) {
        console.log(`No prefix defined for command "${command}". Cannot create scheduled tasks.`);
        process.exit(1);
    }

    switch (sub[0]) {
        case "create":
            createScheduledTasks({ command, projectRoot, config })
            break;
        case "list":
            listScheduledTasks({ command, projectRoot, config })
            break;
        case "delete":
            deleteAllTasks({ command, projectRoot, config })
            break;
        case "remove":
            if (flags?.name) {
                deleteTaskByName({ command, projectRoot, config, taskName: flags.name })
            } else {
                console.log(`Please provide a task name to remove, using --name flag.`);
                process.exit(1);
            }
            break;

        default:
            break;
    }
}


/**
 * List Windows scheduled tasks created by your project prefix.
 * Returns parsed objects with readable Last Result, Last Run Time, Next Run Time, Status, etc.
 */
export function listScheduledTasks({ config }) {
    const listCommand = `schtasks /Query /FO LIST /V`;

    exec(listCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error listing tasks:`, error.message);
            return;
        }
        if (stderr) console.error(`Stderr:`, stderr);

        const tasks = parseTasks(stdout, config?.prefix);
        console.table(tasks, [
            "TaskName",
            "Last Run Time",
            "Next Run Time",
            "Status",
            "Last Result",
            "Schedule Type",
        ]);
    });
}

/**
 * Parses schtasks /Query /FO LIST /V output into structured data
 */
function parseTasks(rawOutput, prefixFilter) {
    const taskBlocks = rawOutput.split(/\n\s*\n/).filter(block => block.includes("TaskName:"));
    const tasks = [];

    for (const block of taskBlocks) {
        const lines = block.split(/\r?\n/).filter(Boolean);
        const task = {};

        for (const line of lines) {
            const [key, ...rest] = line.split(":");
            if (!key || !rest.length) continue;
            task[key.trim()] = rest.join(":").trim();
        }

        if (!prefixFilter || task["TaskName"]?.includes(prefixFilter)) {
            // Convert numeric or hex result code into readable message
            if (task["Last Result"]) {
                task["Last Result"] = decodeTaskResult(task["Last Result"]);
            }
            tasks.push(task);
        }
    }

    return tasks;
}

/**
 * Converts task result (decimal or hex) into human-readable status
 */
function decodeTaskResult(codeRaw) {
    const code = codeRaw.toString().trim().toLowerCase();

    // Convert decimal strings like "267011" to hex (e.g. "0x41303")
    let hexCode = code.startsWith("0x")
        ? code
        : "0x" + parseInt(code, 10).toString(16);

    const map = {
        "0x0": "Success",
        "0x1": "Incorrect function or generic error",
        "0x2": "File not found",
        "0x41300": "Task is ready but not running",
        "0x41301": "Task is running",
        "0x41302": "Task is disabled",
        "0x41303": "Task has not yet run",
        "0x41304": "No more runs scheduled",
        "0x41305": "Task was terminated",
        "0x8004130f": "Invalid task XML",
        "0x8007010b": "File path not found",
        "0xc000013a": "Task was manually stopped",
        "0x8004131f": "Task compatibility issue",
    };

    return map[hexCode] || `${codeRaw} (Unknown code ${hexCode})`;
}


function createScheduledTasks({ command, projectRoot, config }) {

    for (const task of tasksArray) {
        if (!task.file) {
            console.log(`Skipping task: missing filename`);
            continue;
        }

        const scriptFullPath = path.isAbsolute(task.file)
            ? task.file
            : path.join(projectRoot, config.scriptPath, task.file);

        const taskName = `${config.prefix}${path.basename(task.file, path.extname(task.file))}`; // use filename as task name
        const scheduleType = task.schedule?.type?.toUpperCase() || 'DAILY';
        const scheduleInterval = task.schedule?.interval || 1;
        const scheduleTime = task.schedule?.time;

        let schtasksCommand;
        if (['ONSTART', 'ONLOGON'].includes(scheduleType)) {
            // ONSTART and ONLOGON do not use /MO
            schtasksCommand = `schtasks /Create /SC ${scheduleType} /TN "${taskName}" /TR "node \\\"${scriptFullPath}\\\"" /F`;
            console.log(schtasksCommand, projectRoot)
        } else {
            const stOption = scheduleTime ? `/ST ${scheduleTime}` : '';
            const moOption = scheduleInterval ? `/MO ${scheduleInterval}` : '';
            schtasksCommand = `schtasks /Create /SC ${scheduleType} ${stOption} ${moOption} /TN "${taskName}" /TR "node \\\"${scriptFullPath}\\\"" /F`;
        }

        console.log(`Creating scheduled task: ${taskName}`);
        console.log(`CMD command: ${schtasksCommand}`);

        exec(schtasksCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating task "${taskName}":`, error);
                return;
            }
            if (stderr) console.error(`Stderr for task "${taskName}":`, stderr);
            if (stdout) console.log(`Output for task "${taskName}":`, stdout);
        });
    }
}


/**
 * Delete ALL scheduled tasks that match your project prefix
 */
export function deleteAllTasks({ config }) {
    const listCommand = `schtasks /Query /FO LIST /V`;

    exec(listCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error listing tasks:`, error.message);
            return;
        }

        const tasks = parseTasks(stdout, config?.prefix);

        if (!tasks.length) {
            console.log(`⚠️ No tasks found with prefix '${config?.prefix}'`);
            return;
        }

        console.log(`🧹 Deleting ${tasks.length} tasks with prefix '${config?.prefix}'...`);

        tasks.forEach(t => {
            const taskName = t["TaskName"].replace(/^[\\]+/, ""); // remove leading backslash
            const delCmd = `schtasks /Delete /TN "${taskName}" /F`;

            exec(delCmd, (delErr) => {
                if (delErr) console.error(`❌ Failed to delete ${taskName}: ${delErr.message}`);
                else console.log(`✅ Deleted task: ${taskName}`);
            });
        });
    });
}

/**
 * Delete a single task by name (even without prefix)
 * Example: deleteTaskByName("serverStartup", { config })
 */
export function deleteTaskByName({ taskName, config }) {
    const fullName = taskName.startsWith("\\")
        ? taskName
        : `\\${config?.prefix || ""}${taskName}`.replace(/\\\\/g, "\\");

    const delCmd = `schtasks /Delete /TN "${fullName}" /F`;

    exec(delCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error deleting task '${fullName}':`, error.message);
            return;
        }
        if (stderr && !stderr.includes("SUCCESS")) console.error(stderr);
        console.log(`✅ Deleted task: ${fullName}`);
    });
}




/**
 * 🕒 Windows Task Scheduler Schedule Types (/SC) Reference
 *
 * @description
 * Use `schtasks /Create` to schedule commands or scripts in Windows.
 * Syntax:
 *   schtasks /Create /SC <ScheduleType> [/MO <Modifier>] [/ST <HH:MM>] /TN <TaskName> /TR <Command> /F
 *
 * ------------------------------------------------------------
 * 🔹 Schedule Types (/SC) and Their Behavior:
 * ------------------------------------------------------------
 *
 * 1️⃣ MINUTE
 *    - Runs every N minutes
 *    - Uses /MO (modifier): required
 *    - Example: schtasks /Create /SC MINUTE /MO 5 /TN "MyTask" /TR "node script.js" /F
 *
 * 2️⃣ HOURLY
 *    - Runs every N hours
 *    - Uses /MO (modifier): required
 *    - Example: schtasks /Create /SC HOURLY /MO 2 /TN "MyTask" /TR "node script.js" /F
 *
 * 3️⃣ DAILY
 *    - Runs every N days
 *    - Uses /MO (modifier): required
 *    - Supports /ST (start time)
 *    - Example: schtasks /Create /SC DAILY /MO 1 /ST 08:00 /TN "MyTask" /TR "node script.js" /F
 *
 * 4️⃣ WEEKLY
 *    - Runs every N weeks
 *    - Uses /MO (modifier): required
 *    - Supports /ST and /D (specific days, e.g., MON, TUE)
 *    - Example: schtasks /Create /SC WEEKLY /MO 1 /D MON /ST 09:00 /TN "MyTask" /TR "node script.js" /F
 *
 * 5️⃣ MONTHLY
 *    - Runs every N months
 *    - Uses /MO (modifier): required
 *    - Supports /D (specific day number) and /M (month list)
 *    - Example: schtasks /Create /SC MONTHLY /MO 1 /D 1 /ST 08:00 /TN "MyTask" /TR "node script.js" /F
 *
 * 6️⃣ ONCE
 *    - Runs one time at the specified /ST
 *    - /MO not used
 *    - Example: schtasks /Create /SC ONCE /ST 14:00 /TN "MyTask" /TR "node script.js" /F
 *
 * 7️⃣ ONSTART
 *    - Runs when the computer starts
 *    - /MO not used, /ST not applicable
 *    - Example: schtasks /Create /SC ONSTART /TN "MyTask" /TR "node script.js" /F
 *
 * 8️⃣ ONLOGON
 *    - Runs when a user logs on
 *    - /MO not used
 *    - Example: schtasks /Create /SC ONLOGON /TN "MyTask" /TR "node script.js" /F
 *
 * 9️⃣ ONIDLE
 *    - Runs when the system is idle
 *    - /MO not used
 *    - Example: schtasks /Create /SC ONIDLE /TN "MyTask" /TR "node script.js" /F
 *
 * 🔟 ONEVENT
 *    - Runs when a specific event is logged
 *    - /MO not used; requires /EC (event channel) and /TN
 *    - Example:
 *        schtasks /Create /SC ONEVENT /EC Application /TN "MyTask" /TR "node script.js" /F ^
 *        /XML "event.xml"
 *
 * ------------------------------------------------------------
 * ⚠️ Notes:
 * - If you omit `/ST`, default time = 00:00 (midnight)
 * - Missed runs (when PC is off) are skipped unless "Run as soon as possible after a missed start" is enabled
 * - /MO cannot be used with ONSTART, ONLOGON, ONIDLE, ONEVENT
 * - You can use /RU SYSTEM to run with elevated privileges
 *
 * ------------------------------------------------------------
 * 🧩 Example in Node.js:
 * const cmd = `schtasks /Create /SC DAILY /MO 1 /ST 08:00 /TN "DailyNodeTask" /TR "node \\"C:\\\\project\\\\task.js\\"" /F`;
 * exec(cmd);
 */
