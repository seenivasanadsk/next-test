import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { deleteAllTasks } from "../../lib/windowsTasks.js";
import { loadEnvs } from "../../lib/envConfig.js";

// --- Auto Elevate to Admin (CMD only, no PowerShell) ---
try {
    execSync("fsutil dirty query %systemdrive%", { stdio: "ignore" });
} catch {
    console.log("⚙️ Relaunching as Administrator (CMD)...");

    const __filename = fileURLToPath(import.meta.url);
    const args = process.argv.slice(2).join(" ");

    const cmd = `powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c cd /d \\"${process.cwd()}\\" && node \\"${__filename}\\" ${args}'"`;

    execSync(cmd);
    process.exit(0);
}
// --- End Auto Elevation Block ---

// Detect CLI flags
const args = process.argv.slice(2);
const isProduction = args.includes("--prod");

// Load environment
loadEnvs({ isProduction });

// Delete all tasks
await deleteAllTasks();

console.log("✅ All tasks deleted successfully.");
