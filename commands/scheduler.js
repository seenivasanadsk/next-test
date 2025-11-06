import { exec } from 'child_process';
import path from 'path';
import commandConfig from "../config/command.js";

const tasksArray = [
    { file: 'serverStartup.js', schedule: { type: 'MINUTE', interval: 1 } },
    // { file: 'log.js', schedule: { type: 'HOURLY', interval: 2 } },
    // { file: 'serverStart.js', schedule: { type: 'ONSTART' } }, // on startup
    // { file: 'userInit.js', schedule: { type: 'ONLOGON' } },    // on user logon
];

export default async function createScheduledTasks({ command }) {
    const projectRoot = process.cwd();
    const config = commandConfig?.[command] || {};

    if (!config?.prefix || !config?.scriptPath) {
        console.log(`No prefix defined for command "${command}". Cannot create scheduled tasks.`);
        process.exit(1);
    }

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

        let schtasksCommand;
        if (['ONSTART', 'ONLOGON'].includes(scheduleType)) {
            // ONSTART and ONLOGON do not use /MO
            schtasksCommand = `schtasks /Create /SC ${scheduleType} /TN "${taskName}" /TR "node \"${scriptFullPath}\"" /F`;
        } else {
            schtasksCommand = `schtasks /Create /SC ${scheduleType} /MO ${scheduleInterval} /TN "${taskName}" /TR "node \\\"${scriptFullPath}\\\"" /F`;
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
