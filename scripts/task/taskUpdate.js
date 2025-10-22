// scripts/task/taskUpdate.js

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";
import { createOrUpdateTask, syncTasks } from "../../lib/windowsTasks.js";
import { loadEnvs } from "../../lib/envConfig.js";

// --- Auto Elevate to Admin (CMD only, no PowerShell) ---
try {
    // test for admin rights
    execSync("fsutil dirty query %systemdrive%", { stdio: "ignore" });
} catch {
    console.log("⚙️ Relaunching as Administrator (CMD)...");

    const __filename = fileURLToPath(import.meta.url);
    const args = process.argv.slice(2).join(" ");

    // Build command to relaunch elevated in CMD
    const cmd = `powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c cd /d \\"${process.cwd()}\\" && node \\"${__filename}\\" ${args}'"`;

    execSync(cmd);
    process.exit(0);
}
// --- End Auto Elevation Block ---

// Detect CLI flags
const args = process.argv.slice(2);
const isProduction = args.includes("--prod");
const extraArgs = args.join(" ");

// Load environment once
loadEnvs({ isProduction });

async function updateTasks() {
    const commandsPath = path.join(process.cwd(), "commands");
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

    const configs = [];

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        const commandModule = await import(fileUrl);

        const config = {
            ...commandModule.default,
            isProduction,
            extraArgs,
        };

        configs.push(config);
    }

    // 1️⃣ Create/update all tasks
    for (const config of configs) {
        await createOrUpdateTask(config);
    }

    // 2️⃣ Optional delay for Windows to register tasks
    await new Promise(r => setTimeout(r, 2000));

    // 3️⃣ Sync: delete tasks not in configs
    await syncTasks(configs);

    console.log("✅ All tasks synced successfully.");
}

updateTasks();
