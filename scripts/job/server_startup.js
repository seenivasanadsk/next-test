// scripts/job/server_startup.js
import { spawn } from "child_process";

// Run "npm run start:back"
const npmProcess = spawn("npm", ["run", "start:back"], { stdio: "inherit", shell: true });

npmProcess.on("close", (code) => {
    console.log(`Process exited with code ${code}`);
});
